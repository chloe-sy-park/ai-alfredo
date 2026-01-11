# 17. API 상세 스펙

> 08-api-architecture.md의 확장판. DB 스키마 기반 전체 API 정의.

---

## 📋 목차

1. [공통 규격](#1-공통-규격)
2. [Auth API](#2-auth-api)
3. [Users API](#3-users-api)
4. [Settings API](#4-settings-api)
5. [Subscriptions API](#5-subscriptions-api)
6. [Tasks API](#6-tasks-api)
7. [Habits API](#7-habits-api)
8. [Focus Sessions API](#8-focus-sessions-api)
9. [Daily Conditions API](#9-daily-conditions-api)
10. [Penguin System API](#10-penguin-system-api)
11. [Conversations API](#11-conversations-api)
12. [Calendar API](#12-calendar-api)
13. [Briefings API](#13-briefings-api)
14. [Reports API](#14-reports-api)
15. [DNA Insights API](#15-dna-insights-api)

---

## 1. 공통 규격

### 1.1 Base URL

```
Production: https://alfredo.app/api
Development: http://localhost:3000/api
```

### 1.2 인증

모든 API는 Bearer 토큰 필요 (일부 예외 제외)

```http
Authorization: Bearer <supabase_access_token>
```

### 1.3 응답 형식

```typescript
// 성공
{
  "data": { ... },
  "meta"?: {
    "page": number,
    "limit": number,
    "total": number,
    "hasMore": boolean
  }
}

// 에러
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details"?: { ... }
  }
}
```

### 1.4 HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | OK - 성공 |
| 201 | Created - 생성됨 |
| 204 | No Content - 삭제 성공 |
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 필요 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스 없음 |
| 409 | Conflict - 충돌 (중복 등) |
| 422 | Unprocessable Entity - 유효성 검증 실패 |
| 429 | Too Many Requests - Rate Limit 초과 |
| 500 | Internal Server Error - 서버 에러 |
| 503 | Service Unavailable - 일시적 장애 |

### 1.5 에러 코드 표준

```typescript
type ErrorCode =
  // Auth
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_EXPIRED_TOKEN'
  | 'AUTH_GOOGLE_FAILED'
  
  // Validation
  | 'VALIDATION_FAILED'
  | 'INVALID_DATE_FORMAT'
  | 'INVALID_ENUM_VALUE'
  
  // Resource
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'CONFLICT'
  
  // Rate Limit
  | 'RATE_LIMIT_EXCEEDED'
  
  // External
  | 'GOOGLE_API_ERROR'
  | 'CLAUDE_API_ERROR'
  | 'CLAUDE_OVERLOADED'
  
  // Subscription
  | 'PREMIUM_REQUIRED'
  | 'QUOTA_EXCEEDED';
```

### 1.6 페이지네이션

```http
GET /api/tasks?page=1&limit=20&sort=created_at&order=desc
```

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 (max: 100) |
| sort | string | created_at | 정렬 필드 |
| order | 'asc' \| 'desc' | desc | 정렬 방향 |

### 1.7 필터링

```http
GET /api/tasks?status=todo&category=work&due_date=2025-01-15
```

날짜 범위:
```http
GET /api/tasks?due_date_from=2025-01-01&due_date_to=2025-01-31
```

### 1.8 Rate Limits

| 엔드포인트 그룹 | 제한 |
|----------------|------|
| Auth | 10/min |
| Chat (Claude) | 20/min |
| DNA Analysis | 5/min |
| Calendar Sync | 10/min |
| 기타 모든 API | 60/min |

---

## 2. Auth API

### 2.1 Google OAuth 시작

```http
GET /api/auth/google
```

**Response**: Redirect to Google OAuth

### 2.2 OAuth 콜백

```http
GET /api/auth/google/callback?code={code}
```

**Response**: Redirect to app (/ or /onboarding)

### 2.3 토큰 갱신

```http
POST /api/auth/refresh
```

**Request Body**:
```json
{
  "refresh_token": "string"
}
```

**Response** `200`:
```json
{
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "expires_at": "2025-01-15T10:00:00Z"
  }
}
```

### 2.4 로그아웃

```http
POST /api/auth/logout
```

**Response** `204`: No Content

---

## 3. Users API

### 3.1 현재 사용자 조회

```http
GET /api/users/me
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "picture": "https://...",
    "is_onboarded": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 3.2 프로필 업데이트

```http
PATCH /api/users/me
```

**Request Body**:
```json
{
  "name": "새이름",
  "picture": "https://..."
}
```

**Response** `200`: 업데이트된 사용자 정보

### 3.3 계정 삭제

```http
DELETE /api/users/me
```

**Response** `204`: No Content

⚠️ **주의**: 모든 데이터 영구 삭제됨

---

## 4. Settings API

### 4.1 설정 조회

```http
GET /api/settings
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    
    "tone_preset": "gentle_friend",
    "tone_axes": {
      "warmth": 4,
      "proactivity": 3,
      "directness": 3,
      "humor": 3,
      "pressure": 2
    },
    
    "privacy_level": "selective",
    "default_view": "integrated",
    
    "notifications": {
      "morning_briefing": true,
      "evening_review": true,
      "task_reminders": true,
      "nudges": true,
      "celebrations": true
    },
    
    "priority_weights": {
      "deadline": 0.35,
      "importance": 0.30,
      "energy_match": 0.20,
      "context": 0.15
    },
    
    "chronotype": "morning",
    "wake_time": "07:00",
    "sleep_time": "23:00",
    "work_start_time": "09:00",
    "work_end_time": "18:00",
    
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-10T12:00:00Z"
  }
}
```

### 4.2 설정 업데이트

```http
PATCH /api/settings
```

**Request Body** (부분 업데이트 가능):
```json
{
  "tone_preset": "mentor",
  "notifications": {
    "nudges": false
  },
  "wake_time": "06:30"
}
```

**Response** `200`: 업데이트된 설정

### 4.3 설정 초기화

```http
POST /api/settings/reset
```

**Response** `200`: 기본값으로 초기화된 설정

---

## 5. Subscriptions API

### 5.1 구독 상태 조회

```http
GET /api/subscriptions
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "plan_type": "premium",
    "status": "active",
    "started_at": "2025-01-01T00:00:00Z",
    "expires_at": "2025-02-01T00:00:00Z",
    "payment_provider": "stripe",
    "features": {
      "unlimited_chat": true,
      "advanced_dna": true,
      "custom_tone": true,
      "priority_support": true
    }
  }
}
```

### 5.2 구독 플랜 목록

```http
GET /api/subscriptions/plans
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": {
        "daily_chats": 20,
        "basic_briefing": true,
        "task_management": true
      }
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 9900,
      "currency": "KRW",
      "interval": "month",
      "features": {
        "unlimited_chat": true,
        "advanced_dna": true,
        "custom_tone": true,
        "priority_support": true
      }
    }
  ]
}
```

### 5.3 구독 시작 (결제)

```http
POST /api/subscriptions
```

**Request Body**:
```json
{
  "plan_type": "premium",
  "payment_provider": "stripe",
  "payment_method_id": "pm_xxx"
}
```

**Response** `201`:
```json
{
  "data": {
    "id": "uuid",
    "plan_type": "premium",
    "status": "active",
    "client_secret": "pi_xxx_secret_xxx"
  }
}
```

### 5.4 구독 취소

```http
DELETE /api/subscriptions
```

**Response** `200`:
```json
{
  "data": {
    "status": "cancelled",
    "expires_at": "2025-02-01T00:00:00Z",
    "message": "구독이 취소되었습니다. 2025-02-01까지 Premium 기능을 사용할 수 있습니다."
  }
}
```

---

## 6. Tasks API

### 6.1 태스크 목록 조회

```http
GET /api/tasks
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| status | string | todo, in_progress, done, deferred |
| category | string | work, life |
| is_starred | boolean | 중요 표시 여부 |
| is_top_three | boolean | 오늘의 탑3 여부 |
| due_date | string | YYYY-MM-DD |
| due_date_from | string | 마감일 시작 |
| due_date_to | string | 마감일 끝 |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "보고서 작성",
      "description": "Q1 실적 보고서",
      "status": "todo",
      "category": "work",
      "is_starred": true,
      "is_top_three": true,
      "due_date": "2025-01-15",
      "due_time": "18:00",
      "estimated_minutes": 120,
      "actual_minutes": null,
      "defer_count": 0,
      "tags": ["urgent", "report"],
      "subtasks": [
        {"id": "1", "title": "데이터 수집", "done": true},
        {"id": "2", "title": "차트 작성", "done": false}
      ],
      "completed_at": null,
      "created_at": "2025-01-10T09:00:00Z",
      "updated_at": "2025-01-10T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

### 6.2 태스크 생성

```http
POST /api/tasks
```

**Request Body**:
```json
{
  "title": "새 태스크",
  "description": "설명 (선택)",
  "category": "work",
  "is_starred": false,
  "due_date": "2025-01-20",
  "due_time": "14:00",
  "estimated_minutes": 60,
  "tags": ["meeting"],
  "subtasks": [
    {"title": "준비물 챙기기"},
    {"title": "자료 검토"}
  ]
}
```

**Response** `201`: 생성된 태스크

### 6.3 태스크 상세 조회

```http
GET /api/tasks/{id}
```

**Response** `200`: 태스크 상세 정보

### 6.4 태스크 업데이트

```http
PATCH /api/tasks/{id}
```

**Request Body** (부분 업데이트):
```json
{
  "status": "in_progress",
  "is_top_three": true
}
```

**Response** `200`: 업데이트된 태스크

### 6.5 태스크 완료

```http
POST /api/tasks/{id}/complete
```

**Request Body**:
```json
{
  "actual_minutes": 90
}
```

**Response** `200`:
```json
{
  "data": {
    "task": { ... },
    "rewards": {
      "xp_earned": 50,
      "coins_earned": 10,
      "streak_bonus": 5
    }
  }
}
```

### 6.6 태스크 연기

```http
POST /api/tasks/{id}/defer
```

**Request Body**:
```json
{
  "new_date": "2025-01-16",
  "reason": "미팅 일정 변경"
}
```

**Response** `200`:
```json
{
  "data": {
    "task": { ... },
    "defer_count": 2,
    "message": "이 태스크를 2번 연기했어요. 작게 나눠볼까요?"
  }
}
```

### 6.7 태스크 삭제

```http
DELETE /api/tasks/{id}
```

**Response** `204`: No Content

### 6.8 오늘의 탑3 설정

```http
POST /api/tasks/top-three
```

**Request Body**:
```json
{
  "task_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response** `200`:
```json
{
  "data": {
    "top_three": [ ... ],
    "message": "오늘의 탑3가 설정되었어요!"
  }
}
```

### 6.9 태스크 히스토리 조회

```http
GET /api/tasks/{id}/history
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "action": "deferred",
      "old_value": {"due_date": "2025-01-14"},
      "new_value": {"due_date": "2025-01-16"},
      "created_at": "2025-01-14T10:00:00Z"
    }
  ]
}
```

---

## 7. Habits API

### 7.1 습관 목록 조회

```http
GET /api/habits
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| is_active | boolean | 활성 여부 |
| frequency | string | daily, weekly, custom |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "아침 운동",
      "description": "30분 스트레칭",
      "frequency": "daily",
      "target_days": [1, 2, 3, 4, 5],
      "current_streak": 7,
      "best_streak": 14,
      "total_completions": 45,
      "is_active": true,
      "reminder_time": "07:00",
      "today_completed": false,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### 7.2 습관 생성

```http
POST /api/habits
```

**Request Body**:
```json
{
  "title": "물 8잔 마시기",
  "description": "하루에 물 2리터",
  "frequency": "daily",
  "target_days": [0, 1, 2, 3, 4, 5, 6],
  "reminder_time": "09:00"
}
```

**Response** `201`: 생성된 습관

### 7.3 습관 상세 조회

```http
GET /api/habits/{id}
```

**Response** `200`: 습관 상세 + 최근 30일 로그

### 7.4 습관 업데이트

```http
PATCH /api/habits/{id}
```

**Response** `200`: 업데이트된 습관

### 7.5 습관 삭제 (비활성화)

```http
DELETE /api/habits/{id}
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "is_active": false,
    "message": "습관이 비활성화되었어요. 기록은 유지됩니다."
  }
}
```

### 7.6 습관 로그 기록

```http
POST /api/habits/{id}/logs
```

**Request Body**:
```json
{
  "log_date": "2025-01-15",
  "completed": true,
  "note": "오늘 컨디션 좋아서 40분 했다!"
}
```

**Response** `201`:
```json
{
  "data": {
    "log": { ... },
    "habit": {
      "current_streak": 8,
      "best_streak": 14
    },
    "rewards": {
      "xp_earned": 20,
      "streak_bonus": 10
    }
  }
}
```

### 7.7 습관 로그 조회

```http
GET /api/habits/{id}/logs
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| from | string | 시작일 YYYY-MM-DD |
| to | string | 종료일 YYYY-MM-DD |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "log_date": "2025-01-15",
      "completed": true,
      "note": "40분 완료",
      "created_at": "2025-01-15T07:30:00Z"
    }
  ]
}
```

### 7.8 오늘 습관 현황

```http
GET /api/habits/today
```

**Response** `200`:
```json
{
  "data": {
    "date": "2025-01-15",
    "habits": [
      {
        "id": "uuid",
        "title": "아침 운동",
        "completed": true,
        "streak": 8
      },
      {
        "id": "uuid",
        "title": "물 8잔",
        "completed": false,
        "streak": 3
      }
    ],
    "summary": {
      "total": 5,
      "completed": 3,
      "completion_rate": 60
    }
  }
}
```

---

## 8. Focus Sessions API

### 8.1 세션 목록 조회

```http
GET /api/focus
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| mode | string | pomodoro, flow, body_double, deep_work |
| date | string | YYYY-MM-DD |
| from | string | 시작일 |
| to | string | 종료일 |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "task_title": "보고서 작성",
      "mode": "pomodoro",
      "planned_minutes": 25,
      "actual_minutes": 25,
      "breaks_taken": 1,
      "end_reason": "completed",
      "started_at": "2025-01-15T10:00:00Z",
      "ended_at": "2025-01-15T10:25:00Z"
    }
  ]
}
```

### 8.2 세션 시작

```http
POST /api/focus
```

**Request Body**:
```json
{
  "task_id": "uuid",
  "mode": "pomodoro",
  "planned_minutes": 25
}
```

**Response** `201`:
```json
{
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "mode": "pomodoro",
    "planned_minutes": 25,
    "started_at": "2025-01-15T10:00:00Z",
    "penguin_message": "화이팅! 25분 동안 같이 집중해볼게요 🐧"
  }
}
```

### 8.3 세션 종료

```http
POST /api/focus/{id}/end
```

**Request Body**:
```json
{
  "end_reason": "completed",
  "actual_minutes": 25,
  "breaks_taken": 1
}
```

**Response** `200`:
```json
{
  "data": {
    "session": { ... },
    "rewards": {
      "xp_earned": 30,
      "focus_streak": 3
    },
    "suggestion": "5분 휴식 후 다음 세션 어때요?"
  }
}
```

### 8.4 세션 중단

```http
POST /api/focus/{id}/interrupt
```

**Request Body**:
```json
{
  "reason": "meeting",
  "actual_minutes": 15
}
```

**Response** `200`:
```json
{
  "data": {
    "session": { ... },
    "rewards": {
      "xp_earned": 15
    },
    "message": "15분이라도 집중했어요! 대단해요 👏"
  }
}
```

### 8.5 오늘 집중 통계

```http
GET /api/focus/today
```

**Response** `200`:
```json
{
  "data": {
    "date": "2025-01-15",
    "total_sessions": 4,
    "total_minutes": 100,
    "completed_sessions": 3,
    "by_mode": {
      "pomodoro": 75,
      "flow": 25
    },
    "peak_focus_time": "10:00-12:00"
  }
}
```

---

## 9. Daily Conditions API

### 9.1 오늘 컨디션 조회

```http
GET /api/conditions/today
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "log_date": "2025-01-15",
    "energy_level": 4,
    "mood_level": 3,
    "focus_level": 4,
    "factors": ["good_sleep", "exercise"],
    "note": "오늘 컨디션 좋아요",
    "created_at": "2025-01-15T07:00:00Z"
  }
}
```

**Response** `404` (미입력시):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "오늘 컨디션이 아직 기록되지 않았어요"
  }
}
```

### 9.2 컨디션 기록/업데이트

```http
POST /api/conditions
```

**Request Body**:
```json
{
  "log_date": "2025-01-15",
  "energy_level": 4,
  "mood_level": 3,
  "focus_level": 4,
  "factors": ["good_sleep", "exercise", "coffee"],
  "note": "아침 운동 후 상쾌!"
}
```

**Response** `200` (upsert):
```json
{
  "data": {
    "condition": { ... },
    "recommendation": "에너지가 높네요! 중요한 태스크 하기 좋은 타이밍이에요 ⚡"
  }
}
```

### 9.3 컨디션 히스토리

```http
GET /api/conditions
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| from | string | 시작일 |
| to | string | 종료일 |
| limit | number | 개수 (기본 30) |

**Response** `200`:
```json
{
  "data": [
    {
      "log_date": "2025-01-15",
      "energy_level": 4,
      "mood_level": 3,
      "focus_level": 4
    },
    {
      "log_date": "2025-01-14",
      "energy_level": 2,
      "mood_level": 2,
      "focus_level": 3
    }
  ],
  "summary": {
    "avg_energy": 3.2,
    "avg_mood": 3.5,
    "avg_focus": 3.8,
    "best_day": "2025-01-12",
    "common_positive_factors": ["good_sleep", "exercise"],
    "common_negative_factors": ["stress", "poor_sleep"]
  }
}
```

### 9.4 퀵 컨디션 업데이트

```http
PATCH /api/conditions/quick
```

**Request Body** (단일 필드만):
```json
{
  "energy_level": 3
}
```

**Response** `200`: 업데이트된 컨디션

---

## 10. Penguin System API

### 10.1 펭귄 상태 조회

```http
GET /api/penguin
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "name": "알프레도",
    "level": 5,
    "current_xp": 350,
    "xp_for_next_level": 759,
    "total_xp": 1250,
    "coins": 450,
    "current_mood": "happy",
    "current_outfit": "hat_party",
    "unlocked_items": ["default_look", "hat_party", "acc_bowtie"],
    "achievements": ["first_task", "week_streak"],
    "last_interaction": "2025-01-15T10:00:00Z"
  }
}
```

### 10.2 펭귄 이름 변경

```http
PATCH /api/penguin
```

**Request Body**:
```json
{
  "name": "뽀로로"
}
```

**Response** `200`: 업데이트된 펭귄 상태

### 10.3 아이템 상점

```http
GET /api/penguin/shop
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| category | string | hat, accessory, background, effect |
| rarity | string | common, rare, epic, legendary |
| owned | boolean | 보유 여부 필터 |

**Response** `200`:
```json
{
  "data": [
    {
      "item_id": "hat_crown",
      "name": "Golden Crown",
      "name_ko": "황금 왕관",
      "category": "hat",
      "rarity": "legendary",
      "price": 500,
      "image_url": "/images/items/hat_crown.png",
      "owned": false,
      "can_afford": false,
      "unlock_condition": null
    }
  ],
  "user_coins": 450
}
```

### 10.4 아이템 구매

```http
POST /api/penguin/shop/buy
```

**Request Body**:
```json
{
  "item_id": "hat_party"
}
```

**Response** `200`:
```json
{
  "data": {
    "item": { ... },
    "coins_spent": 50,
    "coins_remaining": 400,
    "message": "파티 모자를 획득했어요! 🎉"
  }
}
```

**Response** `400` (코인 부족):
```json
{
  "error": {
    "code": "INSUFFICIENT_COINS",
    "message": "코인이 부족해요. 50코인 더 필요해요!",
    "details": {
      "required": 500,
      "current": 450
    }
  }
}
```

### 10.5 아이템 장착

```http
POST /api/penguin/equip
```

**Request Body**:
```json
{
  "item_id": "hat_party"
}
```

**Response** `200`:
```json
{
  "data": {
    "current_outfit": "hat_party",
    "message": "파티 모자를 썼어요! 🎩"
  }
}
```

### 10.6 XP 히스토리

```http
GET /api/penguin/xp-history
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| from | string | 시작일 |
| to | string | 종료일 |
| source | string | task_complete, habit_streak, focus_session 등 |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 50,
      "source": "task_complete",
      "description": "'보고서 작성' 완료!",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "amount": 30,
      "source": "focus_session",
      "description": "25분 집중 완료",
      "created_at": "2025-01-15T10:25:00Z"
    }
  ]
}
```

### 10.7 업적 목록

```http
GET /api/penguin/achievements
```

**Response** `200`:
```json
{
  "data": {
    "unlocked": [
      {
        "id": "first_task",
        "name": "첫 발걸음",
        "description": "첫 번째 태스크 완료",
        "unlocked_at": "2025-01-01T10:00:00Z",
        "xp_reward": 100
      }
    ],
    "locked": [
      {
        "id": "marathon",
        "name": "마라토너",
        "description": "30일 연속 태스크 완료",
        "progress": {
          "current": 7,
          "target": 30
        },
        "xp_reward": 500
      }
    ]
  }
}
```

---

## 11. Conversations API

### 11.1 대화 목록 조회

```http
GET /api/conversations
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| type | string | chat, briefing, nudge, onboarding |
| from | string | 시작일 |
| to | string | 종료일 |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "chat",
      "context": "task_help",
      "message_count": 12,
      "started_at": "2025-01-15T10:00:00Z",
      "ended_at": "2025-01-15T10:15:00Z",
      "preview": "보고서 작성 도와줘..."
    }
  ]
}
```

### 11.2 새 대화 시작

```http
POST /api/conversations
```

**Request Body**:
```json
{
  "type": "chat",
  "context": "general"
}
```

**Response** `201`:
```json
{
  "data": {
    "id": "uuid",
    "type": "chat",
    "context": "general",
    "started_at": "2025-01-15T10:00:00Z"
  }
}
```

### 11.3 대화 상세 조회

```http
GET /api/conversations/{id}
```

**Response** `200`:
```json
{
  "data": {
    "conversation": {
      "id": "uuid",
      "type": "chat",
      "context": "task_help"
    },
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "보고서 작성 도와줘",
        "created_at": "2025-01-15T10:00:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "물론이죠! 어떤 보고서인가요?",
        "created_at": "2025-01-15T10:00:05Z"
      }
    ]
  }
}
```

### 11.4 메시지 전송 (스트리밍)

```http
POST /api/conversations/{id}/messages
```

**Request Body**:
```json
{
  "content": "오늘 할 일 정리해줘"
}
```

**Response**: Server-Sent Events (SSE)

```
data: {"type": "start", "message_id": "uuid"}

data: {"type": "delta", "text": "오늘"}

data: {"type": "delta", "text": " 할 일을"}

data: {"type": "delta", "text": " 정리해드릴게요!"}

data: {"type": "done", "message_id": "uuid", "tokens": {"input": 150, "output": 85}}

data: [DONE]
```

### 11.5 대화 종료

```http
POST /api/conversations/{id}/end
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "ended_at": "2025-01-15T10:15:00Z",
    "summary": {
      "message_count": 12,
      "duration_minutes": 15,
      "extracted_tasks": [
        {"title": "보고서 초안 작성", "due_date": "2025-01-16"}
      ]
    }
  }
}
```

### 11.6 대화에서 태스크 추출

```http
POST /api/conversations/{id}/extract-tasks
```

**Response** `200`:
```json
{
  "data": {
    "tasks": [
      {
        "title": "보고서 초안 작성",
        "due_date": "2025-01-16",
        "category": "work",
        "source_message_id": "uuid"
      }
    ],
    "confirm_prompt": "이 태스크들을 추가할까요?"
  }
}
```

---

## 12. Calendar API

### 12.1 이벤트 조회

```http
GET /api/calendar/events
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| from | string | 시작일시 |
| to | string | 종료일시 |
| category | string | meeting, focus, personal, travel, meal |

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "google_event_id": "abc123",
      "title": "팀 미팅",
      "start_time": "2025-01-15T14:00:00Z",
      "end_time": "2025-01-15T15:00:00Z",
      "is_all_day": false,
      "location": "회의실 A",
      "attendee_count": 5,
      "category": "meeting",
      "importance": "high",
      "energy_drain": "medium"
    }
  ]
}
```

### 12.2 캘린더 동기화

```http
POST /api/calendar/sync
```

**Response** `200`:
```json
{
  "data": {
    "synced_count": 25,
    "new_events": 3,
    "updated_events": 2,
    "deleted_events": 1,
    "last_synced_at": "2025-01-15T10:00:00Z",
    "next_sync_at": "2025-01-15T10:15:00Z"
  }
}
```

### 12.3 오늘 일정 요약

```http
GET /api/calendar/today
```

**Response** `200`:
```json
{
  "data": {
    "date": "2025-01-15",
    "events": [ ... ],
    "summary": {
      "total_events": 5,
      "meetings": 3,
      "focus_blocks": 2,
      "busy_hours": 6,
      "free_hours": 2,
      "busiest_period": "14:00-17:00",
      "intensity": "high"
    },
    "gaps": [
      {
        "start": "11:00",
        "end": "12:00",
        "duration_minutes": 60,
        "suggestion": "보고서 작성하기 좋은 시간이에요"
      }
    ]
  }
}
```

### 12.4 Google 연결 상태

```http
GET /api/calendar/connection
```

**Response** `200`:
```json
{
  "data": {
    "connected": true,
    "email": "user@gmail.com",
    "scopes": ["calendar.readonly", "gmail.readonly"],
    "last_synced_at": "2025-01-15T10:00:00Z",
    "token_expires_at": "2025-01-15T11:00:00Z"
  }
}
```

### 12.5 Google 연결 해제

```http
DELETE /api/calendar/connection
```

**Response** `200`:
```json
{
  "data": {
    "message": "Google 캘린더 연결이 해제되었습니다.",
    "cached_events_deleted": 156
  }
}
```

---

## 13. Briefings API

### 13.1 아침 브리핑 생성

```http
GET /api/briefings/morning
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "type": "morning",
    "content": {
      "greeting": "좋은 아침이에요! ☀️",
      "weather": {
        "condition": "맑음",
        "temp": 5,
        "message": "쌀쌀하니 따뜻하게 입으세요"
      },
      "intensity": "medium",
      "summary": "오늘 미팅 2개, 태스크 5개가 있어요",
      "top_three": [ ... ],
      "timeline": [
        {"time": "09:00", "event": "팀 스탠드업", "type": "meeting"},
        {"time": "10:00", "event": "집중 시간", "type": "focus"},
        {"time": "14:00", "event": "1:1 미팅", "type": "meeting"}
      ],
      "comment": "화요일이 보통 바쁘시잖아요. 오늘도 화이팅! 💪"
    },
    "created_at": "2025-01-15T07:00:00Z"
  }
}
```

### 13.2 저녁 랩업 생성

```http
GET /api/briefings/evening
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "type": "evening",
    "content": {
      "greeting": "오늘 하루 수고했어요! 🌙",
      "summary": {
        "tasks_completed": 4,
        "tasks_remaining": 1,
        "focus_minutes": 120,
        "meetings_attended": 2
      },
      "wins": [
        "보고서 작성 완료! 🎉",
        "3일 연속 아침 운동 달성"
      ],
      "tomorrow_preview": {
        "events": 3,
        "tasks": 6,
        "first_event": "09:00 팀 미팅"
      },
      "comment": "이번 주 잘 달리고 있어요. 푹 쉬세요! 😴"
    },
    "created_at": "2025-01-15T21:00:00Z"
  }
}
```

### 13.3 브리핑 히스토리

```http
GET /api/briefings
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| type | string | morning, evening, nudge, care |
| from | string | 시작일 |
| to | string | 종료일 |

**Response** `200`: 브리핑 목록

### 13.4 브리핑 읽음 처리

```http
POST /api/briefings/{id}/read
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "was_read": true,
    "read_at": "2025-01-15T07:30:00Z"
  }
}
```

### 13.5 브리핑 반응 기록

```http
POST /api/briefings/{id}/respond
```

**Request Body**:
```json
{
  "response": "acted"
}
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "user_response": "acted"
  }
}
```

---

## 14. Reports API

### 14.1 일일 요약

```http
GET /api/reports/daily
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| date | string | YYYY-MM-DD (기본: 오늘) |

**Response** `200`:
```json
{
  "data": {
    "summary_date": "2025-01-15",
    "tasks": {
      "completed": 4,
      "deferred": 1,
      "created": 2
    },
    "focus": {
      "total_minutes": 120,
      "sessions": 5,
      "by_mode": {
        "pomodoro": 100,
        "flow": 20
      }
    },
    "meetings": {
      "attended": 2,
      "total_minutes": 90
    },
    "conditions": {
      "energy": 4,
      "mood": 3,
      "focus": 4
    },
    "productivity_score": 78,
    "highlights": [
      "보고서 작성 완료",
      "3일 연속 아침 운동"
    ],
    "areas_for_improvement": [
      "점심 후 집중력 저하"
    ]
  }
}
```

### 14.2 주간 인사이트

```http
GET /api/reports/weekly
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| week_start | string | 주 시작일 (월요일, 기본: 이번 주) |

**Response** `200`:
```json
{
  "data": {
    "week_start": "2025-01-13",
    "week_end": "2025-01-19",
    "overall_score": 75,
    "stats": {
      "total_tasks_completed": 18,
      "total_focus_minutes": 540,
      "avg_mood": 3.5,
      "best_day": "2025-01-15",
      "worst_day": "2025-01-14"
    },
    "patterns_discovered": [
      "화요일 오전이 가장 생산적이에요",
      "미팅 3개 넘는 날 집중력 저하"
    ],
    "correlations": [
      {
        "factor": "아침 운동",
        "effect": "생산성 +25%",
        "confidence": 3
      },
      {
        "factor": "6시간 미만 수면",
        "effect": "집중력 -30%",
        "confidence": 2
      }
    ],
    "recommendations": [
      "아침 운동 습관 유지하세요!",
      "미팅 많은 날은 오전에 중요 업무를"
    ],
    "achievements": [
      {
        "id": "week_streak",
        "name": "주간 완주",
        "description": "7일 연속 태스크 완료"
      }
    ],
    "comparison_to_last_week": {
      "tasks_completed": "+5",
      "focus_minutes": "+60",
      "score_change": "+8"
    }
  }
}
```

### 14.3 월간 리포트

```http
GET /api/reports/monthly
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| month | string | YYYY-MM (기본: 이번 달) |

**Response** `200`: 월간 통계 및 트렌드

### 14.4 커스텀 기간 리포트

```http
GET /api/reports/custom
```

**Query Parameters**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| from | string | 시작일 |
| to | string | 종료일 |

**Response** `200`: 해당 기간 통계

---

## 15. DNA Insights API

### 15.1 DNA 인사이트 조회

```http
GET /api/dna
```

**Response** `200`:
```json
{
  "data": {
    "insights": [
      {
        "id": "uuid",
        "insight_type": "chronotype",
        "insight_data": {
          "type": "morning",
          "peak_hours": ["09:00", "11:00"],
          "low_hours": ["14:00", "15:00"]
        },
        "confidence": 3,
        "is_validated": true,
        "display_text": "아침형이시네요! 오전에 집중이 잘 되시는 편이에요."
      },
      {
        "id": "uuid",
        "insight_type": "energy_pattern",
        "insight_data": {
          "high_energy_days": [1, 2, 3],
          "low_energy_days": [5],
          "post_meeting_recovery": 30
        },
        "confidence": 2,
        "is_validated": false,
        "display_text": "미팅 후 30분 정도 회복 시간이 필요한 것 같아요."
      }
    ],
    "data_days": 45,
    "last_analysis_at": "2025-01-15T03:00:00Z"
  }
}
```

### 15.2 DNA 분석 실행

```http
POST /api/dna/analyze
```

**Response** `200`:
```json
{
  "data": {
    "new_insights": 2,
    "updated_insights": 3,
    "insights": [ ... ],
    "message": "새로운 패턴을 발견했어요!"
  }
}
```

### 15.3 인사이트 검증

```http
POST /api/dna/{id}/validate
```

**Request Body**:
```json
{
  "is_correct": true
}
```

**Response** `200`:
```json
{
  "data": {
    "id": "uuid",
    "is_validated": true,
    "confidence": 3,
    "message": "피드백 감사해요! 더 정확하게 이해할게요."
  }
}
```

### 15.4 인사이트 삭제 (틀림)

```http
DELETE /api/dna/{id}
```

**Response** `200`:
```json
{
  "data": {
    "message": "인사이트를 삭제했어요. 다시 분석할 때 반영할게요."
  }
}
```

---

## 부록: TypeScript 타입 정의

```typescript
// types/api.ts

// Enums
type TaskStatus = 'todo' | 'in_progress' | 'done' | 'deferred';
type Category = 'work' | 'life';
type TonePreset = 'gentle_friend' | 'mentor' | 'ceo' | 'cheerleader' | 'silent_partner';
type PrivacyLevel = 'open_book' | 'selective' | 'minimal';
type DefaultView = 'integrated' | 'work' | 'life';
type PlanType = 'free' | 'premium' | 'trial';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
type HabitFrequency = 'daily' | 'weekly' | 'custom';
type FocusMode = 'pomodoro' | 'flow' | 'body_double' | 'deep_work';
type EndReason = 'completed' | 'interrupted' | 'abandoned';
type PenguinMood = 'happy' | 'excited' | 'tired' | 'sad' | 'proud' | 'sleepy';
type ItemCategory = 'hat' | 'accessory' | 'background' | 'effect';
type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
type ConversationType = 'chat' | 'briefing' | 'nudge' | 'onboarding';
type MessageRole = 'user' | 'assistant' | 'system';
type EventCategory = 'meeting' | 'focus' | 'personal' | 'travel' | 'meal' | 'other';
type ImportanceLevel = 'high' | 'medium' | 'low';
type BriefingType = 'morning' | 'evening' | 'nudge' | 'checkin' | 'celebration' | 'care' | 'weekly';

// Base Response
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Models
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  tone_preset: TonePreset;
  tone_axes: {
    warmth: number;
    proactivity: number;
    directness: number;
    humor: number;
    pressure: number;
  };
  privacy_level: PrivacyLevel;
  default_view: DefaultView;
  notifications: {
    morning_briefing: boolean;
    evening_review: boolean;
    task_reminders: boolean;
    nudges: boolean;
    celebrations: boolean;
  };
  priority_weights: {
    deadline: number;
    importance: number;
    energy_match: number;
    context: number;
  };
  chronotype: string;
  wake_time: string;
  sleep_time: string;
  work_start_time: string;
  work_end_time: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category: Category;
  is_starred: boolean;
  is_top_three: boolean;
  due_date?: string;
  due_time?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  defer_count: number;
  tags: string[];
  subtasks: Array<{
    id: string;
    title: string;
    done: boolean;
  }>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  target_days: number[];
  current_streak: number;
  best_streak: number;
  total_completions: number;
  is_active: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at: string;
}

interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string;
  mode: FocusMode;
  planned_minutes: number;
  actual_minutes?: number;
  breaks_taken: number;
  end_reason?: EndReason;
  started_at: string;
  ended_at?: string;
}

interface DailyCondition {
  id: string;
  user_id: string;
  log_date: string;
  energy_level?: number;
  mood_level?: number;
  focus_level?: number;
  factors: string[];
  note?: string;
  created_at: string;
  updated_at: string;
}

interface PenguinStatus {
  id: string;
  user_id: string;
  name: string;
  level: number;
  current_xp: number;
  total_xp: number;
  coins: number;
  current_mood: PenguinMood;
  current_outfit?: string;
  unlocked_items: string[];
  achievements: string[];
  last_interaction?: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  user_id: string;
  type: ConversationType;
  context?: string;
  started_at: string;
  ended_at?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  user_id: string;
  google_event_id?: string;
  title: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  location?: string;
  attendee_count: number;
  category: EventCategory;
  importance: ImportanceLevel;
  energy_drain: ImportanceLevel;
  synced_at: string;
}

interface Briefing {
  id: string;
  user_id: string;
  type: BriefingType;
  content: string;
  context_data: Record<string, any>;
  was_read: boolean;
  read_at?: string;
  user_response?: string;
  created_at: string;
}

interface DNAInsight {
  id: string;
  user_id: string;
  insight_type: string;
  insight_data: Record<string, any>;
  confidence: number;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-01-11 | 최초 작성 |
