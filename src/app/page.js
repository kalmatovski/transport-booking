'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Car, MapPin, Calendar, Users, Settings, LogOut, Menu, X, User, BookOpen, UserPlus } from 'lucide-react';

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

  // Загружаем маршруты (доступно для всех)
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: ridesAPI.getRoutes,
    select: (data) => data.data,
  });

  // Загружаем доступных водителей (доступно для всех)
  const { 
    data: availableDrivers = [], 
    isLoading: driversLoading,
    error: driversError 
  } = useQuery({
    queryKey: ['available-drivers', selectedRoute, selectedDate],
    queryFn: () => ridesAPI.getAvailableDrivers(selectedRoute, selectedDate),
    enabled: !!selectedRoute && !!selectedDate,
    select: (data) => data.data,
  });

  const handleLogout = () => {
    logout();
    // Остаемся на главной странице после выхода
  };

  const handleSearchRides = () => {
    if (!selectedRoute || !selectedDate) {
      return;
    }
    // Логика поиска поездок выполняется автоматически через React Query
  };

  const handleBookingClick = (driverId) => {
    if (!isAuthenticated) {
      // Перенаправляем на регистрацию если не авторизован
      router.push('/register');
      return;
    }
    // Если авторизован, переходим к бронированию
    router.push(`/book/${driverId}?route=${selectedRoute}&date=${selectedDate}&passengers=${passengers}`);
  };

  // Получаем текущую дату для min атрибута
  const today = new Date().toISOString().split('T')[0];

  // Навигационные элементы для авторизованных пользователей
  const navigationItems = [
    { 
      label: 'Забронировать поездку', 
      href: '/', 
      icon: Car, 
      active: true 
    },
    { 
      label: 'Мои бронирования', 
      href: '/bookings', 
      icon: BookOpen, 
      active: false 
    },
    { 
      label: 'Панель водителя', 
      href: '/driver', 
      icon: Settings, 
      active: false 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-golden-50 via-warm-orange-50 to-sky-50">
      {/* Хедер */}
      {/* Хедер */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-golden-600" />
              <span className="text-xl font-bold text-gray-900">TransportBook</span>
            </div>

            {/* Навигация для авторизованных */}
            {isAuthenticated && (
              <div className="hidden md:flex space-x-6">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.active
                        ? 'text-golden-600 bg-golden-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Правая часть хедера */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                /* Для авторизованных пользователей */
                <>
                  {/* Десктопная версия */}
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/profile')}
                        className="p-2"
                        title="Профиль"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="p-2"
                        title="Выйти"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Мобильное меню для авторизованных */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2"
                    >
                      {mobileMenuOpen ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Menu className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                /* Для гостей */
                <>
                  {/* Десктопная версия */}
                  <div className="hidden md:flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/login')}
                    >
                      Войти
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push('/register')}
                      className="bg-golden-500 hover:bg-golden-600 text-white"
                    >
                      Регистрация
                    </Button>
                  </div>

                  {/* Мобильная версия для гостей */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2"
                    >
                      {mobileMenuOpen ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Menu className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              {isAuthenticated ? (
                /* Мобильное меню для авторизованных */
                <>
                  {/* Информация о пользователе */}
                  <div className="flex items-center space-x-3 py-2 border-b border-gray-100">
                    <div className="w-10 h-10 bg-golden-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-golden-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                  </div>

                  {/* Навигационные элементы */}
                  {navigationItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        item.active
                          ? 'text-golden-600 bg-golden-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}

                  {/* Кнопки профиля и выхода */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Профиль</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Мобильное меню для гостей */
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      router.push('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Войти</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium bg-golden-500 hover:bg-golden-600 text-white rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Регистрация</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и описание */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-golden-600 via-warm-orange-600 to-golden-700 bg-clip-text text-transparent sm:text-5xl mb-4">
            Забронируйте вашу поездку
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Удобное и надежное бронирование поездок.
            Выбирайте из наших проверенных водителей и современных автомобилей.
          </p>
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-gradient-to-r from-golden-100 to-warm-orange-100 rounded-lg border border-golden-200">
              <p className="text-golden-800 text-sm">
                💡 <strong>Гостевой режим:</strong> Просматривайте поездки без регистрации. 
                Для бронирования нужно <button 
                  onClick={() => router.push('/register')} 
                  className="underline hover:text-golden-900 font-medium"
                >
                  зарегистрироваться
                </button>.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Форма поиска */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-golden-200 shadow-xl">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Найти поездку
                  </h2>
                  <p className="text-sm text-gray-600">
                    Найдите доступные автомобили на вашем маршруте и в нужную дату
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Выбор маршрута */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1 text-golden-600" />
                      Маршрут
                    </label>
                    {routesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        className="w-full px-3 py-2 border border-golden-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Выберите маршрут</option>
                        {routes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.from} — {route.to}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Выбор даты */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1 text-golden-600" />
                      Дата поездки
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      className="w-full px-3 py-2 border border-golden-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Количество пассажиров */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="inline w-4 h-4 mr-1 text-golden-600" />
                      Пассажиры
                    </label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-golden-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-transparent transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'пассажир' : num < 5 ? 'пассажира' : 'пассажиров'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleSearchRides}
                    className="w-full bg-gradient-to-r from-golden-500 to-warm-orange-500 hover:from-golden-600 hover:to-warm-orange-600 text-white shadow-lg"
                    disabled={!selectedRoute || !selectedDate}
                  >
                    Найти поездки
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Результаты поиска */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Доступные автомобили
              </h2>

              {!selectedRoute || !selectedDate ? (
                <Card className="bg-white/80 backdrop-blur-sm border-golden-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-golden-400 to-warm-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-500">
                      Выберите маршрут и дату для поиска доступных автомобилей
                    </p>
                  </CardContent>
                </Card>
              ) : driversLoading ? (
                <Card className="bg-white/80 backdrop-blur-sm border-golden-200">
                  <CardContent className="p-8 text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-500">Ищем доступные автомобили...</p>
                  </CardContent>
                </Card>
              ) : driversError ? (
                <Alert variant="error" className="bg-red-50 border-red-200">
                  Ошибка загрузки данных. Попробуйте еще раз.
                </Alert>
              ) : availableDrivers.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-golden-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-golden-400 to-warm-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-500 mb-2">
                      На выбранную дату нет доступных автомобилей
                    </p>
                    <p className="text-sm text-gray-400">
                      Попробуйте выбрать другую дату
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {availableDrivers.map((driver) => (
                    <Card key={driver.id} className="bg-white/80 backdrop-blur-sm border-golden-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                          <div className="flex space-x-4">
                            {/* Фото автомобиля */}
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-gradient-to-br from-golden-200 to-warm-orange-200 rounded-lg overflow-hidden">
                                {driver.car_photo ? (
                                  <img
                                    src={driver.car_photo}
                                    alt={`${driver.car_model}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-8 h-8 text-golden-600" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Информация о водителе */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900">
                                {driver.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {driver.car_model} • {driver.car_color}
                              </p>
                              <p className="text-sm text-gray-500">
                                Рейтинг: ⭐ {driver.rating || 'Новый водитель'}
                              </p>
                              <p className="text-sm text-golden-600 font-medium">
                                Свободных мест: {driver.available_seats}
                              </p>
                            </div>
                          </div>

                          {/* Кнопка бронирования */}
                          <div className="flex-shrink-0">
                            <Button
                              onClick={() => handleBookingClick(driver.id)}
                              disabled={driver.available_seats < passengers}
                              className={`${
                                driver.available_seats < passengers 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-golden-500 to-warm-orange-500 hover:from-golden-600 hover:to-warm-orange-600 shadow-lg hover:shadow-xl'
                              } text-white transition-all duration-300`}
                            >
                              {driver.available_seats < passengers 
                                ? 'Недостаточно мест' 
                                : isAuthenticated 
                                  ? 'Забронировать'
                                  : 'Зарегистрироваться'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}