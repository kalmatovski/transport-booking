'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Star, X, Send } from 'lucide-react';
import { ratingsAPI, authAPI, ridesAPI } from '../lib/api';
import { Button, Card, CardContent } from './ui';

export function RatingModal({ tripId, driverId, trip, driver, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  // Получаем данные о поездке
  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => ridesAPI.getTrip(tripId).then(res => res.data),
    enabled: !!tripId,
  });

  // Получаем данные водителя, если их нет
  const { data: driverData } = useQuery({
    queryKey: ['driver', driverId || tripData?.driver],
    queryFn: () => authAPI.getUser(driverId || tripData?.driver).then(res => res.data),
    enabled: !!(driverId || tripData?.driver) && !driver,
  });

  const driverInfo = driver || driverData;
  const actualDriverId = driverId || tripData?.driver;
  const actualTrip = trip || tripData;

  const ratingMutation = useMutation({
    mutationFn: (data) => ratingsAPI.createRating({
      trip: tripId,
      driver: actualDriverId,
      score: data.rating,
      comment: data.comment
    }),
    onSuccess: () => {
      // Инвалидируем все связанные кеши
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['driverRating', actualDriverId] });
      queryClient.invalidateQueries({ queryKey: ['available-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
      
      // Принудительно рефетчим данные рейтинга
      queryClient.refetchQueries({ queryKey: ['driverRating', actualDriverId] });
      
      onClose();
      setRating(0);
      setComment('');
    },
    onError: (error) => {
      console.error('Rating error:', error);
      console.error('Error response:', error.response?.data);
      alert(`Ошибка при отправке оценки: ${error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Пожалуйста, поставьте оценку');
      return;
    }
    ratingMutation.mutate({
      rating,
      comment: comment.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Оценить поездку</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">
              Маршрут: {actualTrip?.route?.from_city || 'Неизвестно'} → {actualTrip?.route?.to_city || 'Неизвестно'}
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Водитель: {driverInfo?.first_name || 'Неизвестно'} {driverInfo?.last_name || ''}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Ваша оценка
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  {rating === 1 && 'Очень плохо'}
                  {rating === 2 && 'Плохо'}
                  {rating === 3 && 'Нормально'}
                  {rating === 4 && 'Хорошо'}
                  {rating === 5 && 'Отлично'}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Комментарий (необязательно)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о своих впечатлениях от поездки..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">
                {comment.length}/500 символов
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={ratingMutation.isPending}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                disabled={rating === 0 || ratingMutation.isPending}
              >
                {ratingMutation.isPending ? (
                  'Отправка...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Отправить
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RatingModal;
