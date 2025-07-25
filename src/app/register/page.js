'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Car, ArrowLeft, CheckCircle } from 'lucide-react';

import { registerSchema, verifySMSSchema } from '../../lib/validationSchemas';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';

export default function RegisterPage() {
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  // Форма регистрации
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  // Форма верификации SMS
  const {
    register: verifyForm,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    watch,
    reset: resetVerifyForm,
  } = useForm({
    resolver: zodResolver(verifySMSSchema),
    defaultValues: {
      code: '',
    },
  });

  // Мутация регистрации
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      setPhone(data.data.phone);
      setStep('verify');
    },
  });

  // Мутация верификации
  const verifyMutation = useMutation({
    mutationFn: authAPI.verifySMS,
    onSuccess: (data) => {
      login(data.data.user, data.data.token);
      router.push('/');
    },
  });

  // Мутация повторной отправки SMS
  const resendMutation = useMutation({
    mutationFn: () => authAPI.resendSMS(phone),
  });

  const onRegisterSubmit = (data) => {
    registerMutation.mutate(data);
  };

  const onVerifySubmit = (data) => {
    verifyMutation.mutate({
      phone,
      code: data.code,
    });
  };

  const handleResendSMS = () => {
    resendMutation.mutate();
    resetVerifyForm();
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
          {step === 'register' ? 'Создание аккаунта' : 'Подтверждение телефона'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'register' ? (
            <>
              Уже есть аккаунт?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Войти
              </Link>
            </>
          ) : (
            `Мы отправили код на номер ${phone}`
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="py-8">
            {step === 'register' ? (
              /* Форма регистрации */
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-6">
                <Input
                  label="Имя *"
                  placeholder="Введите ваше имя"
                  error={registerErrors.name?.message}
                  {...registerForm('name')}
                />

                <Input
                  label="Номер телефона *"
                  type="tel"
                  placeholder="+7XXXXXXXXXX"
                  error={registerErrors.phone?.message}
                  helperText="На этот номер придет SMS с кодом подтверждения"
                  {...registerForm('phone')}
                />

                <Input
                  label="Email (необязательно)"
                  type="email"
                  placeholder="example@mail.com"
                  error={registerErrors.email?.message}
                  helperText="Email для восстановления доступа"
                  {...registerForm('email')}
                />

                {registerMutation.error && (
                  <Alert variant="error">
                    {registerMutation.error.response?.data?.message || 
                     'Произошла ошибка при регистрации'}
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={registerMutation.isPending}
                >
                  Продолжить
                </Button>
              </form>
            ) : (
              /* Форма верификации */
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-2 text-sm text-gray-600">
                    Введите 4-значный код из SMS
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit(onVerifySubmit)} className="space-y-6">
                  <Input
                    label="Код подтверждения"
                    placeholder="1234"
                    maxLength="4"
                    className="text-center text-lg tracking-widest"
                    error={verifyErrors.code?.message}
                    {...verifyForm('code')}
                  />

                  {verifyMutation.error && (
                    <Alert variant="error">
                      {verifyMutation.error.response?.data?.message || 
                       'Неверный код подтверждения'}
                    </Alert>
                  )}

                  {resendMutation.isSuccess && (
                    <Alert variant="success">
                      Код отправлен повторно
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    loading={verifyMutation.isPending}
                    disabled={watch('code')?.length !== 4}
                  >
                    Подтвердить
                  </Button>
                </form>

                <div className="text-center space-y-4">
                  <button
                    type="button"
                    onClick={handleResendSMS}
                    disabled={resendMutation.isPending}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    {resendMutation.isPending ? 'Отправляем...' : 'Отправить код повторно'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-500"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Изменить данные
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}