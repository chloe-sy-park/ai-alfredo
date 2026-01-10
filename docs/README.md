# 🐧 알프레도 (Alfredo) 기술 문서

> ADHD 친화적 AI 라이프 버틀러

---

## 📖 문서 목록

### 기획 & 설계

| 문서 | 설명 |
|------|------|
| [01-decisions.md](./01-decisions.md) | 모순 해결, 6단계 온보딩, 4축 배양, 3단계 프라이버시 |
| [02-prompt-design.md](./02-prompt-design.md) | AI 페르소나, 컨텍스트 주입, 상황별 톤 오버라이드 |
| [03-tone-system.md](./03-tone-system.md) | 5축 톤 커스터마이징, 프리셋, 메시지 예시 |
| [04-briefing-algorithm.md](./04-briefing-algorithm.md) | 아침/저녁/리얼타임 브리핑 생성 로직 |
| [05-priority-algorithm.md](./05-priority-algorithm.md) | 태스크 우선순위 계산, 뷰별 가중치 |

### 아키텍처

| 문서 | 설명 |
|------|------|
| [06-database-schema.md](./06-database-schema.md) | Supabase 스키마, 클라이언트 암호화 |
| [07-notification-system.md](./07-notification-system.md) | 푸시 알림, 플로팅 넓지, 스마트 타이밍 |
| [08-api-architecture.md](./08-api-architecture.md) | Vercel Edge Functions, API 엔드포인트 |
| [09-google-integration.md](./09-google-integration.md) | Google Calendar/Gmail 연동 |
| [10-client-architecture.md](./10-client-architecture.md) | React, Zustand, IndexedDB, PWA |

### 로드맵

| 문서 | 설명 |
|------|------|
| [11-implementation-roadmap.md](./11-implementation-roadmap.md) | 4주 개발 계획 |

---

## 🎯 핵심 철학

### "오늘 나답게 살았다" vs 태스크 완료

알프레도는 단순한 할 일 관리 앱이 아닙니다. 사용자가 "오늘 나답게 살았다"고 느끼는 것이 목표입니다.

### DNA 확장 철학

> "작은 DNA 하나로 화성연쇄살인범을 잡았듯, 캘린더 하나로 사용자의 모든 것을 추론한다"

최소한의 데이터로 최대한의 인사이트를 끄어내는 것이 핵심입니다.

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
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
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

## 📁 관련 리소스

### 벤치마킹
- [알프레도 벤치마킹 54개 서비스](../알프레도_AI_버틀러_벤치마킹_리스트__54개_영어권_B2C_서비스.md)
- [물어보지 않는 개인화 UX](..물어보지_않는_개인화_UX_벤치마킹.md)
- [Trust-Building Data Collection](../Trust-Building_Data_Collection__20-App_Benchmarking_Study.md)

### DNA 확장 엔진
- [DNA 확장 엔진 설계](../dna_expansion_engine_kr.md)

---

## 🚀 빠른 시작

### 개발 환경 세팅

```bash
# 클론
npx create-vite@latest alfredo --template react-ts
cd alfredo

# 의존성 설치
npm install zustand @supabase/supabase-js dexie framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa

# Tailwind 초기화
npx tailwindcss init -p
```

### 환경 변수

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_VAPID_PUBLIC_KEY=xxx
VITE_API_URL=https://alfredo.app
```

---

## 📞 연락처

Notion 페이지: `2c8b1c6d40e2819ab8aec73e6e4830d1`

---

*이 문서는 알프레도 개발을 위한 기술 레퍼런스입니다.*
