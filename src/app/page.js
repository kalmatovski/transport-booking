'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Icons were previously used in this page; keeping UI minimal now.

import { useAuthStore } from '../store/authStore';
import { useIsHydrated } from '../hooks/useIsHydrated';
import { Button, Alert, LoadingSpinner } from '../components/ui';
import { DriverTrips } from '../components/DriverTrips';
import { AppLayout } from '../components/layout/AppLayout';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { SearchForm } from '../components/SearchForm';
import { ridesAPI } from '../lib/api';
import { TripsList } from '../components/TripsList';
import { formatDateTime as formatDateTimeUtil } from '../lib/datetime';

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState('');
  const isHydrated = useIsHydrated();

  const isDriver = useMemo(() => user?.role === 'driver', [user?.role]);
  const isPassenger = useMemo(() => user?.role === 'passenger', [user?.role]);

  // Состояния для поездок
  const [availableTrips, setAvailableTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(null);

  // Функция загрузки поездок
  const loadTrips = useCallback(async () => {
    if (!isAuthenticated || !isPassenger || !isHydrated) return;
    
    try {
      setTripsLoading(true);
      setTripsError(null);
      const response = await ridesAPI.getAvailableTrips(selectedRoute, null);
      setAvailableTrips(response.data || []);
    } catch (err) {
  const message = err?.response?.data?.detail || err?.message || 'Ошибка загрузки поездок';
  setTripsError({ message });
    } finally {
      setTripsLoading(false);
    }
  }, [selectedRoute, isAuthenticated, isPassenger, isHydrated]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleSearch = useCallback(() => {
    loadTrips();
  }, [loadTrips]);

  const handleBooking = useCallback((trip) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/booking/${trip.id}`);
  }, [isAuthenticated, router]);

  const formatDateTime = useCallback((dateTimeString) => formatDateTimeUtil(dateTimeString), []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_road':
        return 'bg-blue-100 text-blue-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'available':
        return 'Доступна';
      case 'in_road':
        return 'В пути';
      case 'finished':
        return 'Завершена';
      default:
        return 'Неизвестно';
    }
  }, []);

  // Не показываем содержимое до гидратации
  if (!isHydrated) {
    return (
      <AppLayout showMinimalHeader={true}>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showMinimalHeader={!isAuthenticated}>
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
