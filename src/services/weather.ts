// Weather Service - 날씨 정보 제공

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  description: string;
  icon: string;
  humidity: number;
  feelsLike: number;
  high: number;
  low: number;
  updatedAt: string;
}

var STORAGE_KEY = 'alfredo_weather';
var CACHE_DURATION = 30 * 60 * 1000; // 30분 캐시

// 날씨 조건별 아이콘과 메시지
export var weatherInfo: Record<WeatherData['condition'], { icon: string; message: string }> = {
  sunny: { icon: '☀️', message: '맑은 하늘이에요! 야외 활동하기 좋아요' },
  cloudy: { icon: '☁️', message: '구름이 많아요. 우산은 필요 없을 거예요' },
  rainy: { icon: '🌧️', message: '비가 와요. 우산 꼭 챙기세요!' },
  snowy: { icon: '❄️', message: '눈이 와요! 따뜻하게 입으세요' },
  stormy: { icon: '⛈️', message: '폭풍우가 예상돼요. 외출을 피하세요' }
};

// 온도별 조언
export function getTempAdvice(temp: number): string {
  if (temp <= 0) return '얼어붙을 정도로 추워요. 따뜻하게 입고 나가세요 🧣';
  if (temp <= 10) return '쌀쌀해요. 겉옷 챙기세요 🧥';
  if (temp <= 20) return '선선해요. 가벼운 겉옷이면 충분해요 👕';
  if (temp <= 28) return '따뜻하고 좋은 날씨예요 😊';
  return '더워요! 시원하게 입고 물 많이 마시세요 💧';
}

// 캐시된 날씨 가져오기
function getCachedWeather(): WeatherData | null {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    var data = JSON.parse(stored) as WeatherData;
    var updatedAt = new Date(data.updatedAt).getTime();
    var now = Date.now();
    
    // 캐시 만료 확인
    if (now - updatedAt > CACHE_DURATION) {
      return null;
    }
    
    return data;
  } catch (e) {
    return null;
  }
}

// 날씨 저장
function saveWeather(data: WeatherData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save weather:', e);
  }
}

// 실제 API 호출 (OpenWeatherMap)
async function fetchWeatherFromAPI(lat: number, lon: number): Promise<WeatherData | null> {
  // API 키가 없으면 더미 데이터 반환
  var apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.log('No OpenWeather API key, using mock data');
    return getMockWeather();
  }
  
  try {
    var url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=metric&lang=kr';
    var response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Weather API error');
    }
    
    var json = await response.json();
    
    // OpenWeather 응답을 우리 형식으로 변환
    var condition: WeatherData['condition'] = 'sunny';
    var weatherId = json.weather[0].id;
    
    if (weatherId >= 200 && weatherId < 300) condition = 'stormy';
    else if (weatherId >= 300 && weatherId < 600) condition = 'rainy';
    else if (weatherId >= 600 && weatherId < 700) condition = 'snowy';
    else if (weatherId >= 700 && weatherId < 800) condition = 'cloudy';
    else if (weatherId === 800) condition = 'sunny';
    else if (weatherId > 800) condition = 'cloudy';
    
    var data: WeatherData = {
      temp: Math.round(json.main.temp),
      condition: condition,
      description: json.weather[0].description,
      icon: weatherInfo[condition].icon,
      humidity: json.main.humidity,
      feelsLike: Math.round(json.main.feels_like),
      high: Math.round(json.main.temp_max),
      low: Math.round(json.main.temp_min),
      updatedAt: new Date().toISOString()
    };
    
    saveWeather(data);
    return data;
  } catch (e) {
    console.error('Failed to fetch weather:', e);
    return getMockWeather();
  }
}

// 목업 날씨 데이터
function getMockWeather(): WeatherData {
  var now = new Date();
  var month = now.getMonth() + 1;
  
  // 계절별 기본 온도
  var baseTemp = 15;
  if (month >= 12 || month <= 2) baseTemp = -2;
  else if (month >= 3 && month <= 5) baseTemp = 12;
  else if (month >= 6 && month <= 8) baseTemp = 28;
  else baseTemp = 15;
  
  // 약간의 랜덤성
  var temp = baseTemp + Math.floor(Math.random() * 6) - 3;
  
  // 랜덤 날씨 조건
  var conditions: WeatherData['condition'][] = ['sunny', 'sunny', 'cloudy', 'cloudy', 'rainy'];
  if (month >= 12 || month <= 2) {
    conditions = ['cloudy', 'snowy', 'snowy', 'sunny', 'cloudy'];
  }
  var condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temp: temp,
    condition: condition,
    description: weatherInfo[condition].message.split('.')[0],
    icon: weatherInfo[condition].icon,
    humidity: 50 + Math.floor(Math.random() * 30),
    feelsLike: temp - 2,
    high: temp + 3,
    low: temp - 5,
    updatedAt: new Date().toISOString()
  };
}

// 위치 기반 날씨 가져오기
export async function getWeather(): Promise<WeatherData> {
  // 캐시 확인
  var cached = getCachedWeather();
  if (cached) {
    return cached;
  }
  
  // 위치 권한 확인 후 API 호출
  return new Promise(function(resolve) {
    if (!navigator.geolocation) {
      resolve(getMockWeather());
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var weather = await fetchWeatherFromAPI(lat, lon);
        resolve(weather || getMockWeather());
      },
      function() {
        // 위치 권한 거부시 서울 기본값
        fetchWeatherFromAPI(37.5665, 126.9780).then(function(weather) {
          resolve(weather || getMockWeather());
        });
      },
      { timeout: 5000 }
    );
  });
}

// 날씨 기반 브리핑 메시지
export function getWeatherBriefing(weather: WeatherData): string {
  var conditionMsg = weatherInfo[weather.condition].message;
  return weather.icon + ' ' + weather.temp + '°, ' + conditionMsg;
}
