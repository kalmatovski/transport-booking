// src/lib/useTgRouter.js
'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function useTgRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const prefix = pathname?.startsWith('/tg') ? '/tg' : '';

  return {
    push: (url) => router.push(prefix + url),
    replace: (url) => router.replace(prefix + url),
    back: () => router.back(),
  };
}