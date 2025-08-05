'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ridesAPI } from '../lib/api';
import { Clock, Users, MapPin, Phone, DollarSign, Calendar, Plus } from 'lucide-react';
import { Button } from './ui';

export function DriverTrips() {
  const router = useRouter();
  
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['myTrips'],
    queryFn: () => ridesAPI.getMyTrips(),
    select: (data) => data.data,
    refetchInterval: 2 * 60 * 1000, // 🚀 Обновляем каждые 2 минуты вместо 30 секунд
    staleTime: 60 * 1000, // 🚀 Кешируем на 1 минуту
    cacheTime: 5 * 60 * 1000, // 🚀 Храним в кеше 5 минут
    refetchOnWindowFocus: false, // 🚀 Не перезагружаем при фокусе
  });

  const formatTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getTimeUntilDeparture = useCallback((departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) return { text: 'Поездка началась', urgent: false };
    if (diffHours < 2) return { text: `${diffHours}ч ${diffMinutes}м до отправления`, urgent: true };
    return { text: `${diffHours}ч ${diffMinutes}м до отправления`, urgent: false };
  }, []);

  const getStatusColor = useCallback((status, availableSeats) => {
    if (availableSeats === 0) {
      return 'bg-red-100 text-red-800';
    }
    
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusText = useCallback((status, availableSeats) => {
    if (availableSeats === 0) {
      return 'Заполнен';
    }
    
    switch (status) {
      case 'available': return 'Доступна';
      case 'in_progress': return 'В пути';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      case 'full': return 'Заполнен';
      default: return status;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Ошибка загрузки поездок</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-700 underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!trips?.length) {
    return (
      <div className="space-y-6">
        {/* Заголовок с кнопкой создания */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Мои поездки</h2>
          <Button
            onClick={() => router.push('/create-trip')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать поездку
          </Button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Нет активных поездок</h3>
          <p className="text-slate-500 mb-4">Создайте новую поездку, чтобы начать принимать пассажиров</p>
          <Button
            onClick={() => router.push('/create-trip')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать первую поездку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой создания */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Мои поездки</h2>
        <Button
          onClick={() => router.push('/create-trip')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать поездку
        </Button>
      </div>
      
      {trips.map((trip) => {
        const timeInfo = getTimeUntilDeparture(trip.departure_time);
        
        return (
          <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Заголовок поездки */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">
                    {trip.route?.from_city} → {trip.route?.to_city}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status, trip.available_seats)}`}>
                  {getStatusText(trip.status, trip.available_seats)}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Время и дата */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Отправление</span>
                  </div>
                  <p className="text-lg font-semibold">{formatTime(trip.departure_time)}</p>
                  <p className={`text-sm ${timeInfo.urgent ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                    {timeInfo.text}
                  </p>
                </div>

                {/* Места и пассажиры */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Занятость</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {trip.seats_taken}/{trip.seats_taken + trip.available_seats}
                  </p>
                </div>

                {/* Доход */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Доход</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    {trip.total_revenue}₽
                  </p>
                  <p className="text-sm text-slate-500">
                    Цена: {trip.price}₽ за место
                  </p>
                </div>
              </div>

              {/* Список пассажиров */}
              {trip.bookings?.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Пассажиры ({trip.bookings.length})
                  </h4>
                  <div className="space-y-3">
                    {trip.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {booking.passenger.first_name?.charAt(0) || booking.passenger.phone?.charAt(-2) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {booking.passenger.first_name} {booking.passenger.last_name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {booking.seats_reserved} {booking.seats_reserved === 1 ? 'место' : 'мест'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Подтверждено' : 
                             booking.status === 'pending' ? 'Ожидает' : booking.status}
                          </span>
                          <a 
                            href={`tel:${booking.passenger.phone}`}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 min-w-0 flex-shrink-0"
                          >
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm truncate">{booking.passenger.phone}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
