'use client';

import { Car } from 'lucide-react';
import { LoadingSpinner, Alert } from './ui';
import TripCard from './TripCard';

export function TripsList({ 
  trips = [], 
  isLoading, 
  error, 
  formatDateTime,
  getStatusColor,
  getStatusText,
  onBooking,
  showResults = true
}) {
  if (!showResults) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Состояние загрузки */}
      {isLoading && (
        <div className="space-y-6">
          {/* Skeleton карточки во время загрузки */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-8 animate-pulse"
            >
              <div className="flex space-x-4">
                <div className="bg-slate-200 rounded-xl w-12 h-12"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ошибка загрузки */}
      {error && !isLoading && (
        <Alert variant="error" className="mb-6">
          Ошибка загрузки поездок: {error.message}
        </Alert>
      )}

      {/* Пустой результат */}
      {!isLoading && !error && trips.length === 0 && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Поездок не найдено
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      )}

      {/* Список поездок */}
      {!isLoading && !error && trips.length > 0 && (
        <>
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={index}
              formatDateTime={formatDateTime}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onBooking={onBooking}
            />
          ))}
        </>
      )}
    </div>
  );
}
