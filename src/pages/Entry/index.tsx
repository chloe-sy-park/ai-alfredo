import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

// Entry 라우터 - context에 따라 Work/Life로 분기
export default function Entry() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const hasNavigated = useRef(false);

  useEffect(() => {
    // 이미 네비게이트했으면 중복 실행 방지
    if (hasNavigated.current) return;

    // context에 따라 적절한 Entry로 이동
    const context = user?.preferences?.context;
    const targetPath = context === 'life' ? '/entry/life' : '/entry/work';

    hasNavigated.current = true;
    navigate(targetPath, { replace: true });
  }, [navigate, user?.preferences?.context]);

  // 리다이렉트 중 로딩 UI 표시
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-text-secondary text-sm">준비 중...</p>
    </div>
  );
}