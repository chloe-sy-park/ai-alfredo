import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { lazy, Suspense } from 'react';

// Common Components
import BottomNav from './components/common/BottomNav';
import FloatingBar from './components/common/FloatingBar';
import { BodyDoublingButton } from './components/body-doubling/BodyDoublingButton';
import { NudgeBubble } from './components/nudge/NudgeBubble';
import { NudgeManager } from './components/nudge/NudgeManager';
import ReflectButton from './components/common/ReflectButton';

// Pages - Lazy Loaded
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const WorkOS = lazy(() => import('./pages/WorkOS'));
const LifeOS = lazy(() => import('./pages/LifeOS'));
const Chat = lazy(() => import('./pages/Chat'));
const Report = lazy(() => import('./pages/Report'));
const Settings = lazy(() => import('./pages/Settings'));
const BodyDoubling = lazy(() => import('./pages/BodyDoubling'));

// Entry Pages - Lazy Loaded
const Entry = lazy(() => import('./pages/Entry'));
const WorkEntry = lazy(() => import('./pages/Entry/WorkEntry'));
const LifeEntry = lazy(() => import('./pages/Entry/LifeEntry'));

// Onboarding - Lazy Loaded
const Onboarding = lazy(() => import('./pages/Onboarding'));

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
  const isAuthenticated = useAuthStore(state => state.checkAuthStatus());
  const isOnboarded = useAuthStore(state => state.isOnboarded);

  // 온보딩 여부를 체크하여 라우팅
  if (!isAuthenticated) {
    return (
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    );
  }

  if (!isOnboarded) {
    return (
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </Suspense>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Suspense fallback={<PageLoader />}>
          <div className="flex-1 pb-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<WorkOS />} />
              <Route path="/life" element={<LifeOS />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/report" element={<Report />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/body-doubling" element={<BodyDoubling />} />
              
              {/* Entry Routes */}
              <Route path="/entry" element={<Entry />} />
              <Route path="/entry/work" element={<WorkEntry />} />
              <Route path="/entry/life" element={<LifeEntry />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Suspense>
        
        {/* 네비게이션 바 */}
        <BottomNav />
        
        {/* 플로팅 요소들 */}
        <FloatingBar />
        <BodyDoublingButton />
        <NudgeBubble />
        <NudgeManager />
        <ReflectButton />
      </div>
    </Router>
  );
}

export default App;