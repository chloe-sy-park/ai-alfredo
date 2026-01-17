/**
 * EventDrawer - ADHD-friendly 일정 편집 Drawer
 *
 * 특징:
 * - 단일 Quick Edit 모드 (view/edit/create 통합)
 * - 터치하면 바로 편집 가능
 * - 최소한의 필수 필드만 표시
 * - 추가 옵션은 "더보기" 아코디언
 */

import { useState, useEffect } from 'react';
import { X, MapPin, AlignLeft, Clock, Calendar, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarEvent, CalendarInfo, getEditableCalendars } from '../../services/calendar';

interface EventDrawerProps {
  event?: CalendarEvent | null;
  selectedDate?: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: Omit<CalendarEvent, 'id'>, calendarId?: string) => void;
  onUpdate?: (eventId: string, event: Omit<CalendarEvent, 'id'>, calendarId?: string) => void;
  onDelete?: (eventId: string, calendarId?: string) => void;
}

const formatDateForInput = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTimeFromEvent = (dateStr?: string): string => {
  if (!dateStr || !dateStr.includes('T')) return '';
  const timePart = dateStr.split('T')[1];
  if (!timePart) return '';
  return timePart.substring(0, 5);
};

export default function EventDrawer({
  event,
  selectedDate,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
}: EventDrawerProps) {
  const isCreate = !event;
  const initialDate = selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date());

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Calendar selection
  const [editableCalendars, setEditableCalendars] = useState<CalendarInfo[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  // Load editable calendars
  useEffect(() => {
    const calendars = getEditableCalendars();
    setEditableCalendars(calendars);

    if (event?.calendarId) {
      setSelectedCalendarId(event.calendarId);
    } else if (calendars.length > 0) {
      const primary = calendars.find((c) => c.primary);
      setSelectedCalendarId(primary ? primary.id : calendars[0].id);
    }
  }, [event]);

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDate(event.start?.split('T')[0] || initialDate);
      setStartTime(getTimeFromEvent(event.start) || '09:00');
      setEndTime(getTimeFromEvent(event.end) || '10:00');
      setIsAllDay(event.allDay || false);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setSelectedCalendarId(event.calendarId || 'primary');
      // 기존 이벤트에 상세 정보가 있으면 고급 옵션 펼침
      setShowAdvanced(!!(event.location || event.description));
    } else {
      setTitle('');
      setDate(initialDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setIsAllDay(false);
      setDescription('');
      setLocation('');
      setShowAdvanced(false);
    }
  }, [event, initialDate]);

  const getSelectedCalendar = (): CalendarInfo | undefined => {
    return editableCalendars.find((c) => c.id === selectedCalendarId);
  };

  const handleSave = () => {
    if (!title.trim()) {
      return; // 제목이 없으면 저장하지 않음 (조용히 무시 - ADHD 친화)
    }

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      start: isAllDay ? date : `${date}T${startTime}`,
      end: isAllDay ? date : `${date}T${endTime}`,
      allDay: isAllDay,
      description,
      location,
    };

    if (isCreate && onSave) {
      onSave(newEvent, selectedCalendarId);
    } else if (event && onUpdate) {
      onUpdate(event.id, newEvent, event.calendarId || selectedCalendarId);
    }
    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id, event.calendarId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom max-h-[80vh] overflow-y-auto">
        {/* Handle - 드래그 핸들 */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Header - 간결하게 */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="drawer-title" className="text-lg font-bold text-text-primary dark:text-white">
            {isCreate ? '빠른 일정 추가' : '일정 편집'}
          </h2>
          <div className="flex items-center gap-2">
            {!isCreate && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                aria-label="일정 삭제"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="닫기"
            >
              <X size={20} className="text-text-secondary dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Quick Edit Form - 필수 필드만 */}
        <div className="space-y-3">
          {/* 제목 - 가장 중요 */}
          <input
            type="text"
            placeholder="일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-lg font-medium border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white placeholder:text-gray-400"
            autoFocus
            aria-label="일정 제목"
          />

          {/* 날짜 & 시간 - 한 줄로 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Calendar size={16} className="text-gray-400" aria-hidden="true" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                aria-label="날짜"
              />
            </div>

            {!isAllDay && (
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-gray-400" aria-hidden="true" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-20 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                  aria-label="시작 시간"
                />
                <span className="text-gray-400 text-sm">~</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-20 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                  aria-label="종료 시간"
                />
              </div>
            )}
          </div>

          {/* 종일 토글 */}
          <button
            onClick={() => setIsAllDay(!isAllDay)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              isAllDay
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-400'
            }`}
            aria-pressed={isAllDay}
          >
            종일
          </button>

          {/* 캘린더 선택 (create 모드에서만, 여러 캘린더 있을 때) */}
          {isCreate && editableCalendars.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowCalendarPicker(!showCalendarPicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getSelectedCalendar()?.backgroundColor || '#A996FF' }}
                  />
                  <span className="text-text-primary dark:text-white">{getSelectedCalendar()?.summary || '캘린더'}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCalendarPicker ? 'rotate-180' : ''}`} />
              </button>

              {showCalendarPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 overflow-hidden">
                  {editableCalendars.map((cal) => (
                    <button
                      key={cal.id}
                      onClick={() => {
                        setSelectedCalendarId(cal.id);
                        setShowCalendarPicker(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-left ${
                        cal.id === selectedCalendarId ? 'bg-primary/10' : ''
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cal.backgroundColor || '#A996FF' }}
                      />
                      <span className="text-text-primary dark:text-white">{cal.summary}</span>
                      {cal.primary && <span className="text-xs text-gray-400">(기본)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 고급 옵션 토글 */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-text-secondary"
          >
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>더보기 (장소, 메모)</span>
          </button>

          {/* 고급 옵션 - 아코디언 */}
          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              {/* 장소 */}
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="장소"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white placeholder:text-gray-400"
                  aria-label="장소"
                />
              </div>

              {/* 메모 */}
              <div className="flex items-start gap-2">
                <AlignLeft size={16} className="text-gray-400 mt-2" aria-hidden="true" />
                <textarea
                  placeholder="메모"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-gray-700 text-text-primary dark:text-white placeholder:text-gray-400 resize-none"
                  aria-label="메모"
                />
              </div>
            </div>
          )}

          {/* 저장 버튼 - 항상 보이는 CTA */}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              title.trim()
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCreate ? '저장' : '수정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
