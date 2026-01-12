import React from 'react';
import { 
  Plus, Calendar, Target, Sparkles, Coffee, 
  Sun, Moon, Cloud, Zap, Heart, Star,
  CheckCircle2, ListTodo, Clock, Flame
} from 'lucide-react';

// ============================================
// 🐧 W1 강화: 알프레도 한마디 (80+ 상황별)
// 이대표 스타일 톤앤매너 적용
// - 직접 질문 금지 (물어보는 대신 제안)
// - 과한 칭찬 금지 (담백하게)
// - 짧고 임팩트있게 (2-3문장)
// - Boss 호칭 + 친근함 밸런스
// ============================================

export const ALFREDO_COMMENTS = {
  // ========== 시간대별 인사 (톤 차별화) ==========
  greeting: {
    dawn: [ // 5-7시 - 조용하고 부드러운 톤
      "새벽이네요... 천천히 시작해요",
      "아직 어두운데, 몸 먼저 깨워요",
      "새벽의 고요함, 나쁘지 않죠",
      "일찍 일어났네요. 물 한 잔 먼저",
    ],
    morning: [ // 7-9시 - 차분하지만 활기있는 톤
      "좋은 아침이에요, Boss",
      "오늘 하루도 같이 해봐요",
      "아침이에요. 천천히 준비해요",
      "커피 한 잔 하면서 시작해볼까요",
      "오늘의 첫 페이지가 열렸어요",
    ],
    activeMorning: [ // 9-12시 - 집중을 돕는 톤
      "지금이 골든타임이에요",
      "오전의 맑은 머리로 큰 일 먼저",
      "집중하기 좋은 시간대예요",
      "이 시간의 1시간은 오후 2시간 값이에요",
      "지금 흐름 좋아요, 밀고 가요",
    ],
    lunch: [ // 12-14시 - 여유롭고 배려하는 톤
      "점심 챙겨 드세요. 밥심이 일심",
      "잠깐 쉬어가도 괜찮아요",
      "오후를 위한 충전 타임",
      "급하게 안 먹어도 돼요",
      "식후 산책도 나쁘지 않아요",
    ],
    afternoon: [ // 14-17시 - 현실적이고 실용적인 톤
      "오후 슬럼프 오면 잠깐 일어나요",
      "남은 오후, 가볍게 가요",
      "큰 일보다 작은 일 먼저",
      "조금만 더 버티면 저녁이에요",
      "무리하지 말고, 할 수 있는 만큼만",
    ],
    evening: [ // 17-20시 - 따뜻하고 마무리하는 톤
      "하루 수고했어요, Boss",
      "저녁이에요. 마무리 모드로",
      "오늘 한 것만으로도 충분해요",
      "급한 거 아니면 내일로 넘겨요",
      "저녁 노을처럼 여유롭게",
    ],
    night: [ // 20-23시 - 부드럽고 쉬라는 톤
      "밤이에요. 무리하지 마세요",
      "오늘은 여기까지만",
      "내일의 Boss를 위해 쉬어요",
      "야근은 효율이 떨어져요",
      "푹 쉬는 것도 생산성이에요",
    ],
    lateNight: [ // 23시 이후 - 걱정하는 톤
      "이 시간까지... 건강이 먼저예요",
      "늦었어요. 이제 그만",
      "내일 하면 안 될까요",
      "밤샘은 빚지는 거예요",
      "자는 게 제일 나은 선택이에요",
    ],
  },

  // ========== 에너지/기분별 (현실적 반응) ==========
  energy: {
    high: [ // 70% 이상
      "컨디션 좋네요. 큰 일 처리하기 좋아요",
      "에너지 있을 때 어려운 것 먼저",
      "이 컨디션 아낄 필요 없어요",
      "지금 아니면 언제 하겠어요",
    ],
    medium: [ // 40-70%
      "적당히 괜찮은 컨디션이에요",
      "페이스 조절하면서 가요",
      "무리 안 하는 선에서 진행해요",
      "오늘은 평균 속도로",
    ],
    low: [ // 40% 미만 - 강요 없이 배려
      "오늘은 천천히 가도 돼요",
      "컨디션 안 좋으면 쉬는 게 나아요",
      "작은 것 하나만 해도 충분해요",
      "억지로 안 해도 돼요",
      "쉬는 것도 용기예요",
    ],
  },

  mood: {
    great: [
      "기분 좋아 보여요",
      "오늘 뭔가 좋은 일 있었나 봐요",
      "그 에너지 좋아요",
    ],
    good: [
      "오늘도 평온하네요",
      "이 페이스 유지해요",
      "꾸준함이 최고예요",
    ],
    neutral: [
      "그냥 그런 날도 있죠",
      "특별하지 않아도 괜찮아요",
      "평범한 하루도 하루예요",
    ],
    down: [ // 실패 케어 - 부드럽게 존재감만
      "옆에 있을게요",
      "말 안 해도 괜찮아요",
      "아무것도 안 해도 돼요",
      "Boss 페이스대로 가요",
      "힘든 날이구나... 알았어요",
    ],
  },

  // ========== 할 일 관련 (갓생 강요 금지) ==========
  tasks: {
    manyPending: [ // 5개 이상 - 압박 대신 현실적 조언
      "많긴 한데, 하나씩 가요",
      "전부 다 오늘 안 해도 돼요",
      "제일 급한 것만 골라요",
      "많을 땐 버리는 것도 전략이에요",
      "우선순위 하나만 정해봐요",
    ],
    fewPending: [ // 2-4개
      "적당히 있네요. 관리 가능해요",
      "이 정도면 할 만해요",
      "오늘 안에 충분히 가능해요",
    ],
    almostDone: [ // 1개
      "거의 다 왔어요. 마지막 하나",
      "이것만 끝내면 올클이에요",
      "라스트 스퍼트",
    ],
    allDone: [ // 과한 칭찬 대신 담백하게
      "다 끝났네요. 수고했어요",
      "오늘 할 일 올클. 푹 쉬어요",
      "깔끔하게 마무리했네요",
    ],
    noTasks: [
      "오늘은 여유로운 날이네요",
      "할 일 없으면 그냥 쉬어요",
      "아무것도 안 하는 날도 필요해요",
    ],
  },

  // ========== 스트릭/연속 달성 (담백하게) ==========
  streak: {
    starting: [ // 1-2일
      "시작이 반이에요",
      "첫 발 뗐어요",
      "이 기세 유지해봐요",
    ],
    building: [ // 3-6일
      "연속 달성 중이에요",
      "꾸준함이 쌓이고 있어요",
      "이 리듬 좋아요",
    ],
    strong: [ // 7-13일
      "일주일 넘겼어요. 대단해요",
      "이제 습관이 된 것 같아요",
      "이 흐름 유지해요",
    ],
    legendary: [ // 14일 이상 - 과하지 않게
      "이건 진짜 대단한 거예요",
      "꾸준함의 힘이네요",
      "이제 몸에 배인 것 같아요",
    ],
    broken: [ // 실패 케어
      "괜찮아요. 다시 시작하면 돼요",
      "쉬어간 것도 필요했던 거예요",
      "새로운 스트릭, 오늘부터요",
      "끊긴 게 끝은 아니에요",
    ],
  },

  // ========== 작업 중 격려 (선제적) ==========
  working: {
    start: [
      "시작했어요. 이미 반은 한 거예요",
      "좋아요, 같이 해요",
      "옆에서 응원할게요",
    ],
    progress: [
      "잘 하고 있어요",
      "집중 모드 좋아요",
      "이 페이스 괜찮아요",
    ],
    longSession: [ // 30분 이상 - 선제적 휴식 제안
      "30분 넘었어요. 잠깐 쉬어가요",
      "한 번 일어나서 스트레칭해요",
      "물 한 잔 마시고 와요",
      "눈도 쉬게 해줘야 해요",
    ],
    veryLongSession: [ // 60분 이상
      "1시간 넘었어요. 진짜 쉬어야 해요",
      "집중 좋지만 휴식도 필요해요",
      "5분만 쉬고 다시 해요",
    ],
    almostDone: [
      "거의 다 왔어요",
      "끝이 보여요",
      "마무리 스퍼트",
    ],
  },

  // ========== 완료 축하 (담백하게) ==========
  completion: {
    normal: [
      "완료. 수고했어요",
      "하나 끝",
      "잘했어요",
    ],
    important: [
      "큰 일 끝냈네요. 대단해요",
      "메인 퀘스트 클리어",
      "이건 진짜 잘한 거예요",
    ],
    firstOfDay: [
      "오늘 첫 완료. 좋은 시작이에요",
      "첫 술에 배부를 순 없지만, 시작이 중요해요",
      "하나 끝냈으니 나머지도 할 수 있어요",
    ],
    lastOfDay: [
      "오늘 마지막까지 완료",
      "끝까지 해냈네요",
      "완벽한 마무리. 푹 쉬어요",
    ],
  },

  // ========== 날씨/계절 (선제적 정보) ==========
  weather: {
    sunny: [
      "날씨 좋아요. 잠깐 햇살 받으러 나가요",
      "밖에 나가면 기분 전환 될 거예요",
    ],
    rainy: [
      "비 와요. 실내에서 집중하기 좋은 날",
      "빗소리 들으면서 작업하는 것도 좋아요",
      "우산 챙기세요",
    ],
    cloudy: [
      "흐린 날이에요. 마음은 맑게",
      "이런 날은 차 한 잔 하면서",
    ],
    cold: [
      "추워요. 따뜻하게 입으세요",
      "핫초코 한 잔 하면서",
    ],
    hot: [
      "더워요. 수분 보충 잊지 마세요",
      "에어컨 바람 쐬면서",
    ],
  },

  // ========== 특별한 날 ==========
  special: {
    monday: [
      "월요일이에요. 천천히 시작해요",
      "한 주의 시작. 무리하지 말고요",
      "월요병은 자연스러운 거예요",
    ],
    friday: [
      "금요일이에요. 조금만 더",
      "주말이 기다려요",
      "오늘만 버티면 주말",
    ],
    weekend: [
      "주말이에요. 푹 쉬어요",
      "충전의 시간이에요",
      "일 생각 안 해도 돼요",
    ],
    holiday: [
      "쉬는 날이에요. 진짜 쉬세요",
      "오늘은 알람 끄고 있어요",
    ],
  },

  // ========== 격려/위로 (실패 케어) ==========
  encourage: {
    general: [
      "할 수 있어요",
      "Boss는 생각보다 대단한 사람이에요",
      "작은 진전도 진전이에요",
      "완벽하지 않아도 괜찮아요",
      "오늘 하루도 버텨줘서 고마워요",
    ],
    afterFailure: [ // 실패 케어 강화
      "괜찮아요. 다시 하면 돼요",
      "실패는 끝이 아니에요",
      "못한 게 아니라 아직 안 한 거예요",
      "쉬어간 것뿐이에요",
      "내일 다시 하면 돼요",
    ],
    overwhelmed: [ // 압도될 때 - 갓생 강요 금지
      "너무 많으면 버려요",
      "전부 다 안 해도 돼요",
      "오늘이 전부가 아니에요",
      "숨 한 번 크게 쉬어요",
      "하나만. 딱 하나만요",
    ],
    burnout: [ // 번아웃 케어 추가
      "쉬어야 할 때예요",
      "지금은 멈춰야 해요",
      "아무것도 안 해도 괜찮아요",
      "충전이 먼저예요",
    ],
  },

  // ========== 선제적 제안 (새로 추가) ==========
  proactive: {
    meetingSoon: [ // 미팅 임박
      "곧 미팅이에요. 준비됐나요",
      "30분 후 일정 있어요",
      "미팅 전에 잠깐 정리해요",
    ],
    deadlineToday: [ // 오늘 마감
      "오늘 마감인 게 있어요",
      "급한 거 먼저 처리해요",
      "마감 임박. 집중해요",
    ],
    longNoBreak: [ // 오래 쉬지 않음
      "2시간째예요. 잠깐 쉬어야 해요",
      "눈이랑 목 풀어줘요",
      "5분만 일어나요",
    ],
    eveningReminder: [ // 저녁 정리 제안
      "하루 정리할 시간이에요",
      "내일 준비 잠깐 해둘까요",
      "오늘 한 것 돌아보는 시간",
    ],
    morningBriefing: [ // 아침 브리핑
      "오늘 일정 정리해뒀어요",
      "오늘의 Big 3 확인해요",
      "컨디션 체크하고 시작해요",
    ],
  },

  // ========== 맥락 기억 기반 (새로 추가) ==========
  contextual: {
    afterBigTask: [ // 큰 일 끝난 후
      "큰 일 끝났으니 가벼운 것으로",
      "잠깐 쉬고 다음 거 해요",
      "에너지 소모 많았을 거예요",
    ],
    consecutiveComplete: [ // 연속 완료
      "잘 나가고 있어요",
      "흐름 좋아요. 이 페이스로",
      "연속 클리어 중",
    ],
    afterLongBreak: [ // 오랜만에 복귀
      "돌아왔네요. 천천히 시작해요",
      "오랜만이에요. 무리하지 말고요",
      "다시 시작하면 돼요",
    ],
    repeatedPostpone: [ // 계속 미룬 일
      "이거 계속 미뤄지고 있어요",
      "5분만 해볼까요",
      "시작만 하면 될 거예요",
    ],
  },
};

// 상황에 맞는 코멘트 가져오기
export const getAlfredoComment = (category, subcategory) => {
  const comments = ALFREDO_COMMENTS[category]?.[subcategory];
  if (!comments || comments.length === 0) {
    return "옆에서 응원하고 있어요";
  }
  return comments[Math.floor(Math.random() * comments.length)];
};

// 시간대별 톤 가져오기 (W1 강화)
export const getTimeBasedTone = (hour = new Date().getHours()) => {
  if (hour < 7) return { period: 'dawn', tone: 'quiet', energy: 'low' };
  if (hour < 9) return { period: 'morning', tone: 'calm', energy: 'rising' };
  if (hour < 12) return { period: 'activeMorning', tone: 'focused', energy: 'peak' };
  if (hour < 14) return { period: 'lunch', tone: 'relaxed', energy: 'recovering' };
  if (hour < 17) return { period: 'afternoon', tone: 'practical', energy: 'moderate' };
  if (hour < 20) return { period: 'evening', tone: 'warm', energy: 'winding' };
  if (hour < 23) return { period: 'night', tone: 'soft', energy: 'low' };
  return { period: 'lateNight', tone: 'concerned', energy: 'minimal' };
};

// 컨텍스트 기반 자동 코멘트 (W1 강화)
export const getContextualComment = ({
  hour = new Date().getHours(),
  energy = 50,
  mood = 'neutral',
  pendingTasks = 0,
  completedToday = 0,
  streak = 0,
  isWorking = false,
  workMinutes = 0,
  hasUpcomingMeeting = false,
  hasTodayDeadline = false,
  minutesSinceBreak = 0,
  lastBigTaskCompleted = false,
  consecutiveCompletes = 0,
  repeatedPostponeTask = null,
}) => {
  const timeTone = getTimeBasedTone(hour);
  
  // ===== 선제적 알림 (가장 높은 우선순위) =====
  
  // 1. 곧 미팅
  if (hasUpcomingMeeting) {
    return getAlfredoComment('proactive', 'meetingSoon');
  }
  
  // 2. 오늘 마감
  if (hasTodayDeadline) {
    return getAlfredoComment('proactive', 'deadlineToday');
  }
  
  // 3. 2시간 이상 쉬지 않음
  if (minutesSinceBreak >= 120) {
    return getAlfredoComment('proactive', 'longNoBreak');
  }
  
  // ===== 작업 상태 기반 =====
  
  // 4. 작업 중
  if (isWorking) {
    if (workMinutes >= 60) return getAlfredoComment('working', 'veryLongSession');
    if (workMinutes >= 30) return getAlfredoComment('working', 'longSession');
    if (workMinutes >= 15) return getAlfredoComment('working', 'progress');
    return getAlfredoComment('working', 'start');
  }
  
  // ===== 맥락 기반 =====
  
  // 5. 큰 일 끝난 직후
  if (lastBigTaskCompleted) {
    return getAlfredoComment('contextual', 'afterBigTask');
  }
  
  // 6. 연속 완료 중
  if (consecutiveCompletes >= 3) {
    return getAlfredoComment('contextual', 'consecutiveComplete');
  }
  
  // 7. 계속 미룬 일 있음
  if (repeatedPostponeTask) {
    return getAlfredoComment('contextual', 'repeatedPostpone');
  }
  
  // ===== 감정/에너지 기반 (갓생 강요 금지) =====
  
  // 8. 기분 안 좋음 - 무조건 배려
  if (mood === 'down') {
    return getAlfredoComment('mood', 'down');
  }
  
  // 9. 에너지 낮음 - 강요 없이 배려
  if (energy < 30) {
    // 에너지 낮을 때 할 일 권유 금지
    return getAlfredoComment('energy', 'low');
  }
  
  // ===== 완료 상태 기반 =====
  
  // 10. 모든 할 일 완료
  if (pendingTasks === 0 && completedToday > 0) {
    return getAlfredoComment('tasks', 'allDone');
  }
  
  // 11. 할 일 많음 (압박 없이)
  if (pendingTasks >= 5) {
    return getAlfredoComment('tasks', 'manyPending');
  }
  
  // ===== 스트릭 기반 (담백하게) =====
  
  if (streak >= 14) {
    return getAlfredoComment('streak', 'legendary');
  }
  if (streak >= 7) {
    return getAlfredoComment('streak', 'strong');
  }
  
  // ===== 시간대별 기본 인사 (톤 차별화) =====
  
  return getAlfredoComment('greeting', timeTone.period);
};

// 특별한 날 감지 (W1 추가)
export const getSpecialDayComment = (date = new Date()) => {
  const day = date.getDay();
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  
  // 월요일
  if (day === 1) return getAlfredoComment('special', 'monday');
  // 금요일
  if (day === 5) return getAlfredoComment('special', 'friday');
  // 주말
  if (day === 0 || day === 6) return getAlfredoComment('special', 'weekend');
  // 새해
  if (month === 1 && dayOfMonth === 1) return "새해 복 많이 받으세요";
  // 크리스마스
  if (month === 12 && dayOfMonth === 25) return "메리 크리스마스";
  
  return null;
};


// ============================================
// 📭 W2-6: Empty State 컴포넌트
// ============================================

// 빈 상태 타입별 설정
const EMPTY_STATE_CONFIGS = {
  tasks: {
    emoji: '📝',
    title: '오늘 할 일이 없어요',
    subtitle: '새로운 할 일을 추가하거나 쉬어가세요!',
    alfredoSays: '할 일 없는 날도 좋은 날이에요',
    suggestions: [
      { icon: Plus, label: '할 일 추가', action: 'addTask' },
      { icon: Calendar, label: '캘린더 보기', action: 'openCalendar' },
      { icon: Coffee, label: '그냥 쉬기', action: 'rest' },
    ],
  },
  big3: {
    emoji: '🎯',
    title: 'Big 3를 정해볼까요?',
    subtitle: '오늘 꼭 해야 할 3가지를 골라보세요',
    alfredoSays: '큰 것 3개만 하면 성공적인 하루예요',
    suggestions: [
      { icon: Target, label: '우선순위 정하기', action: 'setBig3' },
      { icon: Sparkles, label: '추천받기', action: 'getRecommendation' },
    ],
  },
  calendar: {
    emoji: '📅',
    title: '오늘 일정이 없어요',
    subtitle: '여유로운 하루네요!',
    alfredoSays: '일정 없는 날은 딥워크 찬스예요',
    suggestions: [
      { icon: Plus, label: '일정 추가', action: 'addEvent' },
      { icon: Target, label: '할 일 집중', action: 'focusTasks' },
    ],
  },
  completed: {
    emoji: '🏆',
    title: '오늘 할 일 올클리어!',
    subtitle: '수고했어요. 푹 쉬어도 돼요',
    alfredoSays: '오늘 충분히 했어요',
    suggestions: [
      { icon: Plus, label: '보너스 할 일', action: 'addBonusTask' },
      { icon: Star, label: '하루 회고', action: 'review' },
      { icon: Coffee, label: '휴식하기', action: 'rest' },
    ],
    celebratory: true,
  },
  history: {
    emoji: '📊',
    title: '아직 기록이 없어요',
    subtitle: '오늘부터 시작해볼까요?',
    alfredoSays: '첫 기록을 함께 만들어요',
    suggestions: [
      { icon: Plus, label: '첫 할 일 추가', action: 'addTask' },
    ],
  },
  search: {
    emoji: '🔍',
    title: '검색 결과가 없어요',
    subtitle: '다른 키워드로 찾아볼까요?',
    alfredoSays: '다른 방법으로 찾아볼게요',
    suggestions: [
      { icon: ListTodo, label: '전체 보기', action: 'showAll' },
    ],
  },
  routine: {
    emoji: '🔄',
    title: '루틴이 없어요',
    subtitle: '매일 하는 일을 루틴으로 만들어보세요',
    alfredoSays: '작은 루틴이 큰 변화를 만들어요',
    suggestions: [
      { icon: Plus, label: '루틴 만들기', action: 'addRoutine' },
      { icon: Sparkles, label: '추천 루틴', action: 'suggestRoutine' },
    ],
    templates: [
      { name: '아침 루틴', items: ['기상', '물 한 잔', '스트레칭'] },
      { name: '저녁 루틴', items: ['하루 정리', '내일 준비', '취침'] },
      { name: '운동 루틴', items: ['준비운동', '본운동', '마무리'] },
    ],
  },
};

// Empty State 메인 컴포넌트
export const EmptyState = ({
  type = 'tasks',
  onAction,
  darkMode = false,
  showTemplates = false,
  customMessage,
}) => {
  const config = EMPTY_STATE_CONFIGS[type] || EMPTY_STATE_CONFIGS.tasks;
  
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 text-center`}>
      {/* 이모지 */}
      <div className={`text-5xl mb-4 ${config.celebratory ? 'animate-bounce' : ''}`}>
        {config.emoji}
      </div>
      
      {/* 타이틀 */}
      <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
        {config.title}
      </h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
        {config.subtitle}
      </p>
      
      {/* 알프레도 코멘트 */}
      <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-3 mb-4 inline-block`}>
        <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'}`}>
          🐧 {customMessage || config.alfredoSays}
        </p>
      </div>
      
      {/* 제안 버튼들 */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {config.suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onAction?.(suggestion.action)}
            className={`flex items-center gap-2 px-4 py-2 ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-xl text-sm font-medium transition-colors`}
          >
            <suggestion.icon size={16} />
            {suggestion.label}
          </button>
        ))}
      </div>
      
      {/* 템플릿 (루틴용) */}
      {showTemplates && config.templates && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
            추천 템플릿
          </p>
          <div className="space-y-2">
            {config.templates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => onAction?.('useTemplate', template)}
                className={`w-full p-3 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                } rounded-xl text-left transition-colors`}
              >
                <p className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {template.name}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {template.items.join(' → ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 간단한 인라인 Empty State
export const EmptyStateInline = ({
  message,
  actionLabel,
  onAction,
  darkMode = false,
}) => {
  return (
    <div className={`py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <p className="text-sm mb-3">🐧 {message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`text-sm font-medium ${
            darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'
          } hover:underline`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// 로딩 중 상태
export const LoadingState = ({
  message = "불러오는 중...",
  darkMode = false,
}) => {
  return (
    <div className="py-12 text-center">
      <div className="text-4xl mb-3 animate-bounce">🐧</div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {message}
      </p>
    </div>
  );
};

// 에러 상태
export const ErrorState = ({
  message = "문제가 생겼어요",
  onRetry,
  darkMode = false,
}) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 text-center`}>
      <div className="text-4xl mb-3">😵</div>
      <h3 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
        앗, 문제가 생겼어요
      </h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
        {message}
      </p>
      <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-3 mb-4`}>
        <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'}`}>
          🐧 걱정 마세요, 다시 시도해볼게요
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-medium"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

export default {
  ALFREDO_COMMENTS,
  getAlfredoComment,
  getContextualComment,
  getTimeBasedTone,
  getSpecialDayComment,
  EmptyState,
  EmptyStateInline,
  LoadingState,
  ErrorState,
};
