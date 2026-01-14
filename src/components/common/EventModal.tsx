import { useState, useEffect } from 'react';
import { X, MapPin, AlignLeft, Clock, Calendar, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';

interface EventModalProps {
  event?: CalendarEvent | null;
  selectedDate?: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: (eventId: string) => void;
  mode: 'view' | 'edit' | 'create';
}

export default function EventModal({ 
  event, 
  selectedDate,
  isOpen, 
  onClose, 
  onSave,
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
    } else {
      setTitle('');
      setDate(initialDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setIsAllDay(false);
      setDescription('');
      setLocation('');
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
      location: location
    };

    if (onSave) {
      onSave(newEvent);
    }
    onClose();
  }

  function handleDelete() {
    if (event && onDelete) {
      if (confirm('이 일정을 삭제할까요?')) {
        onDelete(event.id);
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
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 animate-slideUp safe-area-bottom">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {mode === 'create' ? '새 일정' : isEditing ? '일정 수정' : '일정 상세'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
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
                <span className="text-sm text-gray-500">{event.calendarName}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold">{event.title}</h3>

            {/* Date & Time */}
            <div className="flex items-center gap-3 text-gray-600">
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

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-3 text-gray-600">
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
                className="p-3 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Edit/Create Mode */}
        {isEditing && (
          <div className="space-y-4">
            {/* Title */}
            <input
              type="text"
              placeholder="일정 제목"
              value={title}
              onChange={function(e) { setTitle(e.target.value); }}
              className="w-full px-4 py-3 text-lg font-medium border border-gray-200 rounded-xl focus:outline-none focus:border-lavender-400"
              autoFocus
            />

            {/* All Day Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">종일</span>
              <button
                onClick={function() { setIsAllDay(!isAllDay); }}
                className={'w-11 h-6 rounded-full transition-colors relative ' + 
                  (isAllDay ? 'bg-lavender-400' : 'bg-gray-200')}
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
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-lavender-400"
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
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-lavender-400"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={function(e) { setEndTime(e.target.value); }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-lavender-400"
                />
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="장소 (선택)"
                value={location}
                onChange={function(e) { setLocation(e.target.value); }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-lavender-400"
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
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-lavender-400 resize-none"
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
