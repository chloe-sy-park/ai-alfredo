import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, TrendingUp, Clock, Target, Zap, 
  Calendar, BarChart3, Brain, Heart, Star,
  ChevronRight, X, Lightbulb, Trophy
} from 'lucide-react';

/**
 * 🧬 강화된 DNA 인사이트 시스템
 * - 패턴 발견 알림
 * - 시간 추정 인사이트
 * - 개인화된 추천
 * - 성취 축하
 */

// 패턴 발견 메시지
const PATTERN_DISCOVERIES = {
  peakTime: [
    { emoji: '⚡', title: '골든타임 발견!', message: '{time}시에 가장 집중 잘 되시네요' },
    { emoji: '🎯', title: '최적의 시간대', message: '{time}시가 딥워크 하기 좋은 시간이에요' },
  ],
  productiveDay: [
    { emoji: '📊', title: '패턴 발견!', message: '{day}요일에 가장 많이 완료하시네요' },
    { emoji: '💪', title: '생산성 요일', message: '{day}요일이 가장 집중 잘 되는 날!' },
  ],
  timeAccuracy: [
    { emoji: '⏱️', title: '시간 추정 분석', message: '예상보다 평균 {percent}% 더 걸려요' },
    { emoji: '📈', title: '시간 패턴', message: '{category} 작업은 여유 있게 잡으면 좋아요' },
  ],
  streak: [
    { emoji: '🔥', title: '{count}일 연속!', message: '꾸준함이 대단해요. 이대로 가요!' },
    { emoji: '🌟', title: '연속 달성', message: '{count}일째 목표 달성 중!' },
  ],
  improvement: [
    { emoji: '📈', title: '성장 중!', message: '지난주보다 완료율 {percent}% 상승' },
    { emoji: '🚀', title: '발전하고 있어요', message: '집중 시간이 {minutes}분 늘었어요' },
  ],
};

// 랜덤 선택 헬퍼
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 메시지 포맷팅
const formatMessage = (template, data) => {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, value);
  });
  return result;
};

/**
 * 패턴 발견 카드
 */
export const PatternDiscoveryCard = ({ pattern, darkMode, onDismiss, onExplore }) => {
  if (!pattern) return null;
  
  const cardBg = darkMode ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30' : 'bg-gradient-to-r from-purple-50 to-indigo-50';
  const borderColor = darkMode ? 'border-purple-500/30' : 'border-purple-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  
  return (
    <div className={`${cardBg} border ${borderColor} rounded-2xl p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <span className="text-xl">{pattern.emoji}</span>
          </div>
          <div>
            <h3 className={`font-bold ${textPrimary}`}>{pattern.title}</h3>
            <p className={`text-sm ${textSecondary}`}>{pattern.message}</p>
          </div>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>
      
      {onExplore && (
        <button 
          onClick={onExplore}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/10 text-purple-600 text-sm font-medium hover:bg-purple-500/20 transition-colors"
        >
          <Lightbulb size={16} />
          자세히 보기
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

/**
 * 성취 축하 카드
 */
export const AchievementCard = ({ achievement, darkMode, onDismiss }) => {
  if (!achievement) return null;
  
  const cardBg = darkMode ? 'bg-gradient-to-r from-amber-900/30 to-yellow-900/30' : 'bg-gradient-to-r from-amber-50 to-yellow-50';
  const borderColor = darkMode ? 'border-amber-500/30' : 'border-amber-200';
  
  return (
    <div className={`${cardBg} border ${borderColor} rounded-2xl p-4 mb-4`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Trophy size={24} className="text-amber-500" />
        </div>
        <div>
          <p className="text-sm text-amber-600 font-medium">🎉 축하해요!</p>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {achievement.title}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {achievement.message}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 오늘의 추천 카드
 */
export const TodayRecommendationCard = ({ recommendations, darkMode }) => {
  if (!recommendations || recommendations.length === 0) return null;
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`${cardBg} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={18} className="text-[#A996FF]" />
        <span className={`font-bold ${textPrimary}`}>오늘의 추천</span>
      </div>
      
      <div className="space-y-2">
        {recommendations.slice(0, 3).map((rec, i) => (
          <div 
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
          >
            <span className="text-lg">{rec.emoji || '💡'}</span>
            <div className="flex-1">
              <p className={`text-sm ${textPrimary}`}>{rec.text}</p>
              {rec.reason && (
                <p className={`text-xs ${textSecondary} mt-0.5`}>{rec.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 주간 인사이트 요약 카드
 */
export const WeeklyInsightSummary = ({ weekData, darkMode, onViewDetails }) => {
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const stats = useMemo(() => {
    if (!weekData) return null;
    
    return {
      tasksCompleted: weekData.tasksCompleted || 0,
      focusMinutes: weekData.focusMinutes || 0,
      bestDay: weekData.bestDay || '월요일',
      avgCondition: weekData.avgCondition || 3,
      streak: weekData.streak || 0,
    };
  }, [weekData]);
  
  if (!stats) return null;
  
  return (
    <div className={`${cardBg} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[#A996FF]" />
          <span className={`font-bold ${textPrimary}`}>이번 주 요약</span>
        </div>
        {onViewDetails && (
          <button 
            onClick={onViewDetails}
            className="text-sm text-[#A996FF] flex items-center gap-1"
          >
            자세히 <ChevronRight size={14} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.tasksCompleted}</p>
          <p className={`text-xs ${textSecondary}`}>완료 태스크</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${textPrimary}`}>{Math.round(stats.focusMinutes / 60)}h</p>
          <p className={`text-xs ${textSecondary}`}>집중 시간</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.streak}일</p>
          <p className={`text-xs ${textSecondary}`}>연속 달성</p>
        </div>
      </div>
      
      {/* 베스트 데이 */}
      <div className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'} flex items-center gap-2`}>
        <Star size={16} className="text-emerald-500" />
        <span className={`text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
          {stats.bestDay}이 가장 생산적이었어요!
        </span>
      </div>
    </div>
  );
};

/**
 * 컨디션 기반 추천 카드
 */
export const ConditionBasedTip = ({ condition, energy, darkMode }) => {
  const tip = useMemo(() => {
    if (condition <= 2 || energy <= 2) {
      return {
        emoji: '🌿',
        title: '오늘은 가볍게',
        message: '컨디션이 좋지 않을 때는 쉬운 일부터. 무리하지 마세요.',
        color: 'blue',
      };
    } else if (condition >= 4 && energy >= 4) {
      return {
        emoji: '⚡',
        title: '오늘 달려볼까요?',
        message: '컨디션 좋은 날! 미뤘던 중요한 일 해치우기 좋아요.',
        color: 'emerald',
      };
    } else {
      return {
        emoji: '🎯',
        title: '차분하게 진행',
        message: '평소처럼 해도 충분해요. 하나씩 해결해봐요.',
        color: 'purple',
      };
    }
  }, [condition, energy]);
  
  const colorClasses = {
    blue: darkMode ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: darkMode ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
    purple: darkMode ? 'bg-purple-900/20 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700',
  };
  
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[tip.color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{tip.emoji}</span>
        <span className="font-semibold">{tip.title}</span>
      </div>
      <p className="text-sm opacity-80 ml-7">{tip.message}</p>
    </div>
  );
};

/**
 * 인사이트 생성 훅
 */
export function useInsightGenerator(userData) {
  const [currentInsight, setCurrentInsight] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  
  useEffect(() => {
    if (!userData) return;
    
    // 패턴 발견 로직
    const generateDiscovery = () => {
      const { peakHour, bestDay, timeAccuracy, streak, weeklyImprovement } = userData;
      
      // 우선순위에 따라 인사이트 선택
      if (streak && streak >= 3) {
        const msg = pickRandom(PATTERN_DISCOVERIES.streak);
        return {
          ...msg,
          title: formatMessage(msg.title, { count: streak }),
          message: formatMessage(msg.message, { count: streak }),
        };
      }
      
      if (peakHour) {
        const msg = pickRandom(PATTERN_DISCOVERIES.peakTime);
        return {
          ...msg,
          message: formatMessage(msg.message, { time: peakHour }),
        };
      }
      
      if (bestDay) {
        const msg = pickRandom(PATTERN_DISCOVERIES.productiveDay);
        return {
          ...msg,
          message: formatMessage(msg.message, { day: bestDay }),
        };
      }
      
      if (timeAccuracy && timeAccuracy > 1.2) {
        const msg = pickRandom(PATTERN_DISCOVERIES.timeAccuracy);
        return {
          ...msg,
          message: formatMessage(msg.message, { 
            percent: Math.round((timeAccuracy - 1) * 100),
            category: '복잡한',
          }),
        };
      }
      
      return null;
    };
    
    setDiscovery(generateDiscovery());
  }, [userData]);
  
  return { currentInsight, discovery };
}

export default {
  PatternDiscoveryCard,
  AchievementCard,
  TodayRecommendationCard,
  WeeklyInsightSummary,
  ConditionBasedTip,
  useInsightGenerator,
};
