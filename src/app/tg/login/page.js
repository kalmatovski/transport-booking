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
  const calledRef = useRef(false);

  // 1) попытка получить initData из разных мест
  const tryGetInitData = () => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (tg?.initData && tg.initData.length > 0) {
      return tg.initData; // самый надёжный путь
    }
    // fallback: некоторые клиенты кладут initData в hash как tgWebAppData
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && hash.startsWith('#')) {
      const params = new URLSearchParams(hash.slice(1));
      const raw = params.get('tgWebAppData') || params.get('tgWebAppDataUrlEncoded') || '';
      if (raw) return decodeURIComponent(raw);
    }
    return '';
    // при желании можно ещё смотреть tg.initDataUnsafe?.user, но для сервера нужен именно raw-строковый initData
  };

  // 2) ждём появления initData до ~8 секунд
  

  useEffect(() => {
    const run = async () => {
      if (calledRef.current) return;
      calledRef.current = true;
      const waitForInitData = async (timeoutMs = 8000, stepMs = 50) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const raw = tryGetInitData();
      if (raw) return raw;
      await new Promise(r => setTimeout(r, stepMs));
    }
    return '';
  };

      try {
        // Не блокируемся на загрузке SDK — объект Telegram обычно уже доступен из webview
        const initData = await waitForInitData();

        if (!initData) {
          setError('Откройте страницу внутри Telegram (через кнопку бота).');
          calledRef.current = false;
          return;
        }

        // (опционально) сообщим Telegram, что всё ок
        const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
        tg?.ready?.();
        tg?.expand?.();

        // 3) логинимся на бэке — передаём именно raw initData
        const res = await authAPI.loginTelegram({ initData });
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
  }, [login, router,waitForInitData]);

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