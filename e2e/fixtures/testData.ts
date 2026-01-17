/**
 * E2E 테스트용 샘플 데이터
 */

/**
 * 샘플 태스크 데이터
 */
export const sampleTasks = [
  {
    id: 'task-1',
    title: '프로젝트 제안서 작성',
    description: '내일까지 클라이언트 미팅 자료 준비',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    completed: false,
    starred: true,
    tags: ['work', 'urgent'],
  },
  {
    id: 'task-2',
    title: '운동하기',
    description: '30분 조깅',
    dueDate: null,
    priority: 'medium',
    completed: false,
    starred: false,
    tags: ['health'],
  },
  {
    id: 'task-3',
    title: '장보기',
    description: '우유, 빵, 계란',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    completed: false,
    starred: false,
    tags: ['life'],
  },
];

/**
 * 샘플 습관 데이터
 */
export const sampleHabits = [
  {
    id: 'habit-1',
    title: '아침 명상',
    description: '10분 명상으로 하루 시작',
    frequency: 'daily',
    streak: 7,
    completedDates: [],
  },
  {
    id: 'habit-2',
    title: '물 8잔 마시기',
    description: '하루 2리터 수분 섭취',
    frequency: 'daily',
    streak: 3,
    completedDates: [],
  },
  {
    id: 'habit-3',
    title: '주간 리뷰',
    description: '한 주 돌아보기',
    frequency: 'weekly',
    streak: 4,
    completedDates: [],
  },
];

/**
 * 샘플 일정 데이터
 */
export const sampleEvents = [
  {
    id: 'event-1',
    title: '팀 미팅',
    start: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1시간 후
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    location: '3층 회의실',
    description: '주간 진행 상황 공유',
  },
  {
    id: 'event-2',
    title: '점심 약속',
    start: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    location: '강남역 근처',
    description: '대학 동창 만남',
  },
];

/**
 * 샘플 채팅 메시지
 */
export const sampleChatMessages = [
  '오늘 할 일 뭐야?',
  '회의 일정 알려줘',
  '내일 마감인 태스크 있어?',
  '집중 모드 시작해줘',
  '오늘 얼마나 생산적이었어?',
];

/**
 * DNA 프로필 샘플
 */
export const sampleDNAProfile = {
  workStyle: 'planner',
  energyPattern: {
    morningEnergy: 0.8,
    afternoonEnergy: 0.6,
    eveningEnergy: 0.4,
  },
  preferences: {
    notificationFrequency: 'balanced',
    preferredWorkHours: { start: 9, end: 18 },
    breakFrequency: 90, // minutes
  },
  learningProgress: 0.65,
};

/**
 * 알프레도 학습 데이터 샘플
 */
export const sampleLearnings = [
  {
    id: 'learning-1',
    type: 'preference',
    content: '아침에 중요한 업무를 먼저 처리하는 것을 선호해요',
    confidence: 0.85,
    source: 'explicit',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'learning-2',
    type: 'pattern',
    content: '목요일 오후에 회의가 집중되는 패턴이 있어요',
    confidence: 0.72,
    source: 'inferred',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'learning-3',
    type: 'feedback',
    content: '간결한 브리핑을 더 좋아해요',
    confidence: 0.90,
    source: 'explicit',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * 펭귄 상태 샘플
 */
export const samplePenguinStatus = {
  level: 5,
  experience: 2500,
  experienceToNextLevel: 3000,
  coins: 150,
  equippedItems: {
    hat: 'chef-hat',
    accessory: 'bow-tie',
    background: 'kitchen',
  },
};

/**
 * API 응답 모킹 헬퍼
 */
export function createMockApiResponse<T>(data: T, status = 200) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => data,
    data,
  };
}

/**
 * 날짜 헬퍼
 */
export const dateHelpers = {
  today: () => new Date().toISOString().split('T')[0],
  tomorrow: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  },
  nextWeek: () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  },
};
