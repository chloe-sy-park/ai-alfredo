import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const { loginWithGoogle, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-lavender-50 to-white flex flex-col items-center justify-center p-6">
      {/* 펭귄 캐릭터 */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-purple-200/50 rounded-full blur-xl animate-pulse" />
        <div className="relative w-32 h-32 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
          <span className="text-6xl">🐧</span>
        </div>
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">알프레도</h1>
      <p className="text-gray-500 mb-8 text-center max-w-xs">
        당신의 하루를 다정하게 돌봐드리는<br />
        AI 버틀러 펭귄
      </p>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Google 로그인 버튼 */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full max-w-xs flex items-center justify-center gap-3 py-3.5 px-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 font-medium">연결 중...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">Google로 시작하기</span>
          </>
        )}
      </button>

      {/* 설명 */}
      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        로그인 시 Google Calendar와 Gmail에 접근하여<br />
        일정 및 이메일을 관리할 수 있습니다.
      </p>

      {/* 하단 펭귄 애니메이션 */}
      <div className="absolute bottom-8 flex items-center gap-2 text-gray-400 text-sm">
        <span className="animate-bounce">🐧</span>
        <span>버틀러 펭귄이 대기 중...</span>
      </div>
    </div>
  );
}
