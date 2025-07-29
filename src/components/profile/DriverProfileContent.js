'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Camera, 
  Car, 
  Phone, 
  Mail, 
  MessageCircle, 
  Star,
  Check,
  Save,
  Loader2,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Clock
} from 'lucide-react';
import Image from 'next/image';

import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI, ridesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

function DriverProfileContent() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [carPhoto, setCarPhoto] = useState(user?.car_photo || null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Форма профиля водителя
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      telegram: user?.telegram || '',
      car_model: user?.car_model || '',
      car_number: user?.car_number || '',
    },
  });

  // Загружаем статистику водителя (безопасно)
  const { data: driverStats = {} } = useQuery({
    queryKey: ['driver-stats'],
    queryFn: () => ridesAPI.getDriverStats?.() || Promise.resolve({}),
    select: (data) => data?.data || {},
    enabled: false, // Отключаем пока нет endpoint
    retry: false,
  });

  // Мутация обновления профиля водителя
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Обработка загрузки фото машины
  const handleCarPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCarPhoto(e.target.result);
      updateProfileMutation.mutate({
        name: watch('name'),
        email: watch('email'),
        telegram: watch('telegram'),
        car_model: watch('car_model'),
        car_number: watch('car_number'),
        car_photo: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Отправка формы
  const onSubmit = (data) => {
    updateProfileMutation.mutate({
      ...data,
      car_photo: carPhoto,
    });
  };

  return (
    <>
      {/* Хедер */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-yellow-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-3 py-2 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Назад к поездкам</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Профиль водителя</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Уведомление об успешном сохранении */}
        {saveSuccess && (
          <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50 text-green-800 flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Профиль успешно обновлен!</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                <h2 className="text-xl font-semibold">Информация о водителе</h2>
                <p className="text-white/80 text-sm">Управляйте своими данными и автомобилем</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Фото автомобиля */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        {carPhoto ? (
                          <Image 
                            src={carPhoto} 
                            alt="Фото автомобиля" 
                            width={96}
                            height={96}
                            className="object-cover"
                            priority
                          />
                        ) : (
                          <Car className="h-12 w-12 text-white" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCarPhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user?.name || 'Имя не указано'}</h3>
                      <p className="text-sm text-gray-600">{user?.car_model || 'Модель авто не указана'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Водитель
                        </span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          На линии
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Личные данные */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Имя *</label>
                      <input
                        placeholder="Введите ваше имя"
                        className={`
                          block w-full px-3 py-2 border rounded-lg shadow-sm
                          transition-all duration-200 placeholder:text-gray-400
                          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                          ${errors.name ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                        `}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        placeholder="example@mail.com"
                        className={`
                          block w-full px-3 py-2 border rounded-lg shadow-sm
                          transition-all duration-200 placeholder:text-gray-400
                          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                          ${errors.email ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                        `}
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Данные автомобиля */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Car className="w-5 h-5 mr-2 text-green-600" />
                      Информация об автомобиле
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Модель автомобиля</label>
                        <input
                          placeholder="Toyota Camry"
                          className={`
                            block w-full px-3 py-2 border rounded-lg shadow-sm
                            transition-all duration-200 placeholder:text-gray-400
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            border-gray-300 hover:border-green-300
                          `}
                          {...register('car_model')}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Госномер</label>
                        <input
                          placeholder="А123БВ77"
                          className={`
                            block w-full px-3 py-2 border rounded-lg shadow-sm
                            transition-all duration-200 placeholder:text-gray-400
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            border-gray-300 hover:border-green-300
                          `}
                          {...register('car_number')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Telegram</label>
                    <input
                      placeholder="@username"
                      className={`
                        block w-full px-3 py-2 border rounded-lg shadow-sm
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        ${errors.telegram ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                      `}
                      {...register('telegram')}
                    />
                    {errors.telegram && (
                      <p className="text-sm text-red-600">{errors.telegram.message}</p>
                    )}
                  </div>

                  {/* Зеленая кнопка для водителя */}
                  <button
                    type="submit"
                    disabled={!isDirty || updateProfileMutation.isPending}
                    className={`
                      w-full h-10 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 flex items-center justify-center
                      ${isDirty 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg' 
                        : 'bg-green-100 text-green-600 cursor-not-allowed'
                      }
                      disabled:opacity-50
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    `}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isDirty ? 'Сохранить изменения' : 'Нет изменений'}
                      </>
                    )}
                  </button>

                  {/* Ошибка сохранения */}
                  {updateProfileMutation.error && (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
                      {updateProfileMutation.error.message || 'Произошла ошибка при сохранении профиля'}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Статистика доходов */}
            <div className="mt-8 bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-100 border-b border-green-200">
                <h3 className="text-lg font-semibold text-green-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Доходы и статистика
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {driverStats.total_earnings || '0'} ₽
                    </div>
                    <p className="text-sm text-gray-600">Всего заработано</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {driverStats.trips_this_month || '0'}
                    </div>
                    <p className="text-sm text-gray-600">Поездок в месяце</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {driverStats.rating || '5.0'}
                    </div>
                    <p className="text-sm text-gray-600">Средний рейтинг</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Боковая панель для водителя */}
          <div className="space-y-6">
            {/* Статус и доступность */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-500" />
                  Статус
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Статус</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      На линии
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Свободных мест</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {user?.available_seats || '4'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Рейтинг</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-green-500 fill-current" />
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {user?.rating || '4.9'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Изменить статус
                </button>
              </div>
            </div>

            {/* Контактная информация */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                  Контакты
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-800">{user?.phone || 'Не указан'}</span>
                  </div>
                  {user?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-800">{user?.email}</span>
                    </div>
                  )}
                  {user?.telegram && (
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-800">{user?.telegram}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Быстрые действия</h3>
              </div>
              <div className="p-6 space-y-3">
                <button 
                  onClick={() => router.push('/driver/trips')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Мои поездки
                </button>
                <button 
                  onClick={() => router.push('/driver/earnings')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  История доходов
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                  <Star className="w-4 h-4 mr-2" />
                  Отзывы пассажиров
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DriverProfileContent;