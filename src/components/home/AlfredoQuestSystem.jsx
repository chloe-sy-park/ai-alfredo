import React, { useState, useEffect } from 'react';
import { 
  Star, Zap, Trophy, Target, Clock, Flame, Gift, 
  ChevronRight, CheckCircle2, Circle, Sparkles,
  TrendingUp, TrendingDown, AlertCircle, Calendar
} from 'lucide-react';

// ============================================
// 🎮 퀘스트 시스템 (W3-4)
// 할 일을 게임 퀘스트처럼 프레이밍
// ============================================

// 퀘스트 등급 정의
const QUEST_TIERS = {
  main: {
    id: 'main',
    name: '메인 퀘스트',
    emoji: '⭐',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-600',
    xpMultiplier: 1.5,
    description: '오늘의 핵심 목표',
  },
  side: {
    id: 'side',
    name: '사이드 퀘스트',
    emoji: '📋',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    xpMultiplier: 1.0,
    description: '여유 있을 때 처리',
  },
  daily: {
    id: 'daily',
    name: '데일리 퀘스트',
    emoji: '🔄',
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    xpMultiplier: 0.8,
    description: '매일 반복하는 루틴',
  },
  urgent: {
    id: 'urgent',
    name: '긴급 퀘스트',
    emoji: '🔥',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-600',
    xpMultiplier: 2.0,
    description: '지금 당장!',
  },
  bonus: {
    id: 'bonus',
    name: '보너스 퀘스트',
    emoji: '🎁',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
    xpMultiplier: 1.2,
    description: '추가 보상!',
  },
};

// 태스크를 퀘스트로 변환
export const taskToQuest = (task) => {
  let tier = 'side';
  let baseXP = 20;
  
  // 긴급 (마감 임박)
  if (task.deadline?.includes('오늘') || task.deadline?.includes('D-0') || task.deadline?.includes('D-1')) {
    tier = 'urgent';
    baseXP = 40;
  }
  // 메인 (높은 중요도 또는 Big3)
  else if (task.importance === 'high' || task.isBig3) {
    tier = 'main';
    baseXP = 35;
  }
  // 데일리 (루틴)
  else if (task.isRoutine || task.recurring) {
    tier = 'daily';
    baseXP = 15;
  }
  // 보너스 (낮은 중요도지만 오래된 것)
  else if (task.importance === 'low' && task.daysOld >= 3) {
    tier = 'bonus';
    baseXP = 25;
  }
  
  const questTier = QUEST_TIERS[tier];
  const xp = Math.round(baseXP * questTier.xpMultiplier);
  
  // 난이도 별
  let difficulty = 1;
  if (task.estimatedMinutes >= 60) difficulty = 3;
  else if (task.estimatedMinutes >= 30) difficulty = 2;
  if (task.importance === 'high') difficulty = Math.min(difficulty + 1, 3);
  
  return {
    ...task,
    questTier: tier,
    questInfo: questTier,
    xpReward: xp,
    difficulty,
    difficultyStars: '⭐'.repeat(difficulty),
  };
};

// 퀘스트 카드 컴포넌트
const QuestCard = ({
  quest,
  onStart,
  onComplete,
  onSkip,
  isActive = false,
  darkMode = false,
}) => {
  const tier = QUEST_TIERS[quest.questTier] || QUEST_TIERS.side;
  
  return (
    <div className={`${tier.bgColor} border ${tier.borderColor} rounded-xl overflow-hidden transition-all ${isActive ? 'ring-2 ring-offset-2 ring-amber-400' : ''}`}>
      {/* 퀘스트 헤더 */}
      <div className={`bg-gradient-to-r ${tier.color} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg">{tier.emoji}</span>
          <span className="text-sm font-bold">{tier.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-xs">{quest.difficultyStars}</span>
          <div className="bg-white/20 px-2 py-0.5 rounded-full">
            <span className="text-white text-xs font-bold">+{quest.xpReward} XP</span>
          </div>
        </div>
      </div>
      
      {/* 퀘스트 내용 */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* 체크박스 */}
          <button
            onClick={() => onComplete?.(quest)}
            className={`w-6 h-6 rounded-full border-2 ${tier.borderColor} flex items-center justify-center shrink-0 hover:bg-white transition-colors mt-0.5`}
          >
            {quest.status === 'done' && (
              <CheckCircle2 size={16} className={tier.textColor} />
            )}
          </button>
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
              {quest.title}
            </h3>
            
            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {quest.project && (
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {quest.project}
                </span>
              )}
              {quest.deadline && (
                <span className={`px-1.5 py-0.5 ${
                  quest.questTier === 'urgent' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600'
                } rounded`}>
                  {quest.deadline}
                </span>
              )}
              {quest.estimatedMinutes && (
                <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock size={12} />
                  {quest.estimatedMinutes}분
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSkip?.(quest)}
            className={`flex-1 py-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg text-sm font-medium`}
          >
            나중에
          </button>
          <button
            onClick={() => onStart?.(quest)}
            className={`flex-1 py-2 bg-gradient-to-r ${tier.color} text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1`}
          >
            <Zap size={14} />
            시작!
          </button>
        </div>
      </div>
    </div>
  );
};

// 퀘스트 리스트 컴포넌트
const QuestList = ({
  tasks = [],
  onStartQuest,
  onCompleteQuest,
  onSkipQuest,
  darkMode = false,
  maxDisplay = 5,
}) => {
  // 태스크를 퀘스트로 변환
  const quests = tasks
    .filter(t => t.status !== 'done')
    .map(taskToQuest)
    .sort((a, b) => {
      // 긴급 > 메인 > 보너스 > 사이드 > 데일리
      const tierOrder = { urgent: 0, main: 1, bonus: 2, side: 3, daily: 4 };
      return (tierOrder[a.questTier] || 3) - (tierOrder[b.questTier] || 3);
    })
    .slice(0, maxDisplay);
  
  // 오늘의 퀘스트 요약
  const allQuests = tasks.filter(t => t.status !== 'done').map(taskToQuest);
  const totalXP = allQuests.reduce((sum, q) => sum + q.xpReward, 0);
  const mainQuests = allQuests.filter(q => q.questTier === 'main' || q.questTier === 'urgent').length;
  const completedToday = tasks.filter(t => t.status === 'done').length;
  
  if (quests.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center`}>
        <div className="text-4xl mb-3">🏆</div>
        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          오늘 퀘스트 올클리어!
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          대단해요! 푹 쉬어도 돼요 🎉
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 퀘스트 요약 바 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10'} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            🎮 오늘의 퀘스트
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              완료 {completedToday}/{tasks.length}
            </span>
            <span className="text-amber-500 font-bold">
              💰 {totalXP} XP 가능
            </span>
          </div>
        </div>
        
        {/* 진행률 바 */}
        <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (completedToday / tasks.length) * 100 : 0}%` }}
          />
        </div>
        
        {mainQuests > 0 && (
          <p className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'} mt-2`}>
            ⭐ 메인 퀘스트 {mainQuests}개 남음
          </p>
        )}
      </div>
      
      {/* 퀘스트 카드들 */}
      <div className="space-y-3">
        {quests.map((quest, idx) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            isActive={idx === 0}
            onStart={onStartQuest}
            onComplete={onCompleteQuest}
            onSkip={onSkipQuest}
            darkMode={darkMode}
          />
        ))}
      </div>
      
      {allQuests.length > maxDisplay && (
        <button className={`w-full py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center justify-center gap-1`}>
          +{allQuests.length - maxDisplay}개 더 보기
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

// ============================================
// 🔮 "만약에" 미리보기 (W3-5)
// 선택의 결과를 시각화
// ============================================

// 미래 시나리오 생성
const generateScenarios = (task, currentStats) => {
  const now = new Date();
  const hour = now.getHours();
  
  // 지금 하면
  const doNowScenario = {
    id: 'do-now',
    title: '지금 하면',
    emoji: '⚡',
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50',
    outcomes: [],
  };
  
  // 나중에 하면
  const doLaterScenario = {
    id: 'do-later',
    title: '나중에 하면',
    emoji: '⏰',
    color: 'from-amber-400 to-orange-400',
    bgColor: 'bg-amber-50',
    outcomes: [],
  };
  
  // 지금 하면 좋은 점
  doNowScenario.outcomes.push({
    type: 'positive',
    icon: '✅',
    text: `${hour < 17 ? '퇴근 전에' : '자기 전에'} 마음 편해져요`,
  });
  
  if (task.xpReward) {
    doNowScenario.outcomes.push({
      type: 'positive',
      icon: '⭐',
      text: `+${task.xpReward} XP 획득!`,
    });
  }
  
  if (currentStats.streak > 0) {
    doNowScenario.outcomes.push({
      type: 'positive',
      icon: '🔥',
      text: `${currentStats.streak + 1}일 연속 달성 가능`,
    });
  }
  
  // 에너지 높을 때 하면 효율적
  if (currentStats.energy >= 60) {
    doNowScenario.outcomes.push({
      type: 'positive',
      icon: '💪',
      text: '지금 에너지 좋을 때 효율 UP',
    });
  }
  
  // 나중에 하면
  if (task.deadline) {
    if (task.deadline.includes('오늘') || task.deadline.includes('D-0')) {
      doLaterScenario.outcomes.push({
        type: 'negative',
        icon: '🚨',
        text: '오늘 마감! 시간 없어요',
      });
    } else if (task.deadline.includes('D-1') || task.deadline.includes('내일')) {
      doLaterScenario.outcomes.push({
        type: 'warning',
        icon: '⚠️',
        text: '내일 마감, 압박 올 수 있어요',
      });
    }
  }
  
  // 늦은 시간이면
  if (hour >= 20) {
    doLaterScenario.outcomes.push({
      type: 'warning',
      icon: '😴',
      text: '내일로 미루면 아침에 부담',
    });
  } else if (hour >= 15) {
    doLaterScenario.outcomes.push({
      type: 'neutral',
      icon: '📅',
      text: '저녁에 다시 생각날 거예요',
    });
  }
  
  // 밀린 일이 많으면
  if (currentStats.pendingTasks > 5) {
    doLaterScenario.outcomes.push({
      type: 'warning',
      icon: '📚',
      text: `이미 밀린 일 ${currentStats.pendingTasks}개...`,
    });
  }
  
  // 긍정적인 것도 추가 (균형)
  doLaterScenario.outcomes.push({
    type: 'neutral',
    icon: '☕',
    text: '잠깐 쉬고 재충전할 수 있어요',
  });
  
  return [doNowScenario, doLaterScenario];
};

// "만약에" 미리보기 컴포넌트
const WhatIfPreview = ({
  task,
  currentStats = { energy: 60, streak: 0, pendingTasks: 5 },
  onChooseNow,
  onChooseLater,
  onDismiss,
  darkMode = false,
}) => {
  const quest = taskToQuest(task);
  const scenarios = generateScenarios(quest, currentStats);
  
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔮</span>
          <span className="font-bold">만약에...</span>
        </div>
        <p className="text-white/80 text-sm">"{task.title}" 어떻게 할까요?</p>
      </div>
      
      {/* 시나리오 비교 */}
      <div className="p-4 space-y-4">
        {scenarios.map(scenario => (
          <div 
            key={scenario.id}
            className={`${scenario.bgColor} rounded-xl p-4 border ${
              scenario.id === 'do-now' ? 'border-emerald-200' : 'border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{scenario.emoji}</span>
              <span className={`font-bold ${darkMode ? 'text-gray-800' : 'text-gray-700'}`}>
                {scenario.title}
              </span>
            </div>
            
            <div className="space-y-2">
              {scenario.outcomes.map((outcome, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    outcome.type === 'positive' ? 'text-emerald-600' :
                    outcome.type === 'negative' ? 'text-red-500' :
                    outcome.type === 'warning' ? 'text-amber-600' :
                    'text-gray-600'
                  }`}
                >
                  <span>{outcome.icon}</span>
                  <span>{outcome.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* 선택 버튼 */}
      <div className="p-4 pt-0 flex gap-3">
        <button
          onClick={onChooseLater}
          className={`flex-1 py-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl font-medium`}
        >
          나중에 할게요
        </button>
        <button
          onClick={onChooseNow}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Zap size={16} />
          지금 할게요!
        </button>
      </div>
      
      {/* 알프레도 코멘트 */}
      <div className={`px-4 pb-4`}>
        <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-3 flex items-start gap-2`}>
          <span className="text-lg">🐧</span>
          <p className={`text-xs ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'}`}>
            {currentStats.energy >= 60 
              ? "에너지 괜찮을 때 하면 더 빨리 끝나요!"
              : "힘들면 나중에 해도 괜찮아요. 선택은 Boss 거예요 💜"}
          </p>
        </div>
      </div>
    </div>
  );
};

// 플로팅 "만약에" 팝업
const WhatIfFloating = ({
  isOpen,
  task,
  currentStats,
  onChooseNow,
  onChooseLater,
  onDismiss,
  darkMode = false,
}) => {
  if (!isOpen || !task) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <WhatIfPreview
          task={task}
          currentStats={currentStats}
          onChooseNow={() => {
            onChooseNow?.(task);
            onDismiss?.();
          }}
          onChooseLater={() => {
            onChooseLater?.(task);
            onDismiss?.();
          }}
          onDismiss={onDismiss}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

// ============================================
// 🏆 퀘스트 완료 축하 모달
// ============================================

const QuestCompleteModal = ({
  isOpen,
  quest,
  xpGained,
  newTotal,
  streak,
  bonusMessage,
  onClose,
  darkMode = false,
}) => {
  if (!isOpen || !quest) return null;
  
  const tier = QUEST_TIERS[quest.questTier] || QUEST_TIERS.side;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
        {/* 축하 헤더 */}
        <div className={`bg-gradient-to-r ${tier.color} p-6 text-center text-white`}>
          <div className="text-5xl mb-3 animate-bounce">🎉</div>
          <h2 className="text-xl font-black">퀘스트 완료!</h2>
          <p className="text-white/80 text-sm mt-1">{tier.name} 클리어</p>
        </div>
        
        {/* 보상 */}
        <div className="p-5 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
            "{quest.title}"
          </p>
          
          {/* XP 획득 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-amber-100 text-amber-600 px-4 py-2 rounded-full">
              <span className="text-2xl font-black">+{xpGained} XP</span>
            </div>
          </div>
          
          {/* 스트릭 */}
          {streak > 0 && (
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} rounded-xl p-3 mb-4`}>
              <p className="text-orange-500 font-bold">
                🔥 {streak}일 연속 달성!
              </p>
            </div>
          )}
          
          {/* 보너스 메시지 */}
          {bonusMessage && (
            <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-3 mb-4`}>
              <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'}`}>
                🐧 {bonusMessage}
              </p>
            </div>
          )}
          
          {/* 닫기 */}
          <button
            onClick={onClose}
            className={`w-full py-3 bg-gradient-to-r ${tier.color} text-white rounded-xl font-bold`}
          >
            다음 퀘스트로! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export {
  QUEST_TIERS,
  taskToQuest,
  QuestCard,
  QuestList,
  WhatIfPreview,
  WhatIfFloating,
  QuestCompleteModal,
  generateScenarios,
};
