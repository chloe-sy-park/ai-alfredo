import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Target, Clock, Zap, CheckCircle2, 
  ChevronRight, Plus, MessageCircle
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Common Components
import { AlfredoAvatar } from '../common';

const AlfredoContextActions = ({ 
  events = [], 
  tasks = [], 
  energy = 60,
  focusStartTime = null,
  onStartFocus,
  onOpenChat,
  onToggleTask,
  darkMode = false 
}) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTotalMin = currentHour * 60 + currentMin;
  
  // 다크모드 스타일
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 시간 파싱
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  
  // 상황 분석 및 액션 생성
  const getContextActions = () => {
    const actions = [];
    
    // 1. 다가오는 미팅 체크 (5분 전 ~ 15분 전)
    const upcomingMeeting = events.find(event => {
      const startMin = parseTime(event.start);
      if (!startMin) return false;
      const diff = startMin - currentTotalMin;
      return diff > 0 && diff <= 15;
    });
    
    if (upcomingMeeting) {
      const startMin = parseTime(upcomingMeeting.start);
      const diff = startMin - currentTotalMin;
      actions.push({
        id: 'meeting-prep',
        type: 'meeting',
        priority: 1,
        icon: '📋',
        title: diff <= 5 ? '미팅 시작!' : '미팅 준비',
        subtitle: `${upcomingMeeting.title} (${diff}분 후)`,
        message: diff <= 5 
          ? '시작 시간이에요! 준비되셨나요?' 
          : '미팅 전 준비사항을 체크해보세요',
        actions: [
          { label: '준비 완료 ✓', action: 'dismiss', variant: 'secondary' },
          { label: upcomingMeeting.location ? `${upcomingMeeting.location}로 이동` : '미팅 입장', action: 'open-meeting', variant: 'primary' },
        ],
        color: diff <= 5 ? 'red' : 'orange',
        event: upcomingMeeting,
      });
    }
    
    // 2. 점심/저녁 시간 (12:00-13:00, 18:00-19:00)
    const isLunchTime = currentHour === 12 && currentMin < 30;
    const isDinnerTime = currentHour === 18 && currentMin < 30;
    
    if (isLunchTime && !upcomingMeeting) {
      actions.push({
        id: 'lunch-break',
        type: 'break',
        priority: 2,
        icon: '🍽️',
        title: '점심시간이에요',
        subtitle: '잠시 쉬어가세요',
        message: '식사하고 오세요! 알프레도가 기다릴게요 🐧',
        actions: [
          { label: '30분 후 알림', action: 'snooze-30', variant: 'secondary' },
          { label: '점심 다녀올게요', action: 'dismiss', variant: 'primary' },
        ],
        color: 'yellow',
      });
    }
    
    if (isDinnerTime && !upcomingMeeting) {
      actions.push({
        id: 'dinner-break',
        type: 'break',
        priority: 2,
        icon: '🌙',
        title: '저녁 시간이에요',
        subtitle: '오늘도 수고했어요',
        message: '퇴근 준비는 어때요? 급한 일만 정리하고 쉬세요!',
        actions: [
          { label: '조금만 더 할게요', action: 'dismiss', variant: 'secondary' },
          { label: '하루 정리하기', action: 'evening-review', variant: 'primary' },
        ],
        color: 'purple',
      });
    }
    
    // 3. 에너지 체크 (낮은 에너지)
    if (energy <= 35 && actions.length === 0) {
      actions.push({
        id: 'low-energy',
        type: 'energy',
        priority: 3,
        icon: '☕',
        title: '에너지 충전 필요',
        subtitle: `현재 에너지 ${energy}%`,
        message: '잠깐 휴식하면 효율이 올라가요. 5분만 쉬어볼까요?',
        actions: [
          { label: '괜찮아요', action: 'dismiss', variant: 'secondary' },
          { label: '5분 휴식 ☕', action: 'break-5', variant: 'primary' },
        ],
        color: 'blue',
      });
    }
    
    // 4. 오후 슬럼프 (14:00-15:00)
    const isAfternoonSlump = currentHour === 14 || (currentHour === 15 && currentMin < 30);
    if (isAfternoonSlump && energy <= 50 && actions.length === 0) {
      actions.push({
        id: 'afternoon-slump',
        type: 'energy',
        priority: 3,
        icon: '🚶',
        title: '오후 슬럼프 시간',
        subtitle: '잠깐 움직여볼까요?',
        message: '가벼운 스트레칭이나 산책이 도움이 돼요!',
        actions: [
          { label: '나중에요', action: 'dismiss', variant: 'secondary' },
          { label: '스트레칭 2분', action: 'stretch', variant: 'primary' },
        ],
        color: 'green',
      });
    }
    
    // 5. 집중 세션 후 휴식 권유 (focusStartTime이 있고 60분 이상 경과)
    if (focusStartTime) {
      const focusMin = Math.floor((now.getTime() - focusStartTime) / 60000);
      if (focusMin >= 50 && focusMin < 60) {
        actions.push({
          id: 'focus-break',
          type: 'focus',
          priority: 1,
          icon: '⏰',
          title: '집중 50분 경과',
          subtitle: '휴식 시간이에요',
          message: '훌륭해요! 10분 쉬고 다시 시작하면 더 효율적이에요.',
          actions: [
            { label: '조금만 더', action: 'extend-10', variant: 'secondary' },
            { label: '10분 휴식', action: 'break-10', variant: 'primary' },
          ],
          color: 'lavender',
        });
      }
    }
    
    // 6. 아침 시작 (9:00-10:00, 첫 태스크 추천)
    const isMorningStart = currentHour === 9 || (currentHour === 10 && currentMin < 30);
    const hasNoCompletedToday = tasks.filter(t => t.status === 'done').length === 0;
    
    if (isMorningStart && hasNoCompletedToday && !upcomingMeeting && actions.length === 0) {
      const firstTask = tasks.filter(t => t.status !== 'done')[0];
      if (firstTask) {
        actions.push({
          id: 'morning-start',
          type: 'start',
          priority: 2,
          icon: '🌅',
          title: '좋은 아침이에요!',
          subtitle: '오늘의 첫 태스크를 시작해볼까요?',
          message: `"${firstTask.title}" 부터 시작하면 어때요?`,
          actions: [
            { label: '다른 거 할래요', action: 'dismiss', variant: 'secondary' },
            { label: '⚡ 바로 시작', action: 'start-task', variant: 'primary', task: firstTask },
          ],
          color: 'orange',
          task: firstTask,
        });
      }
    }
    
    // 7. 마감 임박 (오늘 마감 + 아직 미완료)
    const urgentTasks = tasks.filter(t => 
      t.status !== 'done' && 
      (t.deadline?.includes('오늘') || t.deadline?.includes('D-0'))
    );
    
    if (urgentTasks.length > 0 && currentHour >= 16 && actions.length === 0) {
      actions.push({
        id: 'deadline-alert',
        type: 'urgent',
        priority: 1,
        icon: '🔥',
        title: `오늘 마감 ${urgentTasks.length}개`,
        subtitle: '시간이 얼마 안 남았어요',
        message: urgentTasks.length === 1 
          ? `"${urgentTasks[0].title}" 마감이에요!`
          : `${urgentTasks.map(t => t.title).slice(0, 2).join(', ')} 등`,
        actions: [
          { label: '알겠어요', action: 'dismiss', variant: 'secondary' },
          { label: '지금 처리하기', action: 'start-task', variant: 'primary', task: urgentTasks[0] },
        ],
        color: 'red',
        task: urgentTasks[0],
      });
    }
    
    // 우선순위 순으로 정렬하고 최대 1개만 반환
    return actions.sort((a, b) => a.priority - b.priority).slice(0, 1);
  };
  
  const contextActions = getContextActions();
  
  // 액션 실행 핸들러
  const handleAction = (action, actionData) => {
    switch (action) {
      case 'dismiss':
        // 로컬 상태로 숨김 처리 (세션 동안)
        break;
      case 'start-task':
        if (actionData?.task) {
          onStartFocus?.(actionData.task);
        }
        break;
      case 'open-meeting':
        // 미팅 링크나 위치 열기
        break;
      case 'break-5':
      case 'break-10':
        onOpenChat?.(`${action === 'break-5' ? '5' : '10'}분 휴식 타이머 시작해줘`);
        break;
      case 'stretch':
        onOpenChat?.('2분 스트레칭 가이드 알려줘');
        break;
      case 'evening-review':
        onOpenChat?.('오늘 하루 정리 도와줘');
        break;
      case 'snooze-30':
        // 30분 후 다시 알림
        break;
      default:
        break;
    }
  };
  
  // 액션 카드 없으면 렌더링 안함
  if (contextActions.length === 0) return null;
  
  const colorStyles = {
    red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600', primary: 'bg-red-500', badge: 'bg-red-100 text-red-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-600', primary: 'bg-orange-500', badge: 'bg-orange-100 text-orange-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'bg-yellow-100 text-yellow-600', primary: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', primary: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', primary: 'bg-blue-500', badge: 'bg-blue-100 text-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', primary: 'bg-purple-500', badge: 'bg-purple-100 text-purple-600' },
    lavender: { bg: 'bg-[#F5F3FF]', border: 'border-[#E5E0FF]', icon: 'bg-[#EDE9FE] text-[#A996FF]', primary: 'bg-[#A996FF]', badge: 'bg-[#EDE9FE] text-[#8B7CF7]' },
  };
  
  return (
    <div className="mb-4 space-y-3">
      {contextActions.map(action => {
        const colors = colorStyles[action.color] || colorStyles.lavender;
        
        return (
          <div 
            key={action.id}
            className={`${colors.bg} border ${colors.border} rounded-xl p-4 animate-in slide-in-from-top-2 duration-300`}
          >
            <div className="flex items-start gap-3">
              {/* 아이콘 */}
              <div className={`w-10 h-10 ${colors.icon} rounded-xl flex items-center justify-center text-lg shrink-0`}>
                {action.icon}
              </div>
              
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${textPrimary}`}>{action.title}</span>
                  {action.type === 'urgent' && (
                    <span className={`text-[10px] px-1.5 py-0.5 ${colors.badge} rounded-full font-medium animate-pulse`}>
                      긴급
                    </span>
                  )}
                </div>
                <p className={`text-xs ${textSecondary} mb-2`}>{action.subtitle}</p>
                <p className={`text-sm ${textPrimary} mb-3`}>{action.message}</p>
                
                {/* 액션 버튼들 */}
                <div className="flex gap-2">
                  {action.actions.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(btn.action, { task: btn.task || action.task, event: action.event })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        btn.variant === 'primary'
                          ? `${colors.primary} text-white hover:opacity-90`
                          : `bg-white/80 ${textSecondary} hover:bg-white border border-gray-200`
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 닫기 버튼 */}
              <button 
                onClick={() => handleAction('dismiss')}
                className={`p-1 ${textSecondary} hover:bg-white/50 rounded-lg shrink-0`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// === Phase 3: UnifiedTimelineView (Drag & Drop 지원) ===

export default AlfredoContextActions;
