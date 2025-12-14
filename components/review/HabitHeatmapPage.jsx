import React, { useState } from 'react';
import { ArrowLeft, Calendar, Flame, Target, TrendingUp } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';
import { BADGES } from '../../constants/gamification';

const HabitHeatmapPage = ({ onBack, gameState, darkMode }) => {
  // 12주 (84일) 데이터 생성
  const today = new Date();
  const days = [];
  
  // 84일 전부터 오늘까지
  for (let i = 83; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      isToday: i === 0,
    });
  }
  
  // 주별로 그룹화 (12주)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // 활동 데이터 시뮬레이션 (실제로는 gameState에서 가져와야 함)
  // weeklyXP 기반으로 오늘 포함 7일 데이터 사용, 나머지는 랜덤
  const getActivityLevel = (dateStr, dayIndex) => {
    const daysFromToday = Math.floor((today - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    
    if (daysFromToday < 7) {
      // 최근 7일은 실제 데이터
      const xp = gameState.weeklyXP[6 - daysFromToday] || 0;
      if (xp >= 100) return 4;
      if (xp >= 60) return 3;
      if (xp >= 30) return 2;
      if (xp > 0) return 1;
      return 0;
    } else {
      // 과거 데이터는 시뮬레이션 (seed 기반)
      const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
      const rand = Math.sin(seed) * 10000;
      const normalized = rand - Math.floor(rand);
      if (normalized > 0.85) return 4;
      if (normalized > 0.65) return 3;
      if (normalized > 0.4) return 2;
      if (normalized > 0.2) return 1;
      return 0;
    }
  };
  
  // 활동 레벨별 색상
  const getLevelColor = (level, dark = false) => {
    if (dark) {
      const colors = ['#1e1e2e', '#2d4a3e', '#3d6b4f', '#4d8c5f', '#5ead6f'];
      return colors[level];
    }
    const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    return colors[level];
  };
  
  // 통계 계산
  const activeDays = days.filter(d => getActivityLevel(d.dateStr) > 0).length;
  const totalDays = days.length;
  const activityRate = Math.round((activeDays / totalDays) * 100);
  
  // 현재 스트릭 계산
  let currentStreak = gameState.streak || 0;
  
  // 최장 스트릭 (시뮬레이션)
  let longestStreak = Math.max(currentStreak, 7);
  let tempStreak = 0;
  days.forEach(d => {
    if (getActivityLevel(d.dateStr) > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });
  
  // 월 레이블 계산
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay && firstDay.date.getMonth() !== lastMonth) {
      monthLabels.push({ weekIndex, month: firstDay.date.getMonth() + 1 });
      lastMonth = firstDay.date.getMonth();
    }
  });
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">습관 히트맵</h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-white/80 text-sm">최근 12주 활동 기록</p>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 요약 통계 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-black text-white">{currentStreak}</span>
              </div>
              <p className={`text-sm font-bold ${textPrimary}`}>현재 스트릭</p>
              <p className={`text-xs ${textSecondary}`}>일 연속</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#A996FF] to-[#EDE9FE]0 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-black text-white">{longestStreak}</span>
              </div>
              <p className={`text-sm font-bold ${textPrimary}`}>최장 스트릭</p>
              <p className={`text-xs ${textSecondary}`}>일 연속</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-2xl font-black text-white">{activeDays}</span>
              </div>
              <p className={`text-sm font-bold ${textPrimary}`}>활동일</p>
              <p className={`text-xs ${textSecondary}`}>/ {totalDays}일</p>
            </div>
          </div>
        </div>
        
        {/* 활동률 프로그레스 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${textPrimary}`}>12주 활동률</span>
            <span className="text-emerald-500 font-bold">{activityRate}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${activityRate}%` }}
            />
          </div>
          <p className={`text-xs ${textSecondary} mt-2`}>
            {activityRate >= 80 ? '🔥 놀라운 꾸준함이에요!' :
             activityRate >= 60 ? '💪 아주 잘 하고 있어요!' :
             activityRate >= 40 ? '👍 좋은 습관을 만들어가고 있어요!' :
             '🌱 조금씩 시작해봐요!'}
          </p>
        </div>
        
        {/* 히트맵 그리드 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm overflow-x-auto`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Calendar size={18} className="text-emerald-500" /> 활동 히트맵
          </h3>
          
          {/* 월 레이블 */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((label, i) => (
              <div 
                key={i}
                className={`text-xs ${textSecondary}`}
                style={{ 
                  position: 'relative',
                  left: `${label.weekIndex * 14}px`,
                  marginRight: i < monthLabels.length - 1 ? `${(monthLabels[i + 1]?.weekIndex - label.weekIndex - 1) * 14}px` : 0
                }}
              >
                {label.month}월
              </div>
            ))}
          </div>
          
          {/* 히트맵 그리드 */}
          <div className="flex gap-1">
            {/* 요일 레이블 */}
            <div className="flex flex-col gap-1 mr-1">
              {weekDays.map((day, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-[12px] text-[11px] ${textSecondary} flex items-center`}
                >
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* 주별 컬럼 */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const level = getActivityLevel(day.dateStr, dayIndex);
                  return (
                    <div
                      key={day.dateStr}
                      className={`w-[12px] h-[12px] rounded-sm transition-all hover:scale-125 cursor-pointer ${
                        day.isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: getLevelColor(level, darkMode) }}
                      title={`${day.date.getMonth() + 1}/${day.date.getDate()} - ${
                        level === 0 ? '활동 없음' :
                        level === 1 ? '조금' :
                        level === 2 ? '보통' :
                        level === 3 ? '많이' : '아주 많이'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* 범례 */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className={`text-xs ${textSecondary}`}>적음</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-[12px] h-[12px] rounded-sm"
                style={{ backgroundColor: getLevelColor(level, darkMode) }}
              />
            ))}
            <span className={`text-xs ${textSecondary}`}>많음</span>
          </div>
        </div>
        
        {/* 스트릭 동기부여 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Flame size={18} className="text-[#A996FF]500" /> 스트릭 챌린지
          </h3>
          
          <div className="space-y-3">
            {/* 3일 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentStreak >= 3 ? 'bg-[#A996FF]100' : 'bg-gray-100'
              }`}>
                <span className={currentStreak >= 3 ? '' : 'grayscale opacity-50'}>🔥</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${currentStreak >= 3 ? textPrimary : textSecondary}`}>3일 연속</span>
                  {currentStreak >= 3 ? (
                    <span className="text-xs text-emerald-500 font-bold">달성! ✓</span>
                  ) : (
                    <span className={`text-xs ${textSecondary}`}>{3 - currentStreak}일 남음</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#A996FF]400 rounded-full"
                    style={{ width: `${Math.min((currentStreak / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 7일 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentStreak >= 7 ? 'bg-[#A996FF]100' : 'bg-gray-100'
              }`}>
                <span className={currentStreak >= 7 ? '' : 'grayscale opacity-50'}>🔥🔥</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${currentStreak >= 7 ? textPrimary : textSecondary}`}>7일 연속</span>
                  {currentStreak >= 7 ? (
                    <span className="text-xs text-emerald-500 font-bold">달성! ✓</span>
                  ) : (
                    <span className={`text-xs ${textSecondary}`}>{7 - currentStreak}일 남음</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#A996FF]400 rounded-full"
                    style={{ width: `${Math.min((currentStreak / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 30일 */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentStreak >= 30 ? 'bg-[#EDE9FE]' : 'bg-gray-100'
              }`}>
                <span className={currentStreak >= 30 ? '' : 'grayscale opacity-50'}>💎</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${currentStreak >= 30 ? textPrimary : textSecondary}`}>30일 연속</span>
                  {currentStreak >= 30 ? (
                    <span className="text-xs text-emerald-500 font-bold">달성! ✓</span>
                  ) : (
                    <span className={`text-xs ${textSecondary}`}>{30 - currentStreak}일 남음</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#A996FF] rounded-full"
                    style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 주간 활동 요약 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={18} className="text-gray-600" /> 주간 활동 패턴
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              // 해당 요일의 평균 활동량 계산
              const dayActivities = days.filter(d => d.dayOfWeek === i);
              const avgLevel = dayActivities.reduce((sum, d) => sum + getActivityLevel(d.dateStr), 0) / dayActivities.length;
              const percentage = Math.round((avgLevel / 4) * 100);
              
              return (
                <div key={i} className="text-center">
                  <div 
                    className="w-full aspect-square rounded-xl flex items-center justify-center mb-1"
                    style={{ 
                      backgroundColor: getLevelColor(Math.round(avgLevel), darkMode),
                      opacity: avgLevel > 0 ? 1 : 0.3
                    }}
                  >
                    <span className={`text-xs font-bold ${avgLevel >= 2 ? 'text-white' : textSecondary}`}>
                      {percentage}%
                    </span>
                  </div>
                  <span className={`text-xs ${textSecondary}`}>{day}</span>
                </div>
              );
            })}
          </div>
          
          <p className={`text-xs ${textSecondary} mt-3 text-center`}>
            {(() => {
              const dayAvgs = weekDays.map((_, i) => {
                const dayActivities = days.filter(d => d.dayOfWeek === i);
                return dayActivities.reduce((sum, d) => sum + getActivityLevel(d.dateStr), 0) / dayActivities.length;
              });
              const maxDay = dayAvgs.indexOf(Math.max(...dayAvgs));
              const minDay = dayAvgs.indexOf(Math.min(...dayAvgs));
              return `${weekDays[maxDay]}요일에 가장 활발하고, ${weekDays[minDay]}요일에 쉬는 편이에요`;
            })()}
          </p>
        </div>
        
        {/* 알프레도 응원 */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
              🐧
            </div>
            <div>
              <p className="font-bold mb-1">알프레도의 한마디</p>
              <p className="text-white/90 text-sm">
                {currentStreak >= 7 
                  ? '일주일 넘게 연속 달성! 이제 습관이 몸에 배고 있어요. 대단해요! 🌟' 
                  : currentStreak >= 3 
                    ? '3일 연속 달성! 습관 형성의 첫 고비를 넘겼어요. 계속 가보자고요! 💪'
                    : currentStreak >= 1
                      ? '좋은 시작이에요! 내일도 함께해요. 작은 발걸음이 큰 변화를 만들어요. 🌱'
                      : '오늘부터 시작해볼까요? 하루 하나씩, 천천히 쌓아가봐요! 🚀'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Energy Rhythm Page ===

export default HabitHeatmapPage;
