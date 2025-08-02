'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Clock,
  User
} from 'lucide-react';

import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI, vehicleAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

function DriverProfileContent() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  // Состояния
  const [profileData, setProfileData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [carPhoto, setCarPhoto] = useState(null);
  const [selectedCarFile, setSelectedCarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Форма для профиля
  const {
    register: registerProfile,
    formState: { errors: profileErrors, isDirty: profileIsDirty },
    watch: watchProfile,
    reset: resetProfile
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  // Форма для автомобиля
  const {
    register: registerVehicle,
    formState: { errors: vehicleErrors, isDirty: vehicleIsDirty },
    watch: watchVehicle,
    reset: resetVehicle
  } = useForm({
    defaultValues: {
      brand: '',
      model: '',
      color: '',
      seats: '',
      plate_number: '',
    },
  });

  // Загружаем профиль при монтировании
  useEffect(() => {
    loadProfile();
  }, []);

  // Загрузка профиля
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем профиль пользователя
      const profileResponse = await authAPI.getProfile();
      const userData = profileResponse.data;
      
      setProfileData(userData);
      updateUser(userData);
      
      // Устанавливаем аватар профиля
      if (userData.avatar) {
        setProfilePhoto(`http://127.0.0.1:8000${userData.avatar}`);
      } else {
        setProfilePhoto(null);
      }
      
      // Заполняем форму профиля
      resetProfile({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });

      // Загружаем данные автомобиля
      try {
        const vehicleResponse = await vehicleAPI.getMyVehicle();
        const vehicleData = vehicleResponse.data;
        
        if (vehicleData) {
          setVehicleData(vehicleData);
          console.log('Vehicle data loaded:', vehicleData);
          
          resetVehicle({
            brand: vehicleData.brand || '',
            model: vehicleData.model || '',
            color: vehicleData.color || '',
            seats: vehicleData.seats || '',
            plate_number: vehicleData.plate_number || '',
          });
          
          if (vehicleData.vehicle_image) {
            setCarPhoto(`http://127.0.0.1:8000${vehicleData.vehicle_image}`);
          }
        } else {
          console.log('No vehicle found - driver can add one');
          setVehicleData(null);
          setCarPhoto(null);
        }
        
      } catch (vehicleError) {
        console.error('Error loading vehicles:', vehicleError);
        setError('Не удалось загрузить данные автомобилей');
      }
      
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  // Обновление профиля
  const updateProfile = async (data) => {
    try {
      setSaving(true);
      setError(null);
      
      await authAPI.updateProfile(data);
      
      const response = await authAPI.getProfile();
      const newData = response.data;
      
      setProfileData(newData);
      updateUser(newData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  // Обновление автомобиля
  const updateVehicle = async (data) => {
    try {
      setSavingVehicle(true);
      setError(null);
      
      const vehicleDataWithPhoto = { ...data };
      
      if (vehicleData) {
        if (selectedCarFile) {
          vehicleDataWithPhoto.vehicle_image = selectedCarFile;
        }
        await vehicleAPI.updateVehicle(vehicleData.id, vehicleDataWithPhoto);
      } else {
        if (selectedCarFile) {
          vehicleDataWithPhoto.vehicle_image = selectedCarFile;
        }
        await vehicleAPI.createVehicle(vehicleDataWithPhoto);
      }
      
      setSelectedCarFile(null);
      await loadProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to update vehicle:', err);
      setError(err.message || 'Ошибка сохранения данных автомобиля');
    } finally {
      setSavingVehicle(false);
    }
  };

  // Загрузка аватара
  const uploadAvatar = async (file) => {
    try {
      setUploadingAvatar(true);
      setError(null);
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }
      
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhoto(e.target.result);
      reader.readAsDataURL(file);
      
      await authAPI.updateAvatar(file);
      await loadProfile();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err.message || 'Ошибка загрузки аватара');
      if (profileData?.avatar) {
        setProfilePhoto(`http://127.0.0.1:8000${profileData.avatar}`);
      } else {
        setProfilePhoto(null);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Удаление автомобиля
  const deleteVehicle = async () => {
    if (!vehicleData) return;
    
    const confirmed = window.confirm('Вы уверены, что хотите удалить автомобиль? Это действие нельзя отменить.');
    if (!confirmed) return;

    try {
      setDeletingVehicle(true);
      setError(null);
      
      await vehicleAPI.deleteVehicle(vehicleData.id);
      
      setVehicleData(null);
      setCarPhoto(null);
      
      resetVehicle({
        brand: '',
        model: '',
        color: '',
        seats: '',
        plate_number: '',
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      setError(err.message || 'Ошибка при удалении автомобиля');
    } finally {
      setDeletingVehicle(false);
    }
  };

  // Обработчики
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const handleCarPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setSelectedCarFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setCarPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmitProfile = (data) => {
    updateProfile(data);
  };

  const onSubmitVehicle = (data) => {
    updateVehicle(data);
  };

  // Загрузка
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Загружаем профиль...</p>
        </div>
      </div>
    );
  }

  // Ошибка загрузки
  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ошибка загрузки профиля
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button 
              onClick={loadProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Попробовать снова
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Хедер */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-3 py-2 text-green-700 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
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
        {/* Уведомления */}
        {saveSuccess && (
          <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50 text-green-800 flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Профиль успешно обновлен!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50 text-red-800">
            <p>{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Форма профиля */}
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
                        <img 
                          src={profilePhoto} 
                          alt="Аватар профиля" 
                          className="object-cover w-full h-full"
                          onError={() => setProfilePhoto(null)}
                        />
                      ) : (
                        <User className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Имя *</label>
                    <input
                      placeholder="Введите ваше имя"
                      className={`
                        block w-full px-3 py-2 border rounded-lg shadow-sm
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        ${profileErrors.first_name ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                      `}
                      {...registerProfile('first_name')}
                    />
                    {profileErrors.first_name && (
                      <p className="text-sm text-red-600">{profileErrors.first_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Фамилия *</label>
                    <input
                      placeholder="Введите вашу фамилию"
                      className={`
                        block w-full px-3 py-2 border rounded-lg shadow-sm
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        ${profileErrors.last_name ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                      `}
                      {...registerProfile('last_name')}
                    />
                    {profileErrors.last_name && (
                      <p className="text-sm text-red-600">{profileErrors.last_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Телефон</label>
                    <input
                      type="tel"
                      placeholder="+7XXXXXXXXXX"
                      className={`
                        block w-full px-3 py-2 border rounded-lg shadow-sm
                        transition-all duration-200 placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        ${profileErrors.phone ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                      `}
                      {...registerProfile('phone')}
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-red-600">{profileErrors.phone.message}</p>
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
                        ${profileErrors.email ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}
                      `}
                      {...registerProfile('email')}
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-red-600">{profileErrors.email.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSubmitProfile(watchProfile())}
                  disabled={!profileIsDirty || saving}
                  className={`
                    mt-6 w-full h-10 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 flex items-center justify-center
                    ${profileIsDirty 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg' 
                      : 'bg-green-100 text-green-600 cursor-not-allowed'
                    }
                    disabled:opacity-50
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  `}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохраняем...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {profileIsDirty ? 'Сохранить профиль' : 'Нет изменений'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Форма автомобиля */}
            <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-400 to-cyan-500 text-white">
                <h2 className="text-xl font-semibold flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Автомобиль
                </h2>
                <p className="text-white/80 text-sm">Информация о вашем транспортном средстве</p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                      {carPhoto ? (
                        <img 
                          src={carPhoto} 
                          alt="Фото автомобиля" 
                          className="object-cover w-full h-full"
                          onError={() => setCarPhoto(null)}
                        />
                      ) : (
                        <Car className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
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
                      onChange={handleCarPhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {vehicleData ? `${vehicleData.brand || ''} ${vehicleData.model || ''}`.trim() || 'Автомобиль не указан' : 'Автомобиль не добавлен'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vehicleData?.plate_number || 'Номер не указан'}
                    </p>
                    {selectedCarFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Фото выбрано: {selectedCarFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Марка *</label>
                    <input
                      placeholder="Toyota, Hyundai, ..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...registerVehicle('brand')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Модель *</label>
                    <input
                      placeholder="Camry, Solaris, ..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...registerVehicle('model')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Цвет</label>
                    <input
                      placeholder="Белый, Черный, ..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...registerVehicle('color')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Количество мест</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      placeholder="4"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...registerVehicle('seats')}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Государственный номер *</label>
                    <input
                      placeholder="А123БВ777"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...registerVehicle('plate_number')}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => onSubmitVehicle(watchVehicle())}
                    disabled={!vehicleIsDirty || savingVehicle}
                    className={`
                      flex-1 h-10 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 flex items-center justify-center
                      ${vehicleIsDirty 
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white shadow-lg' 
                        : 'bg-blue-100 text-blue-600 cursor-not-allowed'
                      }
                      disabled:opacity-50
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                  >
                    {savingVehicle ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {vehicleIsDirty ? (vehicleData ? 'Обновить автомобиль' : 'Добавить автомобиль') : 'Нет изменений'}
                      </>
                    )}
                  </button>

                  {vehicleData && (
                    <button
                      type="button"
                      onClick={deleteVehicle}
                      disabled={deletingVehicle || savingVehicle}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      {deletingVehicle ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>🗑️</span>
                      )}
                      <span>{deletingVehicle ? 'Удаляем...' : 'Удалить'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статус */}
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
                      {vehicleData?.seats || '4'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Рейтинг</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        5.0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-emerald-600" />
                  Контакты
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-800">{profileData?.phone || 'Не указан'}</span>
                  </div>
                  {profileData?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-800">{profileData.email}</span>
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