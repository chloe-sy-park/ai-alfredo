// ReflectButton.tsx - 플로팅 Reflect 버튼
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useBriefingStore } from '../../stores/briefingStore';
import { useLocation } from 'react-router-dom';

const ReflectButton: React.FC = () => {
  const location = useLocation();
  const { refreshBriefing, isLoading } = useBriefingStore();
  const [isSpinning, setIsSpinning] = useState(false);
  
  // 온보딩이나 Entry 화면에서는 숨김
  const hideOnPaths = ['/onboarding', '/entry', '/work-entry', '/life-entry'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHide) return null;
  
  const handleReflect = async () => {
    setIsSpinning(true);
    await refreshBriefing();
    
    // 애니메이션 완료 대기
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
  };
  
  return (
    <button
      onClick={handleReflect}
      disabled={isLoading}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-[#A996FF] text-white shadow-lg
        flex items-center justify-center
        hover:bg-[#9080E6] active:scale-95
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <RefreshCw 
        className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`}
      />
    </button>
  );
};

export default ReflectButton;