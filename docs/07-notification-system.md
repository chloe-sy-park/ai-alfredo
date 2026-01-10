# 07. 알림 시스템 설계

> PWA 푸시 알림 + 인앱 플로팅 넛지

---

## 📌 핵심 원칙 (ADHD 친화적)

```
┌─────────────────────────────────────────────────────────┐
│                    알림 철학                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ❌ 하지 말 것                                          │
│  • 죄책감 유발 ("아직도 안 했어요?")                      │
│  • 과도한 빈도 (하루 10개+)                              │
│  • 무의미한 알림 ("앱을 열어보세요")                      │
│  • 늦은 밤/이른 아침                                    │
│                                                         │
│  ✅ 해야 할 것                                          │
│  • 맥락 있는 알림 (왜 지금인지)                          │
│  • 실행 가능한 내용 (다음 행동 명확)                     │
│  • 적절한 타이밍 (에너지/상황 고려)                      │
│  • 톤 일관성 (버틀러 캐릭터 유지)                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📨 알림 타입 정의

| 타입 | 트리거 | 긴급도 | 예시 |
|------|--------|--------|------|
| `morning_briefing` | 설정된 아침 시간 | 중 | "좋은 아침! 오늘 미팅 3개..." |
| `evening_wrapup` | 설정된 저녁 시간 | 낮 | "오늘 하루 수고하셨어요" |
| `meeting_reminder` | 미팅 15분 전 | 높 | "15분 뒤 팀 미팅이에요" |
| `focus_suggest` | 빈 시간 감지 | 낮 | "지금 2시간 비어있어요" |
| `task_nudge` | 마감 임박 | 중 | "보고서 마감이 내일이에요" |
| `overload_warn` | 과부하 감지 | 중 | "오늘 일정이 빡빡해요" |
| `rest_suggest` | 장시간 작업 | 낮 | "1시간 집중했어요, 쉬어갈까요?" |
| `late_warning` | 퇴근시간 초과 | 중 | "벌써 8시예요!" |
| `streak_celebrate` | 연속 달성 | 낮 | "3일 연속 물 마시기 성공!" |

---

## 🚫 알림 빈도 제한

```typescript
const NOTIFICATION_LIMITS = {
  // 일일 최대
  daily_max: 8,
  
  // 타입별 최대
  per_type: {
    morning_briefing: 1,
    evening_wrapup: 1,
    meeting_reminder: 10,  // 미팅 수에 따라
    focus_suggest: 2,
    task_nudge: 3,
    overload_warn: 1,
    rest_suggest: 3,
    late_warning: 2,
    streak_celebrate: 3
  },
  
  // 최소 간격 (분)
  min_interval: {
    default: 30,
    meeting_reminder: 5,  // 미팅은 더 춤춤히 가능
    rest_suggest: 60
  },
  
  // 조용한 시간
  quiet_hours: {
    start: '22:00',
    end: '07:00',
    exceptions: ['morning_briefing']  // 아침 브리핑은 예외
  }
};
```

---

## 📝 알림 콘텐츠 템플릿

```typescript
const NOTIFICATION_TEMPLATES = {
  morning_briefing: {
    title: "🐧 좋은 아침이에요!",
    body: {
      light: "오늘은 여유로운 하루예요. {top_task}부터 시작해볼까요?",
      normal: "오늘 할 일 {task_count}개, 미팅 {meeting_count}개 있어요.",
      heavy: "오늘 좀 바빠요! 미팅 {meeting_count}개... 힘내세요 💪",
      very_heavy: "오늘 정말 빡빡해요 😅 천천히 하나씩 해봐요."
    },
    action: {
      label: "오늘 브리핑 보기",
      url: "/briefing"
    }
  },
  
  meeting_reminder: {
    title: "📅 곳 미팅이에요",
    body: {
      "15min": "{meeting_title} 15분 전이에요",
      "5min": "{meeting_title} 5분 남았어요!",
      "now": "{meeting_title} 시작 시간이에요"
    },
    action: {
      label: "미팅 참여",
      url: "{meeting_link}"
    }
  },
  
  task_nudge: {
    title: "📋 잊지 마세요",
    body: {
      deadline_today: "{task_title} 오늘까지예요",
      deadline_tomorrow: "{task_title} 내일까지예요. 오늘 시작해볼까요?",
      neglected: "{task_title}... 잊고 계신 건 아니죠? 😊",
      waiting: "{waiting_for}님이 {task_title} 기다리고 있어요"
    },
    action: {
      label: "태스크 보기",
      url: "/tasks/{task_id}"
    }
  },
  
  rest_suggest: {
    title: "☕ 잠깐 쉬어가요",
    body: {
      "1hour": "1시간 집중했어요! 5분만 쉬어갈까요?",
      "2hour": "벌써 2시간째... 스트레칭 어때요?",
      "post_meeting": "미팅 끝났어요! 잠깐 환기하고 오세요 🌿"
    }
  },
  
  late_warning: {
    title: "🌙 퇴근 시간이에요",
    body: {
      first: "벌써 {time}이에요. 마무리할 시간!",
      second: "{time}... 진짜 가셔야 해요 😅"
    }
  },
  
  streak_celebrate: {
    title: "🎉 대단해요!",
    body: {
      "3days": "{habit_title} 3일 연속! 좋은 습관이 되고 있어요",
      "7days": "일주일 연속 {habit_title}! 🔥",
      "30days": "한 달 연속!! {habit_title} 이제 완전 습관이네요 ✨"
    }
  },
  
  overload_warn: {
    title: "😮‍💨 오늘 좀 바빠요",
    body: {
      default: "미팅 {meeting_count}개에 할 일도 많아요. 천천히 해요!",
      consecutive: "미팅이 연속으로 있네요. 사이사이 숨 돌리세요."
    }
  },
  
  focus_suggest: {
    title: "🎯 집중하기 좋은 시간이에요",
    body: {
      default: "지금부터 {duration} 비어있어요. {top_task} 해볼까요?",
      peak_hour: "지금이 집중 잘 되는 시간이에요! 활용해볼까요?"
    }
  }
};
```

---

## 🧠 스마트 타이밍 로직

```typescript
interface NotificationContext {
  userId: string;
  type: NotificationType;
  targetId?: string;  // task_id or event_id
  scheduledFor?: Date;
}

async function shouldSendNotification(ctx: NotificationContext): Promise<boolean> {
  const user = await getUser(ctx.userId);
  const settings = await getSettings(ctx.userId);
  const dna = await getDNAInsights(ctx.userId);
  const recentNudges = await getRecentNudges(ctx.userId, { hours: 24 });
  
  // 1. 알림 꺼져있으면 패스
  if (!settings.notification_enabled) return false;
  
  // 2. 타입별 설정 체크
  if (!settings.notification_types[ctx.type]) return false;
  
  // 3. 조용한 시간 체크
  if (isQuietHours(settings) && !QUIET_EXCEPTIONS.includes(ctx.type)) {
    return false;
  }
  
  // 4. 일일 최대 체크
  if (recentNudges.length >= NOTIFICATION_LIMITS.daily_max) {
    return false;
  }
  
  // 5. 타입별 최대 체크
  const typeCount = recentNudges.filter(n => n.nudge_type === ctx.type).length;
  if (typeCount >= NOTIFICATION_LIMITS.per_type[ctx.type]) {
    return false;
  }
  
  // 6. 최소 간격 체크
  const lastNudge = recentNudges[0];
  if (lastNudge) {
    const minInterval = NOTIFICATION_LIMITS.min_interval[ctx.type] 
      || NOTIFICATION_LIMITS.min_interval.default;
    const elapsed = (Date.now() - new Date(lastNudge.sent_at).getTime()) / 60000;
    if (elapsed < minInterval) return false;
  }
  
  // 7. 에너지 레벨 체크 (DNA 기반)
  if (ctx.type === 'task_nudge' && dna.current_stress === 'high') {
    // 스트레스 높을 때는 태스크 넛지 자제
    return false;
  }
  
  // 8. 미팅 중 체크
  if (await isInMeeting(ctx.userId)) {
    // 미팅 중엔 미팅 리마인더 외 알림 보류
    if (ctx.type !== 'meeting_reminder') return false;
  }
  
  return true;
}
```

---

## ⏱️ 쿨다운 시스템

```typescript
// 같은 대상에 대한 반복 알림 방지
const COOLDOWN_RULES = {
  // 같은 태스크에 대한 넛지
  task_nudge: {
    same_task: 4 * 60,  // 4시간
    after_action: 24 * 60  // 완료/연기 후 24시간
  },
  
  // 같은 미팅에 대한 리마인더
  meeting_reminder: {
    same_meeting: 10  // 10분 (15분전, 5분전)
  },
  
  // 휴식 제안
  rest_suggest: {
    after_action: 60  // 휴식 후 1시간
  }
};

async function checkCooldown(
  userId: string, 
  type: NotificationType, 
  targetId?: string
): Promise<boolean> {
  const lastNudge = await getLastNudgeForTarget(userId, type, targetId);
  
  if (!lastNudge) return true;  // 처음이면 OK
  
  const rules = COOLDOWN_RULES[type];
  if (!rules) return true;
  
  const elapsed = (Date.now() - new Date(lastNudge.sent_at).getTime()) / 60000;
  
  // 액션 후 쿨다운
  if (lastNudge.action_taken && rules.after_action) {
    return elapsed >= rules.after_action;
  }
  
  // 같은 대상 쿨다운
  if (rules.same_task || rules.same_meeting) {
    const cooldown = rules.same_task || rules.same_meeting;
    return elapsed >= cooldown;
  }
  
  return true;
}
```

---

## 📱 PWA 푸시 알림 구현

### Service Worker 등록

```typescript
// 클라이언트
async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return;
  }
  
  const registration = await navigator.serviceWorker.register('/sw.js');
  
  // 권한 요쳐
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return;
  }
  
  // Push 구독
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  // 서버에 구독 정보 저장
  await savePushSubscription(subscription);
}
```

### Service Worker (sw.js)

```javascript
// 푸시 수신
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/alfredo-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag,  // 같은 tag면 교체
    renotify: true,
    requireInteraction: data.urgent || false,
    actions: data.actions || [],
    data: {
      url: data.url,
      notificationId: data.id
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data.url || '/';
  const notificationId = event.notification.data.notificationId;
  
  // 액션 버튼 클릭 처리
  if (event.action === 'snooze') {
    event.waitUntil(snoozeNotification(notificationId));
    return;
  }
  
  if (event.action === 'complete') {
    event.waitUntil(completeTask(notificationId));
    return;
  }
  
  // 기본 클릭 - 앱 열기
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      // 없으면 새 창
      return clients.openWindow(url);
    })
  );
  
  // 클릭 로그 저장
  fetch('/api/notifications/clicked', {
    method: 'POST',
    body: JSON.stringify({ notificationId, action: event.action || 'click' })
  });
});
```

---

## 🚀 서버 사이드 푸시 발송

```typescript
// api/notifications/send.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:contact@alfredo.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  userId: string,
  notification: NotificationPayload
) {
  // 1. 발송 가능 여부 체크
  if (!await shouldSendNotification({ userId, type: notification.type })) {
    return { sent: false, reason: 'throttled' };
  }
  
  // 2. 쿨다운 체크
  if (!await checkCooldown(userId, notification.type, notification.targetId)) {
    return { sent: false, reason: 'cooldown' };
  }
  
  // 3. 사용자 구독 정보 조회
  const subscriptions = await getPushSubscriptions(userId);
  if (!subscriptions.length) {
    return { sent: false, reason: 'no_subscription' };
  }
  
  // 4. 톤 적용
  const settings = await getSettings(userId);
  const content = applyTone(notification, settings.tone_preset);
  
  // 5. 푸시 발송
  const results = await Promise.allSettled(
    subscriptions.map(sub => 
      webpush.sendNotification(sub, JSON.stringify(content))
    )
  );
  
  // 6. 로그 저장
  await saveNudgeLog({
    user_id: userId,
    nudge_type: notification.type,
    target_task_id: notification.taskId,
    target_event_id: notification.eventId,
    context: {
      tone_used: settings.tone_preset,
      subscriptions_count: subscriptions.length,
      success_count: results.filter(r => r.status === 'fulfilled').length
    }
  });
  
  return { sent: true };
}
```

---

## ⏰ 스케줄러 (Cron Jobs)

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/morning-briefing",
      "schedule": "0,30 6-10 * * *"  // 6-10시 매 30분
    },
    {
      "path": "/api/cron/evening-wrapup",
      "schedule": "0 18-22 * * *"    // 18-22시 매정각
    },
    {
      "path": "/api/cron/meeting-reminders",
      "schedule": "*/5 * * * *"      // 5분마다
    },
    {
      "path": "/api/cron/task-nudges",
      "schedule": "0 9,14 * * *"     // 9시, 14시
    }
  ]
}
```

### 아침 브리핑 Cron

```typescript
// api/cron/morning-briefing.ts
export async function GET(request: Request) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // 현재 시간에 브리핑 받을 사용자 조회
  // (morning_briefing_time이 현재 시간과 일치)
  const users = await supabase
    .from('settings')
    .select('user_id')
    .eq('notification_enabled', true)
    .gte('morning_briefing_time', `${currentHour}:${currentMinute - 15}`)
    .lte('morning_briefing_time', `${currentHour}:${currentMinute + 15}`);
  
  for (const user of users.data || []) {
    const briefing = await generateMorningBriefing(user.user_id);
    await sendPushNotification(user.user_id, {
      type: 'morning_briefing',
      ...briefing
    });
  }
  
  return Response.json({ processed: users.data?.length || 0 });
}
```

### 미팅 리마인더 Cron

```typescript
// api/cron/meeting-reminders.ts
export async function GET(request: Request) {
  const now = new Date();
  const in15min = new Date(now.getTime() + 15 * 60 * 1000);
  const in5min = new Date(now.getTime() + 5 * 60 * 1000);
  
  // 15분 뒤 미팅
  const meetings15 = await supabase
    .from('calendar_cache_encrypted')
    .select('*')
    .gte('start_time', now.toISOString())
    .lte('start_time', in15min.toISOString())
    .eq('event_type', 'meeting');
  
  for (const meeting of meetings15.data || []) {
    // 15분 전 알림 이미 보냈는지 체크
    const alreadySent = await checkNudgeExists(
      meeting.user_id, 
      'meeting_reminder', 
      meeting.id,
      15
    );
    
    if (!alreadySent) {
      await sendPushNotification(meeting.user_id, {
        type: 'meeting_reminder',
        eventId: meeting.id,
        timing: '15min'
      });
    }
  }
  
  // 5분 뒤 미팅도 동일하게...
  
  return Response.json({ processed: meetings15.data?.length || 0 });
}
```

---

## 🎮 인앱 플로팅 넛지

```typescript
// 푸시 외에 앱 내 플로팅 넛지
interface FloatingNudge {
  id: string;
  type: NudgeType;
  message: string;
  emoji: string;
  actions: NudgeAction[];
  dismissible: boolean;
  autoHide?: number;  // ms
}

// React 컴포넌트
const FloatingNudgeComponent = ({ nudge }: { nudge: FloatingNudge }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (nudge.autoHide) {
      const timer = setTimeout(() => setVisible(false), nudge.autoHide);
      return () => clearTimeout(timer);
    }
  }, [nudge.autoHide]);
  
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 left-4 right-4 
                 bg-white/90 backdrop-blur-lg rounded-2xl 
                 shadow-lg border border-lavender-200 p-4
                 z-50"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{nudge.emoji}</span>
        <div className="flex-1">
          <p className="text-gray-800">{nudge.message}</p>
          <div className="flex gap-2 mt-2">
            {nudge.actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="px-3 py-1.5 text-sm rounded-full
                           bg-lavender-100 text-lavender-700
                           hover:bg-lavender-200 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        {nudge.dismissible && (
          <button 
            onClick={() => setVisible(false)} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
```

### 플로팅 넛지 트리거

```typescript
// 앱 상태에 따른 넛지 트리거
function useFloatingNudges() {
  const [nudge, setNudge] = useState<FloatingNudge | null>(null);
  const { tasks, meetings, dna, settings } = useAppState();
  
  useEffect(() => {
    // 1. 집중 시간 감지
    const focusTime = findFocusTime(meetings);
    if (focusTime && focusTime.duration >= 60) {
      const topTask = getTopPriorityTask(tasks);
      if (topTask) {
        setNudge({
          id: 'focus-time',
          type: 'focus_suggest',
          emoji: '🎯',
          message: `지금부터 ${focusTime.duration}분 비어있어요. "${topTask.title}" 해볼까요?`,
          actions: [
            { id: 'start', label: '시작하기', action: () => startTask(topTask.id) },
            { id: 'later', label: '나중에', action: () => dismiss() }
          ],
          dismissible: true,
          autoHide: 30000
        });
      }
    }
    
    // 2. 장시간 작업 감지
    const focusDuration = getFocusDuration();
    if (focusDuration >= 60 && !nudge) {
      setNudge({
        id: 'rest-suggest',
        type: 'rest_suggest',
        emoji: '☕',
        message: '1시간 집중했어요! 5분만 쉬어갈까요?',
        actions: [
          { id: 'rest', label: '쉬어가기', action: () => startBreak() },
          { id: 'continue', label: '더 할게요', action: () => dismiss() }
        ],
        dismissible: true
      });
    }
    
    // 3. 퇴근 시간 감지
    const hour = new Date().getHours();
    if (hour >= 19 && isStillWorking()) {
      setNudge({
        id: 'late-warning',
        type: 'late_warning',
        emoji: '🌙',
        message: `벌써 ${hour}시예요. 마무리할 시간!`,
        actions: [
          { id: 'wrapup', label: '마무리하기', action: () => showWrapup() }
        ],
        dismissible: true
      });
    }
  }, [tasks, meetings, dna]);
  
  return nudge;
}
```

---

## ⚙️ 알림 설정 UI

```typescript
// 사용자 제어 가능한 설정
interface NotificationSettings {
  // 전체 ON/OFF
  enabled: boolean;
  
  // 시간대
  morning_briefing_time: string;  // "08:00"
  evening_wrapup_time: string;    // "21:00"
  
  // 조용한 시간
  quiet_start: string;  // "22:00"
  quiet_end: string;    // "07:00"
  
  // 타입별 ON/OFF
  types: {
    morning_briefing: boolean;
    evening_wrapup: boolean;
    meeting_reminder: boolean;
    task_nudge: boolean;
    rest_suggest: boolean;
    late_warning: boolean;
    streak_celebrate: boolean;
  };
  
  // 미팅 리마인더 시간
  meeting_reminder_before: number[];  // [15, 5] = 15분전, 5분전
  
  // 넛지 강도
  nudge_intensity: 'minimal' | 'balanced' | 'proactive';
}

// 강도별 기본값
const INTENSITY_PRESETS = {
  minimal: {
    daily_max: 4,
    types: {
      morning_briefing: true,
      meeting_reminder: true,
      task_nudge: false,
      rest_suggest: false,
      late_warning: false,
      streak_celebrate: true
    }
  },
  balanced: {
    daily_max: 8,
    types: {
      morning_briefing: true,
      meeting_reminder: true,
      task_nudge: true,
      rest_suggest: true,
      late_warning: true,
      streak_celebrate: true
    }
  },
  proactive: {
    daily_max: 12,
    types: {
      morning_briefing: true,
      meeting_reminder: true,
      task_nudge: true,
      rest_suggest: true,
      late_warning: true,
      streak_celebrate: true,
      focus_suggest: true,
      overload_warn: true
    }
  }
};
```

---

## 📊 알림 효과 분석

```typescript
// 넛지 효과 측정
interface NudgeEffectiveness {
  type: NotificationType;
  sent_count: number;
  read_rate: number;       // read_at 있는 비율
  click_rate: number;      // action_taken = 'clicked'
  completion_rate: number; // 태스크 완료로 이어진 비율
  dismiss_rate: number;    // action_taken = 'dismissed'
}

async function analyzeNudgeEffectiveness(
  userId: string,
  period: 'week' | 'month'
): Promise<NudgeEffectiveness[]> {
  const nudges = await getNudgesForPeriod(userId, period);
  
  const byType = groupBy(nudges, 'nudge_type');
  
  return Object.entries(byType).map(([type, items]) => ({
    type: type as NotificationType,
    sent_count: items.length,
    read_rate: items.filter(n => n.read_at).length / items.length,
    click_rate: items.filter(n => n.action_taken === 'clicked').length / items.length,
    completion_rate: calculateCompletionRate(items),
    dismiss_rate: items.filter(n => n.action_taken === 'dismissed').length / items.length
  }));
}

// 효과 낮은 알림 타입 자동 조정
async function autoTuneNotifications(userId: string) {
  const effectiveness = await analyzeNudgeEffectiveness(userId, 'week');
  
  for (const stat of effectiveness) {
    // dismiss율이 70% 이상이면 빈도 줄이기
    if (stat.dismiss_rate > 0.7) {
      await reduceFrequency(userId, stat.type);
    }
    
    // 클릭율이 90% 이상이면 빈도 늦려도 OK
    if (stat.click_rate > 0.9) {
      // 이 타입은 효과적 - 유지
    }
  }
}
```

---

## 🛡️ 알림 권한 요청 UX

```typescript
// Permission Priming - 시스템 다이얼로그 전 커스텀 화면
const NotificationPermissionScreen = () => {
  return (
    <div className="flex flex-col items-center p-6 text-center">
      <div className="text-6xl mb-4">🐧</div>
      <h2 className="text-xl font-semibold mb-2">
        알림을 켜주세요
      </h2>
      <p className="text-gray-600 mb-6">
        중요한 일정을 놓치지 않도록,<br />
        알프레도가 부드럽게 알려드릴게요.
      </p>
      
      <div className="w-full space-y-3 mb-6 text-left">
        <div className="flex items-center gap-3 p-3 bg-lavender-50 rounded-lg">
          <span>🌅</span>
          <span className="text-sm">아침 브리핑으로 하루 시작</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-lavender-50 rounded-lg">
          <span>📅</span>
          <span className="text-sm">미팅 15분 전 리마인드</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-lavender-50 rounded-lg">
          <span>☕</span>
          <span className="text-sm">오래 집중했을 때 휴식 제안</span>
        </div>
      </div>
      
      <button
        onClick={requestPermission}
        className="w-full py-3 bg-lavender-500 text-white rounded-xl
                   font-medium hover:bg-lavender-600 transition-colors"
      >
        알림 켜기
      </button>
      
      <button
        onClick={skip}
        className="mt-3 text-gray-500 text-sm"
      >
        나중에 설정할게요
      </button>
    </div>
  );
};
```

---

## 📝 구현 우선순위

1. **Phase 1**: PWA 푸시 기본 (아침 브리핑, 미팅 리마인더)
2. **Phase 2**: 인앱 플로팅 넛지
3. **Phase 3**: 스마트 타이밍 + 쿨다운
4. **Phase 4**: 효과 분석 + 자동 튜닝
