import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ToastProvider } from './components/common/Toast';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Work from './pages/Work';
import Life from './pages/Life';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import AuthCallback from './pages/AuthCallback';
import Report from './pages/Report';

// Layout
import AppShell from './components/layout/AppShell';

function App() {
  const { isAuthenticated, isLoading, isOnboarded } = useAuthStore();

  // OAuth 콜백은 항상 접근 가능해야 함
  if (window.location.pathname === '/auth/callback') {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lavender-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="알프레도 깨우는 중..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 로그인 됐지만 온보딩 미완료
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <ToastProvider>
      <Routes>
        {/* Chat은 AppShell 밖에서 독립적으로 렌더링 */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/report" element={<Report />} />
        
        {/* 나머지는 AppShell 내부 */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/life" element={<Life />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
