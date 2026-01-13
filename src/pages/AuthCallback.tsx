import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    login();
    navigate('/');
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-lavender-50 flex items-center justify-center">
      <LoadingSpinner size="lg" message="로그인 중..." />
    </div>
  );
}
