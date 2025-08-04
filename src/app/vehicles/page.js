'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { Button, Card, CardContent } from '../../components/ui';
import { AppLayout } from '../../components/layout/AppLayout';
import { VehicleForm } from '../../components/VehicleForm';
import { VehiclesList } from '../../components/VehiclesList';
import { useVehicles } from '../../hooks/useVehicles';
import { useVehicleForm } from '../../hooks/useVehicleForm';

export default function VehiclesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Используем custom hooks
  const {
    vehicles,
    isLoading,
    error,
    createVehicle,
    deleteVehicle,
    isCreating,
    isDeleting,
    createError
  } = useVehicles(isAuthenticated && user?.role === 'driver');

  const {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    resetForm,
    setServerErrors
  } = useVehicleForm();

  // Обработчики
  const handleAddNew = () => {
    setEditingVehicle(null);
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
    resetForm();
  };

  const handleFormSubmit = (e) => {
    handleSubmit(e, (vehicleData) => {
      createVehicle(vehicleData, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
        onError: (error) => {
          if (error.response?.data) {
            setServerErrors(error.response.data);
          }
        }
      });
    });
  };

  const handleDelete = (vehicleId) => {
    if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      deleteVehicle(vehicleId);
    }
  };

  // Проверяем права доступа
  if (!isAuthenticated || user?.role !== 'driver') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-xl p-8">
            <CardContent className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Доступ запрещен</h2>
              <p className="text-slate-600 mb-4">Только водители могут управлять автомобилями</p>
              <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                На главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="hover:bg-blue-50/80 text-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Управление автомобилями
              </h1>
              <p className="text-slate-600">Добавляйте и управляйте своими автомобилями</p>
            </div>
          </div>
        </div>

        {showForm && (
          <VehicleForm
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isCreating}
          />
        )}

        <VehiclesList
          vehicles={vehicles}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
          isDeleting={isDeleting}
        />
      </main>
    </AppLayout>
  );
}
