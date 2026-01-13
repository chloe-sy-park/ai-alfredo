// 🧬 DNA 기반 확장 인사이트 메시지 (100개+)

export interface DNAMessage {
  title: string;
  message: string;
}

export interface DNAInsightMessages {
  peak: DNAMessage[];
  stressHigh: DNAMessage[];
  burnout: DNAMessage[];
  morningType: DNAMessage[];
  eveningType: DNAMessage[];
  focusTime: DNAMessage[];
  afternoonSlump: DNAMessage[];
  busyDay: DNAMessage[];
  lightDay: DNAMessage[];
  presentation: DNAMessage[];
  consecutiveMeetings: DNAMessage[];
  workLifeBad: DNAMessage[];
  learning: {
    day1: DNAMessage[];
    week1: DNAMessage[];
    week2: DNAMessage[];
  };
  dayOfWeek: {
    monday: DNAMessage[];
    tuesday: DNAMessage[];
    wednesday: DNAMessage[];
    thursday: DNAMessage[];
    friday: DNAMessage[];
    weekend: DNAMessage[];
  };
  // 🆕 새로 추가된 카테고리
  season: {
    spring: DNAMessage[];
    summer: DNAMessage[];
    autumn: DNAMessage[];
    winter: DNAMessage[];
  };
  weather: {
    sunny: DNAMessage[];
    cloudy: DNAMessage[];
    rainy: DNAMessage[];
    snowy: DNAMessage[];
    hot: DNAMessage[];
    cold: DNAMessage[];
  };
  specialDays: {
    monthStart: DNAMessage[];
    monthEnd: DNAMessage[];
    quarterEnd: DNAMessage[];
    yearEnd: DNAMessage[];
    newYear: DNAMessage[];
    holiday: DNAMessage[];
    longWeekend: DNAMessage[];
    afterHoliday: DNAMessage[];
  };
  timeOfDay: {
    earlyMorning: DNAMessage[];
    morning: DNAMessage[];
    lunch: DNAMessage[];
    afternoon: DNAMessage[];
    evening: DNAMessage[];
    lateNight: DNAMessage[];
  };
  encouragement: DNAMessage[];
  celebration: DNAMessage[];
}

export const DNA_INSIGHT_MESSAGES: DNAInsightMessages = {
  // ========== 피크 시간 (골든타임) ==========
  peak: [
    { title: '지금이 골든타임! ⚡', message: '에너지 높은 시간이에요. 중요한 일 지금 하면 좋아요' },
    { title: '🔥 집중력 MAX', message: '지금 가장 집중 잘 되는 시간! 딥워크 추천' },
    { title: '⚡ 파워타임!', message: '에너지 피크예요. 어려운 일 도전해보세요' },
    { title: '🎯 최적의 시간', message: '뇌가 가장 활발한 때! 창의적인 일 하기 좋아요' },
    { title: '💪 지금 달려요!', message: '컨디션 좋은 시간대. 밀린 일 처리하기 딱!' }
  ],
  
  // ========== 스트레스 높음 ==========
  stressHigh: [
    { title: '오늘은 좀 쉬어가요', message: '최근 일정이 많았어요. 가벼운 일만 해도 충분해요 💜' },
    { title: '무리하지 마세요', message: '요즘 바빴죠? 작은 일부터 천천히' },
    { title: '괜찮아요', message: '지금 상태에서 할 수 있는 만큼만 해요' },
    { title: '쉬어도 돼요', message: '휴식도 생산성이에요. 에너지 충전 먼저!' },
    { title: '💜 케어 모드', message: '알프레도가 옆에 있을게요. 무리하지 마세요' }
  ],
  
  // ========== 번아웃 위험 ==========
  burnout: [
    { title: '⚠️ 잠깐 멈춰요', message: '최근 2주간 너무 달렸어요. 오늘은 쉬는 날로!' },
    { title: '번아웃 신호', message: '주말 업무, 야근이 늘었어요. 진짜 쉬세요' },
    { title: '💜 Boss님 걱정돼요', message: '일정 취소가 늘고 있어요. 괜찮으세요?' },
    { title: '휴식이 필요해요', message: '지금 쉬는 게 가장 생산적인 선택이에요' }
  ],
  
  // ========== 아침형 ==========
  morningType: [
    { title: '아침형 파워 🌅', message: '오전에 집중 잘 되시는 분! 중요한 일 지금 해요' },
    { title: '☀️ 모닝 골든타임', message: '아침형은 오전이 승부예요. 중요 업무 먼저!' },
    { title: '상쾌한 아침!', message: '에너지 충만한 오전, 어려운 일 도전해보세요' },
    { title: '🌞 일찍 일어난 새가...', message: '아침형 장점 살려서 핵심 업무 먼저!' }
  ],
  
  // ========== 저녁형 ==========
  eveningType: [
    { title: '저녁형 파워 🌙', message: '오후/저녁에 집중 잘 되시죠? 지금 최적이에요' },
    { title: '🌙 나이트 모드 ON', message: '저녁형은 오후가 진짜! 지금 집중하세요' },
    { title: '올빼미 타임!', message: '저녁형에게 이 시간은 골든타임이에요' },
    { title: '🦉 야행성 파워', message: '오후 에너지 살려서 중요 업무 해치우세요' }
  ],
  
  // ========== 집중 시간 추천 ==========
  focusTime: [
    { title: '집중 추천 시간', message: '{day} {time}가 집중하기 좋아요' },
    { title: '🎯 딥워크 추천', message: '{day} {time}에 중요 업무 배치하면 효율 UP' },
    { title: '📅 집중 슬롯', message: '{day} {time}는 미팅 없는 시간이에요' }
  ],
  
  // ========== 오후 슬럼프 ==========
  afternoonSlump: [
    { title: '😴 점심 후 슬럼프', message: '에너지 낮은 시간! 가벼운 일이나 휴식 추천' },
    { title: '☕ 커피 타임?', message: '오후 초반은 누구나 좀 쳐져요. 잠깐 쉬어가세요' },
    { title: '🥱 슬럼프 시간대', message: '무거운 일 대신 정리, 이메일 체크 같은 가벼운 일!' }
  ],
  
  // ========== 바쁜 날 ==========
  busyDay: [
    { title: '📅 바쁜 하루', message: '오늘 일정 {count}개! 알프레도가 잘 챙길게요' },
    { title: '🔥 풀스케줄', message: '빡빡한 하루네요. 사이사이 휴식 챙기세요' },
    { title: '💪 오늘 좀 바빠요', message: '미팅 많은 날! 미리 체크하고 시작해요' }
  ],
  
  // ========== 여유로운 날 ==========
  lightDay: [
    { title: '🌿 여유로운 하루', message: '일정 적은 날! 밀린 일 처리하기 좋아요' },
    { title: '✨ 집중하기 좋은 날', message: '미팅 없는 날이에요. 딥워크 찬스!' },
    { title: '🧘 페이스 조절', message: '오늘은 내 속도로 일해요' }
  ],
  
  // ========== 발표/중요 일정 ==========
  presentation: [
    { title: '📢 내일 발표!', message: '중요한 발표 D-1. 오늘 마무리 준비해요' },
    { title: '🎤 발표 당일', message: '오늘 발표 있으시죠? 화이팅! 잘 할 거예요' },
    { title: '⭐ 중요 일정 D-1', message: '내일 큰 일정! 오늘 미리 준비해두세요' }
  ],
  
  // ========== 연속 미팅 ==========
  consecutiveMeetings: [
    { title: '🏃 미팅 마라톤', message: '연속 미팅 {count}개! 중간에 물 마시기' },
    { title: '📞 미팅 연속', message: '미팅 사이 5분은 숨 고르기 시간으로!' },
    { title: '💨 바쁜 오전/오후', message: '미팅 끝나면 잠깐 쉬어가세요' }
  ],
  
  // ========== 워라밸 ==========
  workLifeBad: [
    { title: '⚖️ 균형 체크', message: '요즘 개인 시간이 부족해 보여요. 괜찮으세요?' },
    { title: '🏠 퇴근 후는 쉬세요', message: '저녁 시간까지 일하시네요. 오늘은 칼퇴!' },
    { title: '📴 주말은 쉬는 날', message: '주말에도 일정이 있네요. 쉬는 시간도 필요해요' }
  ],
  
  // ========== 학습 중 (데이터 부족) ==========
  learning: {
    day1: [
      { title: '알프레도가 배우는 중', message: '캘린더 분석 중이에요. 곧 맞춤 조언 드릴게요!' },
      { title: '🐧 처음 뵙겠습니다', message: '캘린더 데이터로 Boss님을 알아가는 중이에요' }
    ],
    week1: [
      { title: '패턴을 발견했어요', message: '일주일 데이터로 리듬을 알아가는 중!' },
      { title: '📊 분석 진행 중', message: '요일별 패턴이 보이기 시작했어요' }
    ],
    week2: [
      { title: '🧬 DNA 분석 완료', message: '2주간의 데이터로 최적화된 조언 드릴게요' },
      { title: '✨ 이제 잘 알아요', message: 'Boss님 패턴 파악 완료! 맞춤 조언 시작' }
    ]
  },
  
  // ========== 요일별 (확장) ==========
  dayOfWeek: {
    monday: [
      { title: '월요일 파이팅! 💪', message: '한 주 시작! 오늘은 워밍업으로 가볍게' },
      { title: '새로운 한 주', message: '월요병은 자연스러운 거예요. 천천히 시작해요' },
      { title: '🌅 월요일 아침', message: '이번 주도 함께해요. 작은 것부터 시작!' }
    ],
    tuesday: [
      { title: '화요일이에요 🔥', message: '월요일보다 나은 화요일! 리듬 타기 시작' },
      { title: '페이스 올리는 날', message: '어제 워밍업 했으니 오늘은 좀 더 달려볼까요?' }
    ],
    wednesday: [
      { title: '수요일 - 중간 지점 🌈', message: '한 주의 절반! 잘 하고 있어요' },
      { title: '주중 피크', message: '수요일은 집중력 좋은 날이에요' }
    ],
    thursday: [
      { title: '목요일, 거의 다 왔어요 🏃', message: '금요일 코앞! 마무리 준비 시작' },
      { title: '라스트 스퍼트 전', message: '이번 주 남은 일, 오늘 정리해봐요' }
    ],
    friday: [
      { title: '불금이다! 🎉', message: '한 주 고생했어요. 오늘 마무리하고 푹 쉬세요' },
      { title: '주말이 코앞!', message: '밀린 일 정리하고 깔끔하게 한 주 마무리!' },
      { title: '금요일 저녁 기대', message: '오늘만 버티면 주말! 화이팅 💪' }
    ],
    weekend: [
      { title: '주말이에요 🌴', message: '일은 잠시 내려놓고 충전하세요' },
      { title: '휴식이 필요한 시간', message: '주말엔 쉬면서 에너지 충전!' },
      { title: '🛋️ 여유로운 주말', message: '푹 쉬거나, 하고 싶은 일 하세요' }
    ]
  },
  
  // ========== 🆕 계절별 ==========
  season: {
    spring: [
      { title: '🌸 봄이에요!', message: '새로운 시작의 계절, 뭔가 시작하기 좋아요' },
      { title: '봄바람 솔솔', message: '날씨 좋은 봄! 잠깐 산책 어때요?' },
      { title: '🌷 따뜻한 봄날', message: '꽃피는 계절이에요. 기분 좋은 하루 되세요' },
      { title: '봄 나들이 하고 싶은 날', message: '일 끝나면 잠깐 바람 쐬어요' }
    ],
    summer: [
      { title: '☀️ 뜨거운 여름', message: '더위 조심! 시원한 곳에서 집중하세요' },
      { title: '여름엔 수분 보충', message: '물 많이 마시고 컨디션 챙기세요 💧' },
      { title: '🏖️ 여름이네요', message: '휴가 계획 세우셨나요? 푹 쉬는 것도 중요해요' },
      { title: '더운 날씨', message: '에어컨 가동! 시원하게 일하세요 ❄️' }
    ],
    autumn: [
      { title: '🍂 가을이 왔어요', message: '선선해서 집중하기 좋은 계절이에요' },
      { title: '가을 독서의 계절', message: '날씨 좋은 가을, 뭔가 배우기 좋은 때!' },
      { title: '🍁 단풍 시즌', message: '주말에 단풍 보러 가는 건 어때요?' },
      { title: '집중의 계절', message: '선선한 날씨, 딥워크 하기 최고예요' }
    ],
    winter: [
      { title: '⛄ 겨울이에요', message: '따뜻하게 입고, 따뜻한 음료와 함께!' },
      { title: '추운 날씨', message: '몸 따뜻하게! 감기 조심하세요 🧣' },
      { title: '❄️ 겨울 왔네요', message: '따뜻한 실내에서 집중하기 좋아요' },
      { title: '연말 분위기', message: '한 해 마무리 잘 하고 계시죠?' }
    ]
  },
  
  // ========== 🆕 날씨별 ==========
  weather: {
    sunny: [
      { title: '☀️ 화창한 날!', message: '맑은 날씨예요. 기분 좋게 시작해요!' },
      { title: '날씨 좋은 날', message: '점심에 잠깐 햇빛 쬐면 에너지 UP' },
      { title: '🌞 맑음', message: '좋은 날씨처럼 좋은 하루 되세요' }
    ],
    cloudy: [
      { title: '☁️ 흐린 날', message: '흐린 날도 괜찮아요. 실내 집중하기 좋아요' },
      { title: '구름 낀 하늘', message: '흐릿한 날씨엔 따뜻한 음료 한 잔 ☕' }
    ],
    rainy: [
      { title: '🌧️ 비 오는 날', message: '비 소리 들으며 집중하기 좋은 날!' },
      { title: '우산 챙기세요 ☔', message: '비 오네요. 젖지 않게 조심!' },
      { title: '빗소리 ASMR', message: '비 오는 날은 집중하기 의외로 좋아요' },
      { title: '비 내리는 날', message: '실내에서 커피 한 잔과 함께 딥워크 ☕' }
    ],
    snowy: [
      { title: '❄️ 눈 오는 날!', message: '눈 오네요! 출퇴근 조심하세요' },
      { title: '하얀 세상', message: '눈 구경하면서 잠깐 힐링해요 ⛄' },
      { title: '눈이 와요', message: '미끄러우니 조심! 따뜻하게 다니세요' }
    ],
    hot: [
      { title: '🥵 더운 날', message: '오늘 많이 덥대요. 시원하게 지내세요!' },
      { title: '폭염 주의보', message: '더위 조심! 물 자주 마시고 쉬어가세요' },
      { title: '무더운 날씨', message: '에어컨은 친구예요. 시원하게!' }
    ],
    cold: [
      { title: '🥶 추운 날', message: '오늘 춥대요! 따뜻하게 입고 다니세요' },
      { title: '한파 주의', message: '많이 추워요. 감기 조심!' },
      { title: '쌀쌀한 날씨', message: '따뜻한 옷, 따뜻한 음료로 버텨요 ☕' }
    ]
  },
  
  // ========== 🆕 특별한 날 ==========
  specialDays: {
    monthStart: [
      { title: '🗓️ 새 달이 시작!', message: '이번 달 목표 세워볼까요?' },
      { title: '월초예요', message: '새로운 달, 새로운 마음으로!' },
      { title: '한 달의 시작', message: '지난 달 돌아보고 이번 달 준비해요' }
    ],
    monthEnd: [
      { title: '📆 월말이에요', message: '이번 달 마무리 잘 하고 계시죠?' },
      { title: '한 달 끝자락', message: '월말 정산, 정리할 거 있으면 지금!' },
      { title: '월말 마무리', message: '다음 달 준비도 슬슬 시작해요' }
    ],
    quarterEnd: [
      { title: '📊 분기 마감!', message: '분기 마무리 시즌이에요. 화이팅!' },
      { title: 'Q 마감', message: '분기 목표 달성 상황 체크해볼까요?' },
      { title: '분기 끝자락', message: '다음 분기 계획도 슬슬 세워봐요' }
    ],
    yearEnd: [
      { title: '🎄 연말이에요', message: '한 해 고생 많으셨어요. 마무리 잘 해요!' },
      { title: '한 해 마무리', message: '올해 목표 얼마나 달성했나요?' },
      { title: '연말 정산 시즌', message: '바쁜 연말, 건강 챙기면서!' }
    ],
    newYear: [
      { title: '🎉 새해 복 많이 받으세요!', message: '올해도 함께해요. 좋은 일 가득하길!' },
      { title: '새해 첫날', message: '새해 목표 세우셨나요? 같이 이뤄요!' },
      { title: '✨ 새로운 시작', message: '올해는 더 좋은 일만 가득하길 바라요' }
    ],
    holiday: [
      { title: '🎊 오늘은 공휴일!', message: '쉬는 날이에요. 푹 쉬세요!' },
      { title: '빨간 날', message: '오늘은 일 내려놓고 충전하는 날!' },
      { title: '휴일이에요', message: '편하게 쉬면서 에너지 충전!' }
    ],
    longWeekend: [
      { title: '🌴 연휴네요!', message: '긴 휴식 즐기세요. 푹 쉬어야 해요!' },
      { title: '황금연휴', message: '연휴 계획 있으세요? 잘 쉬다 오세요!' },
      { title: '연휴 시작', message: '일은 잠시 잊고 리프레시!' }
    ],
    afterHoliday: [
      { title: '연휴 끝났어요', message: '쉬다 왔으니 천천히 워밍업해요' },
      { title: '복귀 첫날', message: '바로 달리지 말고 가볍게 시작!' },
      { title: '휴식 후 복귀', message: '오늘은 페이스 조절하면서 적응해요' }
    ]
  },
  
  // ========== 🆕 시간대별 ==========
  timeOfDay: {
    earlyMorning: [
      { title: '🌅 이른 아침', message: '일찍 일어나셨네요! 대단해요' },
      { title: '새벽 기상', message: '부지런한 아침이에요. 커피 한 잔?' },
      { title: '아직 이른 시간', message: '조용한 시간, 집중하기 좋아요' }
    ],
    morning: [
      { title: '☀️ 좋은 아침!', message: '오늘 하루도 화이팅!' },
      { title: '상쾌한 아침', message: '오전 에너지로 중요한 일 먼저!' },
      { title: '모닝 파워', message: '아침은 뇌가 맑은 시간이에요' }
    ],
    lunch: [
      { title: '🍽️ 점심시간', message: '맛있는 점심 드세요!' },
      { title: '점심 드셨나요?', message: '잘 먹어야 오후도 힘내요' },
      { title: '런치타임', message: '식사하고 잠깐 산책 어때요?' }
    ],
    afternoon: [
      { title: '☕ 오후예요', message: '점심 먹고 좀 쳐지죠? 커피 한 잔!' },
      { title: '오후 파이팅', message: '남은 오후도 힘내요!' },
      { title: '오후 집중', message: '오후도 화이팅! 조금만 더!' }
    ],
    evening: [
      { title: '🌅 저녁이에요', message: '오늘도 수고했어요. 마무리 잘 해요' },
      { title: '퇴근 시간', message: '일 마무리하고 푹 쉬세요' },
      { title: '저녁 되었네요', message: '오늘 하루 어땠어요? 수고했어요!' }
    ],
    lateNight: [
      { title: '🌙 늦은 밤', message: '아직 안 주무셨네요. 푹 쉬세요!' },
      { title: '야식 시간?', message: '늦은 시간이에요. 무리하지 마세요' },
      { title: '밤이 깊었어요', message: '내일을 위해 이제 쉬어요' }
    ]
  },
  
  // ========== 🆕 격려 메시지 ==========
  encouragement: [
    { title: '💪 할 수 있어요', message: '지금까지 잘 해왔잖아요. 이번에도!' },
    { title: '화이팅!', message: '알프레도가 응원해요. 힘내세요!' },
    { title: '잘하고 있어요', message: '완벽하지 않아도 괜찮아요' },
    { title: '🌟 대단해요', message: '오늘도 최선을 다하고 있네요' },
    { title: '포기하지 마세요', message: '조금씩 꾸준히. 그게 비결이에요' },
    { title: '💜 응원해요', message: 'Boss님은 잘 해낼 거예요' }
  ],
  
  // ========== 🆕 축하 메시지 ==========
  celebration: [
    { title: '🎉 축하해요!', message: '목표 달성! 정말 대단해요' },
    { title: '잘했어요!', message: '오늘 할 일 다 끝냈네요!' },
    { title: '✨ 완벽해요', message: 'Boss님 오늘 정말 잘했어요' },
    { title: '🏆 목표 달성', message: '해냈어요! 자랑스러워요' },
    { title: '짝짝짝', message: '오늘의 성과, 축하드려요!' }
  ]
};

// 랜덤 메시지 선택 함수
export function getRandomMessage(
  category: keyof Omit<DNAInsightMessages, 'learning' | 'dayOfWeek' | 'season' | 'weather' | 'specialDays' | 'timeOfDay'>,
  _subCategory?: string
): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES[category] as DNAMessage[];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 학습 단계 메시지 선택 함수
export function getLearningMessage(phase: 'day1' | 'week1' | 'week2'): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.learning[phase];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 요일별 메시지 선택 함수
export function getDayOfWeekMessage(day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'weekend'): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.dayOfWeek[day];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 🆕 계절별 메시지 선택 함수
export function getSeasonMessage(season: 'spring' | 'summer' | 'autumn' | 'winter'): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.season[season];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 🆕 날씨별 메시지 선택 함수
export function getWeatherMessage(weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'hot' | 'cold'): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.weather[weather];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 🆕 특별한 날 메시지 선택 함수
export function getSpecialDayMessage(
  type: 'monthStart' | 'monthEnd' | 'quarterEnd' | 'yearEnd' | 'newYear' | 'holiday' | 'longWeekend' | 'afterHoliday'
): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.specialDays[type];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 🆕 시간대별 메시지 선택 함수
export function getTimeOfDayMessage(
  time: 'earlyMorning' | 'morning' | 'lunch' | 'afternoon' | 'evening' | 'lateNight'
): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.timeOfDay[time];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 🆕 현재 계절 감지
export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 🆕 현재 시간대 감지
export function getCurrentTimeOfDay(): 'earlyMorning' | 'morning' | 'lunch' | 'afternoon' | 'evening' | 'lateNight' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'earlyMorning';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'lateNight';
}

// 🆕 특별한 날 감지
export function detectSpecialDay(): string | null {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  
  // 새해
  if (month === 1 && day <= 3) return 'newYear';
  
  // 연말
  if (month === 12 && day >= 20) return 'yearEnd';
  
  // 분기말
  if ((month === 3 || month === 6 || month === 9 || month === 12) && day >= 25) return 'quarterEnd';
  
  // 월초
  if (day <= 3) return 'monthStart';
  
  // 월말
  if (day >= 28) return 'monthEnd';
  
  return null;
}

// 시간 문자열 치환 함수
export function formatMessageWithTime(message: string, focusTime: { day: string; time: string } | null): string {
  if (!focusTime) return message;
  return message
    .replace('{day}', focusTime.day || '')
    .replace('{time}', focusTime.time || '');
}

// 카운트 치환 함수  
export function formatMessageWithCount(message: string, count: number): string {
  return message.replace('{count}', String(count || 0));
}

export default DNA_INSIGHT_MESSAGES;
