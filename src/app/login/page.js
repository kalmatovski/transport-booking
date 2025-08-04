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
    <div className="min-h-screen bg-gradient-to-br from-yellow-800 via-amber-500 to-orange-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-4 h-4 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-white rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-white rounded-full animate-pulse delay-300"></div>
      </div>
      
      {/* Декоративные автомобили */}
      <div className="absolute top-10 left-10 text-white/20 animate-bounce">
        <Car className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 right-16 text-white/20 animate-pulse">
        <Car className="w-16 h-16 rotate-12" />
      </div>
      <div className="absolute top-1/3 right-10 text-white/10 animate-bounce delay-300">
        <Car className="w-8 h-8 -rotate-12" />
      </div>

      {/* Основная карточка */}
      <div className="w-full max-w-md relative">
        {/* Карточка с стеклянным эффектом */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 relative">
          {/* Внутренний градиент */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Логотип и заголовок */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white/30 backdrop-blur-sm rounded-full p-4 shadow-lg">
                  <Car className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать</h1>
              <p className="text-white/80 text-lg">Войдите в TransportBook</p>
            </div>

            {/* Ошибки */}
            {loginMutation.error && (
              <Alert variant="error" className="mb-6 bg-red-500/20 border-red-300/50 text-white">
                <div className="font-medium">Ошибка входа</div>
                <div className="text-sm opacity-90">
                  {loginMutation.error?.response?.data?.detail || 
                   loginMutation.error?.response?.data?.non_field_errors?.[0] || 
                   'Неверные данные для входа'}
                </div>
              </Alert>
            )}

            {/* Форма */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Поле username */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="Имя пользователя"
                    className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200"
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-white/90 text-sm bg-red-500/20 px-3 py-1 rounded-lg">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Поле пароля */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="password"
                    placeholder="Пароль"
                    className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-white/90 text-sm bg-red-500/20 px-3 py-1 rounded-lg">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Кнопка входа */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-center space-x-2">
                  {loginMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Входим...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Войти</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Ссылка на регистрацию */}
            <div className="mt-8 text-center">
              <p className="text-white/80 mb-4">Нет аккаунта?</p>
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-xl border border-white/30 transition-all duration-200 hover:scale-105"
              >
                <Car className="w-4 h-4" />
                <span>Начать путешествие</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withGuest(LoginPage);