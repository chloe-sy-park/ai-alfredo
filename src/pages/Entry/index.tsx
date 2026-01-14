import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// Entry 라우터 - context에 따라 Work/Life로 분기
export default function Entry() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!user?.preferences?.context) {
      navigate('/onboarding');
      return;
    }

    // context에 따라 적절한 Entry로 이동
    if (user.preferences.context === 'work') {
      navigate('/entry/work');
    } else if (user.preferences.context === 'life') {
      navigate('/entry/life');
    } else {
      // unsure인 경우 Work로 기본 설정
      navigate('/entry/work');
    }
  }, [navigate, user]);

  return null;
}