/**
 * 🚀 OnboardingCheck - 온보딩 완료 여부 확인 컴포넌트
 * 
 * 첫 방문 시 OnboardingV3로 리다이렉트
 */

import { useEffect, useState } from 'react';

const ONBOARDING_KEY = 'alfredo_onboarding_complete';

export function useOnboardingStatus() {
  const [isComplete, setIsComplete] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === 'true';
    } catch {
      return false;
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setIsComplete(true);
    } catch (e) {
      console.warn('Failed to save onboarding status', e);
    }
  };
  
  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      setIsComplete(false);
    } catch (e) {
      console.warn('Failed to reset onboarding status', e);
    }
  };
  
  return {
    isComplete,
    isLoading,
    completeOnboarding,
    resetOnboarding
  };
}

export default useOnboardingStatus;
