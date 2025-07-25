import { z } from 'zod';

// Схема для регистрации
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов'),
  
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Введите корректный номер телефона в формате +7XXXXXXXXXX'),
  
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
});

// Схема для входа по телефону
export const loginPhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Введите корректный номер телефона в формате +7XXXXXXXXXX'),
});

// Схема для входа по email
export const loginEmailSchema = z.object({
  email: z
    .string()
    .email('Введите корректный email'),
  
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

// Схема для подтверждения SMS кода
export const verifySMSSchema = z.object({
  code: z
    .string()
    .length(4, 'Код должен содержать 4 цифры')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
});

// Схема для обновления профиля
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов'),
  
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
  
  telegram: z
    .string()
    .optional()
    .or(z.literal('')),
});

// Схема для бронирования поездки
export const bookRideSchema = z.object({
  routeId: z.number().min(1, 'Выберите маршрут'),
  driverId: z.number().min(1, 'Выберите водителя'),
  date: z.string().min(1, 'Выберите дату'),
  passengers: z.number().min(1, 'Укажите количество пассажиров').max(8, 'Максимум 8 пассажиров'),
  comment: z.string().optional(),
});