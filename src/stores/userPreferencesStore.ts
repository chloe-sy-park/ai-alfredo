// userPreferencesStore.ts - 사용자 설정 관리
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferencesState {
  // Role Blend: 0 = 의사, 100 = 집사
  roleBlend: number;
  
  // Intervention Level: 0 = 매우 적게, 100 = 매우 많이
  interventionLevel: number;
  
  // Tone: casual, formal, motivating, analytical
  tone: string;
  
  // Actions
  updatePreferences: (preferences: Partial<Pick<UserPreferencesState, 'roleBlend' | 'interventionLevel' | 'tone'>>) => void;
  resetPreferences: () => void;
}

const defaultPreferences = {
  roleBlend: 50, // 균형
  interventionLevel: 50, // 보통
  tone: 'formal'
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
      
      resetPreferences: () => {
        set(defaultPreferences);
      }
    }),
    {
      name: 'alfredo-user-preferences',
      partialize: (state) => ({
        roleBlend: state.roleBlend,
        interventionLevel: state.interventionLevel,
        tone: state.tone
      })
    }
  )
);