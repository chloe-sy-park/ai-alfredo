# 🐧 알프레도 (Alfredo) 기술 문서

> ADHD 친화적 AI 라이프 버틀러

---

## 🚀 현재 상태

| 항목 | 상태 |
|------|------|
| **로드맵** | W1-W4 100% 완료 ✅ |
| **프로덕션** | https://ai-alfredo.vercel.app |
| **최종 업데이트** | 2025-01-12 |

### 최근 완료

- ✅ AlfredoBriefingV2 개선 (빈 상태, 말투, 케어)
- ✅ 모바일 최적화 (Safe Area, 터치 타겟)
- ✅ Apple 2025 디자인 시스템
- ✅ 클라우드 연동 (Google Calendar, Gmail, Claude AI)

---

## 📖 문서 목록

### 기획 & 설계

| 문서 | 설명 |
|------|------|
| [01-decisions.md](./01-decisions.md) | 모순 해결, 6단계 온보딩, 4축 배양, 3단계 프라이버시 |
| [02-prompt-design.md](./02-prompt-design.md) | AI 페르소나, 컨텍스트 주입, 상황별 톤 오버라이드 |
| [03-tone-system.md](./03-tone-system.md) | 5축 톤 커스터마이징, 프리셋, 메시지 예시 |
| [04-briefing-algorithm.md](./04-briefing-algorithm.md) | 아침/저녁/리얼타임 브리핑 생성 로직 |
| [05-priority-algorithm.md](./05-priority-logic.md) | 태스크 우선순위 계산, 뷰별 가중치 |

### 아키텍처

| 문서 | 설명 |
|------|------|
| [06-database-schema.md](./06-database-schema.md) | Supabase 스키마, 16 ENUM, 18 테이블, RLS |
| [07-notification-system.md](./07-notification-system.md) | 푸시 알림, 플로팅 넛지, 스마트 타이밍 |
| [08-api-architecture.md](./08-api-architecture.md) | Vercel Edge Functions, API 엔드포인트 |
| [09-google-integration.md](./09-google-integration.md) | Google Calendar/Gmail 연동 |
| [10-client-architecture.md](./10-client-architecture.md) | React, Zustand, IndexedDB, PWA |

### 고급 기능

| 문서 | 설명 |
|------|------|
| [13-user-journey-map.md](./13-user-journey-map.md) | 사용자 여정 맵 |
| [14-information-architecture.md](./14-information-architecture.md) | IA 설계 |
| [15-proactive-conversation-system.md](./15-proactive-conversation-system.md) | 선제적 대화 시스템 |
| [16-prompt-engineering.md](./16-prompt-engineering.md) | Claude 프롬프트 엔지니어링 |
| [17-api-specification.md](./17-api-specification.md) | API 명세 (15개 그룹) |

### 로드맵 & 진행

| 문서 | 설명 |
|------|------|
| [11-implementation-roadmap.md](./11-implementation-roadmap.md) | 4주 개발 계획 |
| [18-progress-log.md](./18-progress-log.md) | **개발 진행 로그** ⭐ |

---

## 🎯 핵심 철학

### "오늘 나답게 살았다" vs 태스크 완료

알프레도는 단순한 할 일 관리 앱이 아닙니다. 사용자가 "오늘 나답게 살았다"고 느끼는 것이 목표입니다.

### DNA 확장 철학

> "작은 DNA 하나로 화성연쇄살인범을 잡았듯, 캘린더 하나로 사용자의 모든 것을 추론한다"

최소한의 데이터로 최대한의 인사이트를 끌어내는 것이 핵심입니다.

### 물어보지 않는 개인화

- 행동 데이터로 학습 (TikTok, Spotify 방식)
- Permission Priming (Motion, Reclaim 방식)
- 가치 먼저, 요청은 나중에

---

## 🐧 알프레도 페르소나

### 기본 설정

- **캐릭터**: 보라색 펭귄
- **역할**: 배트맨의 알프레드 같은 버틀러
- **말투**: 존댓말 기본, 자연스러운 한국어
- **특징**: 선제적이고 세심하며 인내심 있음

### 톤 커스터마이징

5축 시스템으로 사용자별 맞춤:

| 축 | 설명 |
|----|------|
| 따뜻함 | 차분함 ↔ 따뜻함 |
| 선제성 | 요청시만 ↔ 먼저 말 걸기 |
| 직설성 | 돌려 말하기 ↔ 직설적 |
| 유머 | 진지함 ↔ 장난스러움 |
| 압박 | 여유로움 ↔ 엄격함 |

---

## 🏗️ 기술 스택

### 프론트엔드
- React 18 + Vite
- Tailwind CSS
- Zustand
- Framer Motion
- Lucide Icons
- Dexie.js (IndexedDB)

### 백엔드
- Vercel Edge Functions
- Supabase (PostgreSQL + Auth)
- Upstash Redis

### 외부 API
- Anthropic Claude API
- Google Calendar API
- Google Gmail API
- Web Push (VAPID)

---

## 📁 코드베이스 구조

```
src/
├── components/
│   ├── home/        # 43개 (브리핑, 타임라인 등)
│   ├── work/        # 업무 관련
│   ├── calendar/    # 캘린더 관련
│   ├── chat/        # 채팅 관련
│   └── common/      # 공통
├── stores/          # Zustand 스토어
├── data/            # 목 데이터
└── App.jsx          # 메인 앱

docs/                # 기술 문서 (17개+)
supabase/
├── migrations/      # SQL 마이그레이션
└── functions/       # Edge Functions (8개)
```

---

## 🚀 빠른 시작

### 개발 환경 세팅

```bash
# 클론
git clone https://github.com/chloe-sy-park/ai-alfredo.git
cd ai-alfredo

# 의존성 설치
npm install

# 개발 서버
npm run dev
```

### 환경 변수

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_VAPID_PUBLIC_KEY=xxx
VITE_API_URL=https://ai-alfredo.vercel.app
```

---

## 📞 연락처

- **노션**: https://www.notion.so/2c8b1c6d40e2819ab8aec73e6e4830d1
- **GitHub**: https://github.com/chloe-sy-park/ai-alfredo

---

*이 문서는 알프레도 개발을 위한 기술 레퍼런스입니다.*
