import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

// 모드별 XP 보상
const MODE_XP_MULTIPLIER = {
  pomodoro: 1,
  flow: 1.5,
  body_double: 1.2,
  deep_work: 2,
};

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const userId = user.user_metadata?.user_id;
    if (!userId) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const sessionId = pathParts[1];
    const action = pathParts[2]; // /focus-sessions/:id/end

    switch (req.method) {
      case 'GET':
        return sessionId ? getSession(userId, sessionId) : listSessions(userId, url);
      case 'POST':
        if (action === 'end' && sessionId) {
          return endSession(userId, sessionId, await req.json());
        }
        if (action === 'pause' && sessionId) {
          return pauseSession(userId, sessionId);
        }
        if (action === 'resume' && sessionId) {
          return resumeSession(userId, sessionId);
        }
        return startSession(userId, await req.json());
      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Focus Sessions Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// 세션 목록 조회
async function listSessions(userId: string, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const mode = url.searchParams.get('mode');

  let query = supabaseAdmin
    .from('focus_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (mode) query = query.eq('mode', mode);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 200, {
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > page * limit,
  });
}

// 단일 세션 조회
async function getSession(userId: string, sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('focus_sessions')
    .select(`
      *,
      focus_breaks (*)
    `)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404);
  }

  return successResponse(data);
}

// 세션 시작
async function startSession(userId: string, body: any) {
  const { mode = 'pomodoro', planned_duration, task_id, task_title } = body;

  // 진행 중인 세션이 있는지 확인
  const { data: activeSession } = await supabaseAdmin
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .single();

  if (activeSession) {
    return errorResponse(
      ErrorCodes.ALREADY_EXISTS,
      'An active session already exists',
      400,
      { active_session_id: activeSession.id }
    );
  }

  // 모드별 기본 시간 (분)
  const defaultDurations = {
    pomodoro: 25,
    flow: 90,
    body_double: 50,
    deep_work: 120,
  };

  const duration = planned_duration || defaultDurations[mode as keyof typeof defaultDurations] || 25;

  const { data, error } = await supabaseAdmin
    .from('focus_sessions')
    .insert({
      user_id: userId,
      mode,
      planned_duration: duration,
      task_id,
      task_title,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 201);
}

// 세션 종료
async function endSession(userId: string, sessionId: string, body: any) {
  const { actual_duration, completed = true, notes } = body;

  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (!session) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404);
  }

  if (session.ended_at) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'Session already ended', 400);
  }

  // 실제 소요 시간 계산
  const startedAt = new Date(session.started_at);
  const endedAt = new Date();
  const calculatedDuration = actual_duration || Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  const { data, error } = await supabaseAdmin
    .from('focus_sessions')
    .update({
      ended_at: endedAt.toISOString(),
      actual_duration: calculatedDuration,
      completed,
      notes,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // 완료 시 보상 지급
  let rewards = null;
  if (completed && calculatedDuration >= 5) {
    const multiplier = MODE_XP_MULTIPLIER[session.mode as keyof typeof MODE_XP_MULTIPLIER] || 1;
    const baseXp = Math.min(calculatedDuration * 2, 200); // 분당 2XP, 최대 200
    const xpEarned = Math.round(baseXp * multiplier);
    const coinsEarned = Math.round(calculatedDuration / 5) * 2;

    const { data: penguin } = await supabaseAdmin
      .from('penguin_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (penguin) {
      await supabaseAdmin
        .from('penguin_status')
        .update({
          current_xp: penguin.current_xp + xpEarned,
          coins: penguin.coins + coinsEarned,
          happiness: Math.min(100, penguin.happiness + 5),
        })
        .eq('user_id', userId);

      await supabaseAdmin.from('xp_history').insert({
        user_id: userId,
        amount: xpEarned,
        source: 'focus_session',
        reference_id: sessionId,
      });

      rewards = {
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        duration_minutes: calculatedDuration,
        mode_bonus: multiplier > 1 ? `${multiplier}x` : null,
      };
    }
  }

  return successResponse(rewards ? { session: data, rewards } : data);
}

// 세션 일시정지
async function pauseSession(userId: string, sessionId: string) {
  const { data: session } = await supabaseAdmin
    .from('focus_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (!session) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404);
  }

  // 휴식 시작 기록
  const { data, error } = await supabaseAdmin
    .from('focus_breaks')
    .insert({
      session_id: sessionId,
      break_type: 'pause',
    })
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({ paused: true, break_id: data.id });
}

// 세션 재개
async function resumeSession(userId: string, sessionId: string) {
  // 마지막 휴식 찾기
  const { data: lastBreak } = await supabaseAdmin
    .from('focus_breaks')
    .select('*')
    .eq('session_id', sessionId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastBreak) {
    return errorResponse(ErrorCodes.INVALID_REQUEST, 'No active break found', 400);
  }

  const startedAt = new Date(lastBreak.started_at);
  const endedAt = new Date();
  const duration = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  const { data, error } = await supabaseAdmin
    .from('focus_breaks')
    .update({
      ended_at: endedAt.toISOString(),
      duration,
    })
    .eq('id', lastBreak.id)
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({ resumed: true, break_duration: duration });
}
