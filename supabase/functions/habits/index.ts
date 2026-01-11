import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

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
    const habitId = pathParts[1];
    const action = pathParts[2]; // /habits/:id/log

    switch (req.method) {
      case 'GET':
        return habitId ? getHabit(userId, habitId) : listHabits(userId);
      case 'POST':
        if (action === 'log' && habitId) {
          return logHabit(userId, habitId, await req.json());
        }
        return createHabit(userId, await req.json());
      case 'PUT':
      case 'PATCH':
        if (!habitId) return errorResponse(ErrorCodes.MISSING_FIELD, 'Habit ID required', 400);
        return updateHabit(userId, habitId, await req.json());
      case 'DELETE':
        if (!habitId) return errorResponse(ErrorCodes.MISSING_FIELD, 'Habit ID required', 400);
        return deleteHabit(userId, habitId);
      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Habits Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// 습관 목록 조회
async function listHabits(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('habits')
    .select(`
      *,
      habit_logs (
        id,
        logged_at,
        completed,
        notes
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // 오늘 날짜 기준으로 완료 여부 계산
  const today = new Date().toISOString().split('T')[0];
  const habitsWithStatus = data?.map(habit => {
    const todayLog = habit.habit_logs?.find(
      (log: any) => log.logged_at.startsWith(today)
    );
    return {
      ...habit,
      completed_today: todayLog?.completed || false,
      today_log: todayLog,
      habit_logs: undefined, // 상세 로그는 제외
    };
  });

  return successResponse(habitsWithStatus);
}

// 단일 습관 조회
async function getHabit(userId: string, habitId: string) {
  const { data, error } = await supabaseAdmin
    .from('habits')
    .select(`
      *,
      habit_logs (
        id,
        logged_at,
        completed,
        notes
      )
    `)
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Habit not found', 404);
  }

  return successResponse(data);
}

// 습관 생성
async function createHabit(userId: string, body: any) {
  const { title, description, category, frequency, target_days, reminder_time } = body;

  if (!title) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'Title is required', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('habits')
    .insert({
      user_id: userId,
      title,
      description,
      category: category || 'other',
      frequency: frequency || 'daily',
      target_days: target_days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      reminder_time,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 201);
}

// 습관 업데이트
async function updateHabit(userId: string, habitId: string, body: any) {
  const updates: any = {};
  const allowedFields = ['title', 'description', 'category', 'frequency', 'target_days', 'reminder_time', 'is_active'];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await supabaseAdmin
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data);
}

// 습관 삭제 (soft delete)
async function deleteHabit(userId: string, habitId: string) {
  const { error } = await supabaseAdmin
    .from('habits')
    .update({ is_active: false })
    .eq('id', habitId)
    .eq('user_id', userId);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({ deleted: true });
}

// 습관 로그 기록
async function logHabit(userId: string, habitId: string, body: any) {
  const { completed = true, notes, logged_at } = body;

  // 습관 소유권 확인
  const { data: habit } = await supabaseAdmin
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (!habit) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Habit not found', 404);
  }

  const logDate = logged_at || new Date().toISOString();
  const dateOnly = logDate.split('T')[0];

  // 오늘 이미 로그가 있는지 확인
  const { data: existingLog } = await supabaseAdmin
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .gte('logged_at', `${dateOnly}T00:00:00`)
    .lt('logged_at', `${dateOnly}T23:59:59`)
    .single();

  let log;
  if (existingLog) {
    // 기존 로그 업데이트
    const { data, error } = await supabaseAdmin
      .from('habit_logs')
      .update({ completed, notes })
      .eq('id', existingLog.id)
      .select()
      .single();

    if (error) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
    }
    log = data;
  } else {
    // 새 로그 생성
    const { data, error } = await supabaseAdmin
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        logged_at: logDate,
        completed,
        notes,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
    }
    log = data;

    // 스트릭 업데이트
    if (completed) {
      await supabaseAdmin
        .from('habits')
        .update({
          current_streak: habit.current_streak + 1,
          best_streak: Math.max(habit.best_streak, habit.current_streak + 1),
        })
        .eq('id', habitId);
    }
  }

  // 완료 시 펭귄 보상
  if (completed && !existingLog?.completed) {
    const { data: penguin } = await supabaseAdmin
      .from('penguin_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (penguin) {
      await supabaseAdmin
        .from('penguin_status')
        .update({
          current_xp: penguin.current_xp + 15,
          coins: penguin.coins + 5,
          happiness: Math.min(100, penguin.happiness + 3),
        })
        .eq('user_id', userId);

      await supabaseAdmin.from('xp_history').insert({
        user_id: userId,
        amount: 15,
        source: 'habit_complete',
        reference_id: habitId,
      });
    }
  }

  return successResponse(log, existingLog ? 200 : 201);
}
