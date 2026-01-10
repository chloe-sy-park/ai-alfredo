import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import { useState } from 'react';

export default function Login() {
  const { loginWithGoogle } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-100 to-lavender-50 flex flex-col items-center justify-center p-6">
      {/* 로고 */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="text-8xl mb-4">🐧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">알프레도</h1>
        <p className="text-gray-600">당신의 AI 버틀러</p>
      </div>

      {/* 가치 제안 */}
      <div className="mb-8 space-y-3 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
        <p className="text-gray-700">
          <span className="text-lavender-500 font-medium">ADHD 친화적</span>으로 설계된
        </p>
        <p className="text-gray-700">
          <span className="text-lavender-500 font-medium">물어보지 않고</span> 알아서 도와주는
        </p>
        <p className="text-gray-700">
          <span className="text-lavender-500 font-medium">오늘 진짜 나답게 살았나</span>를 도와주는
        </p>
      </div>

      {/* 로그인 버튼 */}
      <div className="w-full max-w-sm space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Button
          onClick={handleGoogleLogin}
          isLoading={isLoading}
          className="w-full"
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Google로 시작하기
        </Button>

        <p className="text-xs text-center text-gray-500">
          계속하면 <a href="#" className="underline">이용약관</a>과{' '}
          <a href="#" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주합니다.
        </p>
      </div>

      {/* 하단 미리보기 이미지 */}
      <div className="mt-12 opacity-50">
        <p className="text-xs text-gray-400 text-center">
          "오늘 밤 자기 전에 '오늘 진짜 나답게 살았다'라고<br />
          느끼는 삶을 위해"
        </p>
      </div>
    </div>
  );
}
