// QuickMemo - 기억해야 할 것들 관리

export interface MemoItem {
  id: string;
  content: string;
  createdAt: string;
  completed: boolean;
  pinned: boolean;
}

var STORAGE_KEY = 'alfredo_quick_memos';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getMemos(): MemoItem[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    var memos = JSON.parse(stored) as MemoItem[];
    
    // 고정된 것 먼저, 그 다음 최신순
    return memos.sort(function(a, b) {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (e) {
    console.error('Failed to get memos:', e);
    return [];
  }
}

export function saveMemos(memos: MemoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  } catch (e) {
    console.error('Failed to save memos:', e);
  }
}

export function addMemo(content: string): MemoItem {
  var memos = getMemos();
  
  var newMemo: MemoItem = {
    id: generateId(),
    content: content,
    createdAt: new Date().toISOString(),
    completed: false,
    pinned: false
  };
  
  memos.push(newMemo);
  saveMemos(memos);
  
  return newMemo;
}

export function updateMemo(id: string, updates: Partial<MemoItem>): void {
  var memos = getMemos();
  
  memos = memos.map(function(memo) {
    if (memo.id === id) {
      return { ...memo, ...updates };
    }
    return memo;
  });
  
  saveMemos(memos);
}

export function toggleMemoComplete(id: string): boolean {
  var memos = getMemos();
  var newCompleted = false;
  
  memos = memos.map(function(memo) {
    if (memo.id === id) {
      newCompleted = !memo.completed;
      return { ...memo, completed: newCompleted };
    }
    return memo;
  });
  
  saveMemos(memos);
  return newCompleted;
}

export function toggleMemoPin(id: string): boolean {
  var memos = getMemos();
  var newPinned = false;
  
  memos = memos.map(function(memo) {
    if (memo.id === id) {
      newPinned = !memo.pinned;
      return { ...memo, pinned: newPinned };
    }
    return memo;
  });
  
  saveMemos(memos);
  return newPinned;
}

export function deleteMemo(id: string): void {
  var memos = getMemos();
  
  memos = memos.filter(function(memo) {
    return memo.id !== id;
  });
  
  saveMemos(memos);
}

// 완료되지 않은 메모 개수
export function getActiveMemoCount(): number {
  var memos = getMemos();
  return memos.filter(function(m) { return !m.completed; }).length;
}

// 완료된 메모 정리 (오래된 것들)
export function cleanupCompletedMemos(daysOld: number = 7): number {
  var memos = getMemos();
  var cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  
  var before = memos.length;
  memos = memos.filter(function(memo) {
    if (!memo.completed) return true;
    return new Date(memo.createdAt).getTime() > cutoff;
  });
  
  saveMemos(memos);
  return before - memos.length;
}
