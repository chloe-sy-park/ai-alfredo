import React from 'react';
import { 
  Plus, Calendar, Target, Sparkles, Coffee, 
  Sun, Moon, Cloud, Zap, Heart, Star,
  CheckCircle2, ListTodo, Clock, Flame
} from 'lucide-react';

// ============================================
// 🐧 W2-5: 알프레도 한마디 (50+ 상황별)
// ============================================

export const ALFREDO_COMMENTS = {
  // ========== 시간대별 인사 ==========
  greeting: {
    dawn: [ // 5-7시
      "새벽에 일어나셨네요... 대단해요 ✨",
      "아직 어둡지만, Boss의 하루는 밝아요",
      "새벽형 인간이시군요! 존경해요 🌅",
    ],
    morning: [ // 7-9시
      "좋은 아침이에요! 오늘도 파이팅 💪",
      "아침 공기처럼 상쾌한 하루 되세요~",
      "오늘 하루, 같이 해봐요! 🐧",
    ],
    activeMorning: [ // 9-12시
      "골든타임이에요! 집중하기 좋은 시간 ⚡",
      "오전의 에너지로 큰 일 해치워요!",
      "지금이 제일 머리 잘 돌아갈 때예요~",
    ],
    lunch: [ // 12-14시
      "점심은 드셨어요? 밥심이 일심! 🍚",
      "잠깐 쉬어가도 괜찮아요~",
      "오후를 위한 충전 시간이에요 ☕",
    ],
    afternoon: [ // 14-17시
      "오후 슬럼프? 스트레칭 한 번 어때요?",
      "조금만 더 힘내면 퇴근이에요!",
      "작은 것부터 하나씩 해봐요 📝",
    ],
    evening: [ // 17-20시
      "오늘 하루 수고했어요! 🌆",
      "저녁 노을처럼 여유롭게~",
      "하루 마무리, 같이 해요!",
    ],
    night: [ // 20-23시
      "밤이에요~ 무리하지 마세요 🌙",
      "오늘 한 것만으로도 충분해요",
      "푹 쉬는 것도 생산성이에요!",
    ],
    lateNight: [ // 23시 이후
      "이 시간까지... 건강 챙기세요 💜",
      "내일의 Boss를 위해 자는 건 어때요?",
      "늦었지만, 항상 응원해요 🌟",
    ],
  },

  // ========== 에너지/기분별 ==========
  energy: {
    high: [ // 70% 이상
      "에너지 충만! 오늘 뭐든 할 수 있어요 💪",
      "컨디션 좋으시네요! 큰 일 해치울 타이밍",
      "이 기세로 메인 퀘스트 클리어! ⚡",
    ],
    medium: [ // 40-70%
      "적당히 좋은 컨디션이에요~",
      "페이스 조절하면서 가요!",
      "무리하지 않는 선에서 화이팅 🐧",
    ],
    low: [ // 40% 미만
      "오늘은 천천히 가도 괜찮아요 💜",
      "작은 것 하나만 해도 성공이에요",
      "쉬는 것도 용기예요. 괜찮아요 🫂",
    ],
  },

  mood: {
    great: [
      "기분 좋아 보여요! 그 에너지 최고 ✨",
      "오늘 뭔가 좋은 일 있으셨나요? 😊",
      "밝은 기운이 느껴져요~",
    ],
    good: [
      "오늘도 평온한 하루네요~",
      "이 페이스 유지해요!",
      "꾸준함이 최고예요 👍",
    ],
    neutral: [
      "그냥 그런 날도 있죠~",
      "특별하지 않아도 괜찮아요",
      "평범한 하루도 소중해요 🐧",
    ],
    down: [
      "힘든 날이구나... 옆에 있을게요 💜",
      "아무것도 안 해도 괜찮아요",
      "Boss의 페이스대로 가요. 기다릴게요",
    ],
  },

  // ========== 할 일 관련 ==========
  tasks: {
    manyPending: [ // 5개 이상 밀림
      "할 일이 좀 쌓였네요... 하나씩 가요!",
      "우선순위 하나만 골라볼까요?",
      "전부 다 안 해도 돼요. 중요한 것만!",
    ],
    fewPending: [ // 2-4개
      "적당히 있네요~ 잘 하고 계세요!",
      "오늘 안에 끝낼 수 있을 것 같아요",
      "이 정도면 관리 가능해요 👍",
    ],
    almostDone: [ // 1개
      "거의 다 왔어요! 마지막 하나! 🔥",
      "라스트 스퍼트! 할 수 있어요!",
      "이것만 하면 올클이에요!",
    ],
    allDone: [
      "우와! 다 끝냈어요! 대단해요 🎉",
      "오늘 할 일 올클! 자랑스러워요 ✨",
      "완벽한 하루! 푹 쉬세요~",
    ],
    noTasks: [
      "오늘은 여유로운 날이네요~",
      "할 일 없으면 쉬어도 돼요!",
      "뭔가 추가하고 싶으시면 말씀해요 🐧",
    ],
  },

  // ========== 스트릭/연속 달성 ==========
  streak: {
    starting: [ // 1-2일
      "시작이 반이에요! 좋은 출발 🌱",
      "첫 발을 뗐어요! 화이팅!",
      "이 기세 유지해봐요!",
    ],
    building: [ // 3-6일
      "연속 달성 중! 습관이 되어가요 🔥",
      "꾸준함이 쌓이고 있어요!",
      "이 리듬 좋아요~ 계속 가요!",
    ],
    strong: [ // 7-13일
      "일주일 넘었어요! 대단해요 🌟",
      "이제 습관이 된 것 같아요!",
      "Boss 최고! 이 흐름 유지!",
    ],
    legendary: [ // 14일 이상
      "전설의 스트릭... 존경합니다 👑",
      "이건 진짜 대단한 거예요!",
      "Boss는 진정한 프로! ✨",
    ],
    broken: [
      "괜찮아요, 다시 시작하면 돼요 💜",
      "쉬어간 것도 필요했던 거예요",
      "새로운 스트릭, 오늘부터!",
    ],
  },

  // ========== 작업 중 격려 ==========
  working: {
    start: [
      "시작했어요! 이미 반은 한 거예요 ⚡",
      "좋아요, 같이 해봐요!",
      "옆에서 응원할게요 🐧",
    ],
    progress: [
      "잘 하고 있어요! 계속 가요~",
      "집중 모드 최고! 💪",
      "이 페이스 좋아요!",
    ],
    longSession: [ // 30분 이상
      "오래 집중했네요! 잠깐 쉴까요?",
      "스트레칭 한 번 하고 가요~",
      "물 한 잔 마시는 건 어때요? 💧",
    ],
    almostDone: [
      "거의 다 왔어요! 조금만 더!",
      "끝이 보여요! 화이팅! 🔥",
      "마무리 스퍼트! 할 수 있어요!",
    ],
  },

  // ========== 완료 축하 ==========
  completion: {
    normal: [
      "해냈어요! 👏",
      "완료! 수고했어요~",
      "하나 끝! 잘했어요 ✨",
    ],
    important: [
      "큰 일 해냈어요! 대단해요! 🎉",
      "메인 퀘스트 클리어! 자랑스러워요!",
      "이건 진짜 대단한 거예요! ⭐",
    ],
    firstOfDay: [
      "오늘 첫 완료! 좋은 시작이에요!",
      "첫 술에 배부를 순 없지만, 시작이 중요해요!",
      "하나 끝냈으니 나머지도 할 수 있어요!",
    ],
    lastOfDay: [
      "오늘 마지막까지 완벽! 🏆",
      "끝까지 해내다니... 존경해요!",
      "완벽한 마무리! 푹 쉬세요~",
    ],
  },

  // ========== 날씨/계절 (미래 연동용) ==========
  weather: {
    sunny: [
      "날씨 좋아요! 기분도 업! ☀️",
      "햇살 받으면 비타민D 충전~",
    ],
    rainy: [
      "비 오는 날... 실내에서 집중하기 좋아요 🌧️",
      "빗소리 들으면서 작업하는 것도 좋죠~",
    ],
    cloudy: [
      "흐린 날이지만 마음은 맑게! ☁️",
      "이런 날은 차 한 잔 하면서~",
    ],
    cold: [
      "추워요! 따뜻하게 입으세요 🧥",
      "핫초코 한 잔 어때요?",
    ],
    hot: [
      "더워요! 수분 보충 잊지 마세요 💧",
      "에어컨 바람 쐬면서 집중~",
    ],
  },

  // ========== 특별한 날 ==========
  special: {
    monday: [
      "월요일... 같이 이겨내요 💪",
      "한 주의 시작! 천천히 가요~",
    ],
    friday: [
      "금요일이에요! 조금만 더! 🎉",
      "주말이 기다려요~ 오늘만 힘내요!",
    ],
    weekend: [
      "주말이에요! 푹 쉬어도 돼요~",
      "충전의 시간! 재충전하세요 🔋",
    ],
    birthday: [
      "생일 축하해요! 🎂 오늘은 Boss가 왕!",
    ],
    newYear: [
      "새해 복 많이 받으세요! 🎊",
    ],
  },

  // ========== 격려/위로 ==========
  encourage: {
    general: [
      "할 수 있어요. 믿어요 💜",
      "Boss는 생각보다 대단한 사람이에요",
      "작은 진전도 진전이에요!",
      "완벽하지 않아도 괜찮아요",
      "오늘 하루도 잘 버텨줘서 고마워요",
    ],
    afterFailure: [
      "실패해도 괜찮아요. 다시 하면 돼요 💜",
      "넘어져도 다시 일어나면 돼요",
      "이건 끝이 아니라 과정이에요",
      "못한 게 아니라 아직 안 한 거예요",
    ],
    overwhelmed: [
      "너무 많으면 하나만 골라요",
      "전부 다 안 해도 돼요",
      "오늘 하루가 전부가 아니에요",
      "숨 한 번 크게 쉬어요 🌬️",
    ],
  },
};

// 상황에 맞는 코멘트 가져오기
export const getAlfredoComment = (category, subcategory) => {
  const comments = ALFREDO_COMMENTS[category]?.[subcategory];
  if (!comments || comments.length === 0) {
    return "옆에서 응원하고 있어요 🐧";
  }
  return comments[Math.floor(Math.random() * comments.length)];
};

// 컨텍스트 기반 자동 코멘트
export const getContextualComment = ({
  hour = new Date().getHours(),
  energy = 50,
  mood = 'neutral',
  pendingTasks = 0,
  completedToday = 0,
  streak = 0,
  isWorking = false,
  workMinutes = 0,
}) => {
  // 우선순위: 작업 중 > 에너지 낮음 > 시간대 > 할일 상태
  
  // 1. 작업 중이면 작업 관련 코멘트
  if (isWorking) {
    if (workMinutes >= 30) return getAlfredoComment('working', 'longSession');
    if (workMinutes >= 15) return getAlfredoComment('working', 'progress');
    return getAlfredoComment('working', 'start');
  }
  
  // 2. 기분이 안 좋으면 위로
  if (mood === 'down') {
    return getAlfredoComment('mood', 'down');
  }
  
  // 3. 에너지 낮으면 배려
  if (energy < 30) {
    return getAlfredoComment('energy', 'low');
  }
  
  // 4. 모든 할 일 완료
  if (pendingTasks === 0 && completedToday > 0) {
    return getAlfredoComment('tasks', 'allDone');
  }
  
  // 5. 스트릭 상태
  if (streak >= 14) {
    return getAlfredoComment('streak', 'legendary');
  }
  
  // 6. 시간대별 인사
  if (hour < 7) return getAlfredoComment('greeting', 'dawn');
  if (hour < 9) return getAlfredoComment('greeting', 'morning');
  if (hour < 12) return getAlfredoComment('greeting', 'activeMorning');
  if (hour < 14) return getAlfredoComment('greeting', 'lunch');
  if (hour < 17) return getAlfredoComment('greeting', 'afternoon');
  if (hour < 20) return getAlfredoComment('greeting', 'evening');
  if (hour < 23) return getAlfredoComment('greeting', 'night');
  return getAlfredoComment('greeting', 'lateNight');
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
    alfredoSays: '할 일 없는 날도 좋은 날이에요~ 🐧',
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
    alfredoSays: '큰 것 3개만 하면 성공적인 하루예요!',
    suggestions: [
      { icon: Target, label: '우선순위 정하기', action: 'setBig3' },
      { icon: Sparkles, label: '추천받기', action: 'getRecommendation' },
    ],
  },
  calendar: {
    emoji: '📅',
    title: '오늘 일정이 없어요',
    subtitle: '여유로운 하루네요!',
    alfredoSays: '일정 없는 날은 딥워크 찬스! 💪',
    suggestions: [
      { icon: Plus, label: '일정 추가', action: 'addEvent' },
      { icon: Target, label: '할 일 집중', action: 'focusTasks' },
    ],
  },
  completed: {
    emoji: '🏆',
    title: '오늘 할 일 올클리어!',
    subtitle: '정말 대단해요! 푹 쉬어도 돼요',
    alfredoSays: 'Boss 최고! 자랑스러워요 ✨',
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
    alfredoSays: '첫 기록을 함께 만들어요! 🌱',
    suggestions: [
      { icon: Plus, label: '첫 할 일 추가', action: 'addTask' },
    ],
  },
  search: {
    emoji: '🔍',
    title: '검색 결과가 없어요',
    subtitle: '다른 키워드로 찾아볼까요?',
    alfredoSays: '다른 방법으로 찾아볼게요~',
    suggestions: [
      { icon: ListTodo, label: '전체 보기', action: 'showAll' },
    ],
  },
  routine: {
    emoji: '🔄',
    title: '루틴이 없어요',
    subtitle: '매일 하는 일을 루틴으로 만들어보세요',
    alfredoSays: '작은 루틴이 큰 변화를 만들어요!',
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
          🐧 걱정 마세요, 다시 시도해볼게요!
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
  EmptyState,
  EmptyStateInline,
  LoadingState,
  ErrorState,
};
