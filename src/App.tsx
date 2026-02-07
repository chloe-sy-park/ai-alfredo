import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useDrawerStore } from './stores/drawerStore';
import { lazy, Suspense } from 'react';

// Common Components (MVP에 필요한 것만)
import FloatingBar from './components/common/FloatingBar';
import Drawer from './components/common/Drawer';
import { ErrorContainer, NetworkStatusBanner } from './components/error/ErrorComponents';

// Pages - Lazy Loaded (MVP 핵심만)
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Chat = lazy(() => import('./pages/Chat'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));

// Onboarding - Lazy Loaded
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Auth Callback Pages - Lazy Loaded
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Lift History Page
const LiftHistory = lazy(() => import('./pages/LiftHistory'));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-2 animate-scale-in">
        <img
          src="/assets/alfredo/avatar/alfredo-avatar-80.png"
          alt="알프레도"
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-5xl">🎩</span>'; }}
        />
      </div>
      <div style={{ color: 'var(--text-secondary)' }} className="text-sm">로딩 중...</div>
    </div>
  </div>
);

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated && !!state.accessToken);
  const isOnboarded = useAuthStore(state => state.isOnboarded);
  const { isOpen: isDrawerOpen, close: closeDrawer } = useDrawerStore();

  // 인증 안 된 상태
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // 온보딩 안 된 상태
  if (!isOnboarded) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <div className="flex-1 pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/lift" element={<LiftHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>

      {/* 플로팅 바 (채팅 입력 + 퀵액션) */}
      <FloatingBar />

      {/* 드로어 메뉴 */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* 에러 처리 UI */}
      <ErrorContainer />
      <NetworkStatusBanner />
    </div>
  );
}

export default App;
