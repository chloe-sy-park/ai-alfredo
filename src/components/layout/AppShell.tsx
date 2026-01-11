import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from './BottomNav';
import StatusBar from './StatusBar';

export default function AppShell() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 모바일 키보드 높이 감지
  useEffect(() => {
    const handleResize = () => {
      // visualViewport API로 키보드 높이 계산
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const diff = windowHeight - viewportHeight;
        setKeyboardHeight(diff > 0 ? diff : 0);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="h-full bg-lavender-50 flex flex-col"
      style={{ 
        // iOS Safari 100dvh 지원
        height: '100dvh',
        // 키보드 올라왔을 때 높이 조정
        paddingBottom: keyboardHeight > 0 ? keyboardHeight : undefined 
      }}
    >
      {/* 상단 상태바 */}
      <StatusBar />
      
      {/* 메인 콘텐츠 */}
      <main 
        className="flex-1 overflow-auto scrollbar-hide gpu-accelerate"
        style={{ paddingBottom: keyboardHeight > 0 ? 0 : '5rem' }}
      >
        <Outlet />
      </main>
      
      {/* 하단 네비게이션 - 키보드 올라오면 숨김 */}
      {keyboardHeight === 0 && <BottomNav />}
    </div>
  );
}
