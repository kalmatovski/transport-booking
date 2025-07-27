// Тестовые данные
const MOCK_USERS = [
  {
    id: 1,
    name: 'Тестовый Пользователь',
    phone: '+71234567890',
    email: 'test@example.com',
    password: '123123',
    telegram: '@testuser',
    photo: null,
    rating: 4.8,
    trips_count: 15,
  }
];

const MOCK_ROUTES = [
  { id: 1, name: 'Красноярск — Абакан', distance: '250 км', duration: '3.5 ч' },
  { id: 2, name: 'Абакан — Красноярск', distance: '250 км', duration: '3.5 ч' },
];

const MOCK_DRIVERS = [
  {
    id: 1,
    name: 'Сергей Водителев',
    phone: '+79991234567',
    car_model: 'Toyota Camry',
    car_photo: 'https://via.placeholder.com/300x200',
    available_seats: 3,
    rating: 4.9,
    trips_count: 127,
    price: 800,
  },
  {
    id: 2,
    name: 'Анна Поездкина',
    phone: '+79987654321',
    car_model: 'Hyundai Solaris',
    car_photo: 'https://via.placeholder.com/300x200',
    available_seats: 2,
    rating: 4.7,
    trips_count: 89,
    price: 750,
  }
];

const MOCK_BOOKINGS = [
  {
    id: 1,
    route_name: 'Красноярск — Абакан',
    driver_name: 'Сергей Водителев',
    date: '2025-02-15',
    passengers: 2,
    status: 'confirmed'
  }
];

// Простые API функции без задержек и сложной обработки ошибок
export const mockAuthAPI = {
  // Вход
  login: (data) => {
    if (data.method === 'email') {
      const user = MOCK_USERS.find(u => 
        u.email === data.email && u.password === data.password
      );
      
      if (!user) {
        throw new Error('Неверный email или пароль');
      }
      
      const { password, ...userWithoutPassword } = user;
      return {
        data: {
          user: userWithoutPassword,
          token: `mock_token_${user.id}`
        }
      };
    }
    
    if (data.method === 'phone') {
      return {
        data: {
          phone: data.phone,
          message: 'SMS код отправлен'
        }
      };
    }
    
    throw new Error('Неподдерживаемый метод входа');
  },

  // Подтверждение SMS
  verifySMS: (data) => {
    if (data.code && data.code.length === 4) {
      const user = MOCK_USERS[0];
      const { password, ...userWithoutPassword } = user;
      
      return {
        data: {
          user: userWithoutPassword,
          token: `mock_token_${user.id}`
        }
      };
    }
    
    throw new Error('Неверный код подтверждения');
  },

  // Регистрация
  register: (data) => {
    const existingUser = MOCK_USERS.find(u => 
      u.email === data.email || u.phone === data.phone
    );
    
    if (existingUser) {
      throw new Error('Пользователь с таким email или телефоном уже существует');
    }
    
    return {
      data: {
        phone: data.phone,
        message: 'SMS код отправлен для подтверждения'
      }
    };
  },

  // Получение профиля
  getProfile: () => {
    const user = MOCK_USERS[0];
    const { password, ...userWithoutPassword } = user;
    
    return {
      data: userWithoutPassword
    };
  },

  // Обновление профиля
  updateProfile: (data) => {
    const updatedUser = {
      ...MOCK_USERS[0],
      ...data,
    };
    
    const { password, ...userWithoutPassword } = updatedUser;
    return {
      data: userWithoutPassword
    };
  },

  // Повторная отправка SMS
  resendSMS: (phone) => {
    return {
      data: {
        message: 'SMS код отправлен повторно'
      }
    };
  }
};

// Простые API для поездок
export const mockRidesAPI = {
  // Получить маршруты
  getRoutes: () => ({
    data: MOCK_ROUTES
  }),

  // Получить доступных водителей
  getAvailableDrivers: (routeId, date) => ({
    data: MOCK_DRIVERS
  }),

  // Мои бронирования
  getMyBookings: () => ({
    data: MOCK_BOOKINGS
  }),

  // Бронирование поездки
  bookRide: (data) => {
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
  cancelBooking: (bookingId) => ({
    data: {
      message: 'Бронирование отменено'
    }
  })
};



// Переключатель для тестирования
export const useMockAPI = true;