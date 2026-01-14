import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings2, Coffee, Target } from 'lucide-react';
import { 
  FocusSession, 
  getCurrentSession, 
  startFocusSession, 
  pauseSession, 
  resumeSession, 
  completeSession,
  cancelSession,
  getRemainingTime,
  getProgress,
  getTodayStats,
  getFocusSettings
} from '../../services/focus';
import { formatRemainingTime } from '../../services/tasks';

interface FocusTimerProps {
  currentTask?: { id: string; title: string } | null;
}

export function FocusTimer({ currentTask }: FocusTimerProps) {
  var [session, setSession] = useState<FocusSession | null>(null);
  var [remainingTime, setRemainingTime] = useState(0);
  var [progress, setProgress] = useState(0);
  var [todayStats, setTodayStats] = useState(getTodayStats());
  var [showSettings, setShowSettings] = useState(false);
  
  // 세션 및 타이머 업데이트
  useEffect(function() {
    var currentSession = getCurrentSession();
    setSession(currentSession);
    
    var interval: number;
    if (currentSession && !currentSession.isPaused && !currentSession.completedAt) {
      interval = window.setInterval(function() {
        var remaining = getRemainingTime(currentSession);
        setRemainingTime(remaining);
        setProgress(getProgress(currentSession));
        
        // 시간 종료 체크
        if (remaining <= 0) {
          completeSession(currentSession.id);
          setSession(null);
          setTodayStats(getTodayStats());
          
          // 알림 (나중에 구현)
          var settings = getFocusSettings();
          if (settings.soundEnabled) {
            // 소리 재생
          }
        }
      }, 1000);
    } else if (currentSession) {
      setRemainingTime(getRemainingTime(currentSession));
      setProgress(getProgress(currentSession));
    }
    
    return function() {
      if (interval) clearInterval(interval);
    };
  }, [session]);
  
  function handleStart() {
    var newSession = startFocusSession(
      currentTask?.id,
      currentTask?.title || '집중 시간'
    );
    setSession(newSession);
  }
  
  function handlePause() {
    if (!session) return;
    if (session.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
    setSession(getCurrentSession());
  }
  
  function handleStop() {
    if (!session) return;
    if (confirm('타이머를 중단할까요?')) {
      cancelSession();
      setSession(null);
      setRemainingTime(0);
      setProgress(0);
    }
  }
  
  function getSessionIcon() {
    if (!session) return <Target size={24} />;
    if (session.type === 'focus') return <Target size={24} />;
    return <Coffee size={24} />;
  }
  
  function getSessionTitle() {
    if (!session) return '집중 시간';
    if (session.type === 'focus') return session.taskTitle || '집중 시간';
    if (session.type === 'short_break') return '짧은 휴식';
    return '긴 휴식';
  }
  
  function getSessionColor() {
    if (!session) return '#A996FF';
    if (session.type === 'focus') return '#A996FF';
    return '#4ECDC4';
  }
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
          {getSessionIcon()}
          <span>집중 타이머</span>
        </h2>
        
        <button
          onClick={function() { setShowSettings(!showSettings); }}
          className="p-2 hover:bg-[#F5F5F5] rounded-lg"
        >
          <Settings2 size={18} className="text-[#666666]" />
        </button>
      </div>
      
      {/* 타이머 디스플레이 */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {/* 원형 진행 표시 */}
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#E5E5E5"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke={getSessionColor()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          
          {/* 시간 표시 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-[#1A1A1A]">
              {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
            </p>
            <p className="text-sm text-[#666666] mt-1">
              {getSessionTitle()}
            </p>
          </div>
        </div>
      </div>
      
      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {!session ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-[#A996FF] text-white rounded-xl hover:bg-[#8B7BE8]"
          >
            <Play size={20} />
            <span>시작</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] rounded-lg hover:bg-[#E5E5E5]"
            >
              {session.isPaused ? <Play size={18} /> : <Pause size={18} />}
              <span>{session.isPaused ? '재개' : '일시정지'}</span>
            </button>
            <button
              onClick={handleStop}
              className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
      </div>
      
      {/* 오늘의 통계 */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E5E5E5]">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A996FF]">{todayStats.focusCount}</p>
          <p className="text-xs text-[#999999]">집중 세션</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#1A1A1A]">{todayStats.totalFocusMinutes}</p>
          <p className="text-xs text-[#999999]">집중 시간(분)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4ECDC4]">{todayStats.completionRate}%</p>
          <p className="text-xs text-[#999999]">완료율</p>
        </div>
      </div>
      
      {/* 설정 패널 (나중에 구현) */}
      {showSettings && (
        <div className="mt-4 p-4 bg-[#F5F5F5] rounded-lg">
          <p className="text-sm text-[#666666]">설정 기능은 준비중입니다</p>
        </div>
      )}
    </div>
  );
}
