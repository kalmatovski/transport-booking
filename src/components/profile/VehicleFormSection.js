// src/components/profile/VehicleFormSection.js
// 🚀 Улучшенная адаптивная форма автомобиля для профиля водителя

'use client';

import { memo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Car, 
  Camera, 
  Save, 
  Loader2, 
  Trash2, 
  Plus,
  Users,
  Palette,
  Hash,
  Upload,
  AlertCircle
} from 'lucide-react';

// Схема валидации для автомобиля
const vehicleSchema = z.object({
  brand: z.string().min(1, 'Укажите марку автомобиля'),
  model: z.string().min(1, 'Укажите модель автомобиля'),
  plate_number: z.string()
    .min(1, 'Укажите номер автомобиля')
    .regex(/^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/i, 'Неверный формат номера (например: А123БВ24)'),
  color: z.string().min(1, 'Укажите цвет автомобиля'),
  seats: z.number().min(1, 'Минимум 1 место').max(8, 'Максимум 8 мест'),
  year: z.number().min(1990, 'Год должен быть не ранее 1990').max(new Date().getFullYear(), 'Год не может быть в будущем').optional(),
});

const VehicleFormSection = memo(({ 
  vehicleData, 
  onSave, 
  onDelete, 
  onPhotoUpload,
  loading = false,
  saving = false,
  deleting = false,
  uploadingPhoto = false,
  carPhoto = null 
}) => {
  const carPhotoInputRef = useRef(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: vehicleData?.brand || '',
      model: vehicleData?.model || '',
      plate_number: vehicleData?.plate_number || '',
      color: vehicleData?.color || '',
      seats: vehicleData?.seats || 4,
      year: vehicleData?.year || new Date().getFullYear(),
    }
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  const isEditing = !!vehicleData;
  const hasChanges = form.formState.isDirty;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl">
      {/* Заголовок секции */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-2 rounded-xl">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Мой автомобиль' : 'Добавить автомобиль'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Редактирование информации об автомобиле' : 'Для создания поездок нужно добавить автомобиль'}
              </p>
            </div>
          </div>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                Активен
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Фото автомобиля */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Фото автомобиля
          </label>
          <div className="flex items-start space-x-4">
            {/* Превью фото */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {carPhoto ? (
                  <img 
                    src={carPhoto} 
                    alt="Автомобиль" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Car className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">Фото</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => carPhotoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={carPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={onPhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-sm text-gray-600">
              <p className="mb-1">• Рекомендуемый размер: 800x600 пикселей</p>
              <p className="mb-1">• Максимальный размер: 5MB</p>
              <p className="mb-1">• Форматы: JPG, PNG, WEBP</p>
              <p className="text-blue-600">• Фото поможет пассажирам узнать ваш автомобиль</p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Основная информация - адаптивная сетка */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Марка */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Марка автомобиля *
              </label>
              <div className="relative">
                <input
                  placeholder="Toyota, Volkswagen, Lada..."
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    form.formState.errors.brand 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-300 hover:border-blue-300 bg-white/70'
                  }`}
                  {...form.register('brand')}
                />
                <Car className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              {form.formState.errors.brand && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.brand.message}
                </p>
              )}
            </div>

            {/* Модель */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Модель *
              </label>
              <input
                placeholder="Camry, Polo, Granta..."
                className={`block w-full px-3 py-3 border rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  form.formState.errors.model 
                    ? 'border-red-300 bg-red-50/50' 
                    : 'border-gray-300 hover:border-blue-300 bg-white/70'
                }`}
                {...form.register('model')}
              />
              {form.formState.errors.model && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>
          </div>

          {/* Номер и цвет */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Государственный номер */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Государственный номер *
              </label>
              <div className="relative">
                <input
                  placeholder="А123БВ24"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                    form.formState.errors.plate_number 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-300 hover:border-blue-300 bg-white/70'
                  }`}
                  {...form.register('plate_number')}
                />
                <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              {form.formState.errors.plate_number && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.plate_number.message}
                </p>
              )}
            </div>

            {/* Цвет */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Цвет *
              </label>
              <div className="relative">
                <input
                  placeholder="Белый, Черный, Серебристый..."
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    form.formState.errors.color 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-300 hover:border-blue-300 bg-white/70'
                  }`}
                  {...form.register('color')}
                />
                <Palette className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              {form.formState.errors.color && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {form.formState.errors.color.message}
                </p>
              )}
            </div>
          </div>

          {/* Количество мест */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Количество пассажирских мест
            </label>
            <div className="relative">
              <select
                className="block w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/70 appearance-none"
                {...form.register('seats', { valueAsNumber: true })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'место' : num <= 4 ? 'места' : 'мест'}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Дополнительные поля (скрываемые) */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>{showAdvanced ? 'Скрыть' : 'Показать'} дополнительные поля</span>
              <svg 
                className={`w-4 h-4 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
                {/* Год выпуска */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Год выпуска
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder={new Date().getFullYear().toString()}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 bg-white/70"
                    {...form.register('year', { valueAsNumber: true })}
                  />
                  {form.formState.errors.year && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {form.formState.errors.year.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                {/* Редактирование - две кнопки */}
                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    hasChanges && !saving
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохраняем изменения...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {hasChanges ? 'Сохранить изменения' : 'Нет изменений'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting || saving}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Удаляем...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Удалить</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Добавление - одна кнопка */}
                <button
                  type="submit"
                  disabled={saving || !form.formState.isValid}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    form.formState.isValid && !saving
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Добавляем автомобиль...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить автомобиль
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});

VehicleFormSection.displayName = 'VehicleFormSection';

export default VehicleFormSection;
