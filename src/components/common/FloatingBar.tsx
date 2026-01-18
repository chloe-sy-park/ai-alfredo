import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Zap,
  Send,
  Plus,
  Smile,
  FileText,
  Calendar,
  X,
  Check,
  Pin,
} from 'lucide-react';
import {
  ConditionLevel,
  conditionConfig,
  getTodayCondition,
  setTodayCondition
} from '../../services/condition/conditionService';
import {
  addMemo,
  getMemos,
  toggleMemoComplete,
  toggleMemoPin,
  deleteMemo,
  MemoItem
} from '../../services/quickMemo';
import { addEvent, CalendarEvent, getEditableCalendars, CalendarInfo } from '../../services/calendar/calendarService';
import { usePostAction } from '../../stores/postActionStore';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  ariaLabel: string;
  action: () => void;
  primary?: boolean;
}

type SheetType = null | 'condition' | 'memo' | 'calendar' | 'more';

const FloatingBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const postAction = usePostAction();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 특정 페이지에서는 플로팅 바 숨기기
  const hiddenPaths = ['/onboarding', '/login', '/body-doubling', '/entry', '/chat'];
  const shouldHide = hiddenPaths.some(function(path) {
    return location.pathname.startsWith(path);
  });

  // 외부 클릭으로 입력 포커스 해제
  const handleClickOutside = useCallback(function(event: MouseEvent) {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node) &&
      isInputFocused
    ) {
      setIsInputFocused(false);
    }
  }, [isInputFocused]);

  const handleEscKey = useCallback(function(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      setIsInputFocused(false);
      setActiveSheet(null);
      inputRef.current?.blur();
    }
  }, []);

  useEffect(function() {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleClickOutside, handleEscKey]);

  if (shouldHide) return null;

  var closeSheet = function() { setActiveSheet(null); };

  // 자주 사용하는 퀵액션 (메인)
  const primaryActions: QuickAction[] = [
    {
      icon: Plus,
      label: '태스크',
      ariaLabel: '새 태스크 추가하기',
      action: () => navigate('/entry'),
      primary: true,
    },
    {
      icon: Smile,
      label: '컨디션',
      ariaLabel: '오늘 컨디션 기록하기',
      action: () => setActiveSheet('condition'),
    },
    {
      icon: FileText,
      label: '메모',
      ariaLabel: '빠른 메모 작성하기',
      action: () => setActiveSheet('memo'),
    },
    {
      icon: Calendar,
      label: '일정',
      ariaLabel: '새 일정 추가하기',
      action: () => setActiveSheet('calendar'),
    },
  ];

  const handleSubmit = () => {
    if (inputValue.trim()) {
      navigate('/chat', { state: { initialMessage: inputValue } });
      setInputValue('');
      setIsInputFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    setActiveSheet(null);
  };

  const handleQuickButtonClick = () => {
    if (isInputFocused) {
      setIsInputFocused(false);
      inputRef.current?.blur();
    }
    setActiveSheet(activeSheet ? null : 'more');
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pt-2"
        style={{
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(to top, var(--surface-default), var(--surface-default) 80%, transparent)'
        }}
      >
        <div ref={containerRef} className="max-w-md sm:max-w-lg mx-auto">
          {/* 메인 입력 바 */}
          <div className="flex items-center gap-2">
            {/* 채팅 입력창 - 포커스 시 확장 */}
            <div
              className={`
                flex-1 rounded-full shadow-lg
                flex items-center overflow-hidden
                transition-all duration-300 ease-out
                ${isInputFocused ? 'flex-[1]' : 'flex-[0.85]'}
              `}
              style={{
                backgroundColor: 'var(--surface-default)',
                border: '1px solid var(--border-default)'
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder="알프레도에게 물어보세요..."
                className="flex-1 px-5 py-3.5 text-sm bg-transparent outline-none min-h-[48px]"
                style={{ color: 'var(--text-primary)' }}
                aria-label="알프레도에게 메시지 입력"
              />

              {/* 전송 버튼 - 포커스 상태이고 내용이 있을 때만 표시 */}
              {isInputFocused && (
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  aria-label="메시지 전송"
                  className="mr-2 p-2.5 rounded-full transition-all duration-200"
                  style={inputValue.trim()
                    ? { backgroundColor: 'var(--accent-primary)', color: 'var(--accent-on)' }
                    : { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-tertiary)' }
                  }
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 퀵버튼 - 입력 포커스 시 축소/후퇴 */}
            <button
              onClick={handleQuickButtonClick}
              aria-expanded={activeSheet === 'more'}
              aria-haspopup="menu"
              aria-label={activeSheet === 'more' ? '빠른 작업 메뉴 닫기' : '빠른 작업 메뉴 열기'}
              title={activeSheet === 'more' ? '메뉴 닫기' : '빠른 작업'}
              className={`
                rounded-full shadow-lg
                flex items-center justify-center
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isInputFocused
                  ? 'w-10 h-10 opacity-60 scale-90'
                  : 'w-14 h-14'
                }
              `}
              style={activeSheet === 'more'
                ? { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }
                : { backgroundColor: 'var(--accent-primary)', color: 'var(--accent-on)' }
              }
            >
              {activeSheet === 'more'
                ? <X className={isInputFocused ? 'w-4 h-4' : 'w-5 h-5'} />
                : <Zap className={isInputFocused ? 'w-4 h-4' : 'w-5 h-5'} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* 퀵액션 메뉴 시트 */}
      {activeSheet === 'more' && (
        <QuickActionSheet
          actions={primaryActions}
          onClose={closeSheet}
        />
      )}

      {/* Bottom Sheets */}
      {activeSheet === 'condition' && (
        <ConditionSheet onClose={closeSheet} postAction={postAction} />
      )}
      {activeSheet === 'memo' && (
        <MemoSheet onClose={closeSheet} postAction={postAction} />
      )}
      {activeSheet === 'calendar' && (
        <CalendarSheet onClose={closeSheet} />
      )}
    </>
  );
};

// Quick Action Sheet Component
function QuickActionSheet({
  actions,
  onClose,
}: {
  actions: QuickAction[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[55]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-24 left-0 right-0 px-4 sm:px-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-md sm:max-w-lg mx-auto">
          <div
            className="rounded-2xl shadow-xl p-4"
            style={{
              backgroundColor: 'var(--surface-default)',
              border: '1px solid var(--border-default)'
            }}
          >
            {/* 퀵액션 그리드 */}
            <div className="grid grid-cols-4 gap-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      onClose();
                      action.action();
                    }}
                    aria-label={action.ariaLabel}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl active:scale-95 transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={action.primary
                        ? { backgroundColor: 'var(--accent-primary)', color: 'var(--accent-on)' }
                        : { backgroundColor: 'var(--surface-subtle)', color: 'var(--accent-primary)' }
                      }
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
            바깥을 탭하거나 ESC로 닫기
          </p>
        </div>
      </div>
    </div>
  );
}

// Sheet Overlay Component
function SheetOverlay({
  children,
  onClose
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom duration-300">
        {children}
      </div>
    </div>
  );
}

// Condition Sheet Component
function ConditionSheet({
  onClose,
  postAction
}: {
  onClose: () => void;
  postAction: ReturnType<typeof usePostAction>;
}) {
  const [currentLevel, setCurrentLevel] = useState<ConditionLevel | null>(null);
  const levels: ConditionLevel[] = ['great', 'good', 'normal', 'bad'];

  useEffect(function() {
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCurrentLevel(todayCondition.level);
    }
  }, []);

  function handleSelect(level: ConditionLevel) {
    setTodayCondition(level);
    setCurrentLevel(level);
    postAction.onConditionUpdated(level);
    onClose();
  }

  return (
    <SheetOverlay onClose={onClose}>
      <div className="rounded-t-2xl p-6 safe-area-bottom" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>오늘 컨디션</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {levels.map(function(level) {
            var info = conditionConfig[level];
            var isSelected = level === currentLevel;
            return (
              <button
                key={level}
                onClick={function() { handleSelect(level); }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[100px]"
                style={isSelected
                  ? { borderColor: 'var(--accent-primary)', backgroundColor: 'rgba(169, 150, 255, 0.1)' }
                  : { borderColor: 'var(--border-default)', backgroundColor: 'transparent' }
                }
              >
                <span className="text-3xl">{info.emoji}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{info.label}</span>
              </button>
            );
          })}
        </div>

        {currentLevel && (
          <p className="text-sm text-center mt-4" style={{ color: 'var(--text-tertiary)' }}>
            {conditionConfig[currentLevel].message}
          </p>
        )}
      </div>
    </SheetOverlay>
  );
}

// Memo Sheet Component
function MemoSheet({
  onClose,
  postAction
}: {
  onClose: () => void;
  postAction: ReturnType<typeof usePostAction>;
}) {
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [newContent, setNewContent] = useState('');

  useEffect(function() {
    loadMemos();
  }, []);

  function loadMemos() {
    var data = getMemos();
    setMemos(data.filter(function(m) { return !m.completed; }).slice(0, 5));
  }

  function handleAdd() {
    if (!newContent.trim()) return;
    addMemo(newContent.trim());
    loadMemos();
    setNewContent('');
    postAction.onMemoSaved();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleToggleComplete(id: string) {
    toggleMemoComplete(id);
    loadMemos();
  }

  function handleTogglePin(id: string) {
    toggleMemoPin(id);
    loadMemos();
  }

  function handleDelete(id: string) {
    deleteMemo(id);
    loadMemos();
  }

  return (
    <SheetOverlay onClose={onClose}>
      <div className="rounded-t-2xl p-6 safe-area-bottom max-h-[70vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>빠른 메모</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 입력 필드 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newContent}
            onChange={function(e) { setNewContent(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="기억할 것을 입력하세요"
            className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newContent.trim()}
            className="px-4 py-3 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--accent-on)' }}
          >
            추가
          </button>
        </div>

        {/* 메모 리스트 */}
        <div className="space-y-2">
          {memos.map(function(memo) {
            return (
              <div
                key={memo.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={memo.pinned
                  ? { backgroundColor: 'var(--state-warning-bg)', border: '1px solid var(--state-warning)' }
                  : { backgroundColor: 'var(--surface-subtle)' }
                }
              >
                <button
                  onClick={function() { handleToggleComplete(memo.id); }}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {memo.completed && <Check size={12} style={{ color: 'var(--state-success)' }} />}
                </button>
                <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{memo.content}</p>
                <div className="flex gap-1">
                  <button
                    onClick={function() { handleTogglePin(memo.id); }}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: memo.pinned ? 'var(--state-warning)' : 'var(--text-tertiary)' }}
                  >
                    <Pin size={14} className={memo.pinned ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={function() { handleDelete(memo.id); }}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {memos.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: 'var(--text-tertiary)' }}>
              아직 메모가 없어요
            </p>
          )}
        </div>
      </div>
    </SheetOverlay>
  );
}

// Calendar Sheet Component
function CalendarSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(function() {
    var editableCalendars = getEditableCalendars();
    setCalendars(editableCalendars);
    if (editableCalendars.length > 0) {
      var primary = editableCalendars.find(function(c) { return c.primary; });
      setSelectedCalendarId(primary ? primary.id : editableCalendars[0].id);
    }
  }, []);

  async function handleSubmit() {
    if (!title.trim()) return;

    setIsSubmitting(true);

    var event: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      start: isAllDay ? date : date + 'T' + startTime + ':00',
      end: isAllDay ? date : date + 'T' + endTime + ':00',
      allDay: isAllDay
    };

    try {
      await addEvent(event, selectedCalendarId);
      onClose();
    } catch (error) {
      console.error('Failed to add event:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--surface-default)'
  };

  return (
    <SheetOverlay onClose={onClose}>
      <div className="rounded-t-2xl p-6 safe-area-bottom max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-default)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>새 일정</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>제목</label>
            <input
              type="text"
              value={title}
              onChange={function(e) { setTitle(e.target.value); }}
              placeholder="일정 제목"
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle}
              autoFocus
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>날짜</label>
            <input
              type="date"
              value={date}
              onChange={function(e) { setDate(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* 종일 토글 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDay}
              onChange={function(e) { setIsAllDay(e.target.checked); }}
              className="w-5 h-5 rounded"
              style={{ borderColor: 'var(--border-default)', accentColor: 'var(--accent-primary)' }}
            />
            <label htmlFor="allDay" className="text-sm" style={{ color: 'var(--text-secondary)' }}>종일</label>
          </div>

          {/* 시간 */}
          {!isAllDay && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>시작</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={function(e) { setStartTime(e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>종료</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={function(e) { setEndTime(e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* 캘린더 선택 */}
          {calendars.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>캘린더</label>
              <select
                value={selectedCalendarId}
                onChange={function(e) { setSelectedCalendarId(e.target.value); }}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={inputStyle}
              >
                {calendars.map(function(cal) {
                  return (
                    <option key={cal.id} value={cal.id}>
                      {cal.summary}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="w-full py-4 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--accent-on)' }}
          >
            {isSubmitting ? '저장 중...' : '일정 추가'}
          </button>
        </div>
      </div>
    </SheetOverlay>
  );
}

// Helper function
function formatDateForInput(d: Date): string {
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export default FloatingBar;
