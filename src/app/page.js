'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  BookOpen, 
  UserPlus,
  Search,
  Clock,
  Phone,
  MessageCircle,
  Star,
  DollarSign
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { ridesAPI } from '../lib/api';
import { Button, Card, CardContent, Alert, LoadingSpinner } from '../components/ui';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Загружаем доступные поездки с фильтрацией по времени
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
        return departureTime > now; // Только будущие поездки
      });
    },
    enabled: true,
  });

  // Загружаем маршруты (пока хардкод, не критично если не загрузится)
  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: ridesAPI.getRoutes,
    select: (data) => data?.data || [],
    retry: false,
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearch = () => {
    // Просто перезагружаем с новыми параметрами
    refetchTrips();
  };

  const handleBooking = (trip) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Переходим на страницу бронирования
    router.push(`/booking/${trip.id}?passengers=${passengers}`);
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
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
  };

  const getStatusColor = (status) => {
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
  };

  const getStatusText = (status) => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Хедер */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-yellow-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Логотип */}
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-yellow-600" />
              <span className="text-xl font-bold text-gray-900">TransportBook</span>
            </div>

            {/* Навигация */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Привет, {user?.first_name || user?.username || 'Пользователь'}!
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/profile')}
                    className="flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Профиль</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center space-x-1"
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
                    className="flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Войти</span>
                  </Button>
                  <Button
                    onClick={() => router.push('/register')}
                    className="flex items-center space-x-1"
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
            <div className="md:hidden border-t border-gray-200 bg-white py-4">
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Профиль
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
        {/* Форма поиска */}
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Найти поездку
          </h1>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {/* Выбор маршрута */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Маршрут
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">Все маршруты</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Выбор даты */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата отправления
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Количество пассажиров */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пассажиров
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
                className="w-full flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Найти
              </Button>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="space-y-6">
          {tripsLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
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

          {/* Список поездок */}
          <div className="grid gap-6">
            {availableTrips.map((trip) => (
              <Card key={trip.id} className="border-yellow-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* ИСПРАВЛЕНО: Информация о маршруте */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
                      {trip.route?.from_city || 'Неизвестно'} → {trip.route?.to_city || 'Неизвестно'}
                    </h3>
                    {trip.route?.distance_km && (
                      <p className="text-sm text-gray-600 ml-7">Расстояние: {trip.route.distance_km} км</p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    {/* Информация о поездке */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        {/* Время отправления */}
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <div>
                            <span className="font-medium text-gray-900">
                              Отправление
                            </span>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(trip.departure_time)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Время прибытия */}
                        {trip.arrival_time && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="font-medium text-gray-900">
                                Прибытие
                              </span>
                              <p className="text-sm text-gray-600">
                                {formatDateTime(trip.arrival_time)}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Статус */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusText(trip.status)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Водитель */}
                        <div>
                          <p className="text-sm text-gray-600">Водитель</p>
                          <p className="font-medium">Водитель #{trip.driver}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">4.8</span>
                          </div>
                        </div>

                        {/* ИСПРАВЛЕНО: Автомобиль */}
                        <div>
                          <p className="text-sm text-gray-600">Автомобиль</p>
                          <p className="font-medium">
                            {trip.car?.brand || 'Неизвестно'} {trip.car?.model || ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {trip.car?.plate_number || 'Номер не указан'}
                          </p>
                          {trip.car?.color && (
                            <p className="text-xs text-gray-500">
                              Цвет: {trip.car.color}
                            </p>
                          )}
                        </div>

                        {/* Места и цена */}
                        <div>
                          <p className="text-sm text-gray-600">Свободно мест</p>
                          <p className="font-medium flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-500" />
                            {trip.available_seats}
                          </p>
                          <p className="text-lg font-bold text-yellow-600 mt-1">
                            {parseFloat(trip.price).toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>

                      {/* Примечания */}
                      {trip.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{trip.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Действия */}
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2 min-w-[200px]">
                      {/* Контакты - пока скрываем так как нет данных водителя */}
                      <div className="flex space-x-2">
                        <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Phone className="w-4 h-4 mr-1" />
                          <span className="text-sm">Позвонить</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Написать</span>
                        </button>
                      </div>

                      {/* Кнопка бронирования */}
                      <Button
                        onClick={() => handleBooking(trip)}
                        disabled={trip.status !== 'available' || trip.available_seats < passengers}
                        className={`w-full ${
                          trip.status === 'available' && trip.available_seats >= passengers
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {trip.status !== 'available' 
                          ? 'Недоступно'
                          : trip.available_seats < passengers
                          ? 'Мало мест'
                          : 'Забронировать'
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}