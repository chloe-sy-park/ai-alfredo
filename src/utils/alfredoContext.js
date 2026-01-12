/**
 * 알프레도 컨텍스트 유틸리티
 * - 업무/라이프 모드 자동 감지
 * - 컨텍스트 기반 스타일 전환
 * - 시간대, 캘린더, 현재 탭 기반 판단
 */

const CONTEXT_KEY = 'alfredo_context_settings';
const WORK_STYLE_KEY = 'alfredo_style_work';
const LIFE_STYLE_KEY = 'alfredo_style_life';

// 기본 스타일 값
const DEFAULT_STYLE = {
  toneWarmth: 50,
  notificationFreq: 50,
  dataDepth: 50,
  motivationStyle: 50
};

// 업무 모드 기본값 (더 직접적)
const DEFAULT_WORK_STYLE = {
  toneWarmth: 35,
  notificationFreq: 60,
  dataDepth: 70,
  motivationStyle: 65
};

// 라이프 모드 기본값 (더 따뜻하게)
const DEFAULT_LIFE_STYLE = {
  toneWarmth: 75,
  notificationFreq: 40,
  dataDepth: 30,
  motivationStyle: 35
};

// 컨텍스트 설정 저장
export const saveContextSettings = (settings) => {
  localStorage.setItem(CONTEXT_KEY, JSON.stringify(settings));
};

// 컨텍스트 설정 가져오기
export const getContextSettings = () => {
  const saved = localStorage.getItem(CONTEXT_KEY);
  return saved ? JSON.parse(saved) : {
    autoSwitch: true,
    workHoursStart: 9,
    workHoursEnd: 18,
    workDays: [1, 2, 3, 4, 5], // 월-금
    currentMode: 'auto' // 'auto' | 'work' | 'life'
  };
};

// 영역별 스타일 저장
export const saveAreaStyle = (area, style) => {
  const key = area === 'work' ? WORK_STYLE_KEY : LIFE_STYLE_KEY;
  localStorage.setItem(key, JSON.stringify(style));
};

// 영역별 스타일 가져오기
export const getAreaStyle = (area) => {
  const key = area === 'work' ? WORK_STYLE_KEY : LIFE_STYLE_KEY;
  const saved = localStorage.getItem(key);
  
  if (saved) {
    return JSON.parse(saved);
  }
  
  return area === 'work' ? DEFAULT_WORK_STYLE : DEFAULT_LIFE_STYLE;
};

// 현재 컨텍스트 감지 (업무 vs 라이프)
export const detectCurrentContext = (options = {}) => {
  const settings = getContextSettings();
  
  // 수동 모드면 그대로 반환
  if (settings.currentMode !== 'auto') {
    return settings.currentMode;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0=일, 1=월, ...
  
  // 1. 현재 탭 기반 감지 (가장 우선순위 높음)
  if (options.currentTab) {
    const workTabs = ['work', 'task', 'calendar', 'meeting'];
    const lifeTabs = ['life', 'habit', 'wellness', 'personal'];
    
    if (workTabs.some(tab => options.currentTab.toLowerCase().includes(tab))) {
      return 'work';
    }
    if (lifeTabs.some(tab => options.currentTab.toLowerCase().includes(tab))) {
      return 'life';
    }
  }
  
  // 2. 현재 일정 기반 감지
  if (options.currentEvent) {
    const workKeywords = ['미팅', '회의', 'meeting', '보고', '발표', 'PT', '리뷰', '점검'];
    const lifeKeywords = ['운동', '병원', '치과', '약속', '저녁', '점심', '친구', '가족'];
    
    const eventTitle = (options.currentEvent.title || '').toLowerCase();
    
    if (workKeywords.some(kw => eventTitle.includes(kw.toLowerCase()))) {
      return 'work';
    }
    if (lifeKeywords.some(kw => eventTitle.includes(kw.toLowerCase()))) {
      return 'life';
    }
  }
  
  // 3. 시간대/요일 기반 감지
  const isWorkDay = settings.workDays.includes(currentDay);
  const isWorkHour = currentHour >= settings.workHoursStart && currentHour < settings.workHoursEnd;
  
  if (isWorkDay && isWorkHour) {
    return 'work';
  }
  
  return 'life';
};

// 현재 컨텍스트에 맞는 스타일 가져오기
export const getCurrentStyle = (options = {}) => {
  const context = detectCurrentContext(options);
  return {
    context,
    style: getAreaStyle(context)
  };
};

// 컨텍스트 메타데이터 (UI 표시용)
export const getContextMetadata = (context) => {
  const metadata = {
    work: {
      emoji: '💼',
      label: '업무 모드',
      description: '집중과 효율 중심',
      color: 'blue'
    },
    life: {
      emoji: '🌿',
      label: '라이프 모드',
      description: '여유와 균형 중심',
      color: 'green'
    }
  };
  
  return metadata[context] || metadata.life;
};

// 컨텍스트 전환 알림 메시지 생성
export const getContextSwitchMessage = (fromContext, toContext) => {
  const messages = {
    'work->life': [
      '퇴근 시간이에요! 🌙 이제 좀 쉬어가세요.',
      '업무 시간이 끝났어요. 오늘 하루도 고생했어요! 🎉',
      '라이프 모드로 전환할게요. 남은 저녁 편하게 보내세요 🌿'
    ],
    'life->work': [
      '좋은 아침이에요! ☀️ 업무 모드로 전환할게요.',
      '출근 시간이네요. 오늘도 화이팅! 💪',
      '업무 모드로 전환했어요. 무엇부터 시작할까요? 💼'
    ]
  };
  
  const key = `${fromContext}->${toContext}`;
  const msgList = messages[key] || ['모드가 전환되었어요.'];
  return msgList[Math.floor(Math.random() * msgList.length)];
};

// 스타일 프리뷰 메시지 생성
export const getStylePreviewMessage = (context, style) => {
  const { toneWarmth, notificationFreq, dataDepth, motivationStyle } = style;
  
  const workMessages = {
    direct: [
      '오늘 업무: 기획안 마감, 팀 미팅, 리포트 검토. 우선순위대로 처리하세요.',
      '오전 일정 확인. 11시 미팅 준비 필요. 30분 전 리마인드 드릴게요.',
      '태스크 3개 완료, 2개 남음. 현재 진행률 60%.'
    ],
    balanced: [
      '오늘 주요 업무 3개 있어요. 오전에 집중 작업하시면 좋을 것 같아요.',
      '11시 미팅 있어요. 자료 준비 상태 어떠세요?',
      '오후에 남은 업무들, 하나씩 같이 정리해볼까요?'
    ],
    warm: [
      '오늘도 화이팅이에요! 💪 주요 업무 3개, 충분히 해낼 수 있어요.',
      '11시 미팅 준비되셨나요? 잘 하실 거예요 👍',
      '남은 업무들 조금씩 해보면 금방이에요. 무리하지 마세요 😊'
    ]
  };
  
  const lifeMessages = {
    direct: [
      '오늘 개인 일정: 헬스장 7시, 저녁 약속 없음. 휴식 권장.',
      '물 마시기 3회 완료. 스트레칭 1회 남음.',
      '수면 7시간 확보 위해 11시 취침 필요.'
    ],
    balanced: [
      '오늘 저녁은 여유로워요. 운동 가시려면 7시쯤 좋을 것 같아요.',
      '오늘 물 마시기 잘 하고 계시네요! 스트레칭도 한 번 해볼까요?',
      '내일 아침 일정 있으니까 오늘은 일찍 쉬어도 좋을 것 같아요.'
    ],
    warm: [
      '오늘 저녁 편하게 보내세요 🌙 무리하지 않아도 괜찮아요.',
      '물도 잘 마시고, 스트레칭도 해보면 좋겠어요. 몸 챙기기! 💙',
      '푹 쉬는 것도 중요한 일이에요. 좋은 밤 되세요 ✨'
    ]
  };
  
  const messages = context === 'work' ? workMessages : lifeMessages;
  
  let tone;
  if (toneWarmth <= 30) tone = 'direct';
  else if (toneWarmth >= 70) tone = 'warm';
  else tone = 'balanced';
  
  const msgList = messages[tone];
  return msgList[Math.floor(Math.random() * msgList.length)];
};

// 현재 모드 수동 설정
export const setManualMode = (mode) => {
  const settings = getContextSettings();
  settings.currentMode = mode; // 'auto' | 'work' | 'life'
  saveContextSettings(settings);
  return settings;
};

// 자동 전환 토글
export const toggleAutoSwitch = (enabled) => {
  const settings = getContextSettings();
  settings.autoSwitch = enabled;
  if (enabled) {
    settings.currentMode = 'auto';
  }
  saveContextSettings(settings);
  return settings;
};

export default {
  saveContextSettings,
  getContextSettings,
  saveAreaStyle,
  getAreaStyle,
  detectCurrentContext,
  getCurrentStyle,
  getContextMetadata,
  getContextSwitchMessage,
  getStylePreviewMessage,
  setManualMode,
  toggleAutoSwitch
};
