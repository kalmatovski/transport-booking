'use client';

import { useRouter } from 'next/navigation';
import { Car, Users, MapPin, DollarSign, UserPlus, User } from 'lucide-react';
import { Button } from './ui';

export function WelcomeBanner() {
  const router = useRouter();

  return (
    <div className="text-center lg:py-4">
      <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-12 mb-8 border border-white/40 shadow-2xl relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-8 left-8 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-12 w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-12 left-16 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative z-10">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg mx-auto w-fit mb-6">
            <Car className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            TransportBook
          </h1>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Удобное бронирование поездок по всей стране
          </p>
          
          {/* Преимущества */}
          <div className="grid md:grid-cols-3 gap-8 mb-10 max-w-4xl mx-auto">
            <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-4 rounded-2xl mx-auto w-fit mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Найти попутчиков</h3>
              <p className="text-slate-600">Быстро и безопасно</p>
            </div>
            <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-4 rounded-2xl mx-auto w-fit mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Удобные маршруты</h3>
              <p className="text-slate-600">Между городами</p>
            </div>
            <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-4 rounded-2xl mx-auto w-fit mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Выгодные цены</h3>
              <p className="text-slate-600">Экономьте на поездках</p>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Начать путешествие
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50/80 px-8 py-3 text-lg backdrop-blur-sm bg-white/40"
            >
              <User className="w-5 h-5 mr-2" />
              У меня есть аккаунт
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
