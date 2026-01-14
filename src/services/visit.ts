// Daily Visit Tracking Service

var VISIT_KEY = 'alfredo_last_visit';
var ENTRY_SEEN_KEY = 'alfredo_entry_seen';

export interface VisitData {
  lastVisit: string;
  entrySeenToday: boolean;
}

// 마지막 방문 날짜 가져오기
export function getLastVisit(): Date | null {
  var stored = localStorage.getItem(VISIT_KEY);
  if (!stored) return null;
  
  try {
    return new Date(stored);
  } catch {
    return null;
  }
}

// 오늘 첫 방문인지 체크
export function isFirstVisitToday(): boolean {
  var lastVisit = getLastVisit();
  if (!lastVisit) return true;
  
  var today = new Date();
  var isSameDay = (
    lastVisit.getFullYear() === today.getFullYear() &&
    lastVisit.getMonth() === today.getMonth() &&
    lastVisit.getDate() === today.getDate()
  );
  
  return !isSameDay;
}

// 오늘 Entry를 봤는지 체크
export function hasSeenEntryToday(): boolean {
  var today = new Date().toDateString();
  var seenDate = localStorage.getItem(ENTRY_SEEN_KEY);
  return seenDate === today;
}

// Entry 본 것으로 표시
export function markEntryAsSeen(): void {
  var today = new Date().toDateString();
  localStorage.setItem(ENTRY_SEEN_KEY, today);
}

// 방문 기록 업데이트
export function updateVisit(): void {
  var now = new Date();
  localStorage.setItem(VISIT_KEY, now.toISOString());
}

// 연속 방문 일수 계산 (나중에 사용)
export function getVisitStreak(): number {
  // TODO: 구현
  return 1;
}

// 방문 패턴 분석 (나중에 사용)
export function getVisitPattern(): {
  mostActiveTime: string;
  averageVisitsPerDay: number;
} {
  // TODO: 구현
  return {
    mostActiveTime: 'morning',
    averageVisitsPerDay: 3
  };
}