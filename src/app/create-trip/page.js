'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  Save,
  AlertCircle
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { ridesAPI, routesAPI, vehiclesAPI } from '../../lib/api';
import { Button, Card, CardContent, Alert, LoadingSpinner } from '../../components/ui';

export default function CreateTripPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    route_id: '',
    car_id: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    available_seats: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAllRoutes,
    select: (data) => data?.data || data || [],
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: vehiclesAPI.getMyVehicles,
    select: (data) => data?.data || data || [],
    enabled: isAuthenticated && user?.role === 'driver',
  });

  const createTripMutation = useMutation({
    mutationFn: ridesAPI.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-trips']);
      router.push('/');
    },
    onError: (error) => {
      console.error('Ошибка создания поездки:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.route_id) newErrors.route_id = ['Выберите маршрут'];
    if (!formData.car_id) newErrors.car_id = ['Выберите автомобиль'];
    if (!formData.departure_time) newErrors.departure_time = ['Укажите время отправления'];
    if (!formData.price) newErrors.price = ['Укажите цену'];
    if (!formData.available_seats) newErrors.available_seats = ['Укажите количество мест'];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createTripMutation.mutate({
      ...formData,
      route_id: parseInt(formData.route_id),
      car_id: parseInt(formData.car_id),
      price: parseFloat(formData.price),
      available_seats: parseInt(formData.available_seats)
    });
  };

  if (!isAuthenticated || user?.role !== 'driver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl p-8">
          <CardContent className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Доступ запрещен</h2>
            <p className="text-slate-600 mb-4">Только водители могут создавать поездки</p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Хедер */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 hover:bg-blue-50/80 text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </Button>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Создать поездку
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Маршрут */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Маршрут *
                </label>
                <select
                  name="route_id"
                  value={formData.route_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                >
                  <option value="">Выберите маршрут</option>
                  {routesLoading && <option>Загрузка маршрутов...</option>}
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.from_city} → {route.to_city} ({route.distance_km} км)
                    </option>
                  ))}
                </select>
                {errors.route_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_id[0]}</p>
                )}
              </div>

              {/* Автомобиль */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <Car className="w-4 h-4 mr-2 text-blue-600" />
                  Автомобиль *
                </label>
                <select
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                >
                  <option value="">Выберите автомобиль</option>
                  {vehiclesLoading && <option>Загрузка автомобилей...</option>}
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.plate_number}) - {vehicle.seats} мест
                    </option>
                  ))}
                </select>
                {errors.car_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.car_id[0]}</p>
                )}
                {vehicles.length === 0 && !vehiclesLoading && (
                  <p className="text-amber-600 text-sm mt-1">
                    У вас нет автомобилей. <button type="button" className="underline" onClick={() => router.push('/profile')}>Добавить автомобиль в профиле</button>
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Время отправления */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Время отправления *
                  </label>
                  <input
                    type="datetime-local"
                    name="departure_time"
                    value={formData.departure_time}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  />
                  {errors.departure_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.departure_time[0]}</p>
                  )}
                </div>

                {/* Время прибытия */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Время прибытия
                  </label>
                  <input
                    type="datetime-local"
                    name="arrival_time"
                    value={formData.arrival_time}
                    onChange={handleInputChange}
                    min={formData.departure_time}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  />
                  {errors.arrival_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.arrival_time[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Цена */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                    Цена за место (₽) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    placeholder="1500"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>
                  )}
                </div>

                {/* Доступные места */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    Свободных мест *
                  </label>
                  <input
                    type="number"
                    name="available_seats"
                    value={formData.available_seats}
                    onChange={handleInputChange}
                    min="1"
                    max="8"
                    placeholder="3"
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                  />
                  {errors.available_seats && (
                    <p className="text-red-500 text-sm mt-1">{errors.available_seats[0]}</p>
                  )}
                </div>
              </div>

              {/* Примечания */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Примечания
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Дополнительная информация о поездке..."
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200 resize-none"
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.notes[0]}</p>
                )}
              </div>

              {/* Ошибки */}
              {errors.non_field_errors && (
                <Alert variant="error">
                  {errors.non_field_errors[0]}
                </Alert>
              )}

              {/* Кнопки */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50/80"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={createTripMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {createTripMutation.isPending ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Создаём...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Создать поездку
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
