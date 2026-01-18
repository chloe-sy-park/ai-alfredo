-- ============================================================
-- Life OS 확장 마이그레이션
-- Migration: 20250118_life_os_tables
-- ============================================================
-- Sleep 추정, Check-in, Travel Mode, Condition 확장
-- 계획 문서: /root/.claude/plans/greedy-waddling-glacier.md
-- ============================================================

-- ============================================================
-- 1. Sleep Records 테이블 (수면 창 추정/정정)
-- ============================================================
CREATE TABLE IF NOT EXISTS sleep_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 날짜 (로컬 기준 YYYY-MM-DD)
    date DATE NOT NULL,

    -- 수면 시간
    bedtime_ts TIMESTAMP WITH TIME ZONE,
    waketime_ts TIMESTAMP WITH TIME ZONE,
    duration_min INTEGER,

    -- 신뢰도 (1=⭐, 2=⭐⭐, 3=⭐⭐⭐)
    confidence_stars SMALLINT CHECK (confidence_stars BETWEEN 1 AND 3),

    -- 데이터 소스
    source TEXT NOT NULL CHECK (source IN ('estimated', 'corrected_by_user', 'imported')),

    -- 추정에 사용된 원시 신호
    raw_signals JSONB DEFAULT '{}'::jsonb,
    -- 예시:
    -- {
    --   "last_session_end": "2024-01-15T01:20:00Z",
    --   "first_session_start": "2024-01-15T07:05:00Z",
    --   "notif_last_response": "2024-01-15T00:45:00Z",
    --   "notif_first_response": "2024-01-15T07:10:00Z",
    --   "device_last_active": null,
    --   "device_first_active": null
    -- }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- 사용자당 날짜별 유니크
    UNIQUE(user_id, date)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_date ON sleep_records(user_id, date DESC);

-- updated_at 트리거
CREATE TRIGGER update_sleep_records_updated_at
    BEFORE UPDATE ON sleep_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. Travel Sessions 테이블 (Travel Mode 상태)
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 여행 기간
    start_date DATE NOT NULL,
    end_date DATE,

    -- 상태
    status TEXT NOT NULL CHECK (status IN ('active', 'ended')) DEFAULT 'active',

    -- Travel Mode 활성화 여부
    mode_enabled BOOLEAN DEFAULT TRUE,

    -- 정책 (필터링 규칙 등)
    policy JSONB DEFAULT '{}'::jsonb,
    -- 예시:
    -- {
    --   "allowMustWorkItems": true,
    --   "hideKPIs": true,
    --   "hideGoals": true,
    --   "energyCap": 2
    -- }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_travel_sessions_user_status ON travel_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_travel_sessions_active ON travel_sessions(user_id) WHERE status = 'active';

-- ============================================================
-- 3. Checkins 테이블 (컨텍스트 신호)
-- ============================================================
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 날짜
    date DATE NOT NULL,

    -- 시간 범위 (선택)
    start_ts TIMESTAMP WITH TIME ZONE,
    end_ts TIMESTAMP WITH TIME ZONE,

    -- 태그: 놀이/여행/사람/휴식/기타
    tag TEXT NOT NULL CHECK (tag IN ('play', 'travel', 'social', 'rest', 'other')),

    -- Travel Session 연결 (선택)
    travel_session_id UUID REFERENCES travel_sessions(id) ON DELETE SET NULL,

    -- 데이터 소스
    source TEXT NOT NULL CHECK (source IN ('user_selected', 'inferred')) DEFAULT 'user_selected',

    -- 신뢰도 (inferred일 경우)
    confidence_stars SMALLINT CHECK (confidence_stars BETWEEN 1 AND 3),

    -- 메모 (선택)
    note TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_tag ON checkins(user_id, tag);

-- ============================================================
-- 4. Daily Conditions 테이블 확장 (Life OS 컬럼 추가)
-- ============================================================

-- state: Condition 상태 (good/ok/low)
ALTER TABLE daily_conditions
    ADD COLUMN IF NOT EXISTS state TEXT CHECK (state IN ('good', 'ok', 'low'));

-- score_internal: 내부 점수 (0-100, UI에 노출 안 함)
ALTER TABLE daily_conditions
    ADD COLUMN IF NOT EXISTS score_internal INTEGER CHECK (score_internal BETWEEN 0 AND 100);

-- energy_curve: 시간대별 에너지 강도 (0-3)
ALTER TABLE daily_conditions
    ADD COLUMN IF NOT EXISTS energy_curve JSONB DEFAULT '{}'::jsonb;
-- 예시:
-- {
--   "8": 3, "9": 3, "10": 3, "11": 2,
--   "12": 2, "13": 2, "14": 2, "15": 1,
--   "16": 1, "17": 1, "18": 1, "19": 0, "20": 0
-- }

-- drivers: Condition에 영향을 준 요인들
ALTER TABLE daily_conditions
    ADD COLUMN IF NOT EXISTS drivers JSONB DEFAULT '{}'::jsonb;
-- 예시:
-- {
--   "sleep_component": 12,
--   "checkin_component": 3,
--   "calendar_component": -3,
--   "sleep_duration_min": 420,
--   "sleep_confidence": 2,
--   "checkin_tags": ["rest"]
-- }

-- sleep_quality 컬럼이 없으면 추가 (기존 스키마 호환)
ALTER TABLE daily_conditions
    ADD COLUMN IF NOT EXISTS sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5);

-- ============================================================
-- 5. Briefing Cache 테이블 (LLM 응답 캐시)
-- ============================================================
CREATE TABLE IF NOT EXISTS briefing_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 캐시 키
    date DATE NOT NULL,
    surface TEXT NOT NULL CHECK (surface IN ('life', 'work', 'travel')),
    inputs_hash VARCHAR(64) NOT NULL,  -- SHA-256

    -- 캐시된 응답
    interpretation TEXT,
    recommendations JSONB DEFAULT '[]'::jsonb,
    relational_line TEXT,

    -- 메타데이터
    generated_count INTEGER DEFAULT 1,  -- 당일 생성 횟수

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- 사용자+날짜+surface별 유니크
    UNIQUE(user_id, date, surface)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_briefing_cache_lookup ON briefing_cache(user_id, date, surface);
CREATE INDEX IF NOT EXISTS idx_briefing_cache_hash ON briefing_cache(inputs_hash);

-- updated_at 트리거
CREATE TRIGGER update_briefing_cache_updated_at
    BEFORE UPDATE ON briefing_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. RLS (Row Level Security)
-- ============================================================
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_cache ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can manage own sleep records" ON sleep_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own travel sessions" ON travel_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checkins" ON checkins
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own briefing cache" ON briefing_cache
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 7. Helper Functions
-- ============================================================

-- Sleep duration 계산 함수 (cross-midnight 지원)
CREATE OR REPLACE FUNCTION calculate_sleep_duration(
    bed TIMESTAMP WITH TIME ZONE,
    wake TIMESTAMP WITH TIME ZONE
) RETURNS INTEGER AS $$
BEGIN
    IF bed IS NULL OR wake IS NULL THEN
        RETURN NULL;
    END IF;

    -- 분 단위 차이 반환
    RETURN EXTRACT(EPOCH FROM (wake - bed)) / 60;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Condition state 결정 함수
CREATE OR REPLACE FUNCTION get_condition_state(score INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF score >= 70 THEN
        RETURN 'good';
    ELSIF score >= 45 THEN
        RETURN 'ok';
    ELSE
        RETURN 'low';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 활성 Travel Session 조회 함수
CREATE OR REPLACE FUNCTION get_active_travel_session(p_user_id UUID)
RETURNS travel_sessions AS $$
DECLARE
    result travel_sessions;
BEGIN
    SELECT * INTO result
    FROM travel_sessions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND mode_enabled = TRUE
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
