# 06. 데이터베이스 스키마

> Supabase + 클라이언트 사이드 암호화 구조

---

## 🏗️ 저장소 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase                              │
├─────────────────────┬───────────────────────────────────┤
│  Auth (내장)        │  Database                          │
│  - Google OAuth     │  ┌─────────────┐ ┌──────────────┐ │
│  - 세션 관리        │  │ 평문 테이블  │ │ 암호화 테이블 │ │
│                     │  │ - users     │ │ - tasks_enc  │ │
│                     │  │ - settings  │ │ - calendar   │ │
│                     │  │ - dna       │ │   _cache_enc │ │
│                     │  │ - nudge_log │ └──────────────┘ │
│                     │  └─────────────┘                   │
└─────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 로컬 (IndexedDB)                         │
│  - offline_queue (오프라인 작업 큐)                      │
│  - cache (빠른 로딩용)                                   │
│  - encryption_key (마스터키 - 기기별)                    │
└─────────────────────────────────────────────────────────┘
```

### 설계 원칙

| 원칙 | 설명 |
|------|------|
| **E2E 암호화** | 민감 데이터는 클라이언트에서 암호화 후 저장 |
| **쿼리 가능성** | 날짜, 상태 등 필터 필요한 필드는 평문 유지 |
| **오프라인 우선** | IndexedDB로 즉시 반응, 백그라운드 동기화 |
| **ADHD 친화적** | 사용자에게 저장소 선택 강요 안 함 |

---

## 📋 테이블 상세

### 1. users (평문)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Google 연동
  google_id TEXT UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  
  -- 암호화 키 (서버 저장용 - 기기 분실 대비)
  encrypted_master_key TEXT,  -- 사용자 비밀번호로 암호화된 마스터키
  key_salt TEXT,
  
  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- 구독 (나중에)
  plan TEXT DEFAULT 'free'
);
```

---

### 2. settings (평문)

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 온보딩 답변
  help_type TEXT,  -- 'work_life' | 'habits' | 'emotions' | 'all'
  
  -- 프라이버시 레벨
  privacy_level TEXT DEFAULT 'balanced',  -- 'minimal' | 'balanced' | 'full'
  
  -- 톤 설정
  tone_preset TEXT DEFAULT 'butler',
  -- 'friend' | 'butler' | 'secretary' | 'coach' | 'trainer'
  tone_warmth INT DEFAULT 4,      -- 1-5
  tone_proactivity INT DEFAULT 3,
  tone_directness INT DEFAULT 3,
  tone_humor INT DEFAULT 2,
  tone_pressure INT DEFAULT 2,
  
  -- 상황별 톤 오버라이드
  tone_overrides JSONB DEFAULT '{}',
  /*
    {
      "morning_briefing": "butler",
      "evening_wrapup": "friend",
      "deadline_approaching": "coach",
      "stress_detected": "friend",
      "focus_mode": "secretary"
    }
  */
  
  -- 알림 설정
  notification_enabled BOOLEAN DEFAULT TRUE,
  morning_briefing_time TIME DEFAULT '08:00',
  evening_wrapup_time TIME DEFAULT '21:00',
  
  -- 뷰 설정
  default_view TEXT DEFAULT 'integrated',  -- 'work' | 'life' | 'integrated'
  
  -- 우선순위 가중치
  priority_weights JSONB DEFAULT '{
    "deadline": "high",
    "starred": "high", 
    "waiting": "high",
    "duration": "medium",
    "deferred": "medium",
    "scheduled": "high"
  }',
  
  -- 동기부여 스타일
  motivation_style TEXT DEFAULT 'balanced',  -- 'flow' | 'balanced' | 'gamification'
  
  -- 기타
  duration_preference TEXT DEFAULT 'balanced',  -- 'big_first' | 'small_first' | 'balanced'
  timezone TEXT DEFAULT 'Asia/Seoul',
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

---

### 3. dna_insights (평문 - 패턴만)

```sql
CREATE TABLE dna_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 크로노타입
  chronotype TEXT,  -- 'morning' | 'evening' | 'unknown'
  chronotype_confidence INT,  -- 1-3 (⭐ 수)
  
  -- 에너지 패턴
  energy_pattern JSONB,
  /*
    {
      "early_morning": "low",   // 6-9시
      "late_morning": "medium", // 9-12시
      "early_afternoon": "low", // 12-15시
      "late_afternoon": "high", // 15-18시
      "evening": "medium"       // 18-21시
    }
  */
  peak_hours INT[],  -- [14, 15, 16]
  
  -- 미팅 스트레스
  meeting_stress_threshold INT DEFAULT 3,
  
  -- 요일별 패턴
  busiest_day TEXT,
  lightest_day TEXT,
  day_patterns JSONB,
  /*
    {
      "monday": { "avg_meetings": 3, "avg_tasks_completed": 5 },
      "tuesday": { "avg_meetings": 4, "avg_tasks_completed": 3 },
      ...
    }
  */
  
  -- 워라밸
  work_life_balance TEXT,  -- 'good' | 'moderate' | 'poor'
  
  -- 집중 시간
  focus_hours INT[],
  avg_focus_duration INT,  -- 분 단위
  
  -- 스트레스 레벨 (최근)
  current_stress TEXT,  -- 'low' | 'medium' | 'high'
  stress_signals JSONB,  -- 감지된 신호들
  
  -- 학습 기록
  total_data_days INT DEFAULT 0,
  last_analysis_at TIMESTAMPTZ,
  
  -- 전체 인사이트 (확장용)
  insights JSONB DEFAULT '{}',
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

---

### 4. tasks_encrypted (암호화)

```sql
CREATE TABLE tasks_encrypted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 암호화된 데이터 (AES-256-GCM)
  encrypted_data TEXT NOT NULL,
  /*
    복호화하면:
    {
      "title": "주간보고서 제출",
      "description": "Q4 실적 포함",
      "tags": ["보고서", "팀장"],
      "estimated_minutes": 30,
      "actual_minutes": null,
      "waiting_for": "boss",  // 'external' | 'boss' | 'team' | null
      "waiting_for_name": "김팀장",
      "notes": "..."
    }
  */
  
  -- 검색/필터용 (평문, 민감하지 않음)
  category TEXT,  -- 'work' | 'life'
  status TEXT DEFAULT 'pending',
  -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
  starred BOOLEAN DEFAULT FALSE,
  
  -- 날짜 (평문, 쿼리 필요)
  deadline TIMESTAMPTZ,
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- 우선순위 계산용
  defer_count INT DEFAULT 0,
  priority_score INT,  -- 계산된 점수 캐시
  has_waiting BOOLEAN DEFAULT FALSE,  -- 누군가 기다리는지
  
  -- 시간 추정 (평문, 에너지 매칭용)
  estimated_minutes INT,
  
  -- 반복 설정
  recurrence_rule TEXT,  -- RRULE 형식
  parent_task_id UUID REFERENCES tasks_encrypted(id),
  
  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_tasks_user_status ON tasks_encrypted(user_id, status);
CREATE INDEX idx_tasks_user_category ON tasks_encrypted(user_id, category, status);
CREATE INDEX idx_tasks_scheduled ON tasks_encrypted(user_id, scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_tasks_deadline ON tasks_encrypted(user_id, deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_tasks_starred ON tasks_encrypted(user_id, starred) WHERE starred = TRUE;
```

---

### 5. calendar_cache_encrypted (암호화)

```sql
CREATE TABLE calendar_cache_encrypted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Google Calendar 원본 ID
  google_event_id TEXT,
  google_calendar_id TEXT,
  
  -- 암호화된 데이터
  encrypted_data TEXT NOT NULL,
  /*
    복호화하면:
    {
      "title": "팀 미팅",
      "description": "주간 싱크",
      "location": "회의실 A",
      "attendees": [
        { "email": "kim@...", "name": "김철수" }
      ],
      "meeting_link": "https://meet.google.com/...",
      "organizer": "lee@..."
    }
  */
  
  -- 쿼리용 (평문)
  event_type TEXT,  -- 'meeting' | 'focus' | 'personal' | 'travel' | 'other'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  attendee_count INT DEFAULT 0,  -- 참석자 수 (강도 계산용)
  
  -- 동기화
  etag TEXT,  -- Google 변경 감지용
  last_synced_at TIMESTAMPTZ,
  
  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, google_event_id)
);

-- 인덱스
CREATE INDEX idx_calendar_user_time ON calendar_cache_encrypted(user_id, start_time);
CREATE INDEX idx_calendar_user_date ON calendar_cache_encrypted(user_id, DATE(start_time));
```

---

### 6. nudge_log (평문)

```sql
CREATE TABLE nudge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 넛지 타입
  nudge_type TEXT NOT NULL,
  /*
    'morning_briefing' | 'evening_wrapup' | 
    'meeting_reminder' | 'focus_time' | 
    'neglected_task' | 'overload' | 
    'rest_needed' | 'end_of_work' | 'late_warning'
  */
  
  -- 대상 (있으면)
  target_task_id UUID REFERENCES tasks_encrypted(id) ON DELETE SET NULL,
  target_event_id UUID REFERENCES calendar_cache_encrypted(id) ON DELETE SET NULL,
  
  -- 상태
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  action_taken TEXT,  -- 'dismissed' | 'clicked' | 'snoozed' | 'completed'
  
  -- 분석용 컨텍스트
  context JSONB
  /*
    {
      "tone_used": "butler",
      "energy_level": "low",
      "pending_tasks": 5,
      "meetings_today": 3
    }
  */
);

-- 인덱스 (쿨다운 체크용)
CREATE INDEX idx_nudge_user_type_time ON nudge_log(user_id, nudge_type, sent_at DESC);

-- 오래된 로그 자동 삭제 (30일)
-- Supabase에서 pg_cron으로 설정
```

---

### 7. briefing_history (암호화)

```sql
CREATE TABLE briefing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 타입
  briefing_type TEXT NOT NULL,  -- 'morning' | 'evening' | 'weekly'
  
  -- 암호화된 내용
  content_encrypted TEXT,
  /*
    복호화하면:
    {
      "greeting": "좋은 아침이에요!",
      "summary": "오늘 미팅 3개...",
      "top3": [...],
      "comment": "..."
    }
  */
  
  -- 메타데이터 (평문, 분석용)
  task_count INT,
  meeting_count INT,
  intensity_level TEXT,  -- 'light' | 'normal' | 'heavy' | 'very_heavy'
  tone_used TEXT,
  
  -- 시간
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_briefing_user_type ON briefing_history(user_id, briefing_type, generated_at DESC);
```

---

### 8. habits (암호화)

```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 암호화된 데이터
  encrypted_data TEXT NOT NULL,
  /*
    복호화하면:
    {
      "title": "물 마시기",
      "description": "하루 8잔",
      "icon": "💧",
      "target_count": 8,
      "unit": "잔"
    }
  */
  
  -- 쿼리용 (평문)
  category TEXT,  -- 'health' | 'productivity' | 'mindfulness' | 'social' | 'other'
  frequency TEXT,  -- 'daily' | 'weekly' | 'weekdays' | 'weekends'
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 통계 (평문)
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  
  -- 순서
  sort_order INT DEFAULT 0,
  
  -- 메타
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
```

---

### 9. habit_logs (평문)

```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  log_date DATE NOT NULL,
  completed_count INT DEFAULT 1,
  
  -- 메모 (선택, 암호화 고려)
  note_encrypted TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(habit_id, log_date)
);

-- 인덱스
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, log_date DESC);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, log_date DESC);
```

---

## 🔐 암호화 구현

### 클라이언트 사이드

```typescript
import CryptoJS from 'crypto-js';

class EncryptionService {
  private masterKey: string | null = null;
  
  // 마스터키 생성 (첫 가입 시)
  generateMasterKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // 마스터키 설정
  setMasterKey(key: string) {
    this.masterKey = key;
  }
  
  // 데이터 암호화
  encrypt(data: object): string {
    if (!this.masterKey) throw new Error('Master key not set');
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, this.masterKey).toString();
  }
  
  // 데이터 복호화
  decrypt<T>(encrypted: string): T {
    if (!this.masterKey) throw new Error('Master key not set');
    const bytes = CryptoJS.AES.decrypt(encrypted, this.masterKey);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(json) as T;
  }
  
  // 마스터키를 비밀번호로 암호화 (서버 백업용)
  encryptMasterKey(masterKey: string, password: string): { encrypted: string; salt: string } {
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 10000 });
    const encrypted = CryptoJS.AES.encrypt(masterKey, key.toString()).toString();
    return { encrypted, salt };
  }
}

export const encryption = new EncryptionService();
```

### 사용 예시

```typescript
// 태스크 저장
async function saveTask(task: TaskInput) {
  const sensitiveData = {
    title: task.title,
    description: task.description,
    tags: task.tags,
    notes: task.notes,
    waiting_for: task.waitingFor,
    waiting_for_name: task.waitingForName
  };
  
  const { data, error } = await supabase
    .from('tasks_encrypted')
    .insert({
      user_id: userId,
      encrypted_data: encryption.encrypt(sensitiveData),
      // 평문 필드
      category: task.category,
      status: 'pending',
      deadline: task.deadline,
      scheduled_date: task.scheduledDate,
      starred: task.starred,
      estimated_minutes: task.estimatedMinutes,
      has_waiting: !!task.waitingFor
    });
    
  return data;
}

// 태스크 조회
async function getTasks(filters: TaskFilters) {
  const { data } = await supabase
    .from('tasks_encrypted')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('priority_score', { ascending: false });
  
  // 복호화
  return data?.map(task => ({
    ...task,
    ...encryption.decrypt<TaskSensitiveData>(task.encrypted_data)
  }));
}
```

---

## 📱 로컬 IndexedDB 스키마

```typescript
import Dexie, { Table } from 'dexie';

interface OfflineAction {
  id?: number;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  createdAt: Date;
}

interface CachedTask {
  id: string;
  encrypted_data: string;
  category: string;
  status: string;
  deadline?: Date;
  scheduled_date?: string;
  starred: boolean;
  priority_score?: number;
  updated_at: Date;
}

interface LocalKey {
  userId: string;
  masterKey: string;  // 기기에만 저장
}

class AlfredoDB extends Dexie {
  offlineQueue!: Table<OfflineAction>;
  tasksCache!: Table<CachedTask>;
  calendarCache!: Table<any>;
  settingsCache!: Table<any>;
  keys!: Table<LocalKey>;
  
  constructor() {
    super('alfredo');
    
    this.version(1).stores({
      offlineQueue: '++id, action, table, createdAt',
      tasksCache: 'id, category, status, deadline, scheduled_date, priority_score',
      calendarCache: 'id, start_time',
      settingsCache: 'userId',
      keys: 'userId'
    });
  }
}

export const localDB = new AlfredoDB();
```

---

## 🔄 동기화 플로우

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Client    │      │   Supabase   │      │    Google    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  1. 앱 시작         │                     │
       │  ──────────────────>│                     │
       │     settings 조회   │                     │
       │  <──────────────────│                     │
       │                     │                     │
       │  2. 로컬 캐시 로드   │                     │
       │  (IndexedDB)        │                     │
       │                     │                     │
       │  3. 캘린더 동기화    │                     │
       │  ─────────────────────────────────────────>
       │                Calendar API               │
       │  <─────────────────────────────────────────
       │                     │                     │
       │  4. 캐시 업데이트    │                     │
       │  ──────────────────>│                     │
       │   (암호화된 상태)   │                     │
       │                     │                     │
       │  5. 오프라인 작업   │                     │
       │  (IndexedDB 큐)     │                     │
       │                     │                     │
       │  6. 온라인 복귀     │                     │
       │  ──────────────────>│                     │
       │   큐 처리 & 동기화  │                     │
       │                     │                     │
```

### 오프라인 큐 처리

```typescript
async function processOfflineQueue() {
  const queue = await localDB.offlineQueue.toArray();
  
  for (const action of queue) {
    try {
      switch (action.action) {
        case 'create':
          await supabase.from(action.table).insert(action.data);
          break;
        case 'update':
          await supabase.from(action.table).update(action.data).eq('id', action.data.id);
          break;
        case 'delete':
          await supabase.from(action.table).delete().eq('id', action.data.id);
          break;
      }
      
      // 성공하면 큐에서 제거
      await localDB.offlineQueue.delete(action.id!);
    } catch (error) {
      console.error('Sync failed:', error);
      // 실패하면 큐에 유지, 다음에 재시도
    }
  }
}

// 온라인 상태 감지
window.addEventListener('online', processOfflineQueue);
```

---

## 📊 테이블 요약

| 테이블 | 암호화 | 용도 | 예상 크기/유저 |
|--------|--------|------|---------------|
| users | ❌ | 인증, 기본 정보 | ~1KB |
| settings | ❌ | 앱 설정 | ~2KB |
| dna_insights | ❌ | 학습된 패턴 | ~5KB |
| tasks_encrypted | ✅ | 태스크 | ~50KB/년 |
| calendar_cache_encrypted | ✅ | 캘린더 캐시 | ~30KB/월 |
| nudge_log | ❌ | 알림 기록 | ~10KB/월 |
| briefing_history | ✅ | 브리핑 내용 | ~20KB/월 |
| habits | ✅ | 습관 | ~5KB |
| habit_logs | ❌ | 습관 완료 | ~10KB/년 |

**총 예상**: ~200KB/유저/년
**Supabase 무료 티어 (500MB)**: ~2,500명 수용

---

## 🔒 Row Level Security (RLS)

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_encrypted ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_cache_encrypted ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudge_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 접근 가능
CREATE POLICY "Users can only access own data" ON settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own data" ON tasks_encrypted
  FOR ALL USING (auth.uid() = user_id);

-- (모든 테이블에 동일하게 적용)
```

---

## 🗑️ 데이터 정리 정책

```sql
-- 30일 지난 nudge_log 자동 삭제 (pg_cron)
SELECT cron.schedule(
  'cleanup-nudge-log',
  '0 3 * * *',  -- 매일 새벽 3시
  $$DELETE FROM nudge_log WHERE sent_at < NOW() - INTERVAL '30 days'$$
);

-- 1년 지난 briefing_history 자동 삭제
SELECT cron.schedule(
  'cleanup-briefing-history',
  '0 4 * * 0',  -- 매주 일요일 새벽 4시
  $$DELETE FROM briefing_history WHERE generated_at < NOW() - INTERVAL '1 year'$$
);

-- 완료된 태스크 6개월 후 아카이브 (나중에 구현)
```

---

## 🚀 구현 우선순위

1. **Phase 1**: users, settings, tasks_encrypted (기본 기능)
2. **Phase 2**: calendar_cache_encrypted, dna_insights (DNA 분석)
3. **Phase 3**: nudge_log, briefing_history (브리핑 시스템)
4. **Phase 4**: habits, habit_logs (습관 트래킹)
5. **Phase 5**: 오프라인 동기화, 암호화 백업
