import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      
      // Действия для login с JWT токенами
      login: (userData, accessToken, refreshToken) => {
        set({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
          isAuthenticated: true,
        });
      },
      
      // Обновление только access токена (при refresh)
      updateTokens: (newAccessToken, newRefreshToken) => {
        set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || get().refreshToken,
        });
      },
      
      // Обновление пользователя (когда получим профиль)
      setUser: (userData) => {
        set({
          user: userData,
        });
      },
      
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Завершаем гидратацию
      setHydrated: () => {
        set({ isHydrated: true });
      },
      
      // Геттеры
      getUser: () => get().user,
      getToken: () => get().accessToken, // Для совместимости с API клиентом
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      isLoggedIn: () => get().isAuthenticated,
      
      // Проверка есть ли действующие токены
      hasValidTokens: () => {
        const { accessToken, refreshToken } = get();
        return !!(accessToken && refreshToken);
      },
      
      // Проверка ролей
      isDriver: () => get().user?.role === 'driver',
      isPassenger: () => get().user?.role === 'passenger',
    //   isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);