'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Car, Phone, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { loginPhoneSchema, loginEmailSchema, verifySMSSchema } from '../../lib/validationSchemas';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, CardContent, Alert } from '../../components/ui';
import { withGuest } from '../../components/withAuth'; // Импортируем HOC

function LoginPage() {
  const [method, setMethod] = useState('phone'); // 'phone' | 'email'
  const [step, setStep] = useState('login'); // 'login' | 'verify'
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  const currentSchema = method === 'phone' ? loginPhoneSchema : loginEmailSchema;

  // Форма входа
  const {
    register: loginForm,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    resolver: zodResolver(currentSchema),
  });

  // Форма верификации SMS (только для входа по телефону)
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

  // Мутация входа
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      if (method === 'phone') {
        // Для телефона нужна верификация SMS
        setPhone(data.data.phone);
        setStep('verify');
      } else {
        // Для email сразу авторизуемся
        login(data.data.user, data.data.token);
        router.push('/');
      }
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

  const onLoginSubmit = (data) => {
    if (method === 'phone') {
      loginMutation.mutate({
        method: 'phone',
        phone: data.phone,
      });
    } else {
      loginMutation.mutate({
        method: 'email',
        email: data.email,
        password: data.password,
      });
    }
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

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setStep('login');
    resetLoginForm();
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
          {step === 'login' ? 'Вход в аккаунт' : 'Подтверждение входа'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Зарегистрироваться
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
            {step === 'login' ? (
              <div className="space-y-6">
                {/* Переключатель методов входа */}
                <div className="flex rounded-lg border border-gray-200 p-1">
                  <button
                    type="button"
                    onClick={() => handleMethodChange('phone')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      method === 'phone'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Телефон
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMethodChange('email')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      method === 'email'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                </div>

                {/* Форма входа */}
                <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
                  {method === 'phone' ? (
                    <Input
                      label="Номер телефона"
                      type="tel"
                      placeholder="+7XXXXXXXXXX"
                      error={loginErrors.phone?.message}
                      {...loginForm('phone')}
                    />
                  ) : (
                    <>
                      <Input
                        label="Email"
                        type="email"
                        placeholder="example@mail.com"
                        error={loginErrors.email?.message}
                        {...loginForm('email')}
                      />
                      <Input
                        label="Пароль"
                        type="password"
                        placeholder="Введите пароль"
                        error={loginErrors.password?.message}
                        {...loginForm('password')}
                      />
                    </>
                  )}

                  {loginMutation.error && (
                    <Alert variant="error">
                      {loginMutation.error.message || 'Произошла ошибка при входе'}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    loading={loginMutation.isPending}
                  >
                    {method === 'phone' ? 'Получить код' : 'Войти'}
                  </Button>
                </form>

                {/* Дополнительные ссылки */}
                {method === 'email' && (
                  <div className="text-center">
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Забыли пароль?
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Форма верификации SMS */
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
                      {verifyMutation.error.message || 'Неверный код подтверждения'}
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
                    Войти
                  </Button>
                </form>

                <div className="text-center space-y-4">
                  <button
                    type="button"
                    onClick={handleResendSMS}
                    disabled={resendMutation.isPending}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    {resendMutation.isPending ? 'Отправляем...' : 'Отправить код еще раз'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="block w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Вернуться к вводу телефона
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

// Экспортируем компонент обернутый в HOC
export default withGuest(LoginPage);