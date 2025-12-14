import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, Zap, TrendingUp, TrendingDown, CheckCircle2, Circle,
  Clock, MapPin, Calendar, MessageCircle, X, ArrowRight, Flame
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Data
import { mockWeather, mockBig3, mockEvents, mockMoodHistory } from '../../data/mockData';

// Common Components
import { AlfredoAvatar, DomainBadge } from '../common';

const QuickConditionTracker = ({ mood, setMood, energy, setEnergy }) => {
  const [expanded, setExpanded] = useState(false);
  const moods = [{ val: 'down', emoji: '😔' }, { val: 'okay', emoji: '😐' }, { val: 'light', emoji: '🙂' }, { val: 'upbeat', emoji: '😊' }];
  const currentMood = moods.find(m => m.val === mood);
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-sm mb-4 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full">
            <span className="text-lg">{currentMood?.emoji}</span>
            <span className="text-sm font-medium text-gray-800">{mood === 'light' ? '괜찮아요' : mood === 'upbeat' ? '좋아요' : mood === 'down' ? '힘들어요' : '그냥'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full">
            <Zap size={14} className={energy >= 50 ? 'text-[#A996FF]' : 'text-gray-400'} />
            <span className="text-sm font-medium text-gray-800">{energy}%</span>
            {energy > 60 ? <TrendingUp size={12} className="text-emerald-500" /> : energy < 40 ? <TrendingDown size={12} className="text-red-400" /> : null}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>컨디션 변경</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-black/5">
          <p className="text-xs text-gray-400 mb-2">지금 기분은?</p>
          <div className="flex gap-2 mb-4">
            {moods.map(m => (
              <button key={m.val} onClick={() => setMood(m.val)}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 ${mood === m.val ? 'bg-[#A996FF] text-white shadow-md' : 'bg-white/60 text-gray-500'}`}>
                <span className="text-xl">{m.emoji}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-2">에너지 레벨</p>
          <div className="flex gap-2">
            {[25, 50, 75, 100].map(e => (
              <button key={e} onClick={() => setEnergy(e)}
                className={`flex-1 py-3 rounded-xl flex flex-col items-center ${energy === e ? 'bg-[#A996FF] text-white shadow-md' : 'bg-white/60 text-gray-500'}`}>
                <span>{e === 100 ? '💪' : e >= 75 ? '⚡' : '🔋'}</span>
                <span className="text-[11px] font-medium">{e}%</span>
              </button>
            ))}
          </div>
          
          {/* Mini History */}
          <div className="mt-4 pt-3 border-t border-black/5">
            <p className="text-xs text-gray-400 mb-2">최근 7일 컨디션</p>
            <div className="flex items-end justify-between gap-1 h-12">
              {mockMoodHistory.map((entry, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className={`w-full rounded-t ${idx === 6 ? 'bg-[#A996FF]' : 'bg-[#E5E0FF]'}`} style={{height: `${entry.energy}%`}} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const AlfredoBriefing = ({ onOpenChat, mood, energy, oneThing, completedTasks = 0, totalTasks = 3, inbox = [], onViewInbox }) => {
  const hour = new Date().getHours();
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Inbox 통계
  const urgentInboxCount = inbox.filter(i => i.urgent).length;
  const needReplyCount = inbox.filter(i => i.needReplyToday).length;
  
  // 시간대별 인사
  const getGreeting = () => {
    if (hour < 12) return '좋은 아침이에요, Boss!';
    if (hour < 17) return '좋은 오후예요, Boss!';
    return '좋은 저녁이에요, Boss!';
  };
  
  // 실용적 조언 (완료 상태 + 컨디션 기반)
  const getConditionAdvice = () => {
    if (completedTasks === totalTasks && totalTasks > 0) {
      return '오늘 할 일 끝! 남은 시간은 자유롭게 보내세요.';
    }
    if (completedTasks >= 2) {
      return `${totalTasks - completedTasks}개 남았어요. 마무리까지 힘내봐요!`;
    }
    if (completedTasks === 1) {
      return '시작이 반이에요. 다음 건 뭘로 할까요?';
    }
    if (mood === 'upbeat' && energy >= 75) return '컨디션 좋을 때 어려운 일 먼저 해치워요!';
    if (mood === 'light' && energy >= 50) return '미팅 전에 핵심 업무 끝내두면 여유롭게 마무리할 수 있어요.';
    if (mood === 'down' || energy < 30) return '오늘은 무리하지 말고, 꼭 필요한 것만 해요.';
    if (energy < 50) return '에너지가 좀 낮네요. 중요한 일 먼저, 나머진 내일로!';
    return '차근차근 하나씩 해봐요. 제가 옆에서 챙길게요.';
  };
  
  // 중요 미팅 찾기
  const importantMeeting = mockEvents.find(e => e.important || e.title.includes('미팅') || e.title.includes('투자'));
  const hasPT = mockEvents.find(e => e.title.includes('PT') || e.title.includes('운동'));
  
  // 브리핑 본문 생성 (간결 버전)
  const generateBriefingText = () => {
    const lines = [];
    
    // 1. 날씨 (한 줄로 통합)
    if (mockWeather.rainChance > 20 || mockWeather.temp < 10) {
      let weatherLine = '';
      if (mockWeather.temp < 10) weatherLine += `${mockWeather.temp}° 쌀쌀해요.`;
      if (mockWeather.rainChance > 20) weatherLine += ` 비 ${mockWeather.rainChance}%, 우산 챙기세요!`;
      lines.push(`🌤️ ${weatherLine.trim()}`);
    }
    
    // 2. 오늘의 핵심 + 마감 (한 줄)
    const mainTask = oneThing || mockBig3[0]?.title;
    if (mainTask && importantMeeting) {
      lines.push(`🎯 **${mainTask}** → ${importantMeeting.start} 미팅 전까지!`);
    } else if (mainTask) {
      lines.push(`🎯 오늘 핵심: **${mainTask}**`);
    }
    
    // 3. 중요 미팅 + 장소 + 준비물 (한 줄)
    if (importantMeeting) {
      let meetingLine = `${importantMeeting.start} ${importantMeeting.title}`;
      if (importantMeeting.location) meetingLine += ` @ ${importantMeeting.location}`;
      meetingLine += ' — 명함, 복장 체크!';
      lines.push(`💼 ${meetingLine}`);
    }
    
    // 4. 운동 (있으면)
    if (hasPT) {
      lines.push(`🏃 ${hasPT.start} ${hasPT.title} — 운동복, 물병 챙기셨죠?`);
    }
    
    // 5. 인박스 (긴급/오늘 회신 필요한 것만)
    if (urgentInboxCount > 0 || needReplyCount > 0) {
      let inboxLine = '📥 ';
      if (urgentInboxCount > 0) inboxLine += `긴급 ${urgentInboxCount}건`;
      if (urgentInboxCount > 0 && needReplyCount > 0) inboxLine += ', ';
      if (needReplyCount > 0) inboxLine += `오늘 회신 ${needReplyCount}건`;
      inboxLine += ' — 업무 탭에서 확인하세요!';
      lines.push(inboxLine);
    }
    
    return lines;
  };
  
  const briefingLines = generateBriefingText();
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-md overflow-hidden">
      {/* Header with Avatar */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <AlfredoAvatar size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-lg">{getGreeting()} ☀️</p>
            <p className="text-sm text-[#A996FF] font-medium">{getConditionAdvice()}</p>
          </div>
          <button onClick={onOpenChat} className="w-10 h-10 rounded-full bg-[#A996FF] text-white flex items-center justify-center shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8] transition-colors">
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
      
      {/* Main Briefing Content */}
      <div className="p-4 pt-3">
        <div className="bg-[#F0EBFF] rounded-xl p-4 space-y-2">
          {briefingLines.map((line, idx) => (
            <p key={idx} className="text-[14px] text-gray-700 leading-relaxed">
              {line.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-[#A996FF] font-semibold">{part}</strong> : part
              )}
            </p>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-black/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500">오늘의 진행률</span>
            <span className="font-medium text-[#A996FF]">{completedTasks}/{totalTasks} 완료</span>
          </div>
          <div className="h-2 bg-[#F0EEFF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const Big3Widget = ({ tasks, onToggle }) => {
  const completed = tasks ? tasks.filter(t => t.status === 'done').length : 0;
  const taskList = tasks || mockBig3;
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">🎯 오늘의 Big 3</h3>
        <span className="text-xs text-[#A996FF] font-medium">{completed}/3 완료</span>
      </div>
      <div className="space-y-2">
        {taskList.map((task, idx) => (
          <div 
            key={task.id} 
            className={`p-3 rounded-xl border-l-4 transition-all ${
              task.status === 'done' 
                ? 'border-l-emerald-400 bg-emerald-50/50' 
                : idx === 0 
                  ? 'border-l-[#A996FF] bg-[#F5F3FF]' 
                  : 'border-l-[#E5E0FF] bg-white/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={() => onToggle && onToggle(task.id)}
                className={`mt-0.5 transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-[#A996FF]'}`}
              >
                {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div className="flex-1">
                <p className={`font-medium text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <DomainBadge domain={task.domain} />
                  {task.deadline && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />{task.deadline}
                    </span>
                  )}
                </div>
              </div>
              {task.priorityChange === 'up' && task.status !== 'done' && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#A996FF]/10 rounded">
                  <TrendingUp size={12} className="text-[#A996FF]" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 긴급/마감 위젯
const UrgentWidget = ({ items }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-[#EDE9FE] border border-red-100 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
        놓치면 안 돼요
      </h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-white/70 rounded-xl">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.urgency === 'high' ? 'bg-red-400' : 'bg-[#A996FF]'
            }`}></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${
              item.urgency === 'high' ? 'text-red-500' : 'text-[#8B7CF7]'
            }`}>
              {item.dueText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 타임라인 위젯
const TimelineWidget = ({ events }) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
  
  // 다음 일정까지 남은 시간
  const getNextEvent = () => {
    for (const event of events) {
      const [eventHour, eventMin] = event.start.split(':').map(Number);
      const eventTotalMin = eventHour * 60 + eventMin;
      const currentTotalMin = currentHour * 60 + currentMinute;
      
      if (eventTotalMin > currentTotalMin) {
        const diffMin = eventTotalMin - currentTotalMin;
        const hours = Math.floor(diffMin / 60);
        const mins = diffMin % 60;
        return {
          event,
          timeLeft: hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
        };
      }
    }
    return null;
  };
  
  const nextEvent = getNextEvent();
  
  // 진행 중인지 확인
  const isOngoing = (event) => {
    const [startH, startM] = event.start.split(':').map(Number);
    const [endH, endM] = event.end.split(':').map(Number);
    const currentTotal = currentHour * 60 + currentMinute;
    return currentTotal >= startH * 60 + startM && currentTotal < endH * 60 + endM;
  };
  
  // 지났는지 확인
  const isPast = (event) => {
    const [endH, endM] = event.end.split(':').map(Number);
    return currentHour * 60 + currentMinute >= endH * 60 + endM;
  };
  
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">📅 오늘 일정</h3>
      
      {/* 현재 시간 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#A996FF] text-white rounded-full">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">지금 {currentTimeStr}</span>
        </div>
        {nextEvent && (
          <span className="text-xs text-gray-500">
            → 다음까지 <strong className="text-[#A996FF]">{nextEvent.timeLeft}</strong>
          </span>
        )}
      </div>
      
      {/* 타임라인 */}
      <div className="relative pl-4 border-l-2 border-[#E5E0FF] space-y-3">
        {events.map((event) => {
          const ongoing = isOngoing(event);
          const past = isPast(event);
          
          return (
            <div key={event.id} className={`relative pl-4 ${past ? 'opacity-40' : ''}`}>
              <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white ${
                ongoing ? 'bg-[#A996FF] ring-4 ring-[#A996FF]/20' : past ? 'bg-gray-300' : 'bg-[#E5E0FF]'
              }`}></div>
              
              <div className={`p-3 rounded-xl ${ongoing ? 'bg-[#F5F3FF] border border-[#A996FF]/30' : 'bg-white/60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${ongoing ? 'text-[#A996FF]' : 'text-gray-800'}`}>
                      {event.title}
                      {ongoing && <span className="ml-2 text-xs bg-[#A996FF] text-white px-1.5 py-0.5 rounded">진행중</span>}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />{event.location}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${ongoing ? 'text-[#A996FF]' : 'text-gray-400'}`}>
                    {event.start}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// HomePage에서 사용할 위젯들 (HabitsWidget 제거됨)


const RoutineWidget = ({ routines = [], onToggle, onOpenManager, darkMode = false }) => {
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 오늘 해야 할 루틴만 필터링
  const today = new Date().getDay();
  const todayRoutines = routines.filter(r => {
    if (r.repeatType === 'daily') return true;
    if (r.repeatType === 'weekdays') return today >= 1 && today <= 5;
    if (r.repeatType === 'weekly') return r.repeatDays?.includes(today);
    if (r.repeatType === 'custom') return r.repeatDays?.includes(today);
    return true;
  });
  
  const completed = todayRoutines.filter(r => r.current >= r.target).length;
  const total = todayRoutines.length;
  
  if (total === 0) return null;
  
  return (
    <div className={`${cardBg} backdrop-blur-xl rounded-xl shadow-sm p-4 mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔄</span>
          <h3 className={`font-semibold ${textPrimary}`}>오늘의 루틴</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            completed === total 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {completed}/{total}
          </span>
        </div>
        <button 
          onClick={onOpenManager}
          className={`text-xs ${textSecondary} hover:text-[#A996FF]`}
        >
          관리
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {todayRoutines.map(routine => {
          const isDone = routine.current >= routine.target;
          return (
            <button
              key={routine.id}
              onClick={() => onToggle?.(routine.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                isDone 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-xl">{isDone ? '✅' : routine.icon}</span>
              <span className={`text-[10px] font-medium ${isDone ? 'text-emerald-600' : textSecondary} max-w-[60px] truncate`}>
                {routine.title}
              </span>
              {routine.target > 1 && (
                <span className={`text-[9px] ${textSecondary}`}>
                  {routine.current}/{routine.target}
                </span>
              )}
              {routine.streak >= 3 && (
                <span className="text-[9px] text-orange-500">🔥{routine.streak}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};


export { 
  QuickConditionTracker, 
  AlfredoBriefing, 
  Big3Widget, 
  UrgentWidget, 
  TimelineWidget,
  RoutineWidget 
};
