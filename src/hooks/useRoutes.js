import { useQuery } from '@tanstack/react-query';
import { routesAPI } from '../lib/api';
import { queryKeys } from '../lib/queryConfig';

export function useRoutes(isEnabled = true) {
  return useQuery({
    queryKey: queryKeys.routes,
    queryFn: routesAPI.getAllRoutes,
    select: (data) => data?.data || data || [],
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });
}
