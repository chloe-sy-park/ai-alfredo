/**
 * Onboarding Flow 타입 정의
 * 향상된 온보딩 경험
 */

/**
 * 온보딩 단계
 */
export type OnboardingStep =
  | 'welcome'         // 환영
  | 'introduction'    // 알프레도 소개
  | 'preferences'     // 선호도 설정
  | 'calendar_connect'// 캘린더 연결
  | 'first_task'      // 첫 할일 추가
  | 'tour'            // 기능 투어
  | 'complete';       // 완료

/**
 * 온보딩 상태
 */
export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  startedAt?: string;
  completedAt?: string;
  isComplete: boolean;
}

/**
 * 단계 정보
 */
export interface StepInfo {
  id: OnboardingStep;
  title: string;
  description: string;
  emoji: string;
  canSkip: boolean;
  estimatedTime?: string;
}

/**
 * 투어 포인트
 */
export interface TourPoint {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 단계별 정보
 */
export const STEP_INFO: Record<OnboardingStep, StepInfo> = {
  welcome: {
    id: 'welcome',
    title: '안녕하세요!',
    description: '알프레도와 함께 시작해요',
    emoji: '👋',
    canSkip: false
  },
  introduction: {
    id: 'introduction',
    title: '알프레도 소개',
    description: '제가 어떻게 도울 수 있는지 알려드릴게요',
    emoji: '🤖',
    canSkip: true,
    estimatedTime: '1분'
  },
  preferences: {
    id: 'preferences',
    title: '선호도 설정',
    description: '당신에게 맞게 조정해요',
    emoji: '⚙️',
    canSkip: true,
    estimatedTime: '2분'
  },
  calendar_connect: {
    id: 'calendar_connect',
    title: '캘린더 연결',
    description: '일정을 가져와요',
    emoji: '📅',
    canSkip: true,
    estimatedTime: '1분'
  },
  first_task: {
    id: 'first_task',
    title: '첫 할 일 추가',
    description: '해야 할 일을 추가해봐요',
    emoji: '✅',
    canSkip: true,
    estimatedTime: '30초'
  },
  tour: {
    id: 'tour',
    title: '기능 둘러보기',
    description: '주요 기능을 빠르게 살펴봐요',
    emoji: '🗺️',
    canSkip: true,
    estimatedTime: '2분'
  },
  complete: {
    id: 'complete',
    title: '준비 완료!',
    description: '이제 시작할 준비가 됐어요',
    emoji: '🎉',
    canSkip: false
  }
};

/**
 * 온보딩 순서
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'introduction',
  'preferences',
  'calendar_connect',
  'first_task',
  'tour',
  'complete'
];

/**
 * 환영 메시지
 */
export const WELCOME_MESSAGES = [
  '반가워요! 알프레도예요.',
  '만나서 반가워요!',
  '안녕하세요, 함께 시작해봐요!'
];
