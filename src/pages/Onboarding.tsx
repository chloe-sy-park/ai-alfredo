import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../stores/onboardingStore';
import { ChevronLeft } from 'lucide-react';
import {
  Step1Welcome,
  Step2Values,
  Step3Direction,
  Step4Intervention,
  Step5Growth,
  OnboardingProgress
} from '../components/onboarding';

var TOTAL_STEPS = 5;

export default function Onboarding() {
  var navigate = useNavigate();
  var { currentStep, isComplete, prevStep } = useOnboardingStore();

  // 이미 완료된 경우 홈으로
  useEffect(function() {
    if (isComplete) {
      navigate('/');
    }
  }, [isComplete, navigate]);

  function handleBack() {
    if (currentStep > 1) {
      prevStep();
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <Step1Welcome />;
      case 2:
        return <Step2Values />;
      case 3:
        return <Step3Direction />;
      case 4:
        return <Step4Intervention />;
      case 5:
        return <Step5Growth />;
      default:
        return <Step1Welcome />;
    }
  }

  // Step 1은 프로그레스 바 없이
  var showProgress = currentStep > 1;
  var showBackButton = currentStep > 1 && currentStep < 5;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* 상단 네비게이션 */}
      {(showProgress || showBackButton) && (
        <div className="fixed top-0 left-0 right-0 z-10 bg-[#F5F5F5]">
          {/* 뒤로가기 버튼 */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="absolute left-4 top-4 p-2 text-[#999999] hover:text-[#666666] z-20"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          {/* 프로그레스 바 */}
          {showProgress && (
            <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          )}
        </div>
      )}
      
      {/* 스텝 컨텐츠 */}
      <div className={showProgress ? 'pt-12' : ''}>
        {renderStep()}
      </div>
    </div>
  );
}
