# 🐧 Life Butler (AI Alfredo)

> ADHD 사용자를 위한 AI 기반 종합 생산성 앱

[![Deploy with Vercel](https://vercel.com/button)](https://ai-alfredo.vercel.app)

**🔗 Live Demo:** [https://ai-alfredo.vercel.app](https://ai-alfredo.vercel.app)

---

## ✨ 소개

Life Butler는 ADHD 사용자의 일상을 돕는 AI 버틀러 **알프레도(보라색 펭귄)**가 함께하는 생산성 앱입니다.

**핵심 철학:** "오늘 하루 나답게 살았다" 느낌을 주는 것

### 왜 Life Butler인가?

- 🧠 **ADHD 친화적 디자인** - 인지 부하 최소화, 명확한 정보 계층
- 🐧 **알프레도의 정서적 지지** - 실패해도 괜찮다는 따뜻한 메시지
- 🎮 **게이미피케이션** - XP, 레벨, 배지로 동기부여
- 📊 **통합 관리** - 업무, 일상, 건강, 관계를 한 곳에서

---

## 🚀 주요 기능

### 🏠 홈 대시보드
- 알프레도 브리핑 (시간대별 맞춤 인사)
- 오늘 컨디션 체크 (기분 & 에너지)
- 지금 집중할 것 + Top 3 할일
- 통합 타임라인

### 🎮 게이미피케이션
- **10단계 레벨 시스템** (🐣새싹 → 🦸울트라 버틀러)
- **XP 보상** - 할일 완료, 집중 세션, 스트릭
- **30개 배지** - 4단계 희귀도
- **데일리/주간 퀘스트**

### 🐧 알프레도 UX
- **3가지 모드** - 🔥Focus, 💙Care, 🚀Challenge
- **스마트 알림** - 9종 상황별 알림
- **퀵 액션** - 시간대별 추천 액션
- **실패 케어** - 힘들 때 따뜻한 응원

### 📊 분석 & 인사이트
- 주간 막대 차트 & 월간 히트맵
- 습관 트래커 (10개 템플릿)
- AI 인사이트 & 주간 리포트
- 데이터 백업/복원

---

## 🛠 기술 스택

| 구분 | 기술 |
|-----|------|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deploy | Vercel |
| Storage | localStorage |

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── home/          # 홈페이지
│   ├── work/          # 업무 관리
│   ├── life/          # 라이프 관리
│   ├── calendar/      # 캘린더
│   ├── chat/          # 알프레도 채팅
│   ├── more/          # 더보기
│   ├── common/        # 공통 컴포넌트
│   ├── gamification/  # 게이미피케이션
│   ├── alfredo/       # 알프레도 UX
│   └── analytics/     # 분석
└── App.jsx
```

---

## 🏃‍♂️ 로컬 실행

```bash
# 클론
git clone https://github.com/chloe-sy-park/ai-alfredo.git
cd ai-alfredo

# 설치
npm install

# 실행
npm run dev
```

http://localhost:5173 에서 확인

---

## 🎨 디자인 시스템

- **Primary Color:** #A996FF (라벤더 퍼플)
- **Design Philosophy:** Apple-inspired, Quiet Luxury
- **Font:** System default (SF Pro, Pretendard)

---

## 📝 주요 컴포넌트

### 게이미피케이션 (gamification/)
```javascript
// LevelSystem.jsx
export { LEVELS, useGamification, LevelXpBar }

// QuestSystem.jsx  
export { DailyQuestList, useQuests }

// BadgeSystem.jsx
export { BadgeCollection, useBadges }
```

### 알프레도 UX (alfredo/)
```javascript
// AlfredoBriefing.jsx - 시간대별 브리핑
// QuickActions.jsx - 스마트 퀵 액션
// SmartNotifications.jsx - 알림 시스템
// AlfredoPersonality.jsx - 3가지 모드
```

### 분석 (analytics/)
```javascript
// StatsDashboard.jsx - 통계 + 게임센터 통합
// HabitTracker.jsx - 습관 추적
// DataManagement.jsx - 백업/복원
```

---

## 🗄 데이터 저장

localStorage 키 목록:

| 키 | 용도 |
|---|-----|
| `lifebutler_gamification` | 레벨, XP, 스트릭 |
| `lifebutler_quests` | 퀘스트 진행 |
| `lifebutler_badges` | 획득 배지 |
| `lifebutler_habits` | 습관 데이터 |
| `lifebutler_tasks` | 할일 목록 |

---

## 🤝 기여

이슈와 PR을 환영합니다!

---

## 📄 라이선스

MIT License

---

Made with 💜 by Life Butler Team
