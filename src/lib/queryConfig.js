export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
  
  profiles: {
    staleTime: 15 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  },
  
  trips: {
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  },
  
  routes: {
    staleTime: 60 * 60 * 1000,
    cacheTime: 2 * 60 * 60 * 1000,
  },
  
  vehicles: {
    staleTime: 10 * 60 * 1000,
    cacheTime: 20 * 60 * 1000,
  },
  
  realtime: {
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  }
};

export const queryKeys = {
  users: ['users'],
  user: (id) => ['users', id],
  profile: ['profile'],
  
  trips: ['trips'],
  availableTrips: (routeId, date) => ['trips', 'available', { routeId, date }],
  myTrips: ['trips', 'my'],
  trip: (id) => ['trips', id],
  
  routes: ['routes'],
  route: (id) => ['routes', id],
  
  vehicles: ['vehicles'],
  myVehicles: ['vehicles', 'my'],
  vehicle: (id) => ['vehicles', id],
  
  bookings: ['bookings'],
  myBookings: ['bookings', 'my'],
  booking: (id) => ['bookings', id],
};
