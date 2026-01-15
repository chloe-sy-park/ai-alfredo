/**
 * Onboarding 서비스
 */

import {
  OnboardingStep,
  OnboardingState,
  ONBOARDING_STEPS,
  WELCOME_MESSAGES
} from './types';

const ONBOARDING_KEY = 'alfredo_onboarding';

/**
 * 온보딩 상태 로드
 */
export function loadOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load onboarding state:', e);
  }
  return {
    currentStep: 'welcome',
    completedSteps: [],
    skippedSteps: [],
    isComplete: false
  };
}

/**
 * 온보딩 상태 저장
 */
function saveOnboardingState(state: OnboardingState): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
}

/**
 * 온보딩 시작
 */
export function startOnboarding(): OnboardingState {
  const state: OnboardingState = {
    currentStep: 'welcome',
    completedSteps: [],
    skippedSteps: [],
    startedAt: new Date().toISOString(),
    isComplete: false
  };
  saveOnboardingState(state);
  return state;
}

/**
 * 다음 단계로 이동
 */
export function nextStep(): OnboardingState {
  const state = loadOnboardingState();
  const currentIndex = ONBOARDING_STEPS.indexOf(state.currentStep);

  if (!state.completedSteps.includes(state.currentStep)) {
    state.completedSteps.push(state.currentStep);
  }

  if (currentIndex < ONBOARDING_STEPS.length - 1) {
    state.currentStep = ONBOARDING_STEPS[currentIndex + 1];
  }

  if (state.currentStep === 'complete') {
    state.isComplete = true;
    state.completedAt = new Date().toISOString();
  }

  saveOnboardingState(state);
  return state;
}

/**
 * 단계 건너뛰기
 */
export function skipStep(): OnboardingState {
  const state = loadOnboardingState();

  if (!state.skippedSteps.includes(state.currentStep)) {
    state.skippedSteps.push(state.currentStep);
  }

  return nextStep();
}

/**
 * 특정 단계로 이동
 */
export function goToStep(step: OnboardingStep): OnboardingState {
  const state = loadOnboardingState();
  state.currentStep = step;
  saveOnboardingState(state);
  return state;
}

/**
 * 온보딩 완료
 */
export function completeOnboarding(): void {
  const state = loadOnboardingState();
  state.isComplete = true;
  state.completedAt = new Date().toISOString();
  state.currentStep = 'complete';
  saveOnboardingState(state);
}

/**
 * 온보딩 리셋
 */
export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
}

/**
 * 온보딩 완료 여부
 */
export function isOnboardingComplete(): boolean {
  return loadOnboardingState().isComplete;
}

/**
 * 진행률 계산
 */
export function getProgress(): number {
  const state = loadOnboardingState();
  const completed = state.completedSteps.length + state.skippedSteps.length;
  return Math.round((completed / (ONBOARDING_STEPS.length - 1)) * 100);
}

/**
 * 환영 메시지
 */
export function getWelcomeMessage(): string {
  return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
}
