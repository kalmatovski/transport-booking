'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Loader2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

import { authAPI, bookingAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import RatingModal from '../RatingModal';

import { LoadingState, ErrorState, ProfileHeader, NotificationBanner } from './ProfileStates';
import { ProfileAvatar, ProfileForm, ProfileStats } from './ProfileComponents';
import { BookingCard } from './BookingCard';

function PassengerProfileContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [error, setError] = useState(null);
  const [ratedTrips, setRatedTrips] = useState(new Set());
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Вычисляем пагинацию
  const paginatedData = useMemo(() => {
    if (!bookings || bookings.length === 0) return { items: [], totalPages: 0 };
    
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = bookings.slice(startIndex, endIndex);
    
    return { items, totalPages };
  }, [bookings, currentPage, itemsPerPage]);

  // Сброс на первую страницу при изменении данных
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const maxPage = Math.ceil(bookings.length / itemsPerPage);
      if (currentPage > maxPage) {
        setCurrentPage(1);
      }
    }
  }, [bookings, currentPage, itemsPerPage]);

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

  // Функции пагинации
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, paginatedData.totalPages)));
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
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
            <div className="w-full bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-3 sm:px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                <h2 className="text-lg sm:text-xl font-semibold">Личная информация</h2>
                <p className="text-white/80 text-sm">Ваши персональные данные</p>
              </div>
              
              <div className="p-3 sm:p-6">
                {/* Аватар и основная информация */}
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 mb-6">
                  <ProfileAvatar 
                    profileData={profileData}
                    colorScheme="yellow"
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
            <div className="w-full bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-3 sm:px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-100 border-b border-yellow-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Мои брони
                  </h3>
                  {bookings && bookings.length > 0 && (
                    <span className="text-sm text-yellow-700">
                      Всего: {bookings.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 sm:p-6">
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto text-yellow-600 animate-spin mb-4" />
                    <p className="text-gray-600">Загружаем брони...</p>
                  </div>
                ) : bookingsError ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <p className="text-red-600">Ошибка загрузки броней</p>
                    <p className="text-gray-500 text-sm mt-1 break-words">{bookingsError.message}</p>
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
                  <>
                    <div className="space-y-4">
                      {paginatedData.items.map((booking) => (
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

                    {/* Пагинация */}
                    {paginatedData.totalPages > 1 && (
                      <div className="mt-6">
                        {/* Информация для мобильных */}
                        <div className="sm:hidden text-center text-sm text-gray-600 mb-4">
                          Страница {currentPage} из {paginatedData.totalPages}
                        </div>
                        
                        {/* Информация для десктопа */}
                        <div className="hidden sm:flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-600">
                            Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, bookings.length)} из {bookings.length} броней
                          </div>
                        </div>
                        
                        {/* Кнопки навигации */}
                        <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
                          <button
                            onClick={goToPreviousPage}
                            disabled={currentPage <= 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Назад</span>
                          </button>
                          
                          {/* Номера страниц только для десктопа */}
                          <div className="hidden sm:flex items-center space-x-1">
                            {Array.from({ length: Math.min(paginatedData.totalPages, 7) }, (_, i) => {
                              let page;
                              if (paginatedData.totalPages <= 7) {
                                page = i + 1;
                              } else {
                                if (currentPage <= 4) {
                                  page = i + 1;
                                } else if (currentPage >= paginatedData.totalPages - 3) {
                                  page = paginatedData.totalPages - 6 + i;
                                } else {
                                  page = currentPage - 3 + i;
                                }
                              }
                              
                              return (
                                <button
                                  key={page}
                                  onClick={() => goToPage(page)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    currentPage === page
                                      ? 'bg-yellow-600 text-white'
                                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          </div>
                          
                          {/* Индикатор текущей страницы для мобильных */}
                          <div className="sm:hidden text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                            {currentPage} / {paginatedData.totalPages}
                          </div>
                          
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage >= paginatedData.totalPages}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                          >
                            <span className="hidden sm:inline">Вперед</span>
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="w-full space-y-6">
            <div className="w-full bg-white rounded-xl border border-yellow-200 shadow-lg p-3 sm:p-6 overflow-hidden">
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
