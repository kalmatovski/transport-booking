'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Car, User, Lock, Mail, Phone, UserCheck } from 'lucide-react';

import { registerSchema } from '../../lib/validationSchemas';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { withGuest } from '../../components/withAuth';

function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  // Форма регистрации
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'passenger', // По умолчанию пассажир
      phone: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  });

  // Следим за выбранной ролью
  const selectedRole = watch('role');

  

  // Мутация регистрации
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: async (response, variables) => {
      // После успешной регистрации сразу пытаемся войти
      try {
        const loginResponse = await authAPI.login({
          username: variables.username,
          password: variables.password
        });
        
        const { access, refresh } = loginResponse.data;
        
        // Сохраняем токены и данные пользователя
        login(response.data, access, refresh);
        
        // Перенаправляем на главную
        router.push('/');
        
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        // Если автоматический вход не удался, перенаправляем на логин
        router.push('/login?message=registration_success');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
    }
  });

  const onSubmit = (data) => {
    // Убираем пустые поля
    const cleanData = {
      username: data.username,
      password: data.password,
      role: data.role,
      phone: data.phone,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
    };

    registerMutation.mutate(cleanData);
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
          Создание аккаунта
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Войти
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Имя пользователя */}
              <Input
                label="Имя пользователя *"
                placeholder="username123"
                icon={User}
                error={errors.username?.message}
                helperText="Будет использоваться для входа в систему"
                {...register('username')}
              />

              {/* Пароль */}
              <Input
                label="Пароль *"
                type="password"
                placeholder="Введите пароль"
                icon={Lock}
                error={errors.password?.message}
                helperText="Минимум 6 символов"
                {...register('password')}
              />

              {/* Тип пользователя */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Тип пользователя *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="radio"
                      id="passenger"
                      value="passenger"
                      className="sr-only"
                      {...register('role')}
                    />
                    <label
                      htmlFor="passenger"
                      className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRole === 'passenger'
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <User className={`w-6 h-6 mx-auto mb-2 ${
                          selectedRole === 'passenger' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          selectedRole === 'passenger' ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          Пассажир
                        </span>
                      </div>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="driver"
                      value="driver"
                      className="sr-only"
                      {...register('role')}
                    />
                    <label
                      htmlFor="driver"
                      className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRole === 'driver'
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <Car className={`w-6 h-6 mx-auto mb-2 ${
                          selectedRole === 'driver' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          selectedRole === 'driver' ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          Водитель
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Номер телефона */}
              <Input
                label="Номер телефона *"
                type="tel"
                placeholder="+7XXXXXXXXXX"
                icon={Phone}
                error={errors.phone?.message}
                helperText="Для связи с водителем/пассажирами"
                {...register('phone')}
              />

              {/* Имя */}
              <Input
                label="Имя"
                placeholder="Иван"
                icon={UserCheck}
                error={errors.first_name?.message}
                {...register('first_name')}
              />

              {/* Фамилия */}
              <Input
                label="Фамилия"
                placeholder="Иванов"
                icon={UserCheck}
                error={errors.last_name?.message}
                {...register('last_name')}
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                placeholder="example@mail.com"
                icon={Mail}
                error={errors.email?.message}
                helperText="Для восстановления доступа"
                {...register('email')}
              />

              {/* Ошибка регистрации */}
              {registerMutation.error && (
                <Alert variant="error">
                  {registerMutation.error.response?.data?.detail ||
                   registerMutation.error.response?.data?.username?.[0] ||
                   registerMutation.error.response?.data?.email?.[0] ||
                   registerMutation.error.response?.data?.phone?.[0] ||
                   registerMutation.error.message || 
                   'Произошла ошибка при регистрации'}
                </Alert>
              )}

              {/* Кнопка регистрации */}
              <Button
                type="submit"
                className="w-full"
                loading={registerMutation.isPending}
              >
                Создать аккаунт
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withGuest(RegisterPage);