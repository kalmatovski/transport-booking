'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Save,
  AlertCircle,
  Upload
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { vehiclesAPI } from '../../lib/api';
import { Button, Card, CardContent, Alert, LoadingSpinner } from '../../components/ui';

export default function VehiclesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: '',
    seats: '',
    plate_number: '',
    vehicle_image: null
  });
  const [errors, setErrors] = useState({});

  // Загружаем автомобили
  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: vehiclesAPI.getMyVehicles,
    select: (data) => data?.data || data || [],
    enabled: isAuthenticated && user?.role === 'driver',
  });

  // Мутация для создания автомобиля
  const createVehicleMutation = useMutation({
    mutationFn: vehiclesAPI.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-vehicles']);
      setShowForm(false);
      setFormData({
        brand: '',
        model: '',
        color: '',
        seats: '',
        plate_number: '',
        vehicle_image: null
      });
      setErrors({});
    },
    onError: (error) => {
      console.error('Ошибка создания автомобиля:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  });

  // Мутация для удаления автомобиля
  const deleteVehicleMutation = useMutation({
    mutationFn: vehiclesAPI.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-vehicles']);
    },
    onError: (error) => {
      console.error('Ошибка удаления автомобиля:', error);
    }
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'vehicle_image') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Очищаем ошибку для этого поля
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

    // Валидация
    const newErrors = {};
    if (!formData.brand) newErrors.brand = ['Укажите марку'];
    if (!formData.model) newErrors.model = ['Укажите модель'];
    if (!formData.color) newErrors.color = ['Укажите цвет'];
    if (!formData.seats) newErrors.seats = ['Укажите количество мест'];
    if (!formData.plate_number) newErrors.plate_number = ['Укажите номер'];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Отправляем данные
    const vehicleData = {
      ...formData,
      seats: parseInt(formData.seats)
    };

    createVehicleMutation.mutate(vehicleData);
  };

  const handleDelete = (vehicleId) => {
    if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      deleteVehicleMutation.mutate(vehicleId);
    }
  };

  // Проверяем права доступа
  if (!isAuthenticated || user?.role !== 'driver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl p-8">
          <CardContent className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Доступ запрещен</h2>
            <p className="text-slate-600 mb-4">Только водители могут управлять автомобилями</p>
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
                Мои автомобили
              </h1>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить автомобиль
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Форма добавления автомобиля */}
        {showForm && (
          <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Добавить новый автомобиль</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Марка */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Марка *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Toyota"
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                    />
                    {errors.brand && (
                      <p className="text-red-500 text-sm mt-1">{errors.brand[0]}</p>
                    )}
                  </div>

                  {/* Модель */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Модель *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Camry"
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                    />
                    {errors.model && (
                      <p className="text-red-500 text-sm mt-1">{errors.model[0]}</p>
                    )}
                  </div>

                  {/* Цвет */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Цвет *
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Белый"
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                    />
                    {errors.color && (
                      <p className="text-red-500 text-sm mt-1">{errors.color[0]}</p>
                    )}
                  </div>

                  {/* Количество мест */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Количество мест *
                    </label>
                    <select
                      name="seats"
                      value={formData.seats}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                    >
                      <option value="">Выберите количество мест</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} мест</option>
                      ))}
                    </select>
                    {errors.seats && (
                      <p className="text-red-500 text-sm mt-1">{errors.seats[0]}</p>
                    )}
                  </div>

                  {/* Номер */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Номер автомобиля *
                    </label>
                    <input
                      type="text"
                      name="plate_number"
                      value={formData.plate_number}
                      onChange={handleInputChange}
                      placeholder="А123БВ24"
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                    />
                    {errors.plate_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.plate_number[0]}</p>
                    )}
                  </div>

                  {/* Фото */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Фото автомобиля
                    </label>
                    <input
                      type="file"
                      name="vehicle_image"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                    />
                    {errors.vehicle_image && (
                      <p className="text-red-500 text-sm mt-1">{errors.vehicle_image[0]}</p>
                    )}
                  </div>
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
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        brand: '',
                        model: '',
                        color: '',
                        seats: '',
                        plate_number: '',
                        vehicle_image: null
                      });
                      setErrors({});
                    }}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50/80"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={createVehicleMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {createVehicleMutation.isPending ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                        Добавляем...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Добавить автомобиль
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Список автомобилей */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-20 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="error">
            Ошибка загрузки автомобилей: {error.message}
          </Alert>
        ) : vehicles.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl">
            <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Нет автомобилей</h3>
              <p className="text-slate-600 mb-4">Добавьте свой первый автомобиль для создания поездок</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить автомобиль
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-200">
                <CardContent className="p-6">
                  {/* Фото автомобиля */}
                  {vehicle.vehicle_image && (
                    <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden">
                      <img 
                        src={vehicle.vehicle_image} 
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Информация об автомобиле */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-800">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Цвет:</span>
                        <span className="ml-2 text-slate-700">{vehicle.color}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Мест:</span>
                        <span className="ml-2 text-slate-700">{vehicle.seats}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="text-slate-500 text-sm">Номер:</span>
                      <span className="ml-2 font-mono font-bold text-slate-800">{vehicle.plate_number}</span>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex space-x-2 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50/80"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={deleteVehicleMutation.isPending}
                      className="border-red-300 text-red-700 hover:bg-red-50/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
