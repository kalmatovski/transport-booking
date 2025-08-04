'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { routesAPI } from '../../../lib/api';
import { Button, Card, CardContent, LoadingSpinner } from '../../../components/ui';
import { MapPin, Search } from 'lucide-react';

export default function RoutesTestPage() {
  const [searchParams, setSearchParams] = useState({
    from_city: '',
    to_city: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  // Query для поиска маршрутов
  const { 
    data: routes, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['routes-search', searchParams],
    queryFn: () => routesAPI.searchRoutes(searchParams),
    enabled: isSearching,
    select: (data) => data.data
  });

  const handleSearch = () => {
    setIsSearching(true);
    refetch();
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Тест API маршрутов</h1>
        
        {/* Форма поиска */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Откуда
                </label>
                <input
                  type="text"
                  value={searchParams.from_city}
                  onChange={(e) => handleInputChange('from_city', e.target.value)}
                  placeholder="Москва"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Куда
                </label>
                <input
                  type="text"
                  value={searchParams.to_city}
                  onChange={(e) => handleInputChange('to_city', e.target.value)}
                  placeholder="Санкт-Петербург"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Поиск
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Результаты */}
        <div>
          {isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Ошибка</h3>
                <p className="text-red-600">
                  {error.response?.data?.detail || error.message || 'Произошла ошибка при поиске'}
                </p>
              </CardContent>
            </Card>
          )}

          {routes && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                Найдено маршрутов: {routes.count}
              </h2>
              
              <div className="grid gap-4">
                {routes.results.map((route) => (
                  <Card key={route.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-lg">
                              {route.from_city} → {route.to_city}
                            </p>
                            {route.distance_km && (
                              <p className="text-sm text-gray-600">
                                Расстояние: {route.distance_km} км
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs text-gray-500">ID: {route.id}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
