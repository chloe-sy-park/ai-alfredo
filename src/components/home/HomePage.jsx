import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Search, Target, Zap, Calendar, CheckCircle2, Circle, 
  TrendingUp, TrendingDown, ChevronRight, ChevronUp, ChevronDown, Plus, Award, Flame, 
  Clock, MapPin, ArrowRight, Star, Gift, Crown, Moon
} from 'lucide-react';

// Constants (프로젝트 루트의 constants 폴더)
import { COLORS } from '../../constants/colors';
import { LEVEL_CONFIG, BADGES } from '../../constants/gamification';

// Data (프로젝트 루트의 data 폴더)
import { mockDontForget, mockWeather } from '../../data/mockData';

// Common Components (기존 common 폴더)
import { AlfredoAvatar, DomainBadge, Card } from '../common';

// Home 폴더 내 다른 컴포넌트들
import { 
  QuickConditionTracker, 
  AlfredoBriefing, 
  Big3Widget, 
  UrgentWidget, 
  TimelineWidget,
  RoutineWidget 
} from './widgets';
import UnifiedTimelineView from './UnifiedTimelineView';

// W1: 새로 추가된 컴포넌트들
import AlfredoStatusBar, { getAlfredoExpression } from './AlfredoStatusBar';
import { TomorrowMessageDisplay, EveningWrapUp } from './AlfredoCareSystem';

// W2: 알프레도 모드 시스템 + 바디 더블링
import { 
  ALFREDO_MODES,
  getRecommendedMode,
  AlfredoModeSelector,
  NowCard,
  BodyDoublingMode,
  TimeBasedGreeting 
} from './AlfredoModeSystem';

// Modals
import EventModal from '../modals/EventModal';
import TaskModal from '../modals/TaskModal';

const HomePage = ({ 
  onOpenChat, onOpenSettings, onOpenSearch, onOpenStats, onOpenWeeklyReview, 
  onOpenHabitHeatmap, onOpenEnergyRhythm, onOpenDndModal, onOpenNotifications, 
  onOpenProjectDashboard, notificationCount = 0, doNotDisturb, mood, setMood, 
  energy, setEnergy, oneThing, tasks, onToggleTask, inbox, onStartFocus, 
  darkMode, gameState, events = [], connections = {}, onUpdateTask, onDeleteTask, 
  onSaveEvent, onDeleteEvent, onUpdateTaskTime, onUpdateEventTime, 
  routines = [], onToggleRoutine, onOpenRoutineManager,
  // W1: 새로운 props
  streak = 0,
  yesterdayFailed = false,
  tomorrowMessage = '', // 어젯밤 저장한 메시지
  onSaveTomorrowMessage,
  streakProtectionLeft = 3,
  onUseStreakProtection,
}) => {
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);
  const [eveningNote, setEveningNote] = useState('');
  const [showTaskOptions, setShowTaskOptions] = useState(false);
  
  // Phase 3: 모달 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // W1: 새로운 상태들
  const [showTomorrowMessage, setShowTomorrowMessage] = useState(!!tomorrowMessage);
  const [statusBarExpanded, setStatusBarExpanded] = useState(false);
  
  // W2: 알프레도 모드 + 바디 더블링 상태
  const [alfredoMode, setAlfredoMode] = useState('focus');
  const [showBodyDoubling, setShowBodyDoubling] = useState(false);
  const [bodyDoublingTask, setBodyDoublingTask] = useState(null);
  const [focusElapsedMinutes, setFocusElapsedMinutes] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // 동적 날짜/시간
  const now = new Date();
  const hour = now.getHours();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${weekdays[now.getDay()]}요일`;
  
  const isEvening = hour >= 18;
  const isMorning = hour < 12;
  const isAfternoon = hour >= 12 && hour < 18;
  
  // W2: 알프레도 모드 자동 추천
  const recommendedMode = getRecommendedMode({
    energy,
    mood,
    hour,
    completedTasks: doneTasks?.length || 0,
    totalTasks: tasks?.length || 0,
  });
  
  // W2: 바디 더블링 타이머 효과
  useEffect(() => {
    let timer;
    if (showBodyDoubling && !isPaused) {
      timer = setInterval(() => {
        setFocusElapsedMinutes(prev => prev + 1);
      }, 60000); // 1분마다
    }
    return () => clearInterval(timer);
  }, [showBodyDoubling, isPaused]);
  
  // 오늘의 통계
  const todoTasks = tasks?.filter(t => t.status !== 'done') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];
  const todayMeetings = events.filter(e => e.title.includes('미팅') || e.title.includes('회의'));
  const urgentDeadlines = todoTasks.filter(t => t.deadline?.includes('오늘') || t.deadline?.includes('D-'));
  
  // 컨디션 기반 태스크 추천
  const getConditionAdjustedTasks = () => {
    if (todoTasks.length === 0) return [];
    
    // 에너지 낮으면 쉬운 것 먼저
    if (energy <= 40) {
      return [...todoTasks].sort((a, b) => {
        const importanceOrder = { low: 3, medium: 2, high: 1 };
        const aOrder = importanceOrder[a.importance] || 2;
        const bOrder = importanceOrder[b.importance] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder; // 쉬운 것 먼저
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
    }
    
    // 에너지 높으면 어려운 것 먼저 (기본)
    if (energy >= 70) {
      return [...todoTasks].sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        const aOrder = importanceOrder[a.importance] || 2;
        const bOrder = importanceOrder[b.importance] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder; // 어려운 것 먼저
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
    }
    
    // 보통이면 priorityScore 순
    return [...todoTasks].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  };
  
  const adjustedTasks = getConditionAdjustedTasks();
  const topTask = adjustedTasks[0];
  const isTaskAdjusted = energy <= 40 || energy >= 70; // 컨디션 조정 여부
  
  // 잊지 마세요 통합 (LIFE + WORK) - 간단 버전
  const allReminders = [
    // 돈 관련
    ...mockDontForget.filter(d => d.dDay <= 3).map(d => ({
      id: `money-${d.id}`,
      icon: '💰',
      title: d.title,
      detail: d.dDay === 0 ? '오늘!' : `D-${d.dDay}`,
      urgent: d.dDay <= 1,
      type: 'money'
    })),
    // 답장 안 한 메일
    ...mockWorkReminders.filter(r => r.type === 'reply').map(r => ({
      id: r.id,
      icon: '📧',
      title: r.title,
      detail: `${r.daysAgo}일째`,
      urgent: r.urgent,
      type: 'reply'
    })),
    // 관계 챙기기
    ...mockRelationships.filter(r => r.daysSince >= 7).slice(0, 1).map(r => ({
      id: `rel-${r.id}`,
      icon: r.relationship === 'family' ? '👨‍👩‍👧' : '👋',
      title: `${r.name}에게 연락`,
      detail: `${r.daysSince}일 전`,
      urgent: r.daysSince >= 14,
      type: 'relationship'
    })),
  ].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  
  // 알프레도 인사 생성
  const getAlfredoGreeting = () => {
    if (isEvening) {
      if (doneTasks.length >= 3) {
        return `오늘 **${doneTasks.length}개** 완료했어요! 수고했어요, Boss! 🎉`;
      } else {
        return `하루 마무리 시간이에요. 급한 건 내일 해도 괜찮아요.`;
      }
    } else if (isMorning) {
      return `오늘 할 일 **${todoTasks.length}개**, 미팅 **${todayMeetings.length}개** 있어요.`;
    } else {
      const remaining = todoTasks.length;
      if (doneTasks.length > 0) {
        return `벌써 **${doneTasks.length}개** 완료! 남은 건 **${remaining}개**예요.`;
      }
      return `아직 시작 전이에요. 가벼운 것부터 하나 해볼까요?`;
    }
  };
  
  // 날씨 한줄
  const getWeatherLine = () => {
    const w = mockWeather;
    let line = `${w.temp}°C`;
    if (w.tempLow < 0) line += `, 패딩 입으세요 🧣`;
    else if (w.rain) line += `, 우산 챙기세요 🌧️`;
    if (w.dust === 'bad' || w.dust === 'veryBad') line += ` · 마스크 필수 😷`;
    return line;
  };
  
  // 컨디션 기반 조언
  const getConditionAdvice = () => {
    if (energy <= 40) {
      return { 
        text: "에너지 낮아서 가벼운 것부터 정리했어요. 무리하지 마세요 💜", 
        color: "text-[#8B7CF7]",
        adjusted: true
      };
    } else if (energy >= 70) {
      return { 
        text: "컨디션 좋을 때 어려운 거 먼저 해치워요! ✨", 
        color: "text-emerald-600",
        adjusted: true
      };
    }
    return null;
  };
  
  const conditionAdvice = getConditionAdvice();
  
  // 🆕 프로액티브: 다음 일정까지 카운트다운
  const getNextEventCountdown = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    // events에서 오늘 남은 일정 찾기
    for (const event of events) {
      if (event.time) {
        const [h, m] = event.time.split(':').map(Number);
        if (h > currentHour || (h === currentHour && m > currentMin)) {
          const diffMin = (h * 60 + m) - (currentHour * 60 + currentMin);
          const hours = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          return {
            event,
            hours,
            mins,
            totalMins: diffMin,
            text: hours > 0 ? `${hours}시간 ${mins}분 후` : `${mins}분 후`
          };
        }
      }
    }
    return null;
  };
  
  const nextEvent = getNextEventCountdown();
  
  // 🆕 프로액티브: 어제 미완료 태스크 (시뮬레이션)
  const yesterdayIncomplete = todoTasks.filter(t => 
    t.priorityChange === 'down' || t.project?.includes('밀린')
  ).slice(0, 2);
  
  // 🆕 오늘의 핵심 요약 (숫자로)
  const todaySummary = {
    meetings: todayMeetings.length,
    deadlines: urgentDeadlines.length,
    totalTasks: todoTasks.length,
    done: doneTasks.length,
  };
  
  // 다크모드 색상
  const bgGradient = darkMode 
    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
    : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgGradient} transition-colors duration-300`}>
      
      {/* W1-1: 알프레도 상태바 (상단 고정) */}
      <AlfredoStatusBar
        completedTasks={doneTasks.length}
        totalTasks={tasks?.length || 0}
        energy={energy}
        mood={mood}
        streak={streak}
        yesterdayFailed={yesterdayFailed}
        nextEventIn={nextEvent?.totalMins}
        darkMode={darkMode}
        expanded={statusBarExpanded}
        onToggleExpand={() => setStatusBarExpanded(!statusBarExpanded)}
      />
      
      <div className="px-4 pb-32 pt-4">
      
      {/* W1-4: 어젯밤 메시지 표시 (아침에만) */}
      {isMorning && showTomorrowMessage && tomorrowMessage && (
        <TomorrowMessageDisplay
          message={tomorrowMessage}
          onDismiss={() => setShowTomorrowMessage(false)}
          darkMode={darkMode}
        />
      )}
      
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm ${textSecondary}`}>{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 레벨 뱃지 */}
          {gameState && (
            <button 
              onClick={onOpenStats}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span className="text-sm">⭐</span>
              <span className="text-xs font-bold">Lv.{LEVEL_CONFIG.getLevel(gameState.totalXP).level}</span>
            </button>
          )}
          {/* 방해 금지 버튼 */}
          <button 
            onClick={onOpenDndModal}
            className={`w-9 h-9 rounded-full ${
              doNotDisturb 
                ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white' 
                : darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'
            } ${!doNotDisturb && 'border'} shadow-sm flex items-center justify-center ${!doNotDisturb && textSecondary} hover:opacity-90 transition-all`}
          >
            <Moon size={16} />
          </button>
          <button 
            onClick={onOpenSearch}
            className={`w-9 h-9 rounded-full ${darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'} border shadow-sm flex items-center justify-center ${textSecondary} hover:bg-[#F5F3FF] hover:text-[#A996FF] transition-all`}
          >
            <Search size={16} />
          </button>
          <button 
            onClick={onOpenNotifications}
            className={`w-9 h-9 rounded-full ${darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'} border shadow-sm flex items-center justify-center ${textSecondary} relative`}
          >
            <Bell size={16} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          <button 
            onClick={onOpenSettings}
            className={`w-9 h-9 rounded-full ${darkMode ? 'bg-gray-700/70 border-gray-600' : 'bg-white/70 border-white/50'} border shadow-sm flex items-center justify-center ${textSecondary}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
      
      {/* W2-1: 시간대별 인사 */}
      <TimeBasedGreeting
        hour={hour}
        userName="Boss"
        energy={energy}
        completedTasks={doneTasks.length}
        totalTasks={tasks?.length || 0}
        streak={streak}
        darkMode={darkMode}
      />
      
      {/* W2-3: 알프레도 모드 선택 */}
      <AlfredoModeSelector
        currentMode={alfredoMode}
        recommendedMode={recommendedMode}
        onModeChange={setAlfredoMode}
        darkMode={darkMode}
      />
      
      {/* W2-2: 지금 할 일 카드 */}
      {topTask && !isEvening && (
        <NowCard
          currentTask={topTask}
          nextEvent={nextEvent}
          alfredoMode={alfredoMode}
          energy={energy}
          onStartTask={(task) => {
            setBodyDoublingTask(task);
            setShowBodyDoubling(true);
            setFocusElapsedMinutes(0);
          }}
          onCompleteTask={(task) => onToggleTask?.(task.id)}
          onSkipTask={(task) => {/* 나중에 처리 */}}
          onOpenChat={onOpenChat}
          darkMode={darkMode}
        />
      )}
      
      {/* 🐧 알프레도 메인 브리핑 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-lg p-5 mb-4 border ${borderColor} transition-colors duration-300`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-xl shrink-0 shadow-md">
            🐧
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold ${textPrimary}`}>알프레도</span>
              <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]/10 text-[#A996FF] rounded-full font-medium">라이브</span>
            </div>
            <p className={`text-[15px] ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {isMorning ? '좋은 아침이에요, Boss! ☀️' : isAfternoon ? '오후도 파이팅, Boss! 💪' : '하루 마무리예요, Boss! 🌙'}
            </p>
          </div>
        </div>
        
        {/* 🆕 다음 일정 카운트다운 (프로액티브!) */}
        {nextEvent && nextEvent.totalMins <= 180 && (
          <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-4 mb-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold">{nextEvent.event.title}</p>
                  <p className="text-sm text-white/80">{nextEvent.event.time} · {nextEvent.event.location || '장소 미정'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{nextEvent.text}</p>
                {nextEvent.totalMins <= 30 && (
                  <p className="text-xs text-[#C4B5FD]">⚡ 곧이에요!</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 🆕 오늘 핵심 요약 (한눈에) */}
        <div className={`grid grid-cols-4 gap-2 mb-3 p-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl`}>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-600">{todaySummary.meetings}</p>
            <p className={`text-[11px] ${textSecondary}`}>미팅</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{todaySummary.deadlines}</p>
            <p className={`text-[11px] ${textSecondary}`}>마감</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#A996FF]">{todaySummary.totalTasks}</p>
            <p className={`text-[11px] ${textSecondary}`}>할 일</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-500">{todaySummary.done}</p>
            <p className={`text-[11px] ${textSecondary}`}>완료</p>
          </div>
        </div>
        
        {/* 날씨 */}
        <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 mb-3`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2`}>
              <span className="text-lg">{mockWeather.condition === 'sunny' ? '☀️' : mockWeather.condition === 'cloudy' ? '☁️' : mockWeather.rain ? '🌧️' : '⛅'}</span>
              {getWeatherLine()}
            </span>
          </div>
        </div>
        
        {/* 오늘 요약 */}
        <p className={`text-[15px] ${textPrimary} leading-relaxed mb-3`}>
          {getAlfredoGreeting().split('**').map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="text-[#A996FF] font-bold">{part}</strong> : part
          )}
        </p>
        
        {/* 컨디션 기반 조언 */}
        {conditionAdvice && (
          <p className={`text-sm ${conditionAdvice.color} mb-3`}>
            💡 {conditionAdvice.text}
          </p>
        )}
        
        {/* 🔗 LIFE ↔ WORK 크로스 리마인드 */}
        {(() => {
          const todayPersonal = mockPersonalSchedule.filter(s => !s.daysFromNow);
          const todayWorkMeeting = mockWorkLifeImpact.importantMeetings[0];
          const hasLifeReminder = todayPersonal.length > 0;
          const hasWorkReminder = todayWorkMeeting && !isEvening;
          
          if (!hasLifeReminder && !hasWorkReminder) return null;
          
          return (
            <div className="space-y-2 mb-3">
              {/* LIFE → WORK: 개인 일정 때문에 업무 일찍 마무리 */}
              {hasLifeReminder && !isEvening && (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-start gap-2">
                    <span className="text-base">{todayPersonal[0].icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700">
                        오늘 {todayPersonal[0].time} {todayPersonal[0].title} 있어요
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {(() => {
                          const [h, m] = todayPersonal[0].time.split(':').map(Number);
                          const prepTime = todayPersonal[0].prepTime || 30;
                          const endHour = h - Math.floor(prepTime / 60);
                          const endMin = m - (prepTime % 60);
                          return `${endHour}:${endMin < 10 ? '0' + endMin : endMin}까지 업무 마무리하면 좋겠어요`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* WORK → LIFE: 중요 미팅 전 컨디션 관리 */}
              {hasWorkReminder && (
                <div className="bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-lg p-3 border border-[#EDE9FE]">
                  <div className="flex items-start gap-2">
                    <span className="text-base">🧘</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#7C6CD6]">
                        {todayWorkMeeting.time} {todayWorkMeeting.title} 앞두고 있어요
                      </p>
                      <p className="text-[11px] text-[#8B7CF7] mt-0.5">
                        {todayWorkMeeting.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        
        {/* 🎯 지금 이거부터 */}
        {topTask && !isEvening && (
          <div className="bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-xl p-4 border border-[#A996FF]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#A996FF] font-semibold">🎯 지금 이거부터</p>
                {conditionAdvice?.adjusted && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]/20 text-[#A996FF] rounded-full">
                    컨디션 맞춤
                  </span>
                )}
              </div>
              {adjustedTasks.length > 1 && (
                <button 
                  onClick={() => setShowTaskOptions(!showTaskOptions)}
                  className="text-xs text-[#A996FF] font-medium flex items-center gap-0.5"
                >
                  {showTaskOptions ? '접기' : '다른 옵션'}
                  {showTaskOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
            
            {/* 메인 추천 (1위) */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${textPrimary}`}>{topTask.title}</p>
                  <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF] text-white rounded-full">추천</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-xs ${textSecondary}`}>
                    {topTask.project} {topTask.deadline && `· ${topTask.deadline}`}
                  </p>
                  {topTask.importance === 'low' && energy <= 40 && (
                    <span className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded">가벼움</span>
                  )}
                  {topTask.importance === 'high' && energy >= 70 && (
                    <span className="text-[11px] px-1.5 py-0.5 bg-[#A996FF]100 text-[#A996FF]600 rounded">도전</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onStartFocus && onStartFocus(topTask)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Zap size={14} />
                시작
              </button>
            </div>
            
            {/* 다른 옵션들 (2위, 3위) */}
            {showTaskOptions && adjustedTasks.length > 1 && (
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-[#A996FF]/20'} space-y-2`}>
                <p className={`text-[11px] ${textSecondary} mb-2`}>🐧 다른 것부터 하고 싶으시면 여기서 골라주세요</p>
                {adjustedTasks.slice(1, 4).map((task, idx) => (
                  <div 
                    key={task.id}
                    className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700/60 hover:bg-gray-700' : 'bg-white/60 hover:bg-white/80'} rounded-lg transition-all`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] ${textSecondary} font-medium`}>#{idx + 2}</span>
                        <p className={`font-medium ${textPrimary} text-sm truncate`}>{task.title}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-[11px] ${textSecondary}`}>{task.project}</p>
                        {task.importance === 'high' && (
                          <span className="text-[11px] px-1 py-0.5 bg-red-50 text-red-500 rounded">높음</span>
                        )}
                        {task.importance === 'low' && (
                          <span className={`text-[11px] px-1 py-0.5 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'} rounded`}>낮음</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onStartFocus && onStartFocus(task);
                        setShowTaskOptions(false);
                      }}
                      className={`px-3 py-1.5 ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-600'} hover:bg-[#A996FF] hover:text-white rounded-lg text-xs font-semibold transition-all`}
                    >
                      시작
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 저녁: 오늘 하루 리뷰 */}
        {isEvening && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold mb-2">📊 오늘 하루</p>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <p className="text-xl font-bold text-emerald-600">{doneTasks.length}</p>
                <p className="text-[11px] text-gray-500">완료</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#A996FF]">{Math.floor(mockCompletedHistory.stats.totalFocusTime / 7 / 60)}h</p>
                <p className="text-[11px] text-gray-500">집중</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#A996FF]">🔥{mockCompletedHistory.stats.streak}</p>
                <p className="text-[11px] text-gray-500">연속</p>
              </div>
            </div>
            <button
              onClick={() => setShowEveningReview(true)}
              className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all"
            >
              🌙 하루 마무리하기
            </button>
          </div>
        )}
      </div>
      
      {/* 컨디션 퀵 체크 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-semibold ${textPrimary}`}>지금 컨디션</span>
          <span className={`text-xs ${textSecondary}`}>{energy}%</span>
        </div>
        <div className="flex gap-2">
          {[
            { value: 30, emoji: '😫', label: '힘듦' },
            { value: 50, emoji: '😐', label: '보통' },
            { value: 70, emoji: '😊', label: '괜찮음' },
            { value: 90, emoji: '🔥', label: '최고' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setEnergy(opt.value)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                Math.abs(energy - opt.value) < 15
                  ? 'bg-[#A996FF] text-white shadow-md scale-105'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <p className="text-[11px] mt-0.5">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* 🐧 Phase 5: 알프레도 원클릭 액션 */}
      <AlfredoContextActions
        events={events}
        tasks={tasks}
        energy={energy}
        onStartFocus={onStartFocus}
        onOpenChat={onOpenChat}
        onToggleTask={onToggleTask}
        darkMode={darkMode}
      />
      
      {/* 🔄 Phase 7: 오늘의 루틴 위젯 */}
      <RoutineWidget
        routines={routines}
        onToggle={onToggleRoutine}
        onOpenManager={onOpenRoutineManager}
        darkMode={darkMode}
      />
      
      {/* 📋 Phase 3: 통합 타임라인 뷰 */}
      <UnifiedTimelineView
        events={events}
        tasks={tasks}
        onEventClick={(event) => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
        onTaskClick={(task) => {
          setSelectedTask(task);
        }}
        onStartFocus={onStartFocus}
        onUpdateTaskTime={onUpdateTaskTime}
        onUpdateEventTime={onUpdateEventTime}
        darkMode={darkMode}
      />
      
      {/* ⚠️ 잊지 마세요 */}
      {allReminders.length > 0 && (
        <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
            <span>⚠️</span> 잊지 마세요
            {allReminders.filter(r => r.urgent).length > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">
                {allReminders.filter(r => r.urgent).length}
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {(showAllReminders ? allReminders : allReminders.slice(0, 3)).map(item => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  item.urgent 
                    ? (darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-100')
                    : (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.urgent ? (darkMode ? 'text-red-300' : 'text-red-700') : textPrimary}`}>
                    {item.title}
                  </p>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                  item.urgent 
                    ? (darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-600')
                    : (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500')
                }`}>
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
          {allReminders.length > 3 && (
            <button 
              onClick={() => setShowAllReminders(!showAllReminders)}
              className="w-full mt-2 py-2 text-xs text-[#A996FF] font-medium"
            >
              {showAllReminders ? '접기' : `+${allReminders.length - 3}개 더 보기`}
            </button>
          )}
        </div>
      )}
      
      {/* 알프레도 채팅 바로가기 */}
      <button
        onClick={onOpenChat}
        className={`w-full ${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white/80'} transition-all mb-4 border ${borderColor}`}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF]/20 to-[#8B7CF7]/20 rounded-xl flex items-center justify-center text-lg">
          💬
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${textPrimary}`}>알프레도에게 물어보기</p>
          <p className={`text-xs ${textSecondary}`}>일정 변경, 조언, 뭐든 물어보세요</p>
        </div>
        <ChevronRight size={18} className={textSecondary} />
      </button>
      
      {/* 📊 인사이트 섹션 (통합) */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
        <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📊 나의 인사이트</p>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenWeeklyReview}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-[#A996FF]/10 hover:bg-[#A996FF]/20' : 'bg-gradient-to-br from-[#A996FF]/10 to-[#8B7CF7]/10 hover:from-[#A996FF]/20 hover:to-[#8B7CF7]/20'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              📊
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>주간 리뷰</p>
          </button>
          
          <button
            onClick={onOpenHabitHeatmap}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-emerald-900/30 hover:bg-emerald-900/50' : 'bg-gradient-to-br from-emerald-50 to-emerald-50 hover:from-emerald-100 hover:to-emerald-100'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              🟩
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>습관</p>
          </button>
          
          <button
            onClick={onOpenEnergyRhythm}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-[#A996FF]/20 hover:bg-[#A996FF]/30' : 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] hover:from-[#EDE9FE] hover:to-[#EDE9FE]'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#EDE9FE]0 rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              ⚡
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>에너지</p>
          </button>
          
          <button
            onClick={onOpenProjectDashboard}
            className={`flex flex-col items-center p-3 ${darkMode ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-gradient-to-br from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100'} rounded-xl transition-all`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-base shadow-md mb-2">
              📁
            </div>
            <p className={`text-xs font-medium ${textPrimary}`}>프로젝트</p>
          </button>
        </div>
      </div>
      
      {/* 저녁 마무리 모달 */}
      {showEveningReview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowEveningReview(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-6 text-white text-center">
              <div className="text-4xl mb-2">🌙</div>
              <h2 className="text-xl font-bold">오늘 하루 마무리</h2>
              <p className="text-white/80 text-sm mt-1">수고했어요, Boss!</p>
            </div>
            
            {/* 통계 */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{doneTasks.length}</p>
                  <p className="text-[11px] text-emerald-600/70">완료</p>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#8B7CF7]">{Math.floor(mockCompletedHistory.stats.totalFocusTime / 7 / 60)}h</p>
                  <p className="text-[11px] text-[#8B7CF7]/70">집중</p>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#8B7CF7]">🔥{mockCompletedHistory.stats.streak}</p>
                  <p className="text-[11px] text-[#8B7CF7]/70">연속</p>
                </div>
              </div>
              
              {/* 오늘의 하이라이트 */}
              {doneTasks.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">🎉 오늘의 하이라이트</p>
                  <p className="text-sm text-gray-700 font-semibold">
                    "{doneTasks[0]?.title}" 완료!
                  </p>
                </div>
              )}
              
              {/* 한 줄 기록 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">📝 오늘 한 줄 (선택)</p>
                <input
                  type="text"
                  value={eveningNote}
                  onChange={(e) => setEveningNote(e.target.value)}
                  placeholder="오늘 하루는 어땠나요?"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-[#C4B5FD] outline-none"
                />
              </div>
              
              {/* 알프레도 메시지 */}
              <div className="bg-[#F5F3FF] rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🐧</span>
                  <p className="text-sm text-[#6D28D9]">
                    {doneTasks.length >= 3 
                      ? "오늘 정말 열심히 했어요! 푹 쉬고 내일 또 같이 달려봐요." 
                      : doneTasks.length > 0
                      ? "하나씩 해낸 게 중요해요. 내일 아침에 또 정리해드릴게요."
                      : "괜찮아요, 쉬어가는 날도 필요해요. 내일 다시 시작하면 돼요."}
                  </p>
                </div>
              </div>
              
              {/* 버튼 */}
              <button
                onClick={() => {
                  setShowEveningReview(false);
                  setEveningNote('');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold"
              >
                하루 마무리 완료 😴
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 📡 연동 상태 미니 카드 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${textPrimary} flex items-center gap-2`}>
            <Zap size={14} className="text-[#A996FF]" /> 연동 서비스
          </h3>
          <button 
            onClick={onOpenSettings}
            className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-[#A996FF]`}
          >
            관리 →
          </button>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'googleCalendar', icon: '📅', name: 'Calendar' },
            { key: 'gmail', icon: '📧', name: 'Gmail' },
            { key: 'notion', icon: '📝', name: 'Notion' },
            { key: 'slack', icon: '💬', name: 'Slack' },
          ].map(service => (
            <div 
              key={service.key}
              className={`flex-1 py-2 px-2 rounded-xl text-center ${
                connections?.[service.key]
                  ? (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                  : (darkMode ? 'bg-gray-700/50 text-gray-500' : 'bg-gray-100 text-gray-400')
              }`}
            >
              <span className="text-lg">{service.icon}</span>
              <p className={`text-[10px] mt-0.5 ${connections?.[service.key] ? '' : 'opacity-50'}`}>
                {connections?.[service.key] ? '연결됨' : '미연결'}
              </p>
            </div>
          ))}
        </div>
        {(connections?.googleCalendar || connections?.gmail) && (
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2 text-center`}>
            ✓ 마지막 동기화: 방금 전
          </p>
        )}
      </div>
      
      {/* Phase 3: 태스크 상세 모달 */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStartFocus={(task) => {
            setSelectedTask(null);
            onStartFocus?.(task);
          }}
          onToggle={(taskId) => {
            onToggleTask?.(taskId);
            setSelectedTask(null);
          }}
          onUpdate={(taskId, updates) => {
            onUpdateTask?.(taskId, updates);
          }}
          onDelete={(taskId) => {
            onDeleteTask?.(taskId);
            setSelectedTask(null);
          }}
        />
      )}
      
      {/* Phase 3: 이벤트 편집 모달 */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSave={(eventData) => {
          onSaveEvent?.(eventData);
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        onDelete={(eventId) => {
          onDeleteEvent?.(eventId);
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        googleCalendar={connections?.googleCalendar ? { isSignedIn: true } : null}
      />
      
      {/* W2-4: 바디 더블링 모드 */}
      <BodyDoublingMode
        isActive={showBodyDoubling}
        onClose={() => {
          setShowBodyDoubling(false);
          setBodyDoublingTask(null);
          setFocusElapsedMinutes(0);
        }}
        currentTask={bodyDoublingTask}
        elapsedMinutes={focusElapsedMinutes}
        onComplete={() => {
          if (bodyDoublingTask) {
            onToggleTask?.(bodyDoublingTask.id);
          }
          setShowBodyDoubling(false);
          setBodyDoublingTask(null);
          setFocusElapsedMinutes(0);
        }}
        onPause={() => setIsPaused(!isPaused)}
        isPaused={isPaused}
        darkMode={darkMode}
        alfredoMode={alfredoMode}
      />
      
      {/* W1-3/4: 저녁 마무리 모달 */}
      <EveningWrapUp
        isOpen={showEveningReview}
        onClose={() => setShowEveningReview(false)}
        completedTasks={doneTasks.length}
        totalTasks={tasks?.length || 0}
        streak={streak}
        focusMinutes={focusElapsedMinutes}
        tomorrowMessage={eveningNote}
        onSaveTomorrowMessage={onSaveTomorrowMessage}
        streakProtectionLeft={streakProtectionLeft}
        onUseStreakProtection={onUseStreakProtection}
        darkMode={darkMode}
      />
      
    </div>
  );
};

export default HomePage;
