'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  User, 
  UserPlus,
  Search,
  Clock,
  Phone,
  MessageCircle,
  Star,
  DollarSign
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { ridesAPI, routesAPI } from '../lib/api';
import { Button, Card, CardContent, Alert, LoadingSpinner } from '../components/ui';
import { DriverInfo } from '../components/DriverInfo';
import { DriverTrips } from '../components/DriverTrips';
import TripCard from '../components/TripCard';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем роль пользователя (ВАЖНО: определяем ДО использования в queries)
  const isDriver = useMemo(() => user?.role === 'driver', [user?.role]);
  const isPassenger = useMemo(() => user?.role === 'passenger', [user?.role]);

  const { 
    data: availableTrips = [], 
    isLoading: tripsLoading,
    error: tripsError,
    refetch: refetchTrips
  } = useQuery({
    queryKey: ['available-trips', selectedRoute, selectedDate],
    queryFn: () => ridesAPI.getAvailableTrips(selectedRoute, selectedDate),
    select: (data) => {
      const trips = data?.data || [];
      // Фильтруем поездки - показываем только будущие
      const now = new Date();
      return trips.filter(trip => {
        const departureTime = new Date(trip.departure_time);
        return departureTime > now;
      });
    },
    enabled: isAuthenticated && isPassenger, // 🚀 Загружаем только для пассажиров
    staleTime: 5 * 60 * 1000, // 🚀 Кешируем на 5 минут
    cacheTime: 10 * 60 * 1000, // 🚀 Храним в кеше 10 минут
    refetchOnWindowFocus: false, // 🚀 Не перезагружаем при фокусе
  });

  // 🚀 ОПТИМИЗАЦИЯ: Кешируем маршруты надолго (они редко меняются)
  const { data: routes = [], isLoading: routesLoading, error: routesError } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAllRoutes,
    select: (data) => data?.data || data || [],
    staleTime: 30 * 60 * 1000, // 🚀 Кешируем маршруты на 30 минут
    cacheTime: 60 * 60 * 1000, // 🚀 Храним в кеше 1 час
    enabled: isAuthenticated && isPassenger,
    refetchOnWindowFocus: false,
  });

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем функции
  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  // 🚀 ОПТИМИЗАЦИЯ: Мемоизируем функции
  const handleSearch = useCallback(() => {
    refetchTrips();
  }, [refetchTrips]);

  const handleBooking = useCallback((trip) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/booking/${trip.id}?passengers=${passengers}`);
  }, [isAuthenticated, router, passengers]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Хедер */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Логотип */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Transport Book
              </span>
            </div>

            {/* Навигация */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/profile')}
                    className="flex items-center space-x-1 hover:bg-blue-50/80 text-slate-700"
                  >
                    <User className="w-4 h-4" />
                    <span>Профиль</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:bg-red-50/80 text-slate-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Выйти</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                    className="flex items-center space-x-1 hover:bg-blue-50/80 text-slate-700"
                  >
                    <User className="w-4 h-4" />
                    <span>Войти</span>
                  </Button>
                  <Button
                    onClick={() => router.push('/register')}
                    className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Регистрация</span>
                  </Button>
                </>
              )}
            </div>

            {/* Мобильное меню кнопка */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Мобильное меню */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-blue-200/50 bg-white/90 backdrop-blur-md py-4">
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50/80 rounded-lg mx-2"
                    >
                      Профиль
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50/80 rounded-lg mx-2"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login')}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50/80 rounded-lg mx-2"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50/80 rounded-lg mx-2"
                    >
                      Регистрация
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Приветственный баннер для неавторизованных пользователей */}
        {!isAuthenticated ? (
          <div className="text-center lg:py-4">
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-12 mb-8 border border-white/40 shadow-2xl relative overflow-hidden">
              {/* Декоративные элементы */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-8 left-8 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute top-16 right-12 w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="absolute bottom-12 left-16 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg mx-auto w-fit mb-6">
                  <Car className="w-16 h-16 text-white" />
                </div>
                <h1 className=" text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Transport Book
                </h1>
                <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
                  Удобное бронирование поездок по всей стране
                </p>
                <div className="grid md:grid-cols-3 gap-8 mb-10 max-w-4xl mx-auto">
                  <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-4 rounded-2xl mx-auto w-fit mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-lg">Найти попутчиков</h3>
                    <p className="text-slate-600">Быстро и безопасно</p>
                  </div>
                  <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-4 rounded-2xl mx-auto w-fit mb-4">
                      <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-lg">Удобные маршруты</h3>
                    <p className="text-slate-600">Между городами</p>
                  </div>
                  <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-4 rounded-2xl mx-auto w-fit mb-4">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-lg">Выгодные цены</h3>
                    <p className="text-slate-600">Экономьте на поездках</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push('/register')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Начать путешествие
                  </Button>
                  <Button
                    onClick={() => router.push('/login')}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50/80 px-8 py-3 text-lg backdrop-blur-sm bg-white/40"
                  >
                    <User className="w-5 h-5 mr-2" />
                    У меня есть аккаунт
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Для пассажиров показываем форму поиска */}
            {isPassenger && (
              <>
                {/* Форма поиска для пассажиров */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-8 mb-8">
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl mx-auto w-fit mb-4">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Найти поездку
                    </h1>
                  </div>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {/* Выбор маршрута */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Маршрут
                  </label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  >
                    <option value="">Все маршруты</option>
                    {routesLoading && <option>Загрузка маршрутов...</option>}
                    {!routesLoading && routes.length === 0 && <option>Маршруты не найдены</option>}
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.from_city} → {route.to_city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Выбор даты */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Дата отправления
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  />
                </div>

                {/* Количество пассажиров */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Пассажиров
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {/* Кнопка поиска */}
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3 flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Найти
                  </Button>
                </div>
              </div>
            </div>

            {/* Результаты поиска для авторизованных пользователей */}
            {(tripsLoading || tripsError || availableTrips.length > 0) && (
              <div className="space-y-6">
                {tripsLoading && (
                  <div className="space-y-6">
                    {/* Skeleton карточки во время загрузки */}
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-xl p-8 animate-pulse">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="bg-white/40 rounded-xl p-4">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="bg-white/40 rounded-xl p-4">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-5 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="bg-white/40 rounded-xl p-4">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tripsError && (
                  <Alert variant="error" className="mb-6">
                    Ошибка загрузки поездок: {tripsError.message}
                  </Alert>
                )}

                {!tripsLoading && availableTrips.length === 0 && (
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
              </div>
            )}
              </>
            )}
          </>
        )}
        
        {/* Контент для авторизованных пользователей */}
        {isAuthenticated && isDriver && (
          <DriverTrips />
        )}

        {/* Список поездок только для пассажиров */}
        {isAuthenticated && isPassenger && (
          <div className="space-y-6">
            {availableTrips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={index}
                passengers={passengers}
                formatDateTime={formatDateTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                onBooking={handleBooking}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}