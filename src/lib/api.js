import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { mockAuthAPI, mockRidesAPI, useMockAPI } from './mockAuth';

// Создаем instance axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
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
  (error) => {
    if (error.response?.status === 401) {
      // Если получили 401, выходим из системы
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API методы для авторизации
export const authAPI = {
  // Регистрация клиента
  register: (data) => {
    if (useMockAPI) {
      return mockAuthAPI.register(data);
    }
    return api.post('/auth/register/', data);
  },
  
  // Вход
  login: (data) => {
    if (useMockAPI) {
      return mockAuthAPI.login(data);
    }
    return api.post('/auth/login/', data);
  },
  
  // Подтверждение SMS кода
  verifySMS: (data) => {
    if (useMockAPI) {
      return mockAuthAPI.verifySMS(data);
    }
    return api.post('/auth/verify-sms/', data);
  },
  
  // Отправка SMS кода повторно
  resendSMS: (phone) => {
    if (useMockAPI) {
      return mockAuthAPI.resendSMS(phone);
    }
    return api.post('/auth/resend-sms/', { phone });
  },
  
  // Получение профиля
  getProfile: () => {
    if (useMockAPI) {
      return mockAuthAPI.getProfile();
    }
    return api.get('/auth/profile/');
  },
  
  // Обновление профиля
  updateProfile: (data) => {
    if (useMockAPI) {
      return mockAuthAPI.updateProfile(data);
    }
    return api.patch('/auth/profile/', data);
  },
};

// API методы для поездок
export const ridesAPI = {
  // Получить все маршруты
  getRoutes: () => {
    if (useMockAPI) {
      return mockRidesAPI.getRoutes();
    }
    return api.get('/routes/');
  },
  
  // Получить доступных водителей по маршруту
  getAvailableDrivers: (routeId, date) => {
    if (useMockAPI) {
      return mockRidesAPI.getAvailableDrivers(routeId, date);
    }
    return api.get(`/rides/available/`, { params: { route: routeId, date } });
  },
  
  // Забронировать место
  bookRide: (data) => {
    if (useMockAPI) {
      return mockRidesAPI.bookRide(data);
    }
    return api.post('/bookings/', data);
  },
  
  // Получить мои бронирования
  getMyBookings: () => {
    if (useMockAPI) {
      return mockRidesAPI.getMyBookings();
    }
    return api.get('/bookings/my/');
  },
  
  // Отменить бронирование
  cancelBooking: (bookingId) => {
    if (useMockAPI) {
      return mockRidesAPI.cancelBooking(bookingId);
    }
    return api.delete(`/bookings/${bookingId}/`);
  },
};

export default api;