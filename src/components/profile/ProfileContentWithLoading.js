'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { LoadingSpinner } from '../ui';
import DriverProfileContent from './DriverProfileContent';
import PassengerProfileContent from './PassengerProfileContent';

function ProfileContentWithLoading() {
  const { updateUser } = useAuthStore();
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
    select: (data) => data.data,
    onSuccess: (data) => {
      updateUser(data); 
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mb-4" />
          <p className="text-gray-700">Загружаем профиль...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ошибка загрузки профиля
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.response?.data?.detail || error.message || 'Неизвестная ошибка'}
          </p>
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Обновить
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = profile?.role;
  
  if (userRole === 'driver') {
    return <DriverProfileContent />;
  } else if (userRole === 'passenger') {
    return <PassengerProfileContent />;
  } else {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Неизвестная роль пользователя
          </h2>
          <p className="text-gray-600">
            Роль: {userRole || 'не определена'}
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }
}

export default ProfileContentWithLoading;
