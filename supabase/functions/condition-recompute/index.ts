/**
 * Condition Recompute Edge Function
 *
 * Condition 점수/상태 계산 (A2 알고리즘 기반)
 * - Sleep, Check-in, Calendar density를 종합하여 score 계산
 * - state (good/ok/low) 결정
 * - Energy Curve 생성 (A3 알고리즘)
 * - daily_conditions 테이블에 저장
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

// 타입 정의
type ConditionState = 'good' | 'ok' | 'low';
type CheckinTag = 'play' | 'travel' | 'social' | 'rest' | 'other';

interface EnergyCurve {
  [hour: string]: number;  // 0-3
}

interface ConditionResult {
  state: ConditionState;
  scoreInternal: number;
  energyCurve: EnergyCurve;
  drivers: {
    sleepComponent: number;
    checkinComponent: number;
    calendarComponent: number;
    sleepDurationMin?: number;
    sleepConfidence?: number;
    checkinTags?: string[];
    busyHours?: number;
    meetingCount?: number;
  };
}

// A2-2: Sleep Component 계산 (±30)
function calculateSleepComponent(
  durationMin: number | null,
  bedtimeTs: string | null,
  confidenceStars: number | null
): number {
  if (!durationMin || !bedtimeTs) {
    return 0;  // 데이터 없으면 0
  }

  // (1) duration_score (±20)
  let durationScore: number;
  const d = durationMin;

  if (d < 300) durationScore = -20;        // <5h
  else if (d < 360) durationScore = -12;   // 5-6h
  else if (d < 420) durationScore = -5;    // 6-7h
  else if (d <= 540) durationScore = 12;   // 7-9h (ideal)
  else if (d <= 600) durationScore = 6;    // 9-10h
  else if (d <= 720) durationScore = 0;    // 10-12h
  else durationScore = -6;                  // >12h

  // (2) timing_score (±8) - bedtime 기준
  const bedtime = new Date(bedtimeTs);
  // 로컬 시간으로 변환 (Asia/Seoul 가정)
  const bedHour = bedtime.getUTCHours() + 9;  // UTC+9
  const normalizedBedHour = bedHour >= 24 ? bedHour - 24 : bedHour;
  const bedHourFraction = normalizedBedHour + bedtime.getUTCMinutes() / 60;

  let timingScore: number;
  if (bedHourFraction <= 0.5) timingScore = 3;      // ~00:30
  else if (bedHourFraction <= 2.0) timingScore = 0;  // ~02:00
  else if (bedHourFraction <= 3.5) timingScore = -4; // ~03:30
  else timingScore = -8;                              // >03:30

  // (3) confidence_score (0~+2)
  const confidenceScore = confidenceStars === 3 ? 2 : confidenceStars === 2 ? 1 : 0;

  // 합산 및 clamp
  const sleepComponent = durationScore + timingScore + confidenceScore;
  return Math.max(-30, Math.min(30, sleepComponent));
}

// A2-3: Checkin Component 계산 (±12)
function calculateCheckinComponent(tags: CheckinTag[]): number {
  const TAG_SCORES: Record<CheckinTag, number> = {
    play: 3,
    rest: 6,
    travel: -2,
    social: -1,
    other: 0
  };

  let score = tags.reduce((sum, tag) => sum + (TAG_SCORES[tag] || 0), 0);

  // 추가 규칙
  if (tags.length >= 2) {
    if (tags.includes('rest')) score += 2;
    if (tags.includes('travel') && tags.includes('social')) score -= 2;
  }

  return Math.max(-12, Math.min(12, score));
}

// A2-4: Calendar Component 계산 (±8)
function calculateCalendarComponent(busyHours: number | null, meetingCount: number | null): number {
  if (busyHours === null) return 0;

  let score: number;
  if (busyHours >= 7) score = -6;
  else if (busyHours >= 5) score = -3;
  else if (busyHours >= 3) score = 0;
  else score = 2;

  // 미팅 개수 추가 패널티
  if (meetingCount && meetingCount >= 6) {
    score -= 2;
  }

  return Math.max(-8, Math.min(8, score));
}

// A2-5: State 결정
function getConditionState(score: number): ConditionState {
  if (score >= 70) return 'good';
  if (score >= 45) return 'ok';
  return 'low';
}

// A3: Energy Curve 생성
function generateEnergyCurve(
  state: ConditionState,
  bedHour: number | null,
  durationMin: number | null,
  travelModeEnabled: boolean
): EnergyCurve {
  // A3-1: 기본 곡선
  const BASE_CURVES: Record<ConditionState, Record<number, number>> = {
    good: { 8: 3, 9: 3, 10: 3, 11: 3, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 1 },
    ok: { 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1 },
    low: { 8: 2, 9: 2, 10: 2, 11: 1, 12: 1, 13: 1, 14: 1, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0 }
  };

  const curve: EnergyCurve = { ...BASE_CURVES[state] };

  // A3-2: 수면 보정
  if (bedHour !== null) {
    // 늦잠 (새벽 2시 이후 취침)
    if (bedHour > 2.0) {
      curve['8'] = Math.max(0, (curve['8'] || 0) - 1);
      curve['9'] = Math.max(0, (curve['9'] || 0) - 1);
      curve['10'] = Math.max(0, (curve['10'] || 0) - 1);
    }
  }

  if (durationMin !== null) {
    // 수면 부족 (6h 미만)
    if (durationMin < 360) {
      for (let h = 16; h <= 20; h++) {
        const key = String(h);
        curve[key] = Math.max(0, (curve[key] || 0) - 1);
      }
    }
  }

  // A3-3: Travel Mode 보정
  if (travelModeEnabled) {
    for (let h = 8; h <= 12; h++) {
      const key = String(h);
      curve[key] = Math.min(curve[key] || 0, 2);
    }
  }

  // 최종 clamp (0-3)
  for (const key of Object.keys(curve)) {
    curve[key] = Math.max(0, Math.min(3, curve[key]));
  }

  return curve;
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
    const { date } = body;

    if (!date) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'date is required', 400);
    }

    // 1. Sleep Record 조회 (corrected 우선)
    const { data: sleepRecord } = await supabaseAdmin
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    // 2. Checkins 조회 (당일 또는 전날 밤)
    const { data: checkins } = await supabaseAdmin
      .from('checkins')
      .select('tag')
      .eq('user_id', userId)
      .eq('date', date);

    const checkinTags = (checkins || []).map(c => c.tag as CheckinTag);

    // 3. Travel Session 조회
    const { data: travelSession } = await supabaseAdmin
      .from('travel_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const travelModeEnabled = travelSession?.mode_enabled || false;

    // 4. Calendar Density 조회 (optional)
    // 오늘 일정에서 busy hours 계산
    const todayStart = `${date}T00:00:00+09:00`;
    const todayEnd = `${date}T23:59:59+09:00`;

    const { data: calendarEvents } = await supabaseAdmin
      .from('calendar_events')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd);

    let busyHours: number | null = null;
    let meetingCount: number | null = null;

    if (calendarEvents && calendarEvents.length > 0) {
      meetingCount = calendarEvents.length;
      // 총 시간 계산 (시간 단위)
      busyHours = calendarEvents.reduce((sum, event) => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
    }

    // 5. Components 계산
    const sleepComponent = calculateSleepComponent(
      sleepRecord?.duration_min || null,
      sleepRecord?.bedtime_ts || null,
      sleepRecord?.confidence_stars || null
    );

    const checkinComponent = calculateCheckinComponent(checkinTags);
    const calendarComponent = calculateCalendarComponent(busyHours, meetingCount);

    // 6. 최종 Score 및 State
    let score = 50 + sleepComponent + checkinComponent + calendarComponent;
    score = Math.max(0, Math.min(100, score));

    const state = getConditionState(score);

    // 7. Energy Curve 생성
    let bedHour: number | null = null;
    if (sleepRecord?.bedtime_ts) {
      const bedtime = new Date(sleepRecord.bedtime_ts);
      bedHour = (bedtime.getUTCHours() + 9) % 24 + bedtime.getUTCMinutes() / 60;
    }

    const energyCurve = generateEnergyCurve(
      state,
      bedHour,
      sleepRecord?.duration_min || null,
      travelModeEnabled
    );

    // 8. Drivers 객체
    const drivers = {
      sleepComponent,
      checkinComponent,
      calendarComponent,
      sleepDurationMin: sleepRecord?.duration_min,
      sleepConfidence: sleepRecord?.confidence_stars,
      checkinTags,
      busyHours: busyHours ? Math.round(busyHours * 10) / 10 : null,
      meetingCount
    };

    // 9. daily_conditions upsert
    const { data: existingCondition } = await supabaseAdmin
      .from('daily_conditions')
      .select('id')
      .eq('user_id', userId)
      .eq('log_date', date)
      .maybeSingle();

    const conditionData = {
      user_id: userId,
      log_date: date,
      state,
      score_internal: score,
      energy_curve: energyCurve,
      drivers,
      updated_at: new Date().toISOString()
    };

    let savedCondition;
    if (existingCondition) {
      // Update
      const { data, error } = await supabaseAdmin
        .from('daily_conditions')
        .update(conditionData)
        .eq('id', existingCondition.id)
        .select()
        .single();

      if (error) throw error;
      savedCondition = data;
    } else {
      // Insert
      const { data, error } = await supabaseAdmin
        .from('daily_conditions')
        .insert({
          ...conditionData,
          energy_level: Math.round(score / 20),  // 1-5 스케일로 변환
          mood_level: 3,  // 기본값
          focus_level: 3   // 기본값
        })
        .select()
        .single();

      if (error) throw error;
      savedCondition = data;
    }

    return successResponse({
      condition: savedCondition,
      computed: {
        state,
        score,
        energyCurve,
        drivers
      },
      message: 'Condition recomputed successfully'
    });

  } catch (error) {
    console.error('Condition Recompute Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});
