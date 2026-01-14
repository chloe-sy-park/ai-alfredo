// 날씨 서비스 (OpenWeatherMap API)

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  updatedAt: string;
}

interface CachedWeather {
  data: WeatherData;
  expiresAt: number;
}

var CACHE_KEY = 'alfredo_weather';
var CACHE_DURATION = 30 * 60 * 1000; // 30분

// 날씨 아이콘 매핑
export function getWeatherEmoji(icon: string): string {
  var iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[icon] || '🌡️';
}

// 날씨 설명 한글화
export function getWeatherDescription(description: string): string {
  var descMap: Record<string, string> = {
    'clear sky': '맑음',
    'few clouds': '구름 조금',
    'scattered clouds': '구름 많음',
    'broken clouds': '흐림',
    'overcast clouds': '흐림',
    'shower rain': '소나기',
    'rain': '비',
    'light rain': '가벼운 비',
    'moderate rain': '비',
    'heavy intensity rain': '폭우',
    'thunderstorm': '천둥번개',
    'snow': '눈',
    'light snow': '가벼운 눈',
    'mist': '안개',
    'fog': '안개',
    'haze': '연무'
  };
  return descMap[description.toLowerCase()] || description;
}

// 캐시된 날씨 가져오기
function getCachedWeather(): WeatherData | null {
  var cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  try {
    var data = JSON.parse(cached) as CachedWeather;
    if (Date.now() < data.expiresAt) {
      return data.data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 날씨 캐시 저장
function cacheWeather(data: WeatherData): void {
  var cached: CachedWeather = {
    data: data,
    expiresAt: Date.now() + CACHE_DURATION
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
}

// 위치 기반 날씨 가져오기
export async function getWeather(): Promise<WeatherData | null> {
  // 캐시 확인
  var cached = getCachedWeather();
  if (cached) return cached;
  
  try {
    // 위치 가져오기
    var position = await getCurrentPosition();
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    
    // API 호출 (Vercel serverless function 통해)
    var response = await fetch('/api/weather?lat=' + lat + '&lon=' + lon);
    
    if (!response.ok) {
      throw new Error('Weather API failed');
    }
    
    var data = await response.json();
    
    var weather: WeatherData = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
      updatedAt: new Date().toISOString()
    };
    
    cacheWeather(weather);
    return weather;
    
  } catch (error) {
    console.error('Failed to get weather:', error);
    return null;
  }
}

// 위치 권한 요청
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise(function(resolve, reject) {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000 // 5분
    });
  });
}

// 날씨 기반 조언 생성
export function getWeatherAdvice(weather: WeatherData): string {
  var temp = weather.temp;
  var icon = weather.icon;
  
  // 비/눈 체크
  if (icon.startsWith('09') || icon.startsWith('10')) {
    return '비가 올 수 있어요. 우산 챙기세요 ☔';
  }
  if (icon.startsWith('13')) {
    return '눈이 와요. 따뜻하게 입으세요 🧣';
  }
  if (icon.startsWith('11')) {
    return '천둥번개가 있어요. 실내 활동을 추천해요 ⚡';
  }
  
  // 온도 체크
  if (temp <= 0) {
    return '영하에요! 동상 조심하세요 🥶';
  }
  if (temp <= 5) {
    return '많이 추워요. 두껍게 입으세요 🧥';
  }
  if (temp <= 10) {
    return '쌀쌀해요. 겉옷 챙기세요';
  }
  if (temp >= 30) {
    return '무더워요! 수분 섭취 잊지 마세요 💧';
  }
  if (temp >= 25) {
    return '더운 날씨에요. 시원하게 입으세요';
  }
  
  return '좋은 날씨에요! 즐거운 하루 보내세요 ✨';
}
