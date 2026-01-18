# 🎩 알프레도 새 컴포넌트 통합 가이드

## 📦 새로 추가된 컴포넌트

### 1. ADHD 특화 컴포넌트 (`src/components/adhd/`)

| 컴포넌트 | 설명 | 참고 서비스 |
|----------|------|------------|
| `MagicToDo` | 막연한 작업을 구체적 단계로 자동 분해 | Goblin Tools |
| `TimeEstimator` | 시간 맹점 지원, AI 예측 + 정확도 학습 | Sunsama, Trevor AI |
| `TwoTapMood` | 5초 내 기분/에너지 로깅 (2탭) | Daylio |
| `OverloadDetector` | 오늘 일정 과부하 감지 + 조정 제안 | Sunsama |

```jsx
import { MagicToDo, TimeEstimator, TwoTapMood, OverloadDetector } from './components/adhd';
```

---

### 2. 온보딩 (`src/components/onboarding/`)

| 컴포넌트 | 설명 | 참고 서비스 |
|----------|------|------------|
| `OnboardingV3` | Permission Priming + Value-First 7단계 | Noom, Pi, Motion |

```jsx
import { OnboardingV3 } from './components/onboarding';
```

---

### 3. 인사이트 (`src/components/insights/`)

| 컴포넌트 | 설명 | 참고 서비스 |
|----------|------|------------|
| `YearInPixels` | 365일 기분 시각화 그리드 | Daylio |
| `WeeklyReport` | 주간 패턴 분석 + 상관관계 | Exist, RescueTime |

```jsx
import { YearInPixels, WeeklyReport } from './components/insights';
```

---

### 4. Forgiving UX (`src/components/forgiving/`)

| 컴포넌트 | 설명 | 참고 서비스 |
|----------|------|------------|
| `StreakDisplay` | 스트릭 + 프리즈 시스템, 숨기기 가능 | Headspace, Duolingo |
| `RolloverBanner` | 어제 미완료 태스크 비처벌적 롤오버 | Sunsama |

```jsx
import { StreakDisplay, RolloverBanner } from './components/forgiving';
```

---

### 5. 캐릭터 (`src/components/character/`)

| 컴포넌트 | 설명 | 참고 서비스 |
|----------|------|------------|
| `AlfredoAvatar` | 감정 표현 + 애니메이션 아바타 | Focus Friend |
| `AlfredoPersonalitySelector` | 성격 모드 선택 (warm/direct/playful) | CARROT |
| `AlfredoMemoryDisplay` | 기억 확인/편집 인터페이스 | Nomi AI |

```jsx
import { AlfredoAvatar, AlfredoPersonalitySelector, AlfredoMemoryDisplay } from './components/character';
```

---

## 🗄️ Store

| Store | 설명 |
|-------|------|
| `useBehaviorStore` | 암묵적 학습 엔진 (DNA 확장) |
| `usePersonalityStore` | 알프레도 성격 + 감정 상태 |
| `useMemoryStore` | 계층화된 메모리 시스템 |
| `useForgivingStore` | 용서하는 UX (스트릭, 롤오버) |

```jsx
import { 
  useBehaviorStore, 
  usePersonalityStore, 
  useMemoryStore, 
  useForgivingStore 
} from './stores';
```

---

## 🚀 통합 방법

### 방법 1: AppEnhanced 사용 (권장)

```jsx
// App.jsx에서
import { useEnhancedRouter, EnhancedPageRenderer } from './AppEnhanced';

function App() {
  const { 
    enhancedView, 
    openEnhancedView, 
    closeEnhancedView,
    handleOnboardingComplete 
  } = useEnhancedRouter();
  
  // ... 기존 코드
  
  return (
    <div>
      {/* 기존 코드 */}
      
      {/* 확장 페이지 렌더러 */}
      {enhancedView && (
        <EnhancedPageRenderer
          view={enhancedView}
          darkMode={darkMode}
          onClose={closeEnhancedView}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
```

### 방법 2: 개별 컴포넌트 직접 사용

```jsx
// HomePage.jsx에서
import { HomeEnhancements } from './home/HomeIntegrated';
import { InsightsSection } from '../common/InsightsSection';

function HomePage({ darkMode, tasks, ... }) {
  return (
    <div>
      {/* 새 통합 섹션 */}
      <HomeEnhancements 
        darkMode={darkMode}
        tasks={tasks}
        onToggleTask={handleToggleTask}
      />
      
      {/* 인사이트 섹션 */}
      <InsightsSection
        darkMode={darkMode}
        onOpenYearInPixels={() => setView('YEAR_IN_PIXELS')}
        onOpenWeeklyReport={() => setView('WEEKLY_REPORT_V2')}
      />
    </div>
  );
}
```

---

## 🎨 애니메이션 클래스

`src/styles/animations.css`에 정의된 클래스:

| 클래스 | 효과 |
|--------|------|
| `animate-shake` | 겁정/불안 |
| `animate-droop` | 슬픔 |
| `animate-tremble` | 긴장 |
| `animate-sway` | 졸림 |
| `animate-bounce-slow` | 환영/기쁨 |
| `animate-float` | 평화 |
| `animate-wiggle` | 신남 |
| `animate-pop` | 완료 축하 |
| `animate-fade-in` | 페이드 인 |
| `animate-slide-up` | 슬라이드 업 |
| `animate-glow` | 성취 발광 |
| `animate-confetti` | 축하 폭죽 |

---

## ✅ 체크리스트

- [x] animations.css import (main.jsx)
- [x] Store exports (src/stores/index.js)
- [x] Component exports (adhd, onboarding, insights, forgiving, character)
- [x] AppEnhanced router
- [x] HomeIntegrated wrapper
- [x] MorePageEnhanced
- [ ] App.jsx에 실제 통합 (선택적)

---

## 📝 다음 단계

1. **App.jsx 통합**: `useEnhancedRouter` 훅 추가
2. **테스트**: 각 컴포넌트 동작 확인
3. **데이터 연결**: Store와 실제 데이터 연동
4. **Claude API 연동**: MagicToDo 실제 AI 분해
