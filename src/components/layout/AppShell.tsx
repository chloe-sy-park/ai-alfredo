import { Outlet } from 'react-router-dom';
import { Drawer } from '../drawer';
import { FloatingBar } from '../floating-bar';
import { useNavigate } from 'react-router-dom';

export default function AppShell() {
  const navigate = useNavigate();

  const handleChatSubmit = (message: string) => {
    // 채팅 페이지로 이동 + 메시지 전달
    navigate('/chat', { state: { initialMessage: message } });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'task':
        // TODO: 태스크 추가 바텀시트
        break;
      case 'condition':
        // TODO: 컨디션 변경 팝업
        break;
      case 'memo':
        // TODO: 메모 바텀시트
        break;
      case 'timer':
        // TODO: 타이머 시작
        break;
      case 'schedule':
        navigate('/calendar');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <main className="flex-1 pb-24 overflow-auto">
        <Outlet />
      </main>
      
      <FloatingBar 
        onChatSubmit={handleChatSubmit} 
        onQuickAction={handleQuickAction} 
      />
      <Drawer />
    </div>
  );
}
