'use client';

import { X, Play } from 'lucide-react';
import { Button } from './ui';

export function StartTripModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  trip,
  isLoading = false 
}) {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto relative">
        {/* Header */}
        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Play className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Начать поездку?</h2>
          <p className="text-gray-600">
            Вы уверены, что хотите начать поездку?<br/>
            Статус изменится на "В пути"
          </p>
        </div>

        {/* Кнопки */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            onClick={() => onConfirm(trip.id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Начинаем...
              </>
            ) : (
              'Да, начать'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
