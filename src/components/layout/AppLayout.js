'use client';

import { Header } from './Header';

export function AppLayout({ children, showHeader = true }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {showHeader && <Header />}
      {children}
    </div>
  );
}
