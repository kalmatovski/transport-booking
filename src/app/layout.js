import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '../components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata = {
  title: 'TransportBook - Бронирование поездок',
  description: 'Удобное бронирование поездок между Красноярском и Абаканом',
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