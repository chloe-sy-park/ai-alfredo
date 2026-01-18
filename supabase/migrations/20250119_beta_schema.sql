-- Beta Integration Schema
-- Part F: Internal Beta Integration tables

-- ============================================================
-- app_intents: Intent 백업 (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_intent_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  priority TEXT CHECK (priority IN ('critical', 'high', 'normal', 'low')) DEFAULT 'normal',
  received_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_intent_id)
);

CREATE INDEX IF NOT EXISTS idx_app_intents_user_id ON app_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_app_intents_type ON app_intents(type);
CREATE INDEX IF NOT EXISTS idx_app_intents_received_at ON app_intents(received_at);

-- ============================================================
-- sync_checkpoints: 동기화 상태 추적
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  last_intent_id TEXT,
  sync_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

CREATE INDEX IF NOT EXISTS idx_sync_checkpoints_user_id ON sync_checkpoints(user_id);

-- ============================================================
-- app_events: 이벤트 로깅 (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON app_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_events_event_type ON app_events(event_type);
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON app_events(created_at);
CREATE INDEX IF NOT EXISTS idx_app_events_session_id ON app_events(session_id);

-- ============================================================
-- app_errors: 에러 로깅
-- ============================================================
CREATE TABLE IF NOT EXISTS app_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  severity TEXT CHECK (severity IN ('critical', 'error', 'warning', 'info')) DEFAULT 'error',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_errors_user_id ON app_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_app_errors_error_type ON app_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_app_errors_created_at ON app_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_app_errors_severity ON app_errors(severity);

-- ============================================================
-- email_signals: 이메일 신호 (메타데이터만)
-- ============================================================
CREATE TABLE IF NOT EXISTS email_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  thread_id TEXT,
  sender TEXT NOT NULL,
  sender_domain TEXT,
  subject TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  is_unread BOOLEAN DEFAULT true,
  has_attachment BOOLEAN DEFAULT false,
  attachment_types JSONB DEFAULT '[]',
  labels JSONB DEFAULT '[]',
  thread_count INTEGER DEFAULT 1,

  -- 분류 결과
  email_type TEXT CHECK (email_type IN ('A', 'B', 'C', 'D', 'E')) DEFAULT 'C',
  work_score DECIMAL(3,2) DEFAULT 0.5,
  life_score DECIMAL(3,2) DEFAULT 0.5,
  related_meeting_id TEXT,

  -- 메타
  deep_link TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_id)
);

CREATE INDEX IF NOT EXISTS idx_email_signals_user_id ON email_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_email_signals_received_at ON email_signals(received_at);
CREATE INDEX IF NOT EXISTS idx_email_signals_email_type ON email_signals(email_type);
CREATE INDEX IF NOT EXISTS idx_email_signals_thread_id ON email_signals(thread_id);

-- ============================================================
-- sender_weights: 발신자 Work/Life 가중치
-- ============================================================
CREATE TABLE IF NOT EXISTS sender_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  domain TEXT NOT NULL,
  work_score DECIMAL(3,2) DEFAULT 0.5,
  life_score DECIMAL(3,2) DEFAULT 0.5,
  correction_count INTEGER DEFAULT 0,
  last_correction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sender)
);

CREATE INDEX IF NOT EXISTS idx_sender_weights_user_id ON sender_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_sender_weights_domain ON sender_weights(domain);

-- ============================================================
-- RLS Policies
-- ============================================================

-- app_intents RLS
ALTER TABLE app_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intents"
  ON app_intents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intents"
  ON app_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- sync_checkpoints RLS
ALTER TABLE sync_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync checkpoints"
  ON sync_checkpoints FOR ALL
  USING (auth.uid() = user_id);

-- app_events RLS
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON app_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert events"
  ON app_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- app_errors RLS
ALTER TABLE app_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own errors"
  ON app_errors FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert errors"
  ON app_errors FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- email_signals RLS
ALTER TABLE email_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email signals"
  ON email_signals FOR ALL
  USING (auth.uid() = user_id);

-- sender_weights RLS
ALTER TABLE sender_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sender weights"
  ON sender_weights FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Updated_at trigger function (reuse if exists)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_sync_checkpoints_updated_at
  BEFORE UPDATE ON sync_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sender_weights_updated_at
  BEFORE UPDATE ON sender_weights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
