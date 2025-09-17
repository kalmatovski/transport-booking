'use client';
import { usePathname } from 'next/navigation';

export default function useTgPrefix() {
  const pathname = usePathname();
  return pathname?.startsWith('/tg') ? '/tg' : '';
}