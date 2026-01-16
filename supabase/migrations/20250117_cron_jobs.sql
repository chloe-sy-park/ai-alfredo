-- =============================================
-- Cron Jobs 설정
-- pg_cron과 pg_net을 사용한 Edge Function 스케줄링
-- =============================================

-- pg_cron 확장 활성화 (Supabase에서 기본 제공)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- pg_net 확장 활성화 (HTTP 호출용)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =============================================
-- 환경 설정
-- =============================================

-- 참고: 아래 URL과 시크릿은 Supabase Dashboard에서 실제 값으로 교체 필요
-- SUPABASE_URL: 프로젝트 URL
-- CRON_SECRET: 임의의 보안 토큰 (secrets에 저장)

-- =============================================
-- 아침 브리핑 Cron (매일 6-10시, 30분마다)
-- =============================================

-- 기존 job이 있으면 삭제
SELECT cron.unschedule('morning-briefing-1') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'morning-briefing-1');
SELECT cron.unschedule('morning-briefing-2') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'morning-briefing-2');

-- 6:00, 6:30, 7:00, 7:30, 8:00, 8:30, 9:00, 9:30, 10:00
SELECT cron.schedule(
  'morning-briefing',
  '0,30 6-10 * * *',  -- 6-10시 0분, 30분
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/cron-morning-briefing',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- =============================================
-- 미팅 리마인더 Cron (5분마다)
-- =============================================

SELECT cron.unschedule('meeting-reminders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'meeting-reminders');

SELECT cron.schedule(
  'meeting-reminders',
  '*/5 * * * *',  -- 매 5분
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/cron-meeting-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- =============================================
-- 태스크 마감 리마인더 Cron (매시간)
-- =============================================

SELECT cron.unschedule('task-deadlines') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'task-deadlines');

SELECT cron.schedule(
  'task-deadlines',
  '0 * * * *',  -- 매시간 0분
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/cron-task-deadlines',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- =============================================
-- notification_throttle 테이블 (쓰로틀링 캐시)
-- =============================================

CREATE TABLE IF NOT EXISTS notification_throttle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  target_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_throttle_user_type
  ON notification_throttle(user_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_throttle_sent_at
  ON notification_throttle(sent_at);

-- RLS 정책
ALTER TABLE notification_throttle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for notification_throttle"
  ON notification_throttle
  FOR ALL
  USING (auth.uid() IS NULL); -- 서비스 롤만 접근

-- 오래된 쓰로틀 데이터 자동 정리 (24시간 이상 된 데이터)
SELECT cron.unschedule('cleanup-throttle') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-throttle');

SELECT cron.schedule(
  'cleanup-throttle',
  '0 4 * * *',  -- 매일 새벽 4시
  $$
  DELETE FROM notification_throttle WHERE sent_at < NOW() - INTERVAL '24 hours';
  $$
);

-- =============================================
-- 설정 테이블에 task_reminder 필드 추가
-- =============================================

ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS task_reminders BOOLEAN DEFAULT true;

ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS task_reminder_hours INTEGER[] DEFAULT ARRAY[1, 3, 24];

-- =============================================
-- Supabase Dashboard에서 설정 필요:
-- 1. Settings > Vault에 다음 시크릿 추가:
--    - cron_secret: 임의의 보안 토큰
--
-- 2. Settings > Edge Functions > Secrets에도 추가:
--    - CRON_SECRET: 위와 동일한 값
--    - INTERNAL_SERVICE_KEY: Edge Function 간 통신용 키
--
-- 3. Database > Extensions에서 pg_cron, pg_net 활성화 확인
-- =============================================

-- 설정 값 저장용 (실제 사용 시 Dashboard에서 설정)
-- ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.cron_secret = 'your-cron-secret';

COMMENT ON EXTENSION pg_cron IS 'Cron job scheduler for PostgreSQL';
