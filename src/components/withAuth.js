'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useTgRouter from '@/lib/useTgRouter';

import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from './ui';
import { useIsHydrated } from '../hooks/useIsHydrated';

export const withAuth = (WrappedComponent) => {
  const AuthWrapper = (props) => {
    const { isAuthenticated } = useAuthStore();
    const router = useTgRouter();
    const isHydrated = useIsHydrated();

    useEffect(() => {
      if (isHydrated && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isHydrated, router]);

    if (!isHydrated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthWrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthWrapper;
};

export const withGuest = (WrappedComponent) => {
  const GuestWrapper = (props) => {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const isHydrated = useIsHydrated();

    useEffect(() => {
      if (isHydrated && isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated, isHydrated, router]);

    if (!isHydrated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  GuestWrapper.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GuestWrapper;
};
