import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

// 각 스텝 컴포넌트
import OnboardingLayout from './components/OnboardingLayout';
import ProgressIndicator from './components/ProgressIndicator';
import Welcome from './steps/Welcome';
import CapabilityReveal from './steps/CapabilityReveal';
import LightContext from './steps/LightContext';
import CalendarConnect from './steps/CalendarConnect';
import IntegrationPreview from './steps/IntegrationPreview';
import BoundaryPreview from './steps/BoundaryPreview';
import NotificationSetup from './steps/NotificationSetup';
import TrustMoment from './steps/TrustMoment';
import EnterCore from './steps/EnterCore';

// 스텝 데이터 타입
export interface OnboardingData {
  userName?: string;
  context?: 'work' | 'life' | 'unsure';
  boundary?: 'soft' | 'balanced' | 'firm';
  calendarConnected?: boolean;
  notificationsEnabled?: boolean;
  notificationTimes?: string[];
}

const STEPS = [
  { component: Welcome },
  { component: CapabilityReveal },
  { component: LightContext },
  { component: CalendarConnect },
  { component: IntegrationPreview },
  { component: BoundaryPreview },
  { component: NotificationSetup },
  { component: TrustMoment },
  { component: EnterCore },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser, completeOnboarding } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});

  const CurrentStepComponent = STEPS[currentStep].component;

  const handleNext = (stepData?: any) => {
    const newData = { ...data, ...stepData };
    setData(newData);

    if (currentStep === STEPS.length - 1) {
      // 마지막 스텝 완료
      const user = {
        id: '1',
        name: newData.userName || 'Boss',
        email: 'user@example.com',
        onboarded: true,
        preferences: {
          context: newData.context || 'work',
          boundary: newData.boundary || 'balanced',
          calendarConnected: newData.calendarConnected || false,
          notifications: {
            enabled: newData.notificationsEnabled || false,
            times: newData.notificationTimes || [],
          },
        },
      };

      setUser(user);
      completeOnboarding();
      localStorage.setItem('alfredo_onboarded', 'true');
      
      // Entry 페이지로 이동
      navigate('/entry');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    // Skip 시 기본값으로 완료 처리
    const defaultData = {
      userName: 'Boss',
      context: 'unsure' as const,
      boundary: 'balanced' as const,
      calendarConnected: false,
      notificationsEnabled: false,
      notificationTimes: [],
    };

    const user = {
      id: '1',
      name: 'Boss',
      email: 'user@example.com',
      onboarded: true,
      preferences: {
        context: 'unsure' as const,
        boundary: 'balanced' as const,
        calendarConnected: false,
        notifications: {
          enabled: false,
          times: [],
        },
      },
    };

    setUser(user);
    completeOnboarding();
    localStorage.setItem('alfredo_onboarded', 'true');
    navigate('/entry');
  };

  return (
    <OnboardingLayout>
      <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />
      
      <AnimatePresence mode="wait">
        <CurrentStepComponent
          key={currentStep}
          data={data}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </AnimatePresence>
    </OnboardingLayout>
  );
}
