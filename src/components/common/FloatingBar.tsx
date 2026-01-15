import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const FloatingBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 특정 페이지에서는 플로팅 바 숨기기
  const hiddenPaths = ['/onboarding', '/login', '/body-doubling', '/entry', '/chat'];
  const shouldHide = hiddenPaths.some(function(path) {
    return location.pathname.startsWith(path);
  });
  
  if (shouldHide) return null;
  
  const handleAddClick = function() {
    // 현재 페이지에 따라 다른 액션 실행
    if (location.pathname === '/work') {
      navigate('/entry/work');
    } else if (location.pathname === '/life') {
      navigate('/entry/life');
    } else {
      navigate('/entry');
    }
  };
  
  return (
    <button
      onClick={handleAddClick}
      className="
        fixed bottom-20 right-4 z-40
        w-14 h-14 rounded-full
        bg-[#A996FF] text-white
        shadow-lg shadow-[#A996FF]/30
        flex items-center justify-center
        hover:bg-[#9785EE] active:scale-95
        transition-all duration-200
      "
      aria-label="새로 추가"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};

export default FloatingBar;