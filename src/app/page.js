'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Car, MapPin, Calendar, Users, Star, Phone, MessageCircle, Settings } from 'lucide-react';

import { ridesAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Card, CardContent, LoadingSpinner, Alert } from '../components/ui';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  
  // Состояние для формы поиска
  const [searchForm, setSearchForm] = useState({
    routeId: '',
    date: '',
    passengers: 1,
  });

  // Получаем список маршрутов
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: ridesAPI.getRoutes,
    select: (data) => data.data,
  });

  // Получаем доступных водителей
  const { data: drivers, isLoading: driversLoading, error: driversError } = useQuery({
    queryKey: ['available-drivers', searchForm.routeId, searchForm.date],
    queryFn: () => ridesAPI.getAvailableDrivers(searchForm.routeId, searchForm.date),
    enabled: !!(searchForm.routeId && searchForm.date),
    select: (data) => data.data,
  });

  const handleSearch = () => {
    // Поиск выполняется автоматически через React Query
  };

  const handleBookRide = (driverId) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Переход к странице бронирования с параметрами
    const params = new URLSearchParams({
      routeId: searchForm.routeId,
      driverId: driverId.toString(),
      date: searchForm.date,
      passengers: searchForm.passengers.toString(),
    });
    
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TransportBook</span>
            </div>

            {/* Навигация */}
            <nav className="hidden md:flex space-x-8">
              <button className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
                Забронировать
              </button>
              <Link href="/my-bookings" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Мои поездки
              </Link>
              <Link href="/drivers" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Водители
              </Link>
              <button className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                <Settings className="w-4 h-4 mr-1" />
                Админ
              </button>
            </nav>

            {/* Пользователь */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user?.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Выйти
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Войти</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Регистрация</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и описание */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Забронируйте свою поездку
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Удобное и надежное сообщение между Красноярском и Абаканом. 
            Выберите из проверенных водителей и современных автомобилей.
          </p>
        </div>

        {/* Форма поиска */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Найдите свою поездку
            </h2>
            <p className="text-gray-600 mb-6">
              Выберите маршрут, дату и количество пассажиров для поиска доступных автомобилей
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Маршрут */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Маршрут
                </label>
                <select
                  value={searchForm.routeId}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, routeId: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите маршрут</option>
                  {routes?.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.from} → {route.to}
                    </option>
                  ))}
                </select>
              </div>

              {/* Дата */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата
                </label>
                <input
                  type="date"
                  value={searchForm.date}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Пассажиры */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пассажиры
                </label>
                <select
                  value={searchForm.passengers}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'пассажир' : num < 5 ? 'пассажира' : 'пассажиров'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Кнопка поиска */}
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full"
                  disabled={!searchForm.routeId || !searchForm.date}
                >
                  Найти поездки
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Результаты поиска */}
        {searchForm.routeId && searchForm.date && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Доступные автомобили
            </h3>

            {driversLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {driversError && (
              <Alert variant="error" className="mb-4">
                Ошибка при загрузке данных. Попробуйте еще раз.
              </Alert>
            )}

            {drivers && drivers.length === 0 && (
              <Alert variant="info">
                На выбранную дату нет доступных автомобилей. Попробуйте другую дату.
              </Alert>
            )}

            {drivers && drivers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((driver) => (
                  <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Фото автомобиля */}
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <img
                          src={driver.car_photo || '/placeholder-car.jpg'}
                          alt={`Автомобиль ${driver.name}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>

                      {/* Информация о водителе */}
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {driver.name}
                        </h4>
                        
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {driver.rating ? `${driver.rating} (${driver.reviews_count} отзывов)` : 'Новый водитель'}
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            Свободных мест: {driver.available_seats}
                          </span>
                        </div>

                        <div className="flex items-center mb-4">
                          <Car className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {driver.car_model}
                          </span>
                        </div>
                      </div>

                      {/* Контакты */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${driver.phone}`)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Позвонить
                          </Button>
                          {driver.telegram && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(driver.telegram)}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Telegram
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Кнопка бронирования */}
                      <Button
                        className="w-full"
                        onClick={() => handleBookRide(driver.id)}
                        disabled={driver.available_seats < searchForm.passengers}
                      >
                        {driver.available_seats < searchForm.passengers 
                          ? 'Недостаточно мест' 
                          : 'Забронировать'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}