'use client';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  MapPin, Users, Star, Phone, MessageCircle, Car as CarIcon, Info, Menu
} from 'lucide-react';
import { Card, CardContent, Button } from './ui';
import { DriverInfo } from './DriverInfo';
import { DriverRating } from './DriverRating';
import { useDriver } from '../hooks/useDrivers';

const formatKGS = (v) => `${Number(v || 0).toLocaleString('ru-RU')} с`;
const hhmm = (iso) =>
  iso ? new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '--:--';
const ddd = (iso) =>
  iso ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', weekday: 'short' }).format(new Date(iso)).replace('.','') : '';

function useContainerWidth(min = 0) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect?.width ?? ref.current.offsetWidth;
      setW(box);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w, below: (x) => w > min && w < x };
}

const SeatDots = ({ total = 5 }) => (
  <div className="flex gap-2 shrink-0 whitespace-nowrap" aria-hidden>
    {Array.from({ length: Math.max(1, total) }).map((_, i) => (
      <span key={i} className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400/70" />
    ))}
  </div>
);

function Dropdown({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="relative z-50">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-[280px] rounded-xl border border-slate-200 bg-white shadow-xl p-3">
        {children}
      </div>
    </div>
  );
}

const TripCard = memo(({ trip, onBooking }) => {
  const { ref, below } = useContainerWidth();
  const compact = below(390);

  const [moreOpen, setMoreOpen] = useState(false);
  const toggleMore = () => setMoreOpen((v) => !v);

  const handleBookingClick = useCallback(() => onBooking(trip), [trip, onBooking]);
  const from = trip?.route?.from_city ?? '—';
  const to = trip?.route?.to_city ?? '—';
  const depTime = hhmm(trip?.departure_time);
  const arrTime = hhmm(trip?.arrival_time);
  const depDate = ddd(trip?.departure_time);
  const arrDate = ddd(trip?.arrival_time);


// ...внутри TripCard:
const driverId = trip?.driver;
const { data: driver, isLoading: driverLoading } = useDriver(driverId);


const normalizeTel = (s) => (s || '').toString().trim().replace(/[^\d+]/g, '');

const phoneRaw =
  driver?.phone ||
  trip?.driver_phone; // если вдруг есть фолбэк в trip

const tgUsernameRaw =
  driver?.tg_contacts || driver?.username; // у тебя часто хранится username в tg_contacts

const tgId = driver?.telegram_id; // если ты сохраняешь telegram_id в User

const phoneTel = phoneRaw ? normalizeTel(phoneRaw) : null;
const tgUsername = tgUsernameRaw ? tgUsernameRaw.replace(/^@/, '') : null;

const hasPhone = Boolean(phoneTel);
const hasTG = Boolean(tgUsername || tgId);

const openPhone = useCallback(() => {
  if (!hasPhone) return;
  window.location.href = `tel:${phoneTel}`;
}, [hasPhone, phoneTel]);

const openTelegram = useCallback(() => {
  if (!hasTG) return;
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  if (tgUsername) {
    const url = `https://t.me/${tgUsername}`;
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  if (tgId) {
    const url = `tg://user?id=${tgId}`;
    if (tg?.openTelegramLink) tg.openTelegramLink(url);
    else window.location.href = url;
  }
}, [hasTG, tgUsername, tgId]);

  return (
    <Card
      ref={ref}
      className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 sm:p-5 hover:shadow-md transition overflow-hidden"
      style={{ WebkitTextSizeAdjust: '100%' }}
    >
      <CardContent className="p-0 tabular-nums">
        {/* Шапка */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="absolute left-3 top-7 bottom-8 border-l-2 border-dotted border-emerald-300" />
                <div className="flex flex-col gap-7">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="leading-tight min-w-0">
                      <div className="text-[10px] text-slate-500">{depDate}</div>
                      <div className="text-[24px] font-semibold leading-none whitespace-nowrap">{depTime}</div>
                      <div className="text-slate-600 text-sm sm:text-base break-keep hyphens-none truncate">{from}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="leading-tight min-w-0">
                      <div className="text-[10px] text-slate-500">{arrDate}</div>
                      <div className="text-[24px] font-semibold leading-none whitespace-nowrap">{arrTime}</div>
                      <div className="text-slate-600 text-sm sm:text-base break-keep hyphens-none truncate">{to}</div>
                    </div>
                  </div>
                </div>
              </div>

        
              {/* <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="flex flex-col space-y-2 min-w-0">
                  <DriverInfo driverId={trip.driver} className="truncate" />
                  <div className="flex items-center gap-1 text-amber-500 text-sm shrink-0">
                    <Star className="h-4 w-4" />
                    <DriverRating driverId={trip.driver} showLabel={false} size="sm" />
                  </div>
                </div>

                {!compact && (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <CarIcon className="h-5 w-5 text-slate-400" />
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
                      <SeatDots total={trip.available_seats || 5} />
                      <div className="flex items-center gap-1 text-slate-500 text-sm shrink-0">
                        <Users className="w-4 h-4" />
                        {trip.available_seats ?? 0}
                      </div>
                    </div>
                  </>
                )}
              </div>  */}
            </div>
          </div>

          {/* Цена + бургер */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-emerald-600 font-extrabold text-xl sm:text-2xl leading-none whitespace-nowrap">
              {formatKGS(trip?.price)}
            </div>
            {compact && (
              <div className="relative">
                <button
                  onClick={toggleMore}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50"
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                >
                  <Menu className="w-4 h-4" />
                  Ещё
                </button>

                <Dropdown open={moreOpen} onClose={() => setMoreOpen(false)}>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <CarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{trip?.car?.brand || '—'}</div>
                      {(trip?.car?.model || trip?.car?.year) && (
                        <div className="text-xs text-slate-500 truncate">
                          {[trip?.car?.model, trip?.car?.year].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Мест: {trip.available_seats ?? 0}
                    </div>
                    <SeatDots total={trip.available_seats || 5} />
                  </div>

                  {trip.notes && (
                    <div className="mt-3 bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-xs text-slate-700 leading-snug">
                      <div className="flex items-center gap-1.5 mb-1 text-blue-700">
                        <Info className="w-4 h-4" /> Примечание
                      </div>
                      {trip.notes}
                    </div>
                  )}
                </Dropdown>
              </div>
            )}
          </div>
        </div>

        {/* Примечания (не в компакт) */}
        {!compact && trip.notes && (
          <div className="mt-3 sm:mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm text-slate-700 break-keep hyphens-none">
            {trip.notes}
          </div>
        )}

          {/* Действия */}
<div className="flex flex-col sm:flex-row gap-2 mt-3">
  <button
    onClick={hasPhone ? openPhone : undefined}
    disabled={!hasPhone || driverLoading}
    className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2 transition ${
      hasPhone && !driverLoading
        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
    }`}
    aria-disabled={!hasPhone || driverLoading}
    title={hasPhone ? `Позвонить ${phoneTel}` : 'Телефон не указан'}
  >
    <Phone className="w-4 h-4" />
    <span className="truncate">{driverLoading ? 'Загрузка…' : 'Позвонить'}</span>
  </button>

  <button
    onClick={hasTG ? openTelegram : undefined}
    disabled={!hasTG || driverLoading}
    className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2 transition ${
      hasTG && !driverLoading
        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
    }`}
    aria-disabled={!hasTG || driverLoading}
    title={hasTG ? 'Открыть чат в Telegram' : 'TG контакт не указан'}
  >
    <MessageCircle className="w-4 h-4" />
    <span className="truncate">{driverLoading ? 'Загрузка…' : 'Написать'}</span>
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