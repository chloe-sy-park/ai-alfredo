/**
 * EmptyState
 * PRD Component Inventory: 데이터 없음 상태 컴포넌트
 * 일관된 빈 상태 UI 제공
 */

import { Inbox, Calendar, CheckCircle2, FileText, MessageCircle } from 'lucide-react';

type EmptyStateVariant = 'default' | 'tasks' | 'calendar' | 'chat' | 'documents';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantConfig: Record<EmptyStateVariant, {
  icon: typeof Inbox;
  defaultTitle: string;
  defaultDescription: string;
  color: string;
}> = {
  default: {
    icon: Inbox,
    defaultTitle: '아직 데이터가 없어요',
    defaultDescription: '새로운 항목이 추가되면 여기에 표시됩니다',
    color: '#A996FF'
  },
  tasks: {
    icon: CheckCircle2,
    defaultTitle: '할 일이 없어요',
    defaultDescription: '오늘은 여유로운 하루가 될 것 같아요',
    color: '#4ADE80'
  },
  calendar: {
    icon: Calendar,
    defaultTitle: '예정된 일정이 없어요',
    defaultDescription: '캘린더를 연동하면 일정을 볼 수 있어요',
    color: '#F97316'
  },
  chat: {
    icon: MessageCircle,
    defaultTitle: '대화를 시작해보세요',
    defaultDescription: '알프레도에게 무엇이든 물어보세요',
    color: '#A996FF'
  },
  documents: {
    icon: FileText,
    defaultTitle: '문서가 없어요',
    defaultDescription: '새 문서를 만들거나 가져올 수 있어요',
    color: '#60A5FA'
  }
};

export default function EmptyState({
  variant = 'default',
  title,
  description,
  action
}: EmptyStateProps) {
  var config = variantConfig[variant];
  var IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* 아이콘 */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: config.color + '20' }}
      >
        <IconComponent
          size={32}
          style={{ color: config.color }}
        />
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-white mb-2">
        {title || config.defaultTitle}
      </h3>

      {/* 설명 */}
      <p className="text-sm text-[#999999] dark:text-gray-400 max-w-[240px] leading-relaxed">
        {description || config.defaultDescription}
      </p>

      {/* 액션 버튼 */}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-3 bg-[#A996FF] text-white rounded-xl font-medium text-sm hover:bg-[#9685E6] transition-colors min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
