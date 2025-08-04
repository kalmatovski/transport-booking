'use client';

import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../lib/api';

export function DriverInfo({ driverId }) {
  const { data: driver, isLoading, error } = useQuery({
    queryKey: ['driver', driverId],
    queryFn: () => authAPI.getUser(driverId),
    select: (data) => data.data,
    enabled: !!driverId,
    staleTime: 30 * 60 * 1000, // 🚀 Увеличиваем кеш до 30 минут (данные водителя редко меняются)
    cacheTime: 60 * 60 * 1000, // 🚀 Храним в кеше 1 час
    refetchOnWindowFocus: false, // 🚀 Не перезагружаем при фокусе
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (error || !driver) {
    return <p className="font-semibold text-slate-800">Водитель #{driverId}</p>;
  }

  const driverName = driver.first_name && driver.last_name 
    ? `${driver.first_name} ${driver.last_name}`
    : driver.username;

  return (
    <div>
      <p className="font-semibold text-slate-800">{driverName}</p>
      {driver.phone && (
        <p className="text-xs text-slate-600">{driver.phone}</p>
      )}
    </div>
  );
}
