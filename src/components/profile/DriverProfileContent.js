// src/components/profile/DriverProfileContent.js (УПРОЩЕННАЯ ВЕРСИЯ)
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Car, Save, Loader2, Calendar, Star, MapPin } from 'lucide-react';

import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI, vehiclesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

// Используем те же переиспользуемые компоненты
import { LoadingState, ErrorState, ProfileHeader, NotificationBanner } from './ProfileStates';
import VehicleFormSection from './VehicleFormSection';

function DriverProfileContent() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  // Состояния (упрощено)
  const [profileData, setProfileData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [carPhoto, setCarPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCarPhoto, setUploadingCarPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Формы (только для профиля)
  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
  });

  // Загрузка данных
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Сначала загружаем профиль
      const profileResponse = await authAPI.getProfile();
      
      setProfileData(profileResponse.data);
      setProfilePhoto(profileResponse.data.avatar ? `http://127.0.0.1:8000${profileResponse.data.avatar}` : null);
      profileForm.reset(profileResponse.data);
      
      // Затем загружаем автомобили
      try {
        // Используем новый API метод для получения автомобилей водителя
        const vehiclesResponse = await vehiclesAPI.getMyVehicles();
        const myVehicles = vehiclesResponse.data;
        
        // Берем первый автомобиль (если есть)
        const myVehicle = myVehicles && myVehicles.length > 0 ? myVehicles[0] : null;
        
        if (myVehicle) {
          setVehicleData(myVehicle);
          // ИСПРАВЛЕНИЕ: vehicle_image уже содержит полный URL
          setCarPhoto(myVehicle.vehicle_image || null);
        }
      } catch (vehicleError) {
        console.log('🚨 Vehicles API error:', vehicleError);
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение профиля
  const onSubmitProfile = async (data) => {
    try {
      setSaving(true);
      setError(null);
      const response = await authAPI.updateProfile(data);
      setProfileData(response.data);
      updateUser(response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  // Сохранение данных автомобиля - обновлено для VehicleFormSection
  const handleVehicleSave = async (data) => {
    try {
      setSavingVehicle(true);
      setError(null);
      
      // Добавляем is_active: true при создании/обновлении
      const vehicleDataWithActiveFlag = {
        ...data,
        is_active: true  // 🔧 ИСПРАВЛЕНИЕ: всегда активная машина
      };
      
      const response = vehicleData 
        ? await vehiclesAPI.updateVehicle(vehicleData.id, vehicleDataWithActiveFlag)
        : await vehiclesAPI.createVehicle(vehicleDataWithActiveFlag);
        
      setVehicleData(response.data);
      
      // Перезагружаем профиль для получения актуальных данных
      await loadProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка сохранения автомобиля');
    } finally {
      setSavingVehicle(false);
    }
  };

  // Загрузка фото профиля  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      
      // Проверки файла
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }

      // Показываем превью сразу
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhoto(e.target.result);
      reader.readAsDataURL(file);

      const response = await authAPI.updateAvatar(file);
      
      // Перезагружаем профиль для получения актуального URL аватара
      await loadProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Ошибка загрузки фото профиля');
      // Возвращаем старое фото при ошибке
      if (profileData?.avatar) {
        setProfilePhoto(`http://127.0.0.1:8000${profileData.avatar}`);
      } else {
        setProfilePhoto(null);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Загрузка фото автомобиля - обновлено для VehicleFormSection
  const handleVehiclePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCarPhoto(true);
      
      // Проверки файла
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }

      // Если машина уже существует - загружаем фото через API
      if (vehicleData?.id) {
        const response = await vehiclesAPI.updateVehiclePhoto(vehicleData.id, file);
        console.log('Photo upload response:', response.data);
        
        const photoUrl = response.data.vehicle_image;
        if (photoUrl) {
          const fullPhotoUrl = photoUrl.startsWith('http') 
            ? photoUrl 
            : `http://127.0.0.1:8000${photoUrl}`;
          setCarPhoto(fullPhotoUrl);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        // Если машины нет - показываем предварительный просмотр
        const reader = new FileReader();
        reader.onload = (e) => setCarPhoto(e.target.result);
        reader.readAsDataURL(file);
      }
      
    } catch (err) {
      setError('Ошибка загрузки фото автомобиля');
      console.error('Car photo upload error:', err);
    } finally {
      setUploadingCarPhoto(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Удаление автомобиля - обновлено для VehicleFormSection
  const handleVehicleDelete = async () => {
    if (!vehicleData) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить автомобиль ${vehicleData.brand} ${vehicleData.model}? Это действие нельзя отменить.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingVehicle(true);
      setError(null);
      
      await vehiclesAPI.deleteVehicle(vehicleData.id);
      console.log('✅ Vehicle deleted successfully');
      
      // Очищаем данные автомобиля
      setVehicleData(null);
      setCarPhoto(null);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      setError(err.response?.data?.detail || err.message || 'Ошибка при удалении автомобиля');
    } finally {
      setDeletingVehicle(false);
    }
  };

  // Используем переиспользуемые компоненты с зеленой цветовой схемой
  if (loading) {
    return <LoadingState colorScheme="green" message="Загружаем профиль водителя..." />;
  }

  if (error && !profileData) {
    return (
      <ErrorState 
        colorScheme="green"
        title="Ошибка загрузки профиля"
        error={error}
        onRetry={loadProfile}
        onGoHome={() => router.push('/')}
      />
    );
  }

  return (
    <>
      {/* Используем переиспользуемый хедер с зеленой схемой */}
      <ProfileHeader 
        colorScheme="green"
        title="Профиль водителя"
        onBack={() => router.push('/')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Уведомления */}
        {saveSuccess && (
          <NotificationBanner 
            type="success" 
            message="Профиль успешно обновлен!"
            onClose={() => setSaveSuccess(false)}
          />
        )}

        {error && (
          <NotificationBanner 
            type="error" 
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Форма профиля водителя */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <p className="text-white/80 text-sm">Ваши персональные данные</p>
              </div>
              
              <div className="p-6">
                {/* Аватар профиля */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Профиль" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {profileData?.first_name?.[0] || profileData?.username?.[0] || 'В'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-1 -right-1 h-7 w-7 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
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
                    <h3 className="text-lg font-medium text-gray-900">
                      {profileData?.first_name && profileData?.last_name 
                        ? `${profileData.first_name} ${profileData.last_name}`
                        : profileData?.username || 'Имя не указано'
                      }
                    </h3>
                    <p className="text-sm text-gray-600">{profileData?.phone || 'Телефон не указан'}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Водитель
                    </span>
                  </div>
                </div>

                {/* Упрощенная форма профиля */}
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                  {/* Имя */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Имя *</label>
                    <input
                      placeholder="Введите ваше имя"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${profileForm.formState.errors.first_name ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                      {...profileForm.register('first_name')}
                    />
                    {profileForm.formState.errors.first_name && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.first_name.message}</p>
                    )}
                  </div>

                  {/* Фамилия */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Фамилия *</label>
                    <input
                      placeholder="Введите вашу фамилию"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${profileForm.formState.errors.last_name ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                      {...profileForm.register('last_name')}
                    />
                    {profileForm.formState.errors.last_name && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.last_name.message}</p>
                    )}
                  </div>

                  {/* Телефон */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Телефон</label>
                    <input
                      type="tel"
                      placeholder="+7XXXXXXXXXX"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${profileForm.formState.errors.phone ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                      {...profileForm.register('phone')}
                    />
                    {profileForm.formState.errors.phone && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${profileForm.formState.errors.email ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                      {...profileForm.register('email')}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Кнопка сохранения профиля */}
                  <button
                    type="submit"
                    disabled={!profileForm.formState.isDirty || saving}
                    className={`w-full h-10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${profileForm.formState.isDirty ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg' : 'bg-green-100 text-green-600 cursor-not-allowed'} disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {profileForm.formState.isDirty ? 'Сохранить профиль' : 'Нет изменений'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Улучшенная форма автомобиля */}
            <VehicleFormSection
              vehicleData={vehicleData}
              onSave={handleVehicleSave}
              onDelete={handleVehicleDelete}
              onPhotoUpload={handleVehiclePhotoUpload}
              saving={savingVehicle}
              deleting={deletingVehicle}
              uploadingPhoto={uploadingCarPhoto}
              carPhoto={carPhoto}
            />
          </div>

          {/* Боковая панель (упрощена) */}
          <div className="space-y-6">
            {/* Статистика водителя */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Статистика
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Поездок:</span>
                  <span className="font-medium">{profileData?.trips_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Рейтинг:</span>
                  <span className="font-medium flex items-center">
                    {profileData?.rating || 'Новичок'}
                    {profileData?.rating && <Star className="w-4 h-4 ml-1 text-yellow-500" />}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className="font-medium text-green-600">Активен</span>
                </div>
              </div>
            </div>

            {/* Маршруты */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Мои маршруты
              </h3>
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">Маршруты назначает администратор</p>
                <p className="text-gray-500 text-xs mt-1">Обратитесь к админу для добавления маршрутов</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DriverProfileContent;