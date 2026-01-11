import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback, isAuthenticated, isOnboarded } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      // 에러 파라미터 확인
      if (errorParam) {
        setError(`인증 오류: ${errorParam}`);
        setIsProcessing(false);
        return;
      }

      // 코드 없음
      if (!code) {
        setError('인증 코드가 없습니다.');
        setIsProcessing(false);
        return;
      }

      // CSRF 검증
      const savedState = localStorage.getItem('oauth_state');
      if (state && savedState && state !== savedState) {
        setError('보안 검증 실패. 다시 시도해주세요.');
        setIsProcessing(false);
        return;
      }

      try {
        const success = await handleCallback(code);
        
        if (success) {
          // 성공 시 리다이렉트
          const store = useAuthStore.getState();
          if (store.isOnboarded) {
            navigate('/', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else {
          setError('인증 처리에 실패했습니다.');
          setIsProcessing(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  // 이미 인증된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !isProcessing) {
      navigate(isOnboarded ? '/' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, isOnboarded, isProcessing, navigate]);

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">😢</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">로그인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-md w-full p-8 text-center">
        {/* 펭귄 로딩 애니메이션 */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-25" />
          <div className="relative w-24 h-24 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">🐧</span>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">로그인 처리 중...</h1>
        <p className="text-gray-500">잠시만 기다려주세요. 알프레도가 준비 중이에요!</p>

        {/* 로딩 바 */}
        <div className="mt-6 h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
            style={{ width: '60%' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
