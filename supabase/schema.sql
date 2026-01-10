-- =============================================
-- 알프레도 Supabase 스키마
-- =============================================

-- 사용자 테이블
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  avatar_url text,
  is_onboarded boolean default false,
  
  -- 개인화 설정
  privacy_level text default 'selective' check (privacy_level in ('open_book', 'selective', 'minimal')),
  tone_preset text default 'gentle_friend',
  tone_axes jsonb default '{"warmth": 85, "proactivity": 60, "directness": 40, "humor": 50, "pressure": 20}'::jsonb,
  
  -- 온보딩 데이터
  onboarding_data jsonb default '{}'::jsonb,
  
  -- DNA 데이터 (추론된 인사이트)
  dna_data jsonb default '{}'::jsonb,
  
  -- Google 토큰 (암호화됨)
  google_access_token_encrypted text,
  google_refresh_token_encrypted text,
  google_token_expires_at timestamptz,
  
  -- 타임스탬프
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 태스크 테이블
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done', 'deferred')),
  category text default 'work' check (category in ('work', 'life')),
  
  is_starred boolean default false,
  is_top_three boolean default false,
  
  due_date date,
  due_time time,
  estimated_minutes integer,
  actual_minutes integer,
  defer_count integer default 0,
  
  tags text[] default '{}',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

-- 습관 테이블
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  
  title text not null,
  description text,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  target_days integer[] default '{}', -- 0=일, 1=월, ..., 6=토
  
  streak integer default 0,
  best_streak integer default 0,
  completed_dates date[] default '{}',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 브리핑 히스토리
create table public.briefing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  
  type text not null check (type in ('morning', 'evening', 'nudge', 'weekly')),
  content text not null,
  
  created_at timestamptz default now()
);

-- 캐린더 캐시 (암호화된 필드 포함)
create table public.calendar_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  
  event_id text not null,
  
  -- 평문 메타데이터 (검색/필터링용)
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_all_day boolean default false,
  attendee_count integer default 0,
  category text,
  importance text,
  energy_drain text,
  
  -- 암호화된 제목/장소
  title_encrypted text,
  location_encrypted text,
  
  synced_at timestamptz default now(),
  
  unique(user_id, event_id)
);

-- 알림 설정
create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade unique not null,
  
  enabled boolean default true,
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '07:00',
  
  morning_briefing boolean default true,
  evening_wrapup boolean default true,
  task_reminders boolean default true,
  meeting_reminders boolean default true,
  focus_time_protection boolean default true,
  
  push_subscription jsonb, -- Web Push 구독 정보
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DNA 신호 로그 (분석용)
create table public.dna_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  
  signal_type text not null, -- 'chronotype', 'energy_pattern', 'work_style', etc.
  signal_data jsonb not null,
  confidence_level integer default 1 check (confidence_level between 1 and 3),
  
  created_at timestamptz default now()
);

-- =============================================
-- 인덱스
-- =============================================

create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_category on public.tasks(category);

create index idx_habits_user_id on public.habits(user_id);

create index idx_briefing_history_user_id on public.briefing_history(user_id);
create index idx_briefing_history_type on public.briefing_history(type);

create index idx_calendar_cache_user_id on public.calendar_cache(user_id);
create index idx_calendar_cache_start_time on public.calendar_cache(start_time);

create index idx_dna_signals_user_id on public.dna_signals(user_id);
create index idx_dna_signals_type on public.dna_signals(signal_type);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.briefing_history enable row level security;
alter table public.calendar_cache enable row level security;
alter table public.notification_settings enable row level security;
alter table public.dna_signals enable row level security;

-- 사용자는 자신의 데이터만 접근 가능
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can view own tasks" on public.tasks
  for all using (auth.uid() = user_id);

create policy "Users can view own habits" on public.habits
  for all using (auth.uid() = user_id);

create policy "Users can view own briefings" on public.briefing_history
  for all using (auth.uid() = user_id);

create policy "Users can view own calendar" on public.calendar_cache
  for all using (auth.uid() = user_id);

create policy "Users can view own notifications" on public.notification_settings
  for all using (auth.uid() = user_id);

create policy "Users can view own dna signals" on public.dna_signals
  for all using (auth.uid() = user_id);

-- =============================================
-- 함수
-- =============================================

-- updated_at 자동 업데이트
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
  before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute function update_updated_at_column();

create trigger update_habits_updated_at
  before update on public.habits
  for each row execute function update_updated_at_column();

create trigger update_notification_settings_updated_at
  before update on public.notification_settings
  for each row execute function update_updated_at_column();
