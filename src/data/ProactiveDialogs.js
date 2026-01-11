// ═══════════════════════════════════════════════════════════════════════════
// 🐧 ProactiveDialogs.js - 알프레도 선제적 대화 데이터
// 알프레도가 먼저 말을 거는 상황별 대화 트리거 및 응답 옵션
// 참고: Anima AI (능동적 대화), Wysa (단계적 개입), Pi (선택지 제공)
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 트리거 타입 정의
// ─────────────────────────────────────────────────────────────────────────────
export const TRIGGER_TYPES = {
  APP_OPEN: 'app_open',           // 앱 실행 시
  TIME_BASED: 'time_based',       // 특정 시간대
  CALENDAR: 'calendar',           // 캘린더 이벤트 기반
  TASK: 'task',                   // 태스크 상태 기반
  ENERGY: 'energy',               // 에너지 레벨 기반
  ACHIEVEMENT: 'achievement',     // 성취 달성 시
  INACTIVITY: 'inactivity',       // 비활성 상태
  CONTEXT: 'context',             // 복합 컨텍스트
};

// ─────────────────────────────────────────────────────────────────────────────
// 액션 타입 정의 (응답 버튼 클릭 시 실행할 액션)
// ─────────────────────────────────────────────────────────────────────────────
export const ACTION_TYPES = {
  DISMISS: 'dismiss',             // 닫기
  OPEN_BRIEFING: 'open_briefing', // 브리핑 열기
  OPEN_CHAT: 'open_chat',         // 채팅 열기
  OPEN_TASKS: 'open_tasks',       // 태스크 목록 열기
  OPEN_CALENDAR: 'open_calendar', // 캘린더 열기
  START_FOCUS: 'start_focus',     // 집중 모드 시작
  TAKE_BREAK: 'take_break',       // 휴식 모드
  QUICK_ADD: 'quick_add',         // 빠른 추가
  SHOW_STATS: 'show_stats',       // 통계 보기
  OPEN_LIFE: 'open_life',         // 라이프 탭 열기
  CELEBRATE: 'celebrate',         // 축하 애니메이션
  SNOOZE: 'snooze',               // 나중에 다시
};

// ═══════════════════════════════════════════════════════════════════════════
// 앱 오픈 시 대화
// ═══════════════════════════════════════════════════════════════════════════
export const APP_OPEN_DIALOGS = {
  // 오늘 첫 방문
  firstVisitToday: [
    {
      id: 'first_visit_morning',
      message: '좋은 아침이에요! 오늘 하루 어떻게 시작할까요?',
      responses: [
        { id: 'briefing', text: '오늘 브리핑 보기', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📋' },
        { id: 'tasks', text: '할 일 확인하기', action: ACTION_TYPES.OPEN_TASKS, icon: '✅' },
        { id: 'later', text: '나중에요', action: ACTION_TYPES.DISMISS, icon: '👋' },
      ],
    },
    {
      id: 'first_visit_afternoon',
      message: '안녕하세요! 오후도 힘내봐요 💪',
      responses: [
        { id: 'briefing', text: '남은 일정 보기', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📅' },
        { id: 'tasks', text: '오늘 할 일 확인', action: ACTION_TYPES.OPEN_TASKS, icon: '✅' },
        { id: 'later', text: '괜찮아요', action: ACTION_TYPES.DISMISS, icon: '👋' },
      ],
    },
    {
      id: 'first_visit_evening',
      message: '저녁이에요! 오늘 하루 어땠어요?',
      responses: [
        { id: 'review', text: '하루 정리하기', action: ACTION_TYPES.SHOW_STATS, icon: '📊' },
        { id: 'chat', text: '얘기하고 싶어요', action: ACTION_TYPES.OPEN_CHAT, icon: '💬' },
        { id: 'later', text: '그냥 볼게요', action: ACTION_TYPES.DISMISS, icon: '👋' },
      ],
    },
  ],

  // 몇 시간 만에 돌아옴
  returningAfterHours: [
    {
      id: 'return_hours_1',
      message: '다시 왔네요! 좀 쉬다 오셨어요?',
      responses: [
        { id: 'continue', text: '이어서 할게요', action: ACTION_TYPES.OPEN_TASKS, icon: '▶️' },
        { id: 'check', text: '뭐 놓쳤나 보기', action: ACTION_TYPES.OPEN_BRIEFING, icon: '👀' },
        { id: 'later', text: '그냥 둘러볼게요', action: ACTION_TYPES.DISMISS, icon: '🚶' },
      ],
    },
    {
      id: 'return_hours_2',
      message: '돌아오셨군요! 뭐 도와드릴까요?',
      responses: [
        { id: 'tasks', text: '할 일 보기', action: ACTION_TYPES.OPEN_TASKS, icon: '✅' },
        { id: 'chat', text: '대화하기', action: ACTION_TYPES.OPEN_CHAT, icon: '💬' },
        { id: 'later', text: '괜찮아요', action: ACTION_TYPES.DISMISS, icon: '👋' },
      ],
    },
  ],

  // 며칠 만에 돌아옴
  returningAfterDays: [
    {
      id: 'return_days_1',
      message: '오랜만이에요! 보고 싶었어요 🐧',
      responses: [
        { id: 'catchup', text: '그동안 뭐 있었어요?', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📰' },
        { id: 'restart', text: '다시 시작해볼게요', action: ACTION_TYPES.OPEN_TASKS, icon: '🔄' },
        { id: 'chat', text: '저도요!', action: ACTION_TYPES.OPEN_CHAT, icon: '💜' },
      ],
    },
    {
      id: 'return_days_2',
      message: '다시 만나서 반가워요! 천천히 시작해요.',
      responses: [
        { id: 'gentle', text: '오늘 할 일 보기', action: ACTION_TYPES.OPEN_TASKS, icon: '📝' },
        { id: 'chat', text: '얘기 먼저 할래요', action: ACTION_TYPES.OPEN_CHAT, icon: '💬' },
        { id: 'later', text: '둘러볼게요', action: ACTION_TYPES.DISMISS, icon: '👀' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 시간대별 대화
// ═══════════════════════════════════════════════════════════════════════════
export const TIME_BASED_DIALOGS = {
  // 이른 아침 (5-8시)
  earlyMorning: [
    {
      id: 'early_morning_1',
      message: '이른 아침이네요! 일찍 시작하시는군요 👏',
      responses: [
        { id: 'morning', text: '오늘 계획 세우기', action: ACTION_TYPES.OPEN_TASKS, icon: '📝' },
        { id: 'briefing', text: '브리핑 보기', action: ACTION_TYPES.OPEN_BRIEFING, icon: '☀️' },
        { id: 'later', text: '아직 잠이...', action: ACTION_TYPES.DISMISS, icon: '😴' },
      ],
    },
  ],

  // 아침 (8-10시)
  morning: [
    {
      id: 'morning_1',
      message: '좋은 아침! 오늘 하루 어떻게 보낼까요?',
      responses: [
        { id: 'briefing', text: '오늘 브리핑 보기', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📋' },
        { id: 'focus', text: '바로 집중 모드', action: ACTION_TYPES.START_FOCUS, icon: '🎯' },
        { id: 'later', text: '천천히 할게요', action: ACTION_TYPES.DISMISS, icon: '☕' },
      ],
    },
    {
      id: 'morning_2',
      message: '오늘도 화이팅! 뭐부터 시작할까요?',
      responses: [
        { id: 'tasks', text: '할 일 보기', action: ACTION_TYPES.OPEN_TASKS, icon: '✅' },
        { id: 'calendar', text: '일정 확인', action: ACTION_TYPES.OPEN_CALENDAR, icon: '📅' },
        { id: 'later', text: '아직 준비 중', action: ACTION_TYPES.DISMISS, icon: '🌅' },
      ],
    },
  ],

  // 늦은 아침 (10-12시)
  lateMorning: [
    {
      id: 'late_morning_1',
      message: '점심 전에 끝낼 거 있어요?',
      responses: [
        { id: 'focus', text: '집중해서 끝내기', action: ACTION_TYPES.START_FOCUS, icon: '⚡' },
        { id: 'tasks', text: '남은 일 확인', action: ACTION_TYPES.OPEN_TASKS, icon: '📝' },
        { id: 'later', text: '여유롭게 할게요', action: ACTION_TYPES.DISMISS, icon: '🌿' },
      ],
    },
  ],

  // 점심 (12-14시)
  lunch: [
    {
      id: 'lunch_1',
      message: '점심 먹었어요? 든든히 먹고 오후도 화이팅! 🍽️',
      responses: [
        { id: 'ate', text: '먹었어요!', action: ACTION_TYPES.DISMISS, icon: '😋' },
        { id: 'soon', text: '지금 먹으러 가요', action: ACTION_TYPES.DISMISS, icon: '🚶' },
        { id: 'skip', text: '오늘은 패스...', action: ACTION_TYPES.OPEN_LIFE, icon: '😅' },
      ],
    },
  ],

  // 오후 (14-17시)
  afternoon: [
    {
      id: 'afternoon_1',
      message: '오후 슬럼프 시간대네요. 괜찮아요?',
      responses: [
        { id: 'fine', text: '괜찮아요, 계속할게요', action: ACTION_TYPES.OPEN_TASKS, icon: '💪' },
        { id: 'break', text: '잠깐 쉴래요', action: ACTION_TYPES.TAKE_BREAK, icon: '☕' },
        { id: 'change', text: '다른 거 할래요', action: ACTION_TYPES.OPEN_TASKS, icon: '🔄' },
      ],
    },
    {
      id: 'afternoon_2',
      message: '오후 중반! 집중력이 떨어질 때예요.',
      responses: [
        { id: 'focus', text: '집중 모드 켜기', action: ACTION_TYPES.START_FOCUS, icon: '🎯' },
        { id: 'easy', text: '가벼운 일 하기', action: ACTION_TYPES.OPEN_TASKS, icon: '🌱' },
        { id: 'break', text: '휴식 취하기', action: ACTION_TYPES.TAKE_BREAK, icon: '🧘' },
      ],
    },
  ],

  // 늦은 오후 (17-19시)
  lateAfternoon: [
    {
      id: 'late_afternoon_1',
      message: '퇴근 시간이 다가오네요. 오늘 마무리 어때요?',
      responses: [
        { id: 'review', text: '오늘 정리하기', action: ACTION_TYPES.SHOW_STATS, icon: '📊' },
        { id: 'finish', text: '마지막 스퍼트!', action: ACTION_TYPES.START_FOCUS, icon: '🏃' },
        { id: 'done', text: '오늘은 여기까지', action: ACTION_TYPES.DISMISS, icon: '✨' },
      ],
    },
  ],

  // 저녁 (19-21시)
  evening: [
    {
      id: 'evening_1',
      message: '오늘 하루 수고했어요! 어떤 하루였어요?',
      responses: [
        { id: 'good', text: '좋았어요!', action: ACTION_TYPES.CELEBRATE, icon: '😊' },
        { id: 'normal', text: '그냥 그랬어요', action: ACTION_TYPES.OPEN_CHAT, icon: '😐' },
        { id: 'hard', text: '힘들었어요', action: ACTION_TYPES.OPEN_CHAT, icon: '😮‍💨' },
      ],
    },
    {
      id: 'evening_2',
      message: '저녁 시간이에요. 오늘 스스로에게 수고했다고 해주세요 💜',
      responses: [
        { id: 'review', text: '하루 돌아보기', action: ACTION_TYPES.SHOW_STATS, icon: '📝' },
        { id: 'relax', text: '쉬는 중이에요', action: ACTION_TYPES.DISMISS, icon: '🛋️' },
        { id: 'more', text: '아직 할 일 있어요', action: ACTION_TYPES.OPEN_TASKS, icon: '📋' },
      ],
    },
  ],

  // 밤 (21-23시)
  night: [
    {
      id: 'night_1',
      message: '늦은 시간까지 수고 많아요. 무리하지 마세요~',
      responses: [
        { id: 'finish', text: '조금만 더 하고 잘게요', action: ACTION_TYPES.OPEN_TASKS, icon: '📝' },
        { id: 'sleep', text: '이제 잘래요', action: ACTION_TYPES.DISMISS, icon: '🌙' },
        { id: 'chat', text: '잠이 안 와요', action: ACTION_TYPES.OPEN_CHAT, icon: '💭' },
      ],
    },
  ],

  // 늦은 밤 (23시 이후)
  lateNight: [
    {
      id: 'late_night_1',
      message: '이 시간까지...! 푹 쉬는 것도 생산성이에요 🌙',
      responses: [
        { id: 'sleep', text: '맞아요, 잘게요', action: ACTION_TYPES.DISMISS, icon: '😴' },
        { id: 'little', text: '조금만 더요', action: ACTION_TYPES.SNOOZE, icon: '⏰' },
        { id: 'cant', text: '잠이 안 와요', action: ACTION_TYPES.OPEN_CHAT, icon: '🌟' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 요일별 대화
// ═══════════════════════════════════════════════════════════════════════════
export const DAY_BASED_DIALOGS = {
  monday: [
    {
      id: 'monday_1',
      message: '월요일이에요! 이번 주도 같이 해봐요 💪',
      responses: [
        { id: 'plan', text: '이번 주 계획 보기', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📅' },
        { id: 'start', text: '바로 시작!', action: ACTION_TYPES.OPEN_TASKS, icon: '🚀' },
        { id: 'slow', text: '천천히 시작할게요', action: ACTION_TYPES.DISMISS, icon: '🐢' },
      ],
    },
  ],

  friday: [
    {
      id: 'friday_1',
      message: '금요일! 이번 주 마무리 어때요? 🎉',
      responses: [
        { id: 'review', text: '이번 주 정리하기', action: ACTION_TYPES.SHOW_STATS, icon: '📊' },
        { id: 'finish', text: '마지막 할 일 끝내기', action: ACTION_TYPES.OPEN_TASKS, icon: '✅' },
        { id: 'done', text: '이미 끝났어요!', action: ACTION_TYPES.CELEBRATE, icon: '🎊' },
      ],
    },
  ],

  saturday: [
    {
      id: 'saturday_1',
      message: '주말이에요! 오늘은 뭐 할 거예요?',
      responses: [
        { id: 'rest', text: '푹 쉴 거예요', action: ACTION_TYPES.DISMISS, icon: '🛋️' },
        { id: 'personal', text: '개인 일정 있어요', action: ACTION_TYPES.OPEN_LIFE, icon: '🌿' },
        { id: 'work', text: '일 좀 해야 해요', action: ACTION_TYPES.OPEN_TASKS, icon: '💼' },
      ],
    },
  ],

  sunday: [
    {
      id: 'sunday_1',
      message: '일요일이에요. 충분히 쉬었어요?',
      responses: [
        { id: 'rested', text: '네! 충전 완료', action: ACTION_TYPES.DISMISS, icon: '🔋' },
        { id: 'prep', text: '다음 주 준비할래요', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📋' },
        { id: 'notyet', text: '좀 더 쉴래요', action: ACTION_TYPES.OPEN_LIFE, icon: '😴' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 캘린더 기반 대화
// ═══════════════════════════════════════════════════════════════════════════
export const CALENDAR_DIALOGS = {
  busyDay: [
    {
      id: 'busy_day_1',
      message: '오늘 일정이 많네요! 우선순위 정리해드릴까요?',
      responses: [
        { id: 'yes', text: '네, 정리해주세요', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📋' },
        { id: 'calendar', text: '일정 먼저 볼게요', action: ACTION_TYPES.OPEN_CALENDAR, icon: '📅' },
        { id: 'ok', text: '괜찮아요, 할 수 있어요', action: ACTION_TYPES.DISMISS, icon: '💪' },
      ],
    },
  ],

  freeDay: [
    {
      id: 'free_day_1',
      message: '오늘은 일정이 적네요. 밀린 일 정리할까요?',
      responses: [
        { id: 'yes', text: '좋아요!', action: ACTION_TYPES.OPEN_TASKS, icon: '✅' },
        { id: 'focus', text: '집중 작업 할게요', action: ACTION_TYPES.START_FOCUS, icon: '🎯' },
        { id: 'rest', text: '여유롭게 보낼래요', action: ACTION_TYPES.DISMISS, icon: '🌿' },
      ],
    },
  ],

  beforeMeeting: [
    {
      id: 'before_meeting_1',
      message: '곧 미팅이에요! 준비됐어요?',
      responses: [
        { id: 'ready', text: '준비 완료!', action: ACTION_TYPES.DISMISS, icon: '✅' },
        { id: 'prep', text: '잠깐 준비할게요', action: ACTION_TYPES.SNOOZE, icon: '📝' },
        { id: 'info', text: '미팅 정보 보기', action: ACTION_TYPES.OPEN_CALENDAR, icon: '📅' },
      ],
    },
  ],

  afterMeeting: [
    {
      id: 'after_meeting_1',
      message: '미팅 끝났네요! 어떠셨어요?',
      responses: [
        { id: 'good', text: '잘 끝났어요', action: ACTION_TYPES.DISMISS, icon: '👍' },
        { id: 'note', text: '메모 남길래요', action: ACTION_TYPES.QUICK_ADD, icon: '📝' },
        { id: 'tired', text: '좀 지쳤어요', action: ACTION_TYPES.TAKE_BREAK, icon: '😮‍💨' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 태스크 기반 대화
// ═══════════════════════════════════════════════════════════════════════════
export const TASK_DIALOGS = {
  noTasks: [
    {
      id: 'no_tasks_1',
      message: '오늘 할 일이 비어있네요! 추가해볼까요?',
      responses: [
        { id: 'add', text: '할 일 추가하기', action: ACTION_TYPES.QUICK_ADD, icon: '➕' },
        { id: 'briefing', text: '브리핑 먼저 볼게요', action: ACTION_TYPES.OPEN_BRIEFING, icon: '📋' },
        { id: 'free', text: '오늘은 프리데이!', action: ACTION_TYPES.DISMISS, icon: '🎉' },
      ],
    },
  ],

  manyTasks: [
    {
      id: 'many_tasks_1',
      message: '할 일이 많네요! 우선순위 정리해볼까요?',
      responses: [
        { id: 'prioritize', text: '정리해주세요', action: ACTION_TYPES.OPEN_TASKS, icon: '📊' },
        { id: 'focus', text: '하나씩 집중할게요', action: ACTION_TYPES.START_FOCUS, icon: '🎯' },
        { id: 'later', text: '나중에요', action: ACTION_TYPES.DISMISS, icon: '⏰' },
      ],
    },
  ],

  deferredTask: [
    {
      id: 'deferred_task_1',
      message: '미뤄둔 일이 있어요. 오늘 해볼까요?',
      responses: [
        { id: 'yes', text: '오늘 해볼게요', action: ACTION_TYPES.OPEN_TASKS, icon: '💪' },
        { id: 'part', text: '조금만 할게요', action: ACTION_TYPES.START_FOCUS, icon: '🌱' },
        { id: 'later', text: '아직은...', action: ACTION_TYPES.SNOOZE, icon: '😅' },
      ],
    },
  ],

  allComplete: [
    {
      id: 'all_complete_1',
      message: '와! 오늘 할 일 다 끝냈어요! 🎉',
      responses: [
        { id: 'celebrate', text: '야호!', action: ACTION_TYPES.CELEBRATE, icon: '🎊' },
        { id: 'more', text: '더 할 수 있어요', action: ACTION_TYPES.QUICK_ADD, icon: '💪' },
        { id: 'rest', text: '이제 쉴래요', action: ACTION_TYPES.DISMISS, icon: '🛋️' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 에너지 기반 대화
// ═══════════════════════════════════════════════════════════════════════════
export const ENERGY_DIALOGS = {
  low: [
    {
      id: 'energy_low_1',
      message: '에너지가 낮은 것 같아요. 쉬어갈까요?',
      responses: [
        { id: 'break', text: '잠깐 쉴게요', action: ACTION_TYPES.TAKE_BREAK, icon: '☕' },
        { id: 'easy', text: '가벼운 일 할래요', action: ACTION_TYPES.OPEN_TASKS, icon: '🌱' },
        { id: 'push', text: '조금만 더 해볼게요', action: ACTION_TYPES.DISMISS, icon: '💪' },
      ],
    },
  ],

  recovering: [
    {
      id: 'energy_recovering_1',
      message: '좀 나아졌어요? 천천히 다시 시작해요.',
      responses: [
        { id: 'yes', text: '네, 할 수 있어요', action: ACTION_TYPES.OPEN_TASKS, icon: '✨' },
        { id: 'more', text: '조금 더 쉴래요', action: ACTION_TYPES.TAKE_BREAK, icon: '🧘' },
        { id: 'easy', text: '쉬운 것부터요', action: ACTION_TYPES.OPEN_TASKS, icon: '🌿' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 성취 기반 대화
// ═══════════════════════════════════════════════════════════════════════════
export const ACHIEVEMENT_DIALOGS = {
  streak: [
    {
      id: 'streak_3',
      message: '3일 연속 달성! 좋은 흐름이에요 🔥',
      minStreak: 3,
      responses: [
        { id: 'celebrate', text: '야호!', action: ACTION_TYPES.CELEBRATE, icon: '🎉' },
        { id: 'continue', text: '계속 가볼게요', action: ACTION_TYPES.OPEN_TASKS, icon: '🚀' },
      ],
    },
    {
      id: 'streak_7',
      message: '일주일 연속! 대단해요! 🌟',
      minStreak: 7,
      responses: [
        { id: 'celebrate', text: '와!', action: ACTION_TYPES.CELEBRATE, icon: '🎊' },
        { id: 'stats', text: '기록 보기', action: ACTION_TYPES.SHOW_STATS, icon: '📊' },
      ],
    },
    {
      id: 'streak_30',
      message: '한 달 연속! 정말 대단해요! 🏆',
      minStreak: 30,
      responses: [
        { id: 'celebrate', text: '해냈어요!', action: ACTION_TYPES.CELEBRATE, icon: '🏆' },
        { id: 'share', text: '자랑하기', action: ACTION_TYPES.SHOW_STATS, icon: '📣' },
      ],
    },
  ],

  levelUp: [
    {
      id: 'level_up_1',
      message: '레벨 업! 성장하고 있어요! 🆙',
      responses: [
        { id: 'celebrate', text: '야호!', action: ACTION_TYPES.CELEBRATE, icon: '🎉' },
        { id: 'stats', text: '내 성장 보기', action: ACTION_TYPES.SHOW_STATS, icon: '📈' },
      ],
    },
  ],

  badge: [
    {
      id: 'badge_1',
      message: '새 배지 획득! 🏅',
      responses: [
        { id: 'view', text: '배지 보기', action: ACTION_TYPES.SHOW_STATS, icon: '🏅' },
        { id: 'continue', text: '계속할게요', action: ACTION_TYPES.DISMISS, icon: '💪' },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 대화 선택 로직
// ═══════════════════════════════════════════════════════════════════════════

// 쿨다운 관리 (같은 대화 반복 방지)
const dialogCooldowns = new Map();
const COOLDOWN_DURATION = 30 * 60 * 1000; // 30분

// 일일 표시 횟수 관리
const dailyNudgeCounts = new Map();
const MAX_DAILY_NUDGES = 10;

// ─────────────────────────────────────────────────────────────────────────────
// 헬퍼 함수들
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentHour = () => new Date().getHours();
const getCurrentDay = () => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 쿨다운 체크
const isOnCooldown = (dialogId) => {
  const lastShown = dialogCooldowns.get(dialogId);
  if (!lastShown) return false;
  return Date.now() - lastShown < COOLDOWN_DURATION;
};

// 일일 한도 체크
const hasReachedDailyLimit = (dialogType) => {
  const today = new Date().toDateString();
  const key = `${dialogType}_${today}`;
  const count = dailyNudgeCounts.get(key) || 0;
  return count >= MAX_DAILY_NUDGES;
};

// 표시 기록
export const recordNudgeShown = (dialogId) => {
  dialogCooldowns.set(dialogId, Date.now());
  
  const today = new Date().toDateString();
  const key = `general_${today}`;
  const count = dailyNudgeCounts.get(key) || 0;
  dailyNudgeCounts.set(key, count + 1);
};

// 일일 카운트 리셋
export const resetDailyLimits = () => {
  const today = new Date().toDateString();
  for (const [key] of dailyNudgeCounts) {
    if (!key.includes(today)) {
      dailyNudgeCounts.delete(key);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 시간대 판별
// ─────────────────────────────────────────────────────────────────────────────
const getTimePeriod = () => {
  const hour = getCurrentHour();
  if (hour >= 5 && hour < 8) return 'earlyMorning';
  if (hour >= 8 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 12) return 'lateMorning';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'lateAfternoon';
  if (hour >= 19 && hour < 21) return 'evening';
  if (hour >= 21 && hour < 23) return 'night';
  return 'lateNight';
};

// ─────────────────────────────────────────────────────────────────────────────
// 메인 대화 선택 함수
// ─────────────────────────────────────────────────────────────────────────────
export const getProactiveDialog = (context = {}) => {
  const {
    isFirstVisitToday = false,
    hoursSinceLastVisit = 0,
    daysSinceLastVisit = 0,
    taskCount = 0,
    completedTaskCount = 0,
    hasDeferredTasks = false,
    calendarEventsToday = 0,
    minutesUntilNextMeeting = null,
    justFinishedMeeting = false,
    energyLevel = 'normal', // 'low', 'normal', 'high'
    streak = 0,
    justLeveledUp = false,
    justEarnedBadge = false,
  } = context;

  // 일일 한도 체크
  if (hasReachedDailyLimit('general')) return null;

  // 우선순위 기반 대화 선택
  let dialog = null;

  // 1. 성취 관련 (가장 우선)
  if (justLeveledUp && !isOnCooldown('level_up_1')) {
    dialog = ACHIEVEMENT_DIALOGS.levelUp[0];
  } else if (justEarnedBadge && !isOnCooldown('badge_1')) {
    dialog = ACHIEVEMENT_DIALOGS.badge[0];
  } else if (streak >= 30 && !isOnCooldown('streak_30')) {
    dialog = ACHIEVEMENT_DIALOGS.streak.find(d => d.minStreak === 30);
  } else if (streak >= 7 && !isOnCooldown('streak_7')) {
    dialog = ACHIEVEMENT_DIALOGS.streak.find(d => d.minStreak === 7);
  } else if (streak >= 3 && !isOnCooldown('streak_3')) {
    dialog = ACHIEVEMENT_DIALOGS.streak.find(d => d.minStreak === 3);
  }

  if (dialog) return dialog;

  // 2. 앱 오픈 관련
  if (daysSinceLastVisit >= 3) {
    const dialogs = APP_OPEN_DIALOGS.returningAfterDays.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (hoursSinceLastVisit >= 3) {
    const dialogs = APP_OPEN_DIALOGS.returningAfterHours.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (isFirstVisitToday) {
    const timePeriod = getTimePeriod();
    let dialogs;
    if (['earlyMorning', 'morning', 'lateMorning'].includes(timePeriod)) {
      dialogs = APP_OPEN_DIALOGS.firstVisitToday.filter(d => d.id.includes('morning'));
    } else if (['lunch', 'afternoon', 'lateAfternoon'].includes(timePeriod)) {
      dialogs = APP_OPEN_DIALOGS.firstVisitToday.filter(d => d.id.includes('afternoon'));
    } else {
      dialogs = APP_OPEN_DIALOGS.firstVisitToday.filter(d => d.id.includes('evening'));
    }
    dialogs = dialogs.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  }

  // 3. 태스크 상태 관련
  if (taskCount > 0 && completedTaskCount === taskCount) {
    const dialogs = TASK_DIALOGS.allComplete.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (taskCount === 0 && !isOnCooldown('no_tasks_1')) {
    return TASK_DIALOGS.noTasks[0];
  } else if (taskCount >= 7) {
    const dialogs = TASK_DIALOGS.manyTasks.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (hasDeferredTasks) {
    const dialogs = TASK_DIALOGS.deferredTask.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  }

  // 4. 에너지 관련
  if (energyLevel === 'low') {
    const dialogs = ENERGY_DIALOGS.low.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  }

  // 5. 캘린더 관련
  if (justFinishedMeeting) {
    const dialogs = CALENDAR_DIALOGS.afterMeeting.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (minutesUntilNextMeeting !== null && minutesUntilNextMeeting <= 15) {
    const dialogs = CALENDAR_DIALOGS.beforeMeeting.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (calendarEventsToday >= 5) {
    const dialogs = CALENDAR_DIALOGS.busyDay.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  } else if (calendarEventsToday === 0) {
    const dialogs = CALENDAR_DIALOGS.freeDay.filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  }

  // 6. 요일 관련
  const day = getCurrentDay();
  if (DAY_BASED_DIALOGS[day]) {
    const dialogs = DAY_BASED_DIALOGS[day].filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  }

  // 7. 시간대 관련 (폴백)
  const timePeriod = getTimePeriod();
  if (TIME_BASED_DIALOGS[timePeriod]) {
    const dialogs = TIME_BASED_DIALOGS[timePeriod].filter(d => !isOnCooldown(d.id));
    if (dialogs.length > 0) return getRandomItem(dialogs);
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// 통계 (디버그용)
// ─────────────────────────────────────────────────────────────────────────────
export const PROACTIVE_DIALOG_STATS = {
  appOpen: Object.values(APP_OPEN_DIALOGS).flat().length,
  timeBased: Object.values(TIME_BASED_DIALOGS).flat().length,
  dayBased: Object.values(DAY_BASED_DIALOGS).flat().length,
  calendar: Object.values(CALENDAR_DIALOGS).flat().length,
  task: Object.values(TASK_DIALOGS).flat().length,
  energy: Object.values(ENERGY_DIALOGS).flat().length,
  achievement: Object.values(ACHIEVEMENT_DIALOGS).flat().length,
  get total() {
    return this.appOpen + this.timeBased + this.dayBased + 
           this.calendar + this.task + this.energy + this.achievement;
  },
};