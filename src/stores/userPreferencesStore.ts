// userPreferencesStore.ts - 사용자 설정 관리
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 4축 슬라이더 설정 타입 (PRD 펭귄 육성 시스템)
export interface PenguinPersonality {
  // 말투: 0 = 🌸 다정하게, 100 = 🔥 직설적으로
  toneStyle: number;
  // 알림빈도: 0 = 🤫 필요할 때만, 100 = 💬 자주자주
  notificationFrequency: number;
  // 데이터깊이: 0 = 😌 핵심만, 100 = 🔬 다 보여줘
  dataDepth: number;
  // 동기부여방식: 0 = 🌊 느긋하게, 100 = 🏆 도전적으로
  motivationStyle: number;
}

interface UserPreferencesState {
  // Role Blend: 0 = 의사, 100 = 집사
  roleBlend: number;

  // Intervention Level: 0 = 매우 적게, 100 = 매우 많이
  interventionLevel: number;

  // Tone: casual, formal, motivating, analytical
  tone: string;

  // 4축 펭귄 성격 슬라이더
  penguinPersonality: PenguinPersonality;

  // Actions
  updatePreferences: (preferences: Partial<Pick<UserPreferencesState, 'roleBlend' | 'interventionLevel' | 'tone'>>) => void;
  updatePenguinPersonality: (personality: Partial<PenguinPersonality>) => void;
  resetPreferences: () => void;
}

const defaultPenguinPersonality: PenguinPersonality = {
  toneStyle: 30, // 기본: 다정하게 쪽
  notificationFrequency: 50, // 기본: 적당히
  dataDepth: 30, // 기본: 핵심만
  motivationStyle: 50 // 기본: 균형
};

const defaultPreferences = {
  roleBlend: 50, // 균형
  interventionLevel: 50, // 보통
  tone: 'formal',
  penguinPersonality: defaultPenguinPersonality
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      updatePreferences: (preferences) => {
        set((state) => ({
          ...state,
          ...preferences
        }));
      },

      updatePenguinPersonality: (personality) => {
        set((state) => ({
          ...state,
          penguinPersonality: {
            ...state.penguinPersonality,
            ...personality
          }
        }));
      },

      resetPreferences: () => {
        set(defaultPreferences);
      }
    }),
    {
      name: 'alfredo-user-preferences',
      partialize: (state) => ({
        roleBlend: state.roleBlend,
        interventionLevel: state.interventionLevel,
        tone: state.tone,
        penguinPersonality: state.penguinPersonality
      })
    }
  )
);