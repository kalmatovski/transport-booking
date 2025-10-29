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
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const calledRef = useRef(false);

  // Ждём появления Telegram.WebApp и initData (поллинг с таймаутом)
  const waitForTelegram = async (timeoutMs = 3000, stepMs = 50) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
      // initDataUnsafe.user часто доступен раньше; initData — строка, может прийти с задержкой
      if (tg && (tg.initData?.length || tg.initDataUnsafe?.user)) {
        return tg;
      }
      await new Promise(r => setTimeout(r, stepMs));
    }
    return null;
  };

  useEffect(() => {
    const run = async () => {
      if (calledRef.current || !sdkLoaded) return;
      calledRef.current = true;

      try {
        const tg = await waitForTelegram();
        if (!tg) {
          setError('Откройте страницу внутри Telegram (через кнопку бота).');
          calledRef.current = false;
          return;
        }

        // На всякий случай .ready и .expand
        tg.ready?.();
        tg.expand?.();

        const initData = tg.initData || ''; // если вдруг пусто, бек сам проверит
        const res = await authAPI.loginTelegram({ initData });
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
  }, [sdkLoaded, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/30">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />
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