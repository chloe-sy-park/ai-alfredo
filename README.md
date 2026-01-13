# 🐧 알프레도 (AI Alfredo)

ADHD 친화적 AI 라이프 버틀러 PWA

> "오늘 진짜 나답게 살았다"라고 느끼는 삶을 위해

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black)](https://ai-alfredo.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://typescriptlang.org)

## 🌐 라이브 데모

**[ai-alfredo.vercel.app](https://ai-alfredo.vercel.app)**

## ✨ 핵심 철학

- **DNA 확장**: 캘린더 하나로 모든 것을 추론 ("어떻게 알았어?" 경험)
- **물어보지 않는 개인화**: 행동 학습, 퍼미션 프라이밍, 암묵적 학습
- **용서하는 UX**: 실패해도 괜찮아, 다시 시작하면 돼
- **ADHD 네이티브**: 넉넉한 여백, 낮은 정보 밀도, 시각적 시간 인지

## 🎯 주요 기능

### 알프레도 브리핑
- 시간대/컨디션/날씨 기반 맞춤 인사
- DNA 엔진 기반 인사이트 카드
- 번아웃 경고, 특별 이벤트 알림

### 스마트 태스크 관리
- 업무/일상 도메인 분리
- 우선순위 기반 정렬
- 마감일 기반 캘린더 연동

### 바디더블링 모드
- 실시간 포커스 세션
- 알프레도와 함께하는 집중 작업
- 휴식 알림 및 진행률 표시

### DNA 분석 엔진
- 캘린더 패턴 분석
- 크로노타입 감지
- 피크 시간대 추천
- 스트레스 레벨 모니터링

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** + Vite (PWA)
- **TypeScript** 5.0
- **Tailwind CSS** 3.4
- **Lucide React** (아이콘)

### 백엔드 & 데이터
- **Supabase** (PostgreSQL + Auth + RLS)
- **Vercel** (Edge Functions + 배포)

### AI & 외부 연동
- **Anthropic Claude API** (채팅)
- **Google Calendar API** (일정 동기화)
- **Google Gmail API** (선택)

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/chloe-sy-park/ai-alfredo.git
cd ai-alfredo
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLAUDE_API_KEY=your_claude_api_key
```

### 4. 개발 서버 실행

```bash
npm run dev
# http://localhost:5173 에서 확인
```

### 5. 빌드

```bash
npm run build
npm run preview  # 빌드 결과 미리보기
```

## 📂 프로젝트 구조

```
src/
├── components/
│   ├── common/         # EmptyState, DomainBadge, StatusBar
│   ├── home/           # HomePage, FocusNowCard, TodayTimeline
│   ├── work/           # WorkPage, TaskCard
│   ├── life/           # LifePage, RoutineCard
│   ├── calendar/       # CalendarPage, AgendaView
│   ├── chat/           # ChatPage, ChatBubble
│   └── modals/         # EventModal, TaskModal
├── hooks/
│   ├── useDNAEngine.ts     # DNA 분석 훅
│   ├── useGoogleCalendar.ts
│   └── useSmartNotifications.ts
├── services/
│   ├── dna/            # DNA 엔진 코어
│   │   ├── dnaEngine.ts
│   │   ├── dnaMessages.ts
│   │   └── types.ts
│   └── supabase/       # Supabase 클라이언트
├── stores/             # Zustand 스토어
├── constants/          # 공통 상수
├── data/               # Mock 데이터
└── App.jsx             # 메인 앱 컴포넌트

docs/                   # 개발 문서 & 진행 로그
supabase/               # DB 스키마 (18개 테이블)
```

## 📚 문서

자세한 설계 문서는 [docs/](./docs/) 폴더를 참고하세요.

- `01-alfredo-implementation.md` - 구현 설계서
- `02-onboarding-flow.md` - 온보딩 플로우
- `03-nurturing-system.md` - 육성 시스템
- `18-progress-log.md` - 개발 진행 로그

## 📅 개발 현황

### ✅ 완료 (W1-W3)

- 프로젝트 세팅, Vercel 배포
- Supabase 18개 테이블 설계
- DNA 엔진 구현 (크로노타입, 스트레스 분석)
- 알프레도 메시지 시스템 (100개+)
- 바디더블링 모드
- 모바일 최적화 (Safe Area, 터치 타겟)
- 컴포넌트 모듈화 (39개 분리)

### 🔄 진행 중 (W4)

- 코드 품질 개선 (미사용 import 정리)
- TypeScript 타입 강화
- Empty State 처리

### 📋 예정

- Google Calendar 양방향 동기화
- 실패 케어 시스템
- 게이미피케이션 (퀘스트 시스템)
- PWA 오프라인 지원

## 🐧 알프레도 캐릭터

알프레도는 펭귄 집사 AI로, 사용자의 일상과 업무를 돕습니다.

- **역할**: 버틀러, 코치, 감독, 페이스메이커, 비서
- **성격**: 따뜻하고 위트있는, 비판 없는 동반자
- **철학**: 진짜 원하는 삶을 살 수 있도록 돕기

## 🤝 기여

이슈와 PR을 환영합니다!

## 📄 라이선스

MIT
