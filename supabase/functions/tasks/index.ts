import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

// XP 보상 설정
const XP_REWARDS = {
  low: 10,
  medium: 25,
  high: 50,
  urgent: 75,
};

const COIN_REWARDS = {
  low: 5,
  medium: 10,
  high: 20,
  urgent: 30,
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

    // 사용자 DB ID 가져오기
    const userId = user.user_metadata?.user_id;
    if (!userId) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const taskId = pathParts[1]; // /tasks/:id

    switch (req.method) {
      case 'GET':
        return taskId ? getTask(userId, taskId) : listTasks(userId, url);
      case 'POST':
        return createTask(userId, await req.json());
      case 'PUT':
      case 'PATCH':
        if (!taskId) return errorResponse(ErrorCodes.MISSING_FIELD, 'Task ID required', 400);
        return updateTask(userId, taskId, await req.json());
      case 'DELETE':
        if (!taskId) return errorResponse(ErrorCodes.MISSING_FIELD, 'Task ID required', 400);
        return deleteTask(userId, taskId);
      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Tasks Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// 태스크 목록 조회
async function listTasks(userId: string, url: URL) {
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const priority = url.searchParams.get('priority');
  const isTop3 = url.searchParams.get('is_top3');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let query = supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (priority) query = query.eq('priority', priority);
  if (isTop3 === 'true') query = query.eq('is_top3', true);

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

// 단일 태스크 조회
async function getTask(userId: string, taskId: string) {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Task not found', 404);
  }

  return successResponse(data);
}

// 태스크 생성
async function createTask(userId: string, body: any) {
  const { title, description, category, priority, due_date, estimated_minutes, is_top3 } = body;

  if (!title) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'Title is required', 400);
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      user_id: userId,
      title,
      description,
      category: category || 'inbox',
      priority: priority || 'medium',
      due_date,
      estimated_minutes,
      is_top3: is_top3 || false,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 201);
}

// 태스크 업데이트
async function updateTask(userId: string, taskId: string, body: any) {
  // 기존 태스크 확인
  const { data: existing } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!existing) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Task not found', 404);
  }

  const updates: any = {};
  const allowedFields = ['title', 'description', 'category', 'priority', 'status', 'due_date', 'estimated_minutes', 'actual_minutes', 'is_top3'];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  // 완료 처리 시 보상 지급
  let rewards = null;
  if (body.status === 'done' && existing.status !== 'done') {
    updates.completed_at = new Date().toISOString();

    const priority = existing.priority as keyof typeof XP_REWARDS;
    const xpEarned = XP_REWARDS[priority] || 25;
    const coinsEarned = COIN_REWARDS[priority] || 10;

    // 펭귄 상태 업데이트
    const { data: penguin } = await supabaseAdmin
      .from('penguin_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (penguin) {
      const newXp = penguin.current_xp + xpEarned;
      const newCoins = penguin.coins + coinsEarned;
      let newLevel = penguin.level;
      let xpForNextLevel = penguin.xp_for_next_level;

      // 레벨업 체크
      if (newXp >= xpForNextLevel) {
        newLevel += 1;
        xpForNextLevel = Math.floor(xpForNextLevel * 1.5);
      }

      await supabaseAdmin
        .from('penguin_status')
        .update({
          current_xp: newXp >= xpForNextLevel ? newXp - penguin.xp_for_next_level : newXp,
          xp_for_next_level: xpForNextLevel,
          level: newLevel,
          coins: newCoins,
          happiness: Math.min(100, penguin.happiness + 5),
        })
        .eq('user_id', userId);

      // XP 히스토리 기록
      await supabaseAdmin.from('xp_history').insert({
        user_id: userId,
        amount: xpEarned,
        source: 'task_complete',
        reference_id: taskId,
      });

      rewards = {
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        level_up: newLevel > penguin.level,
        new_level: newLevel,
      };
    }

    // 태스크 히스토리 기록
    await supabaseAdmin.from('task_history').insert({
      task_id: taskId,
      action: 'completed',
      from_status: existing.status,
      to_status: 'done',
    });
  }

  // 미루기 처리
  if (body.status === 'deferred' && existing.status !== 'deferred') {
    updates.defer_count = (existing.defer_count || 0) + 1;

    await supabaseAdmin.from('task_history').insert({
      task_id: taskId,
      action: 'deferred',
      from_status: existing.status,
      to_status: 'deferred',
    });
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(rewards ? { task: data, rewards } : data);
}

// 태스크 삭제
async function deleteTask(userId: string, taskId: string) {
  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({ deleted: true });
}
