/**
 * 태스크 마감 리마인더 Cron Job
 * 마감 기한이 가까운 태스크에 대해 알림 발송
 *
 * Cron 스케줄: 0 * * * * (매시간)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

// 리마인더 메시지 템플릿
function getDeadlineMessage(hoursLeft: number, title: string, isTopThree: boolean) {
  if (hoursLeft <= 1) {
    return {
      title: '🐧 마감 1시간 전이에요!',
      body: isTopThree
        ? `Top3 "${title}" 곧 마감이에요. 마무리해볼까요?`
        : `"${title}" 곧 마감! 잊지 않으셨죠?`,
    };
  }
  if (hoursLeft <= 3) {
    return {
      title: '🐧 마감이 얼마 안 남았어요',
      body: `"${title}" 약 ${hoursLeft}시간 남았어요`,
    };
  }
  if (hoursLeft <= 24) {
    return {
      title: '🐧 오늘 마감 태스크 있어요',
      body: `"${title}" 오늘 중으로 완료해야 해요`,
    };
  }
  return {
    title: '🐧 마감 다가오는 중',
    body: `"${title}" 곧 마감이에요`,
  };
}

interface TaskWithDeadline {
  id: string;
  user_id: string;
  title: string;
  deadline_at: string;
  is_top_three: boolean;
}

serve(async (req: Request) => {
  // Cron 시크릿 검증
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();

    // 1시간, 3시간, 24시간 후 시간대 계산
    const checkPoints = [
      { hours: 1, window: 10 }, // 1시간 전, ±5분 윈도우
      { hours: 3, window: 20 }, // 3시간 전, ±10분 윈도우
      { hours: 24, window: 60 }, // 24시간 전, ±30분 윈도우
    ];

    const allTasks: Array<TaskWithDeadline & { hoursLeft: number }> = [];

    for (const checkpoint of checkPoints) {
      const targetTime = new Date(now.getTime() + checkpoint.hours * 60 * 60 * 1000);
      const windowMs = checkpoint.window * 60 * 1000;
      const timeStart = new Date(targetTime.getTime() - windowMs / 2);
      const timeEnd = new Date(targetTime.getTime() + windowMs / 2);

      // 마감이 해당 시간대인 태스크 조회
      const { data: tasks, error } = await supabaseAdmin
        .from('tasks')
        .select('id, user_id, title, deadline_at, is_top_three')
        .in('status', ['todo', 'in_progress'])
        .not('deadline_at', 'is', null)
        .gte('deadline_at', timeStart.toISOString())
        .lte('deadline_at', timeEnd.toISOString());

      if (error) {
        console.error(`Error fetching tasks for ${checkpoint.hours}h:`, error);
        continue;
      }

      for (const task of tasks || []) {
        allTasks.push({
          ...task,
          hoursLeft: checkpoint.hours,
        });
      }
    }

    console.log(`[Task Deadlines] Found ${allTasks.length} tasks with approaching deadlines`);

    const results = [];

    for (const task of allTasks) {
      // 사용자의 알림 설정 확인
      const { data: settings } = await supabaseAdmin
        .from('notification_settings')
        .select('enabled, task_reminders, task_reminder_hours')
        .eq('user_id', task.user_id)
        .single();

      if (!settings?.enabled || !settings?.task_reminders) {
        continue;
      }

      const reminderHours = settings.task_reminder_hours || [1, 3, 24];
      if (!reminderHours.includes(task.hoursLeft)) {
        continue;
      }

      // 이미 이 태스크에 대해 비슷한 시간에 알림 보냈는지 확인
      const recentWindow = task.hoursLeft <= 3 ? 60 : 240; // 1-3시간은 1시간 전, 24시간은 4시간 전
      const { data: alreadySent } = await supabaseAdmin
        .from('notification_history')
        .select('id')
        .eq('user_id', task.user_id)
        .eq('target_task_id', task.id)
        .eq('notification_type', 'task_deadline')
        .gte('sent_at', new Date(now.getTime() - recentWindow * 60 * 1000).toISOString())
        .limit(1);

      if (alreadySent && alreadySent.length > 0) {
        console.log(`[Task Deadlines] Skipping task ${task.id} - already notified recently`);
        continue;
      }

      const message = getDeadlineMessage(task.hoursLeft, task.title, task.is_top_three);

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
              userId: task.user_id,
              type: 'task_deadline',
              title: message.title,
              body: message.body,
              targetTaskId: task.id,
              data: {
                url: `/task/${task.id}`,
                hoursLeft: task.hoursLeft,
                isTopThree: task.is_top_three,
              },
              urgent: task.hoursLeft <= 1,
            }),
          }
        );

        const pushResult = await pushResponse.json();
        results.push({
          taskId: task.id,
          userId: task.user_id,
          hoursLeft: task.hoursLeft,
          sent: pushResult.sent,
        });
      } catch (pushError) {
        console.error(`[Task Deadlines] Push error for task ${task.id}:`, pushError);
        results.push({
          taskId: task.id,
          userId: task.user_id,
          hoursLeft: task.hoursLeft,
          sent: false,
          error: String(pushError),
        });
      }
    }

    const successCount = results.filter((r) => r.sent).length;
    console.log(`[Task Deadlines] Completed: ${successCount}/${results.length} sent`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        sent: successCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Task Deadlines] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
});
