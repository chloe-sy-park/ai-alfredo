# 🐧 알프레도 (Alfredo)

ADHD 친화적 AI 라이프 버틀러

> "오늘 진짜 나답게 살았다"라고 느끼는 삶을 위해

## ✨ 핵심 철학

- **DNA 확장**: 캐린더 하나로 모든 것을 추론 ("어떻게 알았어?" 경험)
- **물어보지 않는 개인화**: 행동 학습, 퍼미션 프라이밍
- **용서하는 UX**: 실패해도 괜찮아, 다시 시작하면 돼

## 🛠️ 기술 스택

### 프론트엔드
- React 18 + TypeScript
- Vite (PWA)
- Tailwind CSS
- Zustand (상태 관리)
- Dexie.js (IndexedDB)
- Framer Motion (애니메이션)

### 백엔드
- Vercel Edge Functions
- Supabase (PostgreSQL + Auth)
- Upstash Redis (레이트 리및)

### AI & 외부 연동
- Anthropic Claude API
- Google Calendar API
- Google Gmail API (optional)

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 필요한 값 입력
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `supabase/schema.sql` 실행
3. Google OAuth 설정 (Authentication > Providers > Google)

### 4. 개발 서버 실행

```bash
npm run dev
```

## 📂 프로젝트 구조

```
src/
├── components/     # 재사용 컴포넌트
│   ├── common/     # Button, Card, Input 등
│   ├── layout/     # AppShell, BottomNav, StatusBar
│   └── ...         # 기능별 컴포넌트
├── pages/          # 페이지 컴포넌트
├── stores/         # Zustand 스토어
├── lib/            # 유틸리티 (암호화, API, DB)
└── styles/         # 글로벌 스타일, 테마

docs/               # 설계 문서
supabase/           # DB 스키마
api/                # Vercel Edge Functions (TBD)
```

## 📚 문서

자세한 설계 문서는 [docs/](./docs/) 폴더를 참고하세요.

## 📅 개발 로드맵

- **Week 1**: 프로젝트 세팅, 인증, 태스크 CRUD
- **Week 2**: 캐린더 연동, 브리핑, 채팅
- **Week 3**: DNA 분석, 알림, 습관
- **Week 4**: 온보딩, PWA, 테스트, 배포

## 🤝 기여

이슈와 PR을 환영합니다!

## 📄 라이선스

MIT
