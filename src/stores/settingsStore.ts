import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 톤 프리셋
export type TonePreset = 'gentle_friend' | 'mentor' | 'ceo' | 'cheerleader' | 'silent_partner';

// 5축 톤 설정 (0-100)
export interface ToneAxes {
  warmth: number;      // 따뜻함 (0: 사무적 ↔ 100: 따뜻함)
  proactivity: number; // 능동성 (0: 수동적 ↔ 100: 능동적)
  directness: number;  // 직설성 (0: 완곡 ↔ 100: 직설)
  humor: number;       // 유머 (0: 진지 ↔ 100: 유머러스)
  pressure: number;    // 압박 (0: 느긋 ↔ 100: 강한 압박)
}

// 프라이버시 레벨
export type PrivacyLevel = 'open_book' | 'selective' | 'minimal';

// 뷰 모드
export type ViewMode = 'integrated' | 'work' | 'life';

// 알림 설정
export interface NotificationSettings {
  enabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
  morningBriefing: boolean;
  eveningWrapup: boolean;
  taskReminders: boolean;
  meetingReminders: boolean;
  focusTimeProtection: boolean;
}

// 우선순위 가중치
export interface PriorityWeights {
  deadline: number;
  starred: number;
  waiting: number;
  duration: number;
  deferred: number;
  scheduled: number;
}

interface SettingsState {
  // 톤 설정
  tonePreset: TonePreset;
  toneAxes: ToneAxes;
  
  // 프라이버시
  privacyLevel: PrivacyLevel;
  
  // 뷰 모드
  defaultView: ViewMode;
  
  // 알림
  notifications: NotificationSettings;
  
  // 우선순위 가중치
  priorityWeights: PriorityWeights;
  
  // 온보딩 데이터
  onboardingData: {
    completed: boolean;
    currentPhase: number;
    answers: Record<string, any>;
  };
  
  // Actions
  setTonePreset: (preset: TonePreset) => void;
  setToneAxes: (axes: Partial<ToneAxes>) => void;
  setPrivacyLevel: (level: PrivacyLevel) => void;
  setDefaultView: (view: ViewMode) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  setPriorityWeights: (weights: Partial<PriorityWeights>) => void;
  updateOnboarding: (data: Partial<SettingsState['onboardingData']>) => void;
}

// 톤 프리셋 기본값
const TONE_PRESETS: Record<TonePreset, ToneAxes> = {
  gentle_friend: { warmth: 85, proactivity: 60, directness: 40, humor: 50, pressure: 20 },
  mentor: { warmth: 70, proactivity: 70, directness: 60, humor: 30, pressure: 40 },
  ceo: { warmth: 50, proactivity: 80, directness: 80, humor: 20, pressure: 60 },
  cheerleader: { warmth: 90, proactivity: 90, directness: 30, humor: 70, pressure: 30 },
  silent_partner: { warmth: 60, proactivity: 30, directness: 50, humor: 20, pressure: 10 }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 기본값: 따뜻한 친구
      tonePreset: 'gentle_friend',
      toneAxes: TONE_PRESETS.gentle_friend,
      
      privacyLevel: 'selective',
      defaultView: 'integrated',
      
      notifications: {
        enabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        morningBriefing: true,
        eveningWrapup: true,
        taskReminders: true,
        meetingReminders: true,
        focusTimeProtection: true
      },
      
      priorityWeights: {
        deadline: 30,
        starred: 25,
        waiting: 15,
        duration: 10,
        deferred: 15,
        scheduled: 5
      },
      
      onboardingData: {
        completed: false,
        currentPhase: 1,
        answers: {}
      },
      
      setTonePreset: (preset) => set({
        tonePreset: preset,
        toneAxes: TONE_PRESETS[preset]
      }),
      
      setToneAxes: (axes) => set((state) => ({
        toneAxes: { ...state.toneAxes, ...axes }
      })),
      
      setPrivacyLevel: (level) => set({ privacyLevel: level }),
      
      setDefaultView: (view) => set({ defaultView: view }),
      
      setNotifications: (settings) => set((state) => ({
        notifications: { ...state.notifications, ...settings }
      })),
      
      setPriorityWeights: (weights) => set((state) => ({
        priorityWeights: { ...state.priorityWeights, ...weights }
      })),
      
      updateOnboarding: (data) => set((state) => ({
        onboardingData: { ...state.onboardingData, ...data }
      }))
    }),
    {
      name: 'alfredo-settings'
    }
  )
);
