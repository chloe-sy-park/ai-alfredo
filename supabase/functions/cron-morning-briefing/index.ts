/**
 * 아침 브리핑 Cron Job
 * 사용자 설정 시간에 맞춰 아침 브리핑 푸시 알림 발송
 * Claude API를 사용하여 개인화된 브리핑 생성
 *
 * Cron 스케줄: 0,30 6-10 * * * (6-10시 30분마다)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Fallback 브리핑 템플릿 (API 실패 시)
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

// 톤 프리셋별 브리핑 스타일
const TONE_STYLES: Record<string, string> = {
  friendly: '친근하고 따뜻한 톤으로, 이모지를 사용하여 공감하듯이',
  butler: '정중하고 균형잡힌 톤으로, 집사처럼 격식있게',
  secretary: '간결하고 효율적으로, 핵심만 담백하게',
  coach: '에너지 넘치고 동기부여하는 톤으로, 열정적으로',
  trainer: '직설적이고 도전적인 톤으로, 압박감 있게',
};

interface UserBriefingData {
  userId: string;
  taskCount: number;
  meetingCount: number;
  topTask?: string;
  topTasks?: string[];
  calendarEvents?: any[];
  tonePreset?: string;
  dnaProfile?: {
    chronotype?: string;
    peakHours?: number[];
    stressLevel?: string;
  };
  recentCondition?: string;
}

// Claude API로 브리핑 생성
async function generateBriefingWithClaude(data: UserBriefingData): Promise<{ title: string; body: string }> {
  const toneStyle = TONE_STYLES[data.tonePreset || 'butler'] || TONE_STYLES.butler;

  const prompt = `당신은 알프레도, ADHD 친화적 AI 버틀러입니다. 사용자의 아침 브리핑 메시지를 생성하세요.

## 오늘 상황
- 할 일: ${data.taskCount}개
- 미팅: ${data.meetingCount}개
- Top 3 태스크: ${data.topTasks?.join(', ') || data.topTask || '없음'}
${data.calendarEvents?.length ? `- 오늘 일정: ${data.calendarEvents.slice(0, 5).map((e: any) => e.title || e.summary).join(', ')}` : ''}
${data.dnaProfile?.chronotype ? `- 사용자 크로노타입: ${data.dnaProfile.chronotype}` : ''}
${data.dnaProfile?.peakHours?.length ? `- 피크 시간대: ${data.dnaProfile.peakHours.join(', ')}시` : ''}
${data.recentCondition ? `- 최근 컨디션: ${data.recentCondition}` : ''}

## 브리핑 스타일
${toneStyle}

## 요구사항
1. title: 한 줄 인사 (이모지 1개 포함, 15자 이내)
2. body: 오늘 핵심 메시지 (2-3문장, 50자 이내)
3. ADHD 친화적: 압도하지 않게, 핵심만, 긍정적으로
4. 반드시 JSON 형식으로만 응답

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
        title: parsed.title || '🐧 좋은 아침이에요!',
        body: parsed.body || '오늘도 함께해요.',
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('[Morning Briefing] Claude API error:', error);
    // Fallback to template-based briefing
    return generateFallbackBriefing(data);
  }
}

// Fallback 브리핑 (템플릿 기반)
function generateFallbackBriefing(data: UserBriefingData): { title: string; body: string } {
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

// 메인 브리핑 생성 함수
async function generateBriefing(data: UserBriefingData) {
  // Claude API가 설정되어 있으면 사용
  if (CLAUDE_API_KEY) {
    return generateBriefingWithClaude(data);
  }
  // 아니면 Fallback
  return generateFallbackBriefing(data);
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

      const { data: calendarEvents, count: meetingCount } = await supabaseAdmin
        .from('calendar_cache')
        .select('*', { count: 'exact' })
        .eq('user_id', setting.user_id)
        .gte('start_time', today.toISOString())
        .lte('start_time', todayEnd.toISOString())
        .limit(10);

      // Top 3 태스크 조회
      const { data: topTasks } = await supabaseAdmin
        .from('tasks')
        .select('title')
        .eq('user_id', setting.user_id)
        .eq('is_top_three', true)
        .eq('status', 'todo')
        .limit(3);

      // 사용자 설정 (톤 프리셋) 조회
      const { data: userSettings } = await supabaseAdmin
        .from('user_settings')
        .select('tone_preset, preferences')
        .eq('user_id', setting.user_id)
        .single();

      // DNA 프로필 조회 (calendar_insights에서)
      const { data: dnaInsights } = await supabaseAdmin
        .from('calendar_insights')
        .select('chronotype, peak_hours, stress_indicators')
        .eq('user_id', setting.user_id)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .single();

      // 최근 컨디션 조회
      const { data: recentCondition } = await supabaseAdmin
        .from('daily_conditions')
        .select('energy_level, mood_level, focus_level')
        .eq('user_id', setting.user_id)
        .order('log_date', { ascending: false })
        .limit(1)
        .single();

      // 컨디션 레벨 결정
      let conditionLevel = 'normal';
      if (recentCondition) {
        const avg = (recentCondition.energy_level + recentCondition.mood_level + recentCondition.focus_level) / 3;
        if (avg >= 4) conditionLevel = 'great';
        else if (avg >= 3) conditionLevel = 'good';
        else if (avg >= 2) conditionLevel = 'normal';
        else conditionLevel = 'bad';
      }

      const briefingData: UserBriefingData = {
        userId: setting.user_id,
        taskCount: taskCount || 0,
        meetingCount: meetingCount || 0,
        topTask: topTasks?.[0]?.title,
        topTasks: topTasks?.map((t: any) => t.title) || [],
        calendarEvents: calendarEvents || [],
        tonePreset: userSettings?.tone_preset || 'butler',
        dnaProfile: dnaInsights ? {
          chronotype: dnaInsights.chronotype,
          peakHours: dnaInsights.peak_hours,
          stressLevel: dnaInsights.stress_indicators?.level,
        } : undefined,
        recentCondition: conditionLevel,
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
