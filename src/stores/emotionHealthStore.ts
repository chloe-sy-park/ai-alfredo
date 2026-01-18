/**
 * AlFredo Emotion & Health Store
 *
 * 감정/건강을 생산성 제약조건으로 관리하는 Zustand 스토어
 *
 * 핵심 원칙:
 * - 우선순위: 명시 입력(유저 선택) > Daily Mode > 대화 감지(보정)
 * - 확인 질문은 하루 1회 제한
 * - 상태 전환은 보수적으로
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  EmotionHealthState,
  DailyMode,
  EffectiveMode,
  SignalLevel,
  PeopleFrictionLevel,
  UIPolicy,
  DetectorOutput,
  HealthInput,
  TransitionTrigger,
  TransitionCardState,
  AlfredoUserStateRow,
  rowToState,
  getDefaultState
} from '../services/emotionHealth/types';

// ============================================================
// Store Interface
// ============================================================

interface EmotionHealthStore extends EmotionHealthState {
  // Hydration
  hydrate: () => Promise<void>;

  // Daily Mode
  setDailyMode: (mode: DailyMode) => Promise<void>;
  clearDailyMode: () => void;

  // Health Input
  setHealthInput: (input: HealthInput) => Promise<void>;

  // Detector Signals (from LLM)
  applyDetectorSignals: (output: DetectorOutput) => Promise<void>;

  // Drop-off
  triggerDropoff: () => Promise<void>;

  // Transition Card
  transitionCard: TransitionCardState;
  showTransitionCard: (trigger: TransitionTrigger) => void;
  hideTransitionCard: () => void;
  advanceTransitionStep: () => void;

  // Confirm Question Rate Limit
  canAskConfirmQuestion: () => boolean;
  recordConfirmQuestionAsked: () => void;

  // Sync
  syncToSupabase: () => Promise<void>;

  // Reset
  reset: () => void;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Clamp effective mode based on signals
 * - physical high → protect
 * - emotional/cognitive high → push면 steady로 다운그레이드
 * - emotional medium streak>=2 → push 억제
 */
function deriveEffectiveMode(
  dailyMode: DailyMode | null,
  emotionalLevel: SignalLevel,
  emotionalStreak: number,
  cognitiveLevel: SignalLevel,
  physicalLevel: SignalLevel
): EffectiveMode {
  // Physical constraint takes highest priority
  if (physicalLevel === 'high') {
    return 'protect';
  }

  // Start with daily mode or default to steady
  let effective: EffectiveMode = dailyMode || 'steady';

  // Emotional/Cognitive high → downgrade push to steady
  if ((emotionalLevel === 'high' || cognitiveLevel === 'high') && effective === 'push') {
    effective = 'steady';
  }

  // Emotional medium streak >= 2 → suppress push
  if (emotionalLevel === 'medium' && emotionalStreak >= 2 && effective === 'push') {
    effective = 'steady';
  }

  // Physical medium → consider steady if currently push
  if (physicalLevel === 'medium' && effective === 'push') {
    effective = 'steady';
  }

  return effective;
}

/**
 * Derive UI Policy from state
 */
function deriveUIPolicy(
  effectiveMode: EffectiveMode,
  cognitiveLevel: SignalLevel,
  physicalLevel: SignalLevel
): UIPolicy {
  let maxOptions: 1 | 2 | 3 = 3;
  let tone: 'neutral' | 'soft' | 'protective' = 'neutral';
  let suggestIntensity: 'low' | 'medium' | 'high' = 'medium';

  // Cognitive high → minimal options
  if (cognitiveLevel === 'high') {
    maxOptions = 1;
  } else if (cognitiveLevel === 'medium') {
    maxOptions = 2;
  }

  // Protect mode → protective tone, low intensity
  if (effectiveMode === 'protect') {
    tone = 'protective';
    suggestIntensity = 'low';
    maxOptions = 1;
  } else if (effectiveMode === 'steady') {
    tone = 'soft';
    suggestIntensity = 'medium';
    if (maxOptions > 2) maxOptions = 2;
  } else if (effectiveMode === 'push') {
    suggestIntensity = 'high';
    if (maxOptions > 2) maxOptions = 2;
  }

  // Physical high → force protective
  if (physicalLevel === 'high') {
    tone = 'protective';
    suggestIntensity = 'low';
    maxOptions = 1;
  }

  return { maxOptions, tone, suggestIntensity };
}

/**
 * Update rolling state with new signal
 */
function updateRollingState(
  currentLevel: SignalLevel,
  currentStreak: number,
  newLevel: SignalLevel,
  confidence: number
): { level: SignalLevel; streak: number } {
  // Only adopt high with confidence >= 0.75
  if (newLevel === 'high' && confidence < 0.75) {
    newLevel = 'medium';
  }

  // If level same or higher, increment streak
  const levelOrder = { low: 0, medium: 1, high: 2 };
  if (levelOrder[newLevel] >= levelOrder[currentLevel]) {
    return {
      level: newLevel,
      streak: newLevel === currentLevel ? currentStreak + 1 : 1
    };
  }

  // Level decreased
  if (currentStreak > 1) {
    // Decay slowly
    return { level: currentLevel, streak: currentStreak - 1 };
  }

  // Drop to new level
  return { level: newLevel, streak: 1 };
}

/**
 * Get today's date key (YYYY-MM-DD in Asia/Seoul)
 */
function getTodayDateKey(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul'
  }).replace(/\. /g, '-').replace('.', '');
}

/**
 * Generate transition card messages based on trigger
 */
function generateTransitionMessages(
  trigger: TransitionTrigger,
  peopleFrictionLevel: PeopleFrictionLevel
): { acknowledgement: string; declaration: string } {
  let acknowledgement = '';
  let declaration = '';

  switch (trigger) {
    case 'peopleFriction':
      if (peopleFrictionLevel === 'clear') {
        acknowledgement = '사람 때문에 에너지 많이 썼던 하루였네요.';
        declaration = '이제는 나를 위한 시간이에요.';
      } else {
        acknowledgement = '오늘 하루 수고 많았어요.';
        declaration = '이제 천천히 쉬어가요.';
      }
      break;

    case 'emotionalHigh':
      acknowledgement = '마음이 무거웠던 하루였네요.';
      declaration = '지금은 내려두고 쉬어가요.';
      break;

    case 'cognitiveHigh':
      acknowledgement = '머리 많이 쓴 하루였어요.';
      declaration = '생각을 잠시 내려놓아요.';
      break;

    case 'meetingHeavy':
      acknowledgement = '회의가 많았던 하루네요.';
      declaration = '이제 조용한 시간을 가져요.';
      break;

    case 'protectMode':
      acknowledgement = '오늘은 보호가 필요한 날이에요.';
      declaration = '무리하지 않아도 괜찮아요.';
      break;

    default:
      acknowledgement = '오늘 하루 수고했어요.';
      declaration = '이제 쉬어가는 시간이에요.';
  }

  return { acknowledgement, declaration };
}

// ============================================================
// Store Creation
// ============================================================

export const useEmotionHealthStore = create<EmotionHealthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...getDefaultState(),

      // Transition Card State
      transitionCard: {
        isVisible: false,
        trigger: null,
        step: 1,
        acknowledgementMessage: '',
        lifeDeclarationMessage: ''
      },

      // ============================================================
      // Hydration
      // ============================================================
      hydrate: async () => {
        set({ isLoading: true });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          // Type assertion for new table not yet in generated types
          const { data, error } = await (supabase as any)
            .from('alfredo_user_state')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Failed to hydrate emotion health state:', error);
          }

          if (data) {
            const state = rowToState(data as AlfredoUserStateRow);
            set({ ...state, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.error('Hydration error:', err);
          set({ isLoading: false });
        }
      },

      // ============================================================
      // Daily Mode
      // ============================================================
      setDailyMode: async (mode: DailyMode) => {
        const now = new Date().toISOString();
        const state = get();

        const effectiveMode = deriveEffectiveMode(
          mode,
          state.emotionalLoad.level,
          state.emotionalLoad.streak,
          state.cognitiveOverload.level,
          state.physicalConstraint.level
        );

        const uiPolicy = deriveUIPolicy(
          effectiveMode,
          state.cognitiveOverload.level,
          state.physicalConstraint.level
        );

        set({
          dailyMode: mode,
          dailyModeSelectedAt: now,
          effectiveMode,
          uiPolicy
        });

        await get().syncToSupabase();
      },

      clearDailyMode: () => {
        set({
          dailyMode: null,
          dailyModeSelectedAt: null
        });
      },

      // ============================================================
      // Health Input
      // ============================================================
      setHealthInput: async (input: HealthInput) => {
        const now = new Date().toISOString();
        const state = get();

        let physicalLevel: SignalLevel = 'low';
        if (input.level === 'needProtection') {
          physicalLevel = 'high';
        } else if (input.level === 'uncomfortable') {
          physicalLevel = 'medium';
        }

        const effectiveMode = deriveEffectiveMode(
          state.dailyMode,
          state.emotionalLoad.level,
          state.emotionalLoad.streak,
          state.cognitiveOverload.level,
          physicalLevel
        );

        const uiPolicy = deriveUIPolicy(
          effectiveMode,
          state.cognitiveOverload.level,
          physicalLevel
        );

        set({
          physicalConstraint: {
            level: physicalLevel,
            reason: input.reasons?.join(', ') || null,
            updatedAt: now
          },
          effectiveMode,
          uiPolicy
        });

        await get().syncToSupabase();
      },

      // ============================================================
      // Detector Signals
      // ============================================================
      applyDetectorSignals: async (output: DetectorOutput) => {
        const state = get();
        const now = new Date().toISOString();

        // Update emotional load
        const newEmotional = updateRollingState(
          state.emotionalLoad.level,
          state.emotionalLoad.streak,
          output.signals.emotional_load.level,
          output.signals.emotional_load.confidence
        );

        // Update cognitive overload
        const newCognitive = updateRollingState(
          state.cognitiveOverload.level,
          state.cognitiveOverload.streak,
          output.signals.cognitive_overload.level,
          output.signals.cognitive_overload.confidence
        );

        // Update physical (only if high confidence)
        let physicalLevel = state.physicalConstraint.level;
        if (output.signals.physical_constraint.confidence >= 0.75) {
          physicalLevel = output.signals.physical_constraint.level;
        }

        // Update people friction
        let peopleFrictionLevel = state.peopleFriction.level;
        if (output.signals.people_friction.confidence >= 0.6) {
          peopleFrictionLevel = output.signals.people_friction.level;
        }

        // Derive effective mode
        const effectiveMode = deriveEffectiveMode(
          state.dailyMode,
          newEmotional.level,
          newEmotional.streak,
          newCognitive.level,
          physicalLevel
        );

        // Derive UI policy
        const uiPolicy = deriveUIPolicy(effectiveMode, newCognitive.level, physicalLevel);

        set({
          emotionalLoad: { ...newEmotional, updatedAt: now },
          cognitiveOverload: { ...newCognitive, updatedAt: now },
          physicalConstraint: {
            level: physicalLevel,
            reason: state.physicalConstraint.reason,
            updatedAt: now
          },
          peopleFriction: { level: peopleFrictionLevel, updatedAt: now },
          effectiveMode,
          uiPolicy
        });

        // Debounced sync
        await get().syncToSupabase();
      },

      // ============================================================
      // Drop-off
      // ============================================================
      triggerDropoff: async () => {
        const now = new Date().toISOString();
        const state = get();

        set({
          lastDropoffAt: now,
          dropoffCountWeek: state.dropoffCountWeek + 1,
          // Force protective mode for rest of day
          effectiveMode: 'protect',
          uiPolicy: {
            maxOptions: 1,
            tone: 'protective',
            suggestIntensity: 'low'
          }
        });

        await get().syncToSupabase();

        // Hide transition card
        get().hideTransitionCard();
      },

      // ============================================================
      // Transition Card
      // ============================================================
      showTransitionCard: (trigger: TransitionTrigger) => {
        const state = get();
        const messages = generateTransitionMessages(trigger, state.peopleFriction.level);

        set({
          transitionCard: {
            isVisible: true,
            trigger,
            step: 1,
            acknowledgementMessage: messages.acknowledgement,
            lifeDeclarationMessage: messages.declaration
          }
        });
      },

      hideTransitionCard: () => {
        set({
          transitionCard: {
            isVisible: false,
            trigger: null,
            step: 1,
            acknowledgementMessage: '',
            lifeDeclarationMessage: ''
          }
        });
      },

      advanceTransitionStep: () => {
        const card = get().transitionCard;
        if (card.step < 2) {
          set({
            transitionCard: { ...card, step: 2 }
          });
        }
      },

      // ============================================================
      // Confirm Question Rate Limit
      // ============================================================
      canAskConfirmQuestion: () => {
        const state = get();
        const todayKey = getTodayDateKey();

        // Reset if different day
        if (state.confirmLimit.askedDateKey !== todayKey) {
          return true;
        }

        // Max 1 per day
        return state.confirmLimit.askedCountToday < 1;
      },

      recordConfirmQuestionAsked: () => {
        const state = get();
        const todayKey = getTodayDateKey();

        let newCount = 1;
        if (state.confirmLimit.askedDateKey === todayKey) {
          newCount = state.confirmLimit.askedCountToday + 1;
        }

        set({
          confirmLimit: {
            lastAskedAt: new Date().toISOString(),
            askedCountToday: newCount,
            askedDateKey: todayKey
          }
        });
      },

      // ============================================================
      // Sync to Supabase
      // ============================================================
      syncToSupabase: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const state = get();
          const now = new Date().toISOString();

          // Use upsert directly on the table (type assertion for new table)
          const { error } = await (supabase as any)
            .from('alfredo_user_state')
            .upsert({
              user_id: user.id,
              daily_mode: state.dailyMode,
              daily_mode_selected_at: state.dailyModeSelectedAt,
              effective_mode: state.effectiveMode,
              rolling_emotional_level: state.emotionalLoad.level,
              rolling_emotional_streak: state.emotionalLoad.streak,
              rolling_emotional_updated_at: state.emotionalLoad.updatedAt,
              rolling_cognitive_level: state.cognitiveOverload.level,
              rolling_cognitive_streak: state.cognitiveOverload.streak,
              rolling_cognitive_updated_at: state.cognitiveOverload.updatedAt,
              physical_constraint_level: state.physicalConstraint.level,
              physical_constraint_reason: state.physicalConstraint.reason,
              physical_constraint_updated_at: state.physicalConstraint.updatedAt,
              people_friction_level: state.peopleFriction.level,
              people_friction_updated_at: state.peopleFriction.updatedAt,
              ui_max_options: state.uiPolicy.maxOptions,
              ui_tone: state.uiPolicy.tone,
              ui_suggest_intensity: state.uiPolicy.suggestIntensity,
              last_dropoff_at: state.lastDropoffAt,
              dropoff_count_week: state.dropoffCountWeek,
              updated_at: now
            }, { onConflict: 'user_id' });

          if (error) {
            console.error('Failed to sync emotion health state:', error);
          } else {
            set({ lastSyncAt: now });
          }
        } catch (err) {
          console.error('Sync error:', err);
        }
      },

      // ============================================================
      // Reset
      // ============================================================
      reset: () => {
        set({
          ...getDefaultState(),
          transitionCard: {
            isVisible: false,
            trigger: null,
            step: 1,
            acknowledgementMessage: '',
            lifeDeclarationMessage: ''
          }
        });
      }
    }),
    {
      name: 'alfredo-emotion-health',
      partialize: (state) => ({
        dailyMode: state.dailyMode,
        dailyModeSelectedAt: state.dailyModeSelectedAt,
        effectiveMode: state.effectiveMode,
        emotionalLoad: state.emotionalLoad,
        cognitiveOverload: state.cognitiveOverload,
        physicalConstraint: state.physicalConstraint,
        peopleFriction: state.peopleFriction,
        confirmLimit: state.confirmLimit,
        uiPolicy: state.uiPolicy,
        lastDropoffAt: state.lastDropoffAt,
        dropoffCountWeek: state.dropoffCountWeek
      })
    }
  )
);

// ============================================================
// Selectors
// ============================================================

export const selectEffectiveMode = (state: EmotionHealthStore) => state.effectiveMode;
export const selectUIPolicy = (state: EmotionHealthStore) => state.uiPolicy;
export const selectDailyMode = (state: EmotionHealthStore) => state.dailyMode;
export const selectTransitionCard = (state: EmotionHealthStore) => state.transitionCard;
export const selectNeedsProtection = (state: EmotionHealthStore) =>
  state.effectiveMode === 'protect' || state.physicalConstraint.level === 'high';
export const selectIsDropoffToday = (state: EmotionHealthStore) => {
  if (!state.lastDropoffAt) return false;
  const today = getTodayDateKey();
  const dropoffDate = new Date(state.lastDropoffAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul'
  }).replace(/\. /g, '-').replace('.', '');
  return today === dropoffDate;
};

/**
 * Check if Daily Onboarding should be shown
 * - Show once per day
 * - Don't show if dailyModeSelectedAt is from today
 */
export const selectShouldShowDailyOnboarding = (state: EmotionHealthStore) => {
  // If no dailyModeSelectedAt, always show
  if (!state.dailyModeSelectedAt) return true;

  // Check if selection was made today
  const today = getTodayDateKey();
  const selectedDate = new Date(state.dailyModeSelectedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul'
  }).replace(/\. /g, '-').replace('.', '');

  // Show if not selected today
  return today !== selectedDate;
};

// ============================================================
// Hooks
// ============================================================

/**
 * Check if transition card should be shown
 * Based on current state and rollout rules
 */
export function shouldShowTransitionCard(state: EmotionHealthStore): TransitionTrigger | null {
  // Don't show if already visible
  if (state.transitionCard.isVisible) return null;

  // Don't show if dropped off today
  if (selectIsDropoffToday(state)) return null;

  // Check triggers in priority order
  if (state.peopleFriction.level === 'clear') {
    return 'peopleFriction';
  }

  if (state.emotionalLoad.level === 'high') {
    return 'emotionalHigh';
  }

  if (state.cognitiveOverload.level === 'high') {
    return 'cognitiveHigh';
  }

  if (state.effectiveMode === 'protect') {
    return 'protectMode';
  }

  return null;
}
