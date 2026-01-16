// Daily Visit Tracking Service

var VISIT_KEY = 'alfredo_last_visit';
var ENTRY_SEEN_KEY = 'alfredo_entry_seen';
var VISIT_HISTORY_KEY = 'alfredo_visit_history';

export interface VisitData {
  lastVisit: string;
  entrySeenToday: boolean;
}

export interface VisitHistoryEntry {
  date: string; // YYYY-MM-DD
  visits: number;
  times: string[]; // HH:MM
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

// 방문 히스토리 가져오기
function getVisitHistory(): VisitHistoryEntry[] {
  try {
    var stored = localStorage.getItem(VISIT_HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as VisitHistoryEntry[];
  } catch {
    return [];
  }
}

// 방문 히스토리 저장
function saveVisitHistory(history: VisitHistoryEntry[]): void {
  // 최근 30일만 유지
  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  var thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  var filtered = history.filter(function(entry) {
    return entry.date >= thirtyDaysAgoStr;
  });

  localStorage.setItem(VISIT_HISTORY_KEY, JSON.stringify(filtered));
}

// 방문 기록 업데이트
export function updateVisit(): void {
  var now = new Date();
  var todayStr = now.toISOString().split('T')[0];
  var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  localStorage.setItem(VISIT_KEY, now.toISOString());

  // 히스토리 업데이트
  var history = getVisitHistory();
  var todayEntry = history.find(function(entry) { return entry.date === todayStr; });

  if (todayEntry) {
    todayEntry.visits++;
    todayEntry.times.push(timeStr);
  } else {
    history.push({
      date: todayStr,
      visits: 1,
      times: [timeStr]
    });
  }

  saveVisitHistory(history);
}

// 연속 방문 일수 계산
export function getVisitStreak(): number {
  var history = getVisitHistory();
  if (history.length === 0) return 0;

  // 날짜순 정렬 (최신 먼저)
  var sorted = [...history].sort(function(a, b) {
    return b.date.localeCompare(a.date);
  });

  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];

  // 오늘 방문 기록이 없으면 어제부터 확인
  var startDate = new Date();
  if (!sorted.find(function(entry) { return entry.date === todayStr; })) {
    startDate.setDate(startDate.getDate() - 1);
  }

  var streak = 0;
  var checkDate = new Date(startDate);

  for (var i = 0; i < 30; i++) {
    var checkDateStr = checkDate.toISOString().split('T')[0];
    var hasVisit = sorted.some(function(entry) { return entry.date === checkDateStr; });

    if (hasVisit) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// 방문 패턴 분석
export function getVisitPattern(): {
  mostActiveTime: 'morning' | 'afternoon' | 'evening' | 'night';
  averageVisitsPerDay: number;
} {
  var history = getVisitHistory();

  if (history.length === 0) {
    return {
      mostActiveTime: 'morning',
      averageVisitsPerDay: 0
    };
  }

  // 시간대별 방문 수 계산
  var timeSlots = {
    morning: 0,   // 6-12
    afternoon: 0, // 12-18
    evening: 0,   // 18-22
    night: 0      // 22-6
  };

  var totalVisits = 0;

  history.forEach(function(entry) {
    totalVisits += entry.visits;

    entry.times.forEach(function(time) {
      var hour = parseInt(time.split(':')[0], 10);

      if (hour >= 6 && hour < 12) {
        timeSlots.morning++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots.afternoon++;
      } else if (hour >= 18 && hour < 22) {
        timeSlots.evening++;
      } else {
        timeSlots.night++;
      }
    });
  });

  // 가장 활발한 시간대 찾기
  var mostActiveTime: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
  var maxVisits = 0;

  (Object.keys(timeSlots) as Array<keyof typeof timeSlots>).forEach(function(slot) {
    if (timeSlots[slot] > maxVisits) {
      maxVisits = timeSlots[slot];
      mostActiveTime = slot;
    }
  });

  // 평균 방문 수 계산
  var averageVisitsPerDay = history.length > 0
    ? Math.round((totalVisits / history.length) * 10) / 10
    : 0;

  return {
    mostActiveTime: mostActiveTime,
    averageVisitsPerDay: averageVisitsPerDay
  };
}

// 오늘 방문 횟수
export function getTodayVisitCount(): number {
  var history = getVisitHistory();
  var todayStr = new Date().toISOString().split('T')[0];
  var todayEntry = history.find(function(entry) { return entry.date === todayStr; });
  return todayEntry ? todayEntry.visits : 0;
}

// 주간 방문 통계
export function getWeeklyStats(): { date: string; visits: number }[] {
  var history = getVisitHistory();
  var result: { date: string; visits: number }[] = [];

  var today = new Date();
  for (var i = 6; i >= 0; i--) {
    var date = new Date(today);
    date.setDate(date.getDate() - i);
    var dateStr = date.toISOString().split('T')[0];

    var entry = history.find(function(h) { return h.date === dateStr; });
    result.push({
      date: dateStr,
      visits: entry ? entry.visits : 0
    });
  }

  return result;
}
