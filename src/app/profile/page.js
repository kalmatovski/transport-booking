'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useIsHydrated } from '../../hooks/useIsHydrated';
import { LoadingSpinner } from '../../components/ui';
import DriverProfileContent from '../../components/profile/DriverProfileContent';
import PassengerProfileContent from '../../components/profile/PassengerProfileContent';
import ProfileContentWithLoading from '../../components/profile/ProfileContentWithLoading';

function ProfilePage() {
  const router = useRouter();
  const isHydrated = useIsHydrated(); // Используем наш хук вместо zustand
  const { user, isAuthenticated, isDriver, isPassenger } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return null; // Возвращаем null для сервера
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Умная логика отображения */}
      {user?.role === 'driver' ? (
        <DriverProfileContent />
      ) : user?.role === 'passenger' ? (
        <PassengerProfileContent />
      ) : (
        <ProfileContentWithLoading />
      )}
    </div>
  );
}

export default ProfilePage;
