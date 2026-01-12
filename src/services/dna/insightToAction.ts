/**
 * 인사이트 → 알프레도 액션 매핑
 * dna_expansion_engine_kr.md 섹션 5 기반
 */

import {
  DNAProfile,
  TodayContext,
  AlfredoAction,
  InsightAction,
  InsightType,
  ConfidenceLevel,
  CONFIDENCE_EXPRESSIONS
} from './types';

// 인사이트별 액션 매핑 테이블 (참조용 문서화)
export const INSIGHT_ACTION_MAP: InsightAction[] = [
  // 크로노타입
  {
    insight: 'chronotype',
    condition: 'morning',
    actions: ['recommend_morning_task'],
    priority: 'high'
  },
  {
    insight: 'chronotype',
    condition: 'evening',
    actions: ['minimize_morning_alerts', 'recommend_afternoon_task'],
    priority: 'medium'
  },
  
  // 스트레스 레벨
  {
    insight: 'stress_level',
    condition: 'burnout',
    actions: ['soften_tone', 'emphasize_rest', 'reduce_task_load', 'warn_burnout'],
    priority: 'high'
  },
  {
    insight: 'stress_level',
    condition: 'high',
    actions: ['soften_tone', 'suggest_break'],
    priority: 'high'
  },
  
  // 워라밸
  {
    insight: 'work_life_balance',
    condition: 'poor',
    actions: ['emphasize_rest', 'soften_tone'],
    priority: 'medium'
  },
  
  // 에너지 패턴
  {
    insight: 'energy_pattern',
    condition: 'low_period',
    actions: ['suggest_break', 'recommend_afternoon_task'],
    priority: 'medium'
  },
  
  // 집중 시간
  {
    insight: 'focus_time',
    condition: 'in_focus_slot',
    actions: ['protect_focus_time'],
    priority: 'high'
  },
  
  // 바쁜 날
  {
    insight: 'busy_day',
    condition: 'extreme',
    actions: ['soften_tone', 'reduce_task_load', 'emphasize_rest'],
    priority: 'high'
  },
  {
    insight: 'busy_day',
    condition: 'heavy',
    actions: ['suggest_break'],
    priority: 'medium'
  }
];

/**
 * 현재 상태 기반 액션 결정
 */
export function getRecommendedActions(
  profile: DNAProfile | null,
  context: TodayContext
): AlfredoAction[] {
  const actions = new Set<AlfredoAction>();
  
  if (!profile) return [];
  
  // 크로노타입 기반
  if (profile.chronotype.type === 'morning') {
    actions.add('recommend_morning_task');
  } else if (profile.chronotype.type === 'evening') {
    actions.add('minimize_morning_alerts');
    actions.add('recommend_afternoon_task');
  }
  
  // 스트레스 레벨 기반
  if (profile.stressIndicators.level === 'burnout') {
    actions.add('soften_tone');
    actions.add('emphasize_rest');
    actions.add('reduce_task_load');
    actions.add('warn_burnout');
  } else if (profile.stressIndicators.level === 'high') {
    actions.add('soften_tone');
    actions.add('suggest_break');
  }
  
  // 워라밸 기반
  if (profile.workLifeBalance.status === 'poor') {
    actions.add('emphasize_rest');
    actions.add('soften_tone');
  }
  
  // 오늘 컨텍스트 기반
  if (context.busyLevel === 'extreme') {
    actions.add('soften_tone');
    actions.add('reduce_task_load');
    actions.add('emphasize_rest');
  } else if (context.busyLevel === 'heavy') {
    actions.add('suggest_break');
  }
  
  // 연속 미팅
  if (context.hasConsecutiveMeetings) {
    actions.add('suggest_break');
  }
  
  // 현재 시간이 피크 시간인지
  const currentHour = new Date().getHours();
  if (profile.energyPattern.peakHours.includes(currentHour)) {
    actions.add('protect_focus_time');
  }
  
  // 슬럼프 시간인지
  if (profile.energyPattern.lowHours.includes(currentHour)) {
    actions.add('suggest_break');
  }
  
  return Array.from(actions);
}

/**
 * 액션 → 알프레도 행동 가이드 텍스트
 */
export function getActionGuidance(action: AlfredoAction): string {
  const guidance: Record<AlfredoAction, string> = {
    recommend_morning_task: '오전에 중요한 태스크를 추천하세요',
    recommend_afternoon_task: '오후에 태스크 시작을 추천하세요',
    minimize_morning_alerts: '아침 알림은 최소화하세요',
    suggest_break: '휴식이나 스트레칭을 제안하세요',
    soften_tone: '말투를 더 부드럽고 따뜻하게 하세요',
    emphasize_rest: '쉬어도 괜찮다고 강조하세요',
    protect_focus_time: '지금 집중 시간임을 알리고 방해하지 마세요',
    reduce_task_load: '할 일 줄이기를 적극 제안하세요',
    celebrate_progress: '작은 진행도 축하해주세요',
    send_encouragement: '격려 메시지를 보내세요',
    warn_burnout: '번아웃 위험을 조심스럽게 알려주세요'
  };
  
  return guidance[action];
}

/**
 * 확신도 기반 말투 생성
 */
export function formatWithConfidence(
  statement: string,
  confidence: ConfidenceLevel
): string {
  const expr = CONFIDENCE_EXPRESSIONS[confidence];
  
  // 간단한 변환
  // "아침형" → "아침형인 것 같아요" / "아침형인 편이시네요" / "아침형이시잖아요"
  return `${statement}${expr.suffix}`;
}

/**
 * 인사이트를 자연스러운 문장으로 변환
 */
export function insightToNaturalLanguage(
  type: InsightType,
  value: string | number | boolean,
  confidence: ConfidenceLevel
): string {
  const templates: Record<InsightType, (v: any) => string> = {
    chronotype: (v) => {
      if (v === 'morning') return formatWithConfidence('아침형', confidence);
      if (v === 'evening') return formatWithConfidence('저녁형', confidence);
      return '크로노타입 분석 중';
    },
    energy_pattern: (v) => {
      return formatWithConfidence(`${v}시가 피크 시간`, confidence);
    },
    work_style: (v) => {
      if (v === 'collaborative') return formatWithConfidence('미팅 많은 스타일', confidence);
      if (v === 'independent') return formatWithConfidence('혼자 작업을 선호하시는', confidence);
      return formatWithConfidence('밸런스 잡힌 스타일', confidence);
    },
    stress_level: (v) => {
      if (v === 'burnout') return '좀 많이 지쳐 보여요';
      if (v === 'high') return '요즘 바쁘셨네요';
      if (v === 'medium') return '적당히 바쁘시네요';
      return '여유 있으시네요';
    },
    work_life_balance: (v) => {
      if (v === 'poor') return '요즘 일만 하신 것 같아요';
      if (v === 'moderate') return '적당히 균형 잡으시네요';
      return '워라밸 잘 챙기시네요';
    },
    focus_time: (v) => {
      return `${v}시간 정도 딥워크 가능해 보여요`;
    },
    busy_day: (v) => {
      if (v) return '오늘 좀 빡세네요';
      return '오늘 여유 있어요';
    },
    meeting_preference: (v) => {
      return formatWithConfidence(v ? '미팅 많은 편' : '미팅 적은 편', confidence);
    },
    recovery_need: (v) => {
      return `미팅 후 ${v}분 정도 회복 시간이 필요해 보여요`;
    }
  };
  
  const template = templates[type];
  return template ? template(value) : '';
}

/**
 * 프로필 기반 알프레도 브리핑 톤 결정
 */
export function determineBriefingTone(
  profile: DNAProfile | null,
  context: TodayContext
): 'energetic' | 'gentle' | 'supportive' {
  // 컨텍스트가 이미 톤을 결정했으면 사용
  if (context.suggestedTone) return context.suggestedTone;
  
  if (!profile) return 'gentle';
  
  // 번아웃 상태
  if (profile.stressIndicators.level === 'burnout') return 'supportive';
  
  // 스트레스 높음
  if (profile.stressIndicators.level === 'high') return 'gentle';
  
  // 워라밸 나쁨
  if (profile.workLifeBalance.status === 'poor') return 'gentle';
  
  // 바쁜 날
  if (context.isBusyDay) return 'gentle';
  
  return 'energetic';
}

/**
 * 톤별 인사말 템플릿
 */
export function getGreetingByTone(tone: 'energetic' | 'gentle' | 'supportive'): string[] {
  const greetings: Record<typeof tone, string[]> = {
    energetic: [
      '좋은 아침이에요!',
      '오늘도 화이팅!',
      '잘 주무셨어요?',
      '오늘 하루 시작해볼까요?'
    ],
    gentle: [
      '안녕하세요.',
      '오늘도 수고 많으세요.',
      '천천히 시작해요.',
      '오늘은 어떠세요?'
    ],
    supportive: [
      '오늘 무리하지 마세요.',
      '괜찮으세요?',
      '천천히 해도 돼요.',
      '오늘은 쉬엄쉬엄 해요.'
    ]
  };
  
  return greetings[tone];
}

/**
 * 현재 컨텍스트에 맞는 랜덤 인사말
 */
export function getRandomGreeting(
  profile: DNAProfile | null,
  context: TodayContext
): string {
  const tone = determineBriefingTone(profile, context);
  const greetings = getGreetingByTone(tone);
  return greetings[Math.floor(Math.random() * greetings.length)];
}
