// Weather API - OpenWeatherMap proxy

import { setCorsHeaders } from './_cors.js';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var lat = req.query.lat;
  var lon = req.query.lon;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon required' });
  }

  var apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    // Fallback: 서울 기본 날씨 (API 키 없을 때)
    return res.status(200).json({
      main: {
        temp: 5,
        feels_like: 2,
        humidity: 60
      },
      weather: [{
        description: 'clear sky',
        icon: '01d'
      }],
      wind: { speed: 3 },
      name: '서울'
    });
  }

  try {
    var url = 'https://api.openweathermap.org/data/2.5/weather?' +
      'lat=' + lat +
      '&lon=' + lon +
      '&appid=' + apiKey +
      '&units=metric' +
      '&lang=en';

    var response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('OpenWeather API error: ' + response.status);
    }

    var data = await response.json();
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Weather API error:', error);
    return res.status(500).json({ error: 'Failed to fetch weather' });
  }
}
