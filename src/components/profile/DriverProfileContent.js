'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Loader2 } from 'lucide-react';
import { DriverRating } from '../DriverRating';

import { authAPI, vehiclesAPI, ridesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

import { LoadingState, ErrorState, ProfileHeader, NotificationBanner } from './ProfileStates';
import { ProfileAvatar, ProfileForm, DriverStats } from './ProfileComponents';
import { VehicleManager } from './VehicleManager';

function DriverProfileContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [profileData, setProfileData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [tripsCount, setTripsCount] = useState(0);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileResponse = await authAPI.getProfile();
      setProfileData(profileResponse.data);
      
      // Загружаем автомобили
      try {
        const vehiclesResponse = await vehiclesAPI.getMyVehicles();
        const myVehicles = vehiclesResponse.data;
        const myVehicle = myVehicles && myVehicles.length > 0 ? myVehicles[0] : null;
        setVehicleData(myVehicle);
      } catch (vehicleError) {
        // Игнорируем ошибки загрузки автомобиля
      }

      // Загружаем количество поездок
      try {
        setTripsLoading(true);
        const tripsResponse = await ridesAPI.getMyTrips();
        setTripsCount(tripsResponse.data?.length || 0);
      } catch (tripsError) {
        // Если ошибка загрузки поездок, ставим 0
        setTripsCount(0);
      } finally {
        setTripsLoading(false);
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  const handleVehicleUpdate = (vehicleInfo) => {
    setVehicleData(vehicleInfo);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <LoadingState colorScheme="green" message="Загружаем профиль водителя..." />;
  }

  if (error && !profileData) {
    return (
      <ErrorState 
        colorScheme="green"
        title="Ошибка загрузки профиля"
        error={error}
        onRetry={loadProfile}
        onGoHome={() => router.push('/')}
      />
    );
  }

  return (
    <>
      <ProfileHeader 
        colorScheme="green"
        title="Профиль водителя"
        onBack={() => router.push('/')}
      />

      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 overflow-hidden">
        {error && (
          <NotificationBanner 
            type="error" 
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Профиль */}
            <div className="w-full bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-3 sm:px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                <h2 className="text-lg sm:text-xl font-semibold">Личная информация</h2>
                <p className="text-white/80 text-sm">Ваши персональные данные</p>
              </div>
              
              <div className="p-3 sm:p-6">
                {/* Аватар и основная информация */}
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 mb-6">
                  <ProfileAvatar 
                    profileData={profileData}
                    colorScheme="green"
                    onUpdate={loadProfile}
                  />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900 break-words">
                      {profileData?.first_name && profileData?.last_name 
                        ? `${profileData.first_name} ${profileData.last_name}`
                        : profileData?.username || 'Имя не указано'
                      }
                    </h3>
                    <p className="text-sm text-gray-600 break-all">{profileData?.phone || 'Телефон не указан'}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Водитель
                    </span>
                  </div>
                </div>

                {/* Форма */}
                <ProfileForm
                  profileData={profileData}
                  colorScheme="green"
                  onUpdate={handleProfileUpdate}
                />
              </div>
            </div>

            {/* Автомобиль */}
            <VehicleManager
              vehicleData={vehicleData}
              onUpdate={handleVehicleUpdate}
            />
          </div>

          {/* Статистика */}
          <div className="w-full space-y-6">
            <div className="w-full bg-white rounded-xl border border-green-200 shadow-lg p-3 sm:p-6 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Статистика
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Поездок:</span>
                  {tripsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <span className="font-medium">{tripsCount}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Рейтинг:</span>
                  <DriverRating driverId={profileData?.id} showLabel={false} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className="font-medium text-green-600">Активен</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-white rounded-xl border border-green-200 shadow-lg p-3 sm:p-6 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Мои маршруты
              </h3>
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">Маршруты назначает администратор</p>
                <p className="text-gray-500 text-xs mt-1">Обратитесь к админу для добавления маршрутов</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DriverProfileContent;
