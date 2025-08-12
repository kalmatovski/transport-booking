'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export function useClearCacheOnUserChange() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  useEffect(() => {
    // При смене пользователя или логауте очищаем кэш
    const currentUserId = user?.id;
    const previousUserId = useClearCacheOnUserChange.previousUserId;
    
    if (previousUserId && previousUserId !== currentUserId) {
      // Очищаем только пользовательские данные, не общие данные как поездки
      queryClient.removeQueries({ queryKey: ['my-bookings'] });
      queryClient.removeQueries({ queryKey: ['my-booking-for-trip'] });
      queryClient.removeQueries({ queryKey: ['profile'] });
    }
    
    // Сохраняем текущий userId для следующего сравнения
    useClearCacheOnUserChange.previousUserId = currentUserId;
  }, [user?.id, queryClient]);
}

// Статическое свойство для хранения предыдущего userId
useClearCacheOnUserChange.previousUserId = null;
