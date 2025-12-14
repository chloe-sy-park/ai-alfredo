import React, { useState } from 'react';
import { X, Award, Flame, Target, TrendingUp, Calendar, CheckCircle2, Star, Trophy } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';
import { LEVEL_CONFIG, BADGES } from '../../constants/gamification';

const LevelUpModal = ({ level, onClose }) => {
  if (!level) return null;
  
  const levelTitles = {
    1: '시작', 2: '초보', 3: '입문', 4: '훈련생', 5: '견습생',
    6: '도전자', 7: '수행자', 8: '실천가', 9: '노력가', 10: '숙련자',
    15: '전문가', 20: '달인', 25: '고수', 30: '마스터', 50: '그랜드마스터',
  };
  
  const getTitle = (lvl) => {
    const keys = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
    for (const key of keys) {
      if (lvl >= key) return levelTitles[key];
    }
    return '시작';
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[320px] bg-gradient-to-b from-[#A996FF] to-[#8B7CF7] rounded-xl p-8 text-center text-white animate-in zoom-in-95 shadow-2xl">
        {/* 파티클 효과 */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#A996FF] rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-white/80 text-sm mb-2">축하합니다!</p>
          <h2 className="text-4xl font-black mb-2">LEVEL {level}</h2>
          <p className="text-xl font-bold text-[#C4B5FD] mb-6">{getTitle(level)}</p>
          
          <div className="bg-white/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-white/90">
              {level === 5 && '꾸준히 노력하고 있어요! 👏'}
              {level === 10 && '대단해요! 이제 숙련자에요! 🌟'}
              {level === 20 && '정말 놀라워요! 달인의 경지! 🏆'}
              {level < 5 && '좋은 시작이에요! 계속 파이팅! 💪'}
              {level > 5 && level < 10 && '성장하고 있어요! 멋져요! ✨'}
              {level > 10 && level < 20 && '정말 잘하고 있어요! 🔥'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-[#A996FF] font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
};

// === New Badge Modal ===

const NewBadgeModal = ({ badge, onClose }) => {
  if (!badge) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[320px] bg-white rounded-xl overflow-hidden animate-in zoom-in-95 shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#EDE9FE]0 p-6 text-center">
          <div className="text-6xl mb-2">{badge.icon}</div>
          <p className="text-white/80 text-sm">새 배지 획득!</p>
        </div>
        
        {/* 내용 */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-2">{badge.name}</h2>
          <p className="text-gray-500 mb-6">{badge.description}</p>
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#EDE9FE]0 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            멋져요! 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

// === Stats Modal (프로필 & 통계) ===

const StatsModal = ({ isOpen, onClose, gameState }) => {
  if (!isOpen) return null;
  
  const levelInfo = LEVEL_CONFIG.getLevel(gameState.totalXP);
  const progressPercent = (levelInfo.currentXP / levelInfo.requiredXP) * 100;
  
  const unlockedBadges = BADGES.filter(b => gameState.unlockedBadges.includes(b.id));
  const lockedBadges = BADGES.filter(b => !gameState.unlockedBadges.includes(b.id));
  
  // 주간 XP 최대값 (그래프용)
  const maxWeeklyXP = Math.max(...gameState.weeklyXP, 100);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date().getDay();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
        {/* 헤더 - 레벨 카드 */}
        <div className="bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
              {levelInfo.level >= 20 ? '👑' : levelInfo.level >= 10 ? '⭐' : '🌱'}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-sm">레벨</p>
              <h2 className="text-4xl font-black">{levelInfo.level}</h2>
              <p className="text-white/90 text-sm">{gameState.totalXP.toLocaleString()} XP</p>
            </div>
          </div>
          
          {/* XP 프로그레스 바 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{levelInfo.currentXP} / {levelInfo.requiredXP} XP</span>
              <span>다음 레벨까지</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* 오늘 통계 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Flame size={18} className="text-[#A996FF]500" /> 오늘의 성과
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#A996FF]">{gameState.todayXP}</p>
                <p className="text-xs text-gray-500">XP 획득</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{gameState.todayTasks}</p>
                <p className="text-xs text-gray-500">태스크 완료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#A996FF]500">{gameState.streak}</p>
                <p className="text-xs text-gray-500">연속 달성</p>
              </div>
            </div>
          </div>
          
          {/* 주간 그래프 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-600" /> 이번 주 XP
            </h3>
            <div className="flex items-end justify-between h-24 gap-1">
              {gameState.weeklyXP.map((xp, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      i === today ? 'bg-[#A996FF]' : 'bg-gray-300'
                    }`}
                    style={{ height: `${Math.max((xp / maxWeeklyXP) * 100, 4)}%` }}
                  />
                  <span className={`text-[11px] mt-1 ${i === today ? 'font-bold text-[#A996FF]' : 'text-gray-400'}`}>
                    {weekDays[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 누적 통계 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy size={18} className="text-[#A996FF]" /> 누적 기록
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">완료한 태스크</p>
                <p className="text-xl font-bold text-gray-800">{gameState.totalCompleted}개</p>
              </div>
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">Big3 완료</p>
                <p className="text-xl font-bold text-gray-800">{gameState.big3Completed}회</p>
              </div>
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">집중 세션</p>
                <p className="text-xl font-bold text-gray-800">{gameState.focusSessions}회</p>
              </div>
              <div className="bg-white border border-[#E8E3FF] rounded-xl p-3">
                <p className="text-xs text-gray-500">집중 시간</p>
                <p className="text-xl font-bold text-gray-800">{Math.floor(gameState.focusMinutes / 60)}시간</p>
              </div>
            </div>
          </div>
          
          {/* 배지 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Award size={18} className="text-[#F5F3FF]0" /> 배지 ({unlockedBadges.length}/{BADGES.length})
            </h3>
            
            {/* 획득한 배지 */}
            {unlockedBadges.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">획득</p>
                <div className="flex flex-wrap gap-2">
                  {unlockedBadges.map(badge => (
                    <div 
                      key={badge.id}
                      className="w-12 h-12 bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 미획득 배지 */}
            {lockedBadges.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">미획득</p>
                <div className="flex flex-wrap gap-2">
                  {lockedBadges.slice(0, 8).map(badge => (
                    <div 
                      key={badge.id}
                      className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-2xl opacity-30"
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                  {lockedBadges.length > 8 && (
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">
                      +{lockedBadges.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Weekly Review Page ===

export { LevelUpModal, NewBadgeModal, StatsModal };
