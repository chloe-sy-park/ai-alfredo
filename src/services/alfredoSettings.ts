// Alfredo Settings Service - 알프레도 육성 설정

export interface AlfredoSettings {
  // 말투: 1(다정) ~ 5(직설)
  tone: number;
  // 알림 빈도: 1(필요시만) ~ 5(자주)
  notificationFrequency: number;
  // 동기부여: 1(느긋) ~ 5(도전적)
  motivation: number;
  // 아침 알림 시간
  morningAlertTime: string;
  // 저녁 알림 시간
  eveningAlertTime: string;
  // 알림 on/off
  notificationsEnabled: boolean;
  // 업데이트 시간
  updatedAt: string;
}

var STORAGE_KEY = 'alfredo_settings';

// 기본 설정
var DEFAULT_SETTINGS: AlfredoSettings = {
  tone: 3,
  notificationFrequency: 3,
  motivation: 3,
  morningAlertTime: '08:00',
  eveningAlertTime: '21:00',
  notificationsEnabled: true,
  updatedAt: new Date().toISOString()
};

// 설정 가져오기
export function getAlfredoSettings(): AlfredoSettings {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(stored) as AlfredoSettings;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

// 설정 저장
export function saveAlfredoSettings(settings: Partial<AlfredoSettings>): AlfredoSettings {
  var current = getAlfredoSettings();
  var updated: AlfredoSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save alfredo settings:', e);
  }
  
  return updated;
}

// 톤 레이블
export function getToneLabel(value: number): string {
  var labels: Record<number, string> = {
    1: '🌸 다정하게',
    2: '😊 부드럽게',
    3: '💬 균형있게',
    4: '📢 명확하게',
    5: '🔥 직설적으로'
  };
  return labels[value] || labels[3];
}

// 톤별 예시 메시지
export function getToneExample(value: number): string {
  var examples: Record<number, string> = {
    1: '"힘들 수 있으니까 쉬어가요, 괜찮죠?"',
    2: '"오늘 많이 바빠 보여요. 천천히 해도 돼요."',
    3: '"오늘 미팅 3개, 집중 시간 확보하세요."',
    4: '"보고서 마감 임박. 지금 시작하세요."',
    5: '"체력 관리 필수. 반드시 10분 휴식 넣으세요."'
  };
  return examples[value] || examples[3];
}

// 알림빈도 레이블
export function getFrequencyLabel(value: number): string {
  var labels: Record<number, string> = {
    1: '🤫 필요할 때만',
    2: '🔔 가끔',
    3: '💬 적당히',
    4: '📣 자주',
    5: '🔊 매우 자주'
  };
  return labels[value] || labels[3];
}

// 동기부여 레이블
export function getMotivationLabel(value: number): string {
  var labels: Record<number, string> = {
    1: '🌊 느긋하게',
    2: '☺️ 여유롭게',
    3: '⚡ 균형있게',
    4: '🎯 목표지향',
    5: '🏆 도전적으로'
  };
  return labels[value] || labels[3];
}

// 동기부여별 예시 메시지
export function getMotivationExample(value: number): string {
  var examples: Record<number, string> = {
    1: '"오늘은 쉬어가는 날로 해요 ☁️"',
    2: '"하나씩 천천히 해볼까요?"',
    3: '"오늘 목표 3개, 할 수 있어요!"',
    4: '"목표까지 2개 남았어요. 파이팅!"',
    5: '"어제보다 더 나은 오늘! 달려봐요! 🔥"'
  };
  return examples[value] || examples[3];
}

// 설정 초기화
export function resetAlfredoSettings(): AlfredoSettings {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  } catch (e) {
    console.error('Failed to reset alfredo settings:', e);
  }
  return DEFAULT_SETTINGS;
}
