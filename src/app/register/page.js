'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Car, User, Lock, Mail, Phone, UserCheck, UserPlus } from 'lucide-react';
import { registerSchema } from '../../lib/validationSchemas';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { withGuest } from '../../components/withAuth';
import { notify } from '../../lib/notify';
function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      phone: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'passenger',
    },
  });


  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: async (response, variables) => {
      try {
        notify.success('Регистрация прошла успешно! Выполняем вход...');
        
        const loginResponse = await authAPI.login({
          username: variables.username,
          password: variables.password
        });
        
        const { access, refresh, user } = loginResponse.data;
        
        login(user, access, refresh);

        notify.success('Добро пожаловать в Бибика!');
        router.push('/');
        
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        notify.warning('Регистрация успешна! Теперь войдите в систему');
        router.push('/login?message=registration_success');
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.username?.[0] || 
                          error?.response?.data?.phone?.[0] ||
                          error?.response?.data?.email?.[0] ||
                          error?.response?.data?.detail ||
                          'Ошибка при регистрации';
      notify.error(errorMessage);
    }
  });

  const onSubmit = (data) => {
    const cleanData = {
      username: data.username,
      password: data.password,
      role: 'passenger', // Фиксированная роль
      phone: data.phone,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
    };

    registerMutation.mutate(cleanData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-24 w-4 h-4 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-40 w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-white rounded-full animate-ping delay-200"></div>
        <div className="absolute bottom-24 right-16 w-5 h-5 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-8 w-2 h-2 bg-white rounded-full animate-bounce"></div>
      </div>
      
      {/* Декоративные автомобили */}
      <div className="absolute top-8 left-8 text-white/20 animate-bounce">
        <Car className="w-10 h-10" />
      </div>
      <div className="absolute bottom-16 right-12 text-white/20 animate-pulse">
        <Car className="w-14 h-14 rotate-45" />
      </div>
      <div className="absolute top-1/4 right-8 text-white/15 animate-bounce delay-500">
        <Car className="w-6 h-6 -rotate-45" />
      </div>

      {/* Основная карточка */}
      <div className="w-full max-w-lg relative">
        {/* Карточка с стеклянным эффектом */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 relative">
          {/* Внутренний градиент */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Логотип и заголовок */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white/30 backdrop-blur-sm rounded-full p-4 shadow-lg">
                  <UserPlus className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Присоединяйтесь</h1>
              <p className="text-white/80 text-lg">Создайте свой аккаунт</p>
            </div>

            {/* Ошибки */}
            {registerMutation.error && (
              <Alert variant="error" className="mb-6 bg-red-500/20 border-red-300/50 text-white">
                <div className="font-medium">Ошибка регистрации</div>
                <div className="text-sm opacity-90">
                  {registerMutation.error?.response?.data?.detail ||
                   registerMutation.error?.response?.data?.username?.[0] ||
                   registerMutation.error?.response?.data?.email?.[0] ||
                   registerMutation.error?.response?.data?.phone?.[0] ||
                   'Проверьте введенные данные'}
                </div>
              </Alert>
            )}

            {/* Форма */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Имя пользователя */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="Имя пользователя *"
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

              {/* Пароль */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="password"
                    placeholder="Пароль *"
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

              {/* Телефон */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Телефон *"
                    className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-white/90 text-sm bg-red-500/20 px-3 py-1 rounded-lg">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Двухколоночная сетка для имени и фамилии */}
              <div className="grid grid-cols-2 gap-3">
                {/* Имя */}
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      type="text"
                      placeholder="Имя"
                      className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200"
                      {...register('first_name')}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="text-white/90 text-xs bg-red-500/20 px-2 py-1 rounded">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                {/* Фамилия */}
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      type="text"
                      placeholder="Фамилия"
                      className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200"
                      {...register('last_name')}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="text-white/90 text-xs bg-red-500/20 px-2 py-1 rounded">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email (для восстановления)"
                    className="w-full pl-10 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-white/90 text-sm bg-red-500/20 px-3 py-1 rounded-lg">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Кнопка регистрации */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-center space-x-2">
                  {registerMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Создаем аккаунт...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Зарегистрироваться</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Ссылка на логин */}
            <div className="mt-8 text-center">
              <p className="text-white/80 mb-4">Уже есть аккаунт?</p>
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-xl border border-white/30 transition-all duration-200 hover:scale-105"
              >
                <User className="w-4 h-4" />
                <span>Войти в аккаунт</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withGuest(RegisterPage);
