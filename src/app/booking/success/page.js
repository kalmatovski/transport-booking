'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  MessageCircle,
  Home,
  User
} from 'lucide-react';

import { bookingAPI } from '../../../lib/api';
import { Button, Card, CardContent, LoadingSpinner } from '../../../components/ui';
import { withAuth } from '../../../components/withAuth';
import { AppLayout } from '../../../components/layout/AppLayout';
import { useIsHydrated } from '../../../hooks/useIsHydrated';

function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const isHydrated = useIsHydrated();

  // Состояния для бронирования
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);

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

  useEffect(() => {
    if (bookingId && isHydrated) {
      loadBooking();
    }
  }, [bookingId, isHydrated, loadBooking]);

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
              <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Заголовок успеха */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl mx-auto w-fit mb-4 sm:mb-6 shadow-lg">
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 mx-auto" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Бронирование успешно!
            </h1>
            <p className="text-lg sm:text-xl text-slate-700 mb-2">
              Ваша заявка отправлена водителю
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              Бронь будет подтверждена в течение 30 минут
            </p>
          </div>

          {/* Информация о поездке */}
          <div className="grid md:grid-cols-1 gap-8">
          </div>

          {/* Что дальше */}
          <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl mt-6 sm:mt-8">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                Что дальше?
              </h2>

              <div className="text-slate-700 space-y-2 sm:space-y-3 leading-relaxed text-sm sm:text-base">
                <p>• Водитель подтвердит или отклонит бронирование в течение 30 минут</p>
                <p>• После подтверждения с вами свяжется водитель для уточнения деталей</p>
                <p>• Оплата производится наличными или переводом водителю при посадке</p>
                <p>• Отмена бронирования возможна не позднее чем за 2 часа до отправления</p>
                <p>• Будьте на месте посадки за 10 минут до указанного времени</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <Button
              onClick={() => router.push('/profile')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              <User className="w-4 h-4 mr-2" />
              Мои бронирования
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="px-6 sm:px-8 py-2.5 sm:py-3 border-slate-300 text-sm sm:text-base"
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
