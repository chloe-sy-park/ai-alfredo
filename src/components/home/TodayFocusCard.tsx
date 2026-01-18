/**
 * Today Focus Card
 *
 * 캘린더 미연동 시 표시되는 포커스 기반 Today 카드
 * - 오늘 집중할 만한 Task 최대 3개 표시
 * - 부담 없는 톤으로 제안
 *
 * 자동 생성 금지 - 추천만 제공
 */

import { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import { Task } from '../../services/tasks';

// ============================================================
// Types
// ============================================================

interface TodayFocusCardProps {
  tasks: Task[];
  message: string;
  onSelectTask?: (taskId: string) => void;
  onOpenTask?: (taskId: string) => void;
  className?: string;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Task 상태 라벨
 */
function getStatusLabel(status: Task['status']): string {
  switch (status) {
    case 'in_progress':
      return '진행 중';
    case 'todo':
      return '대기';
    case 'done':
      return '완료';
    default:
      return '';
  }
}

/**
 * 우선순위 표시
 */
function getPriorityIndicator(priority?: string): { color: string; label: string } | null {
  switch (priority) {
    case 'high':
      return { color: 'text-red-500', label: '높음' };
    case 'medium':
      return { color: 'text-yellow-600', label: '중간' };
    case 'low':
      return { color: 'text-gray-400', label: '낮음' };
    default:
      return null;
  }
}

/**
 * 마감일 포맷
 */
function formatDueDate(dueDate?: string): string | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}일 지남`;
  }
  if (diffDays === 0) {
    return '오늘 마감';
  }
  if (diffDays === 1) {
    return '내일 마감';
  }
  return `${diffDays}일 후`;
}

// ============================================================
// Subcomponents
// ============================================================

interface FocusTaskItemProps {
  task: Task;
  onSelect?: () => void;
  onOpen?: () => void;
}

function FocusTaskItem({ task, onSelect, onOpen }: FocusTaskItemProps) {
  const priority = getPriorityIndicator(task.priority);
  const dueLabel = formatDueDate(task.dueDate);
  const isOverdue = dueLabel?.includes('지남');

  return (
    <button
      onClick={onOpen || onSelect}
      className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E5E5]
        bg-white hover:border-[#A996FF] transition-all text-left w-full group"
    >
      {/* 체크 아이콘 */}
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5
          ${task.status === 'in_progress'
            ? 'bg-[#A996FF]'
            : 'border-2 border-[#E5E5E5] group-hover:border-[#A996FF]'
          }
        `}
      >
        {task.status === 'in_progress' && (
          <div className="w-2 h-2 bg-white rounded-full" />
        )}
      </div>

      {/* Task 내용 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] truncate">
          {task.title}
        </p>

        {/* 메타 정보 */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* 상태 */}
          {task.status === 'in_progress' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#F0EDFF] text-[#7C3AED]">
              {getStatusLabel(task.status)}
            </span>
          )}

          {/* 마감일 */}
          {dueLabel && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-[#999999]'}`}>
              {isOverdue ? <AlertCircle size={10} /> : <Clock size={10} />}
              {dueLabel}
            </span>
          )}

          {/* 우선순위 */}
          {priority && (
            <span className={`text-xs ${priority.color}`}>
              {priority.label}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function TodayFocusCard({
  tasks,
  message,
  onSelectTask,
  onOpenTask,
  className = ''
}: TodayFocusCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 최대 3개만 표시
  const visibleTasks = tasks.slice(0, 3);
  const hasMore = tasks.length > 3;

  if (tasks.length === 0) {
    return (
      <Card variant="default" className={`${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <Target size={20} className="text-[#999999]" />
          </div>
          <div>
            <p className="text-sm text-[#666666]">
              오늘 집중할 일을 정해볼까요?
            </p>
            <p className="text-xs text-[#999999] mt-0.5">
              Task를 추가하면 여기에 표시돼요
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" className={`${className}`}>
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F0EDFF] flex items-center justify-center">
            <Target size={20} className="text-[#7C3AED]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#1A1A1A]">
              {message}
            </p>
            <p className="text-xs text-[#999999] mt-0.5">
              오늘 하나만 골라서 해볼까요?
            </p>
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp size={20} className="text-[#999999]" />
        ) : (
          <ChevronDown size={20} className="text-[#999999]" />
        )}
      </button>

      {/* Task 목록 */}
      {isExpanded && (
        <div className="mt-4 space-y-2 animate-fade-in">
          {visibleTasks.map(task => (
            <FocusTaskItem
              key={task.id}
              task={task}
              onSelect={onSelectTask ? () => onSelectTask(task.id) : undefined}
              onOpen={onOpenTask ? () => onOpenTask(task.id) : undefined}
            />
          ))}

          {hasMore && (
            <p className="text-xs text-[#999999] text-center pt-2">
              +{tasks.length - 3}개 더 있어요
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Today Section (Meeting + Focus 통합)
// ============================================================

import { TodayContext } from '../../services/workOS/types';
import { MeetingPrepSection } from '../work/MeetingPrepCard';

interface TodaySectionProps {
  todayContext: TodayContext | null;
  onSelectSuggestion: (meetingId: string, suggestionId: string) => void;
  onDeselectSuggestion: (meetingId: string, suggestionId: string) => void;
  onConfirmTasks: (meetingId: string) => void;
  onOpenTask?: (taskId: string) => void;
  className?: string;
}

export function TodaySection({
  todayContext,
  onSelectSuggestion,
  onDeselectSuggestion,
  onConfirmTasks,
  onOpenTask,
  className = ''
}: TodaySectionProps) {
  if (!todayContext) {
    return null;
  }

  // Meeting-based Today
  if (todayContext.mode === 'meeting-based' && todayContext.meetingAnalyses.length > 0) {
    const recommendableAnalyses = todayContext.meetingAnalyses.filter(a => a.shouldRecommend);

    if (recommendableAnalyses.length > 0) {
      return (
        <MeetingPrepSection
          analyses={recommendableAnalyses}
          onSelectSuggestion={onSelectSuggestion}
          onDeselectSuggestion={onDeselectSuggestion}
          onConfirmTasks={onConfirmTasks}
          className={className}
        />
      );
    }
  }

  // Focus-based Today
  if (todayContext.focusTasks.length > 0) {
    return (
      <TodayFocusCard
        tasks={todayContext.focusTasks}
        message={todayContext.message}
        onOpenTask={onOpenTask}
        className={className}
      />
    );
  }

  return null;
}
