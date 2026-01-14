// FocusNow - 지금 집중할 항목 관리

export interface FocusItem {
  id: string;
  title: string;
  startedAt: string;
  sourceType: 'top3' | 'calendar' | 'manual';
  sourceId?: string;
  // 추가 필드
  startTime?: string; // 실제 시작 시간
  estimatedMinutes?: number; // 예상 시간
  pausedAt?: string; // 일시정지 시간
}

var STORAGE_KEY = 'alfredo_focus_now';

function getTodayKey(): string {
  var now = new Date();
  return now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
}

export function getCurrentFocus(): FocusItem | null {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    var data = JSON.parse(stored);
    
    // 오늘 날짜인지 확인
    if (data.date !== getTodayKey()) {
      return null;
    }
    
    return data.focus as FocusItem;
  } catch (e) {
    console.error('Failed to get focus:', e);
    return null;
  }
}

export function setFocus(item: FocusItem): void {
  try {
    var data = {
      date: getTodayKey(),
      focus: item
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to set focus:', e);
  }
}

export function setFocusFromTop3(id: string, title: string): FocusItem {
  var item: FocusItem = {
    id: id,
    title: title,
    startedAt: new Date().toISOString(),
    sourceType: 'top3',
    sourceId: id
  };
  setFocus(item);
  return item;
}

export function setFocusFromCalendar(eventId: string, title: string): FocusItem {
  var item: FocusItem = {
    id: 'cal-' + eventId,
    title: title,
    startedAt: new Date().toISOString(),
    sourceType: 'calendar',
    sourceId: eventId
  };
  setFocus(item);
  return item;
}

export function setManualFocus(title: string): FocusItem {
  var item: FocusItem = {
    id: 'manual-' + Date.now(),
    title: title,
    startedAt: new Date().toISOString(),
    sourceType: 'manual'
  };
  setFocus(item);
  return item;
}

export function clearFocus(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear focus:', e);
  }
}

// 집중 시간 계산 (분)
export function getFocusDuration(): number {
  var focus = getCurrentFocus();
  if (!focus) return 0;
  
  var start = new Date(focus.startTime || focus.startedAt);
  var now = new Date();
  var diffMs = now.getTime() - start.getTime();
  
  return Math.floor(diffMs / 60000);
}

// 포맷된 집중 시간
export function getFormattedDuration(): string {
  var minutes = getFocusDuration();
  
  if (minutes < 1) return '방금 시작';
  if (minutes < 60) return minutes + '분째 집중 중';
  
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  
  if (mins === 0) return hours + '시간째 집중 중';
  return hours + '시간 ' + mins + '분째 집중 중';
}

// 포커스 시작
export function startFocus(id: string): void {
  var focus = getCurrentFocus();
  if (!focus || focus.id !== id) return;
  
  focus.startTime = new Date().toISOString();
  delete focus.pausedAt;
  setFocus(focus);
}

// 포커스 일시정지
export function pauseFocus(): void {
  var focus = getCurrentFocus();
  if (!focus || focus.pausedAt) return;
  
  focus.pausedAt = new Date().toISOString();
  setFocus(focus);
}

// 포커스 재개
export function resumeFocus(): void {
  var focus = getCurrentFocus();
  if (!focus || !focus.pausedAt) return;
  
  delete focus.pausedAt;
  setFocus(focus);
}
