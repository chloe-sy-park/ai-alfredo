import { v4 as uuidv4 } from 'uuid';

export interface Top3Item {
  id: string;
  title: string;
  type: 'task' | 'event' | 'habit';
  completed: boolean;
  isStarred?: boolean;
  timeRange?: string;
  notes?: string;
  category?: 'work' | 'life' | 'health';
  isPersonal?: boolean; // Work/Life 모드 필터링용
  order?: number;
  // Task/Event 연동을 위한 필드
  sourceId?: string; // 원본 Task ID 또는 Calendar Event ID
  sourceType?: 'task' | 'calendar'; // 원본 타입
}

export interface Top3Data {
  date: string;
  items: Top3Item[];
}

export interface Progress {
  percent: number;
  completed: number;
  total: number;
}

const TOP3_KEY = 'alfredo_top3';
const TOP3_HISTORY_KEY = 'alfredo_top3_history';

// 기본 Top3 아이템
const defaultTop3: Top3Item[] = [
  { 
    id: uuidv4(), 
    title: '프로젝트 제안서 마무리', 
    type: 'task', 
    completed: false,
    category: 'work',
    isPersonal: false,
    order: 0
  },
  { 
    id: uuidv4(), 
    title: '팀 미팅 준비', 
    type: 'task', 
    completed: false,
    timeRange: '14:00-15:00',
    category: 'work',
    isPersonal: false,
    order: 1
  },
  { 
    id: uuidv4(), 
    title: '운동 30분', 
    type: 'habit', 
    completed: false,
    category: 'health',
    isPersonal: true,
    order: 2
  }
];

// 오늘의 Top3 가져오기
export const getTodayTop3 = (): Top3Data | null => {
  const today = new Date().toDateString();
  const saved = localStorage.getItem(TOP3_KEY);
  
  if (!saved) {
    // 기본값으로 초기화
    const data: Top3Data = {
      date: today,
      items: defaultTop3
    };
    localStorage.setItem(TOP3_KEY, JSON.stringify(data));
    return data;
  }
  
  const data = JSON.parse(saved) as Top3Data;
  
  // 오늘 날짜가 아니면 리셋
  if (data.date !== today) {
    const newData: Top3Data = {
      date: today,
      items: []
    };
    localStorage.setItem(TOP3_KEY, JSON.stringify(newData));
    return newData;
  }
  
  return data;
};

// Top3 가져오기 (이전 버전과의 호환성을 위해 유지)
export const getTop3 = (): Top3Item[] => {
  const data = getTodayTop3();
  return data ? data.items : [];
};

// Top3 저장
export const saveTop3 = (items: Top3Item[]): void => {
  const today = new Date().toDateString();
  const data: Top3Data = {
    date: today,
    items
  };
  localStorage.setItem(TOP3_KEY, JSON.stringify(data));
};

// 진도율 계산
export const getTop3Progress = (): Progress => {
  const data = getTodayTop3();
  if (!data || data.items.length === 0) {
    return { percent: 0, completed: 0, total: 0 };
  }
  
  const completed = data.items.filter(item => item.completed).length;
  const total = data.items.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { percent, completed, total };
};

// 아이템 추가
export const addTop3Item = (title: string, type: 'task' | 'event' | 'habit' = 'task'): Top3Item | null => {
  const data = getTodayTop3();
  if (!data) return null;
  
  // 이미 3개면 추가 불가
  if (data.items.length >= 3) {
    return null;
  }
  
  const newItem: Top3Item = {
    id: uuidv4(),
    title,
    type,
    completed: false,
    category: type === 'habit' ? 'health' : 'work',
    isPersonal: type === 'habit',
    order: data.items.length
  };
  
  data.items.push(newItem);
  saveTop3(data.items);
  
  return newItem;
};

// 아이템 완료 토글
export const toggleTop3Complete = (id: string): void => {
  const data = getTodayTop3();
  if (!data) return;
  
  const item = data.items.find(i => i.id === id);
  if (item) {
    item.completed = !item.completed;
    
    // 완료된 항목은 히스토리에 저장
    if (item.completed) {
      addToHistory(item);
    }
    
    saveTop3(data.items);
  }
};

// 아이템 업데이트
export const updateTop3Item = (id: string, updates: Partial<Top3Item>): void => {
  const data = getTodayTop3();
  if (!data) return;
  
  const index = data.items.findIndex(i => i.id === id);
  if (index !== -1) {
    data.items[index] = { ...data.items[index], ...updates };
    saveTop3(data.items);
  }
};

// 아이템 삭제
export const deleteTop3Item = (id: string): void => {
  const data = getTodayTop3();
  if (!data) return;
  
  data.items = data.items.filter(i => i.id !== id);
  saveTop3(data.items);
};

// 순서 변경
export const reorderTop3 = (items: Top3Item[]): void => {
  saveTop3(items);
};

// 별표 토글
export const toggleTop3Star = (id: string): void => {
  const data = getTodayTop3();
  if (!data) return;
  
  const item = data.items.find(i => i.id === id);
  if (item) {
    item.isStarred = !item.isStarred;
    saveTop3(data.items);
  }
};

// 히스토리에 추가
const addToHistory = (item: Top3Item): void => {
  const historyStr = localStorage.getItem(TOP3_HISTORY_KEY);
  const history: Top3Item[] = historyStr ? JSON.parse(historyStr) : [];
  
  history.unshift({
    ...item,
    completedAt: new Date().toISOString()
  } as Top3Item & { completedAt: string });
  
  // 최근 100개만 유지
  if (history.length > 100) {
    history.length = 100;
  }
  
  localStorage.setItem(TOP3_HISTORY_KEY, JSON.stringify(history));
};

// 오늘 완료한 항목 수 (tasks.ts와 중복 해결을 위해 이름 변경)
export const getTop3TodayCompletedCount = (): number => {
  const historyStr = localStorage.getItem(TOP3_HISTORY_KEY);
  if (!historyStr) return 0;
  
  const history = JSON.parse(historyStr) as Array<Top3Item & { completedAt: string }>;
  const today = new Date().toDateString();
  
  return history.filter(item => {
    const completedDate = new Date(item.completedAt).toDateString();
    return completedDate === today;
  }).length;
};

// Work 아이템만 가져오기
export const getWorkItems = (): Top3Item[] => {
  return getTop3().filter(item => !item.isPersonal);
};

// Life 아이템만 가져오기
export const getLifeItems = (): Top3Item[] => {
  return getTop3().filter(item => item.isPersonal);
};

// Task를 Top3에 추가
export const addTaskToTop3 = (task: {
  id: string;
  title: string;
  category?: 'work' | 'life';
  dueDate?: string;
  priority?: string;
}): Top3Item | null => {
  const data = getTodayTop3();
  if (!data) return null;

  // 이미 3개면 추가 불가
  if (data.items.length >= 3) {
    return null;
  }

  // 이미 같은 Task가 있으면 추가 안함
  const existing = data.items.find(item => item.sourceId === task.id && item.sourceType === 'task');
  if (existing) {
    return existing;
  }

  const newItem: Top3Item = {
    id: uuidv4(),
    title: task.title,
    type: 'task',
    completed: false,
    category: task.category || 'work',
    isPersonal: task.category === 'life',
    order: data.items.length,
    timeRange: task.dueDate,
    sourceId: task.id,
    sourceType: 'task'
  };

  data.items.push(newItem);
  saveTop3(data.items);

  return newItem;
};

// Calendar Event를 Top3에 추가
export const addEventToTop3 = (event: {
  id: string;
  title: string;
  start: string;
  end?: string;
  isPersonal?: boolean;
}): Top3Item | null => {
  const data = getTodayTop3();
  if (!data) return null;

  // 이미 3개면 추가 불가
  if (data.items.length >= 3) {
    return null;
  }

  // 이미 같은 Event가 있으면 추가 안함
  const existing = data.items.find(item => item.sourceId === event.id && item.sourceType === 'calendar');
  if (existing) {
    return existing;
  }

  // 시간 포맷팅
  const startTime = event.start.includes('T')
    ? event.start.split('T')[1]?.substring(0, 5)
    : '';
  const endTime = event.end?.includes('T')
    ? event.end.split('T')[1]?.substring(0, 5)
    : '';
  const timeRange = startTime && endTime ? startTime + '-' + endTime : startTime;

  const newItem: Top3Item = {
    id: uuidv4(),
    title: event.title,
    type: 'event',
    completed: false,
    category: event.isPersonal ? 'life' : 'work',
    isPersonal: event.isPersonal || false,
    order: data.items.length,
    timeRange: timeRange,
    sourceId: event.id,
    sourceType: 'calendar'
  };

  data.items.push(newItem);
  saveTop3(data.items);

  return newItem;
};

// Top3 완료 시 연동된 Task도 완료 처리
export const completeTop3WithSync = (id: string): { taskId?: string; eventId?: string } | null => {
  const data = getTodayTop3();
  if (!data) return null;

  const item = data.items.find(i => i.id === id);
  if (!item) return null;

  // 완료 처리
  item.completed = true;
  addToHistory(item);
  saveTop3(data.items);

  // 연동된 원본 반환 (호출자가 Task/Event 완료 처리)
  if (item.sourceType === 'task' && item.sourceId) {
    return { taskId: item.sourceId };
  } else if (item.sourceType === 'calendar' && item.sourceId) {
    return { eventId: item.sourceId };
  }

  return null;
};

// Task 완료 시 Top3 동기화
export const syncTaskCompletionToTop3 = (taskId: string, completed: boolean): void => {
  const data = getTodayTop3();
  if (!data) return;

  const item = data.items.find(i => i.sourceId === taskId && i.sourceType === 'task');
  if (item && item.completed !== completed) {
    item.completed = completed;
    if (completed) {
      addToHistory(item);
    }
    saveTop3(data.items);
  }
};

// sourceId로 Top3 아이템 찾기
export const findTop3BySourceId = (sourceId: string, sourceType: 'task' | 'calendar'): Top3Item | null => {
  const data = getTodayTop3();
  if (!data) return null;

  return data.items.find(i => i.sourceId === sourceId && i.sourceType === sourceType) || null;
};