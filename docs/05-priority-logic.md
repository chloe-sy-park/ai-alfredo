# 05. 태스크 우선순위 계산 로직

> Top 3를 어떻게 선정하는가

---

## 📐 기본 공식

```
태스크 점수 = Σ (기준별 점수 × 가중치)
Top 3 = 점수 상위 3개
```

---

## 📊 우선순위 기준 (6가지)

| 기준 | 코드 | 설명 | 점수 범위 |
|------|------|------|----------|
| ⏰ 마감 임박 | `deadline` | D-day 가까울수록 높음 | 0-100 |
| ⭐ 중요 표시 | `starred` | 직접 ⭐ 표시한 것 | 0 or 70 |
| 👤 누군가 기다림 | `waiting` | 다른 사람 관련 | 0-80 |
| ⏱️ 소요시간 | `duration` | 큰/작은 작업 우선 | 0-50 |
| 🔄 반복 미룸 | `deferred` | 계속 미뤄진 것 | 0-60 |
| 📅 오늘 예정 | `scheduled` | 오늘로 잡은 것 | 0 or 50 |

---

## 🔢 기준별 점수 계산

### 1. 마감 임박 점수

```javascript
function deadlineScore(task) {
  if (!task.deadline) return 0;
  
  const hoursLeft = (task.deadline - Date.now()) / (1000 * 60 * 60);
  
  if (hoursLeft < 0) return 100;      // 이미 지남 🔴
  if (hoursLeft < 3) return 95;       // 3시간 이내
  if (hoursLeft < 12) return 80;      // 12시간 이내
  if (hoursLeft < 24) return 60;      // 오늘 중
  if (hoursLeft < 48) return 40;      // 내일까지
  if (hoursLeft < 72) return 25;      // 3일 이내
  if (hoursLeft < 168) return 10;     // 일주일 이내
  return 0;                           // 일주일 이상
}
```

### 2. 중요 표시 점수

```javascript
function starredScore(task) {
  return task.starred ? 70 : 0;
}
```

### 3. 누군가 기다림 점수

```javascript
function waitingScore(task) {
  switch (task.waitingFor) {
    case 'external': return 80;  // 외부 (클라이언트 등)
    case 'boss': return 75;      // 상사
    case 'team': return 60;      // 팀원
    default: return 0;
  }
}
```

### 4. 소요시간 점수

```javascript
function durationScore(task, preference) {
  const hours = task.estimatedMinutes / 60;
  
  if (preference === 'big_first') {
    // Eat the frog - 큰 것 먼저
    if (hours >= 2) return 50;
    if (hours >= 1) return 30;
    return 10;
  } 
  
  if (preference === 'small_first') {
    // Quick wins - 작은 것 먼저
    if (hours <= 0.25) return 50;  // 15분 이하
    if (hours <= 0.5) return 30;   // 30분 이하
    return 10;
  }
  
  return 0; // 고려 안 함
}
```

### 5. 반복 미룸 점수

```javascript
function deferredScore(task) {
  const count = task.deferCount || 0;
  
  if (count >= 5) return 60;   // 5번 이상 미룸 🚨
  if (count >= 3) return 45;   // 3-4번
  if (count >= 2) return 30;   // 2번
  if (count >= 1) return 15;   // 1번
  return 0;
}
```

### 6. 오늘 예정 점수

```javascript
function scheduledTodayScore(task) {
  if (!task.scheduledDate) return 0;
  return isToday(task.scheduledDate) ? 50 : 0;
}
```

---

## ⚖️ 가중치 시스템

### 가중치 레벨

```javascript
const WEIGHT_LEVELS = {
  off: 0,        // 사용 안 함
  low: 0.5,      // 낮음
  medium: 1.0,   // 중간 (기본)
  high: 1.5,     // 높음
  very_high: 2.0 // 매우 높음
};
```

### 뷰별 기본 가중치

| 기준 | 💼 워크 뷰 | 🏠 라이프 뷰 | 🌐 통합 뷰 |
|------|-----------|-------------|------------|
| ⏰ 마감 임박 | very_high | medium | high |
| ⭐ 중요 표시 | high | very_high | high |
| 👤 누군가 기다림 | very_high | low | high |
| ⏱️ 소요시간 | medium | off | low |
| 🔄 반복 미룸 | medium | high | medium |
| 📅 오늘 예정 | high | high | high |

---

## 🧮 최종 점수 계산

```javascript
function calculatePriorityScore(task, userWeights, preferences) {
  const scores = {
    deadline: deadlineScore(task) * WEIGHT_LEVELS[userWeights.deadline],
    starred: starredScore(task) * WEIGHT_LEVELS[userWeights.starred],
    waiting: waitingScore(task) * WEIGHT_LEVELS[userWeights.waiting],
    duration: durationScore(task, preferences.duration) * WEIGHT_LEVELS[userWeights.duration],
    deferred: deferredScore(task) * WEIGHT_LEVELS[userWeights.deferred],
    scheduled: scheduledTodayScore(task) * WEIGHT_LEVELS[userWeights.scheduled]
  };
  
  return {
    total: Object.values(scores).reduce((sum, s) => sum + s, 0),
    breakdown: scores  // 디버깅/투명성용
  };
}
```

### Top 3 추출

```javascript
function getTop3Tasks(tasks, userWeights, preferences, viewMode) {
  // 1. 뷰 모드에 따라 필터링
  let filtered = tasks;
  if (viewMode === 'work') {
    filtered = tasks.filter(t => t.category === 'work');
  } else if (viewMode === 'life') {
    filtered = tasks.filter(t => t.category === 'life');
  }
  
  // 2. 점수 계산
  const scored = filtered.map(task => ({
    ...task,
    priority: calculatePriorityScore(task, userWeights, preferences)
  }));
  
  // 3. 정렬 후 상위 3개
  return scored
    .sort((a, b) => b.priority.total - a.priority.total)
    .slice(0, 3);
}
```

---

## 🚨 특수 케이스

### 마감 지난 태스크

```javascript
function applyUrgencyOverride(scoredTasks) {
  return scoredTasks.map(task => {
    if (task.deadline && task.deadline < Date.now()) {
      // 마감 지난 것은 무조건 최상위
      return { 
        ...task, 
        priority: { 
          total: 9999, 
          isOverdue: true 
        }
      };
    }
    return task;
  });
}
```

### 에너지 기반 조정

```javascript
function adjustForEnergy(tasks, currentEnergy, dnaInsights) {
  const currentHour = new Date().getHours();
  
  return tasks.map(task => {
    let multiplier = 1;
    
    // 에너지 낮을 때: 작은 태스크 부스트
    if (currentEnergy === 'low' && task.estimatedMinutes <= 15) {
      multiplier = 1.3;
    }
    
    // 피크 시간대: 딥워크 태스크 부스트
    if (dnaInsights.peakHours?.includes(currentHour)) {
      if (task.type === 'deep_work' || task.estimatedMinutes >= 60) {
        multiplier = 1.2;
      }
    }
    
    return {
      ...task,
      priority: {
        ...task.priority,
        total: task.priority.total * multiplier,
        energyAdjusted: multiplier !== 1
      }
    };
  });
}
```

---

## 📱 UI 표시

### Top 3 카드

```
🎯 오늘의 Top 3

┌─────────────────────────────────┐
│ 1. 📋 주간보고서 제출            │
│    ⏰ D-day 🔴  👤 팀장 대기중    │
│    예상 30분                     │
│    [시작하기]                    │
├─────────────────────────────────┤
│ 2. 💼 클라이언트 미팅 준비        │
│    ⏰ 3시간 후  👤 외부           │
│    예상 1시간                    │
│    [시작하기]                    │
├─────────────────────────────────┤
│ 3. ⭐ 엄마 생일 선물 주문         │
│    ⭐ 중요  🔄 2번 미룸           │
│    예상 15분                     │
│    [시작하기]                    │
└─────────────────────────────────┘
```

### 점수 투명성 (선택적)

"왜 이게 1순위지?" 궁금할 때 탭하면:

```
📊 우선순위 상세

주간보고서 제출: 총 325점

├─ ⏰ 마감 임박: 100 × 2.0 = 200
├─ 👤 기다림:    75 × 1.0 = 75
├─ 📅 오늘 예정:  50 × 1.0 = 50
├─ ⭐ 중요 표시:   0 × 1.0 = 0
├─ 🔄 반복 미룸:   0 × 0.5 = 0
└─ ⏱️ 소요시간:   0 × 0   = 0
```

---

## 💬 알프레도 코멘트 연동

```javascript
function generateTop3Comment(top3, context) {
  const { tone, energy } = context;
  
  // 첫 번째가 마감 지난 것
  if (top3[0].priority.isOverdue) {
    return pickByTone(tone, {
      friend: "마감 지난 게 있어요. 괜찮아요, 지금이라도 해봐요.",
      butler: "마감 지난 게 있네요. 먼저 처리해볼까요?",
      coach: "마감 지났어요! 지금 바로 시작해요!"
    });
  }
  
  // 외부 대기가 많음
  const waitingCount = top3.filter(t => t.waitingFor).length;
  if (waitingCount >= 2) {
    return pickByTone(tone, {
      friend: "기다리는 사람들이 있네요. 하나씩 해결해봐요.",
      butler: "응답 대기 중인 게 많아요. 우선 처리 추천해요.",
      coach: "기다리는 사람들 있어요! 빠르게 쳐내요!"
    });
  }
  
  // 에너지 낮은데 큰 태스크가 1순위
  if (energy === 'low' && top3[0].estimatedMinutes >= 60) {
    return pickByTone(tone, {
      friend: "지금 좀 힘들 수 있어요. 2번이나 3번 먼저 해도 괜찮아요.",
      butler: "에너지 낮아 보여요. 작은 것부터 시작해볼까요?",
      coach: "컨디션 보고 순서 조정해도 돼요!"
    });
  }
  
  return null;
}
```

---

## 🎯 구현 우선순위

1. **Phase 1**: 기본 점수 계산 (마감, 중요, 오늘예정)
2. **Phase 2**: 가중치 시스템
3. **Phase 3**: 뷰별 가중치 프리셋
4. **Phase 4**: 에너지 기반 조정
5. **Phase 5**: 점수 투명성 UI
