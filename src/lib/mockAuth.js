// Тестовые данные для демонстрации
const MOCK_USERS = [
  {
    id: 1,
    name: 'Тестовый Пользователь',
    email: 'test@gmail.com',
    phone: '+79991234567',
    password: '123456',
    photo: null,
    telegram: '@testuser',
    rating: 4.8,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Анна Иванова',
    email: 'anna@mail.ru',
    phone: '+79997654321',
    password: 'password',
    photo: null,
    telegram: '@anna_iv',
    rating: 4.9,
    created_at: '2024-02-01T15:30:00Z'
  }
];

const MOCK_ROUTES = [
  { id: 1, from: 'Красноярск', to: 'Абакан' },
  { id: 2, from: 'Абакан', to: 'Красноярск' }
];

const MOCK_DRIVERS = [
  {
    id: 1,
    name: 'Сергей Водителев',
    car_model: 'Toyota Camry',
    car_color: 'Серебристый',
    car_photo: null,
    rating: 4.9,
    available_seats: 3,
    phone: '+79993334455'
  },
  {
    id: 2,
    name: 'Михаил Рулевой',
    car_model: 'Hyundai Solaris',
    car_color: 'Белый',
    car_photo: null,
    rating: 4.7,
    available_seats: 2,
    phone: '+79996667788'
  }
];

const MOCK_BOOKINGS = [
  {
    id: 1,
    route_name: 'Красноярск — Абакан',
    driver_name: 'Сергей Водителев',
    date: '2024-12-20',
    passengers: 2,
    status: 'confirmed',
    rating: 5
  },
  {
    id: 2,
    route_name: 'Абакан — Красноярск',
    driver_name: 'Михаил Рулевой',
    date: '2024-12-15',
    passengers: 1,
    status: 'completed',
    rating: 4
  }
];

// Имитация задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Генерация JWT токена (фейкового)
const generateMockToken = (user) => {
  return `mock_jwt_token_${user.id}_${Date.now()}`;
};

// Тестовые API функции
export const mockAuthAPI = {
  // Вход по email
  login: async (data) => {
    await delay(1000); // Имитация задержки
    
    if (data.method === 'email') {
      const user = MOCK_USERS.find(u => 
        u.email === data.email && u.password === data.password
      );
      
      if (!user) {
        // Правильно бросаем ошибку как в реальном API
        const error = new Error('Неверный email или пароль');
        error.response = {
          data: { message: 'Неверный email или пароль' },
          status: 401
        };
        throw error;
      }
      
      const { password, ...userWithoutPassword } = user;
      const token = generateMockToken(user);
      
      return {
        data: {
          user: userWithoutPassword,
          token: token
        }
      };
    }
    
    if (data.method === 'phone') {
      // Для телефона просто возвращаем успех (SMS "отправлена")
      return {
        data: {
          phone: data.phone,
          message: 'SMS код отправлен'
        }
      };
    }
    
    const error = new Error('Неподдерживаемый метод входа');
    error.response = {
      data: { message: 'Неподдерживаемый метод входа' },
      status: 400
    };
    throw error;
  },

  // Подтверждение SMS (для телефона)
  verifySMS: async (data) => {
    await delay(800);
    
    // Любой 4-значный код принимаем
    if (data.code && data.code.length === 4) {
      const user = MOCK_USERS[0]; // Возвращаем тестового пользователя
      const { password, ...userWithoutPassword } = user;
      const token = generateMockToken(user);
      
      return {
        data: {
          user: userWithoutPassword,
          token: token
        }
      };
    }
    
    const error = new Error('Неверный код подтверждения');
    error.response = {
      data: { message: 'Неверный код подтверждения' },
      status: 400
    };
    throw error;
  },

  // Регистрация
  register: async (data) => {
    await delay(1200);
    
    // Проверяем, не существует ли пользователь
    const existingUser = MOCK_USERS.find(u => 
      u.email === data.email || u.phone === data.phone
    );
    
    if (existingUser) {
      const error = new Error('Пользователь с таким email или телефоном уже существует');
      error.response = {
        data: { message: 'Пользователь с таким email или телефоном уже существует' },
        status: 409
      };
      throw error;
    }
    
    // "Регистрируем" нового пользователя
    return {
      data: {
        phone: data.phone,
        message: 'SMS код отправлен для подтверждения'
      }
    };
  },

  // Получение профиля
  getProfile: async () => {
    await delay(500);
    const user = MOCK_USERS[0];
    const { password, ...userWithoutPassword } = user;
    
    return {
      data: userWithoutPassword
    };
  },

  // Обновление профиля
  updateProfile: async (data) => {
    await delay(800);
    
    // Обновляем данные тестового пользователя
    const updatedUser = {
      ...MOCK_USERS[0],
      ...data,
    };
    
    // Удаляем пароль из ответа
    const { password, ...userWithoutPassword } = updatedUser;
    
    return {
      data: userWithoutPassword
    };
  },

  // Повторная отправка SMS
  resendSMS: async (phone) => {
    await delay(500);
    return {
      data: {
        message: 'SMS код отправлен повторно'
      }
    };
  }
};

// Тестовые API для поездок
export const mockRidesAPI = {
  // Получить маршруты
  getRoutes: async () => {
    await delay(300);
    return {
      data: MOCK_ROUTES
    };
  },

  // Получить доступных водителей
  getAvailableDrivers: async (routeId, date) => {
    await delay(800);
    
    // Возвращаем водителей для любого маршрута и даты
    return {
      data: MOCK_DRIVERS
    };
  },

  // Мои бронирования
  getMyBookings: async () => {
    await delay(600);
    return {
      data: MOCK_BOOKINGS
    };
  },

  // Бронирование поездки
  bookRide: async (data) => {
    await delay(1000);
    
    const newBooking = {
      id: Date.now(),
      route_name: 'Красноярск — Абакан',
      driver_name: 'Сергей Водителев',
      date: data.date,
      passengers: data.passengers,
      status: 'confirmed'
    };
    
    return {
      data: newBooking
    };
  },

  // Отмена бронирования
  cancelBooking: async (bookingId) => {
    await delay(500);
    return {
      data: {
        message: 'Бронирование отменено'
      }
    };
  }
};

// Функция для переключения между реальным и тестовым API
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockAPI = true; // Переключатель для тестирования