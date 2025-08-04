// src/lib/queryConfig.js
// 🚀 Центральная конфигурация React Query для оптимизации производительности

export const queryConfig = {
  // Глобальные настройки для всех запросов
  defaultOptions: {
    queries: {
      // Базовые настройки кеширования
      staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
      cacheTime: 10 * 60 * 1000, // 10 минут - хранение в памяти
      refetchOnWindowFocus: false, // Не перезагружать при фокусе
      refetchOnReconnect: true, // Перезагружать при восстановлении сети
      retry: 2, // Повторить запрос 2 раза при ошибке
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
  
  // Специализированные настройки для разных типов данных
  profiles: {
    staleTime: 15 * 60 * 1000, // 15 минут - профили меняются редко
    cacheTime: 30 * 60 * 1000, // 30 минут в кеше
  },
  
  trips: {
    staleTime: 2 * 60 * 1000, // 2 минуты - поездки обновляются чаще
    cacheTime: 5 * 60 * 1000, // 5 минут в кеше
  },
  
  routes: {
    staleTime: 60 * 60 * 1000, // 1 час - маршруты практически не меняются
    cacheTime: 2 * 60 * 60 * 1000, // 2 часа в кеше
  },
  
  vehicles: {
    staleTime: 10 * 60 * 1000, // 10 минут - автомобили меняются редко
    cacheTime: 20 * 60 * 1000, // 20 минут в кеше
  },
  
  realtime: {
    staleTime: 30 * 1000, // 30 секунд - для данных реального времени
    cacheTime: 2 * 60 * 1000, // 2 минуты в кеше
    refetchInterval: 2 * 60 * 1000, // Обновлять каждые 2 минуты
  }
};

// Утилиты для создания ключей запросов
export const queryKeys = {
  // Пользователи
  users: ['users'],
  user: (id) => ['users', id],
  profile: ['profile'],
  
  // Поездки
  trips: ['trips'],
  availableTrips: (routeId, date) => ['trips', 'available', { routeId, date }],
  myTrips: ['trips', 'my'],
  trip: (id) => ['trips', id],
  
  // Маршруты
  routes: ['routes'],
  route: (id) => ['routes', id],
  
  // Автомобили
  vehicles: ['vehicles'],
  myVehicles: ['vehicles', 'my'],
  vehicle: (id) => ['vehicles', id],
  
  // Бронирования
  bookings: ['bookings'],
  myBookings: ['bookings', 'my'],
  booking: (id) => ['bookings', id],
};
