'use client';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { queryKeys } from '@/lib/queryConfig';

export function useDriver(driverId, options = {}) {
  return useQuery({
    queryKey: queryKeys.driver(driverId),
    queryFn: () => authAPI.getUser(driverId),
    select: (res) => res.data,
    enabled: !!driverId,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
}