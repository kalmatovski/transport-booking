'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Save, Calendar, MapPin, Clock, Users, Car, CheckCircle, XCircle, AlertCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '../../lib/validationSchemas';
import { authAPI } from '../../lib/api';
import { notify } from '../../lib/notify';
import { normalizeImageUrl } from '../../lib/imageLoader';

// Аватар профиля с загрузкой
export function ProfileAvatar({ profileData, colorScheme = 'yellow', onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const colors = {
    yellow: {
      gradient: 'from-yellow-400 to-amber-500',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    green: {
      gradient: 'from-green-400 to-emerald-500', 
      button: 'bg-green-600 hover:bg-green-700'
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }

      await authAPI.updateAvatar(file);
      notify.success('Фото профиля обновлено');
      onUpdate?.();
    } catch (err) {
      notify.error(err.message || 'Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = profileData?.avatar ? normalizeImageUrl(`http://127.0.0.1:8000${profileData.avatar}`) : null;
  const initials = profileData?.first_name?.[0] || profileData?.username?.[0] || 'U';

  return (
    <div className="relative">
      <div className={`h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br ${colors[colorScheme].gradient} flex items-center justify-center shadow-lg`}>
        {avatarUrl ? (
          <Image src={avatarUrl} alt="Профиль" width={80} height={80} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-2xl font-bold">{initials}</span>
        )}
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`absolute -bottom-1 -right-1 h-7 w-7 ${colors[colorScheme].button} text-white rounded-full flex items-center justify-center shadow-lg transition-colors`}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
    </div>
  );
}

// Форма редактирования профиля
export function ProfileForm({ profileData, colorScheme = 'yellow', onUpdate }) {
  const [saving, setSaving] = useState(false);
  
  const colors = {
    yellow: {
      ring: 'focus:ring-yellow-500 focus:border-yellow-500',
      hover: 'hover:border-yellow-300',
      gradient: 'from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600',
      inactive: 'bg-yellow-100 text-yellow-600'
    },
    green: {
      ring: 'focus:ring-green-500 focus:border-green-500',
      hover: 'hover:border-green-300', 
      gradient: 'from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
      inactive: 'bg-green-100 text-green-600'
    }
  };

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: profileData
  });

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await authAPI.updateProfile(data);
      notify.success('Профиль обновлен');
      onUpdate?.(data);
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (error) => `block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${colors[colorScheme].ring} ${error ? 'border-red-300' : `border-gray-300 ${colors[colorScheme].hover}`}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Имя *</label>
        <input
          placeholder="Введите ваше имя"
          className={inputClass(errors.first_name)}
          {...register('first_name')}
        />
        {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Фамилия *</label>
        <input
          placeholder="Введите вашу фамилию"
          className={inputClass(errors.last_name)}
          {...register('last_name')}
        />
        {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Телефон</label>
        <input
          type="tel"
          placeholder="+7XXXXXXXXXX"
          className={inputClass(errors.phone)}
          {...register('phone')}
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="example@mail.com"
          className={inputClass(errors.email)}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        <p className="text-sm text-gray-500">Для восстановления доступа</p>
      </div>

      <button
        type="submit"
        disabled={!isDirty || saving}
        className={`w-full h-10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
          isDirty 
            ? `bg-gradient-to-r ${colors[colorScheme].gradient} text-white shadow-lg` 
            : `${colors[colorScheme].inactive} cursor-not-allowed`
        } disabled:opacity-50 focus:outline-none focus:ring-2 ${colors[colorScheme].ring} focus:ring-offset-2`}
      >
        {saving ? (
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
    </form>
  );
}

// Статистика профиля
export function ProfileStats({ bookings = [] }) {
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['confirmed', 'pending'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Всего броней:</span>
        <span className="font-medium">{stats.total}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Активных:</span>
        <span className="font-medium text-green-600">{stats.active}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Завершённых:</span>
        <span className="font-medium text-blue-600">{stats.completed}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Отменённых:</span>
        <span className="font-medium text-red-600">{stats.cancelled}</span>
      </div>
    </div>
  );
}

// Утилиты для статусов
export const getStatusConfig = (status) => {
  const configs = {
    pending: { 
      color: 'text-yellow-700 bg-yellow-100', 
      text: 'Ожидает подтверждения', 
      icon: AlertCircle 
    },
    confirmed: { 
      color: 'text-green-700 bg-green-100', 
      text: 'Подтверждено', 
      icon: CheckCircle 
    },
    cancelled: { 
      color: 'text-red-700 bg-red-100', 
      text: 'Отменено', 
      icon: XCircle 
    },
    completed: { 
      color: 'text-blue-700 bg-blue-100', 
      text: 'Завершено', 
      icon: CheckCircle 
    }
  };
  
  return configs[status] || { 
    color: 'text-gray-700 bg-gray-100', 
    text: 'Неизвестно', 
    icon: AlertCircle 
  };
};

// Форматирование времени
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'Не указано';
  
  const date = new Date(dateTimeString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  
  if (date.toDateString() === today.toDateString()) {
    return `Сегодня, ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Завтра, ${timeStr}`;
  } else {
    return `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}, ${timeStr}`;
  }
};

// Статистика водителя
export function DriverStats({ profileData }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Поездок:</span>
        <span className="font-medium">{profileData?.trips_count || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Статус:</span>
        <span className="font-medium text-green-600">Активен</span>
      </div>
    </div>
  );
}
