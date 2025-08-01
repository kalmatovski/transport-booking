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
      
      // Обновление пользователя (когда получим профиль) - ИСПРАВЛЕНО
      setUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
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
      getToken: () => get().accessToken,
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Для сервера возвращаем пустое хранилище
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      
      // ИСПРАВЛЕНО: Сохраняем только безопасные данные
      partialize: (state) => ({
        // Сохраняем только refresh токен (он менее критичен)
        refreshToken: state.refreshToken,
        // Сохраняем только роль пользователя (без персональных данных)
        userRole: state.user?.role,
        // Флаг авторизации
        isAuthenticated: state.isAuthenticated,
        // ACCESS TOKEN и полный USER НЕ СОХРАНЯЕМ
      }),
      
      // ИСПРАВЛЕНО: Правильная гидратация
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Восстанавливаем минимальные пользовательские данные
          if (state.userRole && state.isAuthenticated) {
            state.user = { role: state.userRole };
          }
          
          // Помечаем как гидратированное с задержкой для избежания mismatch
          setTimeout(() => {
            if (state.setHydrated) {
              state.setHydrated();
            }
          }, 0);
        }
      },
    }
  )
);