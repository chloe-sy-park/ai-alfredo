/**
 * Life Butler - Refactored App.jsx
 * 
 * 이 파일은 리팩토링 후 App.jsx가 어떻게 보일지 보여주는 예시입니다.
 * 실제 적용 시 기존 App.jsx의 로직을 이 구조로 마이그레이션하세요.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// === Lucide Icons ===
import { 
  Home, Briefcase, Heart, Calendar, Settings,
  Plus, Search, Bell, X, Check, ChevronRight,
  MessageCircle, Mic, Send, ArrowLeft, MoreHorizontal
} from 'lucide-react';

// === Constants ===
import { 
  COLORS, 
  SPACING, 
  RADIUS,
  getThemeStyles, 
  BUTTON_STYLES, 
  CARD_STYLES, 
  INPUT_STYLES 
} from './constants/colors';

import { TIME_CONFIG } from './constants/timeConfig';

import { 
  LEVEL_CONFIG, 
  XP_REWARDS, 
  BADGES, 
  initialGameState 
} from './constants/gamification';

// === Mock Data ===
import { 
  mockWeather,
  mockEvents,
  mockBig3,
  mockAllTasks,
  mockProjects,
  mockCompletedHistory,
  mockWorkReminders,
  mockDontForget,
  mockRelationships,
  mockInbox,
  mockLifeReminders,
  mockPersonalSchedule,
  mockWorkLifeImpact,
  mockHealthCheck,
  mockMedications,
  timeSlots,
  mockRoutines,
  mockConditionHistory,
  mockUrgent,
  mockHabits,
  mockMonitoring,
  mockMoodHistory
} from './data/mockData';

// === Hooks ===
import { useTimeTracking } from './hooks/useTimeTracking';

// === Common Components ===
import { 
  Button,
  Card,
  Toggle,
  SectionHeader,
  EmptyState,
  Modal,
  PageHeader,
  ProgressBar,
  Badge,
  AlfredoAvatar,
  Toast,
  StatusIndicator,
  DomainBadge
} from './components/common';

// === Alfredo Components ===
import { 
  TimeAlertToast,
  AlfredoFeedback,
  AlfredoStatusBar,
  AlfredoFloatingBubble
} from './components/alfredo';

// ============================================================
// 아래부터는 기존 App.jsx의 나머지 컴포넌트들이 위치합니다.
// 점진적으로 pages/, components/modals/, components/widgets/로
// 분리해 나가면 됩니다.
// ============================================================

// === Onboarding ===
const Onboarding = ({ onComplete }) => {
  // ... 기존 코드
};

// === Quick Condition Tracker ===
const QuickConditionTracker = ({ mood, setMood, energy, setEnergy }) => {
  // ... 기존 코드
};

// === Widgets ===
const Big3Widget = ({ tasks, onToggle }) => {
  // ... 기존 코드
};

const UrgentWidget = ({ items }) => {
  // ... 기존 코드
};

const TimelineWidget = ({ events }) => {
  // ... 기존 코드
};

// === Modals ===
const ProjectModal = ({ isOpen, onClose, project, onSave, onDelete }) => {
  // ... 기존 코드
};

const EventModal = ({ isOpen, onClose, event, onSave, onDelete, googleCalendar }) => {
  // ... 기존 코드
};

const TaskModal = ({ task, onClose, onStartFocus, onToggle, onUpdate, onDelete }) => {
  // ... 기존 코드
};

const AddTaskModal = ({ isOpen, onClose, onAdd, projects }) => {
  // ... 기존 코드
};

const QuickCaptureModal = ({ onClose, onAddTask, onAddToInbox, onOpenMeetingUploader }) => {
  // ... 기존 코드
};

// === Focus Timer ===
const FocusTimer = ({ task, onComplete, onExit }) => {
  // ... 기존 코드
};

// === Pages ===
const HomePage = ({ /* props */ }) => {
  // ... 기존 코드
};

const WorkPage = ({ /* props */ }) => {
  // ... 기존 코드
};

const LifePage = ({ /* props */ }) => {
  // ... 기존 코드
};

const CalendarPage = ({ /* props */ }) => {
  // ... 기존 코드
};

const AlfredoChat = ({ /* props */ }) => {
  // ... 기존 코드
};

const SettingsPage = ({ /* props */ }) => {
  // ... 기존 코드
};

// ============================================================
// Main App Component
// ============================================================
export default function LifeButlerApp() {
  // === State ===
  const [view, setView] = useState('HOME');
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Tasks & Events
  const [allTasks, setAllTasks] = useState(mockAllTasks);
  const [allEvents, setAllEvents] = useState(mockEvents);
  const [inbox, setInbox] = useState(mockInbox);
  
  // User State
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [oneThing, setOneThing] = useState('');
  
  // Game State
  const [gameState, setGameState] = useState(initialGameState);
  
  // Focus Mode
  const [focusTask, setFocusTask] = useState(null);
  const [currentWorkingTask, setCurrentWorkingTask] = useState(null);
  
  // Do Not Disturb
  const [doNotDisturb, setDoNotDisturb] = useState({ enabled: false, until: null });
  
  // Modals
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Toast
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [alfredoFeedback, setAlfredoFeedback] = useState({ visible: false, message: '', type: 'praise', icon: '✨' });

  // === Phase 2: Time Tracking ===
  const timeTracking = useTimeTracking(
    currentWorkingTask,
    allEvents,
    (alert) => {
      // 알림 처리 로직
      console.log('Time alert:', alert);
    }
  );

  // === Derived State ===
  const big3Tasks = allTasks.filter(t => t.status !== 'done').slice(0, 3);
  const completedToday = allTasks.filter(t => t.status === 'done').length;
  const theme = getThemeStyles(darkMode);

  // === Handlers ===
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const showAlfredoFeedback = (message, type = 'praise', icon = '✨') => {
    setAlfredoFeedback({ visible: true, message, type, icon });
    setTimeout(() => setAlfredoFeedback({ visible: false, message: '', type: 'praise', icon: '✨' }), 3000);
  };

  const handleToggleTask = (taskId) => {
    setAllTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
    ));
    showAlfredoFeedback('잘했어요! 💪', 'praise', '✨');
  };

  const handleStartFocus = (task) => {
    setFocusTask(task);
    setCurrentWorkingTask(task.title);
    setView('FOCUS');
  };

  const handleFocusComplete = () => {
    if (focusTask) {
      handleToggleTask(focusTask.id);
    }
    setFocusTask(null);
    setCurrentWorkingTask(null);
    setView('HOME');
  };

  const handleTimeAlertAction = (action, alert) => {
    if (action === 'break') {
      timeTracking.recordBreak();
      setFocusTask(null);
      setCurrentWorkingTask(null);
      setView('HOME');
      showToast('잠깐 쉬어가요 ☕');
    } else if (action === 'wrapup') {
      // 마무리 후 다음 일정 준비
      showToast('마무리하고 다음 일정 준비해요!');
    }
  };

  // === Render ===
  return (
    <div className={`min-h-screen ${theme.bgPage} transition-colors duration-300`}>
      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} darkMode={darkMode} />
      
      {/* Alfredo Feedback */}
      <AlfredoFeedback 
        visible={alfredoFeedback.visible}
        message={alfredoFeedback.message}
        type={alfredoFeedback.type}
        icon={alfredoFeedback.icon}
        darkMode={darkMode}
      />

      {/* Time Alert Toast (Phase 2) */}
      {!doNotDisturb.enabled && (
        <TimeAlertToast
          alert={timeTracking.activeAlert}
          onAction={handleTimeAlertAction}
          onDismiss={timeTracking.dismissAlert}
          darkMode={darkMode}
        />
      )}

      {/* Main Content */}
      <main className="pb-36">
        {view === 'HOME' && (
          <HomePage
            darkMode={darkMode}
            mood={mood}
            setMood={setMood}
            energy={energy}
            setEnergy={setEnergy}
            tasks={big3Tasks}
            onToggleTask={handleToggleTask}
            onStartFocus={handleStartFocus}
            events={allEvents}
            inbox={inbox}
            gameState={gameState}
            onOpenChat={() => setView('CHAT')}
            onOpenSettings={() => setView('SETTINGS')}
            onOpenSearch={() => setShowSearch(true)}
          />
        )}
        
        {view === 'WORK' && (
          <WorkPage
            darkMode={darkMode}
            tasks={allTasks}
            onToggleTask={handleToggleTask}
            onStartFocus={handleStartFocus}
            events={allEvents}
            inbox={inbox}
            onOpenChat={() => setView('CHAT')}
          />
        )}
        
        {view === 'LIFE' && (
          <LifePage
            darkMode={darkMode}
            mood={mood}
            setMood={setMood}
            energy={energy}
            setEnergy={setEnergy}
            onOpenChat={() => setView('CHAT')}
          />
        )}
        
        {view === 'CALENDAR' && (
          <CalendarPage
            darkMode={darkMode}
            tasks={allTasks}
            events={allEvents}
            onBack={() => setView('HOME')}
          />
        )}
        
        {view === 'CHAT' && (
          <AlfredoChat
            onBack={() => setView('HOME')}
            tasks={allTasks}
            events={allEvents}
            mood={mood}
            energy={energy}
          />
        )}
        
        {view === 'SETTINGS' && (
          <SettingsPage
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onBack={() => setView('HOME')}
          />
        )}
        
        {view === 'FOCUS' && focusTask && (
          <FocusTimer
            task={focusTask}
            onComplete={handleFocusComplete}
            onExit={() => {
              setFocusTask(null);
              setCurrentWorkingTask(null);
              setView('HOME');
            }}
          />
        )}
      </main>

      {/* Alfredo Status Bar */}
      {view !== 'FOCUS' && view !== 'CHAT' && (
        <AlfredoStatusBar
          completedTasks={completedToday}
          totalTasks={big3Tasks.length}
          currentTask={currentWorkingTask}
          taskElapsedMinutes={timeTracking.getElapsedTime()}
          taskEstimatedMinutes={focusTask?.duration || 0}
          sessionMinutes={timeTracking.getSessionTime()}
          mood={mood}
          energy={energy}
          onOpenChat={() => setView('CHAT')}
          darkMode={darkMode}
        />
      )}

      {/* Bottom Navigation */}
      {view !== 'FOCUS' && view !== 'CHAT' && (
        <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-t z-30`}>
          <div className="flex justify-around items-center h-16">
            <NavButton 
              icon={<Home size={22} />} 
              label="홈" 
              active={view === 'HOME'} 
              onClick={() => setView('HOME')}
              darkMode={darkMode}
            />
            <NavButton 
              icon={<Briefcase size={22} />} 
              label="업무" 
              active={view === 'WORK'} 
              onClick={() => setView('WORK')}
              darkMode={darkMode}
            />
            
            {/* Quick Capture Button */}
            <button
              onClick={() => setShowQuickCapture(true)}
              className="w-14 h-14 -mt-6 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-2xl shadow-lg shadow-[#A996FF]/30 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Plus size={28} />
            </button>
            
            <NavButton 
              icon={<Heart size={22} />} 
              label="라이프" 
              active={view === 'LIFE'} 
              onClick={() => setView('LIFE')}
              darkMode={darkMode}
            />
            <NavButton 
              icon={<Calendar size={22} />} 
              label="캘린더" 
              active={view === 'CALENDAR'} 
              onClick={() => setView('CALENDAR')}
              darkMode={darkMode}
            />
          </div>
        </nav>
      )}

      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <QuickCaptureModal
          onClose={() => setShowQuickCapture(false)}
          onAddTask={(task) => {
            setAllTasks(prev => [...prev, task]);
            showToast('태스크가 추가되었어요!');
          }}
          onAddToInbox={(item) => {
            setInbox(prev => [...prev, item]);
            showToast('인박스에 추가되었어요!');
          }}
        />
      )}
    </div>
  );
}

// === Navigation Button Component ===
const NavButton = ({ icon, label, active, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
      active 
        ? 'text-[#A996FF]' 
        : darkMode ? 'text-gray-500' : 'text-gray-400'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
