import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import BottomNav from './components/common/BottomNav';
import FloatingBar from './components/common/FloatingBar';
import { BodyDoublingButton } from './components/body-doubling/BodyDoublingButton';
import { NudgeBubble } from './components/nudge/NudgeBubble';
import { NudgeManager } from './components/nudge/NudgeManager';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import WorkOS from './pages/WorkOS';
import LifeOS from './pages/LifeOS';
import Chat from './pages/Chat';
import Report from './pages/Report';
import Settings from './pages/Settings';
import BodyDoubling from './pages/BodyDoubling';

// Entry Pages  
import Entry from './pages/Entry';
import WorkEntry from './pages/Entry/WorkEntry';
import LifeEntry from './pages/Entry/LifeEntry';

// Onboarding
import Onboarding from './pages/Onboarding';

// Reflect 버튼
import ReflectButton from './components/common/ReflectButton';

function App() {
  const isAuthenticated = useAuthStore(state => state.checkAuthStatus());
  const isOnboarded = useAuthStore(state => state.isOnboarded);

  // 온보딩 여부를 체크하여 라우팅
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  if (!isOnboarded) {
    return (
      <Router>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
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