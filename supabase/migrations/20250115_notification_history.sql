-- =============================================
-- 알림 히스토리 및 푸시 구독 테이블 추가
-- Migration: 20250115_notification_history
-- =============================================

-- 푸시 구독 테이블 (다중 디바이스 지원)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,

  -- Web Push 구독 정보
  endpoint text not null,
  p256dh text not null,  -- 공개키
  auth text not null,    -- 인증 시크릿

  -- 디바이스 정보
  device_name text,
  user_agent text,

  -- 상태
  is_active boolean default true,
  last_used_at timestamptz,
  failed_count integer default 0,  -- 연속 실패 횟수

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, endpoint)
);

-- 알림 발송 히스토리
create table if not exists public.notification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,

  -- 알림 타입
  notification_type text not null,  -- 'morning_briefing', 'meeting_reminder', etc.

  -- 알림 내용
  title text not null,
  body text not null,
  data jsonb,  -- 추가 데이터 (딥링크 등)

  -- 타겟 (선택적)
  target_task_id uuid references public.tasks(id) on delete set null,
  target_event_id text,  -- calendar event id

  -- 발송 상태
  status text default 'sent' check (status in ('sent', 'delivered', 'clicked', 'dismissed', 'failed')),
  sent_at timestamptz default now(),
  delivered_at timestamptz,
  clicked_at timestamptz,

  -- 액션 추적
  action_taken text,  -- 'clicked', 'dismissed', 'snoozed'

  -- 메타데이터
  subscription_id uuid references public.push_subscriptions(id) on delete set null,
  error_message text,

  created_at timestamptz default now()
);

-- 알림 쓰로틀링 캐시 (최근 알림 추적)
create table if not exists public.notification_throttle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  notification_type text not null,
  target_id text,  -- task_id or event_id

  sent_at timestamptz default now(),

  -- 복합 인덱스로 빠른 조회
  unique(user_id, notification_type, target_id, sent_at)
);

-- =============================================
-- 인덱스
-- =============================================

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);
create index if not exists idx_push_subscriptions_active on public.push_subscriptions(user_id, is_active) where is_active = true;

create index if not exists idx_notification_history_user on public.notification_history(user_id);
create index if not exists idx_notification_history_type on public.notification_history(notification_type);
create index if not exists idx_notification_history_sent on public.notification_history(sent_at);
create index if not exists idx_notification_history_user_type_sent on public.notification_history(user_id, notification_type, sent_at);

create index if not exists idx_notification_throttle_user_type on public.notification_throttle(user_id, notification_type);
create index if not exists idx_notification_throttle_sent on public.notification_throttle(sent_at);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table public.push_subscriptions enable row level security;
alter table public.notification_history enable row level security;
alter table public.notification_throttle enable row level security;

-- 사용자는 자신의 구독만 관리 가능
create policy "Users can manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- 사용자는 자신의 알림 히스토리만 조회 가능
create policy "Users can view own notification history" on public.notification_history
  for select using (auth.uid() = user_id);

-- 쓰로틀링 테이블은 서비스 역할만 접근
create policy "Service role only for throttle" on public.notification_throttle
  for all using (false);  -- 서비스 역할 키로만 접근

-- =============================================
-- Triggers
-- =============================================

create trigger update_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function update_updated_at_column();

-- =============================================
-- 오래된 데이터 정리 함수
-- =============================================

-- 30일 이상 된 throttle 데이터 정리
create or replace function cleanup_old_notification_data()
returns void as $$
begin
  -- 오래된 throttle 데이터 삭제
  delete from public.notification_throttle
  where sent_at < now() - interval '7 days';

  -- 90일 이상 된 notification_history 삭제 (선택적)
  -- delete from public.notification_history
  -- where created_at < now() - interval '90 days';
end;
$$ language plpgsql security definer;

-- =============================================
-- notification_settings 테이블 확장 (넛지 강도 추가)
-- =============================================

-- 넛지 강도 컬럼 추가
alter table public.notification_settings
add column if not exists nudge_intensity text default 'balanced'
check (nudge_intensity in ('minimal', 'balanced', 'proactive'));

-- 미팅 리마인더 시간 설정 추가
alter table public.notification_settings
add column if not exists meeting_reminder_minutes integer[] default '{15, 5}';

-- 아침 브리핑 시간 추가
alter table public.notification_settings
add column if not exists morning_briefing_time time default '08:00';

-- 저녁 마무리 시간 추가
alter table public.notification_settings
add column if not exists evening_wrapup_time time default '18:00';
