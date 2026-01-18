-- ============================================================
-- AlFredo Emotion & Health System v1
-- 감정/건강은 웰빙이 아니라 생산성 제약조건으로 사용
-- ============================================================

-- ============================================================
-- 1. alfredo_user_state (유저당 1행 최신 상태)
-- ============================================================
CREATE TABLE IF NOT EXISTS alfredo_user_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily mode (사용자 선택)
  daily_mode TEXT CHECK (daily_mode IN ('push', 'steady', 'protect')),
  daily_mode_selected_at TIMESTAMPTZ,

  -- Effective mode (계산된 실제 모드)
  effective_mode TEXT NOT NULL DEFAULT 'steady' CHECK (effective_mode IN ('push', 'steady', 'protect')),

  -- Rolling emotional state
  rolling_emotional_level TEXT NOT NULL DEFAULT 'low' CHECK (rolling_emotional_level IN ('low', 'medium', 'high')),
  rolling_emotional_streak INTEGER NOT NULL DEFAULT 0,
  rolling_emotional_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Rolling cognitive state
  rolling_cognitive_level TEXT NOT NULL DEFAULT 'low' CHECK (rolling_cognitive_level IN ('low', 'medium', 'high')),
  rolling_cognitive_streak INTEGER NOT NULL DEFAULT 0,
  rolling_cognitive_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Physical constraint
  physical_constraint_level TEXT NOT NULL DEFAULT 'low' CHECK (physical_constraint_level IN ('low', 'medium', 'high')),
  physical_constraint_reason TEXT,
  physical_constraint_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- People friction
  people_friction_level TEXT NOT NULL DEFAULT 'none' CHECK (people_friction_level IN ('none', 'possible', 'clear')),
  people_friction_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Confirm question rate limit (하루 1회 제한)
  confirm_last_asked_at TIMESTAMPTZ,
  confirm_asked_count_today INTEGER NOT NULL DEFAULT 0,
  confirm_asked_date_key TEXT, -- YYYY-MM-DD

  -- UI Policy (derived)
  ui_max_options INTEGER NOT NULL DEFAULT 3 CHECK (ui_max_options BETWEEN 1 AND 3),
  ui_tone TEXT NOT NULL DEFAULT 'neutral' CHECK (ui_tone IN ('neutral', 'soft', 'protective')),
  ui_suggest_intensity TEXT NOT NULL DEFAULT 'medium' CHECK (ui_suggest_intensity IN ('low', 'medium', 'high')),

  -- Drop-off tracking
  last_dropoff_at TIMESTAMPTZ,
  dropoff_count_week INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE alfredo_user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own state" ON alfredo_user_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own state" ON alfredo_user_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state" ON alfredo_user_state
  FOR UPDATE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_alfredo_user_state_updated ON alfredo_user_state(updated_at);

-- ============================================================
-- 2. alfredo_signal_events (디버깅/개선용, 선택적)
-- ============================================================
CREATE TABLE IF NOT EXISTS alfredo_signal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Signal levels at the time
  emotional_level TEXT CHECK (emotional_level IN ('low', 'medium', 'high')),
  cognitive_level TEXT CHECK (cognitive_level IN ('low', 'medium', 'high')),
  physical_level TEXT CHECK (physical_level IN ('low', 'medium', 'high')),
  people_friction TEXT CHECK (people_friction IN ('none', 'possible', 'clear')),

  -- Brief evidence (12 words max per item, stored as array)
  evidence JSONB DEFAULT '{}',

  -- Context
  trigger_source TEXT CHECK (trigger_source IN ('conversation', 'daily_selection', 'health_input', 'transition')),
  effective_mode_at_time TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE alfredo_signal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON alfredo_signal_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON alfredo_signal_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_alfredo_signal_events_user ON alfredo_signal_events(user_id, created_at DESC);

-- 7일 이상 된 이벤트 자동 삭제 (민감 데이터 최소화)
-- Cron job으로 처리 권장

-- ============================================================
-- 3. alfredo_transition_events (전환 카드 이벤트 추적)
-- ============================================================
CREATE TABLE IF NOT EXISTS alfredo_transition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'transition_card_shown',
    'transition_card_skipped',
    'dropoff_clicked',
    'life_entry_completed'
  )),

  -- Context
  trigger_reason TEXT, -- peopleFriction, emotional_high, cognitive_high, meetingHeavy, protect_mode
  effective_mode TEXT,

  -- Metrics
  dwell_time_seconds INTEGER, -- Life 체류 시간 (life_entry_completed 시)

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE alfredo_transition_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transition events" ON alfredo_transition_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transition events" ON alfredo_transition_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_transition_events_user ON alfredo_transition_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transition_events_type ON alfredo_transition_events(event_type, created_at DESC);

-- ============================================================
-- 4. Helper function: upsert user state
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_alfredo_user_state(
  p_user_id UUID,
  p_daily_mode TEXT DEFAULT NULL,
  p_effective_mode TEXT DEFAULT NULL,
  p_rolling_emotional_level TEXT DEFAULT NULL,
  p_rolling_emotional_streak INTEGER DEFAULT NULL,
  p_rolling_cognitive_level TEXT DEFAULT NULL,
  p_rolling_cognitive_streak INTEGER DEFAULT NULL,
  p_physical_constraint_level TEXT DEFAULT NULL,
  p_physical_constraint_reason TEXT DEFAULT NULL,
  p_people_friction_level TEXT DEFAULT NULL,
  p_ui_max_options INTEGER DEFAULT NULL,
  p_ui_tone TEXT DEFAULT NULL,
  p_ui_suggest_intensity TEXT DEFAULT NULL,
  p_last_dropoff_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS alfredo_user_state
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result alfredo_user_state;
BEGIN
  INSERT INTO alfredo_user_state (
    user_id,
    daily_mode,
    daily_mode_selected_at,
    effective_mode,
    rolling_emotional_level,
    rolling_emotional_streak,
    rolling_emotional_updated_at,
    rolling_cognitive_level,
    rolling_cognitive_streak,
    rolling_cognitive_updated_at,
    physical_constraint_level,
    physical_constraint_reason,
    physical_constraint_updated_at,
    people_friction_level,
    people_friction_updated_at,
    ui_max_options,
    ui_tone,
    ui_suggest_intensity,
    last_dropoff_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_daily_mode,
    CASE WHEN p_daily_mode IS NOT NULL THEN NOW() ELSE NULL END,
    COALESCE(p_effective_mode, 'steady'),
    COALESCE(p_rolling_emotional_level, 'low'),
    COALESCE(p_rolling_emotional_streak, 0),
    NOW(),
    COALESCE(p_rolling_cognitive_level, 'low'),
    COALESCE(p_rolling_cognitive_streak, 0),
    NOW(),
    COALESCE(p_physical_constraint_level, 'low'),
    p_physical_constraint_reason,
    NOW(),
    COALESCE(p_people_friction_level, 'none'),
    NOW(),
    COALESCE(p_ui_max_options, 3),
    COALESCE(p_ui_tone, 'neutral'),
    COALESCE(p_ui_suggest_intensity, 'medium'),
    p_last_dropoff_at,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    daily_mode = COALESCE(p_daily_mode, alfredo_user_state.daily_mode),
    daily_mode_selected_at = CASE
      WHEN p_daily_mode IS NOT NULL THEN NOW()
      ELSE alfredo_user_state.daily_mode_selected_at
    END,
    effective_mode = COALESCE(p_effective_mode, alfredo_user_state.effective_mode),
    rolling_emotional_level = COALESCE(p_rolling_emotional_level, alfredo_user_state.rolling_emotional_level),
    rolling_emotional_streak = COALESCE(p_rolling_emotional_streak, alfredo_user_state.rolling_emotional_streak),
    rolling_emotional_updated_at = CASE
      WHEN p_rolling_emotional_level IS NOT NULL THEN NOW()
      ELSE alfredo_user_state.rolling_emotional_updated_at
    END,
    rolling_cognitive_level = COALESCE(p_rolling_cognitive_level, alfredo_user_state.rolling_cognitive_level),
    rolling_cognitive_streak = COALESCE(p_rolling_cognitive_streak, alfredo_user_state.rolling_cognitive_streak),
    rolling_cognitive_updated_at = CASE
      WHEN p_rolling_cognitive_level IS NOT NULL THEN NOW()
      ELSE alfredo_user_state.rolling_cognitive_updated_at
    END,
    physical_constraint_level = COALESCE(p_physical_constraint_level, alfredo_user_state.physical_constraint_level),
    physical_constraint_reason = COALESCE(p_physical_constraint_reason, alfredo_user_state.physical_constraint_reason),
    physical_constraint_updated_at = CASE
      WHEN p_physical_constraint_level IS NOT NULL THEN NOW()
      ELSE alfredo_user_state.physical_constraint_updated_at
    END,
    people_friction_level = COALESCE(p_people_friction_level, alfredo_user_state.people_friction_level),
    people_friction_updated_at = CASE
      WHEN p_people_friction_level IS NOT NULL THEN NOW()
      ELSE alfredo_user_state.people_friction_updated_at
    END,
    ui_max_options = COALESCE(p_ui_max_options, alfredo_user_state.ui_max_options),
    ui_tone = COALESCE(p_ui_tone, alfredo_user_state.ui_tone),
    ui_suggest_intensity = COALESCE(p_ui_suggest_intensity, alfredo_user_state.ui_suggest_intensity),
    last_dropoff_at = COALESCE(p_last_dropoff_at, alfredo_user_state.last_dropoff_at),
    dropoff_count_week = CASE
      WHEN p_last_dropoff_at IS NOT NULL THEN alfredo_user_state.dropoff_count_week + 1
      ELSE alfredo_user_state.dropoff_count_week
    END,
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 5. Reset daily counters function (cron용)
-- ============================================================
CREATE OR REPLACE FUNCTION reset_daily_confirm_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE alfredo_user_state
  SET
    confirm_asked_count_today = 0,
    confirm_asked_date_key = TO_CHAR(NOW() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD')
  WHERE confirm_asked_date_key IS DISTINCT FROM TO_CHAR(NOW() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD');
END;
$$;

-- ============================================================
-- 6. Weekly dropoff counter reset (cron용)
-- ============================================================
CREATE OR REPLACE FUNCTION reset_weekly_dropoff_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 매주 월요일에 리셋
  IF EXTRACT(DOW FROM NOW() AT TIME ZONE 'Asia/Seoul') = 1 THEN
    UPDATE alfredo_user_state
    SET dropoff_count_week = 0;
  END IF;
END;
$$;
