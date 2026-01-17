/**
 * 저녁 마무리 브리핑 Cron Job
 * 사용자 설정 시간에 맞춰 하루 마무리 푸시 알림 발송
 * Claude API를 사용하여 개인화된 저녁 브리핑 생성
 *
 * Cron 스케줄: 0 18-22 * * * (18-22시 매시 정각)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Fallback 저녁 브리핑 템플릿
const EVENING_TEMPLATES = {
  productive: {
    title: '🐧 오늘 정말 잘했어요!',
    body: '{completed_count}개나 완료했어요. 푹 쉬세요 💜',
  },
  normal: {
    title: '🐧 오늘도 수고했어요',
    body: '완료 {completed_count}개, 내일로 {remaining_count}개 넘어가요.',
  },
  tough: {
    title: '🐧 힘든 하루였죠',
    body: '괜찮아요. 내일 다시 시작하면 돼요 🌙',
  },
  light: {
    title: '🐧 여유로운 하루였네요',
    body: '내일을 위해 오늘 일찍 쉬세요.',
  },
};

// 톤 프리셋별 저녁 스타일
const EVENING_TONE_STYLES: Record<string, string> = {
  friendly: '따뜻하고 위로하는 톤으로, 이모지와 함께 공감하며',
  butler: '정중하게 하루를 마무리하며, 내일 준비를 돕는 톤으로',
  secretary: '간결하게 오늘 성과를 정리하고, 내일 일정을 미리보기',
  coach: '긍정적으로 오늘 성과를 칭찬하고, 내일 목표를 제시하며',
  trainer: '객관적으로 오늘을 평가하고, 개선점을 짧게 언급하며',
};

interface EveningBriefingData {
  userId: string;
  completedTasks: number;
  remainingTasks: number;
  completedTaskTitles?: string[];
  tomorrowMeetings?: number;
  tomorrowEvents?: any[];
  tonePreset?: string;
  hadBusyDay?: boolean;
}

// Claude API로 저녁 브리핑 생성
async function generateEveningBriefingWithClaude(data: EveningBriefingData): Promise<{ title: string; body: string }> {
  const toneStyle = EVENING_TONE_STYLES[data.tonePreset || 'butler'] || EVENING_TONE_STYLES.butler;

  const prompt = `당신은 알프레도, ADHD 친화적 AI 버틀러입니다. 사용자의 저녁 마무리 브리핑을 생성하세요.

## 오늘 결과
- 완료한 일: ${data.completedTasks}개
${data.completedTaskTitles?.length ? `- 완료 목록: ${data.completedTaskTitles.slice(0, 3).join(', ')}` : ''}
- 내일로 넘긴 일: ${data.remainingTasks}개
${data.hadBusyDay ? '- 오늘은 바쁜 하루였어요' : ''}

## 내일 미리보기
- 내일 미팅: ${data.tomorrowMeetings || 0}개
${data.tomorrowEvents?.length ? `- 내일 일정: ${data.tomorrowEvents.slice(0, 3).map((e: any) => e.title || e.summary).join(', ')}` : ''}

## 브리핑 스타일
${toneStyle}

## 요구사항
1. title: 한 줄 마무리 인사 (이모지 1개, 15자 이내)
2. body: 오늘 칭찬 + 내일 미리보기 (2-3문장, 50자 이내)
3. ADHD 친화적: 압도하지 않게, 성취 인정, 미완료에 죄책감 주지 않기
4. 미완료가 많아도 절대 비난하지 않고 격려
5. 반드시 JSON 형식으로만 응답

응답 형식:
{"title": "...", "body": "..."}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || '';

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || '🐧 오늘도 수고했어요',
        body: parsed.body || '푹 쉬고 내일 또 함께해요.',
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('[Evening Wrapup] Claude API error:', error);
    return generateFallbackEveningBriefing(data);
  }
}

// Fallback 저녁 브리핑
function generateFallbackEveningBriefing(data: EveningBriefingData): { title: string; body: string } {
  const { completedTasks, remainingTasks } = data;

  let template;
  if (completedTasks >= 5) {
    template = EVENING_TEMPLATES.productive;
  } else if (completedTasks === 0 && remainingTasks === 0) {
    template = EVENING_TEMPLATES.light;
  } else if (completedTasks === 0 && remainingTasks > 0) {
    template = EVENING_TEMPLATES.tough;
  } else {
    template = EVENING_TEMPLATES.normal;
  }

  return {
    title: template.title,
    body: template.body
      .replace('{completed_count}', String(completedTasks))
      .replace('{remaining_count}', String(remainingTasks)),
  };
}

// 메인 저녁 브리핑 생성
async function generateEveningBriefing(data: EveningBriefingData) {
  if (CLAUDE_API_KEY) {
    return generateEveningBriefingWithClaude(data);
  }
  return generateFallbackEveningBriefing(data);
}

serve(async (req: Request) => {
  // Cron 시크릿 검증
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();

    console.log(`[Evening Wrapup] Running at hour: ${currentHour}`);

    // 해당 시간대에 저녁 브리핑 받을 사용자 조회
    const timeStart = `${String(currentHour).padStart(2, '0')}:00`;
    const timeEnd = `${String(currentHour).padStart(2, '0')}:59`;

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('notification_settings')
      .select('user_id, evening_wrapup_time')
      .eq('enabled', true)
      .eq('evening_wrapup', true)
      .gte('evening_wrapup_time', timeStart)
      .lte('evening_wrapup_time', timeEnd);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: settingsError.message }),
        { status: 500 }
      );
    }

    if (!settings || settings.length === 0) {
      console.log('[Evening Wrapup] No users to notify');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No users in this time slot' }),
        { status: 200 }
      );
    }

    // 오늘 이미 저녁 브리핑 받은 사용자 제외
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sentToday } = await supabaseAdmin
      .from('notification_history')
      .select('user_id')
      .eq('notification_type', 'evening_wrapup')
      .gte('sent_at', today.toISOString());

    const sentUserIds = new Set((sentToday || []).map((s) => s.user_id));

    const results = [];

    for (const setting of settings) {
      if (sentUserIds.has(setting.user_id)) {
        console.log(`[Evening Wrapup] Skipping user ${setting.user_id} - already sent today`);
        continue;
      }

      // 오늘 완료한 태스크 조회
      const { data: completedToday, count: completedCount } = await supabaseAdmin
        .from('tasks')
        .select('title', { count: 'exact' })
        .eq('user_id', setting.user_id)
        .eq('status', 'done')
        .gte('completed_at', today.toISOString());

      // 미완료 태스크 조회
      const { count: remainingCount } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', setting.user_id)
        .in('status', ['todo', 'in_progress']);

      // 내일 일정 조회
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const { data: tomorrowEvents, count: tomorrowMeetings } = await supabaseAdmin
        .from('calendar_cache')
        .select('*', { count: 'exact' })
        .eq('user_id', setting.user_id)
        .gte('start_time', tomorrow.toISOString())
        .lte('start_time', tomorrowEnd.toISOString())
        .limit(5);

      // 사용자 설정 조회
      const { data: userSettings } = await supabaseAdmin
        .from('user_settings')
        .select('tone_preset')
        .eq('user_id', setting.user_id)
        .single();

      // 오늘 미팅이 4개 이상이면 바쁜 날로 판단
      const { count: todayMeetings } = await supabaseAdmin
        .from('calendar_cache')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', setting.user_id)
        .gte('start_time', today.toISOString())
        .lte('start_time', new Date().toISOString());

      const briefingData: EveningBriefingData = {
        userId: setting.user_id,
        completedTasks: completedCount || 0,
        remainingTasks: remainingCount || 0,
        completedTaskTitles: completedToday?.map((t: any) => t.title) || [],
        tomorrowMeetings: tomorrowMeetings || 0,
        tomorrowEvents: tomorrowEvents || [],
        tonePreset: userSettings?.tone_preset || 'butler',
        hadBusyDay: (todayMeetings || 0) >= 4,
      };

      const briefing = await generateEveningBriefing(briefingData);

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
              type: 'evening_wrapup',
              title: briefing.title,
              body: briefing.body,
              data: {
                url: '/report',
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
        console.error(`[Evening Wrapup] Push error for user ${setting.user_id}:`, pushError);
        results.push({
          userId: setting.user_id,
          sent: false,
          error: String(pushError),
        });
      }
    }

    const successCount = results.filter((r) => r.sent).length;
    console.log(`[Evening Wrapup] Completed: ${successCount}/${results.length} sent`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        sent: successCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Evening Wrapup] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
});
