import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import StatusBar from './StatusBar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-lavender-50 flex flex-col">
      {/* 상단 상태바 */}
      <StatusBar />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>
      
      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
