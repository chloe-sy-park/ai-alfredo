import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ============================================
// 🐧 알프레도 표정 시스템 (W1-2)
// ============================================

const ALFREDO_EXPRESSIONS = {
  // 기본 상태
  default: { emoji: '🐧', label: '기본' },
  happy: { emoji: '😊', label: '좋아요' },
  proud: { emoji: '🐧✨', label: '뿌듯' },
  
  // 에너지 기반
  energetic: { emoji: '💪', label: '에너지 충전' },
  tired: { emoji: '😴', label: '쉬어가요' },
  lowEnergy: { emoji: '🐧💭', label: '천천히' },
  
  // 진행 상태
  focused: { emoji: '🔥', label: '집중 중' },
  working: { emoji: '🐧📋', label: '일하는 중' },
  celebrate: { emoji: '🎉', label: '축하!' },
  
  // 감정 케어
  caring: { emoji: '💜', label: '케어 모드' },
  encouraging: { emoji: '🐧💪', label: '응원' },
  comforting: { emoji: '🐧🫂', label: '위로' },
  
  // 시간대
  morning: { emoji: '☀️', label: '좋은 아침' },
  afternoon: { emoji: '🐧☕', label: '오후' },
  evening: { emoji: '🌙', label: '저녁' },
  
  // 특별 상황
  allDone: { emoji: '🏆', label: '완료!' },
  streak: { emoji: '🔥', label: '연속 달성' },
  newDay: { emoji: '🌅', label: '새로운 시작' },
};

// 상황에 맞는 표정 결정 함수
export const getAlfredoExpression = ({
  completedTasks = 0,
  totalTasks = 0,
  energy = 50,
  mood = 'okay',
  hour = new Date().getHours(),
  isInFocus = false,
  streak = 0,
  yesterdayFailed = false,
}) => {
  // 집중 모드
  if (isInFocus) {
    return ALFREDO_EXPRESSIONS.focused;
  }
  
  // 모든 할 일 완료
  if (totalTasks > 0 && completedTasks >= totalTasks) {
    return ALFREDO_EXPRESSIONS.allDone;
  }
  
  // 연속 달성 중
  if (streak >= 3) {
    return ALFREDO_EXPRESSIONS.streak;
  }
  
  // 어제 실패했지만 오늘 시작
  if (yesterdayFailed && completedTasks > 0) {
    return ALFREDO_EXPRESSIONS.encouraging;
  }
  
  // 어제 실패 - 케어 모드
  if (yesterdayFailed && completedTasks === 0) {
    return ALFREDO_EXPRESSIONS.caring;
  }
  
  // 에너지 낮음
  if (energy <= 30) {
    return ALFREDO_EXPRESSIONS.tired;
  }
  
  if (energy <= 50) {
    return ALFREDO_EXPRESSIONS.lowEnergy;
  }
  
  // 에너지 높음
  if (energy >= 80) {
    return ALFREDO_EXPRESSIONS.energetic;
  }
  
  // 기분 나쁨
  if (mood === 'down') {
    return ALFREDO_EXPRESSIONS.comforting;
  }
  
  // 진행 중
  if (completedTasks > 0 && completedTasks < totalTasks) {
    if (completedTasks >= totalTasks * 0.7) {
      return ALFREDO_EXPRESSIONS.proud;
    }
    return ALFREDO_EXPRESSIONS.working;
  }
  
  // 시간대 기반 기본값
  if (hour < 12) return ALFREDO_EXPRESSIONS.morning;
  if (hour < 18) return ALFREDO_EXPRESSIONS.afternoon;
  return ALFREDO_EXPRESSIONS.evening;
};

// ============================================
// 🐧 알프레도 한마디 시스템
// ============================================

const getStatusMessage = ({
  completedTasks = 0,
  totalTasks = 0,
  energy = 50,
  mood = 'okay',
  hour = new Date().getHours(),
  nextEventIn = null, // 분 단위
  streak = 0,
  yesterdayFailed = false,
}) => {
  const remaining = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 모든 할 일 완료
  if (totalTasks > 0 && completedTasks >= totalTasks) {
    const messages = [
      "오늘 할 일 끝! 정말 잘했어요, Boss! 🎉",
      "완벽해요! 남은 시간은 자유롭게 보내세요 ✨",
      "대단해요! 오늘 목표 달성! 🏆",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // 어제 실패 케어
  if (yesterdayFailed && completedTasks === 0) {
    const messages = [
      "괜찮아요, 오늘 다시 시작하면 돼요 💜",
      "어제는 쉬어가는 날이었어요. 오늘 천천히 해봐요.",
      "새로운 날이에요. 가벼운 것 하나부터 시작해볼까요?",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // 다음 일정 임박
  if (nextEventIn && nextEventIn <= 30) {
    return `${nextEventIn}분 후 일정이 있어요. 준비할 시간! ⏰`;
  }
  
  // 에너지 낮음
  if (energy <= 30) {
    const messages = [
      "에너지가 낮아요. 무리하지 마세요 💜",
      "쉬어가면서 해요. 급한 건 없어요.",
      "물 한 잔 마시고 천천히 해봐요 ☕",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // 에너지 높음
  if (energy >= 80 && remaining > 0) {
    const messages = [
      "컨디션 좋을 때 어려운 것 먼저! 💪",
      "에너지 충전 완료! 해치워봐요 🔥",
      "지금이 골든타임이에요! ✨",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // 진행 중
  if (completedTasks > 0 && remaining > 0) {
    if (progress >= 70) {
      return `거의 다 왔어요! ${remaining}개만 더! 💪`;
    }
    if (progress >= 50) {
      return `절반 넘었어요! ${remaining}개 남았어요 👍`;
    }
    return `${completedTasks}개 완료! 잘하고 있어요 ✨`;
  }
  
  // 아직 시작 안 함
  if (completedTasks === 0 && totalTasks > 0) {
    const messages = [
      "가벼운 것 하나부터 시작해볼까요?",
      "오늘 할 일 정리해뒀어요. 시작해봐요! 📋",
      "작은 것부터 하나씩. 같이 해봐요!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // 기본 시간대별 인사
  if (hour < 12) return "좋은 아침이에요, Boss! ☀️";
  if (hour < 18) return "오후도 파이팅이에요! ☕";
  return "하루 마무리 시간이에요 🌙";
};

// ============================================
// 🐧 알프레도 상태바 컴포넌트 (W1-1)
// ============================================

const AlfredoStatusBar = ({
  completedTasks = 0,
  totalTasks = 0,
  energy = 50,
  mood = 'okay',
  streak = 0,
  yesterdayFailed = false,
  nextEventIn = null,
  isInFocus = false,
  darkMode = false,
  onTap,
  expanded = false,
  onToggleExpand,
}) => {
  const hour = new Date().getHours();
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 표정 결정
  const expression = getAlfredoExpression({
    completedTasks,
    totalTasks,
    energy,
    mood,
    hour,
    isInFocus,
    streak,
    yesterdayFailed,
  });
  
  // 한마디 결정
  const message = getStatusMessage({
    completedTasks,
    totalTasks,
    energy,
    mood,
    hour,
    nextEventIn,
    streak,
    yesterdayFailed,
  });
  
  // 스타일
  const bgColor = darkMode 
    ? 'bg-gray-800/95 border-gray-700' 
    : 'bg-white/95 border-[#A996FF]/20';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`sticky top-0 z-40 ${bgColor} backdrop-blur-xl border-b shadow-sm transition-all duration-300`}>
      {/* 메인 상태바 */}
      <button 
        onClick={onToggleExpand || onTap}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        {/* 알프레도 아바타 + 표정 */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-lg">{expression.emoji.includes('🐧') ? '🐧' : expression.emoji}</span>
          </div>
          {/* 상태 뱃지 */}
          {expression.emoji !== '🐧' && !expression.emoji.includes('🐧') && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <span className="text-xs">{expression.emoji}</span>
            </div>
          )}
          {expression.emoji.includes('🐧') && expression.emoji.length > 2 && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <span className="text-xs">{expression.emoji.replace('🐧', '')}</span>
            </div>
          )}
        </div>
        
        {/* 메시지 + 진행률 */}
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium ${textPrimary} truncate`}>
            {message}
          </p>
          {/* 진행률 바 */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex-1 h-1.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${textSecondary} shrink-0`}>
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}
        </div>
        
        {/* 확장 토글 */}
        {onToggleExpand && (
          <div className={`${textSecondary} shrink-0`}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        )}
      </button>
      
      {/* 확장된 상태 (선택적) */}
      {expanded && (
        <div className={`px-4 pb-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="grid grid-cols-3 gap-3 pt-3">
            {/* 오늘 진행률 */}
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <p className={`text-lg font-bold ${progress === 100 ? 'text-emerald-500' : 'text-[#A996FF]'}`}>
                {progress}%
              </p>
              <p className={`text-[11px] ${textSecondary}`}>진행률</p>
            </div>
            
            {/* 에너지 */}
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <p className={`text-lg font-bold ${energy >= 70 ? 'text-emerald-500' : energy <= 30 ? 'text-red-400' : 'text-[#A996FF]'}`}>
                {energy}%
              </p>
              <p className={`text-[11px] ${textSecondary}`}>에너지</p>
            </div>
            
            {/* 연속 */}
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <p className="text-lg font-bold text-orange-500">
                🔥{streak}
              </p>
              <p className={`text-[11px] ${textSecondary}`}>연속</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlfredoStatusBar;
export { getAlfredoExpression, getStatusMessage };
