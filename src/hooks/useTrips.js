import { useQuery } from '@tanstack/react-query';
import { ridesAPI } from '../lib/api';
import { queryKeys } from '../lib/queryConfig';

export function useTrips(selectedRoute, selectedDate, isEnabled = true) {
  return useQuery({
  queryKey: queryKeys.availableTrips(selectedRoute, selectedDate),
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
    // Убираем кэширование
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
