import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useDrawerStore } from './stores/drawerStore';
import { useAlfredoStore } from './stores/alfredoStore';
import { usePostActionStore } from './stores/postActionStore';
import { lazy, Suspense, useEffect } from 'react';

// Common Components
import FloatingBar from './components/common/FloatingBar';
import Drawer from './components/common/Drawer';
import { PostActionToast } from './components/common';
import { BodyDoublingButton } from './components/body-doubling/BodyDoublingButton';
import { NudgeBubble } from './components/nudge/NudgeBubble';
import { NudgeManager } from './components/nudge/NudgeManager';
import ReflectButton from './components/common/ReflectButton';
import { NotificationPanel } from './components/notification';

// Pages - Lazy Loaded
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Calendar = lazy(() => import('./pages/Calendar'));
const WorkOS = lazy(() => import('./pages/WorkOS'));
const LifeOS = lazy(() => import('./pages/LifeOS'));
const Chat = lazy(() => import('./pages/Chat'));
const Report = lazy(() => import('./pages/Report'));
const Settings = lazy(() => import('./pages/Settings'));
const BodyDoubling = lazy(() => import('./pages/BodyDoubling'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Help = lazy(() => import('./pages/Help'));

// Entry Pages - Lazy Loaded
const Entry = lazy(() => import('./pages/Entry'));
const WorkEntry = lazy(() => import('./pages/Entry/WorkEntry'));
const LifeEntry = lazy(() => import('./pages/Entry/LifeEntry'));

// Onboarding - Lazy Loaded
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Auth Callback Pages - Lazy Loaded
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const OutlookCallback = lazy(() => import('./pages/OutlookCallback'));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-5xl animate-bounce mb-2">🐧</div>
      <div className="text-gray-500 text-sm">로딩 중...</div>
    </div>
  </div>
);

function App() {
  // checkAuthStatus는 함수이므로 selector에서 직접 호출하면 안됨
  // isAuthenticated와 accessToken 상태를 직접 가져와서 판단
  const isAuthenticated = useAuthStore(state => state.isAuthenticated && !!state.accessToken);
  const isOnboarded = useAuthStore(state => state.isOnboarded);
  const user = useAuthStore(state => state.user);
  const { isOpen: isDrawerOpen, close: closeDrawer } = useDrawerStore();
  const { initialize: initAlfredo, preferences: alfredoPrefs } = useAlfredoStore();
  const { currentBriefing, dismissBriefing } = usePostActionStore();

  // 알프레도 스토어 초기화 (로그인 후)
  useEffect(() => {
    if (isAuthenticated && isOnboarded && user?.email && !alfredoPrefs) {
      initAlfredo(user.email);
    }
  }, [isAuthenticated, isOnboarded, user?.email, alfredoPrefs, initAlfredo]);

  // 온보딩 여부를 체크하여 라우팅
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/outlook/callback" element={<OutlookCallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (!isOnboarded) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/outlook/callback" element={<OutlookCallback />} />
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
            <Route path="/work" element={<WorkOS />} />
            <Route path="/life" element={<LifeOS />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/report" element={<Report />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/body-doubling" element={<BodyDoubling />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/help" element={<Help />} />

            {/* Entry Routes */}
            <Route path="/entry" element={<Entry />} />
            <Route path="/entry/work" element={<WorkEntry />} />
            <Route path="/entry/life" element={<LifeEntry />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Suspense>
      
      {/* 플로팅 바 (채팅 입력 + 퀵액션) */}
      <FloatingBar />
      
      {/* 드로어 메뉴 */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* 알림 패널 */}
      <NotificationPanel />

      {/* PRD: PostAction 브리핑 토스트 */}
      <PostActionToast
        briefing={currentBriefing}
        onDismiss={dismissBriefing}
      />

      {/* 기타 플로팅 요소들 */}
      <BodyDoublingButton />
      <NudgeBubble />
      <NudgeManager />
      <ReflectButton />
    </div>
  );
}

export default App;
