// app/tg/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TgEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // просто ведём на обычный корень
  }, [router]);

  return null;
}