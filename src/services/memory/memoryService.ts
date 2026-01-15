/**
 * Memory Framing 서비스
 * 알프레도와 함께한 기억을 생성, 저장, 조회
 */

import {
  Memory,
  MemoryType,
  MemoryTone,
  MemoryImportance,
  MemoryCollection,
  CollectionStats,
  MEMORY_FRAMES,
  HIGHLIGHT_MESSAGES
} from './types';

const MEMORIES_KEY = 'alfredo_memories';
const COLLECTIONS_KEY = 'alfredo_memory_collections';

/**
 * 기억 생성
 */
export function createMemory(
  type: MemoryType,
  options: {
    title?: string;
    description?: string;
    tone?: MemoryTone;
    importance?: MemoryImportance;
    relatedData?: Memory['relatedData'];
    metadata?: Memory['metadata'];
  } = {}
): Memory {
  const frame = MEMORY_FRAMES[type][0]; // 기본 프레임 사용
  const defaultTone = frame?.tone || 'reflective';

  const memory: Memory = {
    id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: options.title || frame?.template || type,
    description: options.description || '',
    tone: options.tone || defaultTone,
    importance: options.importance || 'routine',
    createdAt: new Date().toISOString(),
    relatedData: options.relatedData,
    metadata: options.metadata
  };

  // 저장
  saveMemory(memory);

  return memory;
}

/**
 * 기억 저장
 */
function saveMemory(memory: Memory): void {
  try {
    const stored = localStorage.getItem(MEMORIES_KEY);
    const memories: Memory[] = stored ? JSON.parse(stored) : [];

    memories.push(memory);

    // 최근 500개만 유지
    if (memories.length > 500) {
      memories.splice(0, memories.length - 500);
    }

    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  } catch (e) {
    console.error('Failed to save memory:', e);
  }
}

/**
 * 모든 기억 로드
 */
export function loadMemories(): Memory[] {
  try {
    const stored = localStorage.getItem(MEMORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load memories:', e);
  }
  return [];
}

/**
 * 최근 기억 가져오기
 */
export function getRecentMemories(limit: number = 10): Memory[] {
  const memories = loadMemories();
  return memories.slice(-limit).reverse();
}

/**
 * 하이라이트 기억만 가져오기
 */
export function getHighlightMemories(): Memory[] {
  const memories = loadMemories();
  return memories.filter(m => m.importance === 'highlight').reverse();
}

/**
 * 오늘의 기억 가져오기
 */
export function getTodayMemories(): Memory[] {
  const memories = loadMemories();
  const today = new Date().toDateString();

  return memories.filter(m =>
    new Date(m.createdAt).toDateString() === today
  ).reverse();
}

/**
 * 기간별 기억 가져오기
 */
export function getMemoriesByPeriod(startDate: Date, endDate: Date): Memory[] {
  const memories = loadMemories();

  return memories.filter(m => {
    const createdAt = new Date(m.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });
}

/**
 * 첫 만남 기억 생성
 */
export function createFirstMeetingMemory(): Memory {
  return createMemory('first_meeting', {
    title: '오늘 처음 만났어요',
    description: '알프레도와의 첫 만남. 앞으로 잘 부탁해요!',
    importance: 'highlight',
    metadata: {
      dayNumber: 1,
      contextMessage: '새로운 시작'
    }
  });
}

/**
 * 마일스톤 기억 생성
 */
export function createMilestoneMemory(
  milestoneTitle: string,
  milestoneId: string
): Memory {
  return createMemory('milestone', {
    title: `${milestoneTitle} 달성!`,
    description: `새로운 이정표를 찍었어요`,
    importance: 'highlight',
    tone: 'celebratory',
    relatedData: {
      milestoneId
    }
  });
}

/**
 * 힘든 날 기억 생성
 */
export function createToughDayMemory(
  stats: { meetings: number; tasks: number }
): Memory {
  return createMemory('tough_day_handled', {
    title: '바쁜 하루를 함께 버텼어요',
    description: `미팅 ${stats.meetings}개, 태스크 ${stats.tasks}개를 처리했어요`,
    importance: 'notable',
    tone: 'supportive',
    relatedData: {
      stats: {
        meetings: stats.meetings,
        tasks: stats.tasks
      }
    }
  });
}

/**
 * 연속 사용 기억 생성
 */
export function createStreakMemory(days: number): Memory {
  const importance: MemoryImportance = days >= 7 ? 'highlight' : 'notable';

  return createMemory('streak_achievement', {
    title: `${days}일 연속 달성!`,
    description: `꾸준히 함께하고 있어요`,
    importance,
    tone: 'celebratory',
    relatedData: {
      streak: days
    }
  });
}

/**
 * 집중 세션 기억 생성
 */
export function createFocusMemory(minutes: number): Memory {
  const importance: MemoryImportance = minutes >= 90 ? 'notable' : 'routine';

  return createMemory('focus_session', {
    title: `${minutes}분 집중 완료`,
    description: '몰입의 시간을 가졌어요',
    importance,
    tone: 'encouraging',
    relatedData: {
      stats: { focusMinutes: minutes }
    }
  });
}

/**
 * 태스크 완료 기억 생성
 */
export function createTaskCompletionMemory(
  taskTitle: string,
  taskId: string,
  isHighPriority: boolean = false
): Memory {
  return createMemory('task_completion', {
    title: `"${taskTitle}" 완료`,
    description: isHighPriority ? '중요한 일을 해냈어요!' : '하나 더 끝냈어요',
    importance: isHighPriority ? 'notable' : 'routine',
    tone: 'celebratory',
    relatedData: {
      taskId
    }
  });
}

// ========== 기억 컬렉션 (주간/월간 리뷰) ==========

/**
 * 주간 컬렉션 생성
 */
export function createWeeklyCollection(): MemoryCollection {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const memories = getMemoriesByPeriod(weekAgo, now);
  const stats = calculateCollectionStats(memories);

  const highlights = generateHighlights(memories, stats);
  const headline = generateHeadline(stats);

  const collection: MemoryCollection = {
    id: `collection_weekly_${Date.now()}`,
    period: 'weekly',
    title: '이번 주 기억',
    startDate: weekAgo.toISOString(),
    endDate: now.toISOString(),
    memories: memories.filter(m => m.importance !== 'routine'),
    summary: {
      headline,
      highlights,
      stats,
      reflection: generateReflection(stats)
    },
    viewed: false,
    createdAt: now.toISOString()
  };

  // 저장
  saveCollection(collection);

  return collection;
}

/**
 * 월간 컬렉션 생성
 */
export function createMonthlyCollection(): MemoryCollection {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const memories = getMemoriesByPeriod(monthAgo, now);
  const stats = calculateCollectionStats(memories);

  const highlights = generateHighlights(memories, stats);
  const headline = generateMonthlyHeadline(stats);

  const collection: MemoryCollection = {
    id: `collection_monthly_${Date.now()}`,
    period: 'monthly',
    title: '이번 달 기억',
    startDate: monthAgo.toISOString(),
    endDate: now.toISOString(),
    memories: memories.filter(m => m.importance === 'highlight'),
    summary: {
      headline,
      highlights,
      stats,
      reflection: generateMonthlyReflection(stats)
    },
    viewed: false,
    createdAt: now.toISOString()
  };

  // 저장
  saveCollection(collection);

  return collection;
}

/**
 * 컬렉션 저장
 */
function saveCollection(collection: MemoryCollection): void {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    const collections: MemoryCollection[] = stored ? JSON.parse(stored) : [];

    collections.push(collection);

    // 최근 52개 (1년치 주간) + 12개 (1년치 월간) 유지
    if (collections.length > 64) {
      collections.splice(0, collections.length - 64);
    }

    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (e) {
    console.error('Failed to save collection:', e);
  }
}

/**
 * 컬렉션 로드
 */
export function loadCollections(): MemoryCollection[] {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load collections:', e);
  }
  return [];
}

/**
 * 최근 컬렉션 가져오기
 */
export function getRecentCollections(limit: number = 4): MemoryCollection[] {
  const collections = loadCollections();
  return collections.slice(-limit).reverse();
}

/**
 * 미확인 컬렉션 가져오기
 */
export function getUnviewedCollections(): MemoryCollection[] {
  const collections = loadCollections();
  return collections.filter(c => !c.viewed);
}

/**
 * 컬렉션 확인 표시
 */
export function markCollectionViewed(collectionId: string): void {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    const collections: MemoryCollection[] = stored ? JSON.parse(stored) : [];

    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      collection.viewed = true;
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    }
  } catch (e) {
    console.error('Failed to mark collection viewed:', e);
  }
}

// ========== 헬퍼 함수들 ==========

/**
 * 컬렉션 통계 계산
 */
function calculateCollectionStats(memories: Memory[]): CollectionStats {
  const uniqueDays = new Set(
    memories.map(m => new Date(m.createdAt).toDateString())
  ).size;

  const tasksCompleted = memories.filter(m => m.type === 'task_completion').length;

  const focusSessions = memories.filter(m => m.type === 'focus_session');
  const focusMinutes = focusSessions.reduce((sum, m) => {
    return sum + (m.relatedData?.stats?.focusMinutes || 0);
  }, 0);

  const milestonesAchieved = memories.filter(m => m.type === 'milestone').length;

  return {
    daysActive: uniqueDays,
    tasksCompleted,
    focusMinutes,
    suggestionsAccepted: 0, // Trust Evidence에서 가져와야 함
    milestonesAchieved
  };
}

/**
 * 하이라이트 생성
 */
function generateHighlights(
  memories: Memory[],
  stats: CollectionStats
): string[] {
  const highlights: string[] = [];

  // 생산적인 주
  if (stats.tasksCompleted >= 10) {
    const messages = HIGHLIGHT_MESSAGES.productive_week;
    highlights.push(messages[Math.floor(Math.random() * messages.length)]);
  }

  // 집중 마스터
  if (stats.focusMinutes >= 300) {
    const messages = HIGHLIGHT_MESSAGES.focus_master;
    highlights.push(messages[Math.floor(Math.random() * messages.length)]);
  }

  // 마일스톤 달성
  if (stats.milestonesAchieved > 0) {
    const messages = HIGHLIGHT_MESSAGES.milestone_achieved;
    highlights.push(messages[Math.floor(Math.random() * messages.length)]);
  }

  // 힘든 날 극복
  const toughDays = memories.filter(m => m.type === 'tough_day_handled');
  if (toughDays.length > 0) {
    const messages = HIGHLIGHT_MESSAGES.tough_but_made_it;
    highlights.push(messages[Math.floor(Math.random() * messages.length)]);
  }

  // 기본 하이라이트
  if (highlights.length === 0) {
    highlights.push('함께한 시간이 쌓이고 있어요');
  }

  return highlights.slice(0, 3);
}

/**
 * 주간 헤드라인 생성
 */
function generateHeadline(stats: CollectionStats): string {
  if (stats.daysActive >= 6) {
    return '정말 부지런한 한 주였어요!';
  }
  if (stats.tasksCompleted >= 15) {
    return '많은 일을 해냈어요';
  }
  if (stats.focusMinutes >= 300) {
    return '집중력이 빛났던 한 주';
  }
  if (stats.milestonesAchieved > 0) {
    return '새로운 이정표를 세웠어요';
  }
  if (stats.daysActive >= 3) {
    return '함께한 한 주였어요';
  }
  return '조금씩 함께하고 있어요';
}

/**
 * 월간 헤드라인 생성
 */
function generateMonthlyHeadline(stats: CollectionStats): string {
  if (stats.daysActive >= 20) {
    return '한 달 내내 함께했어요!';
  }
  if (stats.tasksCompleted >= 50) {
    return '생산적인 한 달이었어요';
  }
  if (stats.milestonesAchieved >= 3) {
    return '성장이 눈에 보이는 한 달';
  }
  return '또 한 달을 함께했어요';
}

/**
 * 주간 회고 메시지 생성
 */
function generateReflection(stats: CollectionStats): string {
  if (stats.daysActive >= 5 && stats.tasksCompleted >= 10) {
    return '이번 주도 수고 많았어요. 다음 주도 이 페이스로 가봐요!';
  }
  if (stats.daysActive >= 3) {
    return '꾸준히 함께해줘서 고마워요.';
  }
  return '바빴던 한 주였나요? 언제든 여기 있을게요.';
}

/**
 * 월간 회고 메시지 생성
 */
function generateMonthlyReflection(stats: CollectionStats): string {
  if (stats.daysActive >= 20) {
    return '한 달 동안 정말 열심히 했어요. 가끔은 쉬어가도 괜찮아요.';
  }
  if (stats.milestonesAchieved > 0) {
    return '새로운 마일스톤을 함께 달성했네요. 다음 달도 기대돼요.';
  }
  return '한 달간 함께해줘서 고마워요. 앞으로도 잘 부탁해요.';
}

/**
 * 함께한 날 수 계산
 */
export function getDaysTogether(): number {
  const memories = loadMemories();
  const firstMeeting = memories.find(m => m.type === 'first_meeting');

  if (!firstMeeting) return 0;

  const firstDate = new Date(firstMeeting.createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - firstDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 오늘의 기억 요약 메시지
 */
export function getTodaySummaryMessage(): string {
  const todayMemories = getTodayMemories();

  if (todayMemories.length === 0) {
    return '오늘은 아직 함께한 기억이 없어요';
  }

  const highlights = todayMemories.filter(m => m.importance === 'highlight');
  if (highlights.length > 0) {
    return `오늘 ${highlights.length}개의 특별한 순간이 있었어요`;
  }

  return `오늘 ${todayMemories.length}개의 순간을 함께했어요`;
}

/**
 * 메모리 프레임 적용
 */
export function applyMemoryFrame(
  type: MemoryType,
  variables: Record<string, string | number>
): string {
  const frames = MEMORY_FRAMES[type];
  if (!frames || frames.length === 0) return type;

  const frame = frames[Math.floor(Math.random() * frames.length)];
  let result = frame.template;

  for (const varName of frame.variables) {
    const value = variables[varName];
    if (value !== undefined) {
      result = result.replace(`{{${varName}}}`, String(value));
    }
  }

  return result;
}
