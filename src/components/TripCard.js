'use client';
import React, { memo, useCallback } from 'react';
import { MapPin, Users, Star, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent, Button } from './ui';
import { DriverInfo } from './DriverInfo';
import { DriverRating } from './DriverRating';

const formatKGS = (v) => `${Number(v || 0).toLocaleString('ru-RU')} с`;
const hhmm = (iso) =>
  iso ? new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '--:--';
const ddd = (iso) =>
  iso
    ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', weekday: 'short' })
        .format(new Date(iso))
        .replace('.', '')
    : '';

const SeatDots = ({ total = 5 }) => (
  <div className="flex gap-2 shrink-0">
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400/70" />
    ))}
  </div>
);

const TripCard = memo(({ trip, onBooking }) => {
  const handleBookingClick = useCallback(() => onBooking(trip), [trip, onBooking]);

  const from = trip?.route?.from_city ?? '—';
  const to = trip?.route?.to_city ?? '—';
  const depTime = hhmm(trip?.departure_time);
  const arrTime = hhmm(trip?.arrival_time);
  const depDate = ddd(trip?.departure_time);
  const arrDate = ddd(trip?.arrival_time);

  return (
    <Card className="rounded-[22px] bg-white shadow-sm ring-1 ring-slate-200 p-4 sm:p-5 hover:shadow-md transition">
      <CardContent className="p-0">
        {/* Верхний блок: адаптивная сетка */}
        <div className="
          grid gap-4 items-center
          grid-cols-[84px_1fr] sm:grid-cols-[100px_minmax(0,1fr)_auto]
        ">
          {/* Левая линия */}
          <div className="relative">
            <div className="absolute left-4 top-8 bottom-10 border-l-2 border-dotted border-emerald-300" />
            <div className="flex flex-col gap-8 sm:gap-10">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] text-slate-500">{depDate}</div>
                  <div className="text-[24px] sm:text-[26px] font-semibold leading-none">{depTime}</div>
                  <div className="text-slate-600 text-sm sm:text-base">{from}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] text-slate-500">{arrDate}</div>
                  <div className="text-[24px] sm:text-[26px] font-semibold leading-none">{arrTime}</div>
                  <div className="text-slate-600 text-sm sm:text-base">{to}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Центр (min-w-0, чтобы не распирало) */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <DriverInfo driverId={trip.driver} className="truncate" />
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-sm shrink-0">
                <Star className="h-4 w-4" />
                <DriverRating driverId={trip.driver} showLabel={false} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-slate-400 text-lg">🚘</span>
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-slate-700 font-medium truncate">{trip?.car?.brand || '—'}</div>
                {(trip?.car?.model || trip?.car?.year) && (
                  <div className="text-sm text-slate-500 truncate">
                    {[trip?.car?.model, trip?.car?.year].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between min-w-0">
              <SeatDots total={Math.max(1, trip.available_seats || 5)} />
              <div className="flex items-center gap-1 text-slate-500 text-sm shrink-0">
                <Users className="w-4 h-4" />
                {trip.available_seats ?? 0}
              </div>
            </div>
          </div>

          {/* Цена: на мобиле на новой строке, справа */}
          <div className="col-span-2 sm:col-span-1 flex justify-end items-start">
            <div className="text-emerald-600 font-bold text-xl sm:text-2xl leading-none whitespace-nowrap">
              {formatKGS(trip?.price)}
            </div>
          </div>
        </div>

        {/* Примечания */}
        {trip.notes && (
          <div className="mt-3 sm:mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm text-slate-700">
            {trip.notes}
          </div>
        )}

        {/* Кнопки действий — сохраняем функционал */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-2 text-slate-700 hover:bg-slate-50">
            <Phone className="w-4 h-4" />
            Позвонить
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-2 text-slate-700 hover:bg-slate-50">
            <MessageCircle className="w-4 h-4" />
            Написать
          </button>
        </div>

        <Button
          onClick={handleBookingClick}
          disabled={trip.status !== 'available' || trip.available_seats < 1}
          className={`w-full mt-3 rounded-xl py-3 font-semibold text-base shadow-sm hover:shadow-md transition ${
            trip.status === 'available' && trip.available_seats >= 1
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {trip.status !== 'available' ? 'Недоступно' : trip.available_seats < 1 ? 'Мест нет' : 'Забронировать'}
        </Button>
      </CardContent>
    </Card>
  );
});

TripCard.displayName = 'TripCard';
export default TripCard;