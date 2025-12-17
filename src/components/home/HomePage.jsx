import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Cloud, Sun, CloudRain, Moon, Star } from 'lucide-react';
import AlfredoIslandMinimal from './AlfredoIslandMinimal';
import FocusNowCard from './FocusNowCard';
import TodayTimelineMinimal from './TodayTimelineMinimal';
import { useGamification, XpGainToast, LevelUpModal } from '../gamification/LevelSystem';

// 요일 이름
var DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날씨 아이콘
var getWeatherIcon = function(weather, isNight) {
  if (isNight) return React.createElement(Moon, { size: 16, className: 'text-indigo-400' });
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

// 🌙 나이트 모드 뷰
var NightModeView = function(props) {
  var userName = props.userName;
  var tasks = props.tasks || [];
  var onViewDetails = props.onViewDetails;
  
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 space-y-4'
  },
    // 알프레도 나이트 메시지
    React.createElement('div', {
      className: 'bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-center'
    },
      React.createElement('span', { className: 'text-4xl block mb-3' }, '🐧'),
      React.createElement('h2', {
        className: 'text-xl font-bold text-white mb-2'
      }, '오늘 하루 수고했어요, ' + userName),
      
      total > 0 && React.createElement('p', {
        className: 'text-indigo-200'
      }, completed + '개 완료했어요! ' + (completed >= total ? '🎉 완벽해요!' : '💜 충분해요')),
      
      React.createElement('p', {
        className: 'text-indigo-300 text-sm mt-3'
      }, '이제 푹 쉬세요. 내일도 함께할게요 ✨')
    ),
    
    // 내일 준비 카드
    React.createElement('div', {
      className: 'bg-white/10 backdrop-blur rounded-2xl p-5'
    },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(Star, { size: 18, className: 'text-yellow-400' }),
        React.createElement('span', { className: 'text-white font-medium' }, '내일을 위해')
      ),
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('button', {
          className: 'w-full py-3 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors'
        }, '💧 물 한 잔 마시기'),
        React.createElement('button', {
          className: 'w-full py-3 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors'
        }, '📱 폰 내려놓기')
      )
    ),
    
    // 상세 보기 버튼
    React.createElement('button', {
      onClick: onViewDetails,
      className: 'w-full py-3 text-indigo-300 text-sm hover:text-white transition-colors'
    }, '오늘 기록 보기 →')
  );
};

// ⚡ 긴급 일정 알림 배너
var UrgentEventBanner = function(props) {
  var event = props.event;
  var diffMin = props.diffMin;
  
  if (!event) return null;
  
  var title = event.title || event.summary || '일정';
  var isVeryUrgent = diffMin <= 10;
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3 animate-pulse ' +
      (isVeryUrgent ? 'bg-red-500' : 'bg-orange-500')
  },
    React.createElement('span', { className: 'text-2xl' }, '⚡'),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('p', {
        className: 'text-white font-bold'
      }, diffMin + '분 뒤 일정이에요!'),
      React.createElement('p', {
        className: 'text-white/80 text-sm truncate'
      }, title)
    ),
    React.createElement('span', { className: 'text-white/60 text-sm' }, '준비하세요')
  );
};

// 🐧 컨디션 체크 모달
var ConditionCheckModal = function(props) {
  var isOpen = props.isOpen;
  var onSelect = props.onSelect;
  var userName = props.userName;
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
  },
    // 배경
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/50'
    }),
    
    // 모달
    React.createElement('div', {
      className: 'relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl'
    },
      React.createElement('div', { className: 'text-center mb-6' },
        React.createElement('span', { className: 'text-4xl block mb-3' }, '🐧'),
        React.createElement('h3', {
          className: 'text-lg font-bold text-gray-800'
        }, userName + ', 오늘 컨디션 어때요?'),
        React.createElement('p', {
          className: 'text-gray-500 text-sm mt-1'
        }, '알려주시면 맞춰서 도와드릴게요')
      ),
      
      React.createElement('div', {
        className: 'flex justify-center gap-2'
      },
        CONDITION_EMOJI.map(function(emoji, index) {
          return React.createElement('button', {
            key: index,
            className: 'text-3xl p-3 hover:bg-gray-100 rounded-xl transition-all hover:scale-110',
            onClick: function() { onSelect(index + 1); }
          }, emoji);
        })
      )
    )
  );
};

// 🏠 홈페이지 (나이트모드 + 컨디션체크 + 알림)
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
  var conditionState = useState(mood || 0); // 0 = 아직 안 물어봄
  var condition = conditionState[0];
  var setCondition = conditionState[1];
  
  var showConditionPickerState = useState(false);
  var showConditionPicker = showConditionPickerState[0];
  var setShowConditionPicker = showConditionPickerState[1];
  
  var showConditionModalState = useState(false);
  var showConditionModal = showConditionModalState[0];
  var setShowConditionModal = showConditionModalState[1];
  
  var forceNormalViewState = useState(false);
  var forceNormalView = forceNormalViewState[0];
  var setForceNormalView = forceNormalViewState[1];
  
  // 게이미피케이션
  var gamification = useGamification();
  
  // 시간 체크
  var now = new Date();
  var hour = now.getHours();
  var isNightTime = hour >= 21 || hour < 5;
  var isNightMode = isNightTime && !forceNormalView;
  
  // 컨디션 체크 (처음 열 때 한 번)
  useEffect(function() {
    // 오늘 이미 체크했는지 확인
    var today = new Date().toDateString();
    var lastCheck = localStorage.getItem('lastConditionCheck');
    
    if (lastCheck !== today && condition === 0 && !isNightMode) {
      // 1초 후 모달 표시
      var timer = setTimeout(function() {
        setShowConditionModal(true);
      }, 1000);
      return function() { clearTimeout(timer); };
    }
  }, [condition, isNightMode]);
  
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
  
  // 30분 이내 긴급 일정
  var urgentEvent = useMemo(function() {
    var found = null;
    var minDiff = 31;
    
    todayEvents.forEach(function(e) {
      var start = new Date(e.start || e.startTime);
      var diffMin = Math.round((start - now) / 1000 / 60);
      if (diffMin > 0 && diffMin <= 30 && diffMin < minDiff) {
        found = e;
        minDiff = diffMin;
      }
    });
    
    return found ? { event: found, diffMin: minDiff } : null;
  }, [todayEvents, now]);
  
  // 지금 집중할 태스크
  var focusTask = useMemo(function() {
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
    setShowConditionModal(false);
    
    // 오늘 체크 기록
    localStorage.setItem('lastConditionCheck', new Date().toDateString());
    
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
  
  // 배경색
  var bgColor = isNightMode 
    ? 'bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]'
    : 'bg-[#F5F5F7]';
  
  return React.createElement('div', {
    className: 'min-h-screen ' + bgColor
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
            className: 'text-lg font-semibold ' + (isNightMode ? 'text-white' : 'text-gray-800')
          }, dateStr),
          React.createElement('span', { className: 'flex items-center gap-1' },
            getWeatherIcon(weather, isNightMode),
            weather && weather.temp && React.createElement('span', {
              className: 'text-sm ' + (isNightMode ? 'text-gray-400' : 'text-gray-500')
            }, weather.temp + '°')
          )
        ),
        
        // 오른쪽: 컨디션 + 설정
        React.createElement('div', { className: 'flex items-center gap-2' },
          // 컨디션
          React.createElement('div', { className: 'relative' },
            React.createElement('button', {
              className: 'text-xl p-1 rounded-full transition-colors ' +
                (isNightMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'),
              onClick: function() { setShowConditionPicker(!showConditionPicker); }
            }, condition > 0 ? CONDITION_EMOJI[condition - 1] : '❓'),
            
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
            className: 'p-2 rounded-full transition-colors ' +
              (isNightMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'),
            onClick: function() { if (setView) setView('SETTINGS'); }
          },
            React.createElement(Settings, { 
              size: 20, 
              className: isNightMode ? 'text-gray-400' : 'text-gray-500'
            })
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
    isNightMode
      ? React.createElement(NightModeView, {
          userName: userName,
          tasks: tasks,
          onViewDetails: function() { setForceNormalView(true); }
        })
      : React.createElement('div', { className: 'pb-24' },
          // ⚡ 긴급 일정 알림
          urgentEvent && React.createElement(UrgentEventBanner, {
            event: urgentEvent.event,
            diffMin: urgentEvent.diffMin
          }),
          
          // 1️⃣ 알프레도 아일랜드
          React.createElement(AlfredoIslandMinimal, {
            tasks: tasks,
            events: todayEvents,
            condition: condition,
            userName: userName,
            urgentEvent: urgentEvent,
            onOpenChat: onOpenChat
          }),
          
          // 2️⃣ 지금 이거부터
          React.createElement('div', { className: 'mx-4 mt-4' },
            React.createElement(FocusNowCard, {
              task: focusTask,
              darkMode: false,
              onStart: handleStartTask,
              onLater: function() {},
              onAddTask: onOpenAddTask
            })
          ),
          
          // 3️⃣ 오늘 타임라인 (성취도 포함)
          React.createElement(TodayTimelineMinimal, {
            events: todayEvents,
            tasks: tasks,
            onStartTask: handleStartTask,
            onOpenEvent: onOpenEvent,
            onAddTask: onOpenAddTask
          })
        ),
    
    // 🐧 컨디션 체크 모달
    React.createElement(ConditionCheckModal, {
      isOpen: showConditionModal,
      onSelect: handleConditionChange,
      userName: userName
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
      darkMode: isNightMode,
      newLevel: gamification.levelUp.level,
      levelInfo: gamification.levelUp.info
    })
  );
};

export default HomePage;
