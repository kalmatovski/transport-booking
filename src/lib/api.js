import axios, { all } from 'axios';
import { useAuthStore } from '../store/authStore';

// Создаем instance axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // НЕ перенаправляем при ошибке логина - это нормальная ошибка
    const isLoginRequest = originalRequest.url?.includes('/auth/login/');
    const isRegisterRequest = originalRequest.url?.includes('/auth/register/');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest && !isRegisterRequest) {
      originalRequest._retry = true;
      
      // Пытаемся обновить токен
      try {
        const refreshToken = useAuthStore.getState().getRefreshToken();
        if (refreshToken) {
          const response = await api.post('/auth/refresh/', {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          useAuthStore.getState().updateTokens(newAccessToken, refreshToken);
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если обновление токена не удалось, выходим
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Только для НЕ-логин запросов перенаправляем при 401
    if (error.response?.status === 401 && !isLoginRequest && !isRegisterRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API методы для авторизации
export const authAPI = {
  // Вход - теперь простой username/password
  login: (data) => {
    return api.post('/auth/login/', {
      username: data.username,
      password: data.password
    });
  },
  
  // Регистрация
  register: (data) => {
    return api.post('/auth/register/', {
      username: data.username,
      password: data.password,
      role: data.role,
      phone: data.phone,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
    });
  },
  
  // Обновление access токена
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh/', {
      refresh: refreshToken
    });
  },
  
  // Получение профиля
  getProfile: () => {
    return api.get('/auth/me/');
  },
  
  // Обновление профиля (только текстовые данные)
    updateProfile: (data) => {
    const formData = new FormData();
    
    // Добавляем все поля как FormData
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    return api.patch('/auth/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Обновление только аватара
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.patch('/auth/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Получение информации о пользователе по ID
  getUser: (userId) => {
    return api.get(`/auth/users/${userId}/`);
  },
};

// API для поездок
export const ridesAPI = {
  // Получить список доступных поездок
  getAvailableTrips: (routeId, date) => {
    let url = '/trips/';
    const params = [];
    
    // Логируем параметры для отладки
    console.log('getAvailableTrips called with:', { routeId, date });
    
    // Всегда фильтруем только доступные поездки
    params.push('status=available');
    
    if (routeId) {
      params.push(`route=${routeId}`);
    }
    
    if (date) {
      // Преобразуем дату в формат YYYY-MM-DD для Django
      params.push(`departure_date=${date}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    console.log('Final API URL:', url);
    return api.get(url);
  },
  
  // Получить список маршрутов (пока хардкод)
  getRoutes: () => {
    return Promise.resolve({
      data: [
        { id: 1, name: 'Красноярск → Абакан' },
        { id: 2, name: 'Абакан → Красноярск' }
      ]
    });
  },
  
  // Получить конкретную поездку
  getTrip: (tripId) => {
    return api.get(`/trips/${tripId}/`);
  },
  
  // Создать поездку (для водителей)
  createTrip: (data) => {
    return api.post('/trips/', data);
  },
  
  // Обновить статус поездки (для водителей)
  updateTripStatus: (tripId, status) => {
    return api.patch(`/trips/${tripId}/`, { status });
  },

  // Получить мои поездки (для водителей) с информацией о пассажирах
  getMyTrips: () => {
    return api.get('/trips/my/');
  },
};

// API для бронирования
export const bookingAPI = {
  // Создать бронь
  createBooking: (data) => {
    console.log('Creating booking with data:', data); // Отладочная информация
    const requestData = {
      trip: data.tripId,
      seats_reserved: data.seatsReserved
    };
    console.log('Request data:', requestData); // Отладочная информация
    return api.post('/bookings/', requestData);
  },
  
  // Получить мои брони
  getMyBookings: () => {
    return api.get('/bookings/');
  },
  
  // Получить конкретную бронь
  getBooking: (bookingId) => {
    return api.get(`/bookings/${bookingId}/`);
  },
  
  // Получить мои брони для конкретной поездки
  getMyBookingForTrip: (tripId) => {
    return api.get(`/bookings/`).then(response => {
      const bookings = response.data || [];
      const tripBooking = bookings.find(booking => booking.trip === parseInt(tripId));
      return { data: tripBooking || null };
    });
  },
  
  // Отменить бронь
  cancelBooking: (bookingId) => {
    return api.patch(`/bookings/${bookingId}/`, { status: 'cancelled' });
  },
  
  // Обновить бронь (изменить количество мест)
  updateBooking: (bookingId, data) => {
    return api.patch(`/bookings/${bookingId}/`, {
      seats_reserved: data.seatsReserved || data.seats_reserved
    });
  },
};



export const vehiclesAPI = {
  // Получить все автомобили
  getAllVehicles: () => {
    return api.get('/vehicles/');
  },

  // Получить мои автомобили (водителя)
  getMyVehicles: () => {
    return api.get('/vehicles/');
  },

  // Получить автомобиль водителя (ищем по owner)
  getMyVehicle: async () => {
    try {
      // Получаем текущего пользователя
      const profileResponse = await api.get('/auth/me/');
      const myUserId = profileResponse.data.id;
      
      // Получаем все машины
      const vehiclesResponse = await api.get('/vehicles/');
      const allVehicles = vehiclesResponse.data;
      console.log("Cars",vehiclesResponse);
      
      
      // Ищем свою машину по owner
      const myVehicle = allVehicles.find(vehicle => vehicle.owner === myUserId);
      
      if (myVehicle) {
        return { data: myVehicle };
      } else {
        // Возвращаем null вместо ошибки - машины просто нет
        return { data: null };
      }
    } catch (error) {
      // Если ошибка API - пробрасываем
      throw error;
    }
  },

  // Создать автомобиль
  createVehicle: (data) => {
    const formData = new FormData();
    
    // Добавляем поля автомобиля
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if (key === 'vehicle_image' && data[key] instanceof File) {
          // Если это файл - добавляем как есть
          formData.append(key, data[key]);
        } else if (key !== 'vehicle_image') {
          // Остальные поля как строки
          formData.append(key, data[key]);
        }
      }
    });
    
    return api.post('/vehicles/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Обновить автомобиль
  updateVehicle: (vehicleId, data) => {
    const formData = new FormData();
    
    // Добавляем поля автомобиля
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        if (key === 'vehicle_image' && data[key] instanceof File) {
          // Если это файл - добавляем как есть
          formData.append(key, data[key]);
        } else if (key !== 'vehicle_image') {
          // Остальные поля как строки
          formData.append(key, data[key]);
        }
      }
    });
    
    return api.patch(`/vehicles/${vehicleId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Загрузить фото автомобиля
  updateVehiclePhoto: (vehicleId, file) => {
    const formData = new FormData();
    formData.append('vehicle_image', file); // ИСПРАВЛЕНО: vehicle_image вместо photo
    
    return api.patch(`/vehicles/${vehicleId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Удалить автомобиль
  deleteVehicle: (vehicleId) => {
    return api.delete(`/vehicles/delete/${vehicleId}/`);
  },
};

// API для маршрутов
export const routesAPI = {
  // Поиск маршрутов
  searchRoutes: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.from_city) {
      queryParams.append('from_city', params.from_city);
    }
    if (params.to_city) {
      queryParams.append('to_city', params.to_city);
    }
    
    return api.get(`/routes/search/?${queryParams.toString()}`);
  },

  // Поиск маршрутов с доступными поездками
  searchRoutesWithTrips: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.from_city) {
      queryParams.append('from_city', params.from_city);
    }
    if (params.to_city) {
      queryParams.append('to_city', params.to_city);
    }
    if (params.date) {
      queryParams.append('date', params.date);
    }
    
    return api.get(`/routes/with-trips/?${queryParams.toString()}`);
  },

  // Получить все маршруты
  getAllRoutes: () => {
    return api.get('/routes/');
  },

  // Создать новый маршрут
  createRoute: (routeData) => {
    return api.post('/routes/', routeData);
  },
};

export default api; 