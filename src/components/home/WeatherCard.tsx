import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { WeatherData, getWeather, getTempAdvice } from '../../services/weather';

export default function WeatherCard() {
  var [weather, setWeather] = useState<WeatherData | null>(null);
  var [isLoading, setIsLoading] = useState(true);
  var [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
    localStorage.removeItem('alfredo_weather');
    try {
      var data = await getWeather();
      setWeather(data);
    } catch (e) {
      console.error('Failed to refresh weather:', e);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-[#F5F5F5] rounded w-20 mb-2" />
            <div className="h-3 bg-[#F5F5F5] rounded w-32" />
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
    <div className="bg-white rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 날씨 아이콘 - 48x48 */}
          <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">{weather.icon}</span>
          </div>
          
          {/* 온도와 설명 */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1A1A1A]">{weather.temp}°</span>
              <span className="text-sm text-[#999999]">
                체감 {weather.feelsLike}°
              </span>
            </div>
            <p className="text-sm text-[#666666]">{weather.description}</p>
          </div>
        </div>

        {/* 최고/최저 & 새로고침 */}
        <div className="text-right">
          <div className="text-sm text-[#999999] mb-1">
            <span className="text-[#EF4444]">{weather.high}°</span>
            {' / '}
            <span className="text-[#60A5FA]">{weather.low}°</span>
          </div>
          {/* 새로고침 버튼 - 48x48 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-12 h-12 flex items-center justify-center text-[#999999] hover:text-[#666666] hover:bg-[#F5F5F5] rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 알프레도의 조언 */}
      <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
        <p className="text-sm text-[#666666]">
          🐧 {tempAdvice}
        </p>
      </div>
    </div>
  );
}
