import { z } from 'zod';

// Схема для входа
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Введите имя пользователя'),
  
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

// Схема для регистрации
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(150, 'Имя пользователя не должно превышать 150 символов')
    .regex(/^[a-zA-Z0-9@.+-_]+$/, 'Разрешены только буквы, цифры и символы @/./+/-/_'),
  
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  
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

  role: z
    .enum(['passenger', 'driver'], {
      required_error: 'Выберите тип пользователя',
      invalid_type_error: 'Выберите корректный тип пользователя'
    }),
});

// Схема для подтверждения SMS кода
export const verifySMSSchema = z.object({
  code: z
    .string()
    .length(4, 'Код должен содержать 4 цифры')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
});

// Упрощенная схема для обновления профиля
export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(150, 'Имя не должно превышать 150 символов'),
  
  last_name: z
    .string()
    .min(2, 'Фамилия должна содержать минимум 2 символа')
    .max(150, 'Фамилия не должна превышать 150 символов'),
  
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
  
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  
  telegram: z
    .string()
    .optional()
    .or(z.literal('')),
  
  // Поля для водителя
  car_model: z
    .string()
    .optional()
    .or(z.literal('')),
  
  car_number: z
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