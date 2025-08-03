// src/components/profile/ProfileStates.js
import { ArrowLeft, Loader2 } from 'lucide-react';

// Универсальное состояние загрузки
export const LoadingState = ({ 
  colorScheme = 'yellow', // yellow, green, blue
  message = 'Загружаем профиль...' 
}) => {
  const colorClasses = {
    yellow: 'from-yellow-50 to-amber-50 border-yellow-600',
    green: 'from-green-50 to-emerald-50 border-green-600',
    blue: 'from-blue-50 to-cyan-50 border-blue-600'
  };

  const colors = colorClasses[colorScheme] || colorClasses.yellow;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.split(' ').slice(0, 2).join(' ')} flex items-center justify-center`}>
      <div className="text-center">
        <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 text-${colorScheme}-600`} />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

// Универсальное состояние ошибки
export const ErrorState = ({ 
  colorScheme = 'yellow',
  title = 'Ошибка загрузки профиля',
  error,
  onRetry,
  onGoHome,
  retryText = 'Попробовать снова',
  homeText = 'На главную'
}) => {
  const colorClasses = {
    yellow: 'from-yellow-50 to-amber-50 bg-yellow-600 hover:bg-yellow-700',
    green: 'from-green-50 to-emerald-50 bg-green-600 hover:bg-green-700',
    blue: 'from-blue-50 to-cyan-50 bg-blue-600 hover:bg-blue-700'
  };

  const colors = colorClasses[colorScheme] || colorClasses.yellow;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.split(' ').slice(0, 2).join(' ')} flex items-center justify-center`}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-x-2">
          {onRetry && (
            <button 
              onClick={onRetry}
              className={`px-4 py-2 text-white rounded-lg ${colors.split(' ').slice(2, 4).join(' ')}`}
            >
              {retryText}
            </button>
          )}
          {onGoHome && (
            <button 
              onClick={onGoHome}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {homeText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Универсальный хедер профиля
export const ProfileHeader = ({ 
  colorScheme = 'yellow',
  title,
  onBack,
  backText = 'Назад к поездкам'
}) => {
  const colorClasses = {
    yellow: 'border-yellow-200 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100',
    green: 'border-green-200 text-green-700 hover:text-green-800 hover:bg-green-100',
    blue: 'border-blue-200 text-blue-700 hover:text-blue-800 hover:bg-blue-100'
  };

  const colors = colorClasses[colorScheme] || colorClasses.yellow;

  return (
    <header className={`bg-white/90 backdrop-blur-sm shadow-sm border-b ${colors.split(' ')[0]} sticky top-0 z-50`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onBack}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${colors.split(' ').slice(1).join(' ')}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">{backText}</span>
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="w-32"></div>
        </div>
      </div>
    </header>
  );
};

// Универсальный компонент уведомлений
export const NotificationBanner = ({ 
  type = 'success', // success, error
  message,
  onClose
}) => {
  const typeClasses = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800'
  };

  return (
    <div className={`mb-6 p-4 border rounded-lg flex items-center justify-between ${typeClasses[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-sm opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
};