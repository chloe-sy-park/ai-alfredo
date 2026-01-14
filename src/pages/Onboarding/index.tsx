import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

// Steps
import Welcome from './steps/Welcome';
import CapabilityReveal from './steps/CapabilityReveal';
import LightContext from './steps/LightContext';
import BoundaryPreview from './steps/BoundaryPreview';
import TrustMoment from './steps/TrustMoment';
import EnterCore from './steps/EnterCore';

// Components
import OnboardingLayout from './components/OnboardingLayout';

export type OnboardingData = {
  userName?: string;
  context?: 'work' | 'life' | 'unsure';
  boundary?: 'soft' | 'balanced' | 'firm';
};

const STEPS = [
  { component: Welcome, showProgress: false },
  { component: CapabilityReveal, showProgress: true },
  { component: LightContext, showProgress: true },
  { component: BoundaryPreview, showProgress: true },
  { component: TrustMoment, showProgress: true },
  { component: EnterCore, showProgress: false }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});

  const handleNext = (stepData?: Partial<OnboardingData>) => {
    if (stepData) {
      setData(prev => ({ ...prev, ...stepData }));
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // 온보딩 완료
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    // 사용자 정보 저장
    const userData = {
      id: 'user-' + Date.now(),
      name: data.userName || 'Boss',
      email: 'user@example.com',
      onboarded: true,
      preferences: {
        context: data.context || 'unsure',
        boundary: data.boundary || 'balanced'
      }
    };

    setUser(userData);
    localStorage.setItem('alfredo_onboarded', 'true');
    
    // 홈으로 이동
    navigate('/home');
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const showProgress = STEPS[currentStep].showProgress;

  return (
    <OnboardingLayout 
      currentStep={currentStep}
      totalSteps={STEPS.length}
      showProgress={showProgress}
      onSkip={currentStep === 0 ? handleSkip : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <CurrentStepComponent 
            data={data}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}