/**
 * Sleep Correct Edge Function
 *
 * 사용자 수면 정정 처리
 * - 사용자가 입력한 bedtime/waketime 저장
 * - source를 'corrected_by_user'로 설정
 * - condition-recompute 트리거
 * - briefing cache 무효화
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

// Helper: 분 단위 차이 계산
function getDurationMinutes(bed: Date, wake: Date): number {
  return Math.round((wake.getTime() - bed.getTime()) / (1000 * 60));
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const userId = user.user_metadata?.user_id || user.id;
    if (!userId) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }

    // POST만 허용
    if (req.method !== 'POST') {
      return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }

    // Body 파싱
    const body = await req.json();
    const { date, bedtimeTs, waketimeTs } = body;

    // Validation
    if (!date) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'date is required', 400);
    }
    if (!bedtimeTs) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'bedtimeTs is required', 400);
    }
    if (!waketimeTs) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'waketimeTs is required', 400);
    }

    const bedtime = new Date(bedtimeTs);
    const waketime = new Date(waketimeTs);

    if (isNaN(bedtime.getTime()) || isNaN(waketime.getTime())) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid timestamp format', 400);
    }

    // duration 계산
    const durationMin = getDurationMinutes(bedtime, waketime);

    // 합리성 체크 (경고만, 저장은 허용)
    const warnings: string[] = [];
    if (durationMin < 180) {
      warnings.push('수면 시간이 3시간 미만입니다');
    }
    if (durationMin > 840) {
      warnings.push('수면 시간이 14시간 초과입니다');
    }
    if (durationMin <= 0) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, '일어난 시간은 잠든 시간 이후여야 합니다', 400);
    }

    // 기존 레코드 조회 (delta 계산용)
    const { data: existingRecord } = await supabaseAdmin
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    // delta 계산 (기존 추정값과의 차이 - calibration용)
    let delta = null;
    if (existingRecord && existingRecord.source === 'estimated') {
      const oldBed = existingRecord.bedtime_ts ? new Date(existingRecord.bedtime_ts).getTime() : null;
      const oldWake = existingRecord.waketime_ts ? new Date(existingRecord.waketime_ts).getTime() : null;

      delta = {
        bedtime_diff_min: oldBed ? Math.round((bedtime.getTime() - oldBed) / (1000 * 60)) : null,
        waketime_diff_min: oldWake ? Math.round((waketime.getTime() - oldWake) / (1000 * 60)) : null,
        duration_diff_min: existingRecord.duration_min ? durationMin - existingRecord.duration_min : null,
        original_confidence: existingRecord.confidence_stars
      };
    }

    // sleep_records upsert (corrected_by_user)
    const recordData = {
      user_id: userId,
      date,
      bedtime_ts: bedtime.toISOString(),
      waketime_ts: waketime.toISOString(),
      duration_min: durationMin,
      confidence_stars: 3,  // 사용자 정정은 항상 최고 신뢰도
      source: 'corrected_by_user',
      raw_signals: existingRecord?.raw_signals || {},
      updated_at: new Date().toISOString()
    };

    const { data: savedRecord, error: saveError } = await supabaseAdmin
      .from('sleep_records')
      .upsert(recordData, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (saveError) {
      console.error('Sleep record save error:', saveError);
      return errorResponse(ErrorCodes.INTERNAL_ERROR, saveError.message, 500);
    }

    // briefing_cache 무효화 (해당 날짜의 모든 surface)
    await supabaseAdmin
      .from('briefing_cache')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    // TODO: condition-recompute 트리거
    // 실제 구현 시 HTTP 호출 또는 내부 함수 호출

    return successResponse({
      sleepWindow: savedRecord,
      delta,
      warnings,
      message: 'Sleep record corrected successfully'
    });

  } catch (error) {
    console.error('Sleep Correct Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});
