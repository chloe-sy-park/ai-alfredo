/**
 * Intents Edge Function
 *
 * Part F: Internal Beta Integration
 * Intent 백업 및 동기화를 위한 서버 API
 *
 * 역할:
 * - 클라이언트 Intent를 서버에 백업
 * - 중복 Intent 필터링 (UNIQUE constraint)
 * - Intent 상태 조회
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

// Intent 타입 정의
type IntentType =
  | 'task_create' | 'task_update' | 'task_complete' | 'task_delete'
  | 'checkin' | 'sleep_correct'
  | 'email_classify' | 'sender_weight_update'
  | 'habit_complete' | 'briefing_view';

type IntentPriority = 'critical' | 'high' | 'normal' | 'low';

interface IntentPayload {
  clientIntentId: string;
  type: IntentType;
  payload: Record<string, unknown>;
  priority?: IntentPriority;
  createdAt?: string;
}

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
    const intentId = pathParts[1]; // /intents/:id

    switch (req.method) {
      case 'GET':
        return intentId ? getIntent(userId, intentId) : listIntents(userId, url);
      case 'POST':
        return createIntent(userId, await req.json());
      case 'DELETE':
        if (!intentId) return errorResponse(ErrorCodes.MISSING_FIELD, 'Intent ID required', 400);
        return deleteIntent(userId, intentId);
      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Intents Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// ============================================================
// Intent 목록 조회
// ============================================================

async function listIntents(userId: string, url: URL) {
  const type = url.searchParams.get('type');
  const since = url.searchParams.get('since'); // ISO timestamp
  const limit = parseInt(url.searchParams.get('limit') || '100');

  let query = supabaseAdmin
    .from('app_intents')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('received_at', { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq('type', type);
  }

  if (since) {
    query = query.gte('received_at', since);
  }

  const { data, error, count } = await query;

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 200, {
    total: count || 0,
    limit,
  });
}

// ============================================================
// 단일 Intent 조회
// ============================================================

async function getIntent(userId: string, intentId: string) {
  const { data, error } = await supabaseAdmin
    .from('app_intents')
    .select('*')
    .eq('user_id', userId)
    .eq('client_intent_id', intentId)
    .single();

  if (error || !data) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Intent not found', 404);
  }

  return successResponse(data);
}

// ============================================================
// Intent 생성 (백업)
// ============================================================

async function createIntent(userId: string, body: IntentPayload) {
  const { clientIntentId, type, payload, priority, createdAt } = body;

  // 필수 필드 검증
  if (!clientIntentId) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'clientIntentId is required', 400);
  }

  if (!type) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'type is required', 400);
  }

  if (!payload) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'payload is required', 400);
  }

  // 중복 체크 (UNIQUE constraint로 이미 처리되지만, 명시적 체크)
  const { data: existing } = await supabaseAdmin
    .from('app_intents')
    .select('id')
    .eq('user_id', userId)
    .eq('client_intent_id', clientIntentId)
    .single();

  if (existing) {
    // 이미 존재하면 성공으로 처리 (멱등성)
    return successResponse({
      id: existing.id,
      clientIntentId,
      alreadyExists: true
    });
  }

  // Intent 저장
  const { data, error } = await supabaseAdmin
    .from('app_intents')
    .insert({
      user_id: userId,
      client_intent_id: clientIntentId,
      type,
      payload,
      priority: priority || 'normal',
      client_created_at: createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // UNIQUE 위반 시 (race condition)
    if (error.code === '23505') {
      return successResponse({ clientIntentId, alreadyExists: true });
    }
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // Intent 타입에 따른 추가 처리
  await processIntentSideEffects(userId, type, payload);

  return successResponse({
    id: data.id,
    clientIntentId,
    alreadyExists: false
  }, 201);
}

// ============================================================
// Intent 삭제 (cleanup용)
// ============================================================

async function deleteIntent(userId: string, intentId: string) {
  const { error } = await supabaseAdmin
    .from('app_intents')
    .delete()
    .eq('user_id', userId)
    .eq('client_intent_id', intentId);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({ deleted: true });
}

// ============================================================
// Intent Side Effects (옵션: 서버 측 처리)
// ============================================================

async function processIntentSideEffects(
  userId: string,
  type: IntentType,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    switch (type) {
      case 'task_complete':
        // 태스크 완료 시 통계 업데이트 등
        await logEvent(userId, 'task_completed', { taskId: payload.taskId });
        break;

      case 'checkin':
        // 체크인 시 condition 재계산 트리거
        await logEvent(userId, 'checkin_submitted', {
          tag: payload.tag,
          date: payload.date
        });
        break;

      case 'sleep_correct':
        // 수면 정정 시 condition 재계산 트리거
        await logEvent(userId, 'sleep_corrected', {
          date: payload.date
        });
        break;

      case 'habit_complete':
        // 습관 완료 시 통계 업데이트
        await logEvent(userId, 'habit_completed', {
          habitId: payload.habitId,
          date: payload.date
        });
        break;

      default:
        // 기본: 이벤트 로깅만
        await logEvent(userId, `intent_${type}`, { payload });
    }
  } catch (error) {
    // Side effect 실패는 Intent 저장을 막지 않음
    console.error('Intent side effect error:', error);
  }
}

// ============================================================
// Event Logging Helper
// ============================================================

async function logEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  await supabaseAdmin.from('app_events').insert({
    user_id: userId,
    event_type: eventType,
    event_data: eventData,
  });
}
