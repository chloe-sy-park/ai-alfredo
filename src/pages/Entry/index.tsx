import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// Entry 라우터 - context에 따라 Work/Life로 분기
export default function Entry() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    // context에 따라 적절한 Entry로 이동
    // context가 없으면 기본적으로 work entry로 이동
    const context = user?.preferences?.context;

    if (context === 'life') {
      navigate('/entry/life', { replace: true });
    } else {
      // work, unsure, 또는 미설정인 경우 모두 work entry로 이동
      navigate('/entry/work', { replace: true });
    }
  }, [navigate, user]);

  return null;
}