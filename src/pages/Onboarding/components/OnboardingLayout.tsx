import { ReactNode } from 'react';
import ProgressIndicator from './ProgressIndicator';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
  onSkip?: () => void;
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  showProgress = true,
  onSkip
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F0FF] to-white flex flex-col">
      {/* 헤더 영역 */}
      <div className="px-6 pt-12 pb-4">
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* 진행 표시 */}
      {showProgress && (
        <div className="px-6 pb-8">
          <ProgressIndicator 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className="flex-1 px-6 pb-12">
        {children}
      </div>
    </div>
  );
}