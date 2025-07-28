import { z } from 'zod';

// Схема для входа (обновлена под реальный API)
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Введите имя пользователя'),
  
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

// Оставляем старые схемы для совместимости (пока не обновим все компоненты)
export const loginPhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Введите корректный номер телефона в формате +7XXXXXXXXXX'),
});

export const loginEmailSchema = z.object({
  email: z
    .string()
    .email('Введите корректный email'),
  
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

// Схема для регистрации (обновлена под реальный API)
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(150, 'Имя пользователя не должно превышать 150 символов')
    .regex(/^[a-zA-Z0-9@.+-_]+$/, 'Разрешены только буквы, цифры и символы @/./+/-/_'),
  
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  
  role: z
    .enum(['driver', 'passenger'], {
      errorMap: () => ({ message: 'Выберите тип пользователя' })
    }),
  
  phone: z
    .string()
    .min(1, 'Номер телефона обязателен')
    .max(20, 'Номер телефона не должен превышать 20 символов'),
  
  first_name: z
    .string()
    .max(150, 'Имя не должно превышать 150 символов')
    .optional()
    .or(z.literal('')),
  
  last_name: z
    .string()
    .max(150, 'Фамилия не должна превышать 150 символов')
    .optional()
    .or(z.literal('')),
  
  email: z
    .string()
    .email('Введите корректный email')
    .max(254, 'Email не должен превышать 254 символа')
    .optional()
    .or(z.literal('')),
});

// Схема для подтверждения SMS кода (если нужна)
export const verifySMSSchema = z.object({
  code: z
    .string()
    .length(4, 'Код должен содержать 4 цифры')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
});

// Схема для обновления профиля
export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов'),
  
  last_name: z
    .string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(50, 'Фамилия не должна превышать 50 символов'),
  
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
  
  phone_number: z
    .string()
    .regex(/^\+7\d{10}$/, 'Введите корректный номер телефона')
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