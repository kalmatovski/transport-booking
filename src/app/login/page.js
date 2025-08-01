'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Car, User, Lock } from 'lucide-react';

import { loginSchema } from '../../lib/validationSchemas';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { withGuest } from '../../components/withAuth';

function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  // Форма входа
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Мутация входа - УПРОЩЕНО
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (response) => {
      // Django JWT возвращает access и refresh токены + роль
      const { access, refresh, user } = response.data;
      
      // Сохраняем токены и роль
      login(user, access, refresh);
      
      // НЕ ДЕЛАЕМ дополнительный запрос профиля здесь!
      // Профиль загрузится на нужной странице автоматически
      
      // Перенаправляем на главную
      router.push('/');
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Логотип */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TransportBook</span>
          </div>
        </div>

        {/* Заголовок */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Вход в аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Поле username */}
              <Input
                label="Имя пользователя"
                placeholder="Введите имя пользователя"
                icon={User}
                error={errors.username?.message}
                {...register('username')}
              />

              {/* Поле password */}
              <Input
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                icon={Lock}
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Ошибка входа */}
              {loginMutation.error && (
                <Alert variant="error">
                  {loginMutation.error.response?.data?.detail || 
                   loginMutation.error.message || 
                   'Неверное имя пользователя или пароль'}
                </Alert>
              )}

              {/* Кнопка входа */}
              <Button
                type="submit"
                className="w-full"
                loading={loginMutation.isPending}
              >
                Войти
              </Button>
            </form>

            {/* Дополнительные ссылки */}
            <div className="mt-6 text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Забыли пароль?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withGuest(LoginPage);