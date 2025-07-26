import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      
      // Действия
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },
      
      // Геттеры
      getUser: () => get().user,
      getToken: () => get().token,
      isLoggedIn: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Проверяем, что мы на клиенте
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // На сервере возвращаем заглушку
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Пропускаем hydration на сервере
      skipHydration: true,
    }
  )
);