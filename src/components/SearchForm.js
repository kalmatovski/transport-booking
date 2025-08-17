'use client';

import { MapPin, Search } from 'lucide-react';
import { Button } from './ui';
import { useRoutes } from '../hooks/useRoutes';

export function SearchForm({ 
  selectedRoute, 
  setSelectedRoute, 
  onSearch,
  isAuthenticated
}) {
  const { data: routes = [], isLoading: routesLoading } = useRoutes(isAuthenticated);

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-8 mb-8">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl mx-auto w-fit mb-4">
          <Search className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Найти поездку
        </h1>
      </div>
  
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Выбор маршрута */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            Маршрут
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-700 shadow-sm transition-all duration-200"
          >
            <option value="">Все маршруты</option>
            {routesLoading && <option>Загрузка маршрутов...</option>}
            {!routesLoading && routes.length === 0 && <option>Маршруты не найдены</option>}
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.from_city} → {route.to_city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
