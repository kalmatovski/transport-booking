import axios from 'axios';
import { useAuthStore } from '../store/authStore';

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
  register: (data) => api.post('/auth/register/', data),
  
  // Вход
  login: (data) => api.post('/auth/login/', data),
  
  // Подтверждение SMS кода
  verifySMS: (data) => api.post('/auth/verify-sms/', data),
  
  // Отправка SMS кода повторно
  resendSMS: (phone) => api.post('/auth/resend-sms/', { phone }),
  
  // Получение профиля
  getProfile: () => api.get('/auth/profile/'),
  
  // Обновление профиля
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

// API методы для поездок
export const ridesAPI = {
  // Получить все маршруты
  getRoutes: () => api.get('/routes/'),
  
  // Получить доступных водителей по маршруту
  getAvailableDrivers: (routeId, date) => 
    api.get(`/rides/available/`, { params: { route: routeId, date } }),
  
  // Забронировать место
  bookRide: (data) => api.post('/bookings/', data),
  
  // Получить мои бронирования
  getMyBookings: () => api.get('/bookings/my/'),
  
  // Отменить бронирование
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}/`),
};

export default api;