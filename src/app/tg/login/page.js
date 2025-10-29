'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/lib/notify';
import { authAPI } from '@/lib/api';

export default function TgLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState(null);
  const calledRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (calledRef.current) return;
      calledRef.current = true;

      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
      if (!tg || !tg.initData) {
        setError('Откройте страницу внутри Telegram (через кнопку бота).');
        calledRef.current = false;
        return;
      }

      try {
        tg.ready?.();
        tg.expand?.();

        const res = await authAPI.loginTelegram({ initData: tg.initData });
        const { access, refresh, user } = res.data;

        login(user, access, refresh);
        notify.success('Вход через Telegram выполнен!');
        router.replace('/'); // переход только при успехе
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          (e?.response?.data?.non_field_errors && e.response.data.non_field_errors[0]) ||
          'Не удалось войти через Telegram.';
        setError(msg);
        calledRef.current = false;
      }
    };

    run();
  }, [login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/30">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl border border-white/30 w-full max-w-md text-white">
        <h1 className="text-2xl font-semibold mb-4">Вход через Telegram</h1>
        {!error ? (
          <div className="opacity-80 animate-pulse">Идёт авторизация…</div>
        ) : (
          <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}