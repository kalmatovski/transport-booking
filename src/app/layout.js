import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '../components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata = {
  title: 'TransportBook - Бронирование поездок',
  description: 'Удобное бронирование поездок между Красноярском и Абаканом',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={inter.className} suppressHydrationWarning={true}>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}