/**
 * 미팅 리마인더 Cron Job
 * 곧 있을 미팅에 대해 알림 발송 (15분 전, 5분 전)
 *
 * Cron 스케줄: */5 * * * * (5분마다)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

interface MeetingReminder {
  userId: string;
  eventId: string;
  title: string;
  startTime: Date;
  minutesBefore: number;
}

// 리마인더 템플릿
function getReminderMessage(minutesBefore: number, title: string) {
  if (minutesBefore === 15) {
    return {
      title: '🐧 미팅 15분 전이에요',
      body: `"${title}" 준비할 시간! 커피 한 잔 어때요?`,
    };
  }
  if (minutesBefore === 5) {
    return {
      title: '🐧 미팅 5분 남았어요!',
      body: `"${title}" 곧 시작이에요`,
    };
  }
  return {
    title: '🐧 미팅 시작!',
    body: `"${title}" 지금 시작해요`,
  };
}

serve(async (req: Request) => {
  // Cron 시크릿 검증
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();

    // 15분 뒤, 5분 뒤 시간 계산
    const in15min = new Date(now.getTime() + 15 * 60 * 1000);
    const in5min = new Date(now.getTime() + 5 * 60 * 1000);

    // 시간 범위 (±2분)
    const in15minStart = new Date(in15min.getTime() - 2 * 60 * 1000);
    const in15minEnd = new Date(in15min.getTime() + 2 * 60 * 1000);
    const in5minStart = new Date(in5min.getTime() - 2 * 60 * 1000);
    const in5minEnd = new Date(in5min.getTime() + 2 * 60 * 1000);

    console.log(`[Meeting Reminders] Checking for meetings at ${now.toISOString()}`);

    // 15분 뒤 미팅 조회
    const { data: meetings15, error: err15 } = await supabaseAdmin
      .from('calendar_cache')
      .select('user_id, event_id, title_encrypted, start_time')
      .gte('start_time', in15minStart.toISOString())
      .lte('start_time', in15minEnd.toISOString());

    // 5분 뒤 미팅 조회
    const { data: meetings5, error: err5 } = await supabaseAdmin
      .from('calendar_cache')
      .select('user_id, event_id, title_encrypted, start_time')
      .gte('start_time', in5minStart.toISOString())
      .lte('start_time', in5minEnd.toISOString());

    if (err15 || err5) {
      console.error('Error fetching meetings:', err15 || err5);
      return new Response(
        JSON.stringify({ error: (err15 || err5)?.message }),
        { status: 500 }
      );
    }

    const reminders: MeetingReminder[] = [];

    // 15분 전 리마인더
    for (const meeting of meetings15 || []) {
      // 사용자의 알림 설정 확인
      const { data: settings } = await supabaseAdmin
        .from('notification_settings')
        .select('enabled, meeting_reminders, meeting_reminder_minutes')
        .eq('user_id', meeting.user_id)
        .single();

      if (!settings?.enabled || !settings?.meeting_reminders) continue;

      const reminderMinutes = settings.meeting_reminder_minutes || [15, 5];
      if (!reminderMinutes.includes(15)) continue;

      // 이미 이 미팅에 대해 15분 전 알림 보냈는지 확인
      const { data: alreadySent } = await supabaseAdmin
        .from('notification_history')
        .select('id')
        .eq('user_id', meeting.user_id)
        .eq('target_event_id', meeting.event_id)
        .eq('notification_type', 'meeting_reminder')
        .gte('sent_at', new Date(now.getTime() - 20 * 60 * 1000).toISOString())
        .limit(1);

      if (alreadySent && alreadySent.length > 0) continue;

      reminders.push({
        userId: meeting.user_id,
        eventId: meeting.event_id,
        title: meeting.title_encrypted || '미팅', // 암호화된 제목 (실제로는 복호화 필요)
        startTime: new Date(meeting.start_time),
        minutesBefore: 15,
      });
    }

    // 5분 전 리마인더
    for (const meeting of meetings5 || []) {
      const { data: settings } = await supabaseAdmin
        .from('notification_settings')
        .select('enabled, meeting_reminders, meeting_reminder_minutes')
        .eq('user_id', meeting.user_id)
        .single();

      if (!settings?.enabled || !settings?.meeting_reminders) continue;

      const reminderMinutes = settings.meeting_reminder_minutes || [15, 5];
      if (!reminderMinutes.includes(5)) continue;

      // 이미 이 미팅에 대해 5분 전 알림 보냈는지 확인
      const { data: alreadySent } = await supabaseAdmin
        .from('notification_history')
        .select('id')
        .eq('user_id', meeting.user_id)
        .eq('target_event_id', meeting.event_id)
        .eq('notification_type', 'meeting_reminder')
        .gte('sent_at', new Date(now.getTime() - 10 * 60 * 1000).toISOString())
        .limit(1);

      if (alreadySent && alreadySent.length > 0) continue;

      reminders.push({
        userId: meeting.user_id,
        eventId: meeting.event_id,
        title: meeting.title_encrypted || '미팅',
        startTime: new Date(meeting.start_time),
        minutesBefore: 5,
      });
    }

    console.log(`[Meeting Reminders] Found ${reminders.length} reminders to send`);

    const results = [];

    for (const reminder of reminders) {
      const message = getReminderMessage(reminder.minutesBefore, reminder.title);

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
              userId: reminder.userId,
              type: 'meeting_reminder',
              title: message.title,
              body: message.body,
              targetEventId: reminder.eventId,
              data: {
                url: `/calendar?event=${reminder.eventId}`,
                minutesBefore: reminder.minutesBefore,
              },
              urgent: reminder.minutesBefore <= 5,
            }),
          }
        );

        const pushResult = await pushResponse.json();
        results.push({
          userId: reminder.userId,
          eventId: reminder.eventId,
          minutesBefore: reminder.minutesBefore,
          sent: pushResult.sent,
        });
      } catch (pushError) {
        console.error(`[Meeting Reminders] Push error:`, pushError);
        results.push({
          userId: reminder.userId,
          eventId: reminder.eventId,
          minutesBefore: reminder.minutesBefore,
          sent: false,
          error: String(pushError),
        });
      }
    }

    const successCount = results.filter((r) => r.sent).length;
    console.log(`[Meeting Reminders] Completed: ${successCount}/${results.length} sent`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        sent: successCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Meeting Reminders] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
});
