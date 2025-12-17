import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Cloud, Sun, CloudRain } from 'lucide-react';
import AlfredoIslandMinimal from './AlfredoIslandMinimal';
import FocusNowCard from './FocusNowCard';
import TodayTimelineMinimal from './TodayTimelineMinimal';
import { useGamification, XpGainToast, LevelUpModal } from '../gamification/LevelSystem';

// 요일 이름
var DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날씨 아이콘
var getWeatherIcon = function(weather) {
  if (!weather) return React.createElement(Sun, { size: 16, className: 'text-yellow-500' });
  var condition = (weather.condition || '').toLowerCase();
  if (condition.includes('rain') || condition.includes('비')) {
    return React.createElement(CloudRain, { size: 16, className: 'text-blue-400' });
  }
  if (condition.includes('cloud') || condition.includes('구름')) {
    return React.createElement(Cloud, { size: 16, className: 'text-gray-400' });
  }
  return React.createElement(Sun, { size: 16, className: 'text-yellow-500' });
};

// 컨디션 이모지
var CONDITION_EMOJI = ['😫', '😔', '😐', '😊', '🔥'];

// 🏠 미니멀 홈페이지
export var HomePage = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var mood = props.mood;
  var setMood = props.setMood;
  var setView = props.setView;
  var onOpenAddTask = props.onOpenAddTask;
  var onOpenTask = props.onOpenTask;
  var onOpenEvent = props.onOpenEvent;
  var onOpenChat = props.onOpenChat;
  var onStartFocus = props.onStartFocus;
  var userName = props.userName || 'Boss';
  
  // 상태
  var conditionState = useState(mood || 3);
  var condition = conditionState[0];
  var setCondition = conditionState[1];
  
  var showConditionPickerState = useState(false);
  var showConditionPicker = showConditionPickerState[0];
  var setShowConditionPicker = showConditionPickerState[1];
  
  // 게이미피케이션
  var gamification = useGamification();
  
  // 스트릭 업데이트
  useEffect(function() {
    if (gamification && gamification.updateStreak) {
      gamification.updateStreak();
    }
  }, []);
  
  // 오늘 날짜
  var today = new Date();
  var dayName = DAYS[today.getDay()];
  var dateStr = (today.getMonth() + 1) + '월 ' + today.getDate() + '일 ' + dayName + '요일';
  
  // 오늘 일정 필터
  var todayEvents = useMemo(function() {
    var todayStr = today.toDateString();
    return events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === todayStr;
    }).sort(function(a, b) {
      return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
    });
  }, [events]);
  
  // 지금 집중할 태스크
  var focusTask = useMemo(function() {
    var now = new Date();
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    
    if (incompleteTasks.length === 0) return null;
    
    // 긴급 태스크 (2시간 이내)
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
    
    return Object.assign({}, incompleteTasks[0], { recommended: true });
  }, [tasks]);
  
  // 컨디션 변경
  var handleConditionChange = function(newCondition) {
    setCondition(newCondition);
    if (setMood) setMood(newCondition);
    setShowConditionPicker(false);
    
    if (gamification && gamification.addXp) {
      gamification.addXp(5, '컨디션 기록');
    }
  };
  
  // 태스크 시작
  var handleStartTask = function(task) {
    if (!task) return;
    if (onStartFocus) {
      onStartFocus(task);
    } else if (onOpenTask) {
      onOpenTask(task);
    }
  };
  
  // 알프레도에게 메시지
  var handleSendMessage = function(message) {
    if (onOpenChat) {
      onOpenChat(message);
    }
  };
  
  return React.createElement('div', {
    className: 'min-h-screen bg-[#F5F5F7]'
  },
    // 헤더
    React.createElement('div', {
      className: 'px-4 pt-12 pb-2'
    },
      React.createElement('div', {
        className: 'flex items-center justify-between'
      },
        // 왼쪽: 날짜 + 날씨
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', {
            className: 'text-lg font-semibold text-gray-800'
          }, dateStr),
          React.createElement('span', { className: 'flex items-center gap-1' },
            getWeatherIcon(weather),
            weather && weather.temp && React.createElement('span', {
              className: 'text-sm text-gray-500'
            }, weather.temp + '°')
          )
        ),
        
        // 오른쪽: 컨디션 + 설정
        React.createElement('div', { className: 'flex items-center gap-2' },
          // 컨디션
          React.createElement('div', { className: 'relative' },
            React.createElement('button', {
              className: 'text-xl p-1 hover:bg-gray-200 rounded-full transition-colors',
              onClick: function() { setShowConditionPicker(!showConditionPicker); }
            }, CONDITION_EMOJI[condition - 1] || '😊'),
            
            // 컨디션 피커
            showConditionPicker && React.createElement('div', {
              className: 'absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border p-2 flex gap-1 z-50'
            },
              CONDITION_EMOJI.map(function(emoji, index) {
                return React.createElement('button', {
                  key: index,
                  className: 'text-xl p-2 hover:bg-gray-100 rounded-lg transition-colors ' +
                    (condition === index + 1 ? 'bg-purple-100' : ''),
                  onClick: function() { handleConditionChange(index + 1); }
                }, emoji);
              })
            )
          ),
          
          // 설정
          React.createElement('button', {
            className: 'p-2 hover:bg-gray-200 rounded-full transition-colors',
            onClick: function() { if (setView) setView('SETTINGS'); }
          },
            React.createElement(Settings, { size: 20, className: 'text-gray-500' })
          )
        )
      )
    ),
    
    // 배경 클릭으로 피커 닫기
    showConditionPicker && React.createElement('div', {
      className: 'fixed inset-0 z-40',
      onClick: function() { setShowConditionPicker(false); }
    }),
    
    // 메인 콘텐츠
    React.createElement('div', { className: 'pb-24' },
      // 1️⃣ 알프레도 아일랜드
      React.createElement(AlfredoIslandMinimal, {
        tasks: tasks,
        events: todayEvents,
        condition: condition,
        userName: userName,
        onSendMessage: handleSendMessage
      }),
      
      // 2️⃣ 지금 이거부터
      focusTask && React.createElement('div', { className: 'mx-4 mt-4' },
        React.createElement(FocusNowCard, {
          task: focusTask,
          darkMode: false,
          onStart: handleStartTask,
          onLater: function() {}
        })
      ),
      
      // 3️⃣ 오늘 타임라인 (성취도 포함)
      React.createElement(TodayTimelineMinimal, {
        events: todayEvents,
        tasks: tasks,
        onStartTask: handleStartTask,
        onOpenEvent: onOpenEvent
      })
    ),
    
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
      darkMode: false,
      newLevel: gamification.levelUp.level,
      levelInfo: gamification.levelUp.info
    })
  );
};

export default HomePage;
