/**
 * ProactiveNudge.tsx
 * 알프레도 선제적 대화 넛지 컴포넌트 (TypeScript)
 * 
 * W1 과제: 알프레도가 먼저 말 걸어오는 플로팅 UI
 * - 컨텍스트 기반 트리거
 * - 다양한 표시 형태 (플로팅, 미니버튼, 인라인, 토스트)
 * - 쿨다운 관리
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, MessageCircle, Sparkles, Coffee, Target, Calendar, Trophy } from 'lucide-react';
import { PROACTIVE_DIALOGS, shouldShowDialog, markDialogShown, TRIGGER_TYPES } from '@/data/ProactiveDialogs';

// 액션 타입 상수
export const ACTION_TYPES = {
  OPEN_BRIEFING: 'open_briefing',
  OPEN_TASKS: 'open_tasks',
  OPEN_CALENDAR: 'open_calendar',
  START_FOCUS: 'start_focus',
  LOG_CONDITION: 'log_condition',
  SHOW_ACHIEVEMENT: 'show_achievement',
  OPEN_CHAT: 'open_chat',
  DISMISS: 'dismiss',
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

// 컨텍스트 타입
export interface NudgeContext {
  isFirstVisitToday?: boolean;
  taskCount?: number;
  completedTaskCount?: number;
  calendarEventsToday?: number;
  energyLevel?: 'high' | 'medium' | 'low';
  streak?: number;
  lastInteraction?: Date;
  currentPage?: string;
}

// Props 타입
interface ProactiveNudgeProps {
  context: NudgeContext;
  onAction: (action: string, response?: any) => void;
  enabled?: boolean;
  position?: 'bottom-right' | 'bottom-center' | 'top-right';
}

interface AlfredoMiniButtonProps {
  onClick: () => void;
  hasNewMessage?: boolean;
}

interface InlineNudgeProps {
  message: string;
  emoji?: string;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;
  onAction: (action: string) => void;
}

interface ToastNudgeProps {
  message: string;
  emoji?: string;
  duration?: number;
  onDismiss: () => void;
  onAction?: (action: string) => void;
  action?: {
    label: string;
    action: string;
  };
}

interface DialogType {
  id: string;
  trigger: string;
  condition?: (ctx: NudgeContext) => boolean;
  messages: string[];
  emoji: string;
  responses?: Array<{
    label: string;
    action: string;
    followUp?: string;
  }>;
  priority?: number;
  cooldownMinutes?: number;
  maxPerDay?: number;
}

// 아이콘 매핑
const getIconForAction = (action: string) => {
  switch (action) {
    case ACTION_TYPES.OPEN_BRIEFING:
      return <Sparkles size={16} />;
    case ACTION_TYPES.OPEN_TASKS:
      return <Target size={16} />;
    case ACTION_TYPES.OPEN_CALENDAR:
      return <Calendar size={16} />;
    case ACTION_TYPES.START_FOCUS:
      return <Coffee size={16} />;
    case ACTION_TYPES.SHOW_ACHIEVEMENT:
      return <Trophy size={16} />;
    default:
      return <MessageCircle size={16} />;
  }
};

/**
 * 메인 ProactiveNudge 컴포넌트
 * 플로팅 버블 형태로 알프레도가 먼저 말을 걸어옴
 */
export function ProactiveNudge({ 
  context, 
  onAction, 
  enabled = true,
  position = 'bottom-right' 
}: ProactiveNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogType | null>(null);
  const [displayedMessage, setDisplayedMessage] = useState('');

  // 적절한 대화 찾기
  const findAppropriateDialog = useCallback((): DialogType | null => {
    const _now = new Date();
    // hour and day available for future time-based logic
    const _hour = _now.getHours();
    const _day = _now.getDay();

    // 우선순위별로 정렬된 대화 목록
    const eligibleDialogs: DialogType[] = [];

    for (const dialog of PROACTIVE_DIALOGS) {
      // 쿨다운 체크
      if (!shouldShowDialog(dialog.id)) continue;

      // 조건 체크
      let conditionMet = false;

      switch (dialog.trigger) {
        case TRIGGER_TYPES.APP_OPEN:
          conditionMet = context.isFirstVisitToday === true;
          break;
        case TRIGGER_TYPES.TIME_BASED:
          conditionMet = true; // 시간 기반은 항상 체크
          break;
        case TRIGGER_TYPES.DAY_BASED:
          conditionMet = true;
          break;
        case TRIGGER_TYPES.CALENDAR_AWARE:
          conditionMet = (context.calendarEventsToday || 0) > 0;
          break;
        case TRIGGER_TYPES.TASK_CONTEXT:
          conditionMet = (context.taskCount || 0) > 0;
          break;
        case TRIGGER_TYPES.ENERGY_AWARE:
          conditionMet = context.energyLevel !== undefined;
          break;
        case TRIGGER_TYPES.ACHIEVEMENT:
          conditionMet = (context.completedTaskCount || 0) > 0;
          break;
        default:
          conditionMet = true;
      }

      // 추가 조건 함수가 있으면 실행
      if (conditionMet && dialog.condition) {
        conditionMet = dialog.condition(context);
      }

      if (conditionMet) {
        eligibleDialogs.push(dialog);
      }
    }

    // 우선순위 높은 순으로 정렬
    eligibleDialogs.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return eligibleDialogs[0] || null;
  }, [context]);

  // 대화 시작
  useEffect(() => {
    if (!enabled) return;

    // 약간의 딜레이 후 대화 체크 (자연스러운 등장)
    const timer = setTimeout(() => {
      const dialog = findAppropriateDialog();
      if (dialog) {
        setCurrentDialog(dialog);
        // 랜덤 메시지 선택
        const randomMessage = dialog.messages[
          Math.floor(Math.random() * dialog.messages.length)
        ];
        setDisplayedMessage(randomMessage);
        setIsVisible(true);
        markDialogShown(dialog.id);
      }
    }, 1500); // 1.5초 후 등장

    return () => clearTimeout(timer);
  }, [enabled, findAppropriateDialog]);

  // 응답 처리
  const handleResponse = useCallback((response: { label: string; action: string; followUp?: string }) => {
    onAction(response.action, response);
    
    if (response.followUp) {
      setDisplayedMessage(response.followUp);
      // 팔로업 메시지 후 자동 닫기
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } else {
      setIsVisible(false);
    }
  }, [onAction]);

  // 닫기
  const handleDismiss = useCallback(() => {
    setIsMinimized(true);
    onAction(ACTION_TYPES.DISMISS);
  }, [onAction]);

  // 미니 버튼에서 복원
  const handleRestore = useCallback(() => {
    setIsMinimized(false);
  }, []);

  // 위치 클래스
  const positionClasses = useMemo(() => {
    switch (position) {
      case 'bottom-center':
        return 'bottom-20 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      default:
        return 'bottom-20 right-4';
    }
  }, [position]);

  if (!enabled || !isVisible) return null;

  // 미니 버튼 모드
  if (isMinimized) {
    return (
      <AlfredoMiniButton 
        onClick={handleRestore} 
        hasNewMessage={true} 
      />
    );
  }

  return (
    <div 
      className={`fixed ${positionClasses} z-50 animate-slide-up`}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      {/* 말풍선 */}
      <div className="bg-white rounded-2xl shadow-lg border border-lavender-100 p-4 max-w-xs">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce-subtle">
              {currentDialog?.emoji || '🐧'}
            </span>
            <span className="text-xs text-lavender-500 font-medium">알프레도</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-300 hover:text-gray-500 transition-colors p-1"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* 메시지 */}
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {displayedMessage}
        </p>

        {/* 응답 버튼들 */}
        {currentDialog?.responses && currentDialog.responses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentDialog.responses.map((response, idx) => (
              <button
                key={idx}
                onClick={() => handleResponse(response)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
                  transition-all duration-200
                  ${idx === 0 
                    ? 'bg-lavender-400 text-white hover:bg-lavender-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {getIconForAction(response.action)}
                {response.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 말풍선 꼬리 */}
      <div 
        className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-lavender-100 transform rotate-45"
      />
    </div>
  );
}

/**
 * 알프레도 미니 버튼
 * 닫힌 후 하단에 작게 표시되는 버튼
 */
export function AlfredoMiniButton({ onClick, hasNewMessage = false }: AlfredoMiniButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 right-4 z-50
        w-12 h-12 rounded-full
        bg-white shadow-lg border border-lavender-200
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-xl
        ${hasNewMessage ? 'animate-pulse-gentle' : ''}
      `}
      aria-label="알프레도와 대화하기"
    >
      <span className="text-2xl">🐧</span>
      {hasNewMessage && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-lavender-400 rounded-full animate-pulse" />
      )}
    </button>
  );
}

/**
 * 인라인 넛지
 * 페이지 내에 삽입되는 형태의 넛지
 */
export function InlineNudge({ message, emoji = '🐧', actions, onAction }: InlineNudgeProps) {
  return (
    <div className="bg-lavender-50 rounded-xl p-4 border border-lavender-100">
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{emoji}</span>
        <div className="flex-1">
          <p className="text-gray-700 text-sm leading-relaxed">
            {message}
          </p>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onAction(action.action)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-colors
                    ${action.variant === 'primary'
                      ? 'bg-lavender-400 text-white hover:bg-lavender-500'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 토스트 넛지
 * 화면 상단/하단에 잠시 나타났다 사라지는 형태
 */
export function ToastNudge({ 
  message, 
  emoji = '🐧', 
  duration = 4000, 
  onDismiss,
  onAction,
  action 
}: ToastNudgeProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white rounded-full shadow-lg border border-lavender-100 px-4 py-2 flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <p className="text-gray-700 text-sm">{message}</p>
        {action && onAction && (
          <button
            onClick={() => onAction(action.action)}
            className="text-lavender-500 text-sm font-medium hover:text-lavender-600 ml-2"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-gray-300 hover:text-gray-500 ml-1"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * useProactiveDialog Hook
 * 컴포넌트에서 선제적 대화 상태를 관리하기 위한 훅
 */
export function useProactiveDialog(_context: NudgeContext) {
  const [activeDialog, setActiveDialog] = useState<DialogType | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const showDialog = useCallback((dialogId: string) => {
    const dialog = PROACTIVE_DIALOGS.find(d => d.id === dialogId);
    if (dialog && shouldShowDialog(dialogId)) {
      setActiveDialog(dialog as DialogType);
      markDialogShown(dialogId);
      setHistory(prev => [...prev, dialogId]);
    }
  }, []);

  const dismissDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    activeDialog,
    history,
    showDialog,
    dismissDialog,
    clearHistory,
  };
}

export default ProactiveNudge;
