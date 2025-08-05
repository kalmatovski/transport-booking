'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock,
  Phone,
  MessageCircle,
  Star
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { Button, Alert, LoadingSpinner } from '../components/ui';
import { DriverInfo } from '../components/DriverInfo';
import { DriverTrips } from '../components/DriverTrips';
import { AppLayout } from '../components/layout/AppLayout';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { SearchForm } from '../components/SearchForm';
import { TripsList } from '../components/TripsList';
import { useTrips } from '../hooks/useTrips';

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState('');

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем роль пользователя (ВАЖНО: определяем ДО использования в queries)
  const isDriver = useMemo(() => user?.role === 'driver', [user?.role]);
  const isPassenger = useMemo(() => user?.role === 'passenger', [user?.role]);

  // 🚀 Используем custom hook для поездок
  const { 
    data: availableTrips = [], 
    isLoading: tripsLoading,
    error: tripsError,
    refetch: refetchTrips
  } = useTrips(selectedRoute, null, isAuthenticated && isPassenger);

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем функции
  const handleSearch = useCallback(() => {
    refetchTrips();
  }, [refetchTrips]);

  const handleBooking = useCallback((trip) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/booking/${trip.id}`);
  }, [isAuthenticated, router]);

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем функции форматирования
  const formatTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatDate = useCallback((dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const formatDateTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${formatTime(dateTimeString)}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Завтра, ${formatTime(dateTimeString)}`;
    } else {
      return `${formatDate(dateTimeString)}, ${formatTime(dateTimeString)}`;
    }
  }, [formatTime, formatDate]);

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем функции статуса
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'in_road':
        return 'bg-blue-100 text-blue-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'available':
        return 'Свободен';
      case 'full':
        return 'Заполнен';
      case 'in_road':
        return 'В пути';
      case 'finished':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return status;
    }
  }, []);

  return (
    <AppLayout>
      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Приветственный баннер для неавторизованных пользователей */}
        {!isAuthenticated ? (
          <WelcomeBanner />
        ) : (
          <>
            {/* Для пассажиров показываем форму поиска */}
            {isPassenger && (
              <>
                {/* Форма поиска для пассажиров */}
                <SearchForm
                  selectedRoute={selectedRoute}
                  setSelectedRoute={setSelectedRoute}
                  onSearch={handleSearch}
                  isAuthenticated={isAuthenticated}
                />

                {/* Результаты поиска */}
                <TripsList
                  trips={availableTrips}
                  isLoading={tripsLoading}
                  error={tripsError}
                  formatDateTime={formatDateTime}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  onBooking={handleBooking}
                  showResults={tripsLoading || tripsError || availableTrips.length > 0}
                />
              </>
            )}
          </>
        )}
        
        {/* Контент для авторизованных пользователей */}
        {isAuthenticated && isDriver && (
          <DriverTrips />
        )}
      </main>
    </AppLayout>
  );
}