'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, Loader2, Calendar, MapPin, Clock, Users, Car, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';

import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI, bookingAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import RatingModal from '../RatingModal';
import { notify } from '../../lib/notify';

import { LoadingState, ErrorState, ProfileHeader, NotificationBanner } from './ProfileStates';

function PassengerProfileContent() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const { 
    data: bookings, 
    isLoading: bookingsLoading,
    error: bookingsError 
  } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const result = await bookingAPI.getMyBookings();
      return result;
    },
    select: (data) => data.data || [],
    enabled: !!user?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getProfile();
      setProfileData(response.data);
      setProfilePhoto(response.data.avatar ? `http://127.0.0.1:8000${response.data.avatar}` : null);
      reset(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError(null);
      const response = await authAPI.updateProfile(data);
      setProfileData(response.data);
      updateUser(response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }

      const reader = new FileReader();
      reader.onload = (e) => setProfilePhoto(e.target.result);
      reader.readAsDataURL(file);

      const response = await authAPI.updateAvatar(file);
      
      await loadProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Ошибка загрузки фото профиля');
      if (profileData?.avatar) {
        setProfilePhoto(`http://127.0.0.1:8000${profileData.avatar}`);
      } else {
        setProfilePhoto(null);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Не указано';
    const date = new Date(dateTimeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Завтра, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'confirmed': return 'text-green-700 bg-green-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      case 'completed': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтверждено';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return 'Неизвестно';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingAPI.cancelBooking(bookingId);
      notify.success('Бронирование успешно отменено');
      queryClient.invalidateQueries(['my-bookings', user?.id]);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Произошла ошибка при отмене бронирования';
      notify.error(`Ошибка отмены брони: ${errorMessage}`);
    }
  };

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
      {/* Используем переиспользуемый хедер */}
      <ProfileHeader 
        colorScheme="yellow"
        title="Профиль пассажира"
        onBack={() => router.push('/')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Уведомления */}
        {saveSuccess && (
          <NotificationBanner 
            type="success" 
            message="Профиль успешно обновлен!"
            onClose={() => setSaveSuccess(false)}
          />
        )}

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
            
            {/* Форма профиля */}
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <p className="text-white/80 text-sm">Ваши персональные данные</p>
              </div>
              
              <div className="p-6">
                {/* Аватар профиля */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Профиль" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {profileData?.first_name?.[0] || profileData?.username?.[0] || 'П'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-1 -right-1 h-7 w-7 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
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

                {/* Упрощенная форма */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Имя */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Имя *</label>
                    <input
                      placeholder="Введите ваше имя"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.first_name ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}`}
                      {...register('first_name')}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  {/* Фамилия */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Фамилия *</label>
                    <input
                      placeholder="Введите вашу фамилию"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.last_name ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}`}
                      {...register('last_name')}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>

                  {/* Телефон */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Телефон</label>
                    <input
                      type="tel"
                      placeholder="+7XXXXXXXXXX"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.phone ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}`}
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.email ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}`}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                    <p className="text-sm text-gray-500">Для восстановления доступа</p>
                  </div>

                  {/* Кнопка сохранения */}
                  <button
                    type="submit"
                    disabled={!isDirty || saving}
                    className={`w-full h-10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${isDirty ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white shadow-lg' : 'bg-yellow-100 text-yellow-600 cursor-not-allowed'} disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isDirty ? 'Сохранить изменения' : 'Нет изменений'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Мои брони */}
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
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
                        {/* Основная информация о брони */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1">{getStatusText(booking.status)}</span>
                              </span>
                              <span className="text-sm text-gray-500">#{booking.id}</span>
                            </div>

                            {/* Информация о маршруте */}
                            {booking.trip_details && (
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-700">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                  <span className="font-medium">
                                    {booking.trip_details.route?.from_city || 'Неизвестно'} → {booking.trip_details.route?.to_city || 'Неизвестно'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                  <span>{formatDateTime(booking.trip_details.departure_time)}</span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                                  <span>{booking.seats_reserved} {booking.seats_reserved === 1 ? 'место' : booking.seats_reserved < 5 ? 'места' : 'мест'}</span>
                                </div>

                                {booking.trip_details.car && (
                                  <div className="flex items-center text-gray-600">
                                    <Car className="w-4 h-4 mr-2 text-gray-500" />
                                    <span>{booking.trip_details.car.brand} {booking.trip_details.car.model}</span>
                                    {booking.trip_details.car.plate_number && (
                                      <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                        {booking.trip_details.car.plate_number}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Цена */}
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-gray-900">
                              {booking.trip_details ? 
                                (parseFloat(booking.trip_details.price) * booking.seats_reserved).toLocaleString('ru-RU') 
                                : '—'
                              } ₽
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.trip_details ? parseFloat(booking.trip_details.price).toLocaleString('ru-RU') : '—'} ₽ за место
                            </div>
                          </div>
                        </div>

                        {/* Дата создания брони */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            Забронировано: {new Date(booking.created_at).toLocaleDateString('ru-RU', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>

                          {/* Кнопки действий */}
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                              >
                                Отменить
                              </button>
                            )}
                            {booking.status === 'completed' && (
                              <button
                                onClick={() => setSelectedBookingForRating(booking)}
                                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
                              >
                                <Star className="w-3 h-3" />
                                <span>Оценить</span>
                              </button>
                            )}
                            {booking.trip_details && (
                              <button
                                onClick={() => router.push(`/booking/${booking.trip_details.id}?passengers=${booking.seats_reserved}`)}
                                className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
                              >
                                Подробнее
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Боковая панель (упрощена) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Всего броней:</span>
                  <span className="font-medium">{bookings?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Активных:</span>
                  <span className="font-medium text-green-600">
                    {bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Завершённых:</span>
                  <span className="font-medium text-blue-600">
                    {bookings?.filter(b => b.status === 'completed').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Отменённых:</span>
                  <span className="font-medium text-red-600">
                    {bookings?.filter(b => b.status === 'cancelled').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для рейтинга */}
      {selectedBookingForRating && (
        <>
          <RatingModal
            tripId={selectedBookingForRating.trip}
            driverId={selectedBookingForRating.trip_details?.driver_id || selectedBookingForRating.trip_details?.driver}
            trip={selectedBookingForRating.trip_details}
            driver={null}
            userId={user?.id}
            onClose={() => setSelectedBookingForRating(null)}
          />
        </>
      )}
    </>
  );
}

export default PassengerProfileContent;
