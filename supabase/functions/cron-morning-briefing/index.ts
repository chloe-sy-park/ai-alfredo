/**
 * 아침 브리핑 Cron Job
 * 사용자 설정 시간에 맞춰 아침 브리핑 푸시 알림 발송
 *
 * Cron 스케줄: 0,30 6-10 * * * (6-10시 30분마다)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

// 브리핑 템플릿
const BRIEFING_TEMPLATES = {
  light: {
    title: '🐧 좋은 아침이에요!',
    body: '오늘은 여유로운 하루예요. {top_task}부터 천천히 해볼까요?',
  },
  normal: {
    title: '🐧 좋은 아침이에요!',
    body: '오늘 할 일 {task_count}개, 미팅 {meeting_count}개 있어요.',
  },
  heavy: {
    title: '🐧 오늘 좀 바빠요!',
    body: '미팅 {meeting_count}개... 힘내요 💪',
  },
  very_heavy: {
    title: '🐧 오늘 정말 빡빡해요',
    body: '미팅 {meeting_count}개에 할 일도 많아요. 가장 중요한 것부터 해봐요.',
  },
};

interface UserBriefingData {
  userId: string;
  taskCount: number;
  meetingCount: number;
  topTask?: string;
}

async function generateBriefing(data: UserBriefingData) {
  const { taskCount, meetingCount, topTask } = data;

  let template;
  if (meetingCount >= 6) {
    template = BRIEFING_TEMPLATES.very_heavy;
  } else if (meetingCount >= 4 || taskCount >= 8) {
    template = BRIEFING_TEMPLATES.heavy;
  } else if (meetingCount === 0 && taskCount <= 3) {
    template = BRIEFING_TEMPLATES.light;
  } else {
    template = BRIEFING_TEMPLATES.normal;
  }

  return {
    title: template.title,
    body: template.body
      .replace('{task_count}', String(taskCount))
      .replace('{meeting_count}', String(meetingCount))
      .replace('{top_task}', topTask || '첫 번째 할 일'),
  };
}

serve(async (req: Request) => {
  // Cron 시크릿 검증 (Supabase Cron 또는 외부 스케줄러)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 현재 시간 범위 설정 (±15분)
    const timeStart = `${String(currentHour).padStart(2, '0')}:${String(Math.max(0, currentMinute - 15)).padStart(2, '0')}`;
    const timeEnd = `${String(currentHour).padStart(2, '0')}:${String(Math.min(59, currentMinute + 15)).padStart(2, '0')}`;

    console.log(`[Morning Briefing] Running for time range: ${timeStart} - ${timeEnd}`);

    // 해당 시간대에 브리핑 받을 사용자 조회
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('notification_settings')
      .select('user_id, morning_briefing_time')
      .eq('enabled', true)
      .eq('morning_briefing', true)
      .gte('morning_briefing_time', timeStart)
      .lte('morning_briefing_time', timeEnd);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: settingsError.message }),
        { status: 500 }
      );
    }

    if (!settings || settings.length === 0) {
      console.log('[Morning Briefing] No users to notify');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No users in this time slot' }),
        { status: 200 }
      );
    }

    console.log(`[Morning Briefing] Processing ${settings.length} users`);

    // 오늘 이미 브리핑 받은 사용자 제외
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sentToday } = await supabaseAdmin
      .from('notification_history')
      .select('user_id')
      .eq('notification_type', 'morning_briefing')
      .gte('sent_at', today.toISOString());

    const sentUserIds = new Set((sentToday || []).map((s) => s.user_id));

    const results = [];

    for (const setting of settings) {
      // 이미 오늘 브리핑 받았으면 스킵
      if (sentUserIds.has(setting.user_id)) {
        console.log(`[Morning Briefing] Skipping user ${setting.user_id} - already sent today`);
        continue;
      }

      // 사용자의 태스크 수 조회
      const { count: taskCount } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', setting.user_id)
        .in('status', ['todo', 'in_progress']);

      // 오늘 미팅 수 조회
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const { count: meetingCount } = await supabaseAdmin
        .from('calendar_cache')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', setting.user_id)
        .gte('start_time', today.toISOString())
        .lte('start_time', todayEnd.toISOString());

      // Top 3 태스크 조회
      const { data: topTasks } = await supabaseAdmin
        .from('tasks')
        .select('title')
        .eq('user_id', setting.user_id)
        .eq('is_top_three', true)
        .eq('status', 'todo')
        .limit(1);

      const briefingData: UserBriefingData = {
        userId: setting.user_id,
        taskCount: taskCount || 0,
        meetingCount: meetingCount || 0,
        topTask: topTasks?.[0]?.title,
      };

      const briefing = await generateBriefing(briefingData);

      // push-send 함수 호출
      try {
        const pushResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/push-send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Key': Deno.env.get('INTERNAL_SERVICE_KEY') || '',
            },
            body: JSON.stringify({
              userId: setting.user_id,
              type: 'morning_briefing',
              title: briefing.title,
              body: briefing.body,
              data: {
                url: '/briefing',
              },
            }),
          }
        );

        const pushResult = await pushResponse.json();
        results.push({
          userId: setting.user_id,
          sent: pushResult.sent,
          reason: pushResult.reason,
        });
      } catch (pushError) {
        console.error(`[Morning Briefing] Push error for user ${setting.user_id}:`, pushError);
        results.push({
          userId: setting.user_id,
          sent: false,
          error: String(pushError),
        });
      }
    }

    const successCount = results.filter((r) => r.sent).length;
    console.log(`[Morning Briefing] Completed: ${successCount}/${results.length} sent`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        sent: successCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Morning Briefing] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
});
