# Life Butler 리팩토링 가이드

## 📁 폴더 구조

```
src/
├── App.jsx                    # 메인 앱 (~500줄로 축소 목표)
├── constants/
│   ├── index.js              # 모든 상수 export
│   ├── colors.js             # 디자인 시스템 (COLORS, SPACING, etc.)
│   ├── timeConfig.js         # 시간 관리 설정
│   └── gamification.js       # 게임화 시스템 (BADGES, XP_REWARDS, etc.)
├── data/
│   └── mockData.js           # 모든 목 데이터
├── hooks/
│   ├── index.js              # 모든 훅 export
│   └── useTimeTracking.js    # 시간 트래킹 훅
├── components/
│   ├── common/
│   │   └── index.jsx         # Button, Card, Modal, Toast, Badge 등
│   └── alfredo/
│       └── index.jsx         # AlfredoStatusBar, TimeAlertToast 등
└── pages/                    # (추후 분리 예정)
    ├── HomePage.jsx
    ├── WorkPage.jsx
    ├── LifePage.jsx
    └── ...
```

## ✅ 완료된 파일

| 파일 | 내용 | 줄 수 |
|------|------|-------|
| constants/colors.js | 디자인 시스템 | ~100줄 |
| constants/timeConfig.js | 시간 설정 | ~20줄 |
| constants/gamification.js | 게임화 시스템 | ~80줄 |
| data/mockData.js | 목 데이터 | ~500줄 |
| hooks/useTimeTracking.js | 시간 트래킹 | ~230줄 |
| components/common/index.jsx | 공통 UI | ~320줄 |
| components/alfredo/index.jsx | 알프레도 컴포넌트 | ~360줄 |

**총 분리: ~1,610줄**

## 🔜 추후 분리 대상

### 높은 우선순위 (큰 컴포넌트들)
- `HomePage` (~800줄)
- `WorkPage` (~1,300줄)
- `LifePage` (~900줄)
- `AlfredoChat` (~600줄)
- `CalendarPage` (~750줄)

### 중간 우선순위 (모달들)
- `EventModal` (~300줄)
- `TaskModal` (~300줄)
- `QuickCaptureModal` (~220줄)
- `AddTaskModal` (~210줄)
- `ProjectModal` (~150줄)

### 낮은 우선순위 (작은 컴포넌트들)
- `FocusTimer` (~200줄)
- `Onboarding` (~330줄)
- 위젯들 (`Big3Widget`, `TimelineWidget` 등)

## 📝 사용법

### Import 예시
```javascript
// App.jsx
import React, { useState, useEffect } from 'react';

// Constants
import { COLORS, BUTTON_STYLES, getThemeStyles } from './constants';
import { TIME_CONFIG } from './constants/timeConfig';
import { LEVEL_CONFIG, XP_REWARDS, BADGES, initialGameState } from './constants/gamification';

// Data
import { mockAllTasks, mockEvents, mockInbox, mockWeather } from './data/mockData';

// Hooks
import { useTimeTracking } from './hooks';

// Components
import { Button, Card, Modal, Toast, AlfredoAvatar } from './components/common';
import { AlfredoStatusBar, TimeAlertToast, AlfredoFeedback } from './components/alfredo';

// Lucide icons
import { Home, Briefcase, Heart, Calendar, Settings } from 'lucide-react';
```

## 🚀 점진적 마이그레이션 방법

1. **현재 App.jsx를 백업**
2. **분리된 파일들을 프로젝트에 복사**
3. **App.jsx 상단에 import 문 추가**
4. **기존 코드에서 해당 부분 삭제**
5. **테스트**
6. **반복**

### 팁
- 한 번에 하나의 모듈만 분리
- 각 분리 후 반드시 테스트
- `console.log`로 import가 제대로 되는지 확인
- VS Code의 "Go to Definition" (F12) 활용

## ⚠️ 주의사항

1. **순환 의존성 주의**: 컴포넌트 간 import 방향 확인
2. **Named export 사용**: `export const` 형태로 통일
3. **Default export 자제**: 리팩토링 시 혼란 방지
4. **상대 경로 사용**: `../` 형태로 import

## 🔧 Vite 설정 (선택)

경로 alias 설정으로 import를 깔끔하게:

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@constants': '/src/constants',
      '@data': '/src/data',
    }
  }
}
```

사용:
```javascript
import { Button } from '@components/common';
import { useTimeTracking } from '@hooks';
```
