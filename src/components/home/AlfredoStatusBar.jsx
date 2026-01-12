import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getContextualComment, getTimeBasedTone, getSpecialDayComment, getAlfredoComment } from './AlfredoComments';

// ============================================
// 🐧 W1 강화: 알프레도 표정 시스템
// 이대표 스타일 + 선제적 반응
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
  
  // 시간대 (톤 차별화)
  dawn: { emoji: '🌅', label: '새벽' },
  morning: { emoji: '☀️', label: '좋은 아침' },
  activeMorning: { emoji: '⚡', label: '골든타임' },
  lunch: { emoji: '🍚', label: '점심' },
  afternoon: { emoji: '☕', label: '오후' },
  evening: { emoji: '🌆', label: '저녁' },
  night: { emoji: '🌙', label: '밤' },
  lateNight: { emoji: '😴', label: '늦은 밤' },
  
  // 특별 상황
  allDone: { emoji: '🏆', label: '완료!' },
  streak: { emoji: '🔥', label: '연속 달성' },
  newDay: { emoji: '🌅', label: '새로운 시작' },
  
  // 선제적 상황 (W1 추가)
  meetingSoon: { emoji: '📅', label: '미팅 임박' },
  deadlineSoon: { emoji: '⚠️', label: '마감 임박' },
  needBreak: { emoji: '🧘', label: '쉬어가요' },
  burnout: { emoji: '💜', label: '무리하지 마세요' },
};

// 상황에 맞는 표정 결정 함수 (W1 강화)
export const getAlfredoExpression = ({
  completedTasks = 0,
  totalTasks = 0,
  energy = 50,
  mood = 'okay',
  hour = new Date().getHours(),
  isInFocus = false,
  streak = 0,
  yesterdayFailed = false,
  hasUpcomingMeeting = false,
  hasTodayDeadline = false,
  minutesSinceBreak = 0,
}) => {
  // 선제적 알림 (가장 높은 우선순위)
  if (hasUpcomingMeeting) {
    return ALFREDO_EXPRESSIONS.meetingSoon;
  }
  
  if (hasTodayDeadline && energy > 30) {
    return ALFREDO_EXPRESSIONS.deadlineSoon;
  }
  
  if (minutesSinceBreak >= 120) {
    return ALFREDO_EXPRESSIONS.needBreak;
  }
  
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
  
  // 에너지 매우 낮음 (번아웃 케어)
  if (energy <= 20) {
    return ALFREDO_EXPRESSIONS.burnout;
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
  
  // 시간대 기반 기본값 (W1 강화 - 세분화)
  const timeTone = getTimeBasedTone(hour);
  return ALFREDO_EXPRESSIONS[timeTone.period] || ALFREDO_EXPRESSIONS.default;
};

// ============================================
// 🐧 W1 강화: 알프레도 한마디 시스템
// 이대표 스타일 톤앤매너 적용
// - 직접 질문 금지
// - 과한 칭찬 금지
// - 짧고 임팩트있게
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
  isWorking = false,
  workMinutes = 0,
  hasUpcomingMeeting = false,
  hasTodayDeadline = false,
  minutesSinceBreak = 0,
  lastBigTaskCompleted = false,
  consecutiveCompletes = 0,
}) => {
  const remaining = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 컨텍스트 기반 코멘트 시스템 활용 (W1)
  const contextualMessage = getContextualComment({
    hour,
    energy,
    mood,
    pendingTasks: remaining,
    completedToday: completedTasks,
    streak,
    isWorking,
    workMinutes,
    hasUpcomingMeeting,
    hasTodayDeadline,
    minutesSinceBreak,
    lastBigTaskCompleted,
    consecutiveCompletes,
  });
  
  // 특별한 날 체크
  const specialDayMessage = getSpecialDayComment();
  if (specialDayMessage && Math.random() < 0.3) { // 30% 확률로 특별한 날 메시지
    return specialDayMessage;
  }
  
  // 선제적 알림이 필요한 상황은 contextualComment가 처리
  // 그 외 진행 상황 기반 메시지
  
  // 모든 할 일 완료 (담백하게)
  if (totalTasks > 0 && completedTasks >= totalTasks) {
    return getAlfredoComment('tasks', 'allDone');
  }
  
  // 다음 일정 임박 (선제적)
  if (nextEventIn && nextEventIn <= 30) {
    return `${nextEventIn}분 후 일정이에요. 준비해요`;
  }
  
  // 어제 실패 케어 (부드럽게)
  if (yesterdayFailed && completedTasks === 0) {
    return getAlfredoComment('encourage', 'afterFailure');
  }
  
  // 진행 중 (과한 칭찬 금지)
  if (completedTasks > 0 && remaining > 0) {
    if (progress >= 70) {
      return `거의 다 왔어요. ${remaining}개 남았어요`;
    }
    if (progress >= 50) {
      return `절반 넘었어요. ${remaining}개 남았어요`;
    }
    return `${completedTasks}개 완료. 잘 가고 있어요`;
  }
  
  // 아직 시작 안 함 (강요 없이)
  if (completedTasks === 0 && totalTasks > 0) {
    if (energy < 30) {
      return getAlfredoComment('energy', 'low');
    }
    return "가벼운 것 하나부터 시작해봐요";
  }
  
  // 기본: 컨텍스트 기반 코멘트
  return contextualMessage;
};

// ============================================
// 🐧 알프레도 상태바 컴포넌트 (W1 강화)
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
  isWorking = false,
  workMinutes = 0,
  hasUpcomingMeeting = false,
  hasTodayDeadline = false,
  minutesSinceBreak = 0,
  lastBigTaskCompleted = false,
  consecutiveCompletes = 0,
  darkMode = false,
  onTap,
  expanded = false,
  onToggleExpand,
}) => {
  const hour = new Date().getHours();
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 표정 결정 (W1 강화)
  const expression = getAlfredoExpression({
    completedTasks,
    totalTasks,
    energy,
    mood,
    hour,
    isInFocus,
    streak,
    yesterdayFailed,
    hasUpcomingMeeting,
    hasTodayDeadline,
    minutesSinceBreak,
  });
  
  // 한마디 결정 (W1 강화)
  const message = getStatusMessage({
    completedTasks,
    totalTasks,
    energy,
    mood,
    hour,
    nextEventIn,
    streak,
    yesterdayFailed,
    isWorking,
    workMinutes,
    hasUpcomingMeeting,
    hasTodayDeadline,
    minutesSinceBreak,
    lastBigTaskCompleted,
    consecutiveCompletes,
  });
  
  // 시간대 톤 (W1 추가)
  const timeTone = getTimeBasedTone(hour);
  
  // 스타일 (시간대 톤에 따라 미세 조정 가능)
  const bgColor = darkMode 
    ? 'bg-gray-800/95 border-gray-700' 
    : 'bg-white/95 border-[#A996FF]/20';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 긴급 상태 표시 (선제적 알림)
  const isUrgent = hasUpcomingMeeting || (hasTodayDeadline && energy > 30);
  const needsRest = minutesSinceBreak >= 120 || energy <= 20;
  
  return (
    <div className={`sticky top-0 z-40 ${bgColor} backdrop-blur-xl border-b shadow-sm transition-all duration-300`}>
      {/* 메인 상태바 */}
      <button 
        onClick={onToggleExpand || onTap}
        className="w-full px-4 py-3 flex items-center gap-3"
      >
        {/* 알프레도 아바타 + 표정 */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center shadow-md ${
            isUrgent ? 'ring-2 ring-amber-400 ring-offset-2' : ''
          } ${
            needsRest ? 'ring-2 ring-purple-400 ring-offset-2' : ''
          }`}>
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
          
          {/* 시간대 톤 표시 (W1 추가) */}
          <div className={`mt-3 text-center text-xs ${textSecondary}`}>
            {timeTone.tone === 'focused' && '⚡ 지금이 골든타임이에요'}
            {timeTone.tone === 'quiet' && '🌅 조용한 새벽이에요'}
            {timeTone.tone === 'relaxed' && '☕ 잠깐 쉬어가도 돼요'}
            {timeTone.tone === 'practical' && '📋 하나씩 처리해요'}
            {timeTone.tone === 'warm' && '🌆 하루 마무리 시간이에요'}
            {timeTone.tone === 'soft' && '🌙 무리하지 마세요'}
            {timeTone.tone === 'concerned' && '😴 이제 쉬어야 해요'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlfredoStatusBar;
export { getStatusMessage, getAlfredoExpression, ALFREDO_EXPRESSIONS };
