import { ReactNode } from 'react';
import { 
  Inbox, 
  Calendar, 
  CheckSquare, 
  MessageCircle, 
  Target, 
  Sparkles,
  Plus,
  Search,
  Wifi,
  Coffee,
  Moon
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

export type EmptyStateVariant = 
  | 'tasks'
  | 'calendar'
  | 'habits'
  | 'chat'
  | 'search'
  | 'offline'
  | 'focus'
  | 'night'
  | 'custom';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  alfredoMessage?: string;
  className?: string;
}

// =============================================================================
// Preset configurations
// =============================================================================

interface PresetConfig {
  icon: ReactNode;
  title: string;
  description: string;
  alfredoMessage: string;
}

const presets: Record<EmptyStateVariant, PresetConfig> = {
  tasks: {
    icon: <CheckSquare className="w-12 h-12 text-lavender-300" />,
    title: '오늘 할 일이 없어요',
    description: '새 태스크를 추가하거나, 잠시 쉬어가도 좋아요.',
    alfredoMessage: '할 일이 없다니... 여유로운 날이네요! ☀️'
  },
  calendar: {
    icon: <Calendar className="w-12 h-12 text-lavender-300" />,
    title: '오늘 일정이 없어요',
    description: '캘린더를 연동하거나 새 일정을 추가해보세요.',
    alfredoMessage: '오늘은 자유 시간이 많네요! 뭘 해볼까요? 🐧'
  },
  habits: {
    icon: <Target className="w-12 h-12 text-lavender-300" />,
    title: '아직 습관이 없어요',
    description: '작은 습관부터 시작해보는 건 어때요?',
    alfredoMessage: '습관은 작게 시작하는 게 비결이에요! 💪'
  },
  chat: {
    icon: <MessageCircle className="w-12 h-12 text-lavender-300" />,
    title: '아직 대화가 없어요',
    description: '알프레도에게 뭐든 물어보세요!',
    alfredoMessage: '안녕하세요! 무엇을 도와드릴까요? 🐧'
  },
  search: {
    icon: <Search className="w-12 h-12 text-gray-300" />,
    title: '검색 결과가 없어요',
    description: '다른 키워드로 검색해보시겠어요?',
    alfredoMessage: '음... 못 찾겠어요. 다르게 검색해볼까요?'
  },
  offline: {
    icon: <Wifi className="w-12 h-12 text-gray-300" />,
    title: '오프라인 상태예요',
    description: '인터넷 연결을 확인해주세요.',
    alfredoMessage: '인터넷이 끊긴 것 같아요. 잠시 기다려볼까요?'
  },
  focus: {
    icon: <Coffee className="w-12 h-12 text-lavender-300" />,
    title: '집중 세션이 없어요',
    description: '집중 모드를 시작해보세요!',
    alfredoMessage: '집중할 준비 되셨나요? 같이 시작해요! 🔥'
  },
  night: {
    icon: <Moon className="w-12 h-12 text-indigo-300" />,
    title: '오늘 하루 마무리 시간이에요',
    description: '내일을 위해 푹 쉬세요.',
    alfredoMessage: '오늘도 고생했어요. 굿나잇! 🌙'
  },
  custom: {
    icon: <Sparkles className="w-12 h-12 text-lavender-300" />,
    title: '여기엔 아무것도 없어요',
    description: '',
    alfredoMessage: ''
  }
};

// =============================================================================
// Component
// =============================================================================

export default function EmptyState({
  variant = 'custom',
  title,
  description,
  icon,
  action,
  secondaryAction,
  alfredoMessage,
  className = ''
}: EmptyStateProps) {
  const preset = presets[variant];
  
  const displayIcon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;
  const displayAlfredoMessage = alfredoMessage || preset.alfredoMessage;
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* 아이콘 */}
      <div className="mb-4 opacity-80">
        {displayIcon}
      </div>
      
      {/* 타이틀 */}
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {displayTitle}
      </h3>
      
      {/* 설명 */}
      {displayDescription && (
        <p className="text-sm text-gray-500 mb-4 max-w-xs">
          {displayDescription}
        </p>
      )}
      
      {/* 알프레도 메시지 */}
      {displayAlfredoMessage && (
        <div className="bg-lavender-50 rounded-2xl px-4 py-3 mb-6 max-w-xs">
          <div className="flex items-start gap-2">
            <span className="text-xl">🐧</span>
            <p className="text-sm text-gray-600 text-left">
              {displayAlfredoMessage}
            </p>
          </div>
        </div>
      )}
      
      {/* 액션 버튼 */}
      <div className="flex gap-3">
        {action && (
          <button
            onClick={action.onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              action.variant === 'secondary'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-lavender-500 text-white hover:bg-lavender-600'
            }`}
          >
            {action.variant !== 'secondary' && <Plus size={16} />}
            {action.label}
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Specialized Empty States
// =============================================================================

/**
 * 태스크 Empty State
 */
export function TasksEmptyState({ onAddTask }: { onAddTask: () => void }) {
  return (
    <EmptyState
      variant="tasks"
      action={{
        label: '태스크 추가',
        onClick: onAddTask
      }}
    />
  );
}

/**
 * 캘린더 Empty State
 */
export function CalendarEmptyState({ 
  onConnectCalendar, 
  onAddEvent 
}: { 
  onConnectCalendar: () => void;
  onAddEvent?: () => void;
}) {
  return (
    <EmptyState
      variant="calendar"
      action={{
        label: '캘린더 연동',
        onClick: onConnectCalendar
      }}
      secondaryAction={onAddEvent ? {
        label: '일정 직접 추가',
        onClick: onAddEvent
      } : undefined}
    />
  );
}

/**
 * 습관 Empty State
 */
export function HabitsEmptyState({ onAddHabit }: { onAddHabit: () => void }) {
  return (
    <EmptyState
      variant="habits"
      action={{
        label: '습관 만들기',
        onClick: onAddHabit
      }}
      alfredoMessage="물 마시기, 스트레칭... 작은 것부터 시작해요! 💪"
    />
  );
}

/**
 * 검색 Empty State
 */
export function SearchEmptyState({ query, onClearSearch }: { query: string; onClearSearch: () => void }) {
  return (
    <EmptyState
      variant="search"
      title={`'${query}'에 대한 결과가 없어요`}
      action={{
        label: '검색 초기화',
        onClick: onClearSearch,
        variant: 'secondary'
      }}
    />
  );
}

/**
 * 오프라인 Empty State
 */
export function OfflineEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      variant="offline"
      action={{
        label: '다시 시도',
        onClick: onRetry,
        variant: 'secondary'
      }}
    />
  );
}

/**
 * 야간 모드 Empty State
 */
export function NightModeEmptyState() {
  return (
    <EmptyState
      variant="night"
      alfredoMessage="오늘도 고생했어요. 내일 아침에 봐요! 🌙"
    />
  );
}
