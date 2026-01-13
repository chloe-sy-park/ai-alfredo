// === Mock Data (빈 상태 - 실제 사용자 데이터만 표시) ===

// 날씨 데이터 (API 연동 전 기본값)
export const mockWeather = {
  temp: null,
  tempHigh: null,
  tempLow: null,
  high: null,
  low: null,
  condition: null,
  conditionText: '',
  description: '',
  rain: false,
  rainChance: 0,
  rainProbability: 0,
  dust: null,
  dustText: '',
  humidity: null,
  wind: null,
  sunset: '',
  advice: '',
};

// 빈 배열들 - 실제 사용자 데이터로 채워짐
export const mockEvents = [];
export const mockBig3 = [];
export const mockAllTasks = [];
export const mockTasks = [];
export const mockProjects = [];
export const mockCompletedHistory = {
  today: [],
  yesterday: [],
  thisWeek: [],
  stats: {
    totalCompleted: 0,
    totalFocusTime: 0,
    avgPerDay: 0,
    streak: 0,
    mostProductiveTime: '',
    topProject: '',
  }
};
export const mockWorkReminders = [];
export const mockDontForget = [];
export const mockRelationships = [];
export const mockInbox = [];
export const mockLifeReminders = {
  todayTop3: [],
  upcoming: [],
  dontForget: [],
  relationships: [],
};
export const mockPersonalSchedule = [];
export const mockWorkLifeImpact = {
  importantMeetings: [],
  overtimeRisk: false,
};
export const mockHealthCheck = {
  sleep: { hours: 0, quality: '', note: '' },
  water: { current: 0, target: 8, unit: '잔' },
  steps: { current: 0, target: 10000 },
  exercise: { done: false, lastTime: '' },
};
export const mockMedications = [];
export const timeSlots = [
  { key: 'morning', label: '아침', icon: '🌅', timeRange: '07:00-09:00' },
  { key: 'afternoon', label: '점심', icon: '☀️', timeRange: '12:00-14:00' },
  { key: 'evening', label: '저녁', icon: '🌆', timeRange: '18:00-20:00' },
  { key: 'night', label: '취침 전', icon: '🌙', timeRange: '21:00-23:00' },
];
export const mockRoutines = [];
export const mockConditionHistory = [];
export const mockUrgent = [];
export const mockHabits = [];
export const mockMonitoring = [];
export const mockMoodHistory = [];
