import { useState, useEffect } from 'react';
import { X, MapPin, AlignLeft, Clock, Calendar, Trash2, ChevronDown, Bell, BellOff } from 'lucide-react';
import { CalendarEvent, CalendarInfo, getEditableCalendars } from '../../services/calendar';

interface EventModalProps {
  event?: CalendarEvent | null;
  selectedDate?: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: Omit<CalendarEvent, 'id'>, calendarId?: string) => void;
  onUpdate?: (eventId: string, event: Omit<CalendarEvent, 'id'>, calendarId?: string) => void;
  onDelete?: (eventId: string, calendarId?: string) => void;
  mode: 'view' | 'edit' | 'create';
}

// 알림 옵션
var REMINDER_OPTIONS = [
  { value: null, label: '알림 없음' },
  { value: 0, label: '일정 시작 시' },
  { value: 5, label: '5분 전' },
  { value: 10, label: '10분 전' },
  { value: 15, label: '15분 전' },
  { value: 30, label: '30분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' }
];

export default function EventModal({
  event,
  selectedDate,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  mode
}: EventModalProps) {
  var initialDate = selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date());

  var [title, setTitle] = useState(event?.title || '');
  var [date, setDate] = useState(event?.start?.split('T')[0] || initialDate);
  var [startTime, setStartTime] = useState(getTimeFromEvent(event?.start) || '09:00');
  var [endTime, setEndTime] = useState(getTimeFromEvent(event?.end) || '10:00');
  var [isAllDay, setIsAllDay] = useState(event?.allDay || false);
  var [description, setDescription] = useState(event?.description || '');
  var [location, setLocation] = useState(event?.location || '');
  var [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');

  // 알림 설정
  var [reminderMinutes, setReminderMinutes] = useState<number | null>(event?.reminderMinutes ?? 15);
  var [showReminderPicker, setShowReminderPicker] = useState(false);

  // Calendar selection
  var [editableCalendars, setEditableCalendars] = useState<CalendarInfo[]>([]);
  var [selectedCalendarId, setSelectedCalendarId] = useState<string>(event?.calendarId || 'primary');
  var [showCalendarPicker, setShowCalendarPicker] = useState(false);

  // Load editable calendars
  useEffect(function() {
    var calendars = getEditableCalendars();
    setEditableCalendars(calendars);

    // Set default calendar
    if (event?.calendarId) {
      setSelectedCalendarId(event.calendarId);
    } else if (calendars.length > 0) {
      var primary = calendars.find(function(c) { return c.primary; });
      setSelectedCalendarId(primary ? primary.id : calendars[0].id);
    }
  }, [event]);

  // Reset form when event changes
  useEffect(function() {
    if (event) {
      setTitle(event.title || '');
      setDate(event.start?.split('T')[0] || initialDate);
      setStartTime(getTimeFromEvent(event.start) || '09:00');
      setEndTime(getTimeFromEvent(event.end) || '10:00');
      setIsAllDay(event.allDay || false);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setSelectedCalendarId(event.calendarId || 'primary');
      setReminderMinutes(event.reminderMinutes ?? 15);
    } else {
      setTitle('');
      setDate(initialDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setIsAllDay(false);
      setDescription('');
      setLocation('');
      setReminderMinutes(15); // 기본값 15분 전
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [event, mode, initialDate]);

  function formatDateForInput(d: Date): string {
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function getTimeFromEvent(dateStr?: string): string {
    if (!dateStr || !dateStr.includes('T')) return '';
    var timePart = dateStr.split('T')[1];
    if (!timePart) return '';
    return timePart.substring(0, 5);
  }

  function formatDisplayDate(dateStr: string): string {
    var d = new Date(dateStr + 'T00:00:00');
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dayOfWeek = dayNames[d.getDay()];
    return month + '월 ' + day + '일 (' + dayOfWeek + ')';
  }

  function getSelectedCalendar(): CalendarInfo | undefined {
    return editableCalendars.find(function(c) { return c.id === selectedCalendarId; });
  }

  function getReminderLabel(minutes: number | null): string {
    var option = REMINDER_OPTIONS.find(function(o) { return o.value === minutes; });
    return option ? option.label : '알림 없음';
  }

  function handleSave() {
    if (!title.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }

    var newEvent: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      start: isAllDay ? date : date + 'T' + startTime,
      end: isAllDay ? date : date + 'T' + endTime,
      allDay: isAllDay,
      description: description,
      location: location,
      reminderMinutes: reminderMinutes
    };

    if (mode === 'create' && onSave) {
      onSave(newEvent, selectedCalendarId);
    } else if (event && onUpdate) {
      onUpdate(event.id, newEvent, event.calendarId || selectedCalendarId);
    }
    onClose();
  }

  function handleDelete() {
    if (event && onDelete) {
      if (confirm('이 일정을 삭제할까요?')) {
        onDelete(event.id, event.calendarId);
        onClose();
      }
    }
  }

  function handleEdit() {
    setIsEditing(true);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? '새 일정' : isEditing ? '일정 수정' : '일정 상세'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="닫기"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* View Mode */}
        {!isEditing && event && (
          <div className="space-y-4">
            {/* Calendar indicator */}
            {event.calendarName && (
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: event.backgroundColor || '#A996FF' }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{event.calendarName}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{event.title}</h3>

            {/* Date & Time */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Calendar size={18} />
              <span>{formatDisplayDate(event.start.split('T')[0])}</span>
              {!event.allDay && (
                <>
                  <Clock size={18} className="ml-2" />
                  <span>{getTimeFromEvent(event.start)} - {getTimeFromEvent(event.end)}</span>
                </>
              )}
              {event.allDay && <span className="text-lavender-500">종일</span>}
            </div>

            {/* Reminder */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              {reminderMinutes !== null ? (
                <>
                  <Bell size={18} className="text-lavender-500" />
                  <span className="text-lavender-500">{getReminderLabel(reminderMinutes)}</span>
                </>
              ) : (
                <>
                  <BellOff size={18} />
                  <span>알림 없음</span>
                </>
              )}
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <AlignLeft size={18} className="mt-0.5" />
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleEdit}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl font-medium hover:bg-lavender-500 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="p-3 text-red-500 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Edit/Create Mode */}
        {isEditing && (
          <div className="space-y-4">
            {/* Calendar Picker (only for create mode) */}
            {mode === 'create' && editableCalendars.length > 1 && (
              <div className="relative">
                <button
                  onClick={function() { setShowCalendarPicker(!showCalendarPicker); }}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSelectedCalendar()?.backgroundColor || '#A996FF' }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{getSelectedCalendar()?.summary || '캘린더 선택'}</span>
                  </div>
                  <ChevronDown size={18} className={'text-gray-400 transition-transform ' + (showCalendarPicker ? 'rotate-180' : '')} />
                </button>

                {showCalendarPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                    {editableCalendars.map(function(cal) {
                      return (
                        <button
                          key={cal.id}
                          onClick={function() {
                            setSelectedCalendarId(cal.id);
                            setShowCalendarPicker(false);
                          }}
                          className={'w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 text-left ' +
                            (cal.id === selectedCalendarId ? 'bg-lavender-50 dark:bg-lavender-900/20' : '')}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cal.backgroundColor || '#A996FF' }}
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{cal.summary}</span>
                          {cal.primary && <span className="text-xs text-gray-400">(기본)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <input
              type="text"
              placeholder="일정 제목"
              value={title}
              onChange={function(e) { setTitle(e.target.value); }}
              className="w-full px-4 py-3 text-lg font-medium border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />

            {/* All Day Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700 dark:text-gray-300">종일</span>
              <button
                onClick={function() { setIsAllDay(!isAllDay); }}
                className={'w-11 h-6 rounded-full transition-colors relative ' +
                  (isAllDay ? 'bg-lavender-400' : 'bg-gray-200 dark:bg-gray-600')}
              >
                <span
                  className={'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ' +
                    (isAllDay ? 'translate-x-6' : 'translate-x-1')}
                />
              </button>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={function(e) { setDate(e.target.value); }}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Time */}
            {!isAllDay && (
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={function(e) { setStartTime(e.target.value); }}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={function(e) { setEndTime(e.target.value); }}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Reminder Picker */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-400" />
                <button
                  type="button"
                  onClick={function() { setShowReminderPicker(!showReminderPicker); }}
                  className="flex-1 flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-left"
                >
                  <span className={reminderMinutes !== null ? 'text-lavender-500' : 'text-gray-500 dark:text-gray-400'}>
                    {getReminderLabel(reminderMinutes)}
                  </span>
                  <ChevronDown size={18} className={'text-gray-400 transition-transform ' + (showReminderPicker ? 'rotate-180' : '')} />
                </button>
              </div>

              {showReminderPicker && (
                <div className="absolute top-full left-7 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
                  {REMINDER_OPTIONS.map(function(option) {
                    return (
                      <button
                        key={option.value === null ? 'none' : option.value}
                        type="button"
                        onClick={function() {
                          setReminderMinutes(option.value);
                          setShowReminderPicker(false);
                        }}
                        className={'w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 ' +
                          (reminderMinutes === option.value ? 'bg-lavender-50 dark:bg-lavender-900/20' : '')}
                      >
                        <span className={option.value !== null ? 'text-lavender-500' : 'text-gray-600 dark:text-gray-300'}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="장소 (선택)"
                value={location}
                onChange={function(e) { setLocation(e.target.value); }}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <AlignLeft size={18} className="text-gray-400 mt-2" />
              <textarea
                placeholder="메모 (선택)"
                value={description}
                onChange={function(e) { setDescription(e.target.value); }}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-lavender-400 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-lavender-400 text-white rounded-xl font-medium hover:bg-lavender-500 transition-colors"
            >
              {mode === 'create' ? '저장' : '수정 완료'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
