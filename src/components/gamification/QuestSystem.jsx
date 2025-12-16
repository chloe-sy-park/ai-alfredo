import React, { useState, useEffect, useMemo } from 'react';
import { Target, CheckCircle2, Circle, Clock, Zap, Gift, ChevronRight, Sparkles, RefreshCw, Star } from 'lucide-react';

// localStorage 키
var STORAGE_KEY = 'lifebutler_daily_quests';

// 퀘스트 템플릿
var QUEST_TEMPLATES = {
  // 기본 퀘스트 (매일 등장)
  basic: [
    { id: 'complete_3_tasks', title: '할일 3개 완료하기', icon: '✅', xp: 30, type: 'tasks', target: 3 },
    { id: 'focus_25min', title: '25분 집중 세션 완료', icon: '🎯', xp: 25, type: 'focus', target: 25 },
    { id: 'log_mood', title: '오늘 기분 기록하기', icon: '😊', xp: 10, type: 'mood', target: 1 }
  ],
  // 보너스 퀘스트 (랜덤)
  bonus: [
    { id: 'complete_5_tasks', title: '할일 5개 완료하기', icon: '🔥', xp: 50, type: 'tasks', target: 5 },
    { id: 'focus_50min', title: '50분 이상 집중하기', icon: '⚡', xp: 40, type: 'focus', target: 50 },
    { id: 'complete_high_priority', title: '긴급 태스크 완료', icon: '🚨', xp: 35, type: 'highPriority', target: 1 },
    { id: 'morning_routine', title: '아침 루틴 완료', icon: '🌅', xp: 30, type: 'morning', target: 1 },
    { id: 'evening_review', title: '저녁 리뷰 완료', icon: '🌙', xp: 25, type: 'evening', target: 1 },
    { id: 'no_snooze', title: '미루기 없이 하루 보내기', icon: '💪', xp: 40, type: 'noSnooze', target: 1 },
    { id: 'inbox_zero', title: '인박스 비우기', icon: '📥', xp: 30, type: 'inbox', target: 1 },
    { id: 'drink_water', title: '물 8잔 마시기', icon: '💧', xp: 20, type: 'water', target: 8 }
  ],
  // 주간 퀘스트
  weekly: [
    { id: 'weekly_streak_3', title: '3일 연속 출석', icon: '📅', xp: 100, type: 'streak', target: 3 },
    { id: 'weekly_tasks_15', title: '이번 주 할일 15개', icon: '🏆', xp: 150, type: 'weeklyTasks', target: 15 },
    { id: 'weekly_focus_2h', title: '이번 주 집중 2시간', icon: '⏰', xp: 120, type: 'weeklyFocus', target: 120 }
  ],
  // 챌린지 (특별)
  challenge: [
    { id: 'perfect_day', title: '완벽한 하루 (모든 할일 완료)', icon: '⭐', xp: 100, type: 'perfectDay', target: 1 },
    { id: 'early_bird', title: '얼리버드 (오전 9시 전 3개 완료)', icon: '🐦', xp: 60, type: 'earlyBird', target: 3 },
    { id: 'night_owl', title: '나이트아울 (자정 전 모든 할일)', icon: '🦉', xp: 50, type: 'nightOwl', target: 1 }
  ]
};

// 오늘 날짜 키
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// 이번 주 키
function getWeekKey() {
  var now = new Date();
  var start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return start.toISOString().slice(0, 10);
}

// 퀘스트 데이터 로드
function loadQuestData() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load quest data:', e);
  }
  return { dailyQuests: [], weeklyQuests: [], lastRefresh: null, weekStart: null };
}

// 퀘스트 데이터 저장
function saveQuestData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save quest data:', e);
  }
}

// 랜덤 퀘스트 선택
function pickRandomQuests(templates, count) {
  var shuffled = templates.slice().sort(function() { return Math.random() - 0.5; });
  return shuffled.slice(0, count).map(function(t) {
    return Object.assign({}, t, { progress: 0, completed: false, claimed: false });
  });
}

// 데일리 퀘스트 생성
function generateDailyQuests() {
  var basic = QUEST_TEMPLATES.basic.map(function(t) {
    return Object.assign({}, t, { progress: 0, completed: false, claimed: false });
  });
  var bonus = pickRandomQuests(QUEST_TEMPLATES.bonus, 2);
  var challenge = pickRandomQuests(QUEST_TEMPLATES.challenge, 1);
  
  return basic.concat(bonus).concat(challenge);
}

// 주간 퀘스트 생성
function generateWeeklyQuests() {
  return QUEST_TEMPLATES.weekly.map(function(t) {
    return Object.assign({}, t, { progress: 0, completed: false, claimed: false });
  });
}

// 🎯 퀘스트 카드 컴포넌트
export var QuestCard = function(props) {
  var quest = props.quest;
  var darkMode = props.darkMode;
  var onClaim = props.onClaim;
  var compact = props.compact;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var progress = Math.min(100, (quest.progress / quest.target) * 100);
  var isComplete = quest.progress >= quest.target;
  var isClaimed = quest.claimed;
  
  if (compact) {
    return React.createElement('div', {
      className: 'flex items-center gap-3 p-2 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') + ' ' + (isClaimed ? 'opacity-50' : '')
    },
      React.createElement('span', { className: 'text-lg' }, quest.icon),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { className: textPrimary + ' text-sm truncate ' + (isClaimed ? 'line-through' : '') }, quest.title),
        React.createElement('div', { className: 'flex items-center gap-2 mt-1' },
          React.createElement('div', { className: 'flex-1 h-1.5 rounded-full ' + (darkMode ? 'bg-gray-600' : 'bg-gray-200') + ' overflow-hidden' },
            React.createElement('div', { 
              className: 'h-full rounded-full transition-all ' + (isComplete ? 'bg-emerald-500' : 'bg-[#A996FF]'),
              style: { width: progress + '%' }
            })
          ),
          React.createElement('span', { className: textSecondary + ' text-xs' }, quest.progress + '/' + quest.target)
        )
      ),
      isComplete && !isClaimed && React.createElement('button', {
        onClick: function() { if (onClaim) onClaim(quest); },
        className: 'px-2 py-1 bg-emerald-500 text-white text-xs rounded-lg font-medium'
      }, '+' + quest.xp)
    );
  }
  
  return React.createElement('div', {
    className: cardBg + ' rounded-xl p-4 border ' + borderColor + ' ' + (isClaimed ? 'opacity-50' : '')
  },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('div', { 
        className: 'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' + 
          (isComplete ? 'bg-emerald-500/20' : (darkMode ? 'bg-gray-700' : 'bg-gray-100'))
      }, quest.icon),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex items-center justify-between mb-1' },
          React.createElement('p', { className: textPrimary + ' font-medium ' + (isClaimed ? 'line-through' : '') }, quest.title),
          React.createElement('div', { className: 'flex items-center gap-1 text-amber-400' },
            React.createElement(Star, { size: 14 }),
            React.createElement('span', { className: 'text-sm font-bold' }, quest.xp)
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
          React.createElement('div', { className: 'flex-1 h-2 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
            React.createElement('div', { 
              className: 'h-full rounded-full transition-all duration-300 ' + (isComplete ? 'bg-emerald-500' : 'bg-[#A996FF]'),
              style: { width: progress + '%' }
            })
          ),
          React.createElement('span', { className: textSecondary + ' text-sm' }, quest.progress + '/' + quest.target)
        )
      )
    ),
    isComplete && !isClaimed && React.createElement('button', {
      onClick: function() { if (onClaim) onClaim(quest); },
      className: 'w-full mt-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2'
    },
      React.createElement(Gift, { size: 16 }),
      '보상 받기 (+' + quest.xp + ' XP)'
    )
  );
};

// 📋 데일리 퀘스트 리스트
export var DailyQuestList = function(props) {
  var darkMode = props.darkMode;
  var quests = props.quests || [];
  var onClaim = props.onClaim;
  var onRefresh = props.onRefresh;
  var compact = props.compact;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var completed = quests.filter(function(q) { return q.completed; }).length;
  var claimed = quests.filter(function(q) { return q.claimed; }).length;
  var totalXp = quests.reduce(function(sum, q) { return sum + (q.claimed ? q.xp : 0); }, 0);
  
  // 남은 시간 계산
  var now = new Date();
  var midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  var hoursLeft = Math.floor((midnight - now) / (1000 * 60 * 60));
  var minutesLeft = Math.floor(((midnight - now) % (1000 * 60 * 60)) / (1000 * 60));
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Target, { size: 20, className: 'text-[#A996FF]' }),
        React.createElement('h3', { className: textPrimary + ' font-bold' }, '오늘의 퀘스트')
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Clock, { size: 14, className: textSecondary }),
        React.createElement('span', { className: textSecondary + ' text-xs' }, hoursLeft + '시간 ' + minutesLeft + '분 남음')
      )
    ),
    
    // 진행률
    React.createElement('div', { className: 'flex items-center gap-3 mb-4 p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
      React.createElement('div', { className: 'flex-1' },
        React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
          React.createElement('span', { className: textSecondary }, completed + '/' + quests.length + ' 완료'),
          React.createElement('span', { className: 'text-amber-400 font-bold' }, '+' + totalXp + ' XP 획득')
        ),
        React.createElement('div', { className: 'h-2 rounded-full ' + (darkMode ? 'bg-gray-600' : 'bg-gray-200') + ' overflow-hidden' },
          React.createElement('div', { 
            className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all',
            style: { width: (completed / quests.length * 100) + '%' }
          })
        )
      )
    ),
    
    // 퀘스트 목록
    React.createElement('div', { className: 'space-y-2' },
      quests.map(function(quest) {
        return React.createElement(QuestCard, {
          key: quest.id,
          quest: quest,
          darkMode: darkMode,
          onClaim: onClaim,
          compact: compact
        });
      })
    ),
    
    // 모든 퀘스트 완료 시 보너스
    completed === quests.length && claimed < quests.length && React.createElement('div', {
      className: 'mt-4 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-center'
    },
      React.createElement('p', { className: 'text-amber-500 font-bold mb-1' }, '🎉 모든 퀘스트 완료!'),
      React.createElement('p', { className: textSecondary + ' text-sm' }, '보상을 받아가세요')
    )
  );
};

// 🎮 퀘스트 훅
export function useQuests() {
  var questDataState = useState(function() {
    var data = loadQuestData();
    var today = getTodayKey();
    var week = getWeekKey();
    
    // 새로운 날이면 데일리 퀘스트 리셋
    if (data.lastRefresh !== today) {
      data.dailyQuests = generateDailyQuests();
      data.lastRefresh = today;
    }
    
    // 새로운 주면 주간 퀘스트 리셋
    if (data.weekStart !== week) {
      data.weeklyQuests = generateWeeklyQuests();
      data.weekStart = week;
    }
    
    saveQuestData(data);
    return data;
  });
  var questData = questDataState[0];
  var setQuestData = questDataState[1];
  
  // 데이터 저장
  useEffect(function() {
    saveQuestData(questData);
  }, [questData]);
  
  // 퀘스트 진행 업데이트
  var updateProgress = function(type, amount) {
    setQuestData(function(prev) {
      var updateQuests = function(quests) {
        return quests.map(function(q) {
          if (q.type === type && !q.claimed) {
            var newProgress = q.progress + amount;
            return Object.assign({}, q, {
              progress: Math.min(newProgress, q.target),
              completed: newProgress >= q.target
            });
          }
          return q;
        });
      };
      
      return Object.assign({}, prev, {
        dailyQuests: updateQuests(prev.dailyQuests),
        weeklyQuests: updateQuests(prev.weeklyQuests)
      });
    });
  };
  
  // 보상 수령
  var claimReward = function(questId) {
    var claimedQuest = null;
    
    setQuestData(function(prev) {
      var claimFromQuests = function(quests) {
        return quests.map(function(q) {
          if (q.id === questId && q.completed && !q.claimed) {
            claimedQuest = q;
            return Object.assign({}, q, { claimed: true });
          }
          return q;
        });
      };
      
      return Object.assign({}, prev, {
        dailyQuests: claimFromQuests(prev.dailyQuests),
        weeklyQuests: claimFromQuests(prev.weeklyQuests)
      });
    });
    
    return claimedQuest;
  };
  
  // 태스크 완료 시
  var onTaskComplete = function(task) {
    updateProgress('tasks', 1);
    if (task && task.priority === 'high') {
      updateProgress('highPriority', 1);
    }
    
    // 오전 9시 이전 체크
    var hour = new Date().getHours();
    if (hour < 9) {
      updateProgress('earlyBird', 1);
    }
  };
  
  // 집중 세션 완료 시
  var onFocusComplete = function(minutes) {
    updateProgress('focus', minutes);
    updateProgress('weeklyFocus', minutes);
  };
  
  // 기분 기록 시
  var onMoodLog = function() {
    updateProgress('mood', 1);
  };
  
  // 아침 루틴 완료
  var onMorningRoutine = function() {
    updateProgress('morning', 1);
  };
  
  // 저녁 리뷰 완료
  var onEveningReview = function() {
    updateProgress('evening', 1);
  };
  
  // 완벽한 하루 체크
  var checkPerfectDay = function(tasks) {
    var todayTasks = tasks.filter(function(t) {
      return t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString();
    });
    if (todayTasks.length > 0 && todayTasks.every(function(t) { return t.completed; })) {
      updateProgress('perfectDay', 1);
    }
  };
  
  return {
    dailyQuests: questData.dailyQuests,
    weeklyQuests: questData.weeklyQuests,
    updateProgress: updateProgress,
    claimReward: claimReward,
    onTaskComplete: onTaskComplete,
    onFocusComplete: onFocusComplete,
    onMoodLog: onMoodLog,
    onMorningRoutine: onMorningRoutine,
    onEveningReview: onEveningReview,
    checkPerfectDay: checkPerfectDay
  };
}

export default {
  QuestCard: QuestCard,
  DailyQuestList: DailyQuestList,
  useQuests: useQuests,
  QUEST_TEMPLATES: QUEST_TEMPLATES
};
