'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  LogOut, 
  Menu, 
  X, 
  User, 
  UserPlus 
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TransportBook
            </span>
          </div>

          {/* Навигация */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  className="flex items-center space-x-1 hover:bg-blue-50/80 text-slate-700"
                >
                  <User className="w-4 h-4" />
                  <span>Профиль</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:bg-red-50/80 text-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="flex items-center space-x-1 hover:bg-blue-50/80 text-slate-700"
                >
                  <User className="w-4 h-4" />
                  <span>Войти</span>
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Регистрация</span>
                </Button>
              </>
            )}
          </div>

          {/* Мобильное меню кнопка */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-200/50 bg-white/90 backdrop-blur-md py-4">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50/80 rounded-lg mx-2"
                  >
                    Профиль
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50/80 rounded-lg mx-2"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50/80 rounded-lg mx-2"
                  >
                    Войти
                  </button>
                  <button
                    onClick={() => {
                      router.push('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50/80 rounded-lg mx-2"
                  >
                    Регистрация
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
