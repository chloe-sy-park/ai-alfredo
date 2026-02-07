import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import SixMomentOnboarding from './steps/SixMomentOnboarding';

// 스텝 데이터 타입
export interface OnboardingData {
  userName?: string;
  context?: 'work' | 'life' | 'unsure';
  boundary?: 'soft' | 'balanced' | 'firm';
  calendarConnected?: boolean;
  notificationsEnabled?: boolean;
  notificationTimes?: string[];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser, completeOnboarding } = useAuthStore();

  const handleComplete = (data?: Partial<OnboardingData>) => {
    const newData = data || {};

    const user = {
      id: '1',
      name: newData.userName || '',
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
    navigate('/');
  };

  const handleSkip = () => {
    const user = {
      id: '1',
      name: '',
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
    navigate('/');
  };

  return (
    <SixMomentOnboarding
      data={{}}
      onNext={handleComplete}
      onSkip={handleSkip}
    />
  );
}
