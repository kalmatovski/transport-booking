'use client';

import { memo, useCallback } from 'react';
import { Clock, MapPin, Users, Star, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent, Button } from './ui';
import { DriverInfo } from './DriverInfo';

const TripCard = memo(({ 
  trip, 
  index, 
  formatDateTime, 
  getStatusColor, 
  getStatusText, 
  onBooking 
}) => {
  const handleBookingClick = useCallback(() => {
    onBooking(trip);
  }, [trip, onBooking]);

  return (
    <Card 
      className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-200"
    >
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-2 rounded-xl mr-3">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            {trip.route?.from_city || 'Неизвестно'} → {trip.route?.to_city || 'Неизвестно'}
          </h3>
          {trip.route?.distance_km && (
            <p className="text-sm text-slate-600 ml-12">Расстояние: {trip.route.distance_km} км</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          {/* Информация о поездке */}
          <div className="flex-1">
            {/* Время и статус - адаптивная сетка */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Время отправления */}
              <div className="flex items-center space-x-3 bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/40">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-2 rounded-xl flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-800 block text-sm">
                    Отправление
                  </span>
                  <p className="text-xs text-slate-600 truncate">
                    {formatDateTime(trip.departure_time)}
                  </p>
                </div>
              </div>
              
              {/* Время прибытия */}
              {trip.arrival_time && (
                <div className="flex items-center space-x-3 bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/40">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-2 rounded-xl flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-800 block text-sm">
                      Прибытие
                    </span>
                    <p className="text-xs text-slate-600 truncate">
                      {formatDateTime(trip.arrival_time)}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Статус */}
              <div className="flex items-center justify-center sm:justify-start lg:justify-center">
                <span className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(trip.status)}`}>
                  {getStatusText(trip.status)}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Водитель */}
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <p className="text-sm text-slate-600 mb-1">Водитель</p>
                <DriverInfo driverId={trip.driver} />
                <div className="flex items-center space-x-1 mt-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-slate-600">4.8</span>
                </div>
              </div>

              {/* Автомобиль */}
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <p className="text-sm text-slate-600 mb-1">Автомобиль</p>
                <p className="font-semibold text-slate-800">
                  {trip.car?.brand || 'Неизвестно'} {trip.car?.model || ''}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {trip.car?.plate_number || 'Номер не указан'}
                </p>
                {trip.car?.color && (
                  <p className="text-xs text-slate-600">
                    Цвет: {trip.car.color}
                  </p>
                )}
              </div>

              {/* Места и цена */}
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <p className="text-sm text-slate-600 mb-1">Свободно мест</p>
                <p className="font-semibold text-slate-800 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-slate-500" />
                  {trip.available_seats}
                </p>
                <p className="text-xl font-bold text-blue-600 mt-2">
                  {parseFloat(trip.price).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>

            {/* Примечания */}
            {trip.notes && (
              <div className="mt-6 p-4 bg-blue-50/70 backdrop-blur-sm rounded-xl border border-blue-200/50">
                <p className="text-sm text-slate-700">{trip.notes}</p>
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col space-y-3 min-w-[220px]">
            {/* Контакты */}
            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/60 transition-all duration-200 text-slate-700">
                <Phone className="w-4 h-4 mr-1" />
                <span className="text-sm">Позвонить</span>
              </button>
              <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/60 transition-all duration-200 text-slate-700">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Написать</span>
              </button>
            </div>

            {/* Кнопка бронирования */}
            <Button
              onClick={handleBookingClick}
              disabled={trip.status !== 'available' || trip.available_seats < 1}
              className={`w-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                trip.status === 'available' && trip.available_seats >= 1
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {trip.status !== 'available' 
                ? 'Недоступно'
                : trip.available_seats < 1
                ? 'Мало мест'
                : 'Забронировать'
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TripCard.displayName = 'TripCard';

export default TripCard;
