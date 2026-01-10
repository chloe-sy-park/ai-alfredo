# 04. 브리핑 생성 알고리즘

> 알프레도가 언제, 어떻게 사용자에게 말을 거는지

---

## 📋 브리핑 종류

| 종류 | 트리거 | 목적 | 빈도 |
|------|--------|------|------|
| ☀️ 아침 브리핑 | 설정 시간 or 첫 앱 오픈 | 하루 시작 준비 | 1일 1회 |
| 🌙 저녁 마무리 | 설정 시간 or 퇴근 시간 | 하루 정리 | 1일 1회 |
| ⚡ 실시간 넛지 | 이벤트 기반 | 즉각 알림 | 상황별 |
| 📊 주간 리뷰 | 일요일 저녁 or 월요일 아침 | 한 주 돌아보기 | 1주 1회 |

---

## ☀️ 아침 브리핑 알고리즘

### 입력 데이터

```typescript
interface MorningBriefingInput {
  // 기본 정보
  currentTime: Date;
  dayOfWeek: string;
  weather: WeatherData;
  
  // 일정
  todayCalendar: CalendarEvent[];
  
  // 태스크
  incompleteTasks: Task[];
  yesterdayCompletion: CompletionStats;
  
  // DNA 인사이트
  dnaInsights: DNAInsights;
  
  // 설정
  userSettings: UserSettings;
}
```

### 출력 구조

```typescript
interface MorningBriefingOutput {
  greeting: string;           // 1. 인사
  conditionCheck: string[];   // 2. 컨디션 선택지
  todaySummary: string;       // 3. 오늘 요약
  top3: Task[];               // 4. Top 3 우선순위
  comment: string;            // 5. 알프레도 코멘트
  quickActions: Action[];     // 6. 퀵 액션 버튼
}
```

### 인사 생성 로직

```javascript
function generateGreeting(input) {
  const { dayOfWeek, currentTime, weather } = input;
  const hour = currentTime.getHours();
  
  // 시간대별 기본 인사
  let timeGreeting;
  if (hour < 9) timeGreeting = "일찍 일어났네요!";
  else if (hour < 11) timeGreeting = "좋은 아침이에요";
  else timeGreeting = "늦은 아침이에요";
  
  // 요일별 추가
  const dayComment = {
    '월요일': "새로운 한 주 시작이에요.",
    '금요일': "금요일이에요! 조금만 힘내요.",
    '토요일': "주말이에요. 푹 쉬어도 돼요.",
    '일요일': "일요일이에요. 내일 준비할까요?"
  };
  
  // 날씨 코멘트
  let weatherComment = '';
  if (weather.rain) weatherComment = "비 오니까 우산 챙기세요 ☔";
  else if (weather.temp < 5) weatherComment = "많이 추워요, 따뜻하게 입으세요 🧣";
  else if (weather.temp > 30) weatherComment = "더워요, 물 많이 마시세요 💧";
  
  return `${timeGreeting} ${dayComment[dayOfWeek] || ''} ${weatherComment}`.trim();
}
```

### 하루 강도 판단

```javascript
function assessDayIntensity(calendar, dnaInsights) {
  const meetings = calendar.filter(e => e.type === 'meeting');
  const meetingCount = meetings.length;
  const totalMeetingHours = meetings.reduce((sum, m) => sum + m.duration, 0) / 60;
  
  // 사용자별 임계치 (DNA에서 학습)
  const threshold = dnaInsights.meetingStressThreshold || 3;
  
  // 연속 미팅 체크
  const hasBackToBack = checkBackToBackMeetings(meetings);
  
  // 판단
  if (meetingCount >= threshold + 2 || totalMeetingHours >= 6) {
    return {
      level: 'very_heavy',
      message: '오늘 정말 빡세요',
      emoji: '🔥'
    };
  }
  if (meetingCount >= threshold || hasBackToBack) {
    return {
      level: 'heavy',
      message: '미팅이 좀 많아요',
      emoji: '💪'
    };
  }
  if (meetingCount <= 1 && getFreeBlocks(calendar) >= 3) {
    return {
      level: 'light',
      message: '여유로운 하루예요',
      emoji: '✨'
    };
  }
  return {
    level: 'normal',
    message: '평범한 하루예요',
    emoji: '👍'
  };
}
```

### 코멘트 생성 (톤 반영)

```javascript
function generateComment(context, tone) {
  const { intensity, incompleteTasks, stressLevel } = context;
  
  // 스트레스 높으면 격려
  if (stressLevel === 'high') {
    return pickByTone(tone, {
      friend: "힘든 시간 지나고 있는 것 같아요. 오늘 무리하지 마요 💜",
      butler: "컨디션이 좋지 않아 보여요. 오늘은 필수만 하고 쉬어요.",
      coach: "컨디션 안 좋을 때도 있어요. 핵심만 끝내고 쉬어요!"
    });
  }
  
  // 미완료 많으면
  if (incompleteTasks.length >= 5) {
    return pickByTone(tone, {
      friend: "밀린 게 좀 있네요. 괜찮아요, 하나씩 해봐요.",
      butler: "미완료가 5개 있어요. Top 3만 집중하면 괜찮을 거예요.",
      coach: "밀린 것들 오늘 정리해봐요! 할 수 있어요!"
    });
  }
  
  // 빡센 날
  if (intensity.level === 'very_heavy') {
    return pickByTone(tone, {
      friend: "오늘 진짜 바쁘다... 중간중간 숨 쉬는 거 잊지 마요.",
      butler: "미팅 사이사이 5분이라도 쉬세요. 마라톤이에요.",
      coach: "빡센 하루! 하나씩 클리어하면 돼요. 가봅시다!"
    });
  }
  
  // 기본
  return pickByTone(tone, {
    friend: "오늘도 파이팅이에요 💜",
    butler: "좋은 하루 되세요.",
    coach: "오늘도 달려봐요! 💪"
  });
}
```

---

## 🌙 저녁 마무리 알고리즘

### 출력 구조

```typescript
interface EveningWrapupOutput {
  closingGreeting: string;      // 1. 마무리 인사
  achievements: string[];       // 2. 완료 목록 (칭찬)
  incompleteHandling: string;   // 3. 미완료 처리
  tomorrowPreview: string;      // 4. 내일 미리보기
  restEncouragement: string;    // 5. 휴식 권유
}
```

### 예시 출력

```
🌙 오늘 하루 수고했어요!

✅ 완료한 것들:
- 주간보고서 제출
- 팀미팅 참석  
- 이메일 3개 답장

잘했어요! 👏

📌 내일로 넘긴 것:
- 클라이언트 제안서 (괜찮아요, 내일 오전에 해요)

📆 내일 미리보기:
- 미팅 2개
- 오후는 여유로워요

🌟 오늘 충분히 했어요. 푹 쉬세요!
```

---

## ⚡ 실시간 넛지 트리거

| 트리거 | 조건 | 메시지 템플릿 | 톤 |
|--------|------|--------------|----|
| 미팅 전 알림 | 30분/10분 전 | "30분 후 {미팅명}이에요. 준비할 거 있어요?" | 집사 |
| 집중 시간 | 설정 시간대 진입 | "집중 시간이에요. 방해 최소화할까요?" | 비서 |
| 방치된 태스크 | 3일+ 미완료 | "이거 계속 미뤄지고 있는데, 오늘 5분만 해볼까요?" | 친구 |
| 과부하 감지 | 태스크 5개+ 추가 | "오늘 많이 넣었네요. 우선순위 정리해볼까요?" | 집사 |
| 휴식 필요 | 2시간+ 집중 후 | "2시간 집중했어요! 5분 쉬어가요 ☕" | 친구 |
| 퇴근 시간 | 설정 시간 도달 | "퇴근 시간이에요. 오늘 마무리할까요?" | 집사 |
| 지각 위험 | 일정 전 이동시간 부족 | "30분 후 {장소}인데, 지금 출발해야 할 것 같아요!" | 코치 |

### 넛지 빈도 제어

```javascript
const NUDGE_COOLDOWN = {
  meeting_reminder: 0,      // 쿨다운 없음 (중요)
  focus_time: 60 * 4,       // 4시간
  neglected_task: 60 * 24,  // 24시간
  overload: 60 * 2,         // 2시간  
  rest_needed: 60 * 2,      // 2시간
  end_of_work: 0,           // 쿨다운 없음 (1일 1회)
  late_warning: 0           // 쿨다운 없음 (중요)
};

function shouldSendNudge(type, lastSentTime) {
  const cooldown = NUDGE_COOLDOWN[type];
  const minutesSinceLast = (Date.now() - lastSentTime) / (1000 * 60);
  return minutesSinceLast >= cooldown;
}
```

---

## 📊 주간 리뷰

### 포함 내용

1. **완료 통계**: 완료/미완료 비율, 총 완료 수
2. **패턴 발견**: "화요일이 가장 생산적이었어요"
3. **DNA 업데이트**: 새로 발견한 패턴 공유
4. **다음 주 미리보기**: 주요 일정
5. **격려 메시지**: 진행 상황 칭찬

---

## 🎯 구현 우선순위

1. **Phase 1**: 아침 브리핑 기본
2. **Phase 2**: 저녁 마무리
3. **Phase 3**: 실시간 넛지 (미팅 전, 휴식)
4. **Phase 4**: 주간 리뷰
5. **Phase 5**: 고급 넛지 (과부하, 지각 위험)
