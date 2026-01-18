/**
 * Agenda 서비스
 * 알프레도가 Task와 Event를 묶어서 Agenda를 생성하고 관리
 */

import { v4 as uuidv4 } from 'uuid';
import { Task, getTasks } from './tasks';
import { CalendarEvent, getTodayEvents, isCalendarConnected } from './calendar';

// =============================================
// 타입 정의
// =============================================

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AgendaTask extends Omit<Task, 'category'> {
  agendaId: string;
  suggestedTime?: string; // ISO string - 알프레도 제안 시간
  estimatedMinutes: number; // 알프레도 제안 소요시간
  autoCategory: 'work' | 'life' | 'finance' | 'health' | 'social' | 'other';
  subtasks?: Subtask[];
  linkedEventId?: string; // 연결된 Event ID
}

export interface AgendaEvent {
  id: string;
  eventId: string; // Calendar Event ID
  title: string;
  start: string;
  end: string;
  linkedTaskIds: string[]; // 연결된 Task IDs
}

export interface Agenda {
  id: string;
  title: string;
  category: 'work' | 'life' | 'recommended';
  description?: string;
  tasks: AgendaTask[];
  events: AgendaEvent[];
  createdBy: 'alfredo' | 'user';
  alfredoReason?: string; // 왜 이렇게 묶었는지
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface TodayAgendas {
  work: Agenda | null;
  life: Agenda | null;
  recommended: Agenda | null;
}

// =============================================
// 로컬 스토리지 키
// =============================================

const STORAGE_KEY = 'alfredo_agendas';
const TODAY_AGENDAS_KEY = 'alfredo_today_agendas';

// =============================================
// 헬퍼 함수
// =============================================

// 저장된 Agendas 가져오기
export function getStoredAgendas(): Agenda[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Agendas 저장
export function saveAgendas(agendas: Agenda[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendas));
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

// Task 카테고리 자동 분류 (키워드 기반)
function autoClassifyCategory(title: string, description?: string): AgendaTask['autoCategory'] {
  const text = `${title} ${description || ''}`.toLowerCase();

  // Work 키워드
  if (/회의|미팅|보고서|프로젝트|업무|발표|클라이언트|제안서|기획|개발|디자인|코드|배포/.test(text)) {
    return 'work';
  }

  // Finance 키워드
  if (/예산|결제|송금|투자|저축|세금|급여|비용|청구|영수증|은행/.test(text)) {
    return 'finance';
  }

  // Health 키워드
  if (/운동|헬스|병원|약|건강|다이어트|스트레칭|요가|명상|수면/.test(text)) {
    return 'health';
  }

  // Social 키워드
  if (/친구|가족|모임|파티|생일|기념일|약속|데이트|방문/.test(text)) {
    return 'social';
  }

  // Life 키워드
  if (/청소|세탁|장보기|요리|정리|쇼핑|집안일|빨래|설거지/.test(text)) {
    return 'life';
  }

  return 'other';
}

// 소요시간 자동 추정 (키워드 기반)
function estimateMinutes(title: string, existingEstimate?: number): number {
  if (existingEstimate) return existingEstimate;

  const text = title.toLowerCase();

  // 짧은 작업 (15-30분)
  if (/확인|검토|답장|이메일|전화|체크/.test(text)) {
    return 15;
  }

  // 중간 작업 (30-60분)
  if (/정리|준비|작성|미팅|회의/.test(text)) {
    return 45;
  }

  // 긴 작업 (60분 이상)
  if (/기획|개발|디자인|보고서|프로젝트|분석/.test(text)) {
    return 90;
  }

  // 기본값
  return 30;
}

// Event 기반 관련 Task 찾기
function findRelatedTasks(event: CalendarEvent, tasks: Task[]): Task[] {
  const eventTitle = event.title.toLowerCase();
  // 설명도 향후 매칭에 활용 가능
  const _eventDesc = (event.description || '').toLowerCase();
  void _eventDesc; // 현재는 제목 기반 매칭만 사용

  return tasks.filter(task => {
    const taskTitle = task.title.toLowerCase();
    // 제목에 공통 키워드가 있으면 연결
    const commonWords = eventTitle.split(' ').filter(word =>
      word.length > 2 && taskTitle.includes(word)
    );
    return commonWords.length > 0;
  });
}

// =============================================
// Agenda 생성 함수 (알프레도 로직)
// =============================================

export async function generateTodayAgendas(): Promise<TodayAgendas> {
  const tasks = getTasks();
  const today = getTodayKey();

  // 오늘 할 일 필터링
  const todayTasks = tasks.filter(task => {
    if (task.status === 'done') return false;
    return task.starred || task.scheduledDate === today || task.dueDate === today;
  });

  // 캘린더 이벤트 가져오기
  let todayEvents: CalendarEvent[] = [];
  if (isCalendarConnected()) {
    try {
      todayEvents = await getTodayEvents();
    } catch (e) {
      console.error('Failed to get today events:', e);
    }
  }

  // Work Agenda 생성
  const workTasks = todayTasks.filter(t => {
    const cat = autoClassifyCategory(t.title, t.description);
    return cat === 'work' || t.category === 'work';
  });

  const workEvents = todayEvents.filter(e => {
    const cat = autoClassifyCategory(e.title, e.description);
    return cat === 'work';
  });

  const workAgenda = createAgenda('work', workTasks, workEvents, todayTasks);

  // Life Agenda 생성
  const lifeTasks = todayTasks.filter(t => {
    const cat = autoClassifyCategory(t.title, t.description);
    return cat === 'life' || cat === 'health' || cat === 'social' || t.category === 'life';
  });

  const lifeEvents = todayEvents.filter(e => {
    const cat = autoClassifyCategory(e.title, e.description);
    return cat === 'life' || cat === 'health' || cat === 'social';
  });

  const lifeAgenda = createAgenda('life', lifeTasks, lifeEvents, todayTasks);

  // 추천 Agenda 생성 (나머지 + 우선순위 높은 것)
  const usedTaskIds = new Set([
    ...workAgenda.tasks.map(t => t.id),
    ...lifeAgenda.tasks.map(t => t.id)
  ]);

  const remainingTasks = todayTasks.filter(t => !usedTaskIds.has(t.id));
  const highPriorityTasks = remainingTasks.filter(t => t.priority === 'high' || t.starred);

  const recommendedAgenda = createAgenda('recommended',
    highPriorityTasks.length > 0 ? highPriorityTasks : remainingTasks.slice(0, 3),
    [],
    todayTasks
  );

  const result: TodayAgendas = {
    work: workAgenda.tasks.length > 0 || workAgenda.events.length > 0 ? workAgenda : null,
    life: lifeAgenda.tasks.length > 0 || lifeAgenda.events.length > 0 ? lifeAgenda : null,
    recommended: recommendedAgenda.tasks.length > 0 ? recommendedAgenda : null
  };

  // 로컬 스토리지에 저장
  localStorage.setItem(TODAY_AGENDAS_KEY, JSON.stringify({
    date: today,
    agendas: result
  }));

  return result;
}

function createAgenda(
  category: Agenda['category'],
  tasks: Task[],
  events: CalendarEvent[],
  allTasks: Task[]
): Agenda {
  const id = uuidv4();

  // Task를 AgendaTask로 변환
  const agendaTasks: AgendaTask[] = tasks.slice(0, 3).map(task => ({
    ...task,
    agendaId: id,
    suggestedTime: suggestTimeForTask(task, events),
    estimatedMinutes: estimateMinutes(task.title, task.estimatedMinutes),
    autoCategory: autoClassifyCategory(task.title, task.description),
    subtasks: loadSubtasks(task.id)
  }));

  // Event를 AgendaEvent로 변환
  const agendaEvents: AgendaEvent[] = events.slice(0, 3).map(event => {
    const relatedTasks = findRelatedTasks(event, allTasks);
    return {
      id: uuidv4(),
      eventId: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      linkedTaskIds: relatedTasks.map(t => t.id)
    };
  });

  // 진행률 계산
  const completedTasks = agendaTasks.filter(t => t.status === 'done').length;
  const totalTasks = agendaTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 제목 및 설명 생성
  const titles: Record<Agenda['category'], string> = {
    work: '오늘의 업무',
    life: '일상 관리',
    recommended: '알프레도 추천'
  };

  const reasons: Record<Agenda['category'], string> = {
    work: '오늘 처리해야 할 업무를 정리했어요',
    life: '일상 균형을 위한 할 일이에요',
    recommended: '우선순위가 높거나 오늘 하면 좋을 것들이에요'
  };

  return {
    id,
    title: titles[category],
    category,
    description: `${agendaTasks.length}개의 할 일${agendaEvents.length > 0 ? `, ${agendaEvents.length}개의 일정` : ''}`,
    tasks: agendaTasks,
    events: agendaEvents,
    createdBy: 'alfredo',
    alfredoReason: reasons[category],
    progress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Task에 적합한 시간 제안
function suggestTimeForTask(task: Task, events: CalendarEvent[]): string | undefined {
  const now = new Date();
  const currentHour = now.getHours();

  // 이미 예정된 시간이 있으면 사용
  if (task.scheduledDate) {
    return task.scheduledDate;
  }

  // Event가 없는 빈 시간대 찾기
  const busyHours = new Set<number>();
  events.forEach(event => {
    const startHour = new Date(event.start).getHours();
    const endHour = new Date(event.end).getHours();
    for (let h = startHour; h <= endHour; h++) {
      busyHours.add(h);
    }
  });

  // 현재 시간 이후의 빈 시간대 찾기
  for (let h = Math.max(currentHour, 9); h <= 18; h++) {
    if (!busyHours.has(h)) {
      const suggestedDate = new Date();
      suggestedDate.setHours(h, 0, 0, 0);
      return suggestedDate.toISOString();
    }
  }

  return undefined;
}

// Subtasks 로드
function loadSubtasks(taskId: string): Subtask[] {
  const saved = localStorage.getItem(`alfredo_subtasks_${taskId}`);
  return saved ? JSON.parse(saved) : [];
}

// =============================================
// Agenda CRUD
// =============================================

export function getTodayAgendas(): TodayAgendas | null {
  const stored = localStorage.getItem(TODAY_AGENDAS_KEY);
  if (!stored) return null;

  const { date, agendas } = JSON.parse(stored);
  if (date !== getTodayKey()) {
    // 오늘 날짜가 아니면 null 반환
    return null;
  }

  return agendas;
}

export function updateAgendaTask(
  agendaCategory: 'work' | 'life' | 'recommended',
  taskId: string,
  updates: Partial<AgendaTask>
): void {
  const stored = localStorage.getItem(TODAY_AGENDAS_KEY);
  if (!stored) return;

  const data = JSON.parse(stored);
  const agenda = data.agendas[agendaCategory];
  if (!agenda) return;

  const taskIndex = agenda.tasks.findIndex((t: AgendaTask) => t.id === taskId);
  if (taskIndex === -1) return;

  agenda.tasks[taskIndex] = { ...agenda.tasks[taskIndex], ...updates };
  agenda.updatedAt = new Date().toISOString();

  // 진행률 재계산
  const completedTasks = agenda.tasks.filter((t: AgendaTask) => t.status === 'done').length;
  agenda.progress = Math.round((completedTasks / agenda.tasks.length) * 100);

  localStorage.setItem(TODAY_AGENDAS_KEY, JSON.stringify(data));
}

export function completeAgendaTask(
  agendaCategory: 'work' | 'life' | 'recommended',
  taskId: string
): void {
  updateAgendaTask(agendaCategory, taskId, { status: 'done' });
}

export function addTaskToAgenda(
  agendaCategory: 'work' | 'life' | 'recommended',
  task: Omit<AgendaTask, 'agendaId'>
): void {
  const stored = localStorage.getItem(TODAY_AGENDAS_KEY);
  if (!stored) return;

  const data = JSON.parse(stored);
  let agenda = data.agendas[agendaCategory];

  if (!agenda) {
    // Agenda가 없으면 새로 생성
    agenda = {
      id: uuidv4(),
      title: agendaCategory === 'work' ? '오늘의 업무' : agendaCategory === 'life' ? '일상 관리' : '알프레도 추천',
      category: agendaCategory,
      tasks: [],
      events: [],
      createdBy: 'user',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.agendas[agendaCategory] = agenda;
  }

  const newTask: AgendaTask = {
    ...task,
    agendaId: agenda.id
  } as AgendaTask;

  agenda.tasks.push(newTask);
  agenda.updatedAt = new Date().toISOString();

  localStorage.setItem(TODAY_AGENDAS_KEY, JSON.stringify(data));
}

// =============================================
// 알프레도 재제안
// =============================================

export async function regenerateAgendas(): Promise<TodayAgendas> {
  // 기존 데이터 삭제
  localStorage.removeItem(TODAY_AGENDAS_KEY);
  // 새로 생성
  return generateTodayAgendas();
}

// =============================================
// Timeline용 통합 아이템
// =============================================

export interface TimelineItem {
  id: string;
  type: 'task' | 'event';
  title: string;
  start?: string;
  end?: string;
  category: AgendaTask['autoCategory'];
  estimatedMinutes?: number;
  completed: boolean;
  sourceId: string; // 원본 Task 또는 Event ID
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
  const agendas = getTodayAgendas() || await generateTodayAgendas();
  const items: TimelineItem[] = [];

  // 모든 Agenda의 Task와 Event를 TimelineItem으로 변환
  const categories: Array<'work' | 'life' | 'recommended'> = ['work', 'life', 'recommended'];

  for (const cat of categories) {
    const agenda = agendas[cat];
    if (!agenda) continue;

    // Tasks
    for (const task of agenda.tasks) {
      items.push({
        id: uuidv4(),
        type: 'task',
        title: task.title,
        start: task.suggestedTime,
        category: task.autoCategory,
        estimatedMinutes: task.estimatedMinutes,
        completed: task.status === 'done',
        sourceId: task.id
      });
    }

    // Events
    for (const event of agenda.events) {
      items.push({
        id: uuidv4(),
        type: 'event',
        title: event.title,
        start: event.start,
        end: event.end,
        category: autoClassifyCategory(event.title),
        completed: false,
        sourceId: event.eventId
      });
    }
  }

  // 시간순 정렬
  items.sort((a, b) => {
    const timeA = a.start ? new Date(a.start).getTime() : Infinity;
    const timeB = b.start ? new Date(b.start).getTime() : Infinity;
    return timeA - timeB;
  });

  return items;
}
