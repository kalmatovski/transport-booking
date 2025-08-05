'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  Car,
  MapPin, 
  Calendar, 
  Users, 
  Phone,
  MessageCircle,
  Home,
  User
} from 'lucide-react';

import { bookingAPI } from '../../../lib/api';
import { Button, Card, CardContent, LoadingSpinner } from '../../../components/ui';
import { withAuth } from '../../../components/withAuth';
import { AppLayout } from '../../../components/layout/AppLayout';

function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const { 
    data: booking, 
    isLoading: bookingLoading,
    error: bookingError 
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingAPI.getBooking(bookingId),
    select: (data) => {
      return data.data || data;
    },
    enabled: !!bookingId,
  });

  const tripData = booking?.trip_details || booking?.trip;
  const routeData = tripData?.route;
  const fromCity = routeData?.from_city;
  const toCity = routeData?.to_city;
  const departureTime = tripData?.departure_time;
  const arrivalTime = tripData?.arrival_time;
  const price = tripData?.price;
  const seatsReserved = booking?.seats_reserved;

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
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

  if (bookingLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (bookingError || !booking) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Бронирование не найдено
              </h3>
              <p className="text-gray-600 mb-6">
                Возможно, произошла ошибка при создании бронирования
              </p>
              <Button onClick={() => router.push('/')} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                Детали поездки
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                  <span className="text-slate-600">Маршрут:</span>
                  <span className="font-semibold text-slate-800">
                    {fromCity && toCity ? `${fromCity} → ${toCity}` : 'Маршрут загружается...'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-200/50">
                  <span className="text-slate-600">Отправление:</span>
                  <span className="font-semibold text-slate-800">
                    {departureTime ? formatDateTime(departureTime) : 'Время загружается...'}
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

                <div className="pt-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Водитель</h3>
                  <p className="text-slate-700 mb-3">
                    Водитель #{tripData?.driver || 'Неизвестно'}
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Позвонить
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Написать
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Важная информация</h3>
            <div className="space-y-3 text-slate-700">
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
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
          >
            <User className="w-4 h-4 mr-2" />
            Мои бронирования
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50/80"
          >
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </main>
    </AppLayout>
  );
}

export default withAuth(BookingSuccessPage, ['passenger']);
