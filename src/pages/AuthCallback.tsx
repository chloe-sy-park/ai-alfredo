import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback, isOnboarded } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`로그인이 취소되었어요: ${errorParam}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('인증 코드가 없어요');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      const success = await handleCallback(code);
      
      if (success) {
        // 온보딩 완료 여부에 따라 라우팅
        if (isOnboarded) {
          navigate('/', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        setError('로그인에 실패했어요. 다시 시도해주세요.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate, isOnboarded]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lavender-100 to-lavender-50 flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">😢</div>
        <p className="text-gray-600 text-center">{error}</p>
        <p className="text-sm text-gray-400 mt-2">잠시 후 로그인 페이지로 이동해요...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-100 to-lavender-50 flex flex-col items-center justify-center p-6">
      <div className="text-6xl mb-4 animate-bounce">🐧</div>
      <p className="text-gray-600">로그인 중...</p>
      <div className="mt-4 flex gap-1">
        <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
