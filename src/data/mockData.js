// === Mock Data ===

// 날씨 데이터
export const mockWeather = {
  temp: -3,
  tempHigh: 2,
  tempLow: -5,
  high: 2,
  low: -5,
  condition: 'cloudy',
  conditionText: '흐림',
  description: '흐림',
  rain: false,
  rainChance: 20,
  rainProbability: 20,
  dust: 'bad',
  dustText: '나쁨',
  humidity: 45,
  wind: 12,
  sunset: '17:32',
  advice: '패딩',
};

export const mockEvents = [
  { id: 'e1', title: '투자사 미팅', start: '14:00', end: '15:30', location: '강남 WeWork', color: 'bg-gray-1000', important: true },
  { id: 'e2', title: '팀 위클리', start: '16:00', end: '17:00', color: 'bg-[#F5F3FF]0' },
  { id: 'e3', title: 'PT 세션', start: '18:30', end: '19:30', location: '피트니스 센터', color: 'bg-emerald-500' },
];

export const mockBig3 = [
  { id: 't1', title: '투자 보고서 초안 작성', domain: 'work', deadline: '14:00 전', status: 'todo', priorityChange: 'up', project: '투자 유치', scheduledTime: '10:30', duration: 90 },
  { id: 't2', title: '팀 위클리 미팅 준비', domain: 'work', deadline: '16:00 전', status: 'todo', project: '팀 관리', scheduledTime: '15:00', duration: 30 },
  { id: 't3', title: 'PT 세션', domain: 'health', deadline: '18:30', status: 'todo', project: '건강', scheduledTime: '18:30', duration: 60 },
];

// WORK 페이지용 전체 태스크
export const mockAllTasks = [
  { 
    id: 't1', 
    title: '투자 보고서 초안 작성', 
    domain: 'work', 
    deadline: '14:00 전', 
    status: 'todo', 
    priorityChange: 'up', 
    project: '투자 유치',
    importance: 'high',
    priorityScore: 95,
    priorityReason: '대표님 긴급 요청',
    sparkline: [40, 55, 70, 85, 95],
    duration: 90,
    scheduledTime: '10:30',
  },
  { 
    id: 't2', 
    title: '팀 위클리 미팅 준비', 
    domain: 'work', 
    deadline: '16:00 전', 
    status: 'todo', 
    project: '팀 관리',
    importance: 'medium',
    priorityChange: 'same',
    priorityScore: 72,
    priorityReason: '정기 미팅',
    sparkline: [70, 72, 71, 73, 72],
    duration: 30,
    scheduledTime: '15:00',
  },
  { 
    id: 't4', 
    title: '이메일 정리', 
    domain: 'work', 
    deadline: '오늘', 
    status: 'done', 
    project: '일반',
    importance: 'low',
    priorityScore: 45,
    sparkline: [50, 48, 46, 45, 45],
    repeat: 'daily',
    repeatLabel: '매일',
    // scheduledTime 없음 - 시간 미정
  },
  { 
    id: 't5', 
    title: '클라이언트 피드백 반영', 
    domain: 'work', 
    deadline: '내일', 
    status: 'todo', 
    project: '프로젝트 A',
    importance: 'high',
    priorityChange: 'new',
    priorityScore: 82,
    priorityReason: 'Inbox에서 변환됨',
    sparkline: [0, 0, 50, 75, 82],
    duration: 60,
    // scheduledTime 없음 - 시간 미정
  },
  { 
    id: 't6', 
    title: '주간 리포트 작성', 
    domain: 'work', 
    deadline: '금요일', 
    status: 'todo', 
    project: '팀 관리',
    importance: 'medium',
    priorityChange: 'down',
    priorityScore: 55,
    priorityReason: '마감 여유',
    sparkline: [80, 75, 68, 60, 55],
    duration: 45,
    // scheduledTime 없음 - 시간 미정
  },
  { 
    id: 't7', 
    title: '디자인 리뷰 미팅', 
    domain: 'work', 
    deadline: '내일 10:00', 
    status: 'todo', 
    project: '프로젝트 A',
    importance: 'medium',
    priorityChange: 'same',
    priorityScore: 68,
    priorityReason: '일정 고정',
    sparkline: [65, 67, 68, 68, 68],
    duration: 60,
    scheduledTime: '17:00',
  },
  { 
    id: 't8', 
    title: '서버 배포', 
    domain: 'work', 
    deadline: '수요일', 
    status: 'done', 
    project: '프로젝트 A',
    importance: 'high',
    priorityScore: 90,
    sparkline: [60, 75, 85, 90, 90],
  },
];

// 프로젝트 데이터
export const mockProjects = [
  { 
    id: 'p1', 
    name: '투자 유치', 
    icon: '💰', 
    color: 'from-[#A996FF] to-[#EDE9FE]0',
    totalTasks: 8, 
    completedTasks: 3,
    deadline: '12/20',
    status: 'active',
  },
  { 
    id: 'p2', 
    name: '프로젝트 A', 
    icon: '🚀', 
    color: 'from-[#A996FF] to-[#8B7CF7]',
    totalTasks: 12, 
    completedTasks: 7,
    deadline: '12/31',
    status: 'active',
  },
  { 
    id: 'p3', 
    name: '팀 관리', 
    icon: '👥', 
    color: 'from-[#A996FF] to-[#8B7CF7]',
    totalTasks: 5, 
    completedTasks: 2,
    deadline: '매주',
    status: 'active',
  },
  { 
    id: 'p4', 
    name: '일반', 
    icon: '📋', 
    color: 'from-gray-400 to-gray-500',
    totalTasks: 10, 
    completedTasks: 8,
    deadline: '-',
    status: 'active',
  },
];

// 완료 히스토리
export const mockCompletedHistory = {
  today: [
    { id: 'h1', title: '이메일 정리', project: '일반', completedAt: '09:30', duration: 25 },
    { id: 'h2', title: '디자인 검토 미팅', project: '프로젝트 A', completedAt: '11:00', duration: 60 },
  ],
  yesterday: [
    { id: 'h3', title: '주간 목표 설정', project: '팀 관리', completedAt: '10:15', duration: 30 },
    { id: 'h4', title: '클라이언트 콜', project: '프로젝트 A', completedAt: '14:30', duration: 45 },
    { id: 'h5', title: '보고서 초안', project: '투자 유치', completedAt: '17:00', duration: 90 },
  ],
  thisWeek: [
    { id: 'h6', title: '팀 빌딩 활동 기획', project: '팀 관리', completedAt: '월요일', duration: 40 },
    { id: 'h7', title: '투자사 자료 준비', project: '투자 유치', completedAt: '월요일', duration: 120 },
    { id: 'h8', title: '디자인 가이드 정리', project: '프로젝트 A', completedAt: '화요일', duration: 60 },
    { id: 'h9', title: '코드 리뷰', project: '프로젝트 A', completedAt: '화요일', duration: 45 },
    { id: 'h10', title: '1:1 미팅 (3명)', project: '팀 관리', completedAt: '수요일', duration: 90 },
  ],
  stats: {
    totalCompleted: 15,
    totalFocusTime: 605,
    avgPerDay: 3,
    streak: 5,
    mostProductiveTime: '오전 10-12시',
    topProject: '프로젝트 A',
  }
};

// 업무 - 잊지 마세요 데이터
export const mockWorkReminders = [
  { 
    id: 'wr1', 
    type: 'reply', 
    icon: '📧', 
    title: 'Sarah 메일 답장', 
    detail: '디자인 시안 피드백 요청', 
    daysAgo: 3,
    urgent: true 
  },
  { 
    id: 'wr2', 
    type: 'waiting', 
    icon: '⏳', 
    title: '개발팀 API 문서', 
    detail: '3일 전 요청함', 
    daysAgo: 3,
    urgent: false 
  },
  { 
    id: 'wr3', 
    type: 'followup', 
    icon: '📞', 
    title: '클라이언트 콜 후속', 
    detail: '제안서 보내기로 함', 
    daysAgo: 2,
    urgent: true 
  },
  { 
    id: 'wr4', 
    type: 'review', 
    icon: '👀', 
    title: 'PR 리뷰 요청', 
    detail: '민수님이 리뷰 기다리는 중', 
    daysAgo: 1,
    urgent: false 
  },
];

// 잊지 마세요 (돈 관련)
export const mockDontForget = [
  { id: 'df1', title: '카드대금', dDay: 1, amount: 870000, category: 'money', critical: true },
  { id: 'df2', title: '넷플릭스 구독', dDay: 5, amount: 17000, category: 'subscription', critical: false },
  { id: 'df3', title: '대출이자', dDay: 10, amount: 450000, category: 'money', critical: true },
  { id: 'df4', title: '관리비', dDay: 15, amount: 280000, category: 'money', critical: false },
];

// 관계 챙기기
export const mockRelationships = [
  { id: 'rel1', name: '엄마', relationship: 'family', lastContact: '2024-12-04', daysSince: 7, note: '주 1회 통화' },
  { id: 'rel2', name: '대학 동기 민수', relationship: 'friend', lastContact: '2024-11-25', daysSince: 16, note: '' },
  { id: 'rel3', name: '여동생', relationship: 'family', lastContact: '2024-12-08', daysSince: 3, note: '' },
];

// Inbox 데이터
export const mockInbox = [
  { 
    id: 'm1', 
    from: 'Sarah Kim', 
    subject: '디자인 시안 A/B안 전달드립니다', 
    preview: '요청하신 메인 배너 시안 2종입니다. 확인 부탁드립니다.', 
    time: '10분 전', 
    urgent: true, 
    needReplyToday: true, 
    source: 'gmail', 
    type: 'mail' 
  },
  { 
    id: 'm2', 
    from: 'David Park', 
    subject: '내일 미팅 관련 문의', 
    preview: '내일 오후 2시 미팅 장소가 변경되었나요? 확인 부탁드립니다.', 
    time: '30분 전', 
    urgent: false, 
    needReplyToday: true, 
    source: 'gmail', 
    type: 'mail' 
  },
  { 
    id: 'f1', 
    from: 'Meeting Bot', 
    subject: '10/24 주간회의_녹음.mp3', 
    preview: '텍스트 변환 및 요약 준비 완료', 
    time: '2시간 전', 
    urgent: false, 
    needReplyToday: false, 
    source: 'drive', 
    type: 'file', 
    fileType: 'audio' 
  },
  { 
    id: 'f2', 
    from: '법무팀', 
    subject: '용역계약서_최종.pdf', 
    preview: '금일 중 날인 부탁드립니다.', 
    time: '3시간 전', 
    urgent: true, 
    needReplyToday: true, 
    source: 'drive', 
    type: 'file', 
    fileType: 'pdf' 
  },
  { 
    id: 'm3', 
    from: 'Notion', 
    subject: '새로운 멘션이 있습니다', 
    preview: 'David님이 "Q3 기획안"에서 회원님을 멘션했습니다.', 
    time: '1시간 전', 
    urgent: false, 
    needReplyToday: false, 
    source: 'notion', 
    type: 'mail' 
  },
];

// LIFE 페이지용 데이터
export const mockLifeReminders = {
  todayTop3: [
    { id: 'lt1', title: '카드대금 결제', category: 'money', dDay: 1, icon: '💰', note: '신한카드 87만원', critical: true },
    { id: 'lt2', title: '엄마 생신 선물 준비', category: 'family', dDay: 3, icon: '🎂', note: '케이크 예약 + 꽃' },
    { id: 'lt3', title: '장보기', category: 'home', dDay: 0, icon: '🛒', note: '우유, 계란, 양파' },
  ],
  upcoming: [
    { id: 'up1', title: '대학 동창 모임', date: '토요일', category: 'social', icon: '👥', note: '강남역 7시' },
    { id: 'up2', title: '엄마 생신', date: '일요일', category: 'family', icon: '🎂', note: '오후 점심 약속' },
    { id: 'up3', title: '자동차 정기검사', date: '다음주 월', category: 'admin', icon: '🚗', note: '예약 완료' },
  ],
  dontForget: [
    { id: 'df1', title: '넷플릭스 구독료', date: '25일', amount: '17,000원', icon: '📺', category: 'subscription' },
    { id: 'df2', title: '아이 예방접종', date: '다음주 화', icon: '💉', category: 'kids', note: '소아과 오전 10시' },
    { id: 'df3', title: '대출이자 납부', date: '말일', amount: '45만원', icon: '🏦', category: 'money', critical: true },
    { id: 'df4', title: '강아지 심장사상충약', date: '이번달', icon: '🐕', category: 'pet', note: '매월 1일' },
  ],
  relationships: [
    { id: 'rel1', name: '엄마', lastContact: 3, suggestion: '안부 전화', icon: '👩' },
    { id: 'rel2', name: '고등학교 친구 지영', lastContact: 14, suggestion: '카톡 안부', icon: '👭' },
    { id: 'rel3', name: '이모', lastContact: 30, suggestion: '명절 후 연락', icon: '👩‍🦳' },
  ],
};

// 개인 일정 (LIFE ↔ WORK 연동용)
export const mockPersonalSchedule = [
  { 
    id: 'ps1', 
    title: 'PT', 
    time: '18:30', 
    endTime: '19:30',
    location: '애플짐 강남점',
    icon: '🏋️',
    category: 'health',
    prepTime: 30,
    note: '하체 운동 예정'
  },
  { 
    id: 'ps2', 
    title: '치과 정기검진', 
    time: '10:00', 
    endTime: '10:30',
    location: '서울치과',
    icon: '🦷',
    category: 'health',
    prepTime: 20,
    daysFromNow: 2
  },
  { 
    id: 'ps3', 
    title: '대학 동창 모임', 
    time: '19:00', 
    location: '강남역 7번출구',
    icon: '👥',
    category: 'social',
    prepTime: 60,
    daysFromNow: 3
  },
];

// WORK 일정이 LIFE에 미치는 영향
export const mockWorkLifeImpact = {
  importantMeetings: [
    { id: 'wl1', title: '투자사 미팅', time: '14:00', stressLevel: 'high', suggestion: '미팅 전 5분 명상 추천' }
  ],
  overtimeRisk: false,
};

// 건강 체크 데이터
export const mockHealthCheck = {
  sleep: { hours: 6.5, quality: 'okay', note: '조금 부족' },
  water: { current: 3, target: 8, unit: '잔' },
  steps: { current: 4200, target: 10000 },
  exercise: { done: false, lastTime: '2일 전' },
};

// 약/영양제 데이터 (시간대별)
export const mockMedications = [
  { 
    id: 'med1', 
    name: '종합비타민', 
    time: 'morning', 
    timeLabel: '아침 식후',
    scheduledTime: '08:30',
    taken: true, 
    takenAt: '08:35',
    icon: '💊',
    note: '공복 피하기',
    category: 'supplement'
  },
  { 
    id: 'med2', 
    name: '오메가3', 
    time: 'morning', 
    timeLabel: '아침 식후',
    scheduledTime: '08:30',
    taken: true, 
    takenAt: '08:35',
    icon: '🐟',
    note: '비타민과 함께',
    category: 'supplement'
  },
  { 
    id: 'med3', 
    name: '유산균', 
    time: 'morning', 
    timeLabel: '아침 공복',
    scheduledTime: '07:30',
    taken: false, 
    icon: '🦠',
    note: '식전 30분',
    category: 'supplement'
  },
  { 
    id: 'med4', 
    name: '혈압약', 
    time: 'morning', 
    timeLabel: '아침',
    scheduledTime: '08:00',
    taken: true, 
    takenAt: '08:05',
    icon: '💗',
    note: '매일 같은 시간에',
    category: 'prescription',
    critical: true
  },
  { 
    id: 'med5', 
    name: '철분제', 
    time: 'afternoon', 
    timeLabel: '점심 식후',
    scheduledTime: '13:00',
    taken: false, 
    icon: '🩸',
    note: '비타민C와 함께',
    category: 'supplement'
  },
  { 
    id: 'med6', 
    name: '마그네슘', 
    time: 'evening', 
    timeLabel: '저녁 식후',
    scheduledTime: '19:30',
    taken: false, 
    icon: '✨',
    note: '근육 이완',
    category: 'supplement'
  },
  { 
    id: 'med7', 
    name: '수면 영양제', 
    time: 'night', 
    timeLabel: '취침 30분 전',
    scheduledTime: '22:30',
    taken: false, 
    icon: '🌙',
    note: '멜라토닌 함유',
    category: 'supplement'
  },
];

// 시간대 정의
export const timeSlots = [
  { key: 'morning', label: '아침', icon: '🌅', timeRange: '07:00-09:00' },
  { key: 'afternoon', label: '점심', icon: '☀️', timeRange: '12:00-14:00' },
  { key: 'evening', label: '저녁', icon: '🌆', timeRange: '18:00-20:00' },
  { key: 'night', label: '취침 전', icon: '🌙', timeRange: '21:00-23:00' },
];

// 오늘의 루틴
export const mockRoutines = [
  { id: 'r1', title: '물 8잔', icon: '💧', current: 3, target: 8, streak: 5 },
  { id: 'r2', title: '운동', icon: '🏃', current: 0, target: 1, streak: 0, lastDone: '3일 전' },
  { id: 'r3', title: '명상', icon: '🧘', current: 1, target: 1, streak: 12 },
  { id: 'r4', title: '책 읽기', icon: '📚', current: 0, target: 1, streak: 7 },
];

// 컨디션 히스토리 (오늘)
export const mockConditionHistory = [
  { time: '08:00', energy: 60, mood: 'light' },
  { time: '10:00', energy: 75, mood: 'upbeat' },
  { time: '12:00', energy: 65, mood: 'light' },
  { time: '14:00', energy: 50, mood: 'light' },
];

export const mockUrgent = [
  { id: 'u1', title: '은행 업무 (공과금 납부)', urgency: 'high', dueText: '오늘 4시까지' },
  { id: 'u2', title: '보고서 최종 제출', urgency: 'medium', dueText: 'D-1' },
];

export const mockHabits = [
  { id: 'h1', title: '물 마시기', icon: '💧', target: 8, current: 3, streak: 5 },
  { id: 'h2', title: '운동하기', icon: '🏃', target: 1, current: 0, streak: 3 },
  { id: 'h3', title: '책 읽기', icon: '📚', target: 1, current: 0, streak: 7 },
  { id: 'h4', title: '명상하기', icon: '🧘', target: 1, current: 1, streak: 12 },
];

export const mockMonitoring = [
  { id: 'm1', label: '투자 보고서', status: 'warning', detail: '오늘 미팅 전 완료 필요', timeLeft: '4시간 후' },
  { id: 'm2', label: '투자사 미팅', status: 'ok', detail: '강남 WeWork', timeLeft: '5시간 후' },
  { id: 'm3', label: '물 마시기', status: 'ok', detail: '3/8잔 완료' },
  { id: 'm4', label: '에너지 레벨', status: 'ok', detail: '오후 2-4시 집중력 저하 예상' },
];

export const mockMoodHistory = [
  { energy: 55 }, { energy: 70 }, { energy: 85 }, { energy: 65 }, { energy: 50 }, { energy: 72 }, { energy: 68 }
];
