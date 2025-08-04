'use client';

import { Car, Save, Upload, X } from 'lucide-react';
import { Button, Card, CardContent } from '../ui';

export function VehicleForm({ 
  formData, 
  errors, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) {
  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl mb-8">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Добавить автомобиль
            </h2>
          </div>
          <Button variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Марка */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Марка
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                placeholder="Toyota, BMW, Lada..."
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand[0]}</p>
              )}
            </div>

            {/* Модель */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Модель
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                placeholder="Camry, X5, Granta..."
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model[0]}</p>
              )}
            </div>

            {/* Цвет */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Цвет
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                placeholder="Белый, Черный, Серебристый..."
              />
              {errors.color && (
                <p className="text-red-500 text-sm mt-1">{errors.color[0]}</p>
              )}
            </div>

            {/* Количество мест */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Количество мест
              </label>
              <select
                name="seats"
                value={formData.seats}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
              >
                <option value="">Выберите количество мест</option>
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} мест</option>
                ))}
              </select>
              {errors.seats && (
                <p className="text-red-500 text-sm mt-1">{errors.seats[0]}</p>
              )}
            </div>

            {/* Номер */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Государственный номер
              </label>
              <input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                placeholder="А123БВ124"
              />
              {errors.plate_number && (
                <p className="text-red-500 text-sm mt-1">{errors.plate_number[0]}</p>
              )}
            </div>

            {/* Фото автомобиля */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Фото автомобиля
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="vehicle_image"
                  onChange={onInputChange}
                  accept="image/*"
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
                />
                <Upload className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
              </div>
              {errors.vehicle_image && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicle_image[0]}</p>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
