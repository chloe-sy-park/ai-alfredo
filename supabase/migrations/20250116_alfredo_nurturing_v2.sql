-- =============================================
-- 알프레도 육성 시스템 Phase 3 테이블 (수정본)
-- Migration: 20250116_alfredo_nurturing_v2
-- =============================================
-- 기존 user_settings 확장 + 새 테이블 3개

-- =============================================
-- 1. 기존 user_settings 테이블 확장
-- =============================================

-- 영역별 오버라이드 설정
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS domain_overrides JSONB DEFAULT '{}'::jsonb;

-- 현재 활성 영역
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS current_domain TEXT DEFAULT 'work'
CHECK (current_domain IN ('work', 'life'));

-- 자동 영역 전환 설정
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS auto_domain_switch BOOLEAN DEFAULT true;

-- 근무 요일 (1=월 ~ 7=일)
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS work_days INTEGER[] DEFAULT '{1,2,3,4,5}';

-- =============================================
-- 2. 알프레도 학습 기록 (배운 것들)
-- =============================================
CREATE TABLE IF NOT EXISTS alfredo_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- 학습 내용
  learning_type TEXT NOT NULL CHECK (learning_type IN (
    'preference',      -- 선호도 (아침엔 말 걸지 마)
    'pattern',         -- 패턴 (월요일엔 에너지 낮음)
    'feedback',        -- 피드백 기반 (이런 조언 좋았어)
    'correction',      -- 교정 (그건 아니야)
    'context'          -- 맥락 정보 (이번 주 중요한 프로젝트)
  )),

  -- 학습 상세
  category TEXT CHECK (category IN ('work', 'life', 'general')),
  summary TEXT NOT NULL,
  original_input TEXT,
  applied_rules JSONB,

  -- 신뢰도 (피드백으로 조정)
  confidence INTEGER DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
  positive_feedback_count INTEGER DEFAULT 0,
  negative_feedback_count INTEGER DEFAULT 0,

  -- 출처
  source TEXT CHECK (source IN ('chat', 'feedback', 'onboarding', 'inferred', 'manual')),
  source_message_id UUID,

  -- 활성 상태
  is_active BOOLEAN DEFAULT true,
  last_applied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. 알프레도 이해도 (주간 성장 추적)
-- =============================================
CREATE TABLE IF NOT EXISTS alfredo_understanding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- 전체 이해도 점수 (0-100)
  understanding_score INTEGER DEFAULT 10 CHECK (understanding_score BETWEEN 0 AND 100),

  -- 레벨 시스템
  level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 20),
  title TEXT DEFAULT '첫 만남',

  -- 이번 주 배운 것들 (JSON 배열)
  weekly_learnings JSONB DEFAULT '[]'::jsonb,

  -- 아직 파악 중인 것들
  pending_learnings JSONB DEFAULT '[]'::jsonb,

  -- 영역별 이해도
  work_understanding INTEGER DEFAULT 10 CHECK (work_understanding BETWEEN 0 AND 100),
  life_understanding INTEGER DEFAULT 10 CHECK (life_understanding BETWEEN 0 AND 100),

  -- 통계
  total_interactions INTEGER DEFAULT 0,
  total_learnings INTEGER DEFAULT 0,
  total_corrections INTEGER DEFAULT 0,
  days_together INTEGER DEFAULT 1,

  -- 마지막 주간 리포트
  last_weekly_report_at TIMESTAMPTZ,
  last_weekly_report JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. 주간 성장 리포트 히스토리
-- =============================================
CREATE TABLE IF NOT EXISTS alfredo_weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- 리포트 기간
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- 리포트 내용
  learnings_count INTEGER DEFAULT 0,
  corrections_count INTEGER DEFAULT 0,
  understanding_change INTEGER DEFAULT 0,

  -- 이번 주 배운 것 요약
  learned_items JSONB DEFAULT '[]'::jsonb,

  -- 아직 파악 중인 것
  pending_items JSONB DEFAULT '[]'::jsonb,

  -- 하이라이트 메시지
  highlight_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, week_start)
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX IF NOT EXISTS idx_alfredo_learnings_user ON alfredo_learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_alfredo_learnings_type ON alfredo_learnings(learning_type);
CREATE INDEX IF NOT EXISTS idx_alfredo_learnings_active ON alfredo_learnings(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_alfredo_understanding_user ON alfredo_understanding(user_id);

CREATE INDEX IF NOT EXISTS idx_alfredo_weekly_reports_user ON alfredo_weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_alfredo_weekly_reports_week ON alfredo_weekly_reports(week_start);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE alfredo_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alfredo_understanding ENABLE ROW LEVEL SECURITY;
ALTER TABLE alfredo_weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alfredo learnings" ON alfredo_learnings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alfredo understanding" ON alfredo_understanding
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weekly reports" ON alfredo_weekly_reports
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Triggers
-- =============================================
CREATE TRIGGER update_alfredo_learnings_updated_at
  BEFORE UPDATE ON alfredo_learnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alfredo_understanding_updated_at
  BEFORE UPDATE ON alfredo_understanding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 이해도 레벨 계산 함수
-- =============================================
CREATE OR REPLACE FUNCTION calculate_alfredo_level(score INTEGER)
RETURNS TABLE(level INTEGER, title TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN score < 10 THEN 1
      WHEN score < 20 THEN 2
      WHEN score < 30 THEN 3
      WHEN score < 40 THEN 4
      WHEN score < 50 THEN 5
      WHEN score < 60 THEN 6
      WHEN score < 70 THEN 7
      WHEN score < 80 THEN 8
      WHEN score < 90 THEN 9
      ELSE 10
    END AS level,
    CASE
      WHEN score < 10 THEN '첫 만남'
      WHEN score < 20 THEN '알아가는 중'
      WHEN score < 30 THEN '조금씩 친해지는 중'
      WHEN score < 40 THEN '대화가 편해지는 중'
      WHEN score < 50 THEN '서로 알아가는 사이'
      WHEN score < 60 THEN '믿음이 쌓이는 중'
      WHEN score < 70 THEN '좋은 파트너'
      WHEN score < 80 THEN '오랜 친구 같은'
      WHEN score < 90 THEN '찐친'
      ELSE '소울메이트'
    END AS title;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 학습 피드백 RPC 함수
-- =============================================
CREATE OR REPLACE FUNCTION increment_learning_feedback(
  learning_id UUID,
  is_positive BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF is_positive THEN
    UPDATE alfredo_learnings
    SET
      positive_feedback_count = positive_feedback_count + 1,
      confidence = LEAST(100, confidence + 5),
      updated_at = NOW()
    WHERE id = learning_id;
  ELSE
    UPDATE alfredo_learnings
    SET
      negative_feedback_count = negative_feedback_count + 1,
      confidence = GREATEST(0, confidence - 10),
      is_active = CASE WHEN confidence - 10 < 20 THEN false ELSE is_active END,
      updated_at = NOW()
    WHERE id = learning_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
