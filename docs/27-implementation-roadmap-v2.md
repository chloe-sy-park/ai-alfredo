# AI 알프레도 - 우선순위별 구현 계획 (v2)

> 작성일: 2025-01-17
> 목표: 문서 대비 미구현 기능 완성 (현재 70-75% → 95%+)

## 개요

| 항목 | 내용 |
|------|------|
| **범위** | Phase 1-3 전체 + E2E 테스트 |
| **예상 기간** | 17-24일 |
| **우선순위** | Claude API → 브리핑 → 우선순위 → 넛지 → 푸시 → 학습UI → 펭귄 → 오프라인 → Gmail → 암호화 |

---

## Phase 1: 긴급 (MVP 완성) - 5-7일

### 1.1 Claude API 연동 (2-3일)

**현재 상태**
- Edge Function (`supabase/functions/conversations/index.ts`): Claude API + SSE 스트리밍 ✅ 완성
- API 클라이언트 (`src/lib/api.ts`): `conversationsApi.sendMessage()` ✅ 존재
- Chat Store (`src/stores/chatStore.ts`): ⚠️ 패턴 기반 임시 응답 사용 중

**수정 대상**
```
src/stores/chatStore.ts
├── generateAlfredoResponse() 함수 (384-495줄)
│   └── conversationsApi.sendMessage() SSE 호출로 교체
└── 톤 시스템 컨텍스트 주입
```

**작업 항목**
- [ ] `generateAlfredoResponse()` 함수를 실제 API 호출로 교체
- [ ] SSE 스트리밍 응답을 실시간 UI 반영
- [ ] 알프레도 학습 컨텍스트 구성 (DNA + 톤 + 학습)
- [ ] 에러 핸들링 및 fallback 로직

---

### 1.2 브리핑 AI 생성 (1-2일)

**현재 상태**
- 브리핑 서비스 (`src/services/briefing.ts`): 로컬 규칙 기반
- Cron Function (`supabase/functions/cron-morning-briefing/`): 템플릿 기반
- DNA 엔진 (`src/services/dna/`): ✅ 완성 (2,617줄)

**수정 대상**
```
supabase/functions/cron-morning-briefing/index.ts
├── Claude API 호출 추가
└── DNA + 일정 + 톤 프롬프트 구성

src/services/briefing.ts
└── Claude API 옵션 추가 (fallback: 기존 로직)
```

**작업 항목**
- [ ] 브리핑 프롬프트 설계 (DNA 프로필 + 오늘 상황 + 톤)
- [ ] Cron Function에 Claude API 연동
- [ ] 클라이언트 브리핑 서비스 개선
- [ ] 저녁 마무리 브리핑 추가

---

### 1.3 태스크 우선순위 로직 완성 (1-2일)

**현재 상태** (문서 vs 구현)
| 기준 | 문서 | 현재 |
|------|------|------|
| 마감 임박 | 0-100점 | 0-40점 |
| 중요 표시 | 0/70점 | 0-30점 |
| 누군가 기다림 | 0-80점 | ❌ 미구현 |
| 소요시간 | 0-50점 | 0-15점 |
| 반복 미룸 | 0-60점 | ❌ 미구현 |
| 오늘 예정 | 0/50점 | ❌ 미구현 |

**수정 대상**
```
src/services/tasks.ts
└── Task 타입에 waitingFor, starred, deferCount, scheduledDate 추가

src/services/proxy/priorityRecommender.ts
├── 6가지 기준 완전 구현
├── 가중치 시스템 추가
└── 뷰별 가중치 프리셋 (Work/Life/All)
```

**작업 항목**
- [ ] Task 타입 확장
- [ ] 누군가 기다림 점수 구현 (external/boss/team)
- [ ] 반복 미룸 점수 구현 (count 기반)
- [ ] 오늘 예정 점수 구현
- [ ] 뷰별 가중치 프리셋 적용

---

## Phase 2: 중요 - 5-7일

### 2.1 넛지 시스템 (3-4일)

**현재 상태**: ❌ 완전 미구현

**문서 정의 7가지 트리거**
1. 미팅 전 (15분 전)
2. 집중시간 (피크 시간대)
3. 방치 태스크 (24시간+)
4. 과부하 (일정 밀집)
5. 휴식 권유 (장시간 작업)
6. 퇴근 권유 (업무 종료)
7. 지각 방지 (출발 시간)

**생성할 파일**
```
src/services/nudge/
├── index.ts           # 메인 엔트리
├── triggers.ts        # 7가지 트리거 로직
├── scheduler.ts       # 넛지 스케줄링
├── messages.ts        # 톤별 메시지 템플릿
└── types.ts           # 타입 정의

src/stores/nudgeStore.ts  # Zustand 스토어
```

**작업 항목**
- [ ] NudgeTrigger 인터페이스 설계
- [ ] 7가지 트리거 구현 (condition + generate)
- [ ] 스케줄러 (백그라운드 체크)
- [ ] 톤별 메시지 템플릿
- [ ] nudgeStore 생성
- [ ] 알림 푸시 연동

**의존성**: 2.2 알림 푸시

---

### 2.2 알림 푸시 클라이언트 연동 (1-2일)

**현재 상태**
- Edge Function (`supabase/functions/push-send/`): ✅ 완성
- Edge Function (`supabase/functions/push-subscribe/`): ✅ 존재
- 클라이언트: ⚠️ Service Worker 기본만

**수정/생성할 파일**
```
public/sw.js
├── push 이벤트 핸들러
└── notificationclick 핸들러

src/services/push/
├── pushService.ts     # 구독/해제 로직
└── types.ts

src/components/settings/NotificationSettings.tsx  # 수정
```

**작업 항목**
- [ ] Service Worker push 이벤트 핸들러
- [ ] VAPID 키로 PushManager 구독
- [ ] push-subscribe Edge Function 호출
- [ ] 알림 권한 요청 UI
- [ ] 조용한 시간 설정 연동

---

### 2.3 알프레도 학습 UI (1-2일)

**현재 상태**
- 서비스 (`src/services/alfredo/`): ✅ 완성 (31,255줄)
- 스토어 (`src/stores/alfredoStore.ts`): ✅ 완성 (210줄)
- UI: ❌ 없음

**생성할 파일**
```
src/components/alfredo/
├── UnderstandingGauge.tsx    # 이해도 게이지 (0-100%)
├── LearningList.tsx          # 배운 것 리스트
├── WeeklyReportCard.tsx      # 주간 리포트
├── LearningFeedback.tsx      # 좋아요/싫어요
└── AlfredoProfilePage.tsx    # 통합 페이지

src/pages/AlfredoProfile.tsx  # 라우트 연결
```

**작업 항목**
- [ ] UnderstandingGauge 컴포넌트 (원형 프로그레스)
- [ ] LearningList 컴포넌트 (카테고리 필터)
- [ ] WeeklyReportCard 컴포넌트
- [ ] LearningFeedback 컴포넌트
- [ ] AlfredoProfilePage 통합
- [ ] 라우트 등록

---

## Phase 3: 개선 - 7-10일

### 3.1 펭귄 게이미피케이션 UI (2-3일)

**현재 상태**
- Edge Function (`supabase/functions/penguin/`): ✅ 완성
- API 클라이언트 (`src/lib/api.ts`): ✅ `penguinApi` 존재
- UI: ❌ 없음

**생성할 파일**
```
src/components/penguin/
├── PenguinAvatar.tsx      # 캐릭터 + 아이템 렌더링
├── PenguinStatus.tsx      # 레벨/코인/경험치
├── ShopModal.tsx          # 상점
├── InventoryModal.tsx     # 인벤토리
├── AchievementBadge.tsx   # 업적
└── PenguinWidget.tsx      # 홈 위젯

src/stores/penguinStore.ts
```

**작업 항목**
- [ ] penguinStore 생성
- [ ] PenguinAvatar 컴포넌트 (SVG/Canvas)
- [ ] ShopModal 컴포넌트
- [ ] InventoryModal 컴포넌트
- [ ] 홈 화면 위젯 통합
- [ ] 태스크 완료 시 XP/코인 지급 연동

---

### 3.2 오프라인 동기화 (2-3일)

**현재 상태**
- Dexie.js: ✅ 설치됨
- 동기화 로직: ❌ 없음

**생성할 파일**
```
src/lib/db.ts
└── Dexie 스키마 (tasks, habits, conditions)

src/services/sync/
├── syncService.ts    # 동기화 로직
├── conflictResolver.ts  # 충돌 해결
└── types.ts
```

**작업 항목**
- [ ] Dexie 스키마 정의
- [ ] 온라인 복귀 감지
- [ ] 오프라인 큐 관리
- [ ] 충돌 해결 (last-write-wins)
- [ ] Service Worker 정적 자산 캐싱

---

### 3.3 Gmail 연동 (2-3일)

**현재 상태**
- Google OAuth: ✅ 구현됨 (캘린더용)
- Gmail: ❌ 스코프 없음

**수정/생성할 파일**
```
supabase/functions/auth-google/index.ts
└── gmail.readonly 스코프 추가

supabase/functions/gmail/
├── index.ts          # 메일 조회
└── summarize.ts      # Claude로 요약

src/services/gmail/
└── gmailService.ts
```

**작업 항목**
- [ ] OAuth 스코프 확장 (gmail.readonly)
- [ ] Gmail Edge Function 생성
- [ ] Claude로 중요 메일 요약
- [ ] 브리핑에 메일 요약 포함

---

### 3.4 클라이언트 암호화 (1-2일)

**현재 상태**: ❌ 미구현

**생성할 파일**
```
src/services/crypto/
├── cryptoService.ts   # AES-GCM 암호화/복호화
├── keyDerivation.ts   # PBKDF2 키 파생
└── types.ts
```

**작업 항목**
- [ ] AES-GCM 암호화 서비스
- [ ] 키 파생 (PBKDF2)
- [ ] 민감 데이터 암호화 적용 (메모, 캘린더 상세)

---

## Phase 4: E2E 테스트 - 2-3일

### 테스트 환경 설정

**생성할 파일**
```
e2e/
├── playwright.config.ts
├── fixtures/
│   ├── auth.ts        # 인증 fixture
│   └── testData.ts    # 테스트 데이터
├── pages/
│   ├── LoginPage.ts
│   ├── HomePage.ts
│   ├── ChatPage.ts
│   └── SettingsPage.ts
└── tests/
    ├── auth.spec.ts
    ├── chat.spec.ts
    ├── briefing.spec.ts
    ├── tasks.spec.ts
    ├── nudge.spec.ts
    └── penguin.spec.ts
```

### 테스트 시나리오

| 테스트 | 시나리오 |
|--------|----------|
| 인증 | Google OAuth 로그인 → 온보딩 → 홈 |
| 채팅 | 메시지 전송 → Claude 응답 → 학습 추출 |
| 브리핑 | 아침 브리핑 확인 → DNA 기반 개인화 검증 |
| 태스크 | 생성 → 우선순위 자동 계산 → Top 3 표시 |
| 넛지 | 미팅 15분 전 → 알림 수신 |
| 펭귄 | 태스크 완료 → XP 획득 → 아이템 구매 |

**작업 항목**
- [ ] Playwright 설정
- [ ] Page Object 패턴 구현
- [ ] 핵심 플로우 E2E 테스트 작성
- [ ] CI/CD 연동 (GitHub Actions)

---

## 구현 순서 (의존성)

```
Week 1-2 (Phase 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1.1 Claude API] ──► [1.2 브리핑 AI]
[1.3 우선순위 로직] (독립)

Week 3-4 (Phase 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2.2 알림 푸시] ──► [2.1 넛지 시스템]
[2.3 알프레도 학습 UI] (독립)

Week 5-6 (Phase 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[3.1 펭귄 UI] (독립)
[2.2] ──► [3.2 오프라인 동기화]
[1.2] ──► [3.3 Gmail 연동]
[3.4 클라이언트 암호화] (독립)

Week 7 (Phase 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[E2E 테스트] (모든 기능 완료 후)
```

---

## 핵심 수정 파일

| 파일 | Phase | 작업 |
|------|-------|------|
| `src/stores/chatStore.ts` | 1.1 | Claude API 연동 |
| `src/services/proxy/priorityRecommender.ts` | 1.3 | 우선순위 로직 완성 |
| `supabase/functions/cron-morning-briefing/index.ts` | 1.2 | 브리핑 AI |
| `public/sw.js` | 2.2 | 푸시 알림 |
| `src/services/nudge/` (신규) | 2.1 | 넛지 시스템 |
| `src/components/alfredo/` (신규) | 2.3 | 학습 UI |
| `src/components/penguin/` (신규) | 3.1 | 펭귄 UI |
| `src/lib/db.ts` (신규) | 3.2 | 오프라인 DB |
| `e2e/` (신규) | 4 | E2E 테스트 |

---

## 검증 체크리스트

### Phase 1 완료 기준
- [ ] 채팅에서 Claude 실시간 응답 확인
- [ ] 아침 브리핑에 개인화된 메시지 표시
- [ ] 태스크 Top 3가 6가지 기준으로 계산됨

### Phase 2 완료 기준
- [ ] 미팅 15분 전 푸시 알림 수신
- [ ] 알프레도 이해도 게이지 표시
- [ ] 학습 리스트 피드백 가능

### Phase 3 완료 기준
- [ ] 펭귄 아이템 구매 및 장착
- [ ] 오프라인에서 태스크 생성 → 온라인 복구 후 동기화
- [ ] 브리핑에 Gmail 요약 포함

### Phase 4 완료 기준
- [ ] 모든 E2E 테스트 통과
- [ ] CI/CD 자동 실행
