'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  Car,
  MapPin, 
  Calendar, 
  Users, 
  Phone,
  MessageCircle,
  Home,
  User,
  Star
} from 'lucide-react';

import { bookingAPI, ratingsAPI, authAPI } from '../../../lib/api';
import { Button, Card, CardContent, LoadingSpinner } from '../../../components/ui';
import { withAuth } from '../../../components/withAuth';
import { AppLayout } from '../../../components/layout/AppLayout';
import { useIsHydrated } from '../../../hooks/useIsHydrated';
import { DriverRating } from '../../../components/DriverRating';

function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const isHydrated = useIsHydrated();

  // Состояния для бронирования
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // Состояния для водителя
  const [driver, setDriver] = useState(null);
  const [driverLoading, setDriverLoading] = useState(true);
  const [driverError, setDriverError] = useState(null);

  // Состояния для рейтинга водителя
  const [driverRating, setDriverRating] = useState(null);
  const [driverRatingLoading, setDriverRatingLoading] = useState(true);

  const loadBooking = useCallback(async () => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      const response = await bookingAPI.getBooking(bookingId);
      setBooking(response.data || response);
    } catch (err) {
      setBookingError(err.response?.data?.detail || err.message || 'Ошибка загрузки бронирования');
    } finally {
      setBookingLoading(false);
    }
  }, [bookingId]);

  const loadDriver = async (driverId) => {
    try {
      setDriverLoading(true);
      setDriverError(null);
      const response = await authAPI.getUser(driverId);
      setDriver(response.data);
    } catch (err) {
      setDriverError(err.response?.data?.detail || err.message || 'Ошибка загрузки данных водителя');
    } finally {
      setDriverLoading(false);
    }
  };

  const loadDriverRating = async (driverId) => {
    try {
      setDriverRatingLoading(true);
      const response = await ratingsAPI.getDriverRatings(driverId);
      setDriverRating(response.data);
    } catch (err) {
      console.error('Error loading driver rating:', err);
    } finally {
      setDriverRatingLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId && isHydrated) {
      loadBooking();
    }
  }, [bookingId, isHydrated, loadBooking]);

  useEffect(() => {
    if (booking?.trip_details?.driver || booking?.trip?.driver) {
      const driverId = booking.trip_details?.driver || booking.trip?.driver;
      loadDriver(driverId);
      loadDriverRating(driverId);
    }
  }, [booking]);

  if (!isHydrated) {
    return <LoadingSpinner size="lg" />;
  }

  if (bookingLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (bookingError || !booking) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Бронирование не найдено
              </h3>
              <p className="text-gray-600 mb-6">
                Возможно, произошла ошибка или бронирование было отменено
              </p>
              <Button onClick={() => router.push('/')}>
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const tripData = booking?.trip_details || booking?.trip;
  const routeData = tripData?.route;
  const fromCity = routeData?.from_city;
  const toCity = routeData?.to_city;
  const departureTime = tripData?.departure_time;
  const arrivalTime = tripData?.arrival_time;
  const price = tripData?.price;
  const seatsReserved = booking?.seats_reserved;

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

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок успеха */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-6 rounded-3xl mx-auto w-fit mb-6 shadow-lg">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Бронирование успешно!
            </h1>
            <p className="text-xl text-slate-700 mb-2">
              Ваша заявка отправлена водителю
            </p>
            <p className="text-slate-600">
              Бронь будет подтверждена в течение 30 минут
            </p>
          </div>

          {/* Информация о поездке */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Детали поездки */}
            <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <Car className="w-6 h-6 mr-3 text-blue-600" />
                  Детали поездки
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                    <span className="text-slate-600">Маршрут:</span>
                    <span className="font-semibold text-slate-800 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {fromCity || 'Неизвестно'} → {toCity || 'Неизвестно'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                    <span className="text-slate-600">Отправление:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateTime(departureTime)}
                    </span>
                  </div>

                  {arrivalTime && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                      <span className="text-slate-600">Прибытие:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDateTime(arrivalTime)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                    <span className="text-slate-600">Забронировано мест:</span>
                    <span className="font-semibold text-slate-800 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {seatsReserved || 1}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-600">Общая стоимость:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {price && seatsReserved ? 
                        (parseFloat(price) * seatsReserved).toLocaleString('ru-RU') : 
                        'Загружается...'
                      } ₽
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  Информация о бронировании
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                    <span className="text-slate-600">Номер брони:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      #{booking.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                    <span className="text-slate-600">Статус:</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {booking.status === 'pending' ? 'Ожидает подтверждения' : 
                       booking.status === 'confirmed' ? 'Подтверждено' :
                       booking.status === 'cancelled' ? 'Отменено' : 
                       booking.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                    <span className="text-slate-600">Дата бронирования:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(booking.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Информация о водителе */}
          {driver && (
            <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl mt-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Информация о водителе
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Имя:</span>
                      <span className="font-semibold text-slate-800">
                        {driver.first_name} {driver.last_name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Телефон:</span>
                      <span className="font-semibold text-slate-800 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {driver.phone}
                      </span>
                    </div>

                    {driverRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Рейтинг:</span>
                        <span className="font-semibold text-slate-800 flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                          {parseFloat(driverRating.average_rating || 0).toFixed(1)} 
                          <span className="text-slate-500 ml-1">
                            ({driverRating.total_ratings} отзывов)
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="md:text-right">
                    <DriverRating driverId={tripData?.driver} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Что дальше */}
          <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl mt-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-blue-600" />
                Что дальше?
              </h2>

              <div className="text-slate-700 space-y-3 leading-relaxed">
                <p>• Водитель подтвердит или отклонит бронирование в течение 30 минут</p>
                <p>• После подтверждения с вами свяжется водитель для уточнения деталей</p>
                <p>• Оплата производится наличными или переводом водителю при посадке</p>
                <p>• Отмена бронирования возможна не позднее чем за 2 часа до отправления</p>
                <p>• Будьте на месте посадки за 10 минут до указанного времени</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => router.push('/profile')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3"
            >
              <User className="w-4 h-4 mr-2" />
              Мои бронирования
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="px-8 py-3 border-slate-300"
            >
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(BookingSuccessPage, ['passenger']);
