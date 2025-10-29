'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { notify } from '@/lib/notify';
import { authAPI } from '@/lib/api';

export default function TgLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const calledRef = useRef(false);

  // ждем загрузку SDK, если он подключен через Script в layout
  useEffect(() => {
    // если SDK уже есть — ок
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setSdkReady(true);
      return;
    }
    // fallback: подождём немного появления объекта
    const t = setInterval(() => {
      if (window.Telegram?.WebApp) {
        setSdkReady(true);
        clearInterval(t);
      }
    }, 50);
    const stop = setTimeout(() => clearInterval(t), 5000);
    return () => { clearInterval(t); clearTimeout(stop); };
  }, []);

  // 1) забираем initData из WebApp
  const tryGetInitDataRaw = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initData && tg.initData.length > 0) return tg.initData;

    // 2) fallback: из location.hash как ЕСТЬ (НЕ декодировать!)
    const hash = window.location.hash || '';
    if (hash.startsWith('#')) {
      const params = new URLSearchParams(hash.slice(1));
      // у разных клиентов имя может отличаться
      const raw = params.get('tgWebAppData') || params.get('tgWebAppDataUrlEncoded') || '';
      if (raw) return raw; 
    }
    return '';
  };

  const waitForInitData = async (timeoutMs = 8000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const raw = tryGetInitDataRaw();
      if (raw) return raw;
      await new Promise(r => setTimeout(r, 50));
    }
    return '';
  };

  useEffect(() => {
    const run = async () => {
      if (!sdkReady || calledRef.current) return;
      calledRef.current = true;

      try {
        const initData = await waitForInitData();
        if (!initData) {
          setError('Откройте страницу внутри Telegram (через кнопку бота).');
          calledRef.current = false;
          return;
        }

        const tg = window.Telegram?.WebApp;
        tg?.ready?.();
        tg?.expand?.();

        const res = await authAPI.loginTelegram({ initData }); // передаём СЫРОЙ initData
        const { access, refresh, user } = res.data;

        login(user, access, refresh);
        notify.success('Вход через Telegram выполнен!');
        router.replace('/');
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
  }, [sdkReady, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/30">
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