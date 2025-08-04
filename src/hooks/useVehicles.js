import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesAPI } from '../lib/api';

export function useVehicles(isEnabled = true) {
  const queryClient = useQueryClient();

  // Загрузка автомобилей
  const vehiclesQuery = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: vehiclesAPI.getMyVehicles,
    select: (data) => data?.data || data || [],
    enabled: isEnabled,
  });

  // Создание автомобиля
  const createVehicleMutation = useMutation({
    mutationFn: vehiclesAPI.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-vehicles']);
    },
    onError: (error) => {
      console.error('Ошибка создания автомобиля:', error);
      throw error;
    }
  });

  // Удаление автомобиля
  const deleteVehicleMutation = useMutation({
    mutationFn: vehiclesAPI.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-vehicles']);
    },
    onError: (error) => {
      console.error('Ошибка удаления автомобиля:', error);
      throw error;
    }
  });

  return {
    // Данные
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    error: vehiclesQuery.error,
    
    // Действия
    createVehicle: createVehicleMutation.mutate,
    deleteVehicle: deleteVehicleMutation.mutate,
    
    // Состояния мутаций
    isCreating: createVehicleMutation.isPending,
    isDeleting: deleteVehicleMutation.isPending,
    createError: createVehicleMutation.error,
    deleteError: deleteVehicleMutation.error,
  };
}
