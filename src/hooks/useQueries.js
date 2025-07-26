import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, ridesAPI } from '../lib/api';

// Хуки для авторизации
export const useRegister = () => {
  return useMutation({
    mutationFn: authAPI.register,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authAPI.login,
  });
};

export const useVerifySMS = () => {
  return useMutation({
    mutationFn: authAPI.verifySMS,
  });
};

export const useResendSMS = () => {
  return useMutation({
    mutationFn: authAPI.resendSMS,
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
    select: (data) => data.data,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Также обновляем данные в других связанных запросах
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Хуки для поездок и маршрутов
export const useRoutes = () => {
  return useQuery({
    queryKey: ['routes'],
    queryFn: ridesAPI.getRoutes,
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

export const useAvailableDrivers = (routeId, date) => {
  return useQuery({
    queryKey: ['available-drivers', routeId, date],
    queryFn: () => ridesAPI.getAvailableDrivers(routeId, date),
    enabled: !!routeId && !!date,
    select: (data) => data.data,
  });
};

export const useBookRide = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ridesAPI.bookRide,
    onSuccess: () => {
      // Обновляем список бронирований и доступных водителей
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['available-drivers'] });
    },
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: ridesAPI.getMyBookings,
    select: (data) => data.data,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ridesAPI.cancelBooking,
    onSuccess: () => {
      // Обновляем список бронирований и доступных водителей
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['available-drivers'] });
    },
  });
};