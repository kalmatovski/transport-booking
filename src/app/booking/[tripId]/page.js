'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Phone, 
  Star, 
  ArrowLeft,
  CreditCard,
  CheckCircle
} from 'lucide-react';

import { useAuthStore } from '../../../store/authStore';
import { ridesAPI, bookingAPI } from '../../../lib/api';
import { queryKeys } from '../../../lib/queryConfig';
import { Button, Card, CardContent, Alert, LoadingSpinner } from '../../../components/ui';
import { withAuth } from '../../../components/withAuth';
import { DriverInfo } from '../../../components/DriverInfo';
import { DriverRating } from '../../../components/DriverRating';
import { notify } from '../../../lib/notify';
import { formatDateTime as formatDateTimeUtil } from '../../../lib/datetime';

function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const tripId = params.tripId;
  const defaultPassengers = parseInt(searchParams.get('passengers')) || 1;
  
  const [seatsToBook, setSeatsToBook] = useState(defaultPassengers);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showExistingBookingAlert, setShowExistingBookingAlert] = useState(false);

  // Загружаем данные о поездке
  const { 
    data: trip, 
    isLoading: tripLoading,
    error: tripError 
  } = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: () => ridesAPI.getTrip(tripId),
    select: (data) => data.data,
    enabled: !!tripId,
  });

  // Загружаем существующую бронь для этой поездки
  const { 
    data: existingBooking, 
    isLoading: bookingLoading 
  } = useQuery({
    queryKey: queryKeys.myBookingForTrip(tripId),
    queryFn: () => bookingAPI.getMyBookingForTrip(tripId),
    select: (data) => data.data,
    enabled: !!tripId,
  });

  // Мутация для создания брони
  const bookingMutation = useMutation({
    mutationFn: bookingAPI.createBooking,
    onSuccess: (response) => {
      // Обновляем кэш поездок
  queryClient.invalidateQueries({ queryKey: queryKeys.trips });
  queryClient.invalidateQueries({ queryKey: queryKeys.trip(tripId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.myBookingForTrip(tripId) });
      
      notify.success(`Поездка забронирована! Количество мест: ${seatsToBook}`);
      // Переходим на страницу успеха или профиль
      router.push(`/booking/success?bookingId=${response.data.id}`);
    },
    onError: (error) => {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Если ошибка связана с уникальностью, показываем предупреждение
      if (error.response?.data?.non_field_errors?.[0]?.includes('unique') || 
          error.response?.status === 400 && 
          (error.response?.data?.detail?.includes('unique') || 
           error.response?.data?.message?.includes('already exists'))) {
        setShowExistingBookingAlert(true);
        notify.warning('У вас уже есть бронирование на эту поездку');
      } else {
        // Показываем общую ошибку
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            error.message || 
                            'Ошибка при создании бронирования';
        notify.error(errorMessage);
      }
    }
  });

  // Мутация для обновления существующей брони
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, data }) => bookingAPI.updateBooking(bookingId, data),
    onSuccess: (response) => {
      // Обновляем кэш
  queryClient.invalidateQueries({ queryKey: queryKeys.trips });
  queryClient.invalidateQueries({ queryKey: queryKeys.trip(tripId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.myBookingForTrip(tripId) });
      
      notify.success('Бронирование успешно обновлено!');
      // Переходим на страницу успеха
      router.push(`/booking/success?bookingId=${response.data.id}`);
    },
    onError: (error) => {
      console.error('Update booking error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Ошибка при обновлении бронирования';
      notify.error(errorMessage);
    }
  });

  const handleBooking = () => {
    if (!agreeToTerms) {
      alert('Необходимо согласиться с условиями бронирования');
      return;
    }

    // Валидация данных
    if (!tripId || isNaN(parseInt(tripId))) {
      alert('Некорректный ID поездки');
      return;
    }

    if (!seatsToBook || seatsToBook < 1) {
      alert('Некорректное количество мест для бронирования');
      return;
    }

    // Если у пользователя уже есть бронь на эту поездку
    if (existingBooking && existingBooking.status !== 'cancelled') {
      // Обновляем существующую бронь
      const newTotalSeats = existingBooking.seats_reserved + seatsToBook;
      updateBookingMutation.mutate({
        bookingId: existingBooking.id,
        data: { seats_reserved: newTotalSeats }
      });
    } else {
      bookingMutation.mutate({
        tripId: parseInt(tripId),
        seatsReserved: seatsToBook
      });
    }
  };

  const handleCreateNewBooking = () => {
    setShowExistingBookingAlert(false);
    bookingMutation.mutate({
      tripId: parseInt(tripId),
      seatsReserved: seatsToBook
    });
  };

  const handleUpdateExistingBooking = () => {
    setShowExistingBookingAlert(false);
    if (existingBooking) {
      const newTotalSeats = existingBooking.seats_reserved + seatsToBook;
      updateBookingMutation.mutate({
        bookingId: existingBooking.id,
        data: { seats_reserved: newTotalSeats }
      });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      try {
        await updateBookingMutation.mutateAsync({
          bookingId: bookingId,
          data: { status: 'cancelled' }
        });
        router.push('/profile');
      } catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
      }
    }
  };

  const formatDateTime = (dateTimeString) => formatDateTimeUtil(dateTimeString);

  const totalPrice = trip ? parseFloat(trip.price) * seatsToBook : 0;
  const existingBookingPrice = (existingBooking && existingBooking.status !== 'cancelled') 
    ? parseFloat(trip?.price || 0) * existingBooking.seats_reserved 
    : 0;
  // Исправленный расчет: общая стоимость всех мест (существующих + новых)
  const totalSeatsAfterBooking = (existingBooking && existingBooking.status !== 'cancelled') 
    ? existingBooking.seats_reserved + seatsToBook 
    : seatsToBook;
  const finalTotalPrice = trip ? parseFloat(trip.price) * totalSeatsAfterBooking : 0;

  if (tripLoading || bookingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Поездка не найдена
            </h3>
            <p className="text-gray-600 mb-6">
              Возможно, поездка была отменена или уже завершена
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к поиску
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

   // === helpers ===
const formatKGS = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('ru-RU')} Р`;
};

// формат "HH:MM"
const formatTime = (iso) =>
  iso
    ? new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso))
    : '--:--';

// точки-мест
const SeatDots = ({ count }) => (
  <div className="flex gap-2">
    {Array.from({ length: Math.max(1, Math.min(8, count || 0)) }).map((_, i) => (
      <span
        key={i}
        className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400/80"
      />
    ))}
  </div>
);

// === карточка ===
function TripCardCompact({ trip }) {
  const fromCity = trip?.route?.from_city ?? 'Неизвестно';
  const toCity = trip?.route?.to_city ?? 'Неизвестно';
  const depTime = formatTime(trip?.departure_time);
  const arrTime = formatTime(trip?.arrival_time);

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-5">
      <div className="grid grid-cols-[96px_1fr_auto] gap-4 items-center">
        {/* левая тайм-линия */}
        <div className="relative">
          <div className="absolute left-4 top-6 bottom-6 border-l-2 border-dotted border-slate-300" />
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <div className="text-3xl font-semibold leading-none">{depTime}</div>
                <div className="text-slate-600 mt-1">{fromCity}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <div className="text-3xl font-semibold leading-none">{arrTime}</div>
                <div className="text-slate-600 mt-1">{toCity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* центр: водитель + авто + места */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <DriverInfo driverId={trip.driver} />
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              <Star className="h-4 w-4" />
              <DriverRating driverId={trip.driver} showLabel={false} size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-slate-700 font-medium">
                {trip?.car?.brand || 'Авто'}
              </div>
              {(trip?.car?.model || trip?.car?.year) && (
                <div className="text-sm">
                  {[trip?.car?.model, trip?.car?.year].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>

          <SeatDots count={trip?.available_seats ?? 0} />
        </div>

        {/* цена справа зелёным */}
        <div className="text-emerald-600 font-bold text-2xl">
          {formatKGS(trip?.price)}
        </div>
      </div>
    </div>
  );
}







  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Хедер */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-blue-50/80"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center flex-1 mx-4">
              Бронирование поездки
            </h1>
            
            <div className="w-16 sm:w-20"></div> {/* Spacer для центрирования заголовка */}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:grid xl:grid-cols-5 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Информация о поездке */}
          <div className="xl:col-span-3 lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Маршрут и время */}
            <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                      <span className="break-words">{trip.route?.from_city || 'Неизвестно'} → {trip.route?.to_city || 'Неизвестно'}</span>
                    </h2>
                    {trip.route?.distance_km && (
                      <p className="text-slate-600 ml-7 sm:ml-9 text-sm sm:text-base">Расстояние: {trip.route.distance_km} км</p>
                    )}
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {parseFloat(trip.price).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-slate-600">за место</div>
                  </div>
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
                  {/* Время отправления */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-3 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Отправление</p>
                      <p className="text-slate-600">{formatDateTime(trip.departure_time)}</p>
                    </div>
                  </div>

                  {/* Время прибытия */}
                  {trip.arrival_time && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-3 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Прибытие</p>
                        <p className="text-slate-600">{formatDateTime(trip.arrival_time)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Информация о водителе и автомобиле */}
            <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Водитель и автомобиль</h3>
                
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
                  {/* Информация о водителе */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Водитель</h4>
                    <div className="space-y-2">
                      <DriverInfo driverId={trip.driver} />
                      <DriverRating driverId={trip.driver} showLabel={true} size="sm" />
                      <Button variant="outline" size="sm" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Связаться
                      </Button>
                    </div>
                  </div>

                  {/* Информация об автомобиле */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Автомобиль</h4>
                    <div className="space-y-2">
                      <p className="text-slate-700 font-medium">
                        {trip.car?.brand || 'Неизвестно'} {trip.car?.model || ''}
                      </p>
                      <p className="text-slate-600">
                        {trip.car?.plate_number || 'Номер не указан'}
                      </p>
                      {trip.car?.color && (
                        <p className="text-slate-600">Цвет: {trip.car.color}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          Свободно мест: {trip.available_seats}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Примечания */}
                {trip.notes && (
                  <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                    <h4 className="font-semibold text-slate-800 mb-2">Примечания водителя</h4>
                    <p className="text-slate-700">{trip.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Информация о бронировании */}
          <div className="xl:col-span-2 lg:col-span-1 order-1 lg:order-2">
            <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl lg:sticky lg:top-24">
              <CardContent className="p-6">
                {/* Детали бронирования */}
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200/50">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                    Детали бронирования
                  </h4>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-700">Цена за место:</span>
                    <span className="font-medium">{parseFloat(trip.price).toLocaleString('ru-RU')} ₽</span>
                  </div>
                  
                  {existingBooking && existingBooking.status !== 'cancelled' ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-700">Забронировано мест:</span>
                        <span className="font-medium">{existingBooking.seats_reserved}</span>
                      </div>
                      <hr className="my-2 border-blue-200" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800">Общая стоимость:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {existingBookingPrice.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Форма бронирования для новых бронирований */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Количество мест для бронирования:
                          </label>
                          <select
                            value={seatsToBook}
                            onChange={(e) => setSeatsToBook(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: Math.min(trip.available_seats, 8) }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700">Количество мест:</span>
                          <span className="font-medium">{seatsToBook}</span>
                        </div>
                        
                        <hr className="my-2 border-blue-200" />
                        
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">Общая стоимость:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {totalPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={agreeToTerms}
                              onChange={(e) => setAgreeToTerms(e.target.checked)}
                              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-600">
                              Я согласен с условиями бронирования
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Действия */}
                {existingBooking && existingBooking.status !== 'cancelled' ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/profile')}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-sm sm:text-base"
                    >
                      Мои бронирования
                    </Button>
                    
                    {existingBooking.status === 'pending' && (
                      <Button
                        onClick={() => handleCancelBooking(existingBooking.id)}
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 text-sm sm:text-base"
                      >
                        Отменить бронирование
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleBooking}
                      disabled={!agreeToTerms || trip.available_seats < seatsToBook || bookingMutation.isPending}
                      className={`w-full shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-sm sm:text-base ${
                        agreeToTerms && trip.available_seats >= seatsToBook && !bookingMutation.isPending
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {bookingMutation.isPending 
                        ? 'Бронирование...' 
                        : trip.available_seats < seatsToBook
                        ? 'Недостаточно мест'
                        : !agreeToTerms
                        ? 'Согласитесь с условиями'
                        : 'Забронировать'
                      }
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                      className="w-full text-sm sm:text-base"
                    >
                      Вернуться к поиску
                    </Button>
                  </div>
                )}

                {/* Алерт для существующего бронирования */}
                {showExistingBookingAlert && (
                  <Alert className="mt-4 bg-yellow-50/70 border-yellow-300/50">
                    <div className="font-medium text-yellow-800">⚠️ У вас уже есть бронирование</div>
                    <div className="text-sm text-yellow-700 mt-1 mb-3">
                      Вы можете создать новое бронирование или обновить существующее
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateNewBooking}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Новое бронирование
                      </Button>
                      <Button
                        onClick={handleUpdateExistingBooking}
                        size="sm"
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        Обновить существующее
                      </Button>
                    </div>
                  </Alert>
                )}

                <p className="text-xs text-slate-500 text-center mt-4">
                  {existingBooking && existingBooking.status !== 'cancelled' 
                    ? 'Свяжитесь с водителем для уточнения деталей' 
                    : 'Информация о выбранной поездке'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(BookingPage, ['passenger']);
