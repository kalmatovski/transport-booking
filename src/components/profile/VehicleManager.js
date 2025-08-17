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
    // Только для добавления новой машины
    if (vehicleData) return;
    
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
      if (selectedFile) {
        vehiclePayload.vehicle_image = selectedFile;
      }
      
      const response = await vehiclesAPI.createVehicle(vehiclePayload);
      setSelectedFile(null);
      
      notify.success('Автомобиль успешно добавлен');
      onUpdate?.(response.data);
    } catch (err) {
      console.error('Vehicle save error:', err);
      notify.error(err.response?.data?.detail || 'Ошибка добавления автомобиля');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Только для новых автомобилей
    if (vehicleData) return;

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
      
      notify.success('Фото выбрано. Сохраните автомобиль для загрузки фото.');
      
    } catch (err) {
      notify.error(err.message || 'Ошибка выбора фото');
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
      
      // Очищаем форму после удаления
      reset({
        brand: '',
        model: '',
        color: '',
        seats: 4,
        plate_number: ''
      });
      setCarPhoto(null);
      setSelectedFile(null);
      
      notify.success('Автомобиль удален');
      onUpdate?.(null);
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Заголовок с современным дизайном */}
      <div className="relative px-6 py-6 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <div className="p-2 bg-white/20 rounded-xl mr-3 backdrop-blur-sm">
                <Car className="w-6 h-6" />
              </div>
              {vehicleData ? 'Мой автомобиль' : 'Добавить автомобиль'}
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              {vehicleData ? 'Информация о зарегистрированном автомобиле' : 'Зарегистрируйте ваш автомобиль для поездок'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {vehicleData ? (
          // Отображение информации о существующем автомобиле
          <>
            {/* Фото и основная информация */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
              <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white flex items-center justify-center border-4 border-gray-100 shadow-lg">
                {carPhoto ? (
                  <img src={carPhoto} alt="Автомобиль" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Нет фото</p>
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {vehicleData.brand} {vehicleData.model}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold">Цвет:</span> {vehicleData.color}</p>
                  <p><span className="font-semibold">Госномер:</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{vehicleData.plate_number}</span></p>
                  <p><span className="font-semibold">Мест:</span> {vehicleData.seats}</p>
                </div>
              </div>
            </div>

            {/* Действия */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="text-center">
                <h5 className="text-lg font-semibold text-gray-900 mb-2">Управление автомобилем</h5>
                <p className="text-gray-600 text-sm mb-4">
                  Автомобиль зарегистрирован и готов к использованию. При необходимости вы можете удалить его и добавить новый.
                </p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                      Удаляем автомобиль...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-2 inline" />
                      Удалить автомобиль
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Форма для добавления нового автомобиля
          <>
            {/* Секция фото автомобиля */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-white flex items-center justify-center border-4 border-gray-100 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {carPhoto ? (
                      <img src={carPhoto} alt="Автомобиль" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Фото авто</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-2 -right-2 h-10 w-10 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                  >
                    {uploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Фото автомобиля</h4>
                  <p className="text-gray-600 mb-1">Добавьте качественное фото вашего автомобиля</p>
                  <p className="text-sm text-gray-500">Поддерживаются форматы: JPG, PNG • Максимум 5MB</p>
                </div>
              </div>
            </div>

            {/* Форма добавления */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Основная информация */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="h-1 w-4 bg-emerald-500 rounded-full mr-3"></div>
                  Основная информация
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Марка автомобиля</label>
                    <input
                      placeholder="Mercedes, BMW, Toyota..."
                      className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-0 ${
                        errors.brand 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                      } bg-gray-50/50 focus:bg-white`}
                      {...register('brand')}
                    />
                    {errors.brand && <p className="text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{errors.brand.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Модель</label>
                    <input
                      placeholder="E-Class, X5, Camry..."
                      className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-0 ${
                        errors.model 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                      } bg-gray-50/50 focus:bg-white`}
                      {...register('model')}
                    />
                    {errors.model && <p className="text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{errors.model.message}</p>}
                  </div>
                </div>
              </div>

              {/* Характеристики */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="h-1 w-4 bg-emerald-500 rounded-full mr-3"></div>
                  Характеристики
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Государственный номер</label>
                    <input
                      placeholder="А123БВ777"
                      className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-0 ${
                        errors.plate_number 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                      } bg-gray-50/50 focus:bg-white font-mono`}
                      {...register('plate_number')}
                    />
                    {errors.plate_number && <p className="text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{errors.plate_number.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Цвет</label>
                    <input
                      placeholder="Черный, Белый, Серый..."
                      className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-0 ${
                        errors.color 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                      } bg-gray-50/50 focus:bg-white`}
                      {...register('color')}
                    />
                    {errors.color && <p className="text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{errors.color.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Количество мест</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="4"
                      className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-0 ${
                        errors.seats 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500'
                      } bg-gray-50/50 focus:bg-white`}
                      {...register('seats', { valueAsNumber: true })}
                    />
                    {errors.seats && <p className="text-sm text-red-600 flex items-center"><span className="mr-1">⚠️</span>{errors.seats.message}</p>}
                  </div>
                </div>
              </div>

              {/* Кнопка добавления */}
              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center transform bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Регистрируем автомобиль...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-3" />
                      Зарегистрировать автомобиль
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
