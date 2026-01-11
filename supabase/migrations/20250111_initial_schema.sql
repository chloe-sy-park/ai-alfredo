-- ============================================================
-- 🗄️ 알프레도 Supabase 데이터베이스 마이그레이션
-- ============================================================
-- 버전: v1.0
-- 작성일: 2025-01-11
-- ERD: docs/06-database-schema.md 기반
-- ============================================================

-- ============================================================
-- 0. Extensions & Setup
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUM Types
-- ============================================================

-- 태스크 상태
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'deferred');

-- 카테고리
CREATE TYPE category_type AS ENUM ('work', 'life');

-- 톤 프리셋
CREATE TYPE tone_preset AS ENUM ('gentle_friend', 'mentor', 'ceo', 'cheerleader', 'silent_partner');

-- 프라이버시 레벨
CREATE TYPE privacy_level AS ENUM ('open_book', 'selective', 'minimal');

-- 기본 뷰
CREATE TYPE default_view AS ENUM ('integrated', 'work', 'life');

-- 구독 플랜
CREATE TYPE plan_type AS ENUM ('free', 'premium', 'trial');

-- 구독 상태
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');

-- 결제 제공자
CREATE TYPE payment_provider AS ENUM ('stripe', 'apple', 'google');

-- 습관 빈도
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');

-- 집중 모드
CREATE TYPE focus_mode AS ENUM ('pomodoro', 'flow', 'body_double', 'deep_work');

-- 세션 종료 사유
CREATE TYPE end_reason AS ENUM ('completed', 'interrupted', 'abandoned');

-- 펭귄 기분
CREATE TYPE penguin_mood AS ENUM ('happy', 'excited', 'tired', 'sad', 'proud', 'sleepy');

-- 아이템 카테고리
CREATE TYPE item_category AS ENUM ('hat', 'accessory', 'background', 'effect');

-- 아이템 희귀도
CREATE TYPE item_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- 대화 타입
CREATE TYPE conversation_type AS ENUM ('chat', 'briefing', 'nudge', 'onboarding');

-- 메시지 역할
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- 캘린더 이벤트 카테고리
CREATE TYPE event_category AS ENUM ('meeting', 'focus', 'personal', 'travel', 'meal', 'other');

-- 중요도/에너지 레벨
CREATE TYPE importance_level AS ENUM ('high', 'medium', 'low');

-- 브리핑 타입
CREATE TYPE briefing_type AS ENUM ('morning', 'evening', 'nudge', 'checkin', 'celebration', 'care', 'weekly');

-- 태스크 히스토리 액션
CREATE TYPE task_action AS ENUM ('created', 'updated', 'deferred', 'completed', 'deleted');

-- ============================================================
-- 2. Core Tables
-- ============================================================

-- -----------------------------
-- users: 사용자 기본 정보
-- -----------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    picture TEXT,
    google_id VARCHAR(255) UNIQUE,
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- -----------------------------
-- user_settings: 사용자 설정
-- -----------------------------
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 톤 설정
    tone_preset tone_preset DEFAULT 'gentle_friend' NOT NULL,
    tone_axes JSONB DEFAULT '{"warmth": 4, "proactivity": 3, "directness": 3, "humor": 3, "pressure": 2}' NOT NULL,
    
    -- 프라이버시 & 뷰
    privacy_level privacy_level DEFAULT 'selective' NOT NULL,
    default_view default_view DEFAULT 'integrated' NOT NULL,
    
    -- 알림 설정
    notifications JSONB DEFAULT '{
        "morning_briefing": true,
        "evening_review": true,
        "task_reminders": true,
        "nudges": true,
        "celebrations": true
    }' NOT NULL,
    
    -- 우선순위 가중치
    priority_weights JSONB DEFAULT '{
        "deadline": 0.35,
        "importance": 0.30,
        "energy_match": 0.20,
        "context": 0.15
    }' NOT NULL,
    
    -- 온보딩 데이터
    onboarding_answers JSONB,
    
    -- 크로노타입 & 시간 설정
    chronotype VARCHAR(20) DEFAULT 'morning',
    wake_time TIME DEFAULT '07:00',
    sleep_time TIME DEFAULT '23:00',
    work_start_time TIME DEFAULT '09:00',
    work_end_time TIME DEFAULT '18:00',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- -----------------------------
-- user_subscriptions: 구독 정보
-- -----------------------------
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    plan_type plan_type DEFAULT 'free' NOT NULL,
    status subscription_status DEFAULT 'active' NOT NULL,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    payment_provider payment_provider,
    payment_id VARCHAR(255),
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status, expires_at);

-- ============================================================
-- 3. Tasks Tables
-- ============================================================

-- -----------------------------
-- tasks: 태스크
-- -----------------------------
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    status task_status DEFAULT 'todo' NOT NULL,
    category category_type DEFAULT 'work' NOT NULL,
    
    is_starred BOOLEAN DEFAULT FALSE,
    is_top_three BOOLEAN DEFAULT FALSE,
    
    due_date DATE,
    due_time TIME,
    
    estimated_minutes INT,
    actual_minutes INT,
    
    defer_count INT DEFAULT 0,
    
    tags JSONB DEFAULT '[]',
    subtasks JSONB DEFAULT '[]',
    
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_top_three ON tasks(user_id, is_top_three) WHERE is_top_three = TRUE;

-- -----------------------------
-- task_history: 태스크 변경 이력
-- -----------------------------
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    action task_action NOT NULL,
    old_value JSONB,
    new_value JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_task_history_task ON task_history(task_id, created_at DESC);

-- ============================================================
-- 4. Habits Tables
-- ============================================================

-- -----------------------------
-- habits: 습관 정의
-- -----------------------------
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    frequency habit_frequency DEFAULT 'daily' NOT NULL,
    target_days JSONB DEFAULT '[0,1,2,3,4,5,6]', -- 0=월요일, 6=일요일
    
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 시간 설정 (선택)
    reminder_time TIME,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_habits_user ON habits(user_id, is_active);

-- -----------------------------
-- habit_logs: 습관 기록
-- -----------------------------
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    completed BOOLEAN NOT NULL,
    note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(habit_id, log_date)
);

CREATE INDEX idx_habit_logs_date ON habit_logs(habit_id, log_date DESC);

-- ============================================================
-- 5. Focus Sessions Table
-- ============================================================

CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    mode focus_mode DEFAULT 'pomodoro' NOT NULL,
    
    planned_minutes INT NOT NULL,
    actual_minutes INT,
    
    breaks_taken INT DEFAULT 0,
    
    end_reason end_reason,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id, started_at DESC);

-- ============================================================
-- 6. Daily Conditions Table
-- ============================================================

CREATE TABLE daily_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    mood_level INT CHECK (mood_level BETWEEN 1 AND 5),
    focus_level INT CHECK (focus_level BETWEEN 1 AND 5),
    
    factors JSONB DEFAULT '[]', -- ["good_sleep", "exercise", "stress", ...]
    note TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_conditions_user_date ON daily_conditions(user_id, log_date DESC);

-- ============================================================
-- 7. Penguin (Gamification) Tables
-- ============================================================

-- -----------------------------
-- penguin_items: 아이템 카탈로그 (글로벌)
-- -----------------------------
CREATE TABLE penguin_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id VARCHAR(50) UNIQUE NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    name_ko VARCHAR(100),
    
    category item_category NOT NULL,
    rarity item_rarity DEFAULT 'common' NOT NULL,
    
    price INT NOT NULL DEFAULT 0,
    
    image_url TEXT NOT NULL,
    
    is_default BOOLEAN DEFAULT FALSE,
    
    -- 획득 조건
    unlock_condition JSONB, -- {"type": "level", "value": 5} or {"type": "achievement", "value": "first_week"}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- -----------------------------
-- penguin_status: 펭귄 상태 (사용자별)
-- -----------------------------
CREATE TABLE penguin_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(50) DEFAULT '알프레도',
    
    level INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    
    coins INT DEFAULT 0,
    
    current_mood penguin_mood DEFAULT 'happy',
    current_outfit VARCHAR(50),
    
    unlocked_items JSONB DEFAULT '[]', -- 아이템 ID 배열
    achievements JSONB DEFAULT '[]', -- 업적 ID 배열
    
    last_interaction TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- -----------------------------
-- xp_history: 경험치 히스토리
-- -----------------------------
CREATE TABLE xp_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    penguin_id UUID NOT NULL REFERENCES penguin_status(id) ON DELETE CASCADE,
    
    amount INT NOT NULL, -- 양수: 획득, 음수: 소모
    source VARCHAR(50) NOT NULL, -- task_complete, habit_streak, focus_session, purchase, etc.
    description VARCHAR(200),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_xp_history_penguin ON xp_history(penguin_id, created_at DESC);

-- ============================================================
-- 8. Conversations Tables
-- ============================================================

-- -----------------------------
-- conversations: 대화 세션
-- -----------------------------
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type conversation_type DEFAULT 'chat' NOT NULL,
    context VARCHAR(100), -- morning, evening, task_help, care, etc.
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_conversations_user ON conversations(user_id, started_at DESC);

-- -----------------------------
-- messages: 메시지
-- -----------------------------
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    role message_role NOT NULL,
    content TEXT NOT NULL,
    
    metadata JSONB DEFAULT '{}', -- tokens, model, latency, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- -----------------------------
-- conversation_summaries: 대화 요약
-- -----------------------------
CREATE TABLE conversation_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID UNIQUE NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    summary TEXT NOT NULL,
    
    extracted_tasks JSONB DEFAULT '[]',
    extracted_insights JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 9. Calendar Tables
-- ============================================================

-- -----------------------------
-- calendar_events: 캘린더 이벤트 캐시
-- -----------------------------
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    google_event_id VARCHAR(255) UNIQUE,
    
    title VARCHAR(500) NOT NULL,
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    is_all_day BOOLEAN DEFAULT FALSE,
    
    location TEXT,
    attendee_count INT DEFAULT 0,
    
    category event_category DEFAULT 'other',
    importance importance_level DEFAULT 'medium',
    energy_drain importance_level DEFAULT 'medium',
    
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_calendar_user_time ON calendar_events(user_id, start_time);

-- -----------------------------
-- calendar_insights: DNA 확장 인사이트
-- -----------------------------
CREATE TABLE calendar_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    insight_type VARCHAR(50) NOT NULL, -- chronotype, energy_pattern, work_style, stress_signal, etc.
    insight_data JSONB NOT NULL,
    
    confidence INT CHECK (confidence BETWEEN 1 AND 3), -- 1=⭐, 2=⭐⭐, 3=⭐⭐⭐
    
    is_validated BOOLEAN DEFAULT FALSE, -- 사용자가 "맞아요/아니에요" 응답
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_calendar_insights_user ON calendar_insights(user_id, insight_type);

-- ============================================================
-- 10. Briefings Table
-- ============================================================

CREATE TABLE briefings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type briefing_type NOT NULL,
    content TEXT NOT NULL,
    
    context_data JSONB DEFAULT '{}',
    
    was_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- 사용자 반응 추적
    user_response VARCHAR(50), -- acknowledged, dismissed, snoozed, acted
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_briefings_user ON briefings(user_id, created_at DESC);
CREATE INDEX idx_briefings_unread ON briefings(user_id, was_read) WHERE was_read = FALSE;

-- ============================================================
-- 11. Reports Tables
-- ============================================================

-- -----------------------------
-- daily_summaries: 일일 요약
-- -----------------------------
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    summary_date DATE NOT NULL,
    
    tasks_completed INT DEFAULT 0,
    tasks_deferred INT DEFAULT 0,
    tasks_created INT DEFAULT 0,
    
    focus_minutes INT DEFAULT 0,
    meetings_attended INT DEFAULT 0,
    
    mood_trend JSONB, -- [{"time": "09:00", "level": 4}, ...]
    
    highlights JSONB DEFAULT '[]',
    areas_for_improvement JSONB DEFAULT '[]',
    
    productivity_score INT CHECK (productivity_score BETWEEN 0 AND 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summary_date ON daily_summaries(user_id, summary_date DESC);

-- -----------------------------
-- weekly_insights: 주간 인사이트
-- -----------------------------
CREATE TABLE weekly_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    week_start DATE NOT NULL, -- 항상 월요일
    
    patterns_discovered JSONB DEFAULT '[]',
    correlations JSONB DEFAULT '[]', -- ["운동한 날 생산성 높음", ...]
    recommendations JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    
    overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
    
    -- 통계
    total_tasks_completed INT DEFAULT 0,
    total_focus_minutes INT DEFAULT 0,
    avg_mood DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_weekly_insights_week ON weekly_insights(user_id, week_start DESC);

-- ============================================================
-- 12. Triggers for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_conditions_updated_at BEFORE UPDATE ON daily_conditions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_penguin_status_updated_at BEFORE UPDATE ON penguin_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_insights_updated_at BEFORE UPDATE ON calendar_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 13. Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE penguin_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- users: 자기 자신만 접근
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- user_settings: 자기 설정만 접근
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (user_id = auth.uid());

-- user_subscriptions: 자기 구독만 접근
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- tasks: 자기 태스크만 접근
CREATE POLICY "Users can manage own tasks" ON tasks
    FOR ALL USING (user_id = auth.uid());

-- task_history: 자기 태스크 히스토리만 접근
CREATE POLICY "Users can view own task history" ON task_history
    FOR SELECT USING (
        task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
    );

-- habits: 자기 습관만 접근
CREATE POLICY "Users can manage own habits" ON habits
    FOR ALL USING (user_id = auth.uid());

-- habit_logs: 자기 습관 로그만 접근
CREATE POLICY "Users can manage own habit logs" ON habit_logs
    FOR ALL USING (
        habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
    );

-- focus_sessions: 자기 세션만 접근
CREATE POLICY "Users can manage own focus sessions" ON focus_sessions
    FOR ALL USING (user_id = auth.uid());

-- daily_conditions: 자기 컨디션만 접근
CREATE POLICY "Users can manage own conditions" ON daily_conditions
    FOR ALL USING (user_id = auth.uid());

-- penguin_status: 자기 펭귄만 접근
CREATE POLICY "Users can manage own penguin" ON penguin_status
    FOR ALL USING (user_id = auth.uid());

-- xp_history: 자기 경험치 기록만 접근
CREATE POLICY "Users can view own xp history" ON xp_history
    FOR SELECT USING (
        penguin_id IN (SELECT id FROM penguin_status WHERE user_id = auth.uid())
    );

-- conversations: 자기 대화만 접근
CREATE POLICY "Users can manage own conversations" ON conversations
    FOR ALL USING (user_id = auth.uid());

-- messages: 자기 대화의 메시지만 접근
CREATE POLICY "Users can manage own messages" ON messages
    FOR ALL USING (
        conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    );

-- conversation_summaries: 자기 대화 요약만 접근
CREATE POLICY "Users can view own conversation summaries" ON conversation_summaries
    FOR SELECT USING (
        conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    );

-- calendar_events: 자기 캘린더만 접근
CREATE POLICY "Users can manage own calendar events" ON calendar_events
    FOR ALL USING (user_id = auth.uid());

-- calendar_insights: 자기 인사이트만 접근
CREATE POLICY "Users can manage own calendar insights" ON calendar_insights
    FOR ALL USING (user_id = auth.uid());

-- briefings: 자기 브리핑만 접근
CREATE POLICY "Users can manage own briefings" ON briefings
    FOR ALL USING (user_id = auth.uid());

-- daily_summaries: 자기 일일 요약만 접근
CREATE POLICY "Users can manage own daily summaries" ON daily_summaries
    FOR ALL USING (user_id = auth.uid());

-- weekly_insights: 자기 주간 인사이트만 접근
CREATE POLICY "Users can manage own weekly insights" ON weekly_insights
    FOR ALL USING (user_id = auth.uid());

-- penguin_items: 모든 사용자가 읽기 가능 (글로벌 카탈로그)
ALTER TABLE penguin_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view penguin items" ON penguin_items
    FOR SELECT USING (true);

-- ============================================================
-- 14. Helper Functions
-- ============================================================

-- 레벨업 XP 계산 함수
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INT)
RETURNS INT AS $$
BEGIN
    -- 레벨 1: 100, 레벨 2: 150, 레벨 3: 225... (1.5배씩 증가)
    RETURN FLOOR(100 * POWER(1.5, level - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 스트릭 업데이트 함수
CREATE OR REPLACE FUNCTION update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_habit habits%ROWTYPE;
    v_yesterday_completed BOOLEAN;
BEGIN
    -- 습관 정보 가져오기
    SELECT * INTO v_habit FROM habits WHERE id = NEW.habit_id;
    
    IF NEW.completed THEN
        -- 어제 완료했는지 확인
        SELECT completed INTO v_yesterday_completed
        FROM habit_logs
        WHERE habit_id = NEW.habit_id
          AND log_date = NEW.log_date - INTERVAL '1 day';
        
        IF v_yesterday_completed IS TRUE THEN
            -- 스트릭 증가
            UPDATE habits
            SET current_streak = current_streak + 1,
                best_streak = GREATEST(best_streak, current_streak + 1),
                total_completions = total_completions + 1
            WHERE id = NEW.habit_id;
        ELSE
            -- 새 스트릭 시작
            UPDATE habits
            SET current_streak = 1,
                total_completions = total_completions + 1
            WHERE id = NEW.habit_id;
        END IF;
    ELSE
        -- 스트릭 리셋
        UPDATE habits
        SET current_streak = 0
        WHERE id = NEW.habit_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_habit_streak
    AFTER INSERT ON habit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_habit_streak();

-- ============================================================
-- 15. Initial Data: Penguin Items
-- ============================================================

INSERT INTO penguin_items (item_id, name, name_ko, category, rarity, price, image_url, is_default) VALUES
-- 기본 아이템
('default_look', 'Default Look', '기본 모습', 'background', 'common', 0, '/images/penguin/default.png', true),

-- 모자
('hat_party', 'Party Hat', '파티 모자', 'hat', 'common', 50, '/images/items/hat_party.png', false),
('hat_crown', 'Golden Crown', '황금 왕관', 'hat', 'legendary', 500, '/images/items/hat_crown.png', false),
('hat_chef', 'Chef Hat', '요리사 모자', 'hat', 'rare', 150, '/images/items/hat_chef.png', false),
('hat_graduation', 'Graduation Cap', '학사모', 'hat', 'epic', 300, '/images/items/hat_graduation.png', false),

-- 악세서리
('acc_bowtie', 'Bow Tie', '나비넥타이', 'accessory', 'common', 30, '/images/items/acc_bowtie.png', false),
('acc_glasses', 'Cool Glasses', '멋진 안경', 'accessory', 'common', 40, '/images/items/acc_glasses.png', false),
('acc_scarf', 'Cozy Scarf', '포근한 목도리', 'accessory', 'rare', 100, '/images/items/acc_scarf.png', false),

-- 배경
('bg_office', 'Office', '사무실', 'background', 'common', 100, '/images/bg/office.png', false),
('bg_cafe', 'Cozy Cafe', '아늑한 카페', 'background', 'rare', 200, '/images/bg/cafe.png', false),
('bg_beach', 'Beach', '해변', 'background', 'rare', 200, '/images/bg/beach.png', false),
('bg_space', 'Space Station', '우주정거장', 'background', 'legendary', 500, '/images/bg/space.png', false),

-- 이펙트
('effect_sparkle', 'Sparkle', '반짝반짝', 'effect', 'epic', 250, '/images/effects/sparkle.png', false),
('effect_confetti', 'Confetti', '색종이', 'effect', 'rare', 150, '/images/effects/confetti.png', false);

-- ============================================================
-- 16. Views (Optional, for common queries)
-- ============================================================

-- 오늘의 태스크 뷰
CREATE OR REPLACE VIEW today_tasks AS
SELECT t.*, 
       COALESCE(t.is_top_three, false) as is_priority,
       CASE 
           WHEN t.due_date < CURRENT_DATE THEN 'overdue'
           WHEN t.due_date = CURRENT_DATE THEN 'today'
           ELSE 'future'
       END as due_status
FROM tasks t
WHERE t.due_date <= CURRENT_DATE + INTERVAL '1 day'
  AND t.status != 'done';

-- 주간 생산성 뷰
CREATE OR REPLACE VIEW weekly_productivity AS
SELECT 
    user_id,
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) FILTER (WHERE status = 'done') as completed,
    COUNT(*) FILTER (WHERE status = 'deferred') as deferred,
    COUNT(*) as total,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'done') / NULLIF(COUNT(*), 0), 
        1
    ) as completion_rate
FROM tasks
GROUP BY user_id, DATE_TRUNC('week', created_at);

-- ============================================================
-- 완료!
-- ============================================================

COMMENT ON DATABASE postgres IS 'Alfredo AI Butler Database - v1.0';
