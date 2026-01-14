// Top3 - 오늘 꼭 해야할 3가지 관리

export interface Top3Item {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface Top3Data {
  date: string;
  items: Top3Item[];
}

var STORAGE_KEY = 'alfredo_top3';

function getTodayKey(): string {
  var now = new Date();
  return now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTodayTop3(): Top3Data | null {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    var data = JSON.parse(stored) as Top3Data;
    var todayKey = getTodayKey();
    
    // 오늘 날짜인지 확인
    if (data.date !== todayKey) {
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Failed to get top3:', e);
    return null;
  }
}

// Alias for getTodayTop3 - returns items array directly
export function getTop3(): Top3Item[] {
  var data = getTodayTop3();
  return data ? data.items : [];
}

export function saveTop3(items: Top3Item[]): void {
  try {
    var data: Top3Data = {
      date: getTodayKey(),
      items: items
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save top3:', e);
  }
}

export function addTop3Item(title: string): Top3Item | null {
  var current = getTodayTop3();
  var items = current ? current.items : [];
  
  // 최대 3개까지만
  if (items.length >= 3) {
    return null;
  }
  
  var newItem: Top3Item = {
    id: generateId(),
    title: title,
    completed: false,
    order: items.length,
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  saveTop3(items);
  
  return newItem;
}

export function updateTop3Item(id: string, updates: Partial<Top3Item>): void {
  var current = getTodayTop3();
  if (!current) return;
  
  var items = current.items.map(function(item) {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  
  saveTop3(items);
}

export function toggleTop3Complete(id: string): boolean {
  var current = getTodayTop3();
  if (!current) return false;
  
  var newCompleted = false;
  var items = current.items.map(function(item) {
    if (item.id === id) {
      newCompleted = !item.completed;
      return { ...item, completed: newCompleted };
    }
    return item;
  });
  
  saveTop3(items);
  return newCompleted;
}

export function deleteTop3Item(id: string): void {
  var current = getTodayTop3();
  if (!current) return;
  
  var items = current.items.filter(function(item) {
    return item.id !== id;
  });
  
  // 순서 재정렬
  items = items.map(function(item, idx) {
    return { ...item, order: idx };
  });
  
  saveTop3(items);
}

export function reorderTop3(fromIndex: number, toIndex: number): void {
  var current = getTodayTop3();
  if (!current) return;
  
  var items = [...current.items];
  var moved = items.splice(fromIndex, 1)[0];
  items.splice(toIndex, 0, moved);
  
  // 순서 업데이트
  items = items.map(function(item, idx) {
    return { ...item, order: idx };
  });
  
  saveTop3(items);
}

// 완료율 계산
export function getTop3Progress(): { completed: number; total: number; percent: number } {
  var current = getTodayTop3();
  if (!current || current.items.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  
  var completed = current.items.filter(function(item) {
    return item.completed;
  }).length;
  
  var total = current.items.length;
  var percent = Math.round((completed / total) * 100);
  
  return { completed: completed, total: total, percent: percent };
}
