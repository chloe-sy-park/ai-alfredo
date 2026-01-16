import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Zap,
  MessageCircle,
  Plus,
  Smile,
  FileText,
  Timer,
  Calendar,
  X,
  Check,
  Pin
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
}

type SheetType = null | 'condition' | 'memo' | 'calendar';

const FloatingBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const postAction = usePostAction();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // 특정 페이지에서는 플로팅 바 숨기기
  const hiddenPaths = ['/onboarding', '/login', '/body-doubling', '/entry', '/chat'];
  const shouldHide = hiddenPaths.some(function(path) {
    return location.pathname.startsWith(path);
  });

  // ESC 키와 외부 클릭으로 메뉴 닫기
  const handleClickOutside = useCallback(function(event: MouseEvent) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      toggleButtonRef.current &&
      !toggleButtonRef.current.contains(event.target as Node)
    ) {
      setIsExpanded(false);
    }
  }, []);

  const handleEscKey = useCallback(function(event: KeyboardEvent) {
    if (event.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
      toggleButtonRef.current?.focus();
    }
  }, [isExpanded]);

  useEffect(function() {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isExpanded, handleClickOutside, handleEscKey]);

  if (shouldHide) return null;

  var closeSheet = function() { setActiveSheet(null); };

  const quickActions: QuickAction[] = [
    {
      icon: MessageCircle,
      label: '채팅',
      ariaLabel: '알프레도와 채팅하기',
      action: () => {
        setIsExpanded(false);
        navigate('/chat');
      }
    },
    {
      icon: Plus,
      label: '태스크',
      ariaLabel: '새 태스크 추가하기',
      action: () => {
        setIsExpanded(false);
        navigate('/entry');
      }
    },
    {
      icon: Smile,
      label: '컨디션',
      ariaLabel: '오늘 컨디션 기록하기',
      action: () => {
        setIsExpanded(false);
        setActiveSheet('condition');
      }
    },
    {
      icon: FileText,
      label: '메모',
      ariaLabel: '빠른 메모 작성하기',
      action: () => {
        setIsExpanded(false);
        setActiveSheet('memo');
      }
    },
    {
      icon: Timer,
      label: '타이머',
      ariaLabel: '집중 타이머 시작하기',
      action: () => {
        setIsExpanded(false);
        navigate('/body-doubling');
      }
    },
    {
      icon: Calendar,
      label: '일정',
      ariaLabel: '새 일정 추가하기',
      action: () => {
        setIsExpanded(false);
        setActiveSheet('calendar');
      }
    },
  ];

  const handleSubmit = () => {
    if (inputValue.trim()) {
      navigate('/chat', { state: { initialMessage: inputValue } });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 sm:px-6 pb-6 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent safe-area-bottom">
        <div className="max-w-md sm:max-w-lg mx-auto">
          {/* 퀵액션 확장 상태 */}
          {isExpanded && (
            <div
              ref={menuRef}
              className="mb-3 animate-in slide-in-from-bottom-2 duration-300"
              role="menu"
              aria-label="빠른 작업 메뉴"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4">
                <div className="grid grid-cols-3 sm:flex sm:justify-around gap-2 sm:gap-1">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.action}
                        role="menuitem"
                        aria-label={action.ariaLabel}
                        className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all min-w-[60px] min-h-[72px]"
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#A996FF]" />
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                바깥을 탭하거나 ESC로 닫기
              </p>
            </div>
          )}

          {/* 메인 입력 바 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-full shadow-lg border border-gray-100 flex items-center overflow-hidden">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="AlFredo에게 물어보세요..."
                className="flex-1 px-5 py-3.5 text-sm bg-transparent outline-none placeholder:text-gray-400 min-h-[48px]"
                aria-label="알프레도에게 메시지 입력"
              />
              {inputValue && (
                <button
                  onClick={handleSubmit}
                  aria-label="메시지 전송"
                  className="pr-4 text-[#A996FF] hover:text-[#8B7BE8] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* 퀵액션 토글 버튼 - 모바일 터치 타겟 44x44px 이상 */}
            <button
              ref={toggleButtonRef}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-haspopup="menu"
              aria-label={isExpanded ? '빠른 작업 메뉴 닫기' : '빠른 작업 메뉴 열기'}
              title={isExpanded ? '메뉴 닫기' : '빠른 작업'}
              className={`
                w-14 h-14 rounded-full shadow-lg
                flex items-center justify-center
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#A996FF] focus:ring-offset-2
                ${isExpanded
                  ? 'bg-gray-200 text-gray-600 rotate-45'
                  : 'bg-[#A996FF] text-white shadow-[#A996FF]/30 hover:bg-[#8B7BE8]'
                }
              `}
            >
              {isExpanded ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

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
      <div className="bg-white rounded-t-2xl p-6 safe-area-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">오늘 컨디션</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
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
                className={
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[100px] ' +
                  (isSelected
                    ? 'border-[#A996FF] bg-[#F0F0FF]'
                    : 'border-[#F5F5F5] hover:border-[#E5E5E5] hover:bg-gray-50')
                }
              >
                <span className="text-3xl">{info.emoji}</span>
                <span className="text-sm font-medium text-[#666666]">{info.label}</span>
              </button>
            );
          })}
        </div>

        {currentLevel && (
          <p className="text-sm text-[#999999] text-center mt-4">
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
      <div className="bg-white rounded-t-2xl p-6 safe-area-bottom max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">빠른 메모</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
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
            className="flex-1 px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#A996FF]"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newContent.trim()}
            className="px-4 py-3 bg-[#A996FF] text-white font-medium rounded-xl hover:bg-[#8B7BE8] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className={
                  'flex items-start gap-3 p-3 rounded-xl ' +
                  (memo.pinned ? 'bg-[#FFFBEB] border border-[#FFD700]/30' : 'bg-[#F5F5F5]')
                }
              >
                <button
                  onClick={function() { handleToggleComplete(memo.id); }}
                  className="w-5 h-5 rounded-full border-2 border-[#E5E5E5] hover:border-[#A996FF] flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  {memo.completed && <Check size={12} className="text-[#4ADE80]" />}
                </button>
                <p className="flex-1 text-sm text-[#1A1A1A]">{memo.content}</p>
                <div className="flex gap-1">
                  <button
                    onClick={function() { handleTogglePin(memo.id); }}
                    className={
                      'p-1.5 rounded-lg ' +
                      (memo.pinned ? 'text-[#FFD700]' : 'text-[#999999] hover:text-[#FFD700]')
                    }
                  >
                    <Pin size={14} className={memo.pinned ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={function() { handleDelete(memo.id); }}
                    className="p-1.5 text-[#999999] hover:text-[#EF4444] rounded-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {memos.length === 0 && (
            <p className="text-center text-sm text-[#999999] py-4">
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

  return (
    <SheetOverlay onClose={onClose}>
      <div className="bg-white rounded-t-2xl p-6 safe-area-bottom max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">새 일정</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-1 block">제목</label>
            <input
              type="text"
              value={title}
              onChange={function(e) { setTitle(e.target.value); }}
              placeholder="일정 제목"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#A996FF]"
              autoFocus
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-1 block">날짜</label>
            <input
              type="date"
              value={date}
              onChange={function(e) { setDate(e.target.value); }}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#A996FF]"
            />
          </div>

          {/* 종일 토글 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDay}
              onChange={function(e) { setIsAllDay(e.target.checked); }}
              className="w-5 h-5 rounded border-[#E5E5E5] text-[#A996FF] focus:ring-[#A996FF]"
            />
            <label htmlFor="allDay" className="text-sm text-[#666666]">종일</label>
          </div>

          {/* 시간 */}
          {!isAllDay && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#666666] mb-1 block">시작</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={function(e) { setStartTime(e.target.value); }}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#A996FF]"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-[#666666] mb-1 block">종료</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={function(e) { setEndTime(e.target.value); }}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#A996FF]"
                />
              </div>
            </div>
          )}

          {/* 캘린더 선택 */}
          {calendars.length > 1 && (
            <div>
              <label className="text-sm font-medium text-[#666666] mb-1 block">캘린더</label>
              <select
                value={selectedCalendarId}
                onChange={function(e) { setSelectedCalendarId(e.target.value); }}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:border-[#A996FF] bg-white"
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
            className="w-full py-4 bg-[#A996FF] text-white font-medium rounded-xl hover:bg-[#8B7BE8] disabled:opacity-50 disabled:cursor-not-allowed"
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
