import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Cloud, Sun, CloudRain, Moon, Star } from 'lucide-react';
import AlfredoIslandMinimal from './AlfredoIslandMinimal';
import FocusNowCard from './FocusNowCard';
import TodayTimelineMinimal from './TodayTimelineMinimal';
import DNAInsightCard from './DNAInsightCard';
import { NudgeStack, useNudges } from './FloatingNudge';
import { useGamification, XpGainToast, LevelUpModal } from '../gamification/LevelSystem';
import EveningBriefing from './EveningBriefing';
import { ConditionQuickChange } from './ConditionQuickChange';

// 요일 이름
var DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날씨 아이콘
var getWeatherIcon = function(weather, isNight) {
  if (isNight) return React.createElement(Moon, { size: 18, className: 'text-indigo-400' });
  if (!weather) return React.createElement(Sun, { size: 18, className: 'text-yellow-500' });
  var condition = (weather.condition || '').toLowerCase();
  if (condition.includes('rain') || condition.includes('비')) {
    return React.createElement(CloudRain, { size: 18, className: 'text-blue-400' });
  }
  if (condition.includes('cloud') || condition.includes('구름')) {
    return React.createElement(Cloud, { size: 18, className: 'text-gray-400' });
  }
  return React.createElement(Sun, { size: 18, className: 'text-yellow-500' });
};

// 시간대 구분 (브리핑 분기용)
var getTimePhase = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';     // 아침 브리핑
  if (hour >= 12 && hour < 17) return 'afternoon';  // 오후
  if (hour >= 17 && hour < 21) return 'evening';    // 저녁 브리핑
  return 'night';                                    // 나이트 모드
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
    className: 'mx-4 mt-4 space-y-4 pb-safe'
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
          className: 'w-full min-h-[48px] py-3 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 active:bg-white/25 transition-colors'
        }, '💧 물 한 잔 마시기'),
        React.createElement('button', {
          className: 'w-full min-h-[48px] py-3 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 active:bg-white/25 transition-colors'
        }, '📱 폰 내려놓기')
      )
    ),
    
    // 상세 보기 버튼
    React.createElement('button', {
      onClick: onViewDetails,
      className: 'w-full min-h-[48px] py-3 text-indigo-300 text-sm hover:text-white active:text-white/80 transition-colors'
    }, '오늘 기록 보기 →')
  );
};

// ⚡ 긴급 일정 알림 배너 (컴팩트)
var UrgentEventBanner = function(props) {
  var event = props.event;
  var diffMin = props.diffMin;
  
  if (!event) return null;
  
  var title = event.title || event.summary || '일정';
  var isVeryUrgent = diffMin <= 10;
  
  return React.createElement('div', {
    className: 'mx-4 mt-2 rounded-xl p-3 flex items-center gap-3 min-h-[52px] ' +
      (isVeryUrgent ? 'bg-red-500 animate-pulse' : 'bg-orange-500')
  },
    React.createElement('span', { className: 'text-xl' }, '⚡'),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('p', {
        className: 'text-white font-medium text-sm'
      }, diffMin + '분 뒤: ' + title.slice(0, 15) + (title.length > 15 ? '...' : ''))
    )
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
      className: 'relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl mx-4'
    },
      React.createElement('div', { className: 'text-center mb-6' },
        React.createElement('span', { className: 'text-5xl block mb-3' }, '🐧'),
        React.createElement('h3', {
          className: 'text-lg font-bold text-gray-800'
        }, userName + ', 오늘 컨디션 어때요?'),
        React.createElement('p', {
          className: 'text-gray-500 text-sm mt-1'
        }, '알려주시면 맞춰서 도와드릴게요')
      ),
      
      // 컨디션 버튼들 - 터치 타겟 확대
      React.createElement('div', {
        className: 'flex justify-center gap-1'
      },
        CONDITION_EMOJI.map(function(emoji, index) {
          return React.createElement('button', {
            key: index,
            className: 'text-3xl min-w-[56px] min-h-[56px] p-3 hover:bg-gray-100 active:bg-purple-100 rounded-xl transition-all active:scale-95',
            onClick: function() { onSelect(index + 1); }
          }, emoji);
        })
      )
    )
  );
};

// 🏠 홈페이지 (시간대별 브리핑 자동 전환)
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
  var onStartBodyDoubling = props.onStartBodyDoubling;
  var userName = props.userName || 'Boss';
  
  // 🧬 DNA 인사이트 props
  var dnaProfile = props.dnaProfile;
  var dnaSuggestions = props.dnaSuggestions;
  var dnaAnalysisPhase = props.dnaAnalysisPhase;
  var getMorningBriefing = props.getMorningBriefing;
  var getEveningMessage = props.getEveningMessage;
  var getStressLevel = props.getStressLevel;
  var getBestFocusTime = props.getBestFocusTime;
  var getPeakHours = props.getPeakHours;
  var getChronotype = props.getChronotype;
  
  // 상태
  var conditionState = useState(mood || 0);
  var condition = conditionState[0];
  var setCondition = conditionState[1];
  
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
  var timePhase = getTimePhase();
  var isNightTime = hour >= 21 || hour < 5;
  var isNightMode = isNightTime && !forceNormalView;
  var isEveningMode = timePhase === 'evening' && !forceNormalView;
  
  // 에너지 레벨 계산 (컨디션 기반)
  var energyLevel = useMemo(function() {
    if (condition === 0) return 50;
    return condition * 20; // 1=20, 2=40, 3=60, 4=80, 5=100
  }, [condition]);
  
  // 기분 매핑
  var moodLevel = useMemo(function() {
    if (condition <= 1) return 'down';
    if (condition <= 2) return 'neutral';
    if (condition <= 3) return 'good';
    return 'great';
  }, [condition]);
  
  // 오늘 일정 필터
  var today = new Date();
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
  
  // 오늘 마감 태스크
  var todayDeadlines = useMemo(function() {
    var todayStr = today.toDateString();
    return tasks.filter(function(t) {
      if (t.completed) return false;
      if (!t.deadline && !t.dueDate) return false;
      var deadline = new Date(t.deadline || t.dueDate);
      return deadline.toDateString() === todayStr;
    });
  }, [tasks, today]);
  
  // 완료된 태스크 수
  var completedToday = useMemo(function() {
    return tasks.filter(function(t) { return t.completed; }).length;
  }, [tasks]);
  
  // 미완료 태스크
  var pendingTasks = useMemo(function() {
    return tasks.filter(function(t) { return !t.completed; });
  }, [tasks]);
  
  // 🔔 넛지 훅 사용
  var nudgeData = useNudges({
    energy: energyLevel,
    mood: moodLevel,
    pendingTasks: pendingTasks,
    completedToday: completedToday,
    streak: gamification.currentStreak || 0,
    hasUpcomingMeeting: urgentEvent ? { 
      title: urgentEvent.event.title || urgentEvent.event.summary, 
      minutesUntil: urgentEvent.diffMin 
    } : null,
    todayDeadlines: todayDeadlines,
    minutesSinceBreak: 0,
    weather: weather,
    refreshInterval: 60000
  });
  
  // 넛지 액션 핸들러
  var handleNudgeAction = function(action) {
    if (!action) return;
    
    switch (action.type) {
      case 'focusTask':
        if (action.payload && onStartFocus) {
          onStartFocus(action.payload);
        }
        break;
      case 'showMeeting':
        if (action.payload && onOpenEvent) {
          onOpenEvent(action.payload);
        }
        break;
      case 'takeBreak':
        break;
      case 'rest':
        break;
      case 'prioritize':
        if (onOpenAddTask) {
          onOpenAddTask();
        }
        break;
    }
  };
  
  // 컨디션 체크 (처음 열 때 한 번)
  useEffect(function() {
    var todayCheck = new Date().toDateString();
    var lastCheck = localStorage.getItem('lastConditionCheck');
    
    if (lastCheck !== todayCheck && condition === 0 && !isNightMode) {
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
  var dayName = DAYS[today.getDay()];
  var dateStr = (today.getMonth() + 1) + '월 ' + today.getDate() + '일 ' + dayName + '요일';
  
  // 지금 집중할 태스크
  var focusTask = useMemo(function() {
    var incompleteTasks = tasks.filter(function(t) { return !t.completed; });
    
    if (incompleteTasks.length === 0) return null;
    
    // 긴급 태스크
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
    setShowConditionModal(false);
    
    localStorage.setItem('lastConditionCheck', new Date().toDateString());
    
    if (gamification && gamification.addXp) {
      gamification.addXp(5, '컨디션 기록');
    }
  };
  
  // 태스크 시작 (집중 모드)
  var handleStartTask = function(task) {
    if (!task) return;
    if (onStartFocus) {
      onStartFocus(task);
    } else if (onOpenTask) {
      onOpenTask(task);
    }
  };
  
  // 태스크 시작 (바디더블링)
  var handleStartBodyDoubling = function(task) {
    if (!task) return;
    if (onStartBodyDoubling) {
      onStartBodyDoubling(task);
    }
  };
  
  // 배경색
  var bgColor = isNightMode 
    ? 'bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e]'
    : isEveningMode
      ? 'bg-gradient-to-b from-[#ffecd2] to-[#F5F5F7]'
      : 'bg-[#F5F5F7]';
  
  return React.createElement('div', {
    className: 'min-h-screen flex flex-col ' + bgColor,
    style: {
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }
  },
    // ====== STICKY 영역: 헤더 ======
    React.createElement('div', {
      className: 'sticky top-0 z-40 ' + (isNightMode ? 'bg-[#0f0f1a]/95' : 'bg-[#F5F5F7]/95') + ' backdrop-blur-md',
      style: {
        paddingTop: 'max(env(safe-area-inset-top), 12px)'
      }
    },
      // 헤더
      React.createElement('div', {
        className: 'px-4 pb-2'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between min-h-[44px]'
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
          
          // 오른쪽: 컨디션 퀵체인지 + 설정
          React.createElement('div', { className: 'flex items-center gap-1' },
            // 컨디션 퀵체인지 (새 컴포넌트)
            React.createElement(ConditionQuickChange, {
              condition: condition,
              onConditionChange: handleConditionChange,
              darkMode: isNightMode,
              variant: 'mini'
            }),
            
            // 설정
            React.createElement('button', {
              className: 'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ' +
                (isNightMode ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-gray-200 active:bg-gray-300'),
              onClick: function() { if (setView) setView('SETTINGS'); }
            },
              React.createElement(Settings, { 
                size: 22, 
                className: isNightMode ? 'text-gray-400' : 'text-gray-500'
              })
            )
          )
        )
      ),
      
      // 긴급 알림 (있을 때만)
      !isNightMode && urgentEvent && React.createElement(UrgentEventBanner, {
        event: urgentEvent.event,
        diffMin: urgentEvent.diffMin
      }),
      
      // 알프레도 아일랜드 (아침/오후에만)
      !isNightMode && !isEveningMode && React.createElement(AlfredoIslandMinimal, {
        tasks: tasks,
        events: todayEvents,
        condition: condition,
        userName: userName,
        urgentEvent: urgentEvent,
        onOpenChat: onOpenChat,
        dnaProfile: dnaProfile,
        dnaSuggestions: dnaSuggestions,
        dnaAnalysisPhase: dnaAnalysisPhase,
        getMorningBriefing: getMorningBriefing,
        getEveningMessage: getEveningMessage,
        getStressLevel: getStressLevel,
        getBestFocusTime: getBestFocusTime,
        getPeakHours: getPeakHours,
        getChronotype: getChronotype
      }),
      
      // 하단 그라데이션 페이드
      !isNightMode && !isEveningMode && React.createElement('div', {
        className: 'h-4 bg-gradient-to-b from-[#F5F5F7]/95 to-transparent'
      })
    ),
    
    // ====== 스크롤 콘텐츠 영역 ======
    isNightMode
      ? React.createElement(NightModeView, {
          userName: userName,
          tasks: tasks,
          onViewDetails: function() { setForceNormalView(true); }
        })
      : isEveningMode
        ? // 저녁 브리핑 모드
          React.createElement('div', { 
            className: 'flex-1 overflow-y-auto px-4',
            style: {
              paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
              WebkitOverflowScrolling: 'touch'
            }
          },
            React.createElement(EveningBriefing, {
              darkMode: false,
              condition: condition,
              tasks: tasks,
              events: events,
              userName: userName,
              onTapAlfredo: onOpenChat,
              onViewTomorrow: function() { if (setView) setView('CALENDAR'); }
            }),
            
            // 오늘 타임라인 (간략)
            React.createElement(TodayTimelineMinimal, {
              events: todayEvents,
              tasks: tasks,
              onStartTask: handleStartTask,
              onOpenEvent: onOpenEvent,
              onAddTask: onOpenAddTask,
              compact: true
            })
          )
        : // 아침/오후 일반 모드
          React.createElement('div', { 
            className: 'flex-1 overflow-y-auto',
            style: {
              paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
              WebkitOverflowScrolling: 'touch'
            }
          },
            // DNA 인사이트 카드
            React.createElement(DNAInsightCard, {
              dnaProfile: dnaProfile,
              dnaAnalysisPhase: dnaAnalysisPhase,
              dnaSuggestions: dnaSuggestions,
              getBestFocusTime: getBestFocusTime,
              getChronotype: getChronotype,
              getStressLevel: getStressLevel,
              getPeakHours: getPeakHours
            }),
            
            // 지금 이거부터
            React.createElement('div', { className: 'mx-4 mt-2' },
              React.createElement(FocusNowCard, {
                task: focusTask,
                darkMode: false,
                onStart: handleStartTask,
                onStartBodyDoubling: handleStartBodyDoubling,
                onLater: function() {},
                onAddTask: onOpenAddTask
              })
            ),
            
            // 오늘 타임라인
            React.createElement(TodayTimelineMinimal, {
              events: todayEvents,
              tasks: tasks,
              onStartTask: handleStartTask,
              onOpenEvent: onOpenEvent,
              onAddTask: onOpenAddTask
            })
          ),
    
    // 🔔 플로팅 넛지 (선제적 대화)
    !isNightMode && nudgeData.nudges.length > 0 && React.createElement(NudgeStack, {
      nudges: nudgeData.nudges,
      onDismiss: function() {},
      onAction: handleNudgeAction,
      darkMode: isNightMode
    }),
    
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
