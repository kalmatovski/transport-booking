'use client';

import { Star } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ratingsAPI } from '../lib/api';
import { queryKeys } from '../lib/queryConfig';

// Умная система расчета рейтинга
const calculateDisplayRating = (averageScore, ratingsCount) => {
  // Новички - показываем 5.0
  if (ratingsCount === 0) {
    return { 
      rating: 5.0, 
      label: "Новичок",
      isNewbie: true 
    };
  }
  
  // До 3 отзывов - показываем 4.8, чтобы не было резких скачков
  if (ratingsCount <= 3) {
    return { 
      rating: 4.8, 
      label: `${ratingsCount} ${ratingsCount === 1 ? 'отзыв' : ratingsCount < 5 ? 'отзыва' : 'отзывов'}`,
      isNewbie: true 
    };
  }
  
  // От 4 до 10 отзывов - смешанная система (70% реального + 30% базового 4.8)
  if (ratingsCount <= 10) {
    const baseRating = 4.8;
    const realWeight = 0.7;
    const baseWeight = 0.3;
    const mixedRating = (averageScore * realWeight) + (baseRating * baseWeight);
    
    return { 
      rating: Math.max(mixedRating, 3.5), // Не ниже 3.5 для начинающих
      label: `${ratingsCount} ${ratingsCount === 1 ? 'отзыв' : ratingsCount < 5 ? 'отзыва' : 'отзывов'}`,
      isNewbie: false 
    };
  }
  
  // Более 10 отзывов - показываем реальный рейтинг, но не ниже 3.0
  return { 
    rating: Math.max(averageScore, 3.0),
    label: `${ratingsCount} отзывов`,
    isNewbie: false 
  };
};

export function DriverRating({ driverId, showLabel = false, size = 'sm' }) {
  const queryClient = useQueryClient();
  
  const { data: driverRating, isLoading, refetch } = useQuery({
    queryKey: queryKeys.driverRating(driverId),
    queryFn: () => driverId ? ratingsAPI.getDriverRatings(driverId) : null,
    enabled: Boolean(driverId),
    staleTime: 60 * 1000, // 1 минута свежести
    cacheTime: 5 * 60 * 1000, // 5 минут кэша
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <Star className={`${sizeClasses[size]} text-gray-300 animate-pulse`} />
        <span className={`${textSizeClasses[size]} text-gray-400`}>—</span>
      </div>
    );
  }

  // Извлекаем данные из Axios response
  const ratingData = driverRating?.data;
  const ratingsCount = ratingData?.ratings?.length || 0;
  const averageScore = ratingData?.average_score || 0;
  
  // Используем умную систему расчета
  const { rating: displayRating, label, isNewbie } = calculateDisplayRating(averageScore, ratingsCount);

  return (
    <div className="flex items-center space-x-1">
      <Star className={`${sizeClasses[size]} text-yellow-500 fill-current`} />
      <span className={`${textSizeClasses[size]} text-slate-600 font-medium`}>
        {displayRating.toFixed(1)}
      </span>
      {showLabel && (
        <span className={`${textSizeClasses[size]} text-slate-400`}>
          ({label})
          {isNewbie && <span className="text-blue-500 ml-1">• {ratingsCount === 0 ? 'Новичок' : 'Начинающий'}</span>}
        </span>
      )}
    </div>
  );
}
