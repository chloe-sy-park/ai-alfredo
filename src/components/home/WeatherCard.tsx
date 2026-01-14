import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { WeatherData, getWeather, getTempAdvice } from '../../services/weather';

export default function WeatherCard() {
  var [weather, setWeather] = useState<WeatherData | null>(null);
  var [isLoading, setIsLoading] = useState(true);

  useEffect(function() {
    loadWeather();
  }, []);

  async function loadWeather() {
    setIsLoading(true);
    try {
      var data = await getWeather();
      setWeather(data);
    } catch (e) {
      console.error('Failed to load weather:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    localStorage.removeItem('alfredo_weather');
    await loadWeather();
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-100 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  var tempAdvice = getTempAdvice(weather.temp);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 날씨 아이콘 */}
          <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">{weather.icon}</span>
          </div>
          
          {/* 온도와 설명 */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{weather.temp}°</span>
              <span className="text-sm text-gray-400">
                체감 {weather.feelsLike}°
              </span>
            </div>
            <p className="text-sm text-gray-500">{weather.description}</p>
          </div>
        </div>

        {/* 최고/최저 & 새로고침 */}
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">
            <span className="text-red-400">{weather.high}°</span>
            {' / '}
            <span className="text-blue-400">{weather.low}°</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 알프레도의 조언 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          🐧 {tempAdvice}
        </p>
      </div>
    </div>
  );
}
