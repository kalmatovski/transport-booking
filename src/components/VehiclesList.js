'use client';

import { Car, Plus } from 'lucide-react';
import { Button, LoadingSpinner, Alert } from '../ui';
import { VehicleCard } from './VehicleCard';

export function VehiclesList({ 
  vehicles = [], 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onAddNew, 
  isDeleting = false 
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton загрузки */}
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6 animate-pulse"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-slate-200 rounded-xl"></div>
              <div className="h-16 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-6">
        Ошибка загрузки автомобилей: {error.message}
      </Alert>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-6 rounded-3xl mx-auto w-fit mb-6">
          <Car className="w-16 h-16 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4">
          У вас пока нет автомобилей
        </h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Добавьте свой первый автомобиль, чтобы начать создавать поездки и принимать пассажиров
        </p>
        <Button
          onClick={onAddNew}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить автомобиль
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок со счетчиком */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Мои автомобили
          </h2>
          <p className="text-slate-600">
            {vehicles.length} {vehicles.length === 1 ? 'автомобиль' : 'автомобиля'}
          </p>
        </div>
        <Button
          onClick={onAddNew}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Добавить
        </Button>
      </div>

      {/* Список автомобилей */}
      <div className="grid lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}
