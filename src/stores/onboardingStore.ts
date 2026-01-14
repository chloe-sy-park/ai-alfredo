import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserDirection = 'work' | 'life' | 'both' | 'auto' | null;

interface OnboardingState {
  currentStep: number;
  selectedDirection: UserDirection;
  isComplete: boolean;
  
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setDirection: (direction: UserDirection) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      selectedDirection: null,
      isComplete: false,
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 5) 
      })),
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),
      goToStep: (step) => set({ currentStep: step }),
      setDirection: (direction) => set({ selectedDirection: direction }),
      complete: () => set({ isComplete: true }),
      reset: () => set({ currentStep: 1, selectedDirection: null, isComplete: false }),
    }),
    { name: 'alfredo-onboarding' }
  )
);
