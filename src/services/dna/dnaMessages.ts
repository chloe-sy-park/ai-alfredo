// 🧬 DNA 기반 확장 인사이트 메시지 (60개+)

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
    friday: DNAMessage[];
    weekend: DNAMessage[];
  };
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
  
  // ========== 요일별 ==========
  dayOfWeek: {
    monday: [
      { title: '월요일 파이팅! 💪', message: '한 주 시작! 오늘은 워밍업으로 가볍게' },
      { title: '새로운 한 주', message: '월요병은 자연스러운 거예요. 천천히 시작해요' }
    ],
    friday: [
      { title: '불금이다! 🎉', message: '한 주 고생했어요. 오늘 마무리하고 푹 쉬세요' },
      { title: '주말이 코앞!', message: '밀린 일 정리하고 깔끔하게 한 주 마무리!' }
    ],
    weekend: [
      { title: '주말이에요 🌴', message: '일은 잠시 내려놓고 충전하세요' },
      { title: '휴식이 필요한 시간', message: '주말엔 쉬면서 에너지 충전!' }
    ]
  }
};

// 랜덤 메시지 선택 함수
export function getRandomMessage(
  category: keyof Omit<DNAInsightMessages, 'learning' | 'dayOfWeek'>,
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
export function getDayOfWeekMessage(day: 'monday' | 'friday' | 'weekend'): DNAMessage | null {
  const messages = DNA_INSIGHT_MESSAGES.dayOfWeek[day];
  if (!messages || messages.length === 0) return null;
  
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
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
