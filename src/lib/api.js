import axios from 'axios';
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
  
  // Обновление профиля
  updateProfile: (data) => {
    return api.patch('/auth/profile/', data);
  },
};

// API для поездок
export const ridesAPI = {
  // Получить список доступных поездок
  getAvailableTrips: (routeId, date) => {
    let url = '/trips/';
    const params = [];
    
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
  
  // Забронировать поездку
  bookTrip: (tripId, data) => {
    return api.post(`/trips/${tripId}/book/`, data);
  },
  
  // Получить мои бронирования
  getMyBookings: () => {
    return api.get('/bookings/my/');
  },
  
  // Создать поездку (для водителей)
  createTrip: (data) => {
    return api.post('/trips/', data);
  },
  
  // Обновить статус поездки (для водителей)
  updateTripStatus: (tripId, status) => {
    return api.patch(`/trips/${tripId}/`, { status });
  },
};

export default api;