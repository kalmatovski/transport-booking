'use client';

export function formatTime(dateTimeString, locale = 'ru-RU') {
  if (!dateTimeString) return '';
  const d = new Date(dateTimeString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateTimeString, locale = 'ru-RU') {
  if (!dateTimeString) return '';
  const d = new Date(dateTimeString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateTimeString, locale = 'ru-RU') {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Сегодня, ${formatTime(dateTimeString, locale)}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Завтра, ${formatTime(dateTimeString, locale)}`;
  }
  return `${formatDate(dateTimeString, locale)}, ${formatTime(dateTimeString, locale)}`;
}
