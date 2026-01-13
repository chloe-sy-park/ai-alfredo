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
    // /daily-conditions, /daily-conditions/today, /daily-conditions/:date, /daily-conditions/summary/weekly, etc.
    const segment1 = pathParts[1]; // 'today', ':date', 'summary', or ':id'
    const segment2 = pathParts[2]; // 'weekly', 'monthly', etc.

    switch (req.method) {
      case 'GET':
        if (segment1 === 'today') {
          return getTodayCondition(userId);
        }
        if (segment1 === 'summary' && segment2 === 'weekly') {
          return getWeeklySummary(userId);
        }
        if (segment1 === 'heatmap' && segment2 === 'monthly') {
          const year = url.searchParams.get('year');
          const month = url.searchParams.get('month');
          return getMonthlyHeatmap(userId, year, month);
        }
        if (segment1 && isDateFormat(segment1)) {
          return getByDate(userId, segment1);
        }
        // List with optional params
        return listConditions(userId, url.searchParams);

      case 'POST':
        return recordCondition(userId, await req.json());

      case 'PUT':
      case 'PATCH':
        if (!segment1) return errorResponse(ErrorCodes.MISSING_FIELD, 'Condition ID required', 400);
        return updateCondition(userId, segment1, await req.json());

      case 'DELETE':
        if (!segment1) return errorResponse(ErrorCodes.MISSING_FIELD, 'Condition ID required', 400);
        return deleteCondition(userId, segment1);

      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Daily Conditions Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// Helper: Check if string is YYYY-MM-DD format
function isDateFormat(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

// Helper: Get today's date in YYYY-MM-DD
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// 컨디션 목록 조회
async function listConditions(userId: string, params: URLSearchParams) {
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');
  const limit = parseInt(params.get('limit') || '30', 10);
  const offset = parseInt(params.get('offset') || '0', 10);

  let query = supabaseAdmin
    .from('daily_conditions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) {
    query = query.gte('log_date', startDate);
  }
  if (endDate) {
    query = query.lte('log_date', endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 200, {
    total: count || 0,
    limit,
    page: Math.floor(offset / limit) + 1,
    hasMore: (count || 0) > offset + limit,
  });
}

// 오늘 컨디션 조회
async function getTodayCondition(userId: string) {
  const today = getTodayDateString();

  const { data, error } = await supabaseAdmin
    .from('daily_conditions')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', today)
    .maybeSingle();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // 오늘 기록이 없으면 빈 객체 반환
  return successResponse(data || { log_date: today, exists: false });
}

// 특정 날짜 컨디션 조회
async function getByDate(userId: string, date: string) {
  const { data, error } = await supabaseAdmin
    .from('daily_conditions')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  if (!data) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Condition not found for this date', 404);
  }

  return successResponse(data);
}

// 컨디션 기록
async function recordCondition(userId: string, body: any) {
  const { energy_level, mood_level, focus_level, factors, note, log_date } = body;

  // Validation
  if (energy_level !== undefined && (energy_level < 1 || energy_level > 5)) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, 'energy_level must be between 1 and 5', 400);
  }
  if (mood_level !== undefined && (mood_level < 1 || mood_level > 5)) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, 'mood_level must be between 1 and 5', 400);
  }
  if (focus_level !== undefined && (focus_level < 1 || focus_level > 5)) {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, 'focus_level must be between 1 and 5', 400);
  }

  const dateToLog = log_date || getTodayDateString();

  // Check if condition already exists for this date
  const { data: existingCondition } = await supabaseAdmin
    .from('daily_conditions')
    .select('id')
    .eq('user_id', userId)
    .eq('log_date', dateToLog)
    .maybeSingle();

  if (existingCondition) {
    // Update existing condition
    const updates: any = { updated_at: new Date().toISOString() };
    if (energy_level !== undefined) updates.energy_level = energy_level;
    if (mood_level !== undefined) updates.mood_level = mood_level;
    if (focus_level !== undefined) updates.focus_level = focus_level;
    if (factors !== undefined) updates.factors = factors;
    if (note !== undefined) updates.note = note;

    const { data, error } = await supabaseAdmin
      .from('daily_conditions')
      .update(updates)
      .eq('id', existingCondition.id)
      .select()
      .single();

    if (error) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
    }

    return successResponse(data, 200);
  }

  // Create new condition
  const { data, error } = await supabaseAdmin
    .from('daily_conditions')
    .insert({
      user_id: userId,
      log_date: dateToLog,
      energy_level: energy_level || 3,
      mood_level: mood_level || 3,
      focus_level: focus_level || 3,
      factors: factors || [],
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // 펭귄 보상: 컨디션 기록 시 XP 획득
  const { data: penguin } = await supabaseAdmin
    .from('penguin_status')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (penguin) {
    await supabaseAdmin
      .from('penguin_status')
      .update({
        current_xp: penguin.current_xp + 5,
        happiness: Math.min(100, penguin.happiness + 1),
      })
      .eq('user_id', userId);

    await supabaseAdmin.from('xp_history').insert({
      user_id: userId,
      amount: 5,
      source: 'condition_logged',
      reference_id: data.id,
    });
  }

  return successResponse(data, 201);
}

// 컨디션 업데이트
async function updateCondition(userId: string, conditionId: string, body: any) {
  const updates: any = { updated_at: new Date().toISOString() };
  const allowedFields = ['energy_level', 'mood_level', 'focus_level', 'factors', 'note'];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      // Validate levels
      if (['energy_level', 'mood_level', 'focus_level'].includes(field)) {
        if (body[field] < 1 || body[field] > 5) {
          return errorResponse(ErrorCodes.VALIDATION_ERROR, `${field} must be between 1 and 5`, 400);
        }
      }
      updates[field] = body[field];
    }
  }

  const { data, error } = await supabaseAdmin
    .from('daily_conditions')
    .update(updates)
    .eq('id', conditionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  if (!data) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Condition not found', 404);
  }

  return successResponse(data);
}

// 컨디션 삭제
async function deleteCondition(userId: string, conditionId: string) {
  const { error } = await supabaseAdmin
    .from('daily_conditions')
    .delete()
    .eq('id', conditionId)
    .eq('user_id', userId);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({ deleted: true });
}

// 주간 요약
async function getWeeklySummary(userId: string) {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const { data, error } = await supabaseAdmin
    .from('daily_conditions')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', weekAgo.toISOString().split('T')[0])
    .lte('log_date', today.toISOString().split('T')[0])
    .order('log_date', { ascending: true });

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  if (!data || data.length === 0) {
    return successResponse({
      days_logged: 0,
      average_energy: null,
      average_mood: null,
      average_focus: null,
      trend: 'no_data',
      best_day: null,
      worst_day: null,
    });
  }

  // Calculate averages
  const avgEnergy = data.reduce((sum, d) => sum + (d.energy_level || 0), 0) / data.length;
  const avgMood = data.reduce((sum, d) => sum + (d.mood_level || 0), 0) / data.length;
  const avgFocus = data.reduce((sum, d) => sum + (d.focus_level || 0), 0) / data.length;

  // Find best and worst days
  const withOverall = data.map(d => ({
    ...d,
    overall: ((d.energy_level || 3) + (d.mood_level || 3) + (d.focus_level || 3)) / 3,
  }));
  const bestDay = withOverall.reduce((best, d) => d.overall > best.overall ? d : best);
  const worstDay = withOverall.reduce((worst, d) => d.overall < worst.overall ? d : worst);

  // Determine trend
  let trend = 'stable';
  if (data.length >= 3) {
    const firstHalf = withOverall.slice(0, Math.floor(data.length / 2));
    const secondHalf = withOverall.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.overall, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.overall, 0) / secondHalf.length;
    if (secondAvg - firstAvg > 0.3) trend = 'improving';
    else if (firstAvg - secondAvg > 0.3) trend = 'declining';
  }

  return successResponse({
    days_logged: data.length,
    average_energy: Math.round(avgEnergy * 10) / 10,
    average_mood: Math.round(avgMood * 10) / 10,
    average_focus: Math.round(avgFocus * 10) / 10,
    trend,
    best_day: {
      date: bestDay.log_date,
      overall: Math.round(bestDay.overall * 10) / 10,
    },
    worst_day: {
      date: worstDay.log_date,
      overall: Math.round(worstDay.overall * 10) / 10,
    },
    conditions: data,
  });
}

// 월간 히트맵 (Year in Pixels용)
async function getMonthlyHeatmap(userId: string, year: string | null, month: string | null) {
  const now = new Date();
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();
  const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

  const { data, error } = await supabaseAdmin
    .from('daily_conditions')
    .select('log_date, energy_level, mood_level, focus_level')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // Create heatmap data structure
  const heatmap: Record<string, { level: number; energy: number; mood: number; focus: number }> = {};
  
  for (const condition of data || []) {
    const overall = Math.round(
      ((condition.energy_level || 3) + (condition.mood_level || 3) + (condition.focus_level || 3)) / 3
    );
    heatmap[condition.log_date] = {
      level: overall,
      energy: condition.energy_level || 3,
      mood: condition.mood_level || 3,
      focus: condition.focus_level || 3,
    };
  }

  return successResponse({
    year: targetYear,
    month: targetMonth,
    days_in_month: lastDay,
    days_logged: data?.length || 0,
    heatmap,
  });
}
