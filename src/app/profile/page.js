'use client';

import { useState, useRef, useEffect } from 'react';
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
  Star,
  Check,
  Save,
  Loader2
} from 'lucide-react';

import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI, ridesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import Image from 'next/image';

function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [profilePhoto, setProfilePhoto] = useState(user?.photo || null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Проверяем авторизацию
useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login');  // Редирект на страницу логина, если пользователь не авторизован
  }
}, [isAuthenticated, router])

  // Форма профиля - всегда активная
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
    },
  });

  // Загружаем историю поездок
  const { data: userBookings = [] } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: ridesAPI.getMyBookings,
    select: (data) => data.data.slice(0, 5),
  });

  // Мутация обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Простая обработка загрузки фото
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhoto(e.target.result);
      // Автоматически сохраняем фото
      updateProfileMutation.mutate({
        name: watch('name'),
        email: watch('email'),
        telegram: watch('telegram'),
        photo: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Отправка формы
  const onSubmit = (data) => {
    updateProfileMutation.mutate({
      ...data,
      photo: profilePhoto,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
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
            
            <h1 className="text-lg font-semibold text-gray-900">Мой профиль</h1>
            <div className="w-32"></div> {/* Spacer */}
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
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <p className="text-white/80 text-sm">Управляйте своими данными</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Фото профиля */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                        {profilePhoto ? (
                          <Image 
  src={profilePhoto} 
  alt="Фото профиля" 
  width={96}
  height={96}
  className="object-cover"
  priority
/>
                        ) : (
                          <User className="h-12 w-12 text-white" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 h-8 w-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                      <p className="text-sm text-gray-600">{user?.phone}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Активный
                      </span>
                    </div>
                  </div>

                  {/* Поля формы */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Имя *</label>
                    <input
                      placeholder="Введите ваше имя"
                      className={`
                        block w-full px-3 py-2 border rounded-lg shadow-sm
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        ${errors.name ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}
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
                        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        ${errors.email ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}
                      `}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                    <p className="text-sm text-gray-500">Для восстановления доступа</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Telegram</label>
                    <input
                      placeholder="@username"
                      className={`
                        block w-full px-3 py-2 border rounded-lg shadow-sm
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                        ${errors.telegram ? 'border-red-300' : 'border-gray-300 hover:border-yellow-300'}
                      `}
                      {...register('telegram')}
                    />
                    {errors.telegram && (
                      <p className="text-sm text-red-600">{errors.telegram.message}</p>
                    )}
                  </div>

                  {/* ЖЕЛТАЯ КНОПКА СОХРАНЕНИЯ */}
                  <button
                    type="submit"
                    disabled={!isDirty || updateProfileMutation.isPending}
                    className={`
                      w-full h-10 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 flex items-center justify-center
                      ${isDirty 
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white shadow-lg' 
                        : 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                      }
                      disabled:opacity-50
                      focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
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
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статистика */}
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Статистика
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Поездок</span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {userBookings.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Рейтинг</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {user?.rating || '4.8'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Контактная информация */}
            <div className="bg-white rounded-xl border border-yellow-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-amber-600" />
                  Контакты
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-gray-800">{user?.phone}</span>
                  </div>
                  {user?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-800">{user?.email}</span>
                    </div>
                  )}
                  {user?.telegram && (
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-800">{user?.telegram}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;