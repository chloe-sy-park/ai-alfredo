import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Home, Calendar, Briefcase, MessageCircle, Settings, Heart } from 'lucide-react';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { generateBriefing as generateAlfredoBriefing } from './utils/briefingEngine';
import FloatingCaptureButton from './components/FloatingCaptureButton';
import QuickCaptureModal from './components/modals/QuickCaptureModal';
import NotificationToast from './components/NotificationToast';

// Lazy load pages
var NewHomePage = lazy(function() { return import('./components/modes/NewHomePage'); });
var CalendarPage = lazy(function() { return import('./components/calendar/CalendarPage'); });
var WorkPage = lazy(function() { return import('./components/work/WorkPage'); });
var LifePage = lazy(function() { return import('./pages/Life'); });
var ChatPage = lazy(function() { return import('./components/chat/ChatPage'); });
var SettingsPage = lazy(function() { return import('./components/settings/SettingsPage'); });
var OnboardingPage = lazy(function() { return import('./components/onboarding/OnboardingPage'); });

// Lazy load modals
var TaskModal = lazy(function() { return import('./components/modals/TaskModal'); });
var AddTaskModal = lazy(function() { return import('./components/modals/AddTaskModal'); });
var EditProjectModal = lazy(function() { return import('./components/modals/EditProjectModal'); });
var ProjectModal = lazy(function() { return import('./components/modals/ProjectModal'); });

// Page Loading component
var PageLoading = function() {
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-background' },
    React.createElement('div', { className: 'text-center' },
      React.createElement('div', { className: 'w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' }),
      React.createElement('p', { className: 'text-neutral-500' }, '로딩 중...')
    )
  );
};

// 기본 프로젝트
var DEFAULT_PROJECTS = [
  { id: 'inbox', name: '인박스', color: '#6B7280', icon: '📥' },
  { id: 'work', name: '업무', color: '#3B82F6', icon: '💼' },
  { id: 'personal', name: '개인', color: '#10B981', icon: '🏠' }
];

// 기본 태스크
var DEFAULT_TASKS = [
  { id: 1, title: '알프레도 시작하기', completed: false, priority: 'high', project: 'inbox', dueDate: null, estimatedMinutes: 15 },
  { id: 2, title: '오늘의 Top 3 설정하기', completed: false, priority: 'medium', project: 'work', dueDate: new Date().toISOString().split('T')[0], estimatedMinutes: 10 },
  { id: 3, title: '운동 30분', completed: false, priority: 'medium', project: 'personal', dueDate: new Date().toISOString().split('T')[0], estimatedMinutes: 30 }
];

// 기본 이벤트
var DEFAULT_EVENTS = [
  { id: '1', title: '팀 스탠드업', startTime: '10:00', location: '회의실 A', importance: 'mid' },
  { id: '2', title: '프로젝트 리뷰', startTime: '14:00', location: 'Zoom', importance: 'high' },
  { id: '3', title: '1:1 미팅', startTime: '16:30', location: '카페', importance: 'low' }
];

// ADHD 훅
import { useDayEndCare } from './components/adhd/useDayEndCare';
import { useTimeEstimator } from './components/adhd/useTimeEstimator';
import { TimeResultToast } from './components/adhd/TimeEstimatorUI';

function App() {
  // 기본 상태
  var pageState = useState('home');
  var currentPage = pageState[0];
  var setCurrentPage = pageState[1];
  
  var onboardingState = useState(function() {
    return loadFromStorage('alfredo_onboarding_complete') || false;
  });
  var onboardingComplete = onboardingState[0];
  var setOnboardingComplete = onboardingState[1];
  
  // 데이터 상태
  var tasksState = useState(function() {
    return loadFromStorage('alfredo_tasks') || DEFAULT_TASKS;
  });
  var tasks = tasksState[0];
  var setTasks = tasksState[1];
  
  var projectsState = useState(function() {
    return loadFromStorage('alfredo_projects') || DEFAULT_PROJECTS;
  });
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  
  var eventsState = useState(DEFAULT_EVENTS);
  var events = eventsState[0];
  
  // 🌙 저녁 케어 훅
  var dayEndCare = useDayEndCare();
  var triggerDayEndCare = dayEndCare.triggerManually;
  
  // ⏱️ 시간 추정 코치 훅
  var timeEstimator = useTimeEstimator();
  var startTimeTimer = timeEstimator.startTimer;
  var stopTimeTimer = timeEstimator.stopTimer;
  var getSuggestedTime = timeEstimator.getSuggestedTime;
  var timeLastResult = timeEstimator.lastResult;
  var clearTimeResult = timeEstimator.clearLastResult;
  
  // URL 기반 라우팅
  useEffect(function() {
    var path = window.location.pathname;
    if (path === '/calendar') setCurrentPage('calendar');
    else if (path === '/work') setCurrentPage('work');
    else if (path === '/life') setCurrentPage('life');
    else if (path === '/chat') setCurrentPage('chat');
    else if (path === '/settings') setCurrentPage('settings');
  }, []);
  
  // 온보딩 체크
  if (!onboardingComplete) {
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-background' },
      React.createElement(Suspense, { fallback: React.createElement(PageLoading) },
        React.createElement(OnboardingPage, {
          onComplete: function() {
            saveToStorage('alfredo_onboarding_complete', true);
            setOnboardingComplete(true);
          }
        })
      )
    );
  }
  
  // 모달 상태
  var quickCaptureState = useState(false);
  var showQuickCapture = quickCaptureState[0];
  var setShowQuickCapture = quickCaptureState[1];
  
  var taskModalState = useState({ isOpen: false, task: null });
  var taskModal = taskModalState[0];
  var setTaskModal = taskModalState[1];
  
  var addTaskModalState = useState(false);
  var showAddTaskModal = addTaskModalState[0];
  var setShowAddTaskModal = addTaskModalState[1];
  
  var projectModalState = useState({ isOpen: false, project: null });
  var projectModal = projectModalState[0];
  var setProjectModal = projectModalState[1];
  
  var editProjectModalState = useState({ isOpen: false, project: null });
  var editProjectModal = editProjectModalState[0];
  var setEditProjectModal = editProjectModalState[1];
  
  // 알림 상태
  var notificationState = useState(null);
  var notification = notificationState[0];
  var setNotification = notificationState[1];
  
  // 알림 표시 함수
  var showNotification = useCallback(function(message, type) {
    setNotification({ message: message, type: type || 'info' });
    setTimeout(function() { setNotification(null); }, 3000);
  }, []);
  
  // 태스크 저장
  useEffect(function() {
    saveToStorage('alfredo_tasks', tasks);
  }, [tasks]);
  
  // 프로젝트 저장
  useEffect(function() {
    saveToStorage('alfredo_projects', projects);
  }, [projects]);
  
  // 태스크 완료 처리
  var handleCompleteTask = useCallback(function(taskId) {
    setTasks(function(prev) {
      return prev.map(function(task) {
        if (task.id === taskId) {
          var newCompleted = !task.completed;
          if (newCompleted) {
            stopTimeTimer(taskId, task.category);
            showNotification('태스크 완료! 🎉', 'success');
          }
          return Object.assign({}, task, { completed: newCompleted });
        }
        return task;
      });
    });
  }, [showNotification, stopTimeTimer]);
  
  // 태스크 추가
  var handleAddTask = useCallback(function(taskData) {
    var newTask = Object.assign({
      id: Date.now(),
      completed: false,
      createdAt: new Date().toISOString()
    }, taskData);
    setTasks(function(prev) { return prev.concat([newTask]); });
    showNotification('태스크 추가됨', 'success');
  }, [showNotification]);
  
  // 태스크 수정
  var handleUpdateTask = useCallback(function(taskId, updates) {
    setTasks(function(prev) {
      return prev.map(function(task) {
        if (task.id === taskId) {
          return Object.assign({}, task, updates);
        }
        return task;
      });
    });
    showNotification('태스크 수정됨', 'success');
  }, [showNotification]);
  
  // 태스크 삭제
  var handleDeleteTask = useCallback(function(taskId) {
    setTasks(function(prev) {
      return prev.filter(function(task) { return task.id !== taskId; });
    });
    showNotification('태스크 삭제됨', 'info');
  }, [showNotification]);
  
  // 프로젝트 추가
  var handleAddProject = useCallback(function(projectData) {
    var newProject = Object.assign({
      id: 'project_' + Date.now(),
      createdAt: new Date().toISOString()
    }, projectData);
    setProjects(function(prev) { return prev.concat([newProject]); });
    showNotification('프로젝트 추가됨', 'success');
  }, [showNotification]);
  
  // 프로젝트 수정
  var handleUpdateProject = useCallback(function(projectId, updates) {
    setProjects(function(prev) {
      return prev.map(function(project) {
        if (project.id === projectId) {
          return Object.assign({}, project, updates);
        }
        return project;
      });
    });
    showNotification('프로젝트 수정됨', 'success');
  }, [showNotification]);
  
  // 프로젝트 삭제
  var handleDeleteProject = useCallback(function(projectId) {
    setProjects(function(prev) {
      return prev.filter(function(project) { return project.id !== projectId; });
    });
    setTasks(function(prev) {
      return prev.map(function(task) {
        if (task.project === projectId) {
          return Object.assign({}, task, { project: 'inbox' });
        }
        return task;
      });
    });
    showNotification('프로젝트 삭제됨', 'info');
  }, [showNotification]);
  
  // 퀵캡처 처리
  var handleQuickCapture = useCallback(function(data) {
    if (data.type === 'task') {
      handleAddTask({
        title: data.content,
        priority: 'medium',
        project: 'inbox'
      });
    }
    setShowQuickCapture(false);
  }, [handleAddTask]);
  
  // 네비게이션
  var handleNavigate = useCallback(function(page) {
    setCurrentPage(page);
  }, []);
  
  // 태스크 클릭
  var handleTaskClick = useCallback(function(taskId) {
    var task = tasks.find(function(t) { return t.id === taskId; });
    if (task) {
      setTaskModal({ isOpen: true, task: task });
    }
  }, [tasks]);
  
  // 네비게이션 아이템
  var navItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'calendar', icon: Calendar, label: '캘린더' },
    { id: 'work', icon: Briefcase, label: '업무' },
    { id: 'life', icon: Heart, label: '라이프' },
    { id: 'chat', icon: MessageCircle, label: '알프레도' }
  ];
  
  // 페이지 렌더링
  var renderPage = function() {
    return React.createElement(Suspense, { fallback: React.createElement(PageLoading) },
      // 홈 페이지 - NewHomePage 사용
      currentPage === 'home' && React.createElement(NewHomePage, {
        tasks: tasks,
        projects: projects,
        events: events,
        onNavigate: handleNavigate,
        onTaskClick: handleTaskClick
      }),
      
      currentPage === 'calendar' && React.createElement(CalendarPage, {
        tasks: tasks,
        projects: projects,
        onTaskClick: function(task) { setTaskModal({ isOpen: true, task: task }); },
        onAddTask: handleAddTask
      }),
      
      currentPage === 'work' && React.createElement(WorkPage, {
        tasks: tasks,
        projects: projects,
        onTaskClick: function(task) { setTaskModal({ isOpen: true, task: task }); },
        onCompleteTask: handleCompleteTask,
        onAddTask: function() { setShowAddTaskModal(true); },
        onAddProject: function() { setProjectModal({ isOpen: true, project: null }); },
        onEditProject: function(project) { setEditProjectModal({ isOpen: true, project: project }); },
        startTimeTimer: startTimeTimer,
        stopTimeTimer: stopTimeTimer,
        getSuggestedTime: getSuggestedTime
      }),
      
      currentPage === 'life' && React.createElement(LifePage, {
        tasks: tasks.filter(function(t) { return t.project === 'personal'; }),
        onTaskClick: function(task) { setTaskModal({ isOpen: true, task: task }); }
      }),
      
      currentPage === 'chat' && React.createElement(ChatPage, {
        tasks: tasks,
        projects: projects,
        onAddTask: handleAddTask,
        onCompleteTask: handleCompleteTask
      }),
      
      currentPage === 'settings' && React.createElement(SettingsPage, {
        showNotification: showNotification
      })
    );
  };
  
  return React.createElement('div', { className: 'bg-background min-h-screen' },
    // 메인 콘텐츠
    React.createElement('main', { className: 'pb-20' },
      renderPage()
    ),
    
    // 플로팅 캡처 버튼 (홈/채팅에서는 숨김 - ChatLauncher가 있음)
    currentPage !== 'chat' && currentPage !== 'home' && React.createElement(FloatingCaptureButton, {
      onClick: function() { setShowQuickCapture(true); }
    }),
    
    // 알림 토스트
    notification && React.createElement(NotificationToast, {
      message: notification.message,
      type: notification.type,
      onClose: function() { setNotification(null); }
    }),
    
    // 시간 추정 결과 토스트
    timeLastResult && React.createElement('div', { className: 'fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto' },
      React.createElement(TimeResultToast, {
        taskName: timeLastResult.taskName,
        estimated: timeLastResult.estimated,
        actual: timeLastResult.actual,
        onClose: clearTimeResult
      })
    ),
    
    // 하단 네비게이션
    React.createElement('nav', { className: 'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-2 pb-safe z-40' },
      React.createElement('div', { className: 'flex justify-around items-center h-16 max-w-lg mx-auto' },
        navItems.map(function(item) {
          var isActive = currentPage === item.id;
          return React.createElement('button', {
            key: item.id,
            onClick: function() { setCurrentPage(item.id); },
            className: 'flex flex-col items-center justify-center w-16 h-full transition-colors ' + (isActive ? 'text-primary' : 'text-neutral-400')
          },
            React.createElement(item.icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 }),
            React.createElement('span', { className: 'text-[10px] mt-1 font-medium' + (isActive ? ' text-primary' : '') }, item.label)
          );
        })
      )
    ),
    
    // 모달들
    React.createElement(Suspense, { fallback: null },
      // 퀵캡처 모달
      showQuickCapture && React.createElement(QuickCaptureModal, {
        isOpen: showQuickCapture,
        onClose: function() { setShowQuickCapture(false); },
        onCapture: handleQuickCapture
      }),
      
      // 태스크 상세 모달
      taskModal.isOpen && React.createElement(TaskModal, {
        isOpen: taskModal.isOpen,
        task: taskModal.task,
        projects: projects,
        onClose: function() { setTaskModal({ isOpen: false, task: null }); },
        onUpdate: function(updates) {
          handleUpdateTask(taskModal.task.id, updates);
          setTaskModal({ isOpen: false, task: null });
        },
        onDelete: function() {
          handleDeleteTask(taskModal.task.id);
          setTaskModal({ isOpen: false, task: null });
        },
        onComplete: function() {
          handleCompleteTask(taskModal.task.id);
        },
        getSuggestedTime: getSuggestedTime
      }),
      
      // 태스크 추가 모달
      showAddTaskModal && React.createElement(AddTaskModal, {
        isOpen: showAddTaskModal,
        onClose: function() { setShowAddTaskModal(false); },
        onAdd: function(taskData) {
          handleAddTask(taskData);
          setShowAddTaskModal(false);
        },
        projects: projects,
        getSuggestedTime: getSuggestedTime
      }),
      
      // 프로젝트 추가 모달
      projectModal.isOpen && React.createElement(ProjectModal, {
        isOpen: projectModal.isOpen,
        onClose: function() { setProjectModal({ isOpen: false, project: null }); },
        onAdd: function(projectData) {
          handleAddProject(projectData);
          setProjectModal({ isOpen: false, project: null });
        }
      }),
      
      // 프로젝트 편집 모달
      editProjectModal.isOpen && React.createElement(EditProjectModal, {
        isOpen: editProjectModal.isOpen,
        project: editProjectModal.project,
        onClose: function() { setEditProjectModal({ isOpen: false, project: null }); },
        onUpdate: function(updates) {
          handleUpdateProject(editProjectModal.project.id, updates);
          setEditProjectModal({ isOpen: false, project: null });
        },
        onDelete: function() {
          handleDeleteProject(editProjectModal.project.id);
          setEditProjectModal({ isOpen: false, project: null });
        }
      })
    )
  );
}

export default App;
