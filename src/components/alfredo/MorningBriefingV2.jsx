import React from 'react';

// 🐧 알프레도 브리핑 시스템 V2
// theSkimm 스타일의 친근하고 자연스러운 톤
// + DNA 기반 스트레스 감지 및 톤 조절

// ============================================================
// 1. 스몰토크 패턴 (직접 묻지 않고 자연스럽게)
// ============================================================

var SMALLTALK_PATTERNS = {
  morning: {
    // 컨디션 높음 (4-5)
    high: [
      '나 어젯밤에 되게 재밌는 꿈 꿨어요. 펭귄이 날아다니는 꿈! 그래서 그런가, 오늘 기분이 좋아요 ☀️',
      '오늘 아침 공기가 참 좋더라고요. Boss도 느꼈어요?',
      '커피 한 잔 하면서 오늘 하루 같이 정리해볼까요? ☕',
      '좋은 아침이에요! 오늘은 뭔가 좋은 일이 생길 것 같은 예감이에요 ✨'
    ],
    // 컨디션 보통 (3)
    medium: [
      '좋은 아침이에요, Boss. 오늘 일정 정리해드릴게요.',
      '아침이에요! 오늘 뭐 하실지 같이 봐요.',
      '오늘도 화이팅! 제가 옆에서 도와드릴게요 💜'
    ],
    // 컨디션 낮음 (1-2)
    low: [
      '안녕하세요, Boss. 오늘은... 천천히 해도 괜찮아요.',
      '아침이에요. 컨디션이 좀 안 좋아 보여요. 무리하지 말아요 💜',
      '오늘은 좀 쉬어가도 돼요. 제가 꼭 필요한 것만 챙겨드릴게요.'
    ],
    // 컨디션 미확인 (0)
    unknown: [
      '안녕하세요, Boss! 💜 오늘 기분은 어때요?',
      '좋은 아침! 오늘 컨디션은 어떠세요?'
    ]
  },
  afternoon: {
    high: [
      '점심 잘 드셨어요? 오후도 같이 달려봐요! 💪',
      '오후예요! 에너지 충만하시네요. 뭐부터 해볼까요?'
    ],
    medium: [
      '점심 식사하셨어요? 🍚 오후 일정 봐드릴게요.',
      '오후예요, Boss. 남은 일들 정리해드릴게요.'
    ],
    low: [
      '오후인데... 좀 지쳐 보여요. 잠깐 쉬어가도 돼요.',
      '점심 후라 졸리시죠? 가벼운 것부터 해봐요.'
    ],
    unknown: [
      '오후예요, Boss! 지금 컨디션은 어때요?'
    ]
  },
  evening: {
    high: [
      '저녁이에요! 오늘 많이 하셨네요. 마무리 도와드릴게요 🌙',
      '하루가 거의 끝났어요. 오늘 수고 많으셨어요!'
    ],
    medium: [
      '저녁이 됐네요. 오늘 뭐 했는지 정리해볼까요?',
      '슬슬 하루 마무리할 시간이에요.'
    ],
    low: [
      '오늘 많이 힘드셨죠? 이제 좀 쉬어요 💜',
      '저녁이에요. 오늘은 여기까지만 해요. 내일 다시 해도 돼요.'
    ],
    unknown: [
      '저녁이에요, Boss. 오늘 하루 어땠어요?'
    ]
  },
  night: {
    high: [
      '이 시간엔 쉬어야죠! 오늘 많이 했어요 ⭐',
      '밤이에요. 오늘 정말 잘했어요. 푹 쉬세요 🌙'
    ],
    medium: [
      '밤이 깊었어요. 이만 쉬는 게 어때요?',
      '이제 쉴 시간이에요. 내일 또 봐요 🌙'
    ],
    low: [
      '밤이에요... 오늘 많이 힘드셨죠? 푹 쉬세요 💜',
      '늦었어요. 오늘은 여기까지. 내일은 더 나을 거예요.'
    ],
    unknown: [
      '늦은 밤이에요. 아직 안 주무세요?'
    ]
  }
};

// ============================================================
// 🧬 DNA 기반 스트레스 메시지
// ============================================================

var STRESS_MESSAGES = {
  burnout: {
    morning: [
      { line1: 'Boss, 요즘 많이 지쳤죠? 💜', line2: '오늘은 진짜 쉬어도 괜찮아요' },
      { line1: '캘린더 보니까 너무 바빴어요', line2: '오늘은 가볍게만 해요, 제발요 🙏' },
      { line1: '요즘 일정이 너무 빡빡했어요', line2: '쉬는 것도 일이에요. 오늘 좀 쉬어요 💜' }
    ],
    afternoon: [
      { line1: '오후예요. 무리하지 말아요', line2: '꼭 필요한 것만 천천히 💜' },
      { line1: '요즘 너무 달렸어요', line2: '오후는 가볍게 보내요' }
    ],
    evening: [
      { line1: '오늘 하루도 수고했어요 💜', line2: '이제 진짜 쉬세요. 내일은 더 나을 거예요' },
      { line1: '저녁이에요. 오늘은 여기까지!', line2: '충분히 잘하고 있어요 💜' }
    ]
  },
  high: {
    morning: [
      { line1: '요즘 바쁘시죠? 💜', line2: '오늘은 무리하지 말아요' },
      { line1: '캘린더 좀 빡빡해 보여요', line2: '가장 중요한 것만 해요' }
    ],
    afternoon: [
      { line1: '오후예요, 좀 쉬어가요', line2: '급한 것만 하고 나머지는 내일! 💜' }
    ],
    evening: [
      { line1: '오늘 많이 하셨어요', line2: '이제 좀 쉬어도 돼요 💜' }
    ]
  },
  normal: null,
  low: null
};

// ============================================================
// 🧬 DNA 기반 크로노타입 메시지
// ============================================================

var CHRONOTYPE_MESSAGES = {
  morning: {
    earlyMorning: { line1: '아침형이시죠? ☀️', line2: '지금이 골든타임! 중요한 거 먼저 해요' },
    lateMorning: { line1: '오전 집중 시간이에요!', line2: '에너지 높을 때 중요한 일 해요 💪' },
    afternoon: null,
    evening: { line1: '저녁이에요, Boss', line2: '아침형이라 피곤하시죠? 이제 쉬어요 💜' }
  },
  evening: {
    earlyMorning: { line1: '아침이에요~ ☕', line2: '저녁형이라 천천히 시작해도 돼요' },
    lateMorning: { line1: '오전이에요, 가볍게 시작해요', line2: '오후에 본격적으로 달려요!' },
    afternoon: { line1: '오후예요! 🔥', line2: '저녁형의 파워타임! 지금 집중해요' },
    evening: { line1: '저녁이에요, 에너지 충전 완료?', line2: '집중하기 좋은 시간이에요 ✨' }
  }
};

// ============================================================
// 🧬 DNA 기반 피크타임 메시지
// ============================================================

var PEAK_TIME_MESSAGES = [
  { line1: '지금이 골든타임이에요! ⚡', line2: '에너지 높을 때 중요한 일 해요' },
  { line1: '지금 집중력 최고일 때! 🔥', line2: '중요한 태스크 하나 끝내봐요' },
  { line1: '피크타임이에요! ✨', line2: '지금 시작하면 잘 될 거예요' }
];

// ============================================================
// 2. 날씨 기반 인사이트
// ============================================================

var WEATHER_INSIGHTS = {
  clear: {
    morning: '오늘 날씨 완전 좋아요! ☀️ 잠깐 바깥 바람 쐬도 좋을 것 같아요.',
    afternoon: '날씨 좋은 날, 산책하면서 머리 식히는 건 어때요?',
    evening: '저녁노을 예쁠 것 같아요 🌅',
    night: '맑은 밤하늘, 별 보기 좋겠네요 ⭐'
  },
  cloudy: {
    morning: '오늘 좀 흐리네요. 실내에서 집중하기 좋은 날이에요.',
    afternoon: '구름이 많아서 덜 덥겠어요.',
    evening: '흐린 저녁, 따뜻한 차 한 잔 어때요? ☕',
    night: '흐린 밤이에요. 포근하게 쉬세요.'
  },
  rain: {
    morning: '비 오는 날이에요 ☔ 우산 챙기셨어요?',
    afternoon: '비 오니까 나가기 싫죠? 실내에서 할 일 처리해요.',
    evening: '비 오는 저녁, 집에서 푹 쉬세요 🌧️',
    night: '비 소리 들으면서 자면 잘 잘 것 같아요.'
  },
  snow: {
    morning: '눈 오는 아침이에요! ❄️ 길 조심하세요.',
    afternoon: '눈 와서 미끄러워요. 조심조심!',
    evening: '눈 오는 저녁, 따뜻하게 있어요.',
    night: '눈 내리는 밤이네요. 내일 아침 풍경이 기대돼요 ☃️'
  },
  wind: {
    morning: '바람이 좀 세요. 따뜻하게 입고 나가세요!',
    afternoon: '바람 부니까 머리 헝클어지겠어요 💨',
    evening: '저녁 바람이 시원하네요.',
    night: '바람 소리 들려요. 따뜻하게 주무세요.'
  }
};

// ============================================================
// 3. 일정 기반 인사이트
// ============================================================

var getEventInsight = function(events, hour) {
  if (!events || events.length === 0) {
    return null;
  }
  
  var now = new Date();
  var upcomingEvents = events.filter(function(e) {
    var eventTime = new Date(e.start || e.startTime);
    var diffMin = Math.round((eventTime - now) / 60000);
    return diffMin > 0 && diffMin <= 240; // 4시간 이내
  });
  
  if (upcomingEvents.length === 0) {
    // 오늘 일정 수 기반 코멘트
    var todayEvents = events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === now.toDateString();
    });
    
    if (todayEvents.length === 0) {
      return '오늘은 일정이 없어요. 자유롭게 보내도 되는 날! 🎉';
    } else if (todayEvents.length >= 5) {
      return '오늘 일정이 많네요! (' + todayEvents.length + '개) 하나씩 해봐요.';
    }
    return null;
  }
  
  // 가장 가까운 일정
  var nextEvent = upcomingEvents[0];
  var eventTime = new Date(nextEvent.start || nextEvent.startTime);
  var diffMin = Math.round((eventTime - now) / 60000);
  var title = nextEvent.title || nextEvent.summary || '일정';
  
  if (diffMin <= 30) {
    return '⚡ ' + diffMin + '분 뒤 "' + title.slice(0, 15) + '" 있어요! 준비하세요.';
  } else if (diffMin <= 60) {
    return '📅 1시간 안에 "' + title.slice(0, 15) + '" 있어요.';
  } else {
    var hours = Math.floor(diffMin / 60);
    return '📅 ' + hours + '시간 뒤에 일정 있어요. 여유 있게 준비해요.';
  }
};

// ============================================================
// 4. 태스크 기반 인사이트
// ============================================================

var getTaskInsight = function(tasks, condition, hour) {
  if (!tasks || tasks.length === 0) {
    return {
      summary: '오늘 할 일이 없어요.',
      suggestion: '새로운 걸 시작해볼까요? 아니면 그냥 쉬어도 돼요 💜'
    };
  }
  
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var remaining = tasks.filter(function(t) { return !t.completed; }).length;
  var total = tasks.length;
  var completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  // 모두 완료
  if (remaining === 0) {
    return {
      summary: '오늘 할 일 ' + total + '개 다 끝냈어요! 🎉',
      suggestion: '정말 대단해요, Boss! 이제 좀 쉬어도 돼요.'
    };
  }
  
  // 컨디션 낮을 때
  if (condition <= 2) {
    var easiest = tasks.find(function(t) { return !t.completed && (t.priority === 'low' || !t.priority); });
    if (easiest) {
      return {
        summary: remaining + '개 남았는데... 오늘은 무리하지 말아요.',
        suggestion: '딱 하나만 해봐요: "' + easiest.title.slice(0, 15) + '"'
      };
    }
    return {
      summary: remaining + '개 남았어요.',
      suggestion: '컨디션이 안 좋으니까 꼭 필요한 것만 해요. 나머지는 내일 해도 돼요 💜'
    };
  }
  
  // 절반 이상 완료
  if (completionRate >= 50) {
    return {
      summary: '벌써 절반 넘게 했어요! (' + completed + '/' + total + ') 👏',
      suggestion: remaining + '개만 더 하면 끝! 화이팅!'
    };
  }
  
  // 저녁인데 많이 남음
  if (hour >= 17 && completionRate < 30) {
    return {
      summary: remaining + '개 남았어요.',
      suggestion: '저녁이라 시간이 촉박하네요. 가장 중요한 것 하나만 끝내봐요!'
    };
  }
  
  // 일반적인 진행 상황
  if (completed > 0) {
    return {
      summary: completed + '개 완료! ' + remaining + '개 남았어요.',
      suggestion: '잘하고 있어요! 다음 거 해볼까요?'
    };
  }
  
  // 아직 시작 안 함
  var urgent = tasks.find(function(t) { return !t.completed && t.priority === 'urgent'; });
  var high = tasks.find(function(t) { return !t.completed && t.priority === 'high'; });
  var firstTask = urgent || high || tasks.find(function(t) { return !t.completed; });
  
  return {
    summary: '오늘 할 일 ' + total + '개 있어요.',
    suggestion: firstTask 
      ? '이것부터 시작해볼까요? "' + firstTask.title.slice(0, 15) + '"'
      : '하나씩 차근차근 해봐요!'
  };
};

// ============================================================
// 5. 통합 브리핑 생성 함수
// ============================================================

export var generateMorningBriefingV2 = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var weather = props.weather;
  var emailCount = props.emailCount || 0;
  var urgentEmailCount = props.urgentEmailCount || 0;
  
  var now = new Date();
  var hour = now.getHours();
  
  // 시간대 결정
  var timeOfDay = 'morning';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  // 컨디션 레벨 결정
  var conditionLevel = 'unknown';
  if (condition === 0) conditionLevel = 'unknown';
  else if (condition <= 2) conditionLevel = 'low';
  else if (condition === 3) conditionLevel = 'medium';
  else conditionLevel = 'high';
  
  // 스몰토크 선택
  var smalltalkOptions = SMALLTALK_PATTERNS[timeOfDay][conditionLevel];
  var smalltalk = smalltalkOptions[Math.floor(Math.random() * smalltalkOptions.length)];
  
  // 날씨 인사이트
  var weatherInsight = null;
  if (weather && weather.condition) {
    var weatherPatterns = WEATHER_INSIGHTS[weather.condition];
    if (weatherPatterns) {
      weatherInsight = weatherPatterns[timeOfDay];
    }
  }
  
  // 일정 인사이트
  var eventInsight = getEventInsight(events, hour);
  
  // 태스크 인사이트
  var taskInsight = getTaskInsight(tasks, condition, hour);
  
  // 이메일 인사이트
  var emailInsight = null;
  if (urgentEmailCount > 0) {
    emailInsight = '📧 긴급 답장 필요한 메일이 ' + urgentEmailCount + '개 있어요!';
  } else if (emailCount > 0) {
    emailInsight = '📧 답장 필요한 메일 ' + emailCount + '개 있어요.';
  }
  
  // 브리핑 조합
  var briefing = {
    greeting: smalltalk,
    weather: weatherInsight,
    event: eventInsight,
    task: taskInsight,
    email: emailInsight,
    timeOfDay: timeOfDay,
    conditionLevel: conditionLevel
  };
  
  return briefing;
};

// ============================================================
// 6. 간단한 2줄 메시지 생성 (아일랜드용) + DNA 통합
// ============================================================

export var getSimpleBriefingMessage = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var weather = props.weather;
  var urgentEvent = props.urgentEvent;
  var dnaInsight = props.dnaInsight; // 🧬 DNA 인사이트 추가
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var remaining = tasks.filter(function(t) { return !t.completed; }).length;
  var total = tasks.length;
  
  // 하루 진행률
  var dayStart = 6;
  var dayEnd = 23;
  var dayProgress = Math.min(100, Math.max(0, ((hour - dayStart) / (dayEnd - dayStart)) * 100));
  var completionRate = total > 0 ? (completed / total) * 100 : 100;
  
  // 시간대 구분
  var timeOfDay = 'morning';
  if (hour >= 5 && hour < 10) timeOfDay = 'earlyMorning';
  else if (hour >= 10 && hour < 12) timeOfDay = 'lateMorning';
  else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  var briefTimeOfDay = 'morning';
  if (hour >= 12 && hour < 18) briefTimeOfDay = 'afternoon';
  else if (hour >= 18 && hour < 22) briefTimeOfDay = 'evening';
  
  // ============================================================
  // 🧬 DNA 기반 메시지 우선 처리
  // ============================================================
  
  if (dnaInsight) {
    // 1. 스트레스/번아웃 최우선
    if (dnaInsight.stressLevel === 'burnout') {
      var burnoutMsgs = STRESS_MESSAGES.burnout[briefTimeOfDay] || STRESS_MESSAGES.burnout.morning;
      var burnoutMsg = burnoutMsgs[Math.floor(Math.random() * burnoutMsgs.length)];
      return { ...burnoutMsg, type: 'dna-burnout' };
    }
    
    if (dnaInsight.stressLevel === 'high') {
      var stressMsgs = STRESS_MESSAGES.high[briefTimeOfDay] || STRESS_MESSAGES.high.morning;
      var stressMsg = stressMsgs[Math.floor(Math.random() * stressMsgs.length)];
      return { ...stressMsg, type: 'dna-stress' };
    }
    
    // 2. 피크 타임 (긴급 일정 없고, 컨디션 괜찮을 때만)
    if (dnaInsight.isPeakTime && !urgentEvent && condition >= 3) {
      var peakMsg = PEAK_TIME_MESSAGES[Math.floor(Math.random() * PEAK_TIME_MESSAGES.length)];
      return { ...peakMsg, type: 'dna-peak' };
    }
    
    // 3. 크로노타입 기반 (컨디션 괜찮을 때만)
    if (dnaInsight.chronotype && condition >= 3) {
      var chronoMsgs = CHRONOTYPE_MESSAGES[dnaInsight.chronotype];
      if (chronoMsgs && chronoMsgs[timeOfDay]) {
        return { ...chronoMsgs[timeOfDay], type: 'dna-chronotype' };
      }
    }
  }
  
  // ============================================================
  // 기존 로직 (DNA 메시지 없을 때)
  // ============================================================
  
  // 0. 컨디션 미확인
  if (condition === 0) {
    return {
      line1: '안녕하세요, ' + userName + '! 💜',
      line2: '오늘 기분은 어때요?',
      type: 'askCondition'
    };
  }
  
  // 1. 긴급 일정 (30분 이내)
  if (urgentEvent) {
    var title = urgentEvent.event.title || urgentEvent.event.summary || '일정';
    return {
      line1: '⚡ ' + urgentEvent.diffMin + '분 뒤 일정!',
      line2: '"' + title.slice(0, 15) + '" 준비하세요',
      type: 'urgent'
    };
  }
  
  // 2. 컨디션 낮음
  if (condition <= 2) {
    var lowMessages = [
      { line1: '오늘은 무리하지 말아요', line2: '꼭 필요한 것만 천천히 💜' },
      { line1: '힘든 날이죠?', line2: '하나만 해도 대단한 거예요' },
      { line1: 'Boss, 오늘은 쉬어가도 돼요', line2: '내일 다시 해도 괜찮아요 💜' }
    ];
    var msg = lowMessages[Math.floor(Math.random() * lowMessages.length)];
    return { ...msg, type: 'lowEnergy' };
  }
  
  // 3. 모두 완료
  if (total > 0 && remaining === 0) {
    return {
      line1: '오늘 다 해냈어요! 🎉',
      line2: '정말 대단해요, ' + userName,
      type: 'allDone'
    };
  }
  
  // 4. 저녁인데 많이 남음
  if (hour >= 17 && hour < 21 && total > 0 && completionRate < 50) {
    return {
      line1: remaining + '개 남았어요',
      line2: '가장 쉬운 것부터 해볼까요? 💪',
      type: 'needCheer'
    };
  }
  
  // 5. 절반 이상 완료
  if (total > 0 && completionRate >= 50 && remaining > 0) {
    return {
      line1: '벌써 절반 넘었어요! 👏',
      line2: remaining + '개만 더 하면 끝!',
      type: 'goodProgress'
    };
  }
  
  // 6. 진행 중
  if (total > 0 && completed > 0 && remaining > 0) {
    return {
      line1: completed + '개 완료! 잘하고 있어요 👏',
      line2: remaining + '개 남았어요',
      type: 'inProgress'
    };
  }
  
  // 7. 아직 시작 안 함 (아침/오전)
  if (total > 0 && completed === 0 && hour < 12) {
    return {
      line1: '좋은 아침이에요, ' + userName + '! ☀️',
      line2: '오늘 ' + total + '개 할 일이 있어요',
      type: 'morningStart'
    };
  }
  
  // 8. 아직 시작 안 함 (오후)
  if (total > 0 && completed === 0 && hour >= 12 && hour < 17) {
    return {
      line1: '오후예요! 할 일 ' + total + '개 있어요',
      line2: '하나씩 시작해볼까요? ✨',
      type: 'afternoonStart'
    };
  }
  
  // 9. 시간대별 기본 인사
  if (hour >= 5 && hour < 12) {
    var morningGreetings = [
      { line1: '좋은 아침이에요, ' + userName + '! ☀️', line2: '오늘 하루도 함께할게요' },
      { line1: '아침이에요! 커피 한 잔 어때요? ☕', line2: '오늘 일정 봐드릴게요' }
    ];
    var g = morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
    return { ...g, type: 'morning' };
  } else if (hour >= 12 && hour < 18) {
    return {
      line1: '좋은 오후예요, ' + userName,
      line2: '남은 하루도 화이팅! 💪',
      type: 'afternoon'
    };
  } else if (hour >= 18 && hour < 22) {
    return {
      line1: '오늘 하루 수고했어요 💜',
      line2: '이제 좀 쉬어도 돼요',
      type: 'evening'
    };
  } else {
    return {
      line1: '이 시간엔 쉬셔야죠 🌙',
      line2: '내일도 함께할게요',
      type: 'night'
    };
  }
};

// ============================================================
// 7. 전체 브리핑 카드 컴포넌트
// ============================================================

export var MorningBriefingCardV2 = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var weather = props.weather;
  var emailCount = props.emailCount || 0;
  var urgentEmailCount = props.urgentEmailCount || 0;
  var onStartDay = props.onStartDay;
  
  var briefing = generateMorningBriefingV2({
    tasks: tasks,
    events: events,
    condition: condition,
    userName: userName,
    weather: weather,
    emailCount: emailCount,
    urgentEmailCount: urgentEmailCount
  });
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: cardBg + ' rounded-2xl p-5 border ' + (darkMode ? 'border-gray-700' : 'border-gray-200')
  },
    // 인사말
    React.createElement('div', { className: 'mb-4' },
      React.createElement('span', { className: 'text-3xl mr-2' }, '🐧'),
      React.createElement('p', { className: textPrimary + ' text-lg leading-relaxed' }, briefing.greeting)
    ),
    
    // 날씨 (있을 경우)
    briefing.weather && React.createElement('p', {
      className: textSecondary + ' text-sm mb-2'
    }, briefing.weather),
    
    // 일정 인사이트
    briefing.event && React.createElement('p', {
      className: 'text-blue-600 text-sm mb-2 font-medium'
    }, briefing.event),
    
    // 태스크 인사이트
    React.createElement('div', {
      className: 'p-3 rounded-xl mb-3 ' + (darkMode ? 'bg-gray-700/50' : 'bg-purple-50')
    },
      React.createElement('p', { className: textPrimary + ' font-medium' }, briefing.task.summary),
      React.createElement('p', { className: textSecondary + ' text-sm mt-1' }, briefing.task.suggestion)
    ),
    
    // 이메일 인사이트 (있을 경우)
    briefing.email && React.createElement('p', {
      className: (urgentEmailCount > 0 ? 'text-red-500' : 'text-purple-500') + ' text-sm mb-3'
    }, briefing.email),
    
    // 시작 버튼
    onStartDay && React.createElement('button', {
      onClick: onStartDay,
      className: 'w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity'
    }, '오늘 시작하기 🚀')
  );
};

export default {
  generateMorningBriefingV2: generateMorningBriefingV2,
  getSimpleBriefingMessage: getSimpleBriefingMessage,
  MorningBriefingCardV2: MorningBriefingCardV2,
  SMALLTALK_PATTERNS: SMALLTALK_PATTERNS,
  WEATHER_INSIGHTS: WEATHER_INSIGHTS,
  STRESS_MESSAGES: STRESS_MESSAGES,
  CHRONOTYPE_MESSAGES: CHRONOTYPE_MESSAGES,
  PEAK_TIME_MESSAGES: PEAK_TIME_MESSAGES
};
