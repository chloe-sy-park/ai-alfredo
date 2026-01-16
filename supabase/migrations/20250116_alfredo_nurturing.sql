-- =============================================
-- 알프레도 육성 시스템 Phase 3 테이블
-- Migration: 20250116_alfredo_nurturing
-- =============================================

-- =============================================
-- 1. 알프레도 선호도 (영역별 스타일 설정)
-- =============================================
create table if not exists public.alfredo_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade unique not null,

  -- 기본 4축 설정 (전역)
  tone_warmth integer default 70 check (tone_warmth between 0 and 100),
  notification_freq integer default 50 check (notification_freq between 0 and 100),
  data_depth integer default 50 check (data_depth between 0 and 100),
  motivation_style integer default 50 check (motivation_style between 0 and 100),

  -- 영역별 오버라이드 설정
  -- { "work": { "tone_warmth": 40, "notification_freq": 70 }, "life": { "tone_warmth": 85 } }
  domain_overrides jsonb default '{}'::jsonb,

  -- 현재 활성 영역
  current_domain text default 'work' check (current_domain in ('work', 'life')),

  -- 자동 영역 전환 설정
  auto_domain_switch boolean default true,
  work_hours_start time default '09:00',
  work_hours_end time default '18:00',
  work_days integer[] default '{1,2,3,4,5}', -- 1=월 ~ 5=금

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 2. 알프레도 학습 기록 (배운 것들)
-- =============================================
create table if not exists public.alfredo_learnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,

  -- 학습 내용
  learning_type text not null check (learning_type in (
    'preference',      -- 선호도 (아침엔 말 걸지 마)
    'pattern',         -- 패턴 (월요일엔 에너지 낮음)
    'feedback',        -- 피드백 기반 (이런 조언 좋았어)
    'correction',      -- 교정 (그건 아니야)
    'context'          -- 맥락 정보 (이번 주 중요한 프로젝트)
  )),

  -- 학습 상세
  category text check (category in ('work', 'life', 'general')),
  summary text not null,           -- "아침 9시 전에는 알림 받기 싫어함"
  original_input text,             -- 원본 사용자 입력
  applied_rules jsonb,             -- 적용된 규칙 JSON

  -- 신뢰도 (피드백으로 조정)
  confidence integer default 50 check (confidence between 0 and 100),
  positive_feedback_count integer default 0,
  negative_feedback_count integer default 0,

  -- 출처
  source text check (source in ('chat', 'feedback', 'onboarding', 'inferred', 'manual')),
  source_message_id uuid,  -- 채팅 메시지 ID 참조

  -- 활성 상태
  is_active boolean default true,
  last_applied_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 3. 알프레도 이해도 (주간 성장 추적)
-- =============================================
create table if not exists public.alfredo_understanding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade unique not null,

  -- 전체 이해도 점수 (0-100)
  understanding_score integer default 10 check (understanding_score between 0 and 100),

  -- 레벨 시스템
  level integer default 1 check (level between 1 and 20),
  title text default '첫 만남',  -- "첫 만남", "알아가는 중", "친해지는 중", "찐친"

  -- 이번 주 배운 것들 (JSON 배열)
  -- [{ "id": "...", "summary": "아침엔 조용히", "learned_at": "2025-01-15" }]
  weekly_learnings jsonb default '[]'::jsonb,

  -- 아직 파악 중인 것들
  -- [{ "topic": "집중 시간대", "progress": 60, "hint": "2주 더 관찰하면 알 것 같아요" }]
  pending_learnings jsonb default '[]'::jsonb,

  -- 영역별 이해도
  work_understanding integer default 10 check (work_understanding between 0 and 100),
  life_understanding integer default 10 check (life_understanding between 0 and 100),

  -- 통계
  total_interactions integer default 0,
  total_learnings integer default 0,
  total_corrections integer default 0,
  days_together integer default 0,

  -- 마지막 주간 리포트
  last_weekly_report_at timestamptz,
  last_weekly_report jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 4. 주간 성장 리포트 히스토리
-- =============================================
create table if not exists public.alfredo_weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,

  -- 리포트 기간
  week_start date not null,
  week_end date not null,

  -- 리포트 내용
  learnings_count integer default 0,
  corrections_count integer default 0,
  understanding_change integer default 0,  -- 점수 변화량

  -- 이번 주 배운 것 요약
  learned_items jsonb default '[]'::jsonb,

  -- 아직 파악 중인 것
  pending_items jsonb default '[]'::jsonb,

  -- 하이라이트 메시지
  highlight_message text,

  created_at timestamptz default now(),

  unique(user_id, week_start)
);

-- =============================================
-- 인덱스
-- =============================================

create index if not exists idx_alfredo_preferences_user on public.alfredo_preferences(user_id);

create index if not exists idx_alfredo_learnings_user on public.alfredo_learnings(user_id);
create index if not exists idx_alfredo_learnings_type on public.alfredo_learnings(learning_type);
create index if not exists idx_alfredo_learnings_category on public.alfredo_learnings(category);
create index if not exists idx_alfredo_learnings_active on public.alfredo_learnings(user_id, is_active) where is_active = true;
create index if not exists idx_alfredo_learnings_confidence on public.alfredo_learnings(confidence desc);

create index if not exists idx_alfredo_understanding_user on public.alfredo_understanding(user_id);
create index if not exists idx_alfredo_understanding_level on public.alfredo_understanding(level);

create index if not exists idx_alfredo_weekly_reports_user on public.alfredo_weekly_reports(user_id);
create index if not exists idx_alfredo_weekly_reports_week on public.alfredo_weekly_reports(week_start);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table public.alfredo_preferences enable row level security;
alter table public.alfredo_learnings enable row level security;
alter table public.alfredo_understanding enable row level security;
alter table public.alfredo_weekly_reports enable row level security;

create policy "Users can manage own alfredo preferences" on public.alfredo_preferences
  for all using (auth.uid() = user_id);

create policy "Users can manage own alfredo learnings" on public.alfredo_learnings
  for all using (auth.uid() = user_id);

create policy "Users can view own alfredo understanding" on public.alfredo_understanding
  for all using (auth.uid() = user_id);

create policy "Users can view own weekly reports" on public.alfredo_weekly_reports
  for all using (auth.uid() = user_id);

-- =============================================
-- Triggers
-- =============================================

create trigger update_alfredo_preferences_updated_at
  before update on public.alfredo_preferences
  for each row execute function update_updated_at_column();

create trigger update_alfredo_learnings_updated_at
  before update on public.alfredo_learnings
  for each row execute function update_updated_at_column();

create trigger update_alfredo_understanding_updated_at
  before update on public.alfredo_understanding
  for each row execute function update_updated_at_column();

-- =============================================
-- 이해도 레벨 계산 함수
-- =============================================

create or replace function calculate_alfredo_level(score integer)
returns table(level integer, title text) as $$
begin
  return query
  select
    case
      when score < 10 then 1
      when score < 20 then 2
      when score < 30 then 3
      when score < 40 then 4
      when score < 50 then 5
      when score < 60 then 6
      when score < 70 then 7
      when score < 80 then 8
      when score < 90 then 9
      else 10
    end as level,
    case
      when score < 10 then '첫 만남'
      when score < 20 then '알아가는 중'
      when score < 30 then '조금씩 친해지는 중'
      when score < 40 then '대화가 편해지는 중'
      when score < 50 then '서로 알아가는 사이'
      when score < 60 then '믿음이 쌓이는 중'
      when score < 70 then '좋은 파트너'
      when score < 80 then '오랜 친구 같은'
      when score < 90 then '찐친'
      else '소울메이트'
    end as title;
end;
$$ language plpgsql immutable;

-- =============================================
-- 이해도 업데이트 트리거
-- =============================================

create or replace function update_understanding_level()
returns trigger as $$
declare
  level_info record;
begin
  -- 이해도 점수에 따른 레벨 계산
  select * into level_info from calculate_alfredo_level(new.understanding_score);

  new.level := level_info.level;
  new.title := level_info.title;

  return new;
end;
$$ language plpgsql;

create trigger update_alfredo_understanding_level
  before insert or update of understanding_score on public.alfredo_understanding
  for each row execute function update_understanding_level();

-- =============================================
-- 학습 추가 시 이해도 자동 업데이트
-- =============================================

create or replace function on_learning_added()
returns trigger as $$
begin
  -- 이해도 테이블 업데이트
  insert into public.alfredo_understanding (user_id, total_learnings)
  values (new.user_id, 1)
  on conflict (user_id) do update set
    total_learnings = alfredo_understanding.total_learnings + 1,
    understanding_score = least(100, alfredo_understanding.understanding_score +
      case new.learning_type
        when 'preference' then 3
        when 'pattern' then 2
        when 'feedback' then 1
        when 'correction' then 2
        when 'context' then 1
        else 1
      end
    ),
    -- 영역별 이해도 업데이트
    work_understanding = case
      when new.category = 'work' then least(100, alfredo_understanding.work_understanding + 2)
      else alfredo_understanding.work_understanding
    end,
    life_understanding = case
      when new.category = 'life' then least(100, alfredo_understanding.life_understanding + 2)
      else alfredo_understanding.life_understanding
    end,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

create trigger on_alfredo_learning_added
  after insert on public.alfredo_learnings
  for each row execute function on_learning_added();
