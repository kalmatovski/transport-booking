import { useQuery } from '@tanstack/react-query';
import { ridesAPI } from '../lib/api';

export function useTrips(selectedRoute, selectedDate, isEnabled = true) {
  return useQuery({
    queryKey: ['available-trips', selectedRoute, selectedDate],
    queryFn: () => ridesAPI.getAvailableTrips(selectedRoute, selectedDate),
    select: (data) => {
      const trips = data?.data || [];
      const now = new Date();
      return trips.filter(trip => {
        const departureTime = new Date(trip.departure_time);
        return departureTime > now;
      });
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 🚀 Кешируем на 5 минут
    cacheTime: 10 * 60 * 1000, // 🚀 Храним в кеше 10 минут
    refetchOnWindowFocus: false, // 🚀 Не перезагружаем при фокусе
  });
}
