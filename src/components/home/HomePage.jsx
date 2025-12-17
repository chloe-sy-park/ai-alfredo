import React, { useState, useMemo, useEffect } from 'react';
import HomeHeader from './HomeHeader';
import AlfredoCard from './AlfredoCard';
import FocusNowCard from './FocusNowCard';
import TodayRemindersCard from './TodayRemindersCard';
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

// 시간대별 알프레도 자동 메시지 생성
var generateAlfredoMessage = function(timeOfDay, userName, completedCount, events) {
  var name = userName || 'Boss';
  var now = new Date();
  
  // 30분 이내 일정 체크
  var upcomingEvent = events.find(function(e) {
    var start = new Date(e.start || e.startTime);
    var diffMin = (start - now) / 1000 / 60;
    return diffMin > 0 && diffMin <= 30;
  });
  
  if (upcomingEvent) {
    var diffMin = Math.round((new Date(upcomingEvent.start || upcomingEvent.startTime) - now) / 1000 / 60);
    return diffMin + '분 뒤 "' + (upcomingEvent.title || upcomingEvent.summary) + '" 일정이 있어요!';
  }
  
  var messages = {
    earlyMorning: [
      '좋은 아침이에요, ' + name + '! 오늘 하루도 제가 함께할게요 ☀️',
      '일찍 일어나셨네요! 물 한 잔 먼저 마셔요 💧'
    ],
    morning: [
      '오전 잘 보내고 계세요? 오늘 할 것들 정리해뒀어요 ✨',
      '좋은 아침이에요! 오늘 뭐부터 시작해볼까요?'
    ],
    lunch: [
      name + ', 점심은 드셨어요? ' + (completedCount > 0 ? '오전에 ' + completedCount + '개 해치웠어요! 👏' : ''),
      '밥 먹고 오후도 화이팅! 🍚'
    ],
    afternoon: [
      '오후도 힘내고 있죠? ' + (completedCount > 0 ? '벌써 ' + completedCount + '개 완료!' : ''),
      '지금 시작해도 충분해요! 💪'
    ],
    evening: [
      name + ', 오늘 하루 수고했어요! ' + (completedCount > 0 ? completedCount + '개나 해냈어요 🎉' : ''),
      '이제 좀 쉬어도 돼요 💜'
    ],
    night: [
      name + ', 이 시간엔 쉬셔야죠. 내일 제가 깨워드릴게요 🌙',
      '오늘 충분히 하셨어요. 푹 쉬세요 💤'
    ]
  };
  
  var options = messages[timeOfDay] || messages.morning;
  return options[Math.floor(Math.random() * options.length)];
};

// 🏠 홈페이지 메인 컴포넌트
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
  
  var showNormalViewState = useState(false);
  var forceShowNormalView = showNormalViewState[0];
  var setForceShowNormalView = showNormalViewState[1];
  
  // 🐧 알프레도 대화 히스토리
  var chatHistoryState = useState([]);
  var chatHistory = chatHistoryState[0];
  var setChatHistory = chatHistoryState[1];
  
  // 알림 상태 (휴식, 집중 등)
  var notificationState = useState(null);
  var notification = notificationState[0];
  var setNotification = notificationState[1];
  
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
  var isEveningOrNight = timeOfDay === 'evening' || timeOfDay === 'night';
  
  // 통계
  var completedCount = useMemo(function() {
    return tasks.filter(function(t) { return t.completed; }).length;
  }, [tasks]);
  
  // 알프레도 자동 메시지 (시간대별)
  var lastAutoMessageHour = useState(-1);
  
  useEffect(function() {
    var currentHour = new Date().getHours();
    
    // 시간대가 바뀌었을 때만 자동 메시지
    if (lastAutoMessageHour[0] !== currentHour) {
      var newTimeOfDay = getTimeOfDay();
      var autoMsg = generateAlfredoMessage(newTimeOfDay, userName, completedCount, events);
      
      // 첫 메시지거나 시간대가 바뀌었을 때
      if (chatHistory.length === 0 || lastAutoMessageHour[0] === -1) {
        setChatHistory(function(prev) {
          return prev.concat([{
            type: 'alfredo',
            text: autoMsg,
            time: new Date().toISOString()
          }]);
        });
      }
      
      lastAutoMessageHour[1](currentHour);
    }
  }, [timeOfDay, userName, completedCount, events]);
  
  // Apple 스타일 배경색
  var bgColor = isNightMode 
    ? 'bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]'
    : (darkMode ? 'bg-[#1D1D1F]' : 'bg-[#F5F5F7]');
  
  // 컨디션 변경 → 대화 기록 추가
  var handleConditionChange = function(newCondition) {
    setCondition(newCondition);
    if (setMood) setMood(newCondition);
    
    // 액션 기록
    var conditionLabels = ['', '😫 아파요', '😔 힘들어요', '😐 보통', '😊 좋아요', '🔥 최고!'];
    setChatHistory(function(prev) {
      return prev.concat([{
        type: 'action',
        text: 'Boss가 컨디션을 "' + conditionLabels[newCondition] + '"로 변경했어요',
        time: new Date().toISOString()
      }]);
    });
    
    // 알프레도 반응
    setTimeout(function() {
      var responses = {
        1: '아이고... 무리하지 마세요. 오늘은 꼭 필요한 것만 해요 💜',
        2: '힘드시구나... 잠깐 쉬었다 해도 괜찮아요',
        3: '알겠어요! 천천히 해나가요 ✨',
        4: '오 컨디션 좋으시네요! 오늘 뭐 해볼까요? 💪',
        5: '와 최고 컨디션! 오늘 좀 달려볼까요? 🔥'
      };
      
      setChatHistory(function(prev) {
        return prev.concat([{
          type: 'alfredo',
          text: responses[newCondition] || '알겠어요!',
          time: new Date().toISOString()
        }]);
      });
    }, 500);
    
    if (gamification && gamification.addXp) {
      gamification.addXp(5, '컨디션 기록');
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
  
  // 오늘 통계
  var todayStats = useMemo(function() {
    var completed = tasks.filter(function(t) { return t.completed; }).length;
    var total = tasks.length;
    return { completed: completed, total: total };
  }, [tasks]);
  
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
    
    // 예정된 시간
    var scheduled = incompleteTasks.filter(function(t) { return t.scheduledTime; })
      .sort(function(a, b) { return a.scheduledTime.localeCompare(b.scheduledTime); });
    if (scheduled.length > 0) return scheduled[0];
    
    return incompleteTasks[0];
  }, [tasks]);
  
  // 리마인더 목록 + 긴급 카운트
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
        
        // 긴급 (24시간 이내)
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
    
    // 샘플 데이터 (실제 데이터가 부족할 때)
    if (items.length < 2) {
      items.push({
        id: 'sample-1',
        type: 'meeting',
        title: '미팅',
        dueDate: null
      });
      items.push({
        id: 'sample-2',
        type: 'email',
        title: '회신',
        dueDate: null
      });
      items.push({
        id: 'sample-3',
        type: 'call',
        title: '엄마 연락',
        dueDate: null
      });
    }
    
    return {
      items: items.slice(0, 5),
      urgentCount: urgentCount
    };
  }, [tasks]);
  
  var reminders = remindersData.items;
  var urgentCount = remindersData.urgentCount;
  
  // 알림 핸들러
  var handleNotificationAction = function(action) {
    if (action === 'rest') {
      // 휴식 시작
      if (onStartFocus) {
        onStartFocus({ type: 'rest', duration: 5 });
      }
    }
    // 알림 닫기
    setNotification(null);
  };
  
  // 태스크 시작 → 대화 기록
  var handleStartTask = function(task) {
    if (!task) return;
    
    // 액션 기록
    setChatHistory(function(prev) {
      return prev.concat([{
        type: 'action',
        text: 'Boss가 "' + task.title + '" 시작!',
        time: new Date().toISOString()
      }]);
    });
    
    // 알프레도 응원
    setTimeout(function() {
      var cheers = [
        '화이팅! 💪',
        '집중 모드 돌입! 🎯',
        '잘할 수 있어요! ✨',
        '좋아요! 한번 해봐요! 🚀'
      ];
      setChatHistory(function(prev) {
        return prev.concat([{
          type: 'alfredo',
          text: cheers[Math.floor(Math.random() * cheers.length)],
          time: new Date().toISOString()
        }]);
      });
    }, 300);
    
    if (onStartFocus) {
      onStartFocus(task);
    } else if (onOpenTask) {
      onOpenTask(task);
    }
  };
  
  // 퀵액션 처리 → 대화 기록
  var handleQuickAction = function(actionId) {
    switch (actionId) {
      case 'addTask':
        if (onOpenAddTask) onOpenAddTask();
        break;
      case 'addEvent':
        if (setView) setView('CALENDAR');
        break;
      case 'water':
        // 액션 기록
        setChatHistory(function(prev) {
          return prev.concat([{
            type: 'action',
            text: 'Boss가 물 마시기 완료! 💧',
            time: new Date().toISOString()
          }]);
        });
        setTimeout(function() {
          setChatHistory(function(prev) {
            return prev.concat([{
              type: 'alfredo',
              text: '잘했어요! 수분 보충 중요해요 💧✨',
              time: new Date().toISOString()
            }]);
          });
        }, 300);
        if (onCompleteRoutine) onCompleteRoutine({ id: 'water', title: '물 마시기' });
        if (gamification && gamification.addXp) {
          gamification.addXp(10, '💧 물 마시기');
        }
        break;
      case 'vitamin':
        setChatHistory(function(prev) {
          return prev.concat([{
            type: 'action',
            text: 'Boss가 영양제 복용! 💊',
            time: new Date().toISOString()
          }]);
        });
        setTimeout(function() {
          setChatHistory(function(prev) {
            return prev.concat([{
              type: 'alfredo',
              text: '건강 챙기기 최고! 💪',
              time: new Date().toISOString()
            }]);
          });
        }, 300);
        if (onCompleteRoutine) onCompleteRoutine({ id: 'vitamin', title: '영양제' });
        if (gamification && gamification.addXp) {
          gamification.addXp(10, '💊 영양제');
        }
        break;
      case 'rest':
        setChatHistory(function(prev) {
          return prev.concat([{
            type: 'action',
            text: 'Boss가 잠깐 휴식 시작 ☕',
            time: new Date().toISOString()
          }]);
        });
        if (onStartFocus) onStartFocus({ type: 'rest', duration: 5 });
        break;
      default:
        break;
    }
  };
  
  // 알프레도에게 메시지 보내기
  var handleSendMessage = function(text) {
    // 유저 메시지 추가
    setChatHistory(function(prev) {
      return prev.concat([{
        type: 'user',
        text: text,
        time: new Date().toISOString()
      }]);
    });
    
    // 알프레도 응답 (간단한 로컬 응답)
    setTimeout(function() {
      var responses = [
        '네, ' + userName + '! 뭐든 도와드릴게요 😊',
        '알겠어요! 더 필요한 거 있으면 말씀해주세요 ✨',
        '좋은 생각이에요! 👍',
        '음... 그건 채팅에서 더 자세히 얘기해볼까요?'
      ];
      
      setChatHistory(function(prev) {
        return prev.concat([{
          type: 'alfredo',
          text: responses[Math.floor(Math.random() * responses.length)],
          time: new Date().toISOString()
        }]);
      });
    }, 800);
  };
  
  // 내일 준비 완료
  var handleReadyForTomorrow = function() {
    setChatHistory(function(prev) {
      return prev.concat([{
        type: 'action',
        text: 'Boss가 하루 마무리 완료! 🌙',
        time: new Date().toISOString()
      }]);
    });
    
    setTimeout(function() {
      setChatHistory(function(prev) {
        return prev.concat([{
          type: 'alfredo',
          text: '좋은 꿈 꿔요, ' + userName + '! 내일 봐요 💜',
          time: new Date().toISOString()
        }]);
      });
    }, 500);
    
    if (gamification && gamification.addXp) {
      gamification.addXp(20, '🌙 하루 마무리');
    }
  };
  
  // 🌙 나이트 모드 렌더링
  if (isNightMode) {
    return React.createElement('div', { className: bgColor + ' min-h-screen' },
      // 헤더
      React.createElement(HomeHeader, {
        darkMode: true,
        condition: condition,
        setCondition: handleConditionChange,
        weather: weather,
        level: gamification.level || 1,
        userName: userName,
        tasks: tasks,
        events: events,
        onSelectTask: onOpenTask,
        onSelectEvent: onOpenEvent,
        onOpenSettings: function() { handleNavigate('SETTINGS'); }
      }),
      
      // 🐧 알프레도 카드 (나이트 모드)
      React.createElement('div', { className: 'max-w-3xl mx-auto px-4 pt-4' },
        React.createElement(AlfredoCard, {
          darkMode: true,
          userName: userName,
          tasks: tasks,
          events: events,
          condition: condition,
          notification: notification,
          onNotificationAction: handleNotificationAction,
          chatHistory: chatHistory,
          onSendMessage: handleSendMessage
        })
      ),
      
      // 나이트 모드 뷰
      React.createElement(NightModeView, {
        darkMode: true,
        userName: userName,
        tasks: tasks,
        events: events,
        focusMinutes: gamification.gameData?.focusMinutes || 0,
        onReadyForTomorrow: handleReadyForTomorrow,
        onViewDetails: function() { setForceShowNormalView(true); }
      }),
      
      // 채팅 플로팅 버튼만
      React.createElement(ChatFloating, {
        onClick: onOpenChat,
        darkMode: true
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
        darkMode: true,
        newLevel: gamification.levelUp.level,
        levelInfo: gamification.levelUp.info
      })
    );
  }
  
  // ☀️ 일반 모드 렌더링 - 새 레이아웃
  return React.createElement('div', { className: bgColor + ' min-h-screen' },
    // 고정 헤더
    React.createElement(HomeHeader, {
      darkMode: darkMode,
      condition: condition,
      setCondition: handleConditionChange,
      weather: weather,
      level: gamification.level || 1,
      userName: userName,
      tasks: tasks,
      events: events,
      onSelectTask: onOpenTask,
      onSelectEvent: onOpenEvent,
      onOpenSettings: function() { handleNavigate('SETTINGS'); }
    }),
    
    // 메인 콘텐츠 - 세로 배치
    React.createElement('div', { 
      className: 'max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-4 pb-28 space-y-5'
    },
      // 1️⃣ 알프레도 카드 (알림 통합 + 플로팅 채팅)
      React.createElement(AlfredoCard, {
        darkMode: darkMode,
        userName: userName,
        tasks: tasks,
        events: events,
        condition: condition,
        notification: notification,
        onNotificationAction: handleNotificationAction,
        chatHistory: chatHistory,
        onSendMessage: handleSendMessage
      }),
      
      // 2️⃣ 오늘 잊지마세요 + Today 기분/에너지
      React.createElement(TodayRemindersCard, {
        darkMode: darkMode,
        reminders: reminders,
        urgentCount: urgentCount,
        condition: condition,
        onConditionChange: handleConditionChange,
        onReminderClick: function(reminder) {
          console.log('Reminder clicked:', reminder);
        }
      }),
      
      // 3️⃣ 지금 이거부터 (AI 추천)
      React.createElement(FocusNowCard, {
        task: focusTask,
        darkMode: darkMode,
        onStart: handleStartTask,
        onLater: function() {}
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
