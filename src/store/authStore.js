import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      
      login: (userData, accessToken, refreshToken) => {
        set({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
          isAuthenticated: true,
        });
      },
      
      updateTokens: (newAccessToken, newRefreshToken) => {
        set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || get().refreshToken,
        });
      },
      
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
      
      getUser: () => get().user,
      getToken: () => get().accessToken,
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      isLoggedIn: () => get().isAuthenticated,
      
      hasValidTokens: () => {
        const { accessToken, refreshToken } = get();
        return !!(accessToken && refreshToken);
      },
      
      isDriver: () => get().user?.role === 'driver',
      isPassenger: () => get().user?.role === 'passenger',
    }),
    {
      name: 'auth-storage',
    }
  )
);
