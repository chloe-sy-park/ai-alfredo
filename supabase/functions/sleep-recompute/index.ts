/**
 * Sleep Recompute Edge Function
 *
 * 수면 창 추정 로직 (A1 알고리즘 기반)
 * - 앱 세션, 알림 반응, 기기 활성 시간에서 bedtime/waketime 추정
 * - confidence 계산 (1-3 stars)
 * - sleep_records 테이블에 저장
 * - condition-recompute 트리거
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

// 상수
const MIN_SLEEP_DURATION = 180;  // 3시간
const MAX_SLEEP_DURATION = 840;  // 14시간
const DEFAULT_SLEEP_DURATION = 420;  // 7시간

// 타입 정의
interface RawSignals {
  last_session_end?: string | null;
  first_session_start?: string | null;
  notif_last_response?: string | null;
  notif_first_response?: string | null;
  device_last_active?: string | null;
  device_first_active?: string | null;
}

interface SleepWindow {
  bedtimeTs: string | null;
  waketimeTs: string | null;
  durationMin: number | null;
  confidenceStars: 1 | 2 | 3;
  source: 'estimated' | 'corrected_by_user' | 'imported';
}

// Helper: 유효한 timestamp 중 최대값 (bedtime 후보)
function getMaxTimestamp(candidates: (string | null | undefined)[]): Date | null {
  const validDates = candidates
    .filter((ts): ts is string => !!ts)
    .map(ts => new Date(ts))
    .filter(d => !isNaN(d.getTime()));

  if (validDates.length === 0) return null;
  return validDates.reduce((max, d) => d > max ? d : max);
}

// Helper: 유효한 timestamp 중 최소값 (waketime 후보)
function getMinTimestamp(candidates: (string | null | undefined)[]): Date | null {
  const validDates = candidates
    .filter((ts): ts is string => !!ts)
    .map(ts => new Date(ts))
    .filter(d => !isNaN(d.getTime()));

  if (validDates.length === 0) return null;
  return validDates.reduce((min, d) => d < min ? d : min);
}

// Helper: 분 단위 차이 계산
function getDurationMinutes(bed: Date, wake: Date): number {
  return Math.round((wake.getTime() - bed.getTime()) / (1000 * 60));
}

// A1-4: Confidence 계산
async function calculateConfidence(
  userId: string,
  bed: Date | null,
  wake: Date | null,
  signals: RawSignals,
  hasAndroidSignals: boolean
): Promise<1 | 2 | 3> {
  let conf = 0;

  // 실제 후보에서 추출되었는지
  if (bed) conf += 1;
  if (wake) conf += 1;

  // 사용 가능한 신호 수
  const signalsUsed = Object.values(signals).filter(s => s != null).length;
  if (signalsUsed >= 4) conf += 1;

  // Android 기기 신호 포함 여부
  if (hasAndroidSignals) conf += 1;

  // 일관성 보정: 최근 7일 median과 비교
  if (bed && wake) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: recentRecords } = await supabaseAdmin
      .from('sleep_records')
      .select('bedtime_ts, waketime_ts')
      .eq('user_id', userId)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(7);

    if (recentRecords && recentRecords.length >= 3) {
      // Median bedtime 계산 (시간 단위)
      const bedtimeHours = recentRecords
        .filter(r => r.bedtime_ts)
        .map(r => new Date(r.bedtime_ts).getHours() + new Date(r.bedtime_ts).getMinutes() / 60);

      const waketimeHours = recentRecords
        .filter(r => r.waketime_ts)
        .map(r => new Date(r.waketime_ts).getHours() + new Date(r.waketime_ts).getMinutes() / 60);

      if (bedtimeHours.length >= 3) {
        bedtimeHours.sort((a, b) => a - b);
        const medianBed = bedtimeHours[Math.floor(bedtimeHours.length / 2)];
        const currentBedHour = bed.getHours() + bed.getMinutes() / 60;
        // 90분 이내 차이면 +1
        if (Math.abs(currentBedHour - medianBed) <= 1.5) conf += 1;
      }

      if (waketimeHours.length >= 3) {
        waketimeHours.sort((a, b) => a - b);
        const medianWake = waketimeHours[Math.floor(waketimeHours.length / 2)];
        const currentWakeHour = wake.getHours() + wake.getMinutes() / 60;
        if (Math.abs(currentWakeHour - medianWake) <= 1.5) conf += 1;
      }
    }
  }

  // 최종 stars 결정
  if (conf <= 1) return 1;
  if (conf <= 3) return 2;
  return 3;
}

// A1: Sleep Window 추정 알고리즘
async function estimateSleepWindow(
  userId: string,
  rawSignals: RawSignals
): Promise<SleepWindow> {
  // A1-2: 후보 산출
  const bedCandidates = [
    rawSignals.last_session_end,
    rawSignals.notif_last_response,
    rawSignals.device_last_active
  ];
  const wakeCandidates = [
    rawSignals.first_session_start,
    rawSignals.notif_first_response,
    rawSignals.device_first_active
  ];

  let bed = getMaxTimestamp(bedCandidates);
  let wake = getMinTimestamp(wakeCandidates);

  // A1-3: Guardrails
  // 둘 다 null이면 추정 실패
  if (!bed && !wake) {
    return {
      bedtimeTs: null,
      waketimeTs: null,
      durationMin: null,
      confidenceStars: 1,
      source: 'estimated'
    };
  }

  // 하나만 있으면 기본값으로 보정
  if (!bed && wake) {
    bed = new Date(wake.getTime() - DEFAULT_SLEEP_DURATION * 60 * 1000);
  }
  if (!wake && bed) {
    wake = new Date(bed.getTime() + DEFAULT_SLEEP_DURATION * 60 * 1000);
  }

  // duration 계산 및 범위 체크
  let duration = getDurationMinutes(bed!, wake!);

  if (duration < MIN_SLEEP_DURATION) {
    // 너무 짧으면 bed를 조정 (wake - 6h)
    bed = new Date(wake!.getTime() - 360 * 60 * 1000);
    duration = 360;
  }
  if (duration > MAX_SLEEP_DURATION) {
    // 너무 길면 wake를 조정 (bed + 8h)
    wake = new Date(bed!.getTime() + 480 * 60 * 1000);
    duration = 480;
  }

  // A1-4: Confidence 계산
  const hasAndroidSignals = !!(rawSignals.device_last_active || rawSignals.device_first_active);
  const confidenceStars = await calculateConfidence(userId, bed, wake, rawSignals, hasAndroidSignals);

  return {
    bedtimeTs: bed!.toISOString(),
    waketimeTs: wake!.toISOString(),
    durationMin: duration,
    confidenceStars,
    source: 'estimated'
  };
}

// 메인 핸들러
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
    const { date, raw_signals } = body;

    if (!date) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'date is required', 400);
    }

    // 이미 corrected_by_user인 레코드가 있는지 확인
    const { data: existingRecord } = await supabaseAdmin
      .from('sleep_records')
      .select('id, source')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    // corrected_by_user는 덮어쓰지 않음
    if (existingRecord?.source === 'corrected_by_user') {
      return successResponse({
        message: 'Sleep record already corrected by user, skipping estimation',
        sleepWindow: existingRecord
      });
    }

    // Sleep Window 추정
    const rawSignals: RawSignals = raw_signals || {};
    const sleepWindow = await estimateSleepWindow(userId, rawSignals);

    // sleep_records upsert
    const recordData = {
      user_id: userId,
      date,
      bedtime_ts: sleepWindow.bedtimeTs,
      waketime_ts: sleepWindow.waketimeTs,
      duration_min: sleepWindow.durationMin,
      confidence_stars: sleepWindow.confidenceStars,
      source: sleepWindow.source,
      raw_signals: rawSignals,
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

    // condition-recompute 트리거 (내부 호출)
    // 주의: Supabase Edge Functions 간 호출은 직접 함수 import 또는 HTTP 호출
    // 여기서는 간단히 daily_conditions만 업데이트하거나 별도 호출
    // TODO: 실제 condition-recompute 호출 로직 추가

    return successResponse({
      sleepWindow: savedRecord,
      message: 'Sleep window estimated successfully'
    });

  } catch (error) {
    console.error('Sleep Recompute Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});
