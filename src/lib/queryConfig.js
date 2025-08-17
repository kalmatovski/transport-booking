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

  // Trips
  trips: ['trips'],
  availableTrips: (routeId, date) => ['trips', 'available', { routeId, date }],
  myTrips: (userId) => ['trips', 'my', userId],
  trip: (id) => ['trips', id],

  // Routes
  routes: ['routes'],
  route: (id) => ['routes', id],

  // Vehicles
  vehicles: ['vehicles'],
  myVehicles: (userId) => ['vehicles', 'my', userId],
  vehicle: (id) => ['vehicles', id],

  // Bookings
  bookings: ['bookings'],
  myBookings: (userId) => ['bookings', 'my', userId],
  myBookingForTrip: (tripId) => ['bookings', 'my', 'trip', tripId],
  booking: (id) => ['bookings', id],

  // Drivers
  driver: (id) => ['driver', id],
  driverRating: (id) => ['driverRating', id],
};
