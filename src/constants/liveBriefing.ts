// Live Briefing 상태 태그 체계
// Live Briefing은 '지금 이 순간의 나'를 알프레도가 어떻게 보고 있는지를 요약한 창

export type LiveBriefingStatus =
  | 'stable'      // 안정 - 흐름이 무리 없이 이어지고 있음
  | 'focused'     // 집중 - 지금 몰입하기 좋은 상태
  | 'needsAdjust' // 조정 필요 - 지금 구조가 조금 빡빡함
  | 'nearOverload' // 과부하 근접 - 지금 그대로 가면 흔들릴 가능성 높음
  | 'recovery'    // 회복 권장 - 에너지 보완이 필요
  | 'observing';  // 관찰 중 - 정보가 부족하거나 전환 구간

export interface StatusTagConfig {
  id: LiveBriefingStatus;
  label: string;
  color: string;        // 배경색 (파스텔/저채도)
  textColor: string;    // 텍스트 색상
  description: string;  // 내부용 설명
}

// 상태 태그 설정 (Core Set - 6개 고정)
export const STATUS_TAGS: Record<LiveBriefingStatus, StatusTagConfig> = {
  stable: {
    id: 'stable',
    label: '안정',
    color: '#E8F5E9',      // 연한 녹색
    textColor: '#2E7D32',  // 진한 녹색
    description: '흐름이 무리 없이 이어지고 있음'
  },
  focused: {
    id: 'focused',
    label: '집중',
    color: '#E3F2FD',      // 연한 파랑
    textColor: '#1565C0',  // 진한 파랑
    description: '지금 몰입하기 좋은 상태'
  },
  needsAdjust: {
    id: 'needsAdjust',
    label: '조정 필요',
    color: '#FFF8E1',      // 연한 노랑
    textColor: '#F9A825',  // 진한 노랑
    description: '지금 구조가 조금 빡빡함'
  },
  nearOverload: {
    id: 'nearOverload',
    label: '과부하 근접',
    color: '#FFF3E0',      // 연한 주황
    textColor: '#E65100',  // 진한 주황
    description: '지금 그대로 가면 흔들릴 가능성 높음'
  },
  recovery: {
    id: 'recovery',
    label: '회복 권장',
    color: '#F3E5F5',      // 연한 보라
    textColor: '#7B1FA2',  // 진한 보라
    description: '에너지 보완이 필요'
  },
  observing: {
    id: 'observing',
    label: '관찰 중',
    color: '#F5F5F5',      // 연한 회색
    textColor: '#616161',  // 진한 회색
    description: '정보가 부족하거나 전환 구간'
  }
};

// 갱신 트리거 타입
export type UpdateTriggerType =
  | 'user_action'     // 사용자 행동 트리거 (즉시 갱신)
  | 'time_elapsed'    // 시간 경과 트리거 (조용한 갱신)
  | 'situation_signal'; // 상황 신호 트리거

// 사용자 행동 트리거 종류
export type UserActionTrigger =
  | 'chat_input'
  | 'reflect_click'
  | 'focus_start'
  | 'focus_skip'
  | 'focus_adjust'
  | 'schedule_change'
  | 'task_change'
  | 'voice_input';

// 시간 기반 트리거 설정
export const TIME_TRIGGER_CONFIG = {
  // 기본 갱신 주기 (분)
  defaultInterval: 45,       // 30-60분 사이
  overloadInterval: 20,      // 과부하 상태면 더 자주

  // 시점 기반 트리거
  beforeEventMinutes: 15,    // 일정 시작 15분 전
  afterEventMinutes: 5,      // 일정 종료 5분 후

  // 시간대 윈도우
  morningStart: 6,           // 아침 시작
  morningEnd: 9,
  lunchStart: 11,            // 점심 시작
  lunchEnd: 14,
  eveningStart: 17,          // 저녁/퇴근 시작
  eveningEnd: 20,
  nightStart: 22,            // 밤 시작
};

// 상황 신호 임계값
export const SITUATION_THRESHOLDS = {
  // 일정 밀집도 (시간당 일정 수)
  denseMeetings: 2,

  // 미룸/Skip 횟수
  skipThreshold: 3,

  // 장시간 입력 없음 (분)
  inactivityMinutes: 120,

  // 연속 고밀도 시간 (시간)
  highDensityHours: 4,
};

// Live Briefing 데이터 구조
export interface LiveBriefingData {
  sentence: string;           // 브리핑 문장
  status: LiveBriefingStatus; // 상태 태그
  updatedAt: Date;            // 마지막 갱신 시각
  triggerType: UpdateTriggerType; // 갱신 트리거 타입
}

// 상태별 기본 문장 템플릿
export const STATUS_SENTENCE_TEMPLATES: Record<LiveBriefingStatus, string[]> = {
  stable: [
    '오늘 하루가 무리 없이 흘러가고 있어요.',
    '일정 사이에 여유가 있어요.',
    '지금 페이스가 괜찮아 보여요.',
    '오늘은 안정적인 하루가 될 것 같아요.',
  ],
  focused: [
    '지금 집중하기 좋은 시간이에요.',
    '몰입 모드로 들어가기 딱 좋네요.',
    '방해 요소가 적은 시간이에요.',
    '지금 시작하면 깊이 집중할 수 있어요.',
  ],
  needsAdjust: [
    '일정이 조금 빡빡하게 잡혀있네요.',
    '여유 시간을 좀 확보하면 좋겠어요.',
    '할 일이 몰려있어서 조정이 필요해요.',
    '지금 구조를 살짝 바꾸면 더 나을 거예요.',
  ],
  nearOverload: [
    '지금 그대로 가면 버거울 수 있어요.',
    '조금 덜어내면 좋겠어요.',
    '오늘 부담이 많이 쌓여있네요.',
    '우선순위를 다시 살펴볼까요?',
  ],
  recovery: [
    '에너지 충전이 필요해 보여요.',
    '잠시 쉬어가는 것도 괜찮아요.',
    '회복 시간을 가지면 좋겠어요.',
    '컨디션 관리가 필요한 시점이에요.',
  ],
  observing: [
    '지금은 지켜보고 있어요.',
    '더 알아가는 중이에요.',
    '조금 더 시간이 필요해요.',
    '함께 하루를 파악해볼게요.',
  ],
};
