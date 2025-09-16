// app/tg/page.js
'use client';

import { useEffect, useState } from 'react';

// Укажи свой API (Django) — домен должен быть HTTPS
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.example.com';

export default function TgPage() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window;
    if (w.Telegram?.WebApp) {
      const webapp = w.Telegram.WebApp;

      // Сообщаем Telegram, что интерфейс готов, и разворачиваем на всю высоту
      webapp.ready();
      webapp.expand();

      setTg(webapp);
      setUser(webapp.initDataUnsafe?.user || null);
      setReady(true);

      // Авторизация на бэкенде по initData (проверка подписи на Django)
      fetch(`${API_BASE}/auth/telegram/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // если используешь куки
        body: JSON.stringify({ initData: webapp.initData }),
      }).catch(() => {});
    }
  }, []);

  // Пример: BackButton, тема, события
  useEffect(() => {
    if (!tg) return;

    // BackButton закрывает WebApp
    tg.BackButton.show();
    const onBack = () => tg.close();
    tg.BackButton.onClick(onBack);

    // Применим тему к CSS-переменным
    const applyTheme = () => {
      const tp = tg.themeParams || {};
      document.documentElement.style.setProperty('--tg-bg', tp.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-text', tp.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-hint', tp.hint_color || '#666666');
      document.documentElement.style.setProperty('--tg-link', tp.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button', tp.button_color || '#2ea6ff');
      document.documentElement.style.setProperty('--tg-button-text', tp.button_text_color || '#ffffff');
    };
    applyTheme();
    tg.onEvent('themeChanged', applyTheme);

    return () => {
      tg.BackButton.offClick(onBack);
      tg.offEvent('themeChanged', applyTheme);
    };
  }, [tg]);

  const sendToBot = () =>
    tg?.sendData(JSON.stringify({ action: 'ping', t: Date.now() }));

  if (!ready) return <div style={{ padding: 16 }}>Загрузка…</div>;

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>
        Привет, {user?.first_name || 'гость'}!
      </h1>

      <div style={{
        padding: 12,
        borderRadius: 8,
        background: 'var(--tg-bg, #fff)',
        color: 'var(--tg-text, #000)',
        border: '1px solid rgba(0,0,0,0.08)'
      }}>
        <div>ID: {user?.id}</div>
        <div>Username: {user?.username || '—'}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={sendToBot}>Отправить в бота</button>
        <button onClick={() => tg?.close()}>Закрыть</button>
      </div>
    </main>
  );
}