'use client';

import { useRouter } from 'next/navigation';
import useTgRouter from '@/lib/useTgRouter';

import Image from 'next/image';
import { Car, Users, MapPin, DollarSign, UserPlus, User } from 'lucide-react';
import { Button } from './ui';

export function WelcomeBanner() {
  const router = useTgRouter();

  return (
    <div className="text-center py-2 lg:py-4 flex justify-center items-center min-h-fit relative md:mt-0 mt-20">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 lg:p-12 mb-4 md:mb-8 border border-white/40 shadow-2xl relative overflow-hidden w-full max-w-5xl mx-auto z-0">
        {/* Декоративные элементы */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-8 left-8 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-12 w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-12 left-16 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 md:mb-4">
            Б и б и к а
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-3 md:mb-8 max-w-2xl mx-auto px-2">
            Удобное бронирование поездок по всей стране
          </p>
          <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10 max-w-4xl mx-auto px-2">
            <div className="text-center bg-white/30 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/40">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-3 md:p-4 rounded-xl md:rounded-2xl mx-auto w-fit mb-3 md:mb-4">
                <MapPin className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 md:mb-2 text-base md:text-lg">Удобные маршруты</h3>
              <p className="text-slate-600 text-sm md:text-base">Между городами</p>
            </div>
            <div className="text-center bg-white/30 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/40">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-3 md:p-4 rounded-xl md:rounded-2xl mx-auto w-fit mb-3 md:mb-4">
                <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 md:mb-2 text-base md:text-lg">Выгодные цены</h3>
              <p className="text-slate-600 text-sm md:text-base">Экономьте на поездках</p>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-2">
            <Button
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Начать путешествие
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50/80 px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg backdrop-blur-sm bg-white/40"
            >
              <User className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              У меня есть аккаунт
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
