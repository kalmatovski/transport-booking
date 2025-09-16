// app/tg/layout.js
import Script from 'next/script';

export const metadata = {
  title: 'Бибика — Telegram',
};

export default function TgLayout({ children }) {
  // Это "внутренний" layout: НЕ рендерит <html>/<body>, их даёт RootLayout
  return (
    <>
      {/* Подключаем Telegram SDK ДО инициализации страницы */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}