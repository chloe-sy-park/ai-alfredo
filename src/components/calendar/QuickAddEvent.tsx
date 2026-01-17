/**
 * QuickAddEvent - 빠른 일정 추가 컴포넌트
 *
 * 특징:
 * - FAB에서 바로 접근 가능
 * - 제목 입력 → 날짜 선택 → 저장 (2-3단계)
 * - 인라인 폼으로 빠른 입력
 */

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { CalendarEvent, getEditableCalendars } from '../../services/calendar';

interface QuickAddEventProps {
  selectedDate?: Date;
  onSave: (event: Omit<CalendarEvent, 'id'>, calendarId?: string) => void;
  onCancel?: () => void;
  className?: string;
}

const formatDateForInput = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function QuickAddEvent({
  selectedDate,
  onSave,
  onCancel,
  className = '',
}: QuickAddEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime] = useState('10:00'); // 빠른 추가에서는 1시간 고정
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');

  const inputRef = useRef<HTMLInputElement>(null);

  // 캘린더 목록 로드
  useEffect(() => {
    const editableCalendars = getEditableCalendars();
    if (editableCalendars.length > 0) {
      const primary = editableCalendars.find((c) => c.primary);
      setSelectedCalendarId(primary ? primary.id : editableCalendars[0].id);
    }
  }, []);

  // 날짜 변경 시 업데이트
  useEffect(() => {
    if (selectedDate) {
      setDate(formatDateForInput(selectedDate));
    }
  }, [selectedDate]);

  // 확장 시 자동 포커스
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setTitle('');
    onCancel?.();
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      start: isAllDay ? date : `${date}T${startTime}`,
      end: isAllDay ? date : `${date}T${endTime}`,
      allDay: isAllDay,
    };

    onSave(newEvent, selectedCalendarId);
    setTitle('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCollapse();
    }
  };

  if (!isExpanded) {
    // FAB 버튼
    return (
      <button
        onClick={handleExpand}
        className={`fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center z-40 ${className}`}
        aria-label="빠른 일정 추가"
      >
        <Plus size={24} />
      </button>
    );
  }

  // 확장된 빠른 입력 폼
  return (
    <div className={`fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-scaleIn ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-primary dark:text-white">빠른 일정 추가</span>
        <button
          onClick={handleCollapse}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="닫기"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* 제목 입력 */}
      <input
        ref={inputRef}
        type="text"
        placeholder="일정 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white placeholder:text-gray-400 mb-3"
        aria-label="일정 제목"
      />

      {/* 날짜 & 시간 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1 flex-1">
          <Calendar size={14} className="text-gray-400" aria-hidden="true" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white"
            aria-label="날짜"
          />
        </div>

        {!isAllDay && (
          <>
            <Clock size={14} className="text-gray-400" aria-hidden="true" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-16 px-1 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white"
              aria-label="시작 시간"
            />
          </>
        )}
      </div>

      {/* 종일 & 저장 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsAllDay(!isAllDay)}
          className={`px-2 py-1 text-xs rounded-full transition-colors ${
            isAllDay
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400'
          }`}
          aria-pressed={isAllDay}
        >
          종일
        </button>

        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            title.trim()
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          저장
        </button>
      </div>
    </div>
  );
}
