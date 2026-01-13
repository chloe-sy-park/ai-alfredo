// 알프레도 브리핑 엔진
// 시간대, 완료율, 에너지 등을 기반으로 맞춤 브리핑 생성

var MORNING_GREETINGS = [
  '좋은 아침이에요! ☀️',
  '오늘도 화이팅! 🌅',
  '새로운 하루가 시작됐어요! ✨',
  '활기찬 아침이에요! 🌈'
];

var AFTERNOON_GREETINGS = [
  '오후도 힘내요! 💪',
  '점심은 맛있게 드셨나요? 🍱',
  '오후 슬럼프 조심! ☕',
  '절반 지났어요, 조금만 더! 🎯'
];

var EVENING_GREETINGS = [
  '하루 마무리 잘 하세요! 🌙',
  '오늘도 수고했어요! 🌟',
  '저녁 시간이네요! 🌆',
  '편안한 저녁 되세요! 🏠'
];

var NIGHT_GREETINGS = [
  '늦은 시간까지 고생이에요! 🌙',
  '오늘도 수고 많았어요! ⭐',
  '푹 쉬세요! 😴',
  '내일을 위해 충전하세요! 🔋'
];

// 시간대 판단
function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// 랜덤 선택
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 인사말 생성
function getGreeting(hour) {
  var timeOfDay = getTimeOfDay(hour);
  switch (timeOfDay) {
    case 'morning': return pickRandom(MORNING_GREETINGS);
    case 'afternoon': return pickRandom(AFTERNOON_GREETINGS);
    case 'evening': return pickRandom(EVENING_GREETINGS);
    default: return pickRandom(NIGHT_GREETINGS);
  }
}

// 진행 상황 메시지
function getProgressMessage(completedTasks, totalTasks) {
  if (totalTasks === 0) {
    return '오늘 할 일을 추가해보세요!';
  }
  
  var rate = Math.round((completedTasks / totalTasks) * 100);
  
  if (rate === 0) {
    return '아직 시작 전이에요. 첫 태스크부터 해볼까요?';
  } else if (rate < 30) {
    return '좋은 시작이에요! ' + completedTasks + '/' + totalTasks + ' 완료 📝';
  } else if (rate < 50) {
    return '잘 하고 있어요! ' + completedTasks + '/' + totalTasks + ' 완료 👍';
  } else if (rate < 80) {
    return '절반 이상 했어요! ' + completedTasks + '/' + totalTasks + ' 완료 🎯';
  } else if (rate < 100) {
    return '거의 다 왔어요! ' + completedTasks + '/' + totalTasks + ' 완료 🔥';
  } else {
    return '완벽해요! 모든 태스크 완료! 🎉';
  }
}

// 에너지 기반 조언
function getEnergyAdvice(energy) {
  if (energy >= 80) {
    return '컨디션이 좋네요! 어려운 일부터 해볼까요?';
  } else if (energy >= 60) {
    return '적당한 컨디션이에요. 꾸준히 가요!';
  } else if (energy >= 40) {
    return '좀 피곤해 보여요. 짧은 휴식 어때요?';
  } else {
    return '오늘은 무리하지 말고 천천히 가요 💜';
  }
}

// 날씨 기반 메시지
function getWeatherMessage(weather) {
  switch (weather) {
    case 'clear': return '☀️';
    case 'cloudy': return '☁️';
    case 'rain': return '🌧️ 우산 챙기세요!';
    case 'snow': return '❄️ 따뜻하게 입으세요!';
    default: return '';
  }
}

// 메인 브리핑 생성 함수
export function generateBriefing(options) {
  var completedTasks = options.completedTasks || 0;
  var totalTasks = options.totalTasks || 0;
  var hour = options.hour !== undefined ? options.hour : new Date().getHours();
  var weather = options.weather || 'clear';
  var energy = options.energy !== undefined ? options.energy : 70;
  
  var greeting = getGreeting(hour);
  var progress = getProgressMessage(completedTasks, totalTasks);
  var advice = getEnergyAdvice(energy);
  var weatherMsg = getWeatherMessage(weather);
  
  return {
    greeting: greeting,
    progress: progress,
    advice: advice,
    weather: weatherMsg,
    fullMessage: greeting + '\n' + progress,
    timeOfDay: getTimeOfDay(hour),
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}

export default { generateBriefing: generateBriefing };
