import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <main className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
