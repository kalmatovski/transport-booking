import { useQuery } from '@tanstack/react-query';
import { routesAPI } from '../lib/api';

export function useRoutes(isEnabled = true) {
  return useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAllRoutes,
    select: (data) => data?.data || data || [],
    staleTime: 30 * 60 * 1000, // 🚀 Кешируем маршруты на 30 минут
    cacheTime: 60 * 60 * 1000, // 🚀 Храним в кеше 1 час
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });
}
