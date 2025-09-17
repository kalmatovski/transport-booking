'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Loader2, XCircle } from 'lucide-react';

import { authAPI, bookingAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import RatingModal from '../RatingModal';

import { LoadingState, ErrorState, ProfileHeader, NotificationBanner } from './ProfileStates';
import { ProfileAvatar, ProfileForm, ProfileStats } from './ProfileComponents';
import { BookingCard } from './BookingCard';

import useTgRouter from '@/lib/useTgRouter';

function PassengerProfileContent() {
  const router = useTgRouter();
  const { user } = useAuthStore();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [error, setError] = useState(null);
  const [ratedTrips, setRatedTrips] = useState(new Set());

  const { 
    data: bookings, 
    isLoading: bookingsLoading,
    error: bookingsError 
  } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: () => bookingAPI.getMyBookings(),
    select: (data) => data.data || [],
    enabled: !!user?.id,
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getProfile();
      setProfileData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProfileUpdate = (updatedData) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
  };

  const handleRatingSuccess = (tripId) => {
    setRatedTrips(prev => new Set([...prev, tripId]));
    setSelectedBookingForRating(null);
  };

  // Загружаем профиль при монтировании
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <LoadingState colorScheme="yellow" message="Загружаем профиль..." />;
  }

  if (error && !profileData) {
    return (
      <ErrorState 
        colorScheme="yellow"
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
        colorScheme="yellow"
        title="Профиль пассажира"
        onBack={() => router.push('/')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <NotificationBanner 
            type="error" 
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Профиль */}
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <p className="text-white/80 text-sm">Ваши персональные данные</p>
              </div>
              
              <div className="p-6">
                {/* Аватар и основная информация */}
                <div className="flex items-center space-x-6 mb-6">
                  <ProfileAvatar 
                    profileData={profileData}
                    colorScheme="yellow"
                    onUpdate={loadProfile}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profileData?.first_name && profileData?.last_name 
                        ? `${profileData.first_name} ${profileData.last_name}`
                        : profileData?.username || 'Имя не указано'
                      }
                    </h3>
                    <p className="text-sm text-gray-600">{profileData?.phone || 'Телефон не указан'}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Пассажир
                    </span>
                  </div>
                </div>

                {/* Форма */}
                <ProfileForm
                  profileData={profileData}
                  colorScheme="yellow"
                  onUpdate={handleProfileUpdate}
                />
              </div>
            </div>

            {/* Брони */}
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-100 border-b border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Мои брони
                </h3>
              </div>
              <div className="p-6">
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto text-yellow-600 animate-spin mb-4" />
                    <p className="text-gray-600">Загружаем брони...</p>
                  </div>
                ) : bookingsError ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <p className="text-red-600">Ошибка загрузки броней</p>
                    <p className="text-gray-500 text-sm mt-1">{bookingsError.message}</p>
                  </div>
                ) : !bookings || bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">У вас пока нет броней</p>
                    <button 
                      onClick={() => router.push('/')}
                      className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Найти поездку
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        userId={user?.id}
                        ratedTrips={ratedTrips}
                        onRate={setSelectedBookingForRating}
                        onRatingSuccess={handleRatingSuccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
              <ProfileStats bookings={bookings} />
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно рейтинга */}
      {selectedBookingForRating && (
        <RatingModal
          tripId={selectedBookingForRating.trip}
          driverId={selectedBookingForRating.trip_details?.driver_id || selectedBookingForRating.trip_details?.driver}
          trip={selectedBookingForRating.trip_details}
          driver={null}
          userId={user?.id}
          onClose={() => setSelectedBookingForRating(null)}
          onRatingSuccess={() => handleRatingSuccess(selectedBookingForRating.trip)}
        />
      )}
    </>
  );
}

export default PassengerProfileContent;
