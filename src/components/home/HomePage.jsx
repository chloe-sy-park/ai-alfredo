import React, { useState, useMemo, useEffect } from 'react';
import HomeHeaderV2 from './HomeHeaderV2';
import AlfredoHeroV2 from './AlfredoHeroV2';
import TodayRemindersCard from './TodayRemindersCard';
import FocusNowCard from './FocusNowCard';
import TodayTop3Card from './TodayTop3Card';
import TodayProgressCard from './TodayProgressCard';
import MiniTimeline from './MiniTimeline';
import NightModeView from './NightModeView';
import { QuickActionFloating, ChatFloating } from './QuickActionFloating';
import { useGamification, XpGainToast, LevelUpModal } from '../gamification/LevelSystem';

// 시간대 체크
var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// 🏠 홈페이지 v4 - 통일된 배경색 + 새로운 레이아웃
export var HomePage = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var routines = props.routines || [];
  var weather = props.weather;
  var mood = props.mood;
  var setMood = props.setMood;
  var setView = props.setView;
  var onOpenAddTask = props.onOpenAddTask;
  var onOpenTask = props.onOpenTask;
  var onOpenEvent = props.onOpenEvent;
  var onOpenChat = props.onOpenChat;
  var onOpenInbox = props.onOpenInbox;
  var onStartFocus = props.onStartFocus;
  var onCompleteRoutine = props.onCompleteRoutine;
  var userName = props.userName || 'Boss';
  
  // 상태
  var conditionState = useState(mood || 3);
  var condition = conditionState[0];
  var setCondition = conditionState[1];
  
  var energyState = useState(3);
  var energy = energyState[0];
  var setEnergy = energyState[1];
  
  var showNormalViewState = useState(false);
  var forceShowNormalView = showNormalViewState[0];
  var setForceShowNormalView = showNormalViewState[1];
  
  // 게이미피케이션
  var gamification = useGamification();
  
  // 스트릭 업데이트 (하루 1번)
  useEffect(function() {
    if (gamification && gamification.updateStreak) {
      gamification.updateStreak();
    }
  }, []);
  
  // 시간대 체크
  var timeOfDay = getTimeOfDay();
  var isNightMode = timeOfDay === 'night' && !forceShowNormalView;
  
  // 통계
  var todayStats = useMemo(function() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    var total = tasks.length;
    return { completed: completed, total: total };
  }, [tasks]);
  
  // 통일된 배경색 (#F5F5F7)
  var bgColor = isNightMode 
    ? 'bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]'
    : 'bg-[#F5F5F7]';
  
  // 컨디션 변경
  var handleConditionChange = function(newCondition) {
    setCondition(newCondition);
    if (setMood) setMood(newCondition);
    
    if (gamification && gamification.addXp) {
      gamification.addXp(5, '컨디션 기록');
    }
  };
  
  // 에너지 변경
  var handleEnergyChange = function(newEnergy) {
    setEnergy(newEnergy);
    
    if (gamification && gamification.addXp) {
      gamification.addXp(5, '에너지 기록');
    }
  };
  
  // 페이지 이동
  var handleNavigate = function(page) {
    if (setView) setView(page);
  };
  
  // 오늘 일정만 필터
  var todayEvents = useMemo(function() {
    var now = new Date();
    var today = now.toDateString();
    
    return events.filter(function(e) {
      var eventDate = new Date(e.start);
      return eventDate.toDateString() === today;
    }).sort(function(a, b) {
      return new Date(a.start) - new Date(b.start);
    });
  }, [events]);
  
  // 지금 집중할 할일 선택
  var focusTask = useMemo(function() {
    var now = new Date();
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    
    if (incompleteTasks.length === 0) return null;
    
    // 긴급 태스크 (2시간 이내 마감)
    var urgentTask = incompleteTasks.find(function(t) {
      if (!t.deadline && !t.dueDate) return false;
      var deadline = new Date(t.deadline || t.dueDate);
      var diffHours = (deadline - now) / 1000 / 60 / 60;
      return diffHours > 0 && diffHours <= 2;
    });
    if (urgentTask) return Object.assign({}, urgentTask, { recommended: true });
    
    // 높은 우선순위
    var highPriority = incompleteTasks.find(function(t) {
      return t.priority === 'high' || t.importance >= 4;
    });
    if (highPriority) return Object.assign({}, highPriority, { recommended: true });
    
    return incompleteTasks[0];
  }, [tasks]);
  
  // 리마인더 목록
  var remindersData = useMemo(function() {
    var items = [];
    var urgentCount = 0;
    
    tasks.forEach(function(t) {
      if (t.completed) return;
      if (t.dueDate || t.deadline) {
        var due = new Date(t.dueDate || t.deadline);
        var now = new Date();
        var diffHours = (due - now) / 1000 / 60 / 60;
        var diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        
        if (diffHours > 0 && diffHours <= 24) {
          urgentCount++;
        }
        
        if (diffDays <= 3) {
          items.push({
            id: 'task-' + t.id,
            type: t.title.includes('메일') || t.title.includes('회신') ? 'email' : 'deadline',
            title: t.title,
            dueDate: t.dueDate || t.deadline,
            urgent: diffHours > 0 && diffHours <= 24
          });
        }
      }
    });
    
    return {
      items: items.slice(0, 5),
      urgentCount: urgentCount
    };
  }, [tasks]);
  
  // 태스크 시작
  var handleStartTask = function(task) {
    if (!task) return;
    
    if (onStartFocus) {
      onStartFocus(task);
    } else if (onOpenTask) {
      onOpenTask(task);
    }
  };
  
  // 퀵액션 처리
  var handleQuickAction = function(actionId) {
    switch (actionId) {
      case 'addTask':
        if (onOpenAddTask) onOpenAddTask();
        break;
      case 'addEvent':
        if (setView) setView('CALENDAR');
        break;
      case 'water':
        if (onCompleteRoutine) onCompleteRoutine({ id: 'water', title: '물 마시기' });
        if (gamification && gamification.addXp) {
          gamification.addXp(10, '💧 물 마시기');
        }
        break;
      case 'vitamin':
        if (onCompleteRoutine) onCompleteRoutine({ id: 'vitamin', title: '영양제' });
        if (gamification && gamification.addXp) {
          gamification.addXp(10, '💊 영양제');
        }
        break;
      case 'rest':
        if (onStartFocus) onStartFocus({ type: 'rest', duration: 5 });
        break;
      default:
        break;
    }
  };
  
  // 내일 준비 완료
  var handleReadyForTomorrow = function() {
    if (gamification && gamification.addXp) {
      gamification.addXp(20, '🌙 하루 마무리');
    }
  };
  
  // 🌙 나이트 모드 렌더링
  if (isNightMode) {
    return React.createElement('div', { className: bgColor + ' min-h-screen' },
      React.createElement(HomeHeaderV2, {
        weather: weather,
        level: gamification.level || 1
      }),
      
      React.createElement(AlfredoHeroV2, {
        userName: userName,
        condition: condition,
        energy: energy,
        weather: weather,
        tasks: tasks,
        events: todayEvents,
        onConditionChange: handleConditionChange,
        onEnergyChange: handleEnergyChange
      }),
      
      React.createElement(NightModeView, {
        darkMode: true,
        userName: userName,
        tasks: tasks,
        events: events,
        focusMinutes: gamification.gameData?.focusMinutes || 0,
        onReadyForTomorrow: handleReadyForTomorrow,
        onViewDetails: function() { setForceShowNormalView(true); }
      }),
      
      React.createElement(ChatFloating, {
        onClick: onOpenChat,
        darkMode: true
      }),
      
      gamification.xpToast && React.createElement(XpGainToast, {
        amount: gamification.xpToast.amount,
        reason: gamification.xpToast.reason,
        isVisible: gamification.xpToast.visible,
        onClose: gamification.hideXpToast
      }),
      
      gamification.levelUp && React.createElement(LevelUpModal, {
        isOpen: gamification.levelUp.open,
        onClose: gamification.closeLevelUp,
        darkMode: true,
        newLevel: gamification.levelUp.level,
        levelInfo: gamification.levelUp.info
      })
    );
  }
  
  // ☀️ 일반 모드 렌더링 - v4 레이아웃 (통일된 배경색)
  return React.createElement('div', { className: bgColor + ' min-h-screen' },
    // 헤더 (배경색 동일)
    React.createElement(HomeHeaderV2, {
      weather: weather,
      level: gamification.level || 1
    }),
    
    // 알프레도 히어로 섹션 (배경색 동일)
    React.createElement(AlfredoHeroV2, {
      userName: userName,
      condition: condition,
      energy: energy,
      weather: weather,
      tasks: tasks,
      events: todayEvents,
      onConditionChange: handleConditionChange,
      onEnergyChange: handleEnergyChange
    }),
    
    // 메인 콘텐츠 - 카드들
    React.createElement('div', { 
      className: 'max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pb-28 space-y-5'
    },
      // 1️⃣ 오늘 잊지마세요
      remindersData.items.length > 0 && React.createElement(TodayRemindersCard, {
        darkMode: darkMode,
        reminders: remindersData.items,
        urgentCount: remindersData.urgentCount,
        condition: condition,
        onConditionChange: handleConditionChange,
        onReminderClick: function(reminder) {
          console.log('Reminder clicked:', reminder);
        }
      }),
      
      // 2️⃣ 지금 이거부터 (AI 추천)
      focusTask && React.createElement(FocusNowCard, {
        task: focusTask,
        darkMode: darkMode,
        onStart: handleStartTask,
        onLater: function() {}
      }),
      
      // 3️⃣ 오늘의 Top 3
      React.createElement(TodayTop3Card, {
        darkMode: darkMode,
        tasks: tasks,
        onTaskClick: onOpenTask,
        onStartTask: handleStartTask
      }),
      
      // 4️⃣ 진행률/성취감 카드
      React.createElement(TodayProgressCard, {
        darkMode: darkMode,
        completedCount: todayStats.completed,
        totalCount: todayStats.total || 3,
        focusMinutes: gamification.gameData?.focusMinutes || 0,
        onClick: function() { handleNavigate('STATS'); }
      }),
      
      // 5️⃣ 오늘 타임라인
      React.createElement(MiniTimeline, {
        events: todayEvents,
        tasks: tasks,
        darkMode: darkMode,
        condition: condition,
        onStartTask: handleStartTask,
        onOpenEvent: onOpenEvent,
        onAddTask: onOpenAddTask
      })
    ),
    
    // 플로팅 버튼들
    React.createElement(QuickActionFloating, {
      onAction: handleQuickAction,
      darkMode: darkMode
    }),
    
    React.createElement(ChatFloating, {
      onClick: onOpenChat,
      darkMode: darkMode
    }),
    
    // XP 토스트
    gamification.xpToast && React.createElement(XpGainToast, {
      amount: gamification.xpToast.amount,
      reason: gamification.xpToast.reason,
      isVisible: gamification.xpToast.visible,
      onClose: gamification.hideXpToast
    }),
    
    // 레벨업 모달
    gamification.levelUp && React.createElement(LevelUpModal, {
      isOpen: gamification.levelUp.open,
      onClose: gamification.closeLevelUp,
      darkMode: darkMode,
      newLevel: gamification.levelUp.level,
      levelInfo: gamification.levelUp.info
    })
  );
};

export default HomePage;
