import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Droplets, Target, Calendar, Coffee, Smile, Zap } from 'lucide-react';

// 넛지 타입별 설정
var NUDGE_CONFIG = {
  conditionCheck: {
    icon: '😊',
    title: '오늘 컨디션 어떠세요?',
    message: '기분과 에너지를 체크해주세요',
    actionLabel: '체크하기',
    color: 'from-amber-500 to-orange-500'
  },
  waterReminder: {
    icon: '💧',
    title: '물 한 잔 어때요?',
    message: '수분 섭취가 부족해 보여요',
    actionLabel: '물 마셨어요',
    color: 'from-blue-500 to-cyan-500'
  },
  taskReminder: {
    icon: '📋',
    title: '마감 전 확인해보세요!',
    message: '아직 완료하지 않은 할 일이 있어요',
    actionLabel: '확인하기',
    color: 'from-purple-500 to-pink-500'
  },
  meetingSoon: {
    icon: '📅',
    title: '곧 미팅이에요!',
    message: '준비되셨나요?',
    actionLabel: '일정 보기',
    color: 'from-emerald-500 to-teal-500'
  },
  focusBreak: {
    icon: '☕',
    title: '잠깐 쉬어가세요',
    message: '오래 집중했어요. 스트레칭 어때요?',
    actionLabel: '5분 휴식',
    color: 'from-rose-500 to-pink-500'
  },
  halfwayDone: {
    icon: '🔥',
    title: '절반 넘었어요!',
    message: '잘하고 있어요. 조금만 더 힘내요!',
    actionLabel: '다음 할 일',
    color: 'from-orange-500 to-red-500'
  },
  allDone: {
    icon: '🎉',
    title: '오늘 할 일 완료!',
    message: '수고했어요! 푹 쉬세요',
    actionLabel: null,
    color: 'from-green-500 to-emerald-500'
  },
  eveningReview: {
    icon: '🌙',
    title: '하루 정리할 시간이에요',
    message: '오늘 하루 어땠나요?',
    actionLabel: '리뷰하기',
    color: 'from-indigo-500 to-purple-500'
  },
  morningBriefing: {
    icon: '☀️',
    title: '좋은 아침이에요!',
    message: '오늘 일정을 확인해볼까요?',
    actionLabel: '브리핑 보기',
    color: 'from-yellow-500 to-orange-500'
  }
};

// 넛지 결정 로직
function determineNudge(props) {
  var hour = new Date().getHours();
  var mood = props.mood;
  var energy = props.energy;
  var waterIntake = props.waterIntake || 0;
  var waterGoal = props.waterGoal || 8;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var focusMinutes = props.focusMinutes || 0;
  
  var incompleteTasks = tasks.filter(function(t) { return !t.completed && t.status !== 'done'; });
  var completedTasks = tasks.filter(function(t) { return t.completed || t.status === 'done'; });
  var totalTasks = tasks.length;
  
  // 다음 10분 이내 미팅 확인
  var now = new Date();
  var tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
  var upcomingMeeting = events.find(function(e) {
    var start = new Date(e.start);
    return start > now && start <= tenMinutesLater;
  });
  
  // 우선순위 순서대로 체크
  
  // 1. 10분 내 미팅
  if (upcomingMeeting) {
    return {
      type: 'meetingSoon',
      data: upcomingMeeting
    };
  }
  
  // 2. 집중 모드 2시간 이상
  if (focusMinutes >= 120) {
    return { type: 'focusBreak' };
  }
  
  // 3. 모든 할 일 완료
  if (totalTasks > 0 && incompleteTasks.length === 0) {
    return { type: 'allDone' };
  }
  
  // 4. 아침 (6-10시) - 컨디션 미체크 또는 모닝 브리핑
  if (hour >= 6 && hour < 10) {
    if (!mood || !energy) {
      return { type: 'conditionCheck' };
    }
    return { type: 'morningBriefing' };
  }
  
  // 5. 절반 완료 축하 (30% 이상 완료 시)
  if (totalTasks >= 3 && completedTasks.length > 0) {
    var completionRate = completedTasks.length / totalTasks;
    if (completionRate >= 0.5 && completionRate < 1) {
      return { type: 'halfwayDone' };
    }
  }
  
  // 6. 오후 (13-17시) - 물 섭취 체크
  if (hour >= 13 && hour < 17 && waterIntake < waterGoal / 2) {
    return { type: 'waterReminder' };
  }
  
  // 7. 저녁 전 (17-19시) - 미완료 할 일 리마인더
  if (hour >= 17 && hour < 19 && incompleteTasks.length > 0) {
    return {
      type: 'taskReminder',
      data: { count: incompleteTasks.length }
    };
  }
  
  // 8. 저녁 (21-23시) - 하루 리뷰
  if (hour >= 21 && hour < 23) {
    return { type: 'eveningReview' };
  }
  
  return null;
}

// 플로팅 넛지 컴포넌트
var AlfredoNudge = function(props) {
  var darkMode = props.darkMode;
  var mood = props.mood;
  var energy = props.energy;
  var waterIntake = props.waterIntake;
  var waterGoal = props.waterGoal;
  var tasks = props.tasks;
  var events = props.events;
  var focusMinutes = props.focusMinutes;
  var onAction = props.onAction;
  var onDismiss = props.onDismiss;
  
  var visibleState = useState(false);
  var isVisible = visibleState[0];
  var setIsVisible = visibleState[1];
  
  var nudgeState = useState(null);
  var currentNudge = nudgeState[0];
  var setCurrentNudge = nudgeState[1];
  
  var dismissedState = useState({});
  var dismissed = dismissedState[0];
  var setDismissed = dismissedState[1];
  
  // 넛지 결정 (1분마다 체크)
  useEffect(function() {
    var checkNudge = function() {
      var nudge = determineNudge({
        mood: mood,
        energy: energy,
        waterIntake: waterIntake,
        waterGoal: waterGoal,
        tasks: tasks,
        events: events,
        focusMinutes: focusMinutes
      });
      
      if (nudge && !dismissed[nudge.type]) {
        setCurrentNudge(nudge);
        setIsVisible(true);
      }
    };
    
    checkNudge();
    var interval = setInterval(checkNudge, 60000); // 1분마다
    
    return function() { clearInterval(interval); };
  }, [mood, energy, waterIntake, tasks, events, focusMinutes, dismissed]);
  
  // 자동 숨김 (30초 후)
  useEffect(function() {
    if (isVisible) {
      var timeout = setTimeout(function() {
        setIsVisible(false);
      }, 30000);
      return function() { clearTimeout(timeout); };
    }
  }, [isVisible]);
  
  var handleDismiss = function() {
    if (currentNudge) {
      // 같은 타입은 1시간 동안 다시 안 보이게
      setDismissed(function(prev) {
        var next = Object.assign({}, prev);
        next[currentNudge.type] = true;
        return next;
      });
      
      // 1시간 후 리셋
      setTimeout(function() {
        setDismissed(function(prev) {
          var next = Object.assign({}, prev);
          delete next[currentNudge.type];
          return next;
        });
      }, 3600000);
    }
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };
  
  var handleAction = function() {
    if (onAction && currentNudge) {
      onAction(currentNudge.type, currentNudge.data);
    }
    handleDismiss();
  };
  
  if (!isVisible || !currentNudge) return null;
  
  var config = NUDGE_CONFIG[currentNudge.type];
  if (!config) return null;
  
  var bgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'fixed right-4 bottom-44 z-50 transition-all duration-300 ease-out'
  },
    // 말풍선 화살표
    React.createElement('div', {
      className: 'absolute -bottom-2 right-6 w-4 h-4 rotate-45 ' + bgClass + ' shadow-lg'
    }),
    
    // 메인 카드
    React.createElement('div', {
      className: bgClass + ' rounded-2xl shadow-2xl p-4 max-w-[280px] border ' + 
        (darkMode ? 'border-gray-700' : 'border-gray-200')
    },
      // 헤더
      React.createElement('div', { className: 'flex items-start justify-between mb-2' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-2xl' }, config.icon),
          React.createElement('span', { className: textPrimary + ' font-bold text-sm' }, config.title)
        ),
        React.createElement('button', {
          onClick: handleDismiss,
          className: textSecondary + ' hover:opacity-70 transition-opacity p-1'
        },
          React.createElement(X, { size: 16 })
        )
      ),
      
      // 메시지
      React.createElement('p', { className: textSecondary + ' text-xs mb-3 ml-9' }, config.message),
      
      // 액션 버튼
      config.actionLabel && React.createElement('button', {
        onClick: handleAction,
        className: 'w-full py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r ' + config.color + ' hover:opacity-90 transition-opacity flex items-center justify-center gap-1'
      },
        config.actionLabel,
        React.createElement(ChevronRight, { size: 14 })
      )
    )
  );
};

export default AlfredoNudge;
