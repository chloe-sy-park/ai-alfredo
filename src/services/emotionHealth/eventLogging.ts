/**
 * Emotion Health Event Logging Service
 *
 * 이벤트 로깅을 위한 서비스
 * - Signal 이벤트 (감지 결과)
 * - Transition 이벤트 (전환 카드)
 *
 * 데이터 최소화 원칙:
 * - 민감 정보 저장 최소화
 * - 7일 후 자동 삭제 (서버에서 처리)
 */

import { supabase } from '../../lib/supabase';
import type {
  TransitionEvent,
  TransitionTrigger,
  EffectiveMode,
  SignalLevel,
  PeopleFrictionLevel
} from './types';

// ============================================================
// Signal Event Logging
// ============================================================

interface SignalEventData {
  emotionalLevel?: SignalLevel;
  cognitiveLevel?: SignalLevel;
  physicalLevel?: SignalLevel;
  peopleFriction?: PeopleFrictionLevel;
  evidence?: Record<string, string[]>;
  triggerSource: 'conversation' | 'daily_selection' | 'health_input' | 'transition';
  effectiveModeAtTime?: EffectiveMode;
}

/**
 * Log signal event to Supabase
 * For debugging/improvement purposes
 */
export async function logSignalEvent(data: SignalEventData): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use type assertion for new table
    await (supabase as any).from('alfredo_signal_events').insert({
      user_id: user.id,
      emotional_level: data.emotionalLevel,
      cognitive_level: data.cognitiveLevel,
      physical_level: data.physicalLevel,
      people_friction: data.peopleFriction,
      evidence: data.evidence || {},
      trigger_source: data.triggerSource,
      effective_mode_at_time: data.effectiveModeAtTime,
    });
  } catch (err) {
    console.error('Failed to log signal event:', err);
  }
}

// ============================================================
// Transition Event Logging
// ============================================================

/**
 * Log transition card event
 */
export async function logTransitionEvent(event: TransitionEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use type assertion for new table
    await (supabase as any).from('alfredo_transition_events').insert({
      user_id: user.id,
      event_type: event.eventType,
      trigger_reason: event.triggerReason,
      effective_mode: event.effectiveMode,
      dwell_time_seconds: event.dwellTimeSeconds,
    });
  } catch (err) {
    console.error('Failed to log transition event:', err);
  }
}

/**
 * Log transition card shown
 */
export function logTransitionCardShown(
  trigger: TransitionTrigger,
  effectiveMode: EffectiveMode
): void {
  logTransitionEvent({
    eventType: 'transition_card_shown',
    triggerReason: trigger,
    effectiveMode,
  });
}

/**
 * Log transition card skipped
 */
export function logTransitionCardSkipped(
  trigger: TransitionTrigger,
  effectiveMode: EffectiveMode
): void {
  logTransitionEvent({
    eventType: 'transition_card_skipped',
    triggerReason: trigger,
    effectiveMode,
  });
}

/**
 * Log drop-off clicked
 */
export function logDropoffClicked(effectiveMode: EffectiveMode): void {
  logTransitionEvent({
    eventType: 'dropoff_clicked',
    effectiveMode,
  });
}

/**
 * Log Life entry completed
 */
export function logLifeEntryCompleted(
  trigger: TransitionTrigger,
  effectiveMode: EffectiveMode,
  dwellTimeSeconds: number
): void {
  logTransitionEvent({
    eventType: 'life_entry_completed',
    triggerReason: trigger,
    effectiveMode,
    dwellTimeSeconds,
  });
}

// ============================================================
// Analytics Helpers
// ============================================================

/**
 * Get recent signal events for analytics
 * Limited to last 7 days
 */
export async function getRecentSignalEvents(limit = 50): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await (supabase as any)
      .from('alfredo_signal_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get signal events:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching signal events:', err);
    return [];
  }
}

/**
 * Get transition event stats for analytics
 */
export async function getTransitionEventStats(): Promise<{
  totalShown: number;
  skippedRate: number;
  dropoffRate: number;
  avgDwellTime: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { totalShown: 0, skippedRate: 0, dropoffRate: 0, avgDwellTime: 0 };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await (supabase as any)
      .from('alfredo_transition_events')
      .select('event_type, dwell_time_seconds')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error || !data) {
      return { totalShown: 0, skippedRate: 0, dropoffRate: 0, avgDwellTime: 0 };
    }

    const events = data as Array<{ event_type: string; dwell_time_seconds: number | null }>;
    const totalShown = events.filter(e => e.event_type === 'transition_card_shown').length;
    const skipped = events.filter(e => e.event_type === 'transition_card_skipped').length;
    const dropoffs = events.filter(e => e.event_type === 'dropoff_clicked').length;
    const completed = events.filter(e => e.event_type === 'life_entry_completed');

    const avgDwellTime = completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.dwell_time_seconds || 0), 0) / completed.length
      : 0;

    return {
      totalShown,
      skippedRate: totalShown > 0 ? skipped / totalShown : 0,
      dropoffRate: totalShown > 0 ? dropoffs / totalShown : 0,
      avgDwellTime: Math.round(avgDwellTime),
    };
  } catch (err) {
    console.error('Error fetching transition stats:', err);
    return { totalShown: 0, skippedRate: 0, dropoffRate: 0, avgDwellTime: 0 };
  }
}
