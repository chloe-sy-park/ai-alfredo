// 컨디션 타입
export type ConditionLevel = 'great' | 'okay' | 'tired';

export interface DailyCondition {
  date: string; // YYYY-MM-DD
  level: ConditionLevel;
  updatedAt: string;
}

// 컨디션 정보
export var conditionInfo: Record<ConditionLevel, { emoji: string; label: string; color: string; description: string }> = {
  great: {
    emoji: '😊',
    label: '좋음',
    color: '#22C55E',
    description: '오늘 컨디션 최고!'
  },
  okay: {
    emoji: '😐',
    label: '보통',
    color: '#F59E0B',
    description: '무난한 하루'
  },
  tired: {
    emoji: '😔',
    label: '힘듦',
    color: '#EF4444',
    description: '오늘은 쉬엄쉬엄'
  }
};

// 오늘 날짜 문자열
function getTodayString(): string {
  var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, '0');
  var day = String(today.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// 컨디션 저장
export function saveCondition(level: ConditionLevel): DailyCondition {
  var condition: DailyCondition = {
    date: getTodayString(),
    level: level,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('alfredo_condition_today', JSON.stringify(condition));
  
  // 히스토리에도 저장 (최근 30일)
  saveConditionHistory(condition);
  
  return condition;
}

// 오늘 컨디션 가져오기
export function getTodayCondition(): DailyCondition | null {
  var stored = localStorage.getItem('alfredo_condition_today');
  if (!stored) return null;
  
  try {
    var condition: DailyCondition = JSON.parse(stored);
    // 오늘 날짜인지 확인
    if (condition.date === getTodayString()) {
      return condition;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 컨디션 히스토리 저장
function saveConditionHistory(condition: DailyCondition): void {
  var history = getConditionHistory();
  
  // 같은 날짜가 있으면 업데이트
  var existingIndex = history.findIndex(function(c) { return c.date === condition.date; });
  if (existingIndex >= 0) {
    history[existingIndex] = condition;
  } else {
    history.push(condition);
  }
  
  // 최근 30일만 유지
  history.sort(function(a, b) { return b.date.localeCompare(a.date); });
  history = history.slice(0, 30);
  
  localStorage.setItem('alfredo_condition_history', JSON.stringify(history));
}

// 컨디션 히스토리 가져오기
export function getConditionHistory(): DailyCondition[] {
  var stored = localStorage.getItem('alfredo_condition_history');
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

// 컨디션 기반 추천 메시지
export function getConditionAdvice(level: ConditionLevel): string {
  var advices: Record<ConditionLevel, string[]> = {
    great: [
      '오늘 에너지 넘치네요! 중요한 일 먼저 처리해볼까요?',
      '컨디션 좋을 때 어려운 작업 해치우기 좋아요!',
      '이 기세로 오늘 하루 달려봐요! 💪'
    ],
    okay: [
      '무난한 하루예요. 페이스 유지하면서 가요.',
      '급하지 않은 건 내일로 미뤄도 괜찮아요.',
      '중간중간 스트레칭 잊지 마세요!'
    ],
    tired: [
      '오늘은 꼭 필요한 것만 해요. 괜찮아요.',
      '무리하지 마세요. 쉬는 것도 생산성이에요.',
      '힘들 땐 작은 것부터. 하나씩 천천히요.'
    ]
  };
  
  var list = advices[level];
  return list[Math.floor(Math.random() * list.length)];
}

// 컨디션 기반 추천 일정 수
export function getRecommendedTaskCount(level: ConditionLevel): number {
  switch (level) {
    case 'great': return 5;
    case 'okay': return 3;
    case 'tired': return 1;
    default: return 3;
  }
}
