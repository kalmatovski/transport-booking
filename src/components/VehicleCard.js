'use client';

import { Car, Edit, Trash2, Users } from 'lucide-react';
import { Button, Card, CardContent } from './ui';
export function VehicleCard({ vehicle, onEdit, onDelete, isDeleting = false }) {
  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-3 rounded-xl">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-slate-600">Номер: {vehicle.plate_number}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(vehicle)}
              className="hover:bg-blue-50 text-blue-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(vehicle.id)}
              disabled={isDeleting}
              className="hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Фото автомобиля */}
        {vehicle.vehicle_image && (
          <div className="mb-4">
            <img
              src={vehicle.vehicle_image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-48 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Детали */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/40 rounded-xl p-3">
            <p className="text-sm text-slate-600">Цвет</p>
            <p className="font-semibold text-slate-800">{vehicle.color}</p>
          </div>
          <div className="bg-white/40 rounded-xl p-3">
            <p className="text-sm text-slate-600 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Мест
            </p>
            <p className="font-semibold text-slate-800">{vehicle.seats}</p>
          </div>
        </div>

        {/* Статус */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-200 rounded-xl p-3">
          <p className="text-sm text-green-800 font-medium">
            ✓ Автомобиль зарегистрирован
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
