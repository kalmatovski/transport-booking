'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from './ui';

// HOC для защищенных страниц
export const withAuth = (WrappedComponent) => {
  const AuthWrapper = (props) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    // Показываем загрузку пока проверяем авторизацию
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // Если не авторизован, показываем пустую страницу (идет редирект)
    if (!isAuthenticated) {
      return null;
    }

    // Если авторизован, показываем компонент
    return <WrappedComponent {...props} />;
  };

  AuthWrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthWrapper;
};

// HOC для страниц только для гостей (login, register)
export const withGuest = (WrappedComponent) => {
  const GuestWrapper = (props) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated, isLoading, router]);

    // Показываем загрузку пока проверяем авторизацию
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // Если авторизован, показываем пустую страницу (идет редирект)
    if (isAuthenticated) {
      return null;
    }

    // Если не авторизован, показываем компонент
    return <WrappedComponent {...props} />;
  };

  GuestWrapper.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GuestWrapper;
};