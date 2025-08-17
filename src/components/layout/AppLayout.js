'use client';

import { Header } from './Header';

export function AppLayout({ children, showHeader = true, showMinimalHeader = false }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {showHeader && <Header showMinimal={showMinimalHeader} />}
      {children}
    </div>
  );
}
