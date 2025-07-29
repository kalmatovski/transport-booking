'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/ui';
import DriverProfileContent from '../../components/profile/DriverProfileContent';
import PassengerProfileContent from '../../components/profile/PassengerProfileContent';

function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isDriver, isPassenger, isHydrated } = useAuthStore();

  // Проверяем авторизацию ТОЛЬКО после гидратации
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Показываем загрузку пока не произошла гидратация или нет данных пользователя
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Показываем загрузку пока не получили роль пользователя
  if (!user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Условный рендеринг в зависимости от роли */}
      {isDriver() ? (
        <DriverProfileContent />
      ) : isPassenger() ? (
        <PassengerProfileContent />
      ) : (
        // Fallback для неизвестной роли
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Неизвестная роль пользователя
            </h2>
            <p className="text-gray-600">
              Роль: {user?.role || 'не определена'}
            </p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              На главную
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;