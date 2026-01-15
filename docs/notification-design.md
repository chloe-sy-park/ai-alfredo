# 알프레도 알림 · 푸시 · 재개입 시스템 설계

> 알프레도의 알림 시스템은 "귀찮은 앱"이 아닌 "믿음직한 비서"가 되기 위한 섬세한 설계가 필요합니다.

---

## 목차

1. [알림 역할 정의](#1-알림-역할-정의)
2. [푸시 유형 분류](#2-푸시-유형-분류)
3. [문장 스타일 가이드](#3-문장-스타일-가이드)
4. [타이밍/트리거 규칙](#4-타이밍트리거-규칙)
5. [알림 → 앱 랜딩 UX](#5-알림--앱-랜딩-ux)
6. [무응답/미접속 대응](#6-무응답미접속-대응)
7. [성향별 개인화](#7-성향별-개인화)
8. [금기 목록](#8-금기-목록)

---

## 1. 알림 역할 정의

### 1.1 알림의 존재 이유

알프레도의 알림은 **"행동 트리거"**입니다.

```
알림의 목적:
- 리마인드 (잊어버린 것 상기)
- 넛지 (부드러운 행동 유도)
- 인사이트 (맥락 있는 정보 제공)
- 케어 (정서적 지지와 격려)

알림이 아닌 것:
- 광고/마케팅 도구
- 앱 참여 강요 수단
- 죄책감 유발 장치
```

### 1.2 알림 발송 원칙

| 원칙 | 설명 | 예시 |
|------|------|------|
| **맥락성** | 왜 지금 이 알림인지 명확 | "점심 먹고 2시간 지났어요" |
| **실행가능성** | 바로 할 수 있는 행동 제시 | "지금 시작" 버튼 포함 |
| **존중** | 사용자 시간과 상황 존중 | 미팅 중엔 보내지 않음 |
| **일관성** | 버틀러 캐릭터 톤 유지 | 항상 친근하고 다정하게 |

### 1.3 알림 vs 인앱 넛지

```
푸시 알림 (앱 외부):
- 중요도 높은 정보
- 시간 민감한 알림 (미팅 15분 전)
- 하루 최대 8개 제한

인앱 넛지 (앱 내부):
- 맥락적 제안
- 플로팅 형태로 노출
- 제한 없음 (자연스러운 흐름에서)
```

---

## 2. 푸시 유형 분류

### 2.1 알림 유형 체계

```typescript
type NotificationCategory =
  | 'scheduled'   // 정기 알림 (브리핑)
  | 'triggered'   // 이벤트 기반 (미팅 전)
  | 'contextual'  // 상황 기반 (빈 시간 감지)
  | 'care';       // 케어 알림 (격려, 휴식)
```

### 2.2 세부 유형표

| 유형 | 카테고리 | 긴급도 | 하루 최대 | 설명 |
|------|---------|--------|----------|------|
| `morning_briefing` | scheduled | 중 | 1 | 아침 하루 브리핑 |
| `evening_wrapup` | scheduled | 낮 | 1 | 저녁 마무리 |
| `meeting_reminder` | triggered | 높 | 10 | 미팅 N분 전 |
| `task_deadline` | triggered | 중 | 3 | 마감 임박 태스크 |
| `focus_suggest` | contextual | 낮 | 2 | 빈 시간 집중 제안 |
| `overload_warn` | care | 중 | 1 | 과부하 경고 |
| `rest_suggest` | care | 낮 | 3 | 휴식 권유 |
| `late_warning` | care | 중 | 2 | 퇴근 시간 알림 |
| `streak_celebrate` | care | 낮 | 3 | 연속 달성 축하 |
| `weather_adjust` | contextual | 낮 | 1 | 날씨 기반 조언 |

### 2.3 긴급도별 동작

```typescript
const URGENCY_BEHAVIOR = {
  high: {
    vibrate: true,
    requireInteraction: true,
    quietHoursException: false,  // 조용한 시간에도 조용히
    sound: 'default'
  },
  medium: {
    vibrate: true,
    requireInteraction: false,
    quietHoursException: false,
    sound: 'default'
  },
  low: {
    vibrate: false,
    requireInteraction: false,
    quietHoursException: false,
    sound: 'silent'
  }
};
```

---

## 3. 문장 스타일 가이드

### 3.1 기본 원칙

```
DO:
✓ 친근한 반말체 유지
✓ 이모지는 제목에만 1개
✓ 본문은 2줄 이내
✓ 구체적인 숫자 활용
✓ 긍정적 프레이밍

DON'T:
✗ 명령조 ("~하세요")
✗ 죄책감 유발 ("아직도 안 했어요?")
✗ 과도한 이모지
✗ 모호한 표현 ("앱을 확인해보세요")
```

### 3.2 유형별 톤 예시

#### 아침 브리핑
```
✓ "좋은 아침! 오늘 미팅 3개, 집중할 시간 2시간 있어요"
✓ "일어났어요? 오늘은 여유로운 하루예요 ☺️"
✗ "오늘 할 일이 있어요. 확인하세요."
```

#### 미팅 리마인더
```
✓ "팀 미팅 15분 전이에요. 커피 한 잔 어때요?"
✓ "다음 미팅 준비할 시간! 5분 뒤 시작이에요"
✗ "미팅 시작합니다."
```

#### 태스크 넛지
```
✓ "보고서 마감이 내일이에요. 오늘 시작해볼까요?"
✓ "이것부터 해볼까요? '발표 준비' 기다리고 있어요"
✗ "보고서를 제출하세요."
```

#### 휴식 권유
```
✓ "벌써 1시간 집중했어요! 잠깐 눈 쉬어가요 ☕"
✓ "미팅 사이 10분! 스트레칭 어때요?"
✗ "휴식을 취하세요."
```

#### 격려 메시지
```
✓ "3일 연속 물 마시기 성공! 습관이 되고 있어요"
✓ "오늘 벌써 태스크 5개 완료! 페이스 좋아요"
✗ "잘하고 있습니다."
```

### 3.3 상황별 변형

```typescript
const MORNING_BRIEFING_VARIANTS = {
  light: "오늘은 여유로운 하루예요. {top_task}부터 천천히 해볼까요?",
  normal: "오늘 할 일 {task_count}개, 미팅 {meeting_count}개 있어요.",
  heavy: "오늘 좀 바빠요! 미팅 {meeting_count}개... 힘내요 💪",
  very_heavy: "오늘 정말 빡빡해요 😅 가장 중요한 것부터 해봐요.",

  // 컨디션 기반 변형
  tired: "좀 피곤해 보여요. 오늘은 핵심만 집중해볼까요?",
  energetic: "오늘 컨디션 좋아 보여요! 도전적인 것 해볼까요?"
};
```

---

## 4. 타이밍/트리거 규칙

### 4.1 발송 가능 시간대

```typescript
const NOTIFICATION_HOURS = {
  // 기본 허용 시간
  default: {
    start: '07:00',
    end: '22:00'
  },

  // 조용한 시간 (절대 보내지 않음)
  quiet: {
    start: '22:00',
    end: '07:00'
  },

  // 타입별 예외
  exceptions: {
    morning_briefing: {
      start: '06:00',  // 아침 브리핑은 더 이를 수 있음
      useUserSetting: true  // 사용자 설정 우선
    },
    meeting_reminder: {
      ignoreQuietHours: false,  // 조용한 시간에 미팅이면?
      minNotice: 5  // 최소 5분 전
    }
  }
};
```

### 4.2 트리거 규칙

```typescript
const TRIGGER_RULES = {
  // 미팅 리마인더
  meeting_reminder: {
    triggers: [
      { before: 15, condition: 'first_reminder' },
      { before: 5, condition: 'urgent_reminder' },
      { before: 0, condition: 'start_now' }
    ],
    skipIf: [
      'meeting_declined',
      'already_in_meeting',
      'user_marked_prepared'
    ]
  },

  // 태스크 마감 알림
  task_deadline: {
    triggers: [
      { before: 24 * 60, condition: 'deadline_tomorrow' },
      { before: 4 * 60, condition: 'deadline_today' },
      { before: 60, condition: 'deadline_soon' }
    ],
    skipIf: [
      'task_completed',
      'task_delegated',
      'already_reminded_today'
    ]
  },

  // 집중 시간 제안
  focus_suggest: {
    triggers: [
      { event: 'free_time_detected', minDuration: 60 },
      { event: 'meeting_ended', cooldown: 10 },
      { event: 'peak_hour', userChronotype: true }
    ],
    skipIf: [
      'in_meeting',
      'break_time',
      'already_focusing'
    ]
  }
};
```

### 4.3 빈도 제한 (Throttling)

```typescript
const THROTTLE_RULES = {
  // 일일 최대
  dailyMax: {
    total: 8,
    byType: {
      morning_briefing: 1,
      evening_wrapup: 1,
      meeting_reminder: 10,  // 미팅 수에 따라
      task_deadline: 3,
      focus_suggest: 2,
      rest_suggest: 3,
      care_message: 2
    }
  },

  // 최소 간격 (분)
  minInterval: {
    default: 30,
    meeting_reminder: 5,
    rest_suggest: 60,
    same_task: 4 * 60  // 같은 태스크는 4시간
  },

  // 연속 무시 시 자동 감소
  autoReduce: {
    dismissThreshold: 3,  // 3번 연속 무시
    action: 'reduce_frequency',
    reduction: 0.5  // 50% 감소
  }
};
```

### 4.4 상황 인식

```typescript
async function shouldSendNow(
  userId: string,
  notificationType: string
): Promise<{ send: boolean; reason?: string }> {

  // 1. 현재 미팅 중인가?
  if (await isInMeeting(userId)) {
    if (notificationType !== 'meeting_reminder') {
      return { send: false, reason: 'in_meeting' };
    }
  }

  // 2. 집중 모드인가?
  if (await isFocusMode(userId)) {
    return { send: false, reason: 'focus_mode' };
  }

  // 3. 최근에 같은 타입 보냈나?
  const recent = await getRecentNotification(userId, notificationType);
  if (recent && withinMinInterval(recent)) {
    return { send: false, reason: 'too_soon' };
  }

  // 4. 일일 한도 초과?
  if (await exceedsDailyLimit(userId, notificationType)) {
    return { send: false, reason: 'daily_limit' };
  }

  // 5. 사용자가 해당 타입 비활성화?
  if (!await isTypeEnabled(userId, notificationType)) {
    return { send: false, reason: 'type_disabled' };
  }

  return { send: true };
}
```

---

## 5. 알림 → 앱 랜딩 UX

### 5.1 딥링크 설계

```typescript
const NOTIFICATION_LANDING = {
  morning_briefing: {
    url: '/briefing',
    state: { source: 'notification', highlight: 'today' }
  },

  meeting_reminder: {
    url: '/calendar?event={eventId}',
    state: { source: 'notification', action: 'join_meeting' }
  },

  task_deadline: {
    url: '/tasks/{taskId}',
    state: { source: 'notification', action: 'start_focus' }
  },

  focus_suggest: {
    url: '/focus?task={taskId}',
    state: { source: 'notification', autoStart: false }
  },

  rest_suggest: {
    url: '/',  // 메인으로
    state: { source: 'notification', showBreakCard: true }
  }
};
```

### 5.2 랜딩 후 플로우

```
알림 클릭 → 앱 오픈 → 컨텍스트 복원 → 액션 제안

예시 (미팅 리마인더):
1. 알림: "팀 미팅 5분 전이에요"
2. 클릭 → 캘린더 뷰 오픈
3. 해당 미팅 하이라이트
4. "미팅 참여" 버튼 노출
5. (미팅 링크 있으면) 바로 연결 옵션

예시 (집중 시간 제안):
1. 알림: "지금 2시간 비어있어요"
2. 클릭 → 집중 모드 화면
3. 추천 태스크 표시
4. "시작하기" / "다른 태스크" 선택
```

### 5.3 알림 액션 버튼

```typescript
interface NotificationAction {
  action: string;
  title: string;
  handler: (notificationData: any) => void;
}

const NOTIFICATION_ACTIONS = {
  meeting_reminder: [
    { action: 'join', title: '참여하기', handler: openMeetingLink },
    { action: 'snooze', title: '5분 뒤', handler: snooze5Minutes }
  ],

  task_deadline: [
    { action: 'start', title: '시작하기', handler: startFocusMode },
    { action: 'delegate', title: '위임하기', handler: openDelegateModal }
  ],

  rest_suggest: [
    { action: 'rest', title: '쉬어갈게요', handler: startBreak },
    { action: 'continue', title: '더 할게요', handler: dismissAndContinue }
  ],

  focus_suggest: [
    { action: 'start', title: '시작', handler: startSuggestedTask },
    { action: 'other', title: '다른 거', handler: openTaskPicker }
  ]
};
```

---

## 6. 무응답/미접속 대응

### 6.1 재개입 전략

```typescript
const REENGAGEMENT_STRATEGY = {
  // 레벨별 미접속 기간
  levels: {
    light: { days: 1, action: 'gentle_reminder' },
    medium: { days: 3, action: 'value_reminder' },
    heavy: { days: 7, action: 'miss_you' },
    dormant: { days: 14, action: 'soft_reset' }
  },

  // 재개입 메시지
  messages: {
    gentle_reminder: {
      title: "🐧 보고 싶어요",
      body: "어제 하루 어땠어요? 오늘 브리핑 준비했어요."
    },
    value_reminder: {
      title: "🐧 잊지 않았어요",
      body: "이번 주 미팅 {count}개 있어요. 같이 준비해요!"
    },
    miss_you: {
      title: "🐧 요즘 바빠요?",
      body: "언제든 다시 와요. 여기서 기다릴게요."
    },
    soft_reset: {
      title: "🐧 다시 만나요",
      body: "오랜만이에요! 새롭게 시작해볼까요?"
    }
  }
};
```

### 6.2 이탈 방지 규칙

```typescript
const CHURN_PREVENTION = {
  // 알림 무시 패턴 감지
  ignorePattern: {
    threshold: 5,  // 5개 연속 무시
    action: 'reduce_and_ask',
    message: "알림이 많았나요? 빈도 조절해드릴까요?"
  },

  // 앱 열고 바로 닫음
  bouncePattern: {
    threshold: 3,  // 3회 연속
    action: 'simplify_home',
    message: null  // 조용히 홈 단순화
  },

  // 미접속 예방
  inactivityPrevention: {
    checkAfter: 24 * 60,  // 24시간 미접속
    sendBriefingSummary: true,
    includeHook: "돌아오면 {pending_count}개 기다리고 있어요"
  }
};
```

### 6.3 복귀 사용자 처리

```typescript
async function handleUserReturn(userId: string, inactiveDays: number) {
  if (inactiveDays > 7) {
    // 오랜 부재 → 가볍게 리온보딩
    return {
      showWelcomeBack: true,
      resetDailyContext: true,
      message: "다시 만나서 반가워요! 오늘부터 다시 시작해볼까요?"
    };
  }

  if (inactiveDays > 3) {
    // 중간 부재 → 요약 제공
    return {
      showSummary: true,
      summaryPeriod: inactiveDays,
      message: `${inactiveDays}일 동안 이런 일이 있었어요`
    };
  }

  // 짧은 부재 → 평소처럼
  return {
    normalFlow: true
  };
}
```

---

## 7. 성향별 개인화

### 7.1 넛지 강도 설정

```typescript
type NudgeIntensity = 'minimal' | 'balanced' | 'proactive';

const INTENSITY_PROFILES = {
  minimal: {
    description: "꼭 필요한 알림만",
    dailyMax: 4,
    types: ['morning_briefing', 'meeting_reminder', 'urgent_deadline'],
    tone: 'gentle'
  },

  balanced: {
    description: "적절한 리마인드",
    dailyMax: 8,
    types: ['morning_briefing', 'meeting_reminder', 'task_deadline',
            'rest_suggest', 'evening_wrapup'],
    tone: 'friendly'
  },

  proactive: {
    description: "적극적인 서포트",
    dailyMax: 12,
    types: ['all'],
    tone: 'encouraging'
  }
};
```

### 7.2 크로노타입 적응

```typescript
const CHRONOTYPE_ADAPTATION = {
  morning_person: {
    peakHours: ['08:00-12:00'],
    briefingTime: '07:00',
    focusSuggestionBias: 'morning',
    eveningWrapup: '18:00'
  },

  night_owl: {
    peakHours: ['14:00-18:00', '20:00-24:00'],
    briefingTime: '09:30',
    focusSuggestionBias: 'afternoon',
    eveningWrapup: '21:00'
  },

  flexible: {
    peakHours: ['10:00-12:00', '14:00-16:00'],
    briefingTime: '08:30',
    focusSuggestionBias: 'adaptive',
    eveningWrapup: '19:00'
  }
};
```

### 7.3 DNA 기반 개인화

```typescript
interface PersonalizationFactors {
  // 에너지 패턴
  energyPattern: {
    peakTimes: string[];
    lowTimes: string[];
    adaptNotificationTiming: boolean;
  };

  // 스트레스 반응
  stressResponse: {
    currentLevel: 'low' | 'medium' | 'high';
    reduceNudgesWhenStressed: boolean;
    increaseCarMessages: boolean;
  };

  // 작업 스타일
  workStyle: {
    preferredFocusDuration: number;
    breakFrequency: number;
    multitaskingTendency: 'low' | 'medium' | 'high';
  };

  // 알림 반응 이력
  notificationResponse: {
    bestRespondingTypes: string[];
    worstRespondingTypes: string[];
    averageResponseTime: number;
  };
}

async function personalizeNotification(
  userId: string,
  notification: NotificationTemplate
): Promise<NotificationTemplate> {
  const dna = await getDNAInsights(userId);
  const factors = await getPersonalizationFactors(userId);

  // 스트레스 높을 때 톤 조절
  if (factors.stressResponse.currentLevel === 'high') {
    notification.body = softenTone(notification.body);
  }

  // 반응 좋은 타입 우선
  if (factors.notificationResponse.bestRespondingTypes.includes(notification.data.type)) {
    // 이 타입은 효과적 - 유지
  }

  return notification;
}
```

---

## 8. 금기 목록

### 8.1 절대 하지 말 것

```typescript
const FORBIDDEN_PRACTICES = {
  // 죄책감 유발 금지
  guilt: {
    forbidden: [
      "아직도 안 했어요?",
      "또 미루셨네요",
      "이러면 안 되는데...",
      "약속 지키세요",
      "실망이에요"
    ],
    reason: "ADHD 사용자에게 죄책감은 동기부여가 아닌 회피 유발"
  },

  // 압박감 금지
  pressure: {
    forbidden: [
      "빨리 하세요",
      "지금 당장",
      "늦었어요!",
      "시간 없어요",
      "마감입니다!"
    ],
    reason: "급박함은 패닉을 유발하고 오히려 행동을 멈추게 함"
  },

  // 비교 금지
  comparison: {
    forbidden: [
      "다른 사람들은...",
      "평균적으로...",
      "원래는..."
    ],
    reason: "비교는 자존감을 낮추고 앱 이탈 유발"
  },

  // 무의미한 알림 금지
  meaningless: {
    forbidden: [
      "앱을 열어보세요",
      "새로운 기능이 있어요",
      "오랜만이에요" // (맥락 없이)
    ],
    reason: "맥락 없는 알림은 신뢰를 깎음"
  }
};
```

### 8.2 시간대별 제한

```typescript
const TIME_RESTRICTIONS = {
  // 절대 보내지 않는 시간
  absolute_quiet: {
    hours: ['00:00-06:00'],
    exceptions: []  // 없음
  },

  // 주의가 필요한 시간
  cautious: {
    hours: ['22:00-00:00', '06:00-07:00'],
    allowedTypes: ['urgent_meeting_reminder'],
    maxPerHour: 1
  },

  // 주말 제한
  weekend: {
    reducedFrequency: 0.5,  // 50% 감소
    disabledTypes: ['task_deadline', 'focus_suggest'],
    exception: 'user_explicit_request'
  }
};
```

### 8.3 상태별 제한

```typescript
const STATE_RESTRICTIONS = {
  // 스트레스 높을 때
  high_stress: {
    disabledTypes: ['task_deadline', 'overload_warn'],
    enabledTypes: ['rest_suggest', 'care_message'],
    toneAdjustment: 'extra_gentle'
  },

  // 미팅 연속일 때
  meeting_marathon: {
    disabledTypes: ['focus_suggest', 'task_nudge'],
    enabledTypes: ['rest_suggest', 'encouragement'],
    message: "미팅 사이 잠깐 숨 쉬어요"
  },

  // 마감 직전
  deadline_crunch: {
    reducedFrequency: 0.7,
    focusOn: ['deadline_task_only'],
    avoidDistractions: true
  }
};
```

### 8.4 개인 선호 존중

```typescript
const USER_PREFERENCE_RESPECT = {
  // 사용자가 끈 타입은 절대 보내지 않음
  respectDisabledTypes: true,

  // 반복 무시한 타입은 자동 감소
  autoReduceIgnored: {
    threshold: 3,
    reduction: 0.5
  },

  // 명시적 피드백 반영
  feedbackActions: {
    'too_many': { action: 'reduce_50', ask: true },
    'not_helpful': { action: 'disable_type', ask: true },
    'wrong_time': { action: 'adjust_timing', ask: true }
  }
};
```

---

## 구현 체크리스트

### Phase 1: 기본 인프라
- [ ] PWA 푸시 구독 (VAPID)
- [ ] 서버 푸시 발송 (web-push)
- [ ] 기본 알림 타입 구현 (브리핑, 미팅)
- [ ] 설정 UI

### Phase 2: 스마트 로직
- [ ] 타이밍 엔진 (조용한 시간, 미팅 중 감지)
- [ ] 쓰로틀링 시스템
- [ ] 쿨다운 로직
- [ ] 딥링크 라우팅

### Phase 3: 개인화
- [ ] DNA 기반 타이밍 조정
- [ ] 반응 이력 분석
- [ ] 자동 빈도 조절
- [ ] 크로노타입 적응

### Phase 4: 재개입
- [ ] 미접속 감지
- [ ] 재개입 메시지 발송
- [ ] 복귀 사용자 플로우
- [ ] 이탈 방지 로직

---

## 기술 참조

- 기술 구현 상세: [07-notification-system.md](./07-notification-system.md)
- 안전 시스템: [safety-guidelines.md](./safety-guidelines.md)
- 톤 시스템: [03-tone-system.md](./03-tone-system.md)
