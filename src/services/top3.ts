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
    isPersonal: false
  },
  { 
    id: uuidv4(), 
    title: '팀 미팅 준비', 
    type: 'task', 
    completed: false,
    timeRange: '14:00-15:00',
    category: 'work',
    isPersonal: false
  },
  { 
    id: uuidv4(), 
    title: '운동 30분', 
    type: 'habit', 
    completed: false,
    category: 'health',
    isPersonal: true
  }
];

// Top3 가져오기
export const getTop3 = (): Top3Item[] => {
  const saved = localStorage.getItem(TOP3_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultTop3;
};

// Top3 저장
export const saveTop3 = (items: Top3Item[]): void => {
  localStorage.setItem(TOP3_KEY, JSON.stringify(items));
};

// 아이템 추가
export const addTop3Item = (title: string, type: 'task' | 'event' | 'habit' = 'task'): Top3Item => {
  const items = getTop3();
  
  // 이미 3개면 마지막 아이템 제거
  if (items.length >= 3) {
    items.pop();
  }
  
  const newItem: Top3Item = {
    id: uuidv4(),
    title,
    type,
    completed: false,
    category: type === 'habit' ? 'health' : 'work',
    isPersonal: type === 'habit'
  };
  
  items.unshift(newItem);
  saveTop3(items);
  
  return newItem;
};

// 아이템 완료 토글
export const toggleTop3Complete = (id: string): void => {
  const items = getTop3();
  const item = items.find(i => i.id === id);
  
  if (item) {
    item.completed = !item.completed;
    
    // 완료된 항목은 히스토리에 저장
    if (item.completed) {
      addToHistory(item);
    }
    
    saveTop3(items);
  }
};

// 아이템 업데이트
export const updateTop3Item = (id: string, updates: Partial<Top3Item>): void => {
  const items = getTop3();
  const index = items.findIndex(i => i.id === id);
  
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveTop3(items);
  }
};

// 아이템 삭제
export const deleteTop3Item = (id: string): void => {
  const items = getTop3();
  const filtered = items.filter(i => i.id !== id);
  saveTop3(filtered);
};

// 순서 변경
export const reorderTop3 = (items: Top3Item[]): void => {
  saveTop3(items);
};

// 별표 토글
export const toggleTop3Star = (id: string): void => {
  const items = getTop3();
  const item = items.find(i => i.id === id);
  
  if (item) {
    item.isStarred = !item.isStarred;
    saveTop3(items);
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

// 오늘 완료한 항목 수
export const getTodayCompletedCount = (): number => {
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
