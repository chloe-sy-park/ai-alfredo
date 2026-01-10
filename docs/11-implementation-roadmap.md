# 11. 구현 로드맵

> 4주 개발 계획

---

## 🎯 로드맵 개요

```
Week 1: 핸들링 기반 + 알프레도 코어
Week 2: 미맇미맇 가치 전달
Week 3: DNA 확장 + 딥 개인화
Week 4: 폴리싱 + 런칭
```

---

## 📅 Week 1: 핸들링 기반 + 알프레도 코어

### Day 1-2: 프로젝트 세팅

**백엔드**
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 적용 (06-database-schema.md)
- [ ] Google Cloud Console 설정
- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정

**프론트엔드**
- [ ] Vite + React 프로젝트 초기화
- [ ] Tailwind CSS 설정
- [ ] 디자인 토큰 적용 (10-client-architecture.md)
- [ ] Zustand 스토어 기본 구조

### Day 3-4: 인증 플로우

**백엔드**
- [ ] `/api/auth/google` - OAuth 시작
- [ ] `/api/auth/google/callback` - 콜백 처리
- [ ] `/api/auth/refresh` - 토큰 갱신
- [ ] Google 토큰 저장/관리

**프론트엔드**
- [ ] 로그인 페이지
- [ ] Auth Store
- [ ] Protected Route
- [ ] 토큰 자동 갱신

### Day 5-7: 태스크 CRUD + UI

**백엔드**
- [ ] `/api/tasks` - 목록/생성
- [ ] `/api/tasks/:id` - 조회/수정/삭제
- [ ] 우선순위 계산 로직 (05-priority-algorithm.md)

**프론트엔드**
- [ ] Task Store
- [ ] 태스크 리스트 컴포넌트
- [ ] 태스크 카드
- [ ] 태스크 에디터
- [ ] 완료/연기 액션

### Week 1 마일스톤

```
✅ Google 로그인 동작
✅ 태스크 CRUD 동작
✅ 기본 UI 프레임워크
```

---

## 📅 Week 2: 미맇미맇 가치 전달

### Day 1-2: 캘린더 연동

**백엔드**
- [ ] `/api/calendar/sync` - 캘린더 동기화
- [ ] `/api/calendar/events` - 이벤트 조회
- [ ] 이벤트 타입 분류 (09-google-integration.md)
- [ ] 캐시 업데이트 로직

**프론트엔드**
- [ ] Calendar Store
- [ ] Permission Priming UI
- [ ] 타임라인 컴포넌트
- [ ] 미팅 카드

### Day 3-4: 알프레도 브리핑

**백엔드**
- [ ] `/api/briefing/morning` - 아침 브리핑 생성
- [ ] 강도 평가 로직 (04-briefing-algorithm.md)
- [ ] 코멘트 생성 로직

**프론트엔드**
- [ ] 브리핑 컴포넌트
- [ ] Top3 태스크
- [ ] 오늘의 타임라인
- [ ] 알프레도 메시지 스타일링

### Day 5-6: 채팅 기능

**백엔드**
- [ ] `/api/chat` - Claude 스트리밍
- [ ] 컨텍스트 주입 로직 (02-prompt-design.md)
- [ ] 톤 적용 (03-tone-system.md)

**프론트엔드**
- [ ] Chat Store
- [ ] 채팅 컴포넌트
- [ ] 스트리밍 메시지
- [ ] 채팅 입력

### Day 7: 홈 페이지 통합

**프론트엔드**
- [ ] 홈 페이지 레이아웃
- [ ] 알프레도 상태 바
- [ ] 날씨 위젯
- [ ] 컨디션 퀀 변경
- [ ] 지금 집중할 것

### Week 2 마일스톤

```
✅ 캘린더 연동 동작
✅ 아침 브리핑 생성
✅ 알프레도와 대화 가능
✅ 홈 페이지 완성
```

---

## 📅 Week 3: DNA 확장 + 딥 개인화

### Day 1-2: DNA 분석

**백엔드**
- [ ] `/api/dna/analyze` - DNA 분석
- [ ] 캘린더 신호 추출 (dna_expansion_engine_kr.md)
- [ ] 크로노타입 추론
- [ ] 에너지 패턴 분석

**프론트엔드**
- [ ] DNA 인사이트 표시
- [ ] "제가 배운 것들" 화면
- [ ] 교정 기능

### Day 3-4: 알림 시스템

**백엔드**
- [ ] `/api/notifications/subscribe` - 푸시 구독
- [ ] `/api/notifications/send` - 푸시 발송
- [ ] Cron Jobs 설정 (07-notification-system.md)
- [ ] 스마트 타이밍 로직

**프론트엔드**
- [ ] Service Worker
- [ ] 푸시 알림 구독
- [ ] 플로팅 넓지
- [ ] 알림 설정 UI

### Day 5-6: 습관 트래커

**백엔드**
- [ ] `/api/habits` - 습관 CRUD
- [ ] `/api/habits/logs` - 습관 로그
- [ ] 스트릭 계산

**프론트엔드**
- [ ] Habit Store
- [ ] 습관 카드
- [ ] 체크인 UI
- [ ] 스트릭 표시

### Day 7: Life 페이지

**프론트엔드**
- [ ] Life 페이지 레이아웃
- [ ] 습관 트래커
- [ ] 웰니스 체크
- [ ] 에너지 리듬

### Week 3 마일스톤

```
✅ DNA 분석 동작
✅ 푸시 알림 동작
✅ 습관 트래킹 동작
✅ Life 페이지 완성
```

---

## 📅 Week 4: 폴리싱 + 런칭

### Day 1-2: 온보딩

**프론트엔드**
- [ ] 6단계 온보딩 플로우 (01-decisions.md)
- [ ] 환영 화면
- [ ] 목표 선택
- [ ] 캘린더 연결
- [ ] 톤 설정
- [ ] 완료 화면

### Day 3-4: 설정 + Work 페이지

**프론트엔드**
- [ ] 설정 페이지
- [ ] 톤 커스터마이저
- [ ] 알림 설정
- [ ] 프라이버시 설정
- [ ] Work 페이지

### Day 5: 오프라인 지원

**프론트엔드**
- [ ] IndexedDB 캐싱
- [ ] 오프라인 큐
- [ ] 재연결 시 동기화
- [ ] 오프라인 상태 표시

### Day 6: PWA + 성능

**프론트엔드**
- [ ] PWA manifest
- [ ] Service Worker 최적화
- [ ] 코드 스플리팅
- [ ] 레이지 로딩
- [ ] 이미지 최적화

### Day 7: 테스트 + 배포

- [ ] E2E 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 테스트
- [ ] Vercel 프로덕션 배포
- [ ] 모니터링 설정

### Week 4 마일스톤

```
✅ 온보딩 완성
✅ 모든 페이지 완성
✅ 오프라인 지원
✅ PWA 설치 가능
✅ 프로덕션 배포
```

---

## 🏃 데일리 체크포인트

### 매일 아침
- [ ] 어제 작업 리뷰
- [ ] 오늘 목표 설정
- [ ] 블로커 확인

### 매일 저녁
- [ ] 코드 커밋
- [ ] 프로그레스 노션 업데이트
- [ ] 내일 계획

---

## 🛠️ 기술 스택

### 프론트엔드
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Lucide Icons
- Dexie.js (IndexedDB)

### 백엔드
- Vercel Edge Functions
- Supabase (PostgreSQL + Auth)
- Upstash Redis (Rate Limiting)

### 외부 API
- Anthropic Claude API
- Google Calendar API
- Google Gmail API
- Web Push (VAPID)

---

## 📊 성공 지표

### Week 1 성공 지표
- [ ] 로그인 후 태스크 생성/조회 가능
- [ ] 태스크 완료/연기 동작

### Week 2 성공 지표
- [ ] "어떻게 알았어?" 반응 1회 이상
- [ ] 아침 브리핑이 상황에 맞는 메시지 생성
- [ ] 알프레도와 자연스러운 대화 가능

### Week 3 성공 지표
- [ ] DNA 인사이트 정확도 70% 이상
- [ ] 푸시 알림 정상 수신
- [ ] 습관 스트릭 7일 유지 가능

### Week 4 성공 지표
- [ ] Lighthouse PWA 점수 90+
- [ ] 오프라인에서 기본 기능 동작
- [ ] 암호화된 데이터 저장 확인

---

## ⚠️ 리스크 관리

### 기술적 리스크

| 리스크 | 영향 | 대응 |
|------|------|------|
| Claude API 지연 | 중 | 타임아웃 설정, 캐싱 |
| Google OAuth 거부 | 중 | 수동 입력 대안 |
| 푸시 알림 차단 | 낮음 | 인앱 알림 대안 |
| IndexedDB 용량 | 낮음 | 정기 정리 로직 |

### 일정 리스크

| 리스크 | 영향 | 대응 |
|------|------|------|
| API 개발 지연 | 높음 | MVP 스코프 축소 |
| UI 복잡도 | 중 | 컴포넌트 라이브러리 활용 |
| 테스트 부족 | 중 | 핵심 플로우만 테스트 |

---

## 📁 문서 참조

| 문서 | 설명 |
|------|------|
| 01-decisions.md | 모순 해결, 6단계 온보딩 |
| 02-prompt-design.md | AI 페르소나, 컨텍스트 주입 |
| 03-tone-system.md | 5축 톤 커스터마이징 |
| 04-briefing-algorithm.md | 브리핑 생성 로직 |
| 05-priority-algorithm.md | 우선순위 계산 공식 |
| 06-database-schema.md | Supabase 스키마 |
| 07-notification-system.md | 알림 시스템 |
| 08-api-architecture.md | API 설계 |
| 09-google-integration.md | Google 연동 |
| 10-client-architecture.md | 클라이언트 설계 |
| dna_expansion_engine_kr.md | DNA 확장 엔진 |

---

## 🚀 런칭 후 로드맵

### Phase 2: 개선 (Week 5-6)
- [ ] 사용자 피드백 반영
- [ ] 바디 더블링 모드
- [ ] 집중 타이머
- [ ] 저녁 랩업
- [ ] 코멘트 50개 확장

### Phase 3: 확장 (Week 7-8)
- [ ] Gmail 연동
- [ ] 주간 리뷰
- [ ] 연간 회고
- [ ] 소셜 기능
- [ ] Apple Watch 연동

---

*이 로드맵은 4주 기준이며, 실제 진행 상황에 따라 조정될 수 있습니다.*
