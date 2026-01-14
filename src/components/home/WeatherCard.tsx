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
      <div className="bg-white rounded-[16px] p-[16px] shadow-card">
        <div className="flex items-center gap-[12px] animate-pulse">
          <div className="w-[48px] h-[48px] bg-neutral-100 rounded-full" />
          <div className="flex-1">
            <div className="h-[16px] bg-neutral-100 rounded w-[80px] mb-[8px]" />
            <div className="h-[12px] bg-neutral-100 rounded w-[128px]" />
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
    <div className="bg-white rounded-[16px] p-[16px] shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          {/* 날씨 아이콘 - 48x48 */}
          <div className="w-[48px] h-[48px] bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">{weather.icon}</span>
          </div>
          
          {/* 온도와 설명 */}
          <div>
            <div className="flex items-baseline gap-[8px]">
              <span className="text-2xl font-bold">{weather.temp}°</span>
              <span className="text-sm text-neutral-400">
                체감 {weather.feelsLike}°
              </span>
            </div>
            <p className="text-sm text-neutral-500">{weather.description}</p>
          </div>
        </div>

        {/* 최고/최저 & 새로고침 */}
        <div className="text-right">
          <div className="text-sm text-neutral-400 mb-[4px]">
            <span className="text-red-400">{weather.high}°</span>
            {' / '}
            <span className="text-blue-400">{weather.low}°</span>
          </div>
          {/* 새로고침 버튼 - 44px 터치 영역 */}
          <button
            onClick={handleRefresh}
            className="w-[44px] h-[44px] flex items-center justify-center text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 알프레도의 조언 */}
      <div className="mt-[12px] pt-[12px] border-t border-neutral-100">
        <p className="text-sm text-neutral-500">
          🐧 {tempAdvice}
        </p>
      </div>
    </div>
  );
}
