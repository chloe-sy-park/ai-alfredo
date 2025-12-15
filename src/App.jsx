import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, Calendar, Briefcase, Heart, MoreHorizontal, MessageSquare,
  Settings, X, Menu, Smile, Zap, Battery, Users, Plus, Edit3
} from 'lucide-react';

// 페이지 컴포넌트
import HomePage from './components/home/HomePage';
import WorkPage from './components/work/WorkPage';
import CalendarPage from './components/calendar/CalendarPage';
import LifePage from './components/life/LifePage';
import MorePage from './components/more/MorePage';
import AlfredoChat from './components/chat/AlfredoChat';
import FocusPage from './components/focus/FocusPage';
import SettingsPage from './components/settings/SettingsPage';
import WeeklyReviewPage from './components/review/WeeklyReviewPage';
import HabitHeatmapPage from './components/review/HabitHeatmapPage';
import EnergyRhythmPage from './components/review/EnergyRhythmPage';
import ProjectDashboardPage from './components/projects/ProjectDashboardPage';
import InboxPage from './components/work/InboxPage';

// 모달 컴포넌트
import EventModal from './components/modals/EventModal';
import TaskModal from './components/modals/TaskModal';
import AddTaskModal from './components/modals/AddTaskModal';
import RoutineManagerModal from './components/modals/RoutineManagerModal';
import SearchModal from './components/modals/SearchModal';
import QuickCaptureModal from './components/modals/QuickCaptureModal';
import GoogleAuthModal from './components/modals/GoogleAuthModal';

// 알림
import { SmartNotificationToast, NotificationCenter } from './components/notifications';

// 훅
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import { useSmartNotifications } from './hooks/useSmartNotifications';
import { useTimeTracking } from './hooks/useTimeTracking';

// 데이터
import { mockTasks, mockProjects, mockRoutines, mockWeather, mockRelationships } from './data/mockData';

// 상수
import { COLORS } from './constants/colors';

// 기분 기록 모달 컴포넌트
var MoodLogModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var mood = props.mood;
  var energy = props.energy;
  var setMood = props.setMood;
  var setEnergy = props.setEnergy;
  
  if (!isOpen) return null;
  
  var moods = [
    { value: 1, emoji: '😫', label: '힘듦' },
    { value: 2, emoji: '😔', label: '별로' },
    { value: 3, emoji: '😐', label: '보통' },
    { value: 4, emoji: '🙂', label: '좋음' },
    { value: 5, emoji: '😄', label: '최고' }
  ];
  
  var energyLevels = [
    { value: 1, label: '방전', color: 'text-red-400' },
    { value: 2, label: '부족', color: 'text-amber-400' },
    { value: 3, label: '보통', color: 'text-yellow-400' },
    { value: 4, label: '충분', color: 'text-emerald-400' },
    { value: 5, label: '최고', color: 'text-green-400' }
  ];
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: (darkMode ? 'bg-gray-800' : 'bg-white') + ' rounded-2xl p-6 max-w-sm w-full',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h3', { className: textPrimary + ' text-xl font-bold flex items-center gap-2' },
          React.createElement('span', null, '🐧'),
          '오늘 컨디션 기록'
        ),
        React.createElement('button', { onClick: onClose, className: textSecondary },
          React.createElement(X, { size: 20 })
        )
      ),
      
      // 기분
      React.createElement('div', { className: 'mb-6' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-3' }, '기분이 어때요?'),
        React.createElement('div', { className: 'flex justify-between' },
          moods.map(function(m) {
            var isSelected = mood === m.value;
            return React.createElement('button', {
              key: m.value,
              onClick: function() { if (setMood) setMood(m.value); },
              className: 'flex flex-col items-center p-3 rounded-xl transition-all ' +
                (isSelected 
                  ? 'bg-[#A996FF]/20 scale-110 ring-2 ring-[#A996FF]' 
                  : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'))
            },
              React.createElement('span', { className: 'text-2xl' }, m.emoji),
              React.createElement('span', { className: textSecondary + ' text-xs mt-1' }, m.label)
            );
          })
        )
      ),
      
      // 에너지
      React.createElement('div', { className: 'mb-6' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-3' }, '에너지 레벨은요?'),
        React.createElement('div', { className: 'flex justify-between' },
          energyLevels.map(function(e) {
            var isSelected = energy === e.value;
            return React.createElement('button', {
              key: e.value,
              onClick: function() { if (setEnergy) setEnergy(e.value); },
              className: 'flex flex-col items-center p-3 rounded-xl transition-all ' +
                (isSelected 
                  ? 'bg-[#A996FF]/20 scale-110 ring-2 ring-[#A996FF]' 
                  : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'))
            },
              React.createElement(e.value <= 2 ? Battery : Zap, { 
                size: 24, 
                className: isSelected ? e.color : textSecondary 
              }),
              React.createElement('span', { className: textSecondary + ' text-xs mt-1' }, e.label)
            );
          })
        )
      ),
      
      // 저장 버튼
      React.createElement('button', {
        onClick: onClose,
        className: 'w-full py-3 bg-[#A996FF] text-white rounded-xl font-bold hover:bg-[#8B7CF7] transition-all'
      }, '저장하기')
    )
  );
};

// 연락처 추가 모달 컴포넌트
var AddRelationshipModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var onAdd = props.onAdd;
  
  var nameState = useState('');
  var name = nameState[0];
  var setName = nameState[1];
  
  var relationState = useState('친구');
  var relation = relationState[0];
  var setRelation = relationState[1];
  
  if (!isOpen) return null;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var inputBg = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
  
  var relations = ['가족', '친구', '직장동료', '지인', '기타'];
  
  var handleAdd = function() {
    if (name.trim() && onAdd) {
      onAdd({
        id: 'rel-' + Date.now(),
        name: name.trim(),
        relation: relation,
        lastContact: new Date().toISOString(),
        contactFrequency: 30
      });
      setName('');
      onClose();
    }
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: (darkMode ? 'bg-gray-800' : 'bg-white') + ' rounded-2xl p-6 max-w-sm w-full',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h3', { className: textPrimary + ' text-xl font-bold flex items-center gap-2' },
          React.createElement(Users, { size: 20, className: 'text-pink-500' }),
          '연락처 추가'
        ),
        React.createElement('button', { onClick: onClose, className: textSecondary },
          React.createElement(X, { size: 20 })
        )
      ),
      
      // 이름 입력
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-sm mb-2 block' }, '이름'),
        React.createElement('input', {
          type: 'text',
          value: name,
          onChange: function(e) { setName(e.target.value); },
          placeholder: '이름을 입력하세요',
          className: inputBg + ' border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-[#A996FF] ' + textPrimary
        })
      ),
      
      // 관계 선택
      React.createElement('div', { className: 'mb-6' },
        React.createElement('label', { className: textSecondary + ' text-sm mb-2 block' }, '관계'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          relations.map(function(r) {
            var isSelected = relation === r;
            return React.createElement('button', {
              key: r,
              onClick: function() { setRelation(r); },
              className: 'px-4 py-2 rounded-full text-sm font-medium transition-all ' +
                (isSelected 
                  ? 'bg-[#A996FF] text-white' 
                  : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'))
            }, r);
          })
        )
      ),
      
      // 버튼
      React.createElement('div', { className: 'flex gap-3' },
        React.createElement('button', {
          onClick: onClose,
          className: 'flex-1 py-3 ' + (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700') + ' rounded-xl font-medium'
        }, '취소'),
        React.createElement('button', {
          onClick: handleAdd,
          disabled: !name.trim(),
          className: 'flex-1 py-3 bg-[#A996FF] text-white rounded-xl font-bold hover:bg-[#8B7CF7] transition-all disabled:opacity-50'
        }, '추가')
      )
    )
  );
};

// 건강 편집 모달 컴포넌트
var EditHealthModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var darkMode = props.darkMode;
  var healthData = props.healthData || {};
  var onSave = props.onSave;
  
  var waterState = useState(healthData.waterIntake || 0);
  var water = waterState[0];
  var setWater = waterState[1];
  
  var sleepState = useState(healthData.sleepHours || 7);
  var sleep = sleepState[0];
  var setSleep = sleepState[1];
  
  var stepsState = useState(healthData.steps || 0);
  var steps = stepsState[0];
  var setSteps = stepsState[1];
  
  var medicationState = useState(healthData.medication || false);
  var medication = medicationState[0];
  var setMedication = medicationState[1];
  
  if (!isOpen) return null;
  
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var inputBg = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
  
  var handleSave = function() {
    if (onSave) {
      onSave({
        waterIntake: water,
        waterGoal: healthData.waterGoal || 8,
        sleepHours: sleep,
        steps: steps,
        medication: medication
      });
    }
    onClose();
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  },
    React.createElement('div', {
      className: (darkMode ? 'bg-gray-800' : 'bg-white') + ' rounded-2xl p-6 max-w-sm w-full',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h3', { className: textPrimary + ' text-xl font-bold flex items-center gap-2' },
          React.createElement('span', null, '❤️'),
          '건강 데이터 편집'
        ),
        React.createElement('button', { onClick: onClose, className: textSecondary },
          React.createElement(X, { size: 20 })
        )
      ),
      
      // 물 섭취량
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-sm mb-2 block' }, '물 섭취량 (잔)'),
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('button', {
            onClick: function() { setWater(Math.max(0, water - 1)); },
            className: 'w-10 h-10 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' flex items-center justify-center text-lg font-bold ' + textPrimary
          }, '-'),
          React.createElement('span', { className: textPrimary + ' text-2xl font-bold flex-1 text-center' }, water),
          React.createElement('button', {
            onClick: function() { setWater(water + 1); },
            className: 'w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold'
          }, '+')
        )
      ),
      
      // 수면 시간
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-sm mb-2 block' }, '수면 시간'),
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('button', {
            onClick: function() { setSleep(Math.max(0, sleep - 0.5)); },
            className: 'w-10 h-10 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' flex items-center justify-center text-lg font-bold ' + textPrimary
          }, '-'),
          React.createElement('span', { className: textPrimary + ' text-2xl font-bold flex-1 text-center' }, sleep + '시간'),
          React.createElement('button', {
            onClick: function() { setSleep(sleep + 0.5); },
            className: 'w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center text-lg font-bold'
          }, '+')
        )
      ),
      
      // 걸음 수
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-sm mb-2 block' }, '걸음 수'),
        React.createElement('input', {
          type: 'number',
          value: steps,
          onChange: function(e) { setSteps(parseInt(e.target.value) || 0); },
          className: inputBg + ' border rounded-xl px-4 py-3 w-full outline-none focus:ring-2 focus:ring-[#A996FF] ' + textPrimary
        })
      ),
      
      // 약 복용
      React.createElement('div', { className: 'mb-6' },
        React.createElement('button', {
          onClick: function() { setMedication(!medication); },
          className: 'w-full flex items-center justify-between p-3 rounded-xl ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100')
        },
          React.createElement('span', { className: textPrimary + ' font-medium' }, '약 복용 완료'),
          React.createElement('div', {
            className: (medication ? 'bg-emerald-500' : (darkMode ? 'bg-gray-600' : 'bg-gray-300')) + ' w-12 h-7 rounded-full relative transition-colors'
          },
            React.createElement('div', {
              className: 'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ' + (medication ? 'translate-x-5' : 'translate-x-0.5')
            })
          )
        )
      ),
      
      // 저장 버튼
      React.createElement('button', {
        onClick: handleSave,
        className: 'w-full py-3 bg-[#A996FF] text-white rounded-xl font-bold hover:bg-[#8B7CF7] transition-all'
      }, '저장하기')
    )
  );
};

var App = function() {
  // 기본 상태
  var viewState = useState('HOME');
  var view = viewState[0];
  var setView = viewState[1];
  
  var darkModeState = useState(false);
  var darkMode = darkModeState[0];
  var setDarkMode = darkModeState[1];
  
  // 사용자 데이터
  var userNameState = useState('Boss');
  var userName = userNameState[0];
  var setUserName = userNameState[1];
  
  var moodState = useState(3);
  var mood = moodState[0];
  var setMood = moodState[1];
  
  var energyState = useState(3);
  var energy = energyState[0];
  var setEnergy = energyState[1];
  
  // 태스크 & 이벤트
  var tasksState = useState(mockTasks || []);
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  
  var projectsState = useState(mockProjects || []);
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  
  var routinesState = useState(mockRoutines || []);
  var routines = routinesState[0];
  var setRoutines = routinesState[1];
  
  var relationshipsState = useState(mockRelationships || []);
  var relationships = relationshipsState[0];
  var setRelationships = relationshipsState[1];
  
  // 건강 데이터
  var healthDataState = useState({
    waterIntake: 3,
    waterGoal: 8,
    sleepHours: 7,
    steps: 5234,
    medication: false
  });
  var healthData = healthDataState[0];
  var setHealthData = healthDataState[1];
  
  // 날씨
  var weatherState = useState(mockWeather || { temp: 15, condition: '맑음' });
  var weather = weatherState[0];
  var setWeather = weatherState[1];
  
  // 모달 상태
  var showEventModalState = useState(false);
  var showEventModal = showEventModalState[0];
  var setShowEventModal = showEventModalState[1];
  
  var showTaskModalState = useState(false);
  var showTaskModal = showTaskModalState[0];
  var setShowTaskModal = showTaskModalState[1];
  
  var showAddTaskModalState = useState(false);
  var showAddTaskModal = showAddTaskModalState[0];
  var setShowAddTaskModal = showAddTaskModalState[1];
  
  var showRoutineModalState = useState(false);
  var showRoutineModal = showRoutineModalState[0];
  var setShowRoutineModal = showRoutineModalState[1];
  
  var showSearchModalState = useState(false);
  var showSearchModal = showSearchModalState[0];
  var setShowSearchModal = showSearchModalState[1];
  
  var showQuickCaptureState = useState(false);
  var showQuickCapture = showQuickCaptureState[0];
  var setShowQuickCapture = showQuickCaptureState[1];
  
  var showGoogleAuthState = useState(false);
  var showGoogleAuth = showGoogleAuthState[0];
  var setShowGoogleAuth = showGoogleAuthState[1];
  
  var showReminderModalState = useState(false);
  var showReminderModal = showReminderModalState[0];
  var setShowReminderModal = showReminderModalState[1];
  
  // 새로 추가된 모달 상태
  var showMoodLogModalState = useState(false);
  var showMoodLogModal = showMoodLogModalState[0];
  var setShowMoodLogModal = showMoodLogModalState[1];
  
  var showAddRelationshipModalState = useState(false);
  var showAddRelationshipModal = showAddRelationshipModalState[0];
  var setShowAddRelationshipModal = showAddRelationshipModalState[1];
  
  var showEditHealthModalState = useState(false);
  var showEditHealthModal = showEditHealthModalState[0];
  var setShowEditHealthModal = showEditHealthModalState[1];
  
  // 선택된 아이템
  var selectedEventState = useState(null);
  var selectedEvent = selectedEventState[0];
  var setSelectedEvent = selectedEventState[1];
  
  var selectedTaskState = useState(null);
  var selectedTask = selectedTaskState[0];
  var setSelectedTask = selectedTaskState[1];
  
  var selectedReminderState = useState(null);
  var selectedReminder = selectedReminderState[0];
  var setSelectedReminder = selectedReminderState[1];
  
  // 집중 모드
  var focusTaskState = useState(null);
  var focusTask = focusTaskState[0];
  var setFocusTask = focusTaskState[1];
  
  // Google Calendar 훅
  var googleCalendar = useGoogleCalendar();
  var events = googleCalendar.events || [];
  var isConnected = googleCalendar.isConnected;
  var connectGoogle = googleCalendar.connect;
  var disconnectGoogle = googleCalendar.disconnect;
  var addEvent = googleCalendar.addEvent;
  var updateEvent = googleCalendar.updateEvent;
  var deleteEvent = googleCalendar.deleteEvent;
  
  // 알림 훅
  var smartNotifications = useSmartNotifications({
    tasks: tasks,
    events: events,
    mood: mood,
    energy: energy
  });
  
  // 핸들러: 이벤트 열기
  var handleOpenEvent = function(event) {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  
  // 핸들러: 태스크 열기
  var handleOpenTask = function(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  };
  
  // 핸들러: 태스크 추가 모달
  var handleOpenAddTask = function() {
    setShowAddTaskModal(true);
  };
  
  // 핸들러: 채팅 열기
  var handleOpenChat = function() {
    setView('CHAT');
  };
  
  // 핸들러: 인박스 열기
  var handleOpenInbox = function() {
    setView('INBOX');
  };
  
  // 핸들러: 검색 열기
  var handleOpenSearch = function() {
    setShowSearchModal(true);
  };
  
  // 핸들러: 루틴 관리자 열기
  var handleOpenRoutines = function() {
    setShowRoutineModal(true);
  };
  
  // 핸들러: 리마인더 열기
  var handleOpenReminder = function(reminder) {
    setSelectedReminder(reminder);
    setShowReminderModal(true);
  };
  
  // 핸들러: 집중 모드 시작
  var handleStartFocus = function(task) {
    setFocusTask(task);
    setView('FOCUS');
  };
  
  // 핸들러: 태스크 추가
  var handleAddTask = function(newTask) {
    var task = Object.assign({}, newTask, {
      id: newTask.id || ('task-' + Date.now()),
      createdAt: new Date().toISOString(),
      completed: false
    });
    setTasks([task].concat(tasks));
    setShowAddTaskModal(false);
  };
  
  // 핸들러: 태스크 토글 (완료/미완료)
  var handleToggleTask = function(taskId) {
    setTasks(tasks.map(function(t) {
      if (t.id === taskId) {
        return Object.assign({}, t, { 
          completed: !t.completed,
          status: t.status === 'done' ? 'todo' : 'done'
        });
      }
      return t;
    }));
  };
  
  // 핸들러: 태스크 업데이트
  var handleUpdateTask = function(taskId, updates) {
    setTasks(tasks.map(function(t) {
      if (t.id === taskId) {
        return Object.assign({}, t, updates);
      }
      return t;
    }));
    setShowTaskModal(false);
    setSelectedTask(null);
  };
  
  // 핸들러: 태스크 삭제
  var handleDeleteTask = function(taskId) {
    setTasks(tasks.filter(function(t) { return t.id !== taskId; }));
    setShowTaskModal(false);
    setSelectedTask(null);
  };
  
  // 핸들러: 이벤트 저장
  var handleSaveEvent = function(eventData) {
    if (selectedEvent && selectedEvent.id) {
      updateEvent(selectedEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  
  // 핸들러: 이벤트 삭제
  var handleDeleteEvent = function(eventId) {
    deleteEvent(eventId);
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  
  // 핸들러: 연락처 추가
  var handleAddRelationship = function(newRelationship) {
    setRelationships([newRelationship].concat(relationships));
  };
  
  // 핸들러: 건강 데이터 저장
  var handleSaveHealth = function(newHealthData) {
    setHealthData(newHealthData);
  };
  
  // 네비게이션 아이템
  var navItems = [
    { view: 'HOME', icon: Home, label: '홈' },
    { view: 'CALENDAR', icon: Calendar, label: '캘린더' },
    { view: 'WORK', icon: Briefcase, label: '업무' },
    { view: 'LIFE', icon: Heart, label: '일상' },
    { view: 'MORE', icon: MoreHorizontal, label: '더보기' }
  ];
  
  // 네비게이션 숨김 여부
  var hideNavViews = ['CHAT', 'FOCUS', 'SETTINGS', 'WEEKLY_REVIEW', 'HABIT_HEATMAP', 'ENERGY_RHYTHM', 'PROJECT_DASHBOARD', 'INBOX', 'JOURNAL'];
  var showNav = hideNavViews.indexOf(view) === -1;
  
  // 배경색
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  
  // 공통 props
  var commonProps = {
    darkMode: darkMode,
    setDarkMode: setDarkMode,
    setView: setView,
    userName: userName,
    weather: weather,
    mood: mood,
    energy: energy,
    setMood: setMood,
    setEnergy: setEnergy
  };
  
  // 페이지 렌더링
  var renderPage = function() {
    switch (view) {
      case 'HOME':
        return React.createElement(HomePage, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          relationships: relationships,
          onOpenAddTask: handleOpenAddTask,
          onOpenTask: handleOpenTask,
          onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat,
          onOpenInbox: handleOpenInbox,
          onOpenSearch: handleOpenSearch,
          onStartFocus: handleStartFocus,
          onOpenReminder: handleOpenReminder
        }));
        
      case 'WORK':
        return React.createElement(WorkPage, Object.assign({}, commonProps, {
          tasks: tasks,
          setTasks: setTasks,
          events: events,
          projects: projects,
          onOpenAddTask: handleOpenAddTask,
          onOpenTask: handleOpenTask,
          onOpenInbox: handleOpenInbox,
          onOpenChat: handleOpenChat
        }));
        
      case 'CALENDAR':
        return React.createElement(CalendarPage, Object.assign({}, commonProps, {
          events: events,
          tasks: tasks,
          onOpenEvent: handleOpenEvent,
          onOpenTask: handleOpenTask,
          onAddEvent: function() { setSelectedEvent(null); setShowEventModal(true); },
          onBack: function() { setView('HOME'); },
          isConnected: isConnected,
          onConnect: function() { setShowGoogleAuth(true); }
        }));
        
      case 'LIFE':
        return React.createElement(LifePage, Object.assign({}, commonProps, {
          healthData: healthData,
          setHealthData: setHealthData,
          routines: routines,
          setRoutines: setRoutines,
          relationships: relationships,
          onOpenRoutines: handleOpenRoutines,
          onOpenJournal: function() { setShowMoodLogModal(true); },
          onOpenMoodLog: function() { setShowMoodLogModal(true); },
          onAddRelationship: function() { setShowAddRelationshipModal(true); },
          onEditHealth: function() { setShowEditHealthModal(true); }
        }));
        
      case 'MORE':
        return React.createElement(MorePage, Object.assign({}, commonProps, {
          connections: {
            googleCalendar: isConnected,
            gmail: false,
            notion: false,
            slack: false
          },
          onConnect: function(service) { 
            if (service === 'googleCalendar') setShowGoogleAuth(true);
          },
          onDisconnect: function(service) {
            if (service === 'googleCalendar') disconnectGoogle();
          },
          onOpenWeeklyReview: function() { setView('WEEKLY_REVIEW'); },
          onOpenHabitHeatmap: function() { setView('HABIT_HEATMAP'); },
          onOpenEnergyRhythm: function() { setView('ENERGY_RHYTHM'); },
          onOpenProjectDashboard: function() { setView('PROJECT_DASHBOARD'); },
          onOpenSettings: function() { setView('SETTINGS'); },
          gameState: { level: 5, xp: 450, totalXp: 1000 }
        }));
        
      case 'CHAT':
        return React.createElement(AlfredoChat, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          onBack: function() { setView('HOME'); }
        }));
        
      case 'FOCUS':
        return React.createElement(FocusPage, Object.assign({}, commonProps, {
          task: focusTask,
          onComplete: function() { 
            if (focusTask) {
              handleToggleTask(focusTask.id);
            }
            setView('HOME');
          },
          onCancel: function() { setView('HOME'); }
        }));
        
      case 'INBOX':
        return React.createElement(InboxPage, Object.assign({}, commonProps, {
          tasks: tasks,
          setTasks: setTasks,
          onBack: function() { setView('WORK'); },
          onOpenTask: handleOpenTask
        }));
        
      case 'SETTINGS':
        return React.createElement(SettingsPage, Object.assign({}, commonProps, {
          onBack: function() { setView('MORE'); },
          userName: userName,
          setUserName: setUserName,
          connections: {
            googleCalendar: isConnected,
            gmail: false,
            notion: false,
            slack: false
          },
          onConnect: function(service) { 
            if (service === 'googleCalendar') setShowGoogleAuth(true);
          },
          onDisconnect: function(service) {
            if (service === 'googleCalendar') disconnectGoogle();
          }
        }));
        
      case 'WEEKLY_REVIEW':
        return React.createElement(WeeklyReviewPage, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          onBack: function() { setView('MORE'); }
        }));
        
      case 'HABIT_HEATMAP':
        return React.createElement(HabitHeatmapPage, Object.assign({}, commonProps, {
          routines: routines,
          onBack: function() { setView('MORE'); }
        }));
        
      case 'ENERGY_RHYTHM':
        return React.createElement(EnergyRhythmPage, Object.assign({}, commonProps, {
          onBack: function() { setView('MORE'); }
        }));
        
      case 'PROJECT_DASHBOARD':
        return React.createElement(ProjectDashboardPage, Object.assign({}, commonProps, {
          projects: projects,
          tasks: tasks,
          onBack: function() { setView('MORE'); }
        }));
        
      default:
        return React.createElement(HomePage, Object.assign({}, commonProps, {
          tasks: tasks,
          events: events,
          relationships: relationships,
          onOpenAddTask: handleOpenAddTask,
          onOpenTask: handleOpenTask,
          onOpenEvent: handleOpenEvent,
          onOpenChat: handleOpenChat,
          onOpenInbox: handleOpenInbox,
          onOpenSearch: handleOpenSearch,
          onStartFocus: handleStartFocus,
          onOpenReminder: handleOpenReminder
        }));
    }
  };
  
  return React.createElement('div', { className: bgColor + ' min-h-screen' },
    // 메인 콘텐츠
    renderPage(),
    
    // 플로팅 알프레도 버튼
    showNav && React.createElement('button', {
      onClick: handleOpenChat,
      className: 'fixed right-4 bottom-24 w-14 h-14 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full shadow-lg flex items-center justify-center text-2xl z-40 hover:scale-110 transition-transform'
    }, '🐧'),
    
    // 하단 네비게이션
    showNav && React.createElement('nav', {
      className: 'fixed bottom-0 left-0 right-0 h-20 ' + 
        (darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200') + 
        ' backdrop-blur-xl border-t flex items-center justify-around px-4 pb-4 z-50'
    },
      navItems.map(function(item) {
        var isActive = view === item.view;
        return React.createElement('button', {
          key: item.view,
          onClick: function() { setView(item.view); },
          className: 'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ' +
            (isActive 
              ? 'text-[#A996FF] bg-[#A996FF]/10' 
              : (darkMode ? 'text-gray-500' : 'text-gray-400'))
        },
          React.createElement(item.icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 }),
          React.createElement('span', { className: 'text-[10px] font-medium' }, item.label)
        );
      })
    ),
    
    // 모달들
    showEventModal && React.createElement(EventModal, {
      isOpen: showEventModal,
      onClose: function() { setShowEventModal(false); setSelectedEvent(null); },
      event: selectedEvent,
      onSave: handleSaveEvent,
      onDelete: handleDeleteEvent,
      darkMode: darkMode
    }),
    
    showTaskModal && selectedTask && React.createElement(TaskModal, {
      task: selectedTask,
      onClose: function() { setShowTaskModal(false); setSelectedTask(null); },
      onToggle: handleToggleTask,
      onUpdate: handleUpdateTask,
      onDelete: handleDeleteTask,
      onStartFocus: function(task) { handleStartFocus(task); setShowTaskModal(false); },
      darkMode: darkMode
    }),
    
    showAddTaskModal && React.createElement(AddTaskModal, {
      isOpen: showAddTaskModal,
      onClose: function() { setShowAddTaskModal(false); },
      onAdd: handleAddTask,
      projects: projects,
      darkMode: darkMode
    }),
    
    showRoutineModal && React.createElement(RoutineManagerModal, {
      isOpen: showRoutineModal,
      onClose: function() { setShowRoutineModal(false); },
      routines: routines,
      onAddRoutine: function(r) { setRoutines([r].concat(routines)); },
      onUpdateRoutine: function(r) { setRoutines(routines.map(function(x) { return x.id === r.id ? r : x; })); },
      onDeleteRoutine: function(id) { setRoutines(routines.filter(function(x) { return x.id !== id; })); },
      onToggleRoutine: function(id) { setRoutines(routines.map(function(x) { return x.id === id ? Object.assign({}, x, { completed: !x.completed }) : x; })); },
      darkMode: darkMode
    }),
    
    showSearchModal && React.createElement(SearchModal, {
      isOpen: showSearchModal,
      onClose: function() { setShowSearchModal(false); },
      tasks: tasks,
      events: events,
      onSelectTask: function(t) { handleOpenTask(t); setShowSearchModal(false); },
      onSelectEvent: function(e) { handleOpenEvent(e); setShowSearchModal(false); },
      darkMode: darkMode
    }),
    
    showGoogleAuth && React.createElement(GoogleAuthModal, {
      isOpen: showGoogleAuth,
      onClose: function() { setShowGoogleAuth(false); },
      onConnect: connectGoogle,
      darkMode: darkMode
    }),
    
    // 기분 기록 모달
    React.createElement(MoodLogModal, {
      isOpen: showMoodLogModal,
      onClose: function() { setShowMoodLogModal(false); },
      darkMode: darkMode,
      mood: mood,
      energy: energy,
      setMood: setMood,
      setEnergy: setEnergy
    }),
    
    // 연락처 추가 모달
    React.createElement(AddRelationshipModal, {
      isOpen: showAddRelationshipModal,
      onClose: function() { setShowAddRelationshipModal(false); },
      darkMode: darkMode,
      onAdd: handleAddRelationship
    }),
    
    // 건강 편집 모달
    React.createElement(EditHealthModal, {
      isOpen: showEditHealthModal,
      onClose: function() { setShowEditHealthModal(false); },
      darkMode: darkMode,
      healthData: healthData,
      onSave: handleSaveHealth
    }),
    
    // 리마인더 모달
    showReminderModal && selectedReminder && React.createElement('div', {
      className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4',
      onClick: function() { setShowReminderModal(false); setSelectedReminder(null); }
    },
      React.createElement('div', {
        className: (darkMode ? 'bg-gray-800' : 'bg-white') + ' rounded-2xl p-6 max-w-sm w-full',
        onClick: function(e) { e.stopPropagation(); }
      },
        React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
          React.createElement('span', { className: 'text-3xl' }, selectedReminder.icon),
          React.createElement('div', null,
            React.createElement('h3', { className: (darkMode ? 'text-white' : 'text-gray-800') + ' text-xl font-bold' }, selectedReminder.title),
            selectedReminder.subtitle && React.createElement('p', { className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm' }, selectedReminder.subtitle)
          )
        ),
        selectedReminder.type === 'relationship' && selectedReminder.data && React.createElement('div', { className: 'space-y-3 mb-6' },
          React.createElement('button', {
            className: 'w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all'
          }, '📱 전화하기'),
          React.createElement('button', {
            className: 'w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all'
          }, '💬 메시지 보내기')
        ),
        selectedReminder.type === 'deadline' && React.createElement('div', { className: 'space-y-3 mb-6' },
          React.createElement('button', {
            onClick: function() { 
              if (selectedReminder.data) handleStartFocus(selectedReminder.data);
              setShowReminderModal(false);
            },
            className: 'w-full py-3 bg-[#A996FF] text-white rounded-xl font-bold hover:bg-[#8B7CF7] transition-all'
          }, '🎯 지금 시작하기'),
          React.createElement('button', {
            onClick: function() { 
              if (selectedReminder.data) handleOpenTask(selectedReminder.data);
              setShowReminderModal(false);
            },
            className: 'w-full py-3 ' + (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700') + ' rounded-xl font-bold transition-all'
          }, '📝 상세 보기')
        ),
        React.createElement('button', {
          onClick: function() { setShowReminderModal(false); setSelectedReminder(null); },
          className: 'w-full py-3 ' + (darkMode ? 'text-gray-400' : 'text-gray-500') + ' font-medium'
        }, '닫기')
      )
    ),
    
    // 알림 토스트
    React.createElement(SmartNotificationToast, {
      notifications: smartNotifications.notifications,
      onDismiss: smartNotifications.dismissNotification,
      onAction: function(notification, action) {
        if (action === 'start' && notification.task) {
          handleStartFocus(notification.task);
        }
      },
      darkMode: darkMode,
      maxShow: 2
    })
  );
};

export default App;
