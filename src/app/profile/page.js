'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  MessageCircle, 
  Car,
  Calendar,
  Star,
  Upload,
  Check,
  X
} from 'lucide-react';

import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI, ridesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Button, Input, Card, CardContent, CardHeader, Alert, LoadingSpinner } from '../../components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const {user,isAuthenticated, updateUser } = useAuthStore();
  const [profilePhoto, setProfilePhoto] = useState(user?.photo || null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Проверяем авторизацию
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Форма профиля
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      telegram: user?.telegram || '',
    },
  });

  // Загружаем историю поездок
  const { data: userBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: ridesAPI.getMyBookings,
    select: (data) => data.data.slice(0, 5), // Последние 5 поездок
  });

  // Мутация обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data.data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Обработка загрузки фото
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Поддерживаются только файлы JPEG, PNG, HEIC и WebP');
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  // Отправка формы
  const onSubmit = (data) => {
    const formData = {
      ...data,
      photo: photoPreview || profilePhoto,
    };
    updateProfileMutation.mutate(formData);
  };

  // Сброс изменений
  const handleCancelEdit = () => {
    reset();
    setPhotoPreview(null);
    setIsEditing(false);
  };

  // Активация режима редактирования
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-golden-50">
      {/* Хедер */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-golden-200/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-warm-brown-600 hover:text-warm-brown-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Назад к поездкам</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Профиль</h1>
            <div className="w-24"></div> {/* Spacer для центрирования заголовка */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Уведомление об успешном сохранении */}
        {saveSuccess && (
          <Alert variant="success" className="mb-6 bg-green-50 border-green-200">
            <Check className="w-4 h-4" />
            <span>Профиль успешно обновлен!</span>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-golden-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-golden-400 to-warm-orange-400 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Личная информация</h2>
                  {!isEditing && (
                    <Button
                      onClick={handleStartEdit}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      Редактировать
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Фото профиля */}
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-golden-400 to-warm-orange-400 flex items-center justify-center">
                          {photoPreview || profilePhoto ? (
                            <img
                              src={photoPreview || profilePhoto}
                              alt="Фото профиля"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-white" />
                          )}
                        </div>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-golden-500 hover:bg-golden-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/heic,image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Имя */}
                      <div>
                        <Input
                          label="Имя"
                          disabled={!isEditing}
                          error={errors.name?.message}
                          className={!isEditing ? 'bg-gray-50' : ''}
                          {...register('name')}
                        />
                      </div>

                      {/* Телефон (только для чтения) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline w-4 h-4 mr-1" />
                          Номер телефона
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                          {user?.phone}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Номер телефона нельзя изменить
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <Input
                    label="Email"
                    type="email"
                    disabled={!isEditing}
                    error={errors.email?.message}
                    helperText="Для восстановления доступа к аккаунту"
                    className={!isEditing ? 'bg-gray-50' : ''}
                    {...register('email')}
                  />

                  {/* Telegram */}
                  <Input
                    label="Telegram"
                    placeholder="@username"
                    disabled={!isEditing}
                    error={errors.telegram?.message}
                    helperText="Для быстрой связи с водителем"
                    className={!isEditing ? 'bg-gray-50' : ''}
                    {...register('telegram')}
                  />

                  {/* Кнопки управления */}
                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="submit"
                        loading={updateProfileMutation.isPending}
                        disabled={!isDirty && !photoPreview}
                        className="bg-gradient-to-r from-golden-500 to-warm-orange-500 hover:from-golden-600 hover:to-warm-orange-600"
                      >
                        Сохранить изменения
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateProfileMutation.isPending}
                      >
                        Отмена
                      </Button>
                    </div>
                  )}

                  {/* Ошибка сохранения */}
                  {updateProfileMutation.error && (
                    <Alert variant="error">
                      {updateProfileMutation.error.response?.data?.message || 
                       'Произошла ошибка при сохранении профиля'}
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статистика */}
            <Card className="bg-white/70 backdrop-blur-sm border-sky-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-sky-400 to-sky-500 text-white">
                <h3 className="text-lg font-semibold">Статистика</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Поездок совершено</span>
                    <span className="font-semibold text-gray-900">
                      {userBookings.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Средний рейтинг</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {user?.rating ? user.rating.toFixed(1) : 'Новый'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Дата регистрации</span>
                    <span className="font-semibold text-gray-900">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('ru-RU')
                        : 'Недавно'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Последние поездки */}
            <Card className="bg-white/70 backdrop-blur-sm border-warm-pink-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-warm-pink-400 to-warm-pink-500 text-white">
                <h3 className="text-lg font-semibold">Последние поездки</h3>
              </CardHeader>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : userBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm">
                      У вас пока нет поездок
                    </p>
                    <Button
                      onClick={() => router.push('/')}
                      size="sm"
                      className="mt-3 bg-gradient-to-r from-golden-500 to-warm-orange-500"
                    >
                      Забронировать поездку
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-3 bg-gradient-to-r from-gray-50 to-warm-pink-50 rounded-lg border border-warm-pink-200/30 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {booking.route_name || 'Красноярск — Абакан'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Подтверждено' :
                             booking.status === 'pending' ? 'Ожидание' : 'Отменено'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {booking.date 
                                ? new Date(booking.date).toLocaleDateString('ru-RU')
                                : 'Дата уточняется'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{booking.driver_name || 'Водитель'}</span>
                          </div>
                        </div>
                        
                        {booking.passengers && (
                          <div className="mt-2 text-xs text-gray-500">
                            Пассажиров: {booking.passengers}
                          </div>
                        )}
                        
                        {booking.rating && (
                          <div className="mt-2 flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              Ваша оценка: {booking.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {userBookings.length >= 5 && (
                      <Button
                        onClick={() => router.push('/bookings')}
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                      >
                        Посмотреть все поездки
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Дополнительные действия */}
            <Card className="bg-white/70 backdrop-blur-sm border-warm-brown-200/50 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/bookings')}
                    variant="outline"
                    className="w-full justify-start border-warm-brown-300 hover:bg-warm-brown-50"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Мои бронирования
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/driver')}
                    variant="outline"
                    className="w-full justify-start border-warm-brown-300 hover:bg-warm-brown-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Стать водителем
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/support')}
                    variant="outline"
                    className="w-full justify-start border-warm-brown-300 hover:bg-warm-brown-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Поддержка
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Информация о безопасности */}
        <Card className="mt-8 bg-white/70 backdrop-blur-sm border-sky-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-sky-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Безопасность аккаунта
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ваши данные защищены. Мы не передаем личную информацию третьим лицам 
                  и используем современные технологии шифрования.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    ✓ Верифицированный телефон
                  </span>
                  {user?.email && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      ✓ Email подтвержден
                    </span>
                  )}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    ✓ Безопасное соединение
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}