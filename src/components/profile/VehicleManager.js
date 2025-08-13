'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Car, Save, Loader2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { vehiclesAPI } from '../../lib/api';
import { notify } from '../../lib/notify';

// Схема валидации для автомобиля
const vehicleSchema = z.object({
  brand: z.string().min(1, 'Марка обязательна'),
  model: z.string().min(1, 'Модель обязательна'),
  color: z.string().min(1, 'Цвет обязателен'),
  seats: z.number().min(1, 'Минимум 1 место').max(50, 'Максимум 50 мест'),
  plate_number: z.string().min(1, 'Номер обязателен')
});

export function VehicleManager({ vehicleData, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [carPhoto, setCarPhoto] = useState(vehicleData?.vehicle_image || null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicleData || {
      brand: '',
      model: '',
      color: '',
      seats: 4,
      plate_number: ''
    }
  });

  // Обновляем форму при изменении данных автомобиля
  useEffect(() => {
    if (vehicleData) {
      reset(vehicleData);
      setCarPhoto(vehicleData.vehicle_image || null);
    }
  }, [vehicleData, reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // Формируем данные согласно API бекенда
      const vehiclePayload = {
        brand: data.brand,
        model: data.model,
        color: data.color,
        seats: data.seats,
        plate_number: data.plate_number,
        is_active: true // По умолчанию активен при создании
      };

      // Добавляем изображение если есть
      if (selectedFile && !vehicleData) {
        vehiclePayload.vehicle_image = selectedFile;
      }
      
      const response = vehicleData 
        ? await vehiclesAPI.updateVehicle(vehicleData.id, vehiclePayload)
        : await vehiclesAPI.createVehicle(vehiclePayload);
        
      if (!vehicleData) {
        setSelectedFile(null);
      }
      
      const action = vehicleData ? 'обновлен' : 'добавлен';
      notify.success(`Автомобиль успешно ${action}`);
      onUpdate?.(response.data);
    } catch (err) {
      console.error('Vehicle save error:', err);
      notify.error(err.response?.data?.detail || 'Ошибка сохранения автомобиля');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }

      setSelectedFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setCarPhoto(previewUrl);

      if (vehicleData?.id) {
        const response = await vehiclesAPI.updateVehiclePhoto(vehicleData.id, file);
        
        const photoUrl = response.data.vehicle_image;
        if (photoUrl) {
          const fullPhotoUrl = photoUrl.startsWith('http') 
            ? photoUrl 
            : `http://127.0.0.1:8000${photoUrl}`;
          setCarPhoto(fullPhotoUrl);
        }
        
        notify.success('Фото автомобиля обновлено');
      }
      
    } catch (err) {
      notify.error(err.message || 'Ошибка загрузки фото');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleData) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить автомобиль ${vehicleData.brand} ${vehicleData.model}?`
    );
    
    if (!confirmed) return;

    try {
      setDeleting(true);
      await vehiclesAPI.deleteVehicle(vehicleData.id);
      notify.success('Автомобиль удален');
      onUpdate?.(null);
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-100 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              {vehicleData ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
            </h3>
            <p className="text-green-700 text-sm">Информация о вашем транспорте</p>
          </div>
          {vehicleData && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              {deleting ? 'Удаляем...' : 'Удалить'}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {/* Фото автомобиля */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center border-2 border-green-200">
              {carPhoto ? (
                <img src={carPhoto} alt="Автомобиль" className="w-full h-full object-cover" />
              ) : (
                <Car className="w-8 h-8 text-green-600" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 h-7 w-7 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              {uploadingPhoto ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
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
            <p className="text-sm text-gray-600">Добавьте фото автомобиля</p>
            <p className="text-xs text-gray-500">Максимальный размер: 5MB</p>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Марка *</label>
              <input
                placeholder="Toyota"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.brand ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                {...register('brand')}
              />
              {errors.brand && <p className="text-sm text-red-600">{errors.brand.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Модель *</label>
              <input
                placeholder="Camry"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.model ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                {...register('model')}
              />
              {errors.model && <p className="text-sm text-red-600">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Гос номер *</label>
              <input
                placeholder="А123БВ777"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.plate_number ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                {...register('plate_number')}
              />
              {errors.plate_number && <p className="text-sm text-red-600">{errors.plate_number.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Цвет *</label>
              <input
                placeholder="Белый"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.color ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                {...register('color')}
              />
              {errors.color && <p className="text-sm text-red-600">{errors.color.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Количество мест *</label>
              <select
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.seats ? 'border-red-300' : 'border-gray-300 hover:border-green-300'}`}
                {...register('seats', { valueAsNumber: true })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'место' : num < 5 ? 'места' : 'мест'}</option>
                ))}
              </select>
              {errors.seats && <p className="text-sm text-red-600">{errors.seats.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`w-full h-10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              isDirty 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg' 
                : 'bg-green-100 text-green-600 cursor-not-allowed'
            } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохраняем...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isDirty ? (vehicleData ? 'Сохранить изменения' : 'Добавить автомобиль') : 'Нет изменений'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
