/**
 * Life OS Store
 *
 * Sleep, Condition, Check-in, Travel Mode 상태 관리
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';

// ============================================================
// 타입 정의
// ============================================================

export type ConditionState = 'good' | 'ok' | 'low';
export type CheckinTag = 'play' | 'travel' | 'social' | 'rest' | 'other';
export type SleepSource = 'estimated' | 'corrected_by_user' | 'imported';
export type ConfidenceStars = 1 | 2 | 3;

export interface SleepWindow {
  date: string;
  bedtimeTs: string | null;
  waketimeTs: string | null;
  durationMin: number | null;
  confidenceStars: ConfidenceStars;
  source: SleepSource;
}

export interface EnergyCurve {
  [hour: string]: number;  // 0-3
}

export interface ConditionDaily {
  date: string;
  state: ConditionState;
  scoreInternal?: number;
  energyCurve: EnergyCurve;
  drivers?: {
    sleepComponent?: number;
    checkinComponent?: number;
    calendarComponent?: number;
    sleepDurationMin?: number;
    checkinTags?: string[];
  };
}

export interface Checkin {
  id: string;
  date: string;
  tag: CheckinTag;
  note?: string;
}

export interface TravelModeState {
  enabled: boolean;
  sessionId?: string;
  startDate?: string;
  policy?: {
    allowMustWorkItems?: boolean;
    hideKPIs?: boolean;
    hideGoals?: boolean;
  };
}

export interface SleepCorrection {
  date: string;
  bedtimeTs: string;
  waketimeTs: string;
}

// ============================================================
// Store 정의
// ============================================================

interface LifeOSState {
  // Sleep
  sleepWindow: SleepWindow | null;
  sleepLoading: boolean;
  sleepError: string | null;

  // Condition
  condition: ConditionDaily | null;
  conditionLoading: boolean;
  conditionError: string | null;

  // Check-in
  todayCheckins: Checkin[];
  checkinsLoading: boolean;

  // Travel Mode
  travelMode: TravelModeState;

  // 마지막 fetch 시간
  lastFetched: {
    sleep?: string;
    condition?: string;
    checkins?: string;
    travelMode?: string;
  };

  // Actions
  fetchSleepWindow: (date: string) => Promise<void>;
  correctSleep: (correction: SleepCorrection) => Promise<void>;
  confirmSleepAccurate: (date: string) => Promise<void>;
  recomputeSleep: (date: string, rawSignals?: Record<string, string | null>) => Promise<void>;

  fetchCondition: (date: string) => Promise<void>;
  recomputeCondition: (date: string) => Promise<void>;

  submitCheckin: (date: string, tag: CheckinTag, note?: string) => Promise<void>;
  fetchCheckins: (date: string) => Promise<void>;

  toggleTravelMode: (enabled: boolean, policy?: TravelModeState['policy']) => Promise<void>;
  fetchTravelMode: () => Promise<void>;

  // Utility
  clearLifeOSData: () => void;
  getTodayDate: () => string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// Helper: API 호출
async function callEdgeFunction(
  path: string,
  method: string = 'POST',
  body?: Record<string, unknown>
): Promise<Response> {
  const authState = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authState.getAuthHeader(),
  };

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response;
}

// Helper: 오늘 날짜 (로컬)
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useLifeOSStore = create<LifeOSState>()(
  persist(
    (set, get) => ({
      // Initial state
      sleepWindow: null,
      sleepLoading: false,
      sleepError: null,

      condition: null,
      conditionLoading: false,
      conditionError: null,

      todayCheckins: [],
      checkinsLoading: false,

      travelMode: {
        enabled: false,
      },

      lastFetched: {},

      // ============================================================
      // Sleep Actions
      // ============================================================

      fetchSleepWindow: async (date: string) => {
        set({ sleepLoading: true, sleepError: null });

        try {
          const response = await callEdgeFunction(`daily-conditions/${date}`, 'GET');
          const result = await response.json();

          if (result.success && result.data) {
            // daily-conditions에서 sleep 데이터 추출
            // 또는 별도 sleep_records 조회
            // TODO: sleep_records 전용 endpoint 추가
            set({
              sleepWindow: result.data.sleep_window || null,
              sleepLoading: false,
              lastFetched: { ...get().lastFetched, sleep: new Date().toISOString() },
            });
          } else {
            set({
              sleepWindow: null,
              sleepLoading: false,
            });
          }
        } catch (error) {
          console.error('fetchSleepWindow error:', error);
          set({
            sleepError: error instanceof Error ? error.message : 'Failed to fetch sleep window',
            sleepLoading: false,
          });
        }
      },

      recomputeSleep: async (date: string, rawSignals?: Record<string, string | null>) => {
        set({ sleepLoading: true, sleepError: null });

        try {
          const response = await callEdgeFunction('sleep-recompute', 'POST', {
            date,
            raw_signals: rawSignals,
          });
          const result = await response.json();

          if (result.success && result.data?.sleepWindow) {
            set({
              sleepWindow: {
                date,
                bedtimeTs: result.data.sleepWindow.bedtime_ts,
                waketimeTs: result.data.sleepWindow.waketime_ts,
                durationMin: result.data.sleepWindow.duration_min,
                confidenceStars: result.data.sleepWindow.confidence_stars,
                source: result.data.sleepWindow.source,
              },
              sleepLoading: false,
            });

            // Condition도 자동 recompute
            get().recomputeCondition(date);
          } else {
            set({ sleepLoading: false });
          }
        } catch (error) {
          console.error('recomputeSleep error:', error);
          set({
            sleepError: error instanceof Error ? error.message : 'Failed to recompute sleep',
            sleepLoading: false,
          });
        }
      },

      correctSleep: async (correction: SleepCorrection) => {
        set({ sleepLoading: true, sleepError: null });

        try {
          const response = await callEdgeFunction('sleep-correct', 'POST', {
            date: correction.date,
            bedtimeTs: correction.bedtimeTs,
            waketimeTs: correction.waketimeTs,
          });
          const result = await response.json();

          if (result.success && result.data?.sleepWindow) {
            const sw = result.data.sleepWindow;
            set({
              sleepWindow: {
                date: correction.date,
                bedtimeTs: sw.bedtime_ts,
                waketimeTs: sw.waketime_ts,
                durationMin: sw.duration_min,
                confidenceStars: 3,  // 사용자 정정은 항상 최고 신뢰도
                source: 'corrected_by_user',
              },
              sleepLoading: false,
            });

            // Condition 자동 recompute
            get().recomputeCondition(correction.date);
          } else {
            throw new Error(result.error?.message || 'Failed to correct sleep');
          }
        } catch (error) {
          console.error('correctSleep error:', error);
          set({
            sleepError: error instanceof Error ? error.message : 'Failed to correct sleep',
            sleepLoading: false,
          });
        }
      },

      confirmSleepAccurate: async (date: string) => {
        // "맞아요" 선택 시 - 추정값 그대로 유지, confidence 증가 가능
        // 현재는 특별한 액션 없이 UI만 닫음
        console.log('Sleep confirmed accurate for:', date);
      },

      // ============================================================
      // Condition Actions
      // ============================================================

      fetchCondition: async (date: string) => {
        set({ conditionLoading: true, conditionError: null });

        try {
          const response = await callEdgeFunction(`daily-conditions/${date}`, 'GET');
          const result = await response.json();

          if (result.success && result.data) {
            const data = result.data;
            set({
              condition: {
                date,
                state: data.state || 'ok',
                scoreInternal: data.score_internal,
                energyCurve: data.energy_curve || {},
                drivers: data.drivers,
              },
              conditionLoading: false,
              lastFetched: { ...get().lastFetched, condition: new Date().toISOString() },
            });
          } else {
            set({
              condition: null,
              conditionLoading: false,
            });
          }
        } catch (error) {
          console.error('fetchCondition error:', error);
          set({
            conditionError: error instanceof Error ? error.message : 'Failed to fetch condition',
            conditionLoading: false,
          });
        }
      },

      recomputeCondition: async (date: string) => {
        set({ conditionLoading: true, conditionError: null });

        try {
          const response = await callEdgeFunction('condition-recompute', 'POST', { date });
          const result = await response.json();

          if (result.success && result.data?.computed) {
            const computed = result.data.computed;
            set({
              condition: {
                date,
                state: computed.state,
                scoreInternal: computed.score,
                energyCurve: computed.energyCurve,
                drivers: computed.drivers,
              },
              conditionLoading: false,
            });
          } else {
            set({ conditionLoading: false });
          }
        } catch (error) {
          console.error('recomputeCondition error:', error);
          set({
            conditionError: error instanceof Error ? error.message : 'Failed to recompute condition',
            conditionLoading: false,
          });
        }
      },

      // ============================================================
      // Check-in Actions
      // ============================================================

      fetchCheckins: async (date: string) => {
        set({ checkinsLoading: true });

        try {
          const response = await callEdgeFunction(`checkins?date=${date}`, 'GET');
          const result = await response.json();

          if (result.success && result.data) {
            set({
              todayCheckins: result.data.map((c: Record<string, unknown>) => ({
                id: c.id,
                date: c.date,
                tag: c.tag,
                note: c.note,
              })),
              checkinsLoading: false,
              lastFetched: { ...get().lastFetched, checkins: new Date().toISOString() },
            });
          } else {
            set({
              todayCheckins: [],
              checkinsLoading: false,
            });
          }
        } catch (error) {
          console.error('fetchCheckins error:', error);
          set({ checkinsLoading: false });
        }
      },

      submitCheckin: async (date: string, tag: CheckinTag, note?: string) => {
        set({ checkinsLoading: true });

        try {
          // 낙관적 업데이트
          const tempId = `temp-${Date.now()}`;
          const newCheckin: Checkin = { id: tempId, date, tag, note };
          set({ todayCheckins: [...get().todayCheckins, newCheckin] });

          const response = await callEdgeFunction('checkin', 'POST', {
            date,
            tag,
            note,
            travel_session_id: get().travelMode.sessionId,
          });
          const result = await response.json();

          if (result.success && result.data?.checkin) {
            // 임시 ID를 실제 ID로 교체
            set({
              todayCheckins: get().todayCheckins.map(c =>
                c.id === tempId ? { ...c, id: result.data.checkin.id } : c
              ),
              checkinsLoading: false,
            });

            // Condition 자동 recompute
            get().recomputeCondition(date);
          } else {
            // 실패 시 롤백
            set({
              todayCheckins: get().todayCheckins.filter(c => c.id !== tempId),
              checkinsLoading: false,
            });
          }
        } catch (error) {
          console.error('submitCheckin error:', error);
          set({ checkinsLoading: false });
        }
      },

      // ============================================================
      // Travel Mode Actions
      // ============================================================

      fetchTravelMode: async () => {
        try {
          const response = await callEdgeFunction('travel-mode', 'GET');
          const result = await response.json();

          if (result.success && result.data) {
            set({
              travelMode: {
                enabled: result.data.mode_enabled || false,
                sessionId: result.data.id,
                startDate: result.data.start_date,
                policy: result.data.policy,
              },
              lastFetched: { ...get().lastFetched, travelMode: new Date().toISOString() },
            });
          }
        } catch (error) {
          console.error('fetchTravelMode error:', error);
        }
      },

      toggleTravelMode: async (enabled: boolean, policy?: TravelModeState['policy']) => {
        // 낙관적 업데이트
        const previousState = get().travelMode;
        set({
          travelMode: { ...previousState, enabled, policy: policy || previousState.policy },
        });

        try {
          const response = await callEdgeFunction('travel-mode', 'POST', {
            enabled,
            policy,
          });
          const result = await response.json();

          if (result.success && result.data) {
            set({
              travelMode: {
                enabled: result.data.mode_enabled,
                sessionId: result.data.id,
                startDate: result.data.start_date,
                policy: result.data.policy,
              },
            });

            // Condition 자동 recompute (에너지 보정 적용)
            get().recomputeCondition(get().getTodayDate());
          } else {
            // 롤백
            set({ travelMode: previousState });
          }
        } catch (error) {
          console.error('toggleTravelMode error:', error);
          set({ travelMode: previousState });
        }
      },

      // ============================================================
      // Utility Actions
      // ============================================================

      clearLifeOSData: () => {
        set({
          sleepWindow: null,
          sleepLoading: false,
          sleepError: null,
          condition: null,
          conditionLoading: false,
          conditionError: null,
          todayCheckins: [],
          checkinsLoading: false,
          travelMode: { enabled: false },
          lastFetched: {},
        });
      },

      getTodayDate: () => getTodayDateString(),
    }),
    {
      name: 'life-os-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 필수 데이터만 persist
        sleepWindow: state.sleepWindow,
        condition: state.condition,
        travelMode: state.travelMode,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

// ============================================================
// Selector Hooks
// ============================================================

export const useSleepWindow = () => useLifeOSStore((s) => s.sleepWindow);
export const useCondition = () => useLifeOSStore((s) => s.condition);
export const useConditionState = () => useLifeOSStore((s) => s.condition?.state);
export const useEnergyCurve = () => useLifeOSStore((s) => s.condition?.energyCurve);
export const useTravelMode = () => useLifeOSStore((s) => s.travelMode);
export const useCheckins = () => useLifeOSStore((s) => s.todayCheckins);
