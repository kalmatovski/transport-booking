'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Users, Car, Star } from 'lucide-react';
import { getStatusConfig, formatDateTime } from './ProfileComponents';
import { bookingAPI } from '../../lib/api';
import { notify } from '../../lib/notify';
import { useQueryClient } from '@tanstack/react-query';

export function BookingCard({ 
  booking, 
  userId, 
  ratedTrips, 
  onRate, 
  onRatingSuccess 
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const tripId = booking.trip_details?.id || booking.trip;
  const isRated = ratedTrips.has(tripId);

  const handleCancelBooking = async () => {
    if (cancelling) return;
    
    try {
      setCancelling(true);
      await bookingAPI.cancelBooking(booking.id);
      notify.success('Бронирование отменено');
      queryClient.invalidateQueries(['my-bookings', userId]);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Произошла ошибка при отмене бронирования';
      notify.error(`Ошибка отмены: ${errorMessage}`);
    } finally {
      setCancelling(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!booking.trip_details) return '—';
    return (parseFloat(booking.trip_details.price) * booking.seats_reserved).toLocaleString('ru-RU');
  };

  const getSeatText = (count) => {
    if (count === 1) return 'место';
    if (count < 5) return 'места';
    return 'мест';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="ml-1">{statusConfig.text}</span>
            </span>
            <span className="text-sm text-gray-500">#{booking.id}</span>
          </div>

          {/* Детали поездки */}
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
                <span>{booking.seats_reserved} {getSeatText(booking.seats_reserved)}</span>
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
            {calculateTotalPrice()} ₽
          </div>
          <div className="text-sm text-gray-500">
            {booking.trip_details ? parseFloat(booking.trip_details.price).toLocaleString('ru-RU') : '—'} ₽ за место
          </div>
        </div>
      </div>

      {/* Нижняя часть */}
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
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Отменяем...' : 'Отменить'}
            </button>
          )}
          
          {booking.status === 'completed' && (
            <button
              onClick={isRated ? undefined : () => onRate(booking)}
              disabled={isRated}
              className={`px-3 py-1 text-xs font-medium border rounded transition-colors flex items-center space-x-1 ${
                isRated 
                  ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed' 
                  : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Star className={`w-3 h-3 ${isRated ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              <span>{isRated ? 'Оценено' : 'Оценить'}</span>
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
  );
}
