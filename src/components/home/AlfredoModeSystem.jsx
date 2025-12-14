import React, { useState, useEffect } from 'react';
import { 
  Flame, Heart, Zap, Target, Coffee, Moon, Sun, 
  Clock, Play, Pause, X, Volume2, VolumeX, MessageCircle
} from 'lucide-react';

// ============================================
// 🐧 알프레도 모드 시스템 (W2-3)
// ============================================

const ALFREDO_MODES = {
  focus: {
    id: 'focus',
    emoji: '🔥',
    name: 'Focus 모드',
    description: '방해 최소화, 집중 도움',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
    messages: [
      "지금 집중 모드예요. 알림은 잠시 꺼뒀어요! 🔥",
      "방해 없이 몰입하세요. 제가 지켜볼게요.",
      "하나에 집중! 다른 건 나중에요.",
    ],
    tips: [
      "25분 집중 + 5분 휴식 추천해요",
      "물 한 잔 마시면서 시작해볼까요?",
      "지금 하는 일에만 집중!",
    ],
  },
  care: {
    id: 'care',
    emoji: '💜',
    name: 'Care 모드',
    description: '천천히, 무리하지 않게',
    color: 'from-[#A996FF] to-[#7C4DFF]',
    bgColor: 'bg-[#F5F3FF]',
    borderColor: 'border-[#E8E3FF]',
    textColor: 'text-[#8B7CF7]',
    messages: [
      "오늘은 천천히 해요. 무리하지 않아도 돼요 💜",
      "괜찮아요, 작은 것 하나만 해도 충분해요.",
      "쉬어가면서 해요. 건강이 먼저예요.",
    ],
    tips: [
      "가벼운 것부터 하나씩",
      "완벽하지 않아도 괜찮아요",
      "필요하면 쉬어가세요",
    ],
  },
  challenge: {
    id: 'challenge',
    emoji: '🚀',
    name: 'Challenge 모드',
    description: '오늘 하루 터보! 레벨업',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    messages: [
      "오늘 에너지 충만! 해치워버려요! 🚀",
      "컨디션 최고! 어려운 것도 거뜬해요!",
      "도전 모드 ON! XP 보너스 +20%! ⭐",
    ],
    tips: [
      "어려운 일 먼저 처리해요",
      "목표 초과 달성 가능!",
      "오늘 최대한 밀어붙여봐요",
    ],
  },
};

// 시간대/컨디션 기반 모드 자동 추천
export const getRecommendedMode = ({ energy, mood, hour, completedTasks, totalTasks }) => {
  // 에너지 낮거나 기분 안 좋으면 Care
  if (energy <= 35 || mood === 'down') {
    return 'care';
  }
  
  // 에너지 높고 기분 좋으면 Challenge
  if (energy >= 75 && (mood === 'upbeat' || mood === 'light')) {
    return 'challenge';
  }
  
  // 오후 슬럼프 시간 (14-16시) + 에너지 보통 = Care
  if ((hour >= 14 && hour <= 16) && energy <= 60) {
    return 'care';
  }
  
  // 아침 골든타임 (9-11시) + 에너지 괜찮음 = Challenge
  if ((hour >= 9 && hour <= 11) && energy >= 60) {
    return 'challenge';
  }
  
  // 기본 = Focus
  return 'focus';
};

// 모드 선택 바
const AlfredoModeSelector = ({
  currentMode = 'focus',
  recommendedMode = null,
  onModeChange,
  darkMode = false,
  compact = false,
}) => {
  const modes = Object.values(ALFREDO_MODES);
  
  if (compact) {
    // 컴팩트 모드 (현재 모드만 표시)
    const mode = ALFREDO_MODES[currentMode];
    return (
      <button
        onClick={() => onModeChange?.(currentMode === 'focus' ? 'care' : currentMode === 'care' ? 'challenge' : 'focus')}
        className={`flex items-center gap-2 px-3 py-2 ${mode.bgColor} ${mode.borderColor} border rounded-xl transition-all hover:scale-[1.02]`}
      >
        <span className="text-lg">{mode.emoji}</span>
        <span className={`text-sm font-semibold ${mode.textColor}`}>{mode.name}</span>
      </button>
    );
  }
  
  return (
    <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-[#A996FF]/20'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          🐧 알프레도 모드
        </p>
        {recommendedMode && recommendedMode !== currentMode && (
          <span className={`text-xs px-2 py-1 ${ALFREDO_MODES[recommendedMode].bgColor} ${ALFREDO_MODES[recommendedMode].textColor} rounded-full`}>
            추천: {ALFREDO_MODES[recommendedMode].emoji} {ALFREDO_MODES[recommendedMode].name}
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange?.(mode.id)}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              currentMode === mode.id
                ? `bg-gradient-to-r ${mode.color} text-white shadow-md scale-[1.02]`
                : `${mode.bgColor} ${mode.textColor} hover:opacity-80`
            }`}
          >
            <span className="text-xl">{mode.emoji}</span>
            <span className="text-[11px] font-semibold">{mode.name.replace(' 모드', '')}</span>
          </button>
        ))}
      </div>
      
      {/* 현재 모드 설명 */}
      <div className={`mt-3 p-3 ${ALFREDO_MODES[currentMode].bgColor} rounded-xl`}>
        <p className={`text-xs ${ALFREDO_MODES[currentMode].textColor}`}>
          {ALFREDO_MODES[currentMode].messages[Math.floor(Math.random() * ALFREDO_MODES[currentMode].messages.length)]}
        </p>
      </div>
    </div>
  );
};

// ============================================
// 🐧 "지금" 카드 (W2-2)
// ============================================

const NowCard = ({
  currentTask = null,
  nextEvent = null,
  alfredoMode = 'focus',
  energy = 60,
  onStartTask,
  onCompleteTask,
  onSkipTask,
  onOpenChat,
  darkMode = false,
}) => {
  const mode = ALFREDO_MODES[alfredoMode];
  const hour = new Date().getHours();
  
  // 시간대별 메시지
  const getTimeBasedMessage = () => {
    if (hour < 10) return "좋은 아침이에요! 오늘 첫 번째 할 일이에요.";
    if (hour < 12) return "오전 시간을 잘 활용해봐요!";
    if (hour < 14) return "점심 전에 이것만 끝내볼까요?";
    if (hour < 17) return "오후도 힘내요! 조금만 더!";
    if (hour < 19) return "저녁 전 마지막 스퍼트!";
    return "하루 마무리 중이에요. 급한 것만!";
  };
  
  if (!currentTask) {
    return (
      <div className={`${mode.bgColor} border ${mode.borderColor} rounded-xl p-5 mb-4`}>
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🎉</div>
          <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
            할 일이 없어요!
          </p>
          <p className={`text-sm ${mode.textColor}`}>
            {energy >= 60 ? "새 할 일을 추가하거나 쉬어가세요!" : "잘 쉬고 있어요. 그대로 괜찮아요 💜"}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${mode.bgColor} border ${mode.borderColor} rounded-xl overflow-hidden mb-4 shadow-sm`}>
      {/* 헤더 */}
      <div className={`bg-gradient-to-r ${mode.color} px-4 py-3 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{mode.emoji}</span>
            <span className="font-bold">지금 할 일</span>
          </div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {mode.name}
          </div>
        </div>
        <p className="text-sm text-white/80 mt-1">{getTimeBasedMessage()}</p>
      </div>
      
      {/* 태스크 내용 */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 체크버튼 */}
          <button
            onClick={() => onCompleteTask?.(currentTask)}
            className={`w-7 h-7 rounded-full border-2 ${mode.borderColor} flex items-center justify-center shrink-0 hover:bg-white transition-colors`}
          >
            <div className={`w-3 h-3 rounded-full ${currentTask.status === 'done' ? `bg-gradient-to-r ${mode.color}` : ''}`} />
          </button>
          
          {/* 태스크 정보 */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
              {currentTask.title}
            </h3>
            {currentTask.project && (
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                {currentTask.project}
              </p>
            )}
            {currentTask.deadline && (
              <span className={`text-xs px-2 py-1 ${
                currentTask.deadline.includes('오늘') || currentTask.deadline.includes('D-0')
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600'
              } rounded-full`}>
                {currentTask.deadline}
              </span>
            )}
          </div>
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSkipTask?.(currentTask)}
            className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl text-sm font-medium hover:opacity-80 transition-all`}
          >
            나중에
          </button>
          <button
            onClick={() => onStartTask?.(currentTask)}
            className={`flex-1 py-2.5 bg-gradient-to-r ${mode.color} text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2`}
          >
            <Play size={16} />
            시작하기
          </button>
        </div>
      </div>
      
      {/* 다음 일정 힌트 */}
      {nextEvent && nextEvent.totalMins <= 60 && (
        <div className={`px-4 py-3 border-t ${mode.borderColor} ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <p className={`text-xs ${mode.textColor} flex items-center gap-2`}>
            <Clock size={12} />
            {nextEvent.text} 후 "{nextEvent.event.title}" 일정이 있어요
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🐧 바디 더블링 모드 (W2-4)
// ============================================

const BODY_DOUBLING_MESSAGES = {
  start: [
    "같이 시작해요! 옆에서 응원할게요 🐧",
    "Boss 옆에 있을게요. 편하게 해요!",
    "혼자가 아니에요. 함께 해요 💜",
  ],
  progress: [
    "잘하고 있어요! 이 페이스 유지해요 👍",
    "좋아요, 계속 가봐요!",
    "집중 잘 되네요! 💪",
  ],
  break: [
    "잠깐 쉬어가요. 물 한 잔 어때요?",
    "휴식도 일의 일부예요!",
    "스트레칭 한 번 해볼까요?",
  ],
  encourage: [
    "힘들어도 조금만 더! 거의 다 왔어요!",
    "포기하지 마요, 같이 해요!",
    "Boss는 할 수 있어요! 믿어요!",
  ],
  complete: [
    "해냈어요!! 정말 대단해요! 🎉",
    "와! 완료! Boss 최고! 🏆",
    "역시 Boss예요! 멋져요! ✨",
  ],
};

const BodyDoublingMode = ({
  isActive,
  onClose,
  currentTask,
  elapsedMinutes = 0,
  onComplete,
  onPause,
  isPaused = false,
  darkMode = false,
  alfredoMode = 'focus',
}) => {
  const [message, setMessage] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const mode = ALFREDO_MODES[alfredoMode];
  
  // 메시지 업데이트
  useEffect(() => {
    const getPhaseMessages = () => {
      if (elapsedMinutes === 0) return BODY_DOUBLING_MESSAGES.start;
      if (elapsedMinutes >= 45) return BODY_DOUBLING_MESSAGES.encourage;
      if (elapsedMinutes % 25 < 5 && elapsedMinutes > 0) return BODY_DOUBLING_MESSAGES.break;
      return BODY_DOUBLING_MESSAGES.progress;
    };
    
    const messages = getPhaseMessages();
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    // 5분마다 격려 메시지
    if (elapsedMinutes > 0 && elapsedMinutes % 5 === 0) {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
  }, [elapsedMinutes]);
  
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-400">바디 더블링</p>
          <p className={`text-lg font-bold bg-gradient-to-r ${mode.color} bg-clip-text text-transparent`}>
            {mode.emoji} {mode.name}
          </p>
        </div>
        <div className="w-10" />
      </div>
      
      {/* 알프레도 아바타 + 메시지 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 알프레도 */}
        <div className={`w-32 h-32 bg-gradient-to-br ${mode.color} rounded-full flex items-center justify-center shadow-2xl mb-6 ${showEncouragement ? 'animate-bounce' : ''}`}>
          <span className="text-6xl">🐧</span>
        </div>
        
        {/* 메시지 버블 */}
        <div className="bg-gray-700/50 backdrop-blur-xl rounded-2xl px-6 py-4 mb-8 max-w-xs text-center">
          <p className="text-white text-lg">{message}</p>
        </div>
        
        {/* 현재 태스크 */}
        {currentTask && (
          <div className={`w-full max-w-sm ${mode.bgColor} rounded-xl p-4 mb-6`}>
            <p className={`text-xs ${mode.textColor} mb-1`}>지금 하는 일</p>
            <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{currentTask.title}</p>
          </div>
        )}
        
        {/* 경과 시간 */}
        <div className="text-center mb-8">
          <p className="text-6xl font-black text-white mb-2">
            {Math.floor(elapsedMinutes / 60).toString().padStart(2, '0')}:{(elapsedMinutes % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-gray-400">집중 시간</p>
        </div>
      </div>
      
      {/* 하단 컨트롤 */}
      <div className="px-6 pb-8">
        <div className="flex gap-3">
          <button
            onClick={onPause}
            className="flex-1 py-4 bg-gray-700/50 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
            {isPaused ? '계속하기' : '잠시 멈춤'}
          </button>
          <button
            onClick={onComplete}
            className={`flex-1 py-4 bg-gradient-to-r ${mode.color} text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg`}
          >
            🎉 완료!
          </button>
        </div>
        
        {/* 알프레도에게 말하기 */}
        <button
          onClick={() => {/* 채팅 열기 */}}
          className="w-full mt-3 py-3 bg-gray-700/30 text-gray-300 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} />
          알프레도에게 말하기
        </button>
      </div>
    </div>
  );
};

// ============================================
// 🌅 시간대별 인사 컴포넌트 (W2-1)
// ============================================

const TimeBasedGreeting = ({
  hour = new Date().getHours(),
  userName = 'Boss',
  energy = 60,
  completedTasks = 0,
  totalTasks = 0,
  streak = 0,
  darkMode = false,
}) => {
  const getTimeGreeting = () => {
    if (hour < 6) {
      return {
        emoji: '🌙',
        greeting: '새벽에 일어났네요',
        message: '무리하지 말고, 필요한 것만 해요.',
        bg: 'from-indigo-900 to-purple-900',
      };
    }
    if (hour < 9) {
      return {
        emoji: '🌅',
        greeting: '좋은 아침이에요',
        message: '오늘 하루도 함께 해요!',
        bg: 'from-orange-400 to-pink-500',
      };
    }
    if (hour < 12) {
      return {
        emoji: '☀️',
        greeting: '활기찬 오전이에요',
        message: '집중하기 좋은 시간이에요!',
        bg: 'from-yellow-400 to-orange-400',
      };
    }
    if (hour < 14) {
      return {
        emoji: '🍽️',
        greeting: '점심시간이에요',
        message: '맛있게 먹고 잠깐 쉬어가요.',
        bg: 'from-green-400 to-emerald-500',
      };
    }
    if (hour < 17) {
      return {
        emoji: '⚡',
        greeting: '오후도 파이팅',
        message: completedTasks > 0 
          ? `벌써 ${completedTasks}개나 완료! 잘하고 있어요.`
          : '가벼운 것부터 시작해봐요.',
        bg: 'from-blue-400 to-cyan-400',
      };
    }
    if (hour < 19) {
      return {
        emoji: '🌆',
        greeting: '저녁이 다가와요',
        message: '급한 것만 마무리하고 쉬어가요.',
        bg: 'from-purple-400 to-pink-400',
      };
    }
    if (hour < 22) {
      return {
        emoji: '🌙',
        greeting: '하루 마무리 시간',
        message: '오늘도 수고했어요! 내일을 위해 쉬어요.',
        bg: 'from-indigo-500 to-purple-600',
      };
    }
    return {
      emoji: '😴',
      greeting: '늦은 밤이에요',
      message: '무리하지 말고 푹 쉬세요.',
      bg: 'from-gray-700 to-gray-900',
    };
  };
  
  const timeData = getTimeGreeting();
  
  return (
    <div className={`bg-gradient-to-r ${timeData.bg} rounded-xl p-5 mb-4 text-white shadow-lg`}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl shrink-0">
          {timeData.emoji}
        </div>
        <div className="flex-1">
          <p className="text-xl font-bold mb-1">{timeData.greeting}, {userName}!</p>
          <p className="text-white/80 text-sm">{timeData.message}</p>
          
          {/* 오늘 진행 상황 */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <span>✅</span>
                <span>{completedTasks}/{totalTasks} 완료</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <span>🔥</span>
                  <span>{streak}일 연속</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export {
  ALFREDO_MODES,
  getRecommendedMode,
  AlfredoModeSelector,
  NowCard,
  BodyDoublingMode,
  TimeBasedGreeting,
};
