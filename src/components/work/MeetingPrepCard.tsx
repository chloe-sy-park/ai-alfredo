/**
 * Meeting Prep Card
 *
 * 미팅 준비 카드
 * - 미팅 정보 표시
 * - 미팅 해석 (예: "이 회의는 'OOO를 결정하기 위한 미팅'으로 보여요")
 * - 추천 Task 선택 UI
 *
 * 자동 생성 금지 - 사용자 선택 시에만 Task 생성
 */

import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';
import Card from '../common/Card';
import {
  MeetingAnalysis,
  TaskSuggestion
} from '../../services/workOS/types';
import { CalendarEvent } from '../../services/calendar';

// ============================================================
// Types
// ============================================================

interface MeetingPrepCardProps {
  analysis: MeetingAnalysis;
  onSelectSuggestion: (suggestionId: string) => void;
  onDeselectSuggestion: (suggestionId: string) => void;
  onConfirmTasks: () => void;
  onOpenOriginal?: (event: CalendarEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * 미팅 시간 포맷
 */
function formatMeetingTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${displayHour}:${minutes.toString().padStart(2, '0')}`;
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * 미팅까지 남은 시간
 */
function getTimeUntilMeeting(startTime: string): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();

  if (diffMs < 0) {
    return '진행 중';
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}분 후`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `${hours}시간 후`;
  }

  return `${hours}시간 ${minutes}분 후`;
}

/**
 * 미팅 시간 길이 (분)
 */
function getMeetingDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// ============================================================
// Subcomponents
// ============================================================

interface TaskSuggestionChipProps {
  suggestion: TaskSuggestion;
  onToggle: () => void;
}

function TaskSuggestionChip({ suggestion, onToggle }: TaskSuggestionChipProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left w-full
        ${suggestion.isSelected
          ? 'bg-[#F0EDFF] border-[#A996FF] text-[#7C3AED]'
          : 'bg-white border-[#E5E5E5] text-[#666666] hover:border-[#A996FF]'
        }
      `}
    >
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0
          ${suggestion.isSelected
            ? 'bg-[#A996FF]'
            : 'border-2 border-[#E5E5E5]'
          }
        `}
      >
        {suggestion.isSelected && (
          <Check size={12} className="text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{suggestion.title}</p>
        {suggestion.estimatedMinutes && (
          <p className="text-xs text-[#999999]">
            약 {suggestion.estimatedMinutes}분
          </p>
        )}
      </div>
    </button>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function MeetingPrepCard({
  analysis,
  onSelectSuggestion,
  onDeselectSuggestion,
  onConfirmTasks,
  onOpenOriginal,
  className = ''
}: MeetingPrepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { meeting, interpretation, suggestedTasks, shouldRecommend } = analysis;
  const timeUntil = getTimeUntilMeeting(meeting.start);
  const duration = getMeetingDuration(meeting.start, meeting.end);
  const selectedCount = suggestedTasks.filter(t => t.isSelected).length;

  const handleToggleSuggestion = (suggestion: TaskSuggestion) => {
    if (suggestion.isSelected) {
      onDeselectSuggestion(suggestion.id);
    } else {
      onSelectSuggestion(suggestion.id);
    }
  };

  return (
    <Card
      variant="default"
      className={`overflow-hidden ${className}`}
    >
      {/* 헤더 - 미팅 기본 정보 */}
      <div className="space-y-2">
        {/* 시간 태그 */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
            {timeUntil}
          </span>
          <span className="text-xs text-[#999999]">
            {duration}분
          </span>
        </div>

        {/* 미팅 제목 */}
        <h3 className="font-semibold text-[#1A1A1A]">
          {meeting.title || '미팅'}
        </h3>

        {/* 미팅 시간 */}
        <div className="flex items-center gap-4 text-sm text-[#666666]">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{formatMeetingTime(meeting.start, meeting.end)}</span>
          </div>
        </div>

        {/* 미팅 해석 */}
        <p className="text-sm text-[#7C3AED] mt-2">
          {interpretation}
        </p>
      </div>

      {/* 추천 Task 영역 (펼치기/접기) */}
      {shouldRecommend && suggestedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm"
          >
            <span className="text-[#666666]">
              준비할 것 {suggestedTasks.length}개
              {selectedCount > 0 && (
                <span className="ml-1 text-[#A996FF]">
                  ({selectedCount}개 선택됨)
                </span>
              )}
            </span>
            {isExpanded ? (
              <ChevronUp size={16} className="text-[#999999]" />
            ) : (
              <ChevronDown size={16} className="text-[#999999]" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {/* 추천 Task 목록 */}
              {suggestedTasks.map(suggestion => (
                <TaskSuggestionChip
                  key={suggestion.id}
                  suggestion={suggestion}
                  onToggle={() => handleToggleSuggestion(suggestion)}
                />
              ))}

              {/* 확인 버튼 */}
              {selectedCount > 0 && (
                <button
                  onClick={onConfirmTasks}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl text-sm font-medium
                    bg-[#A996FF] text-white hover:bg-[#9580FF] transition-colors"
                >
                  {selectedCount}개 Task 추가하기
                </button>
              )}

              {/* 안내 문구 */}
              <p className="text-xs text-[#999999] text-center mt-2">
                선택한 항목만 Task로 추가돼요
              </p>
            </div>
          )}
        </div>
      )}

      {/* 원본 일정 열기 */}
      {onOpenOriginal && (
        <button
          onClick={() => onOpenOriginal(meeting)}
          className="flex items-center gap-1.5 mt-4 text-xs text-[#999999] hover:text-[#666666]"
        >
          <ExternalLink size={12} />
          <span>원본 일정 열기</span>
        </button>
      )}
    </Card>
  );
}

// ============================================================
// Meeting Prep Section
// ============================================================

interface MeetingPrepSectionProps {
  analyses: MeetingAnalysis[];
  onSelectSuggestion: (meetingId: string, suggestionId: string) => void;
  onDeselectSuggestion: (meetingId: string, suggestionId: string) => void;
  onConfirmTasks: (meetingId: string) => void;
  onOpenOriginal?: (event: CalendarEvent) => void;
  className?: string;
}

export function MeetingPrepSection({
  analyses,
  onSelectSuggestion,
  onDeselectSuggestion,
  onConfirmTasks,
  onOpenOriginal,
  className = ''
}: MeetingPrepSectionProps) {
  // 추천 가능한 미팅만 표시
  const recommendableAnalyses = analyses.filter(a => a.shouldRecommend);

  if (recommendableAnalyses.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-sm font-medium text-[#666666]">
        오늘 미팅 준비
      </h2>
      {recommendableAnalyses.map((analysis, index) => (
        <MeetingPrepCard
          key={analysis.meeting.id}
          analysis={analysis}
          onSelectSuggestion={(suggestionId) =>
            onSelectSuggestion(analysis.meeting.id, suggestionId)
          }
          onDeselectSuggestion={(suggestionId) =>
            onDeselectSuggestion(analysis.meeting.id, suggestionId)
          }
          onConfirmTasks={() => onConfirmTasks(analysis.meeting.id)}
          onOpenOriginal={onOpenOriginal}
          className="animate-slide-down"
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
