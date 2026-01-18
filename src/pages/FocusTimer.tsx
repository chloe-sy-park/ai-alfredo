// FocusTimer.tsx - 집중 타이머 전용 페이지
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Coffee,
  Target,
  Check,
  Volume2,
  VolumeX
} from 'lucide-react';
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
  getFocusSettings,
  saveFocusSettings,
  FocusSettings
} from '../services/focus';
import { getTasksByCategory, Task } from '../services/tasks';

export default function FocusTimerPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<FocusSession | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [todayStats, setTodayStats] = useState(getTodayStats());
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<FocusSettings>(getFocusSettings());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // 태스크 로드
  useEffect(() => {
    const workTasks = getTasksByCategory('work');
    const pendingTasks = workTasks.filter(t => t.status !== 'done');
    setTasks(pendingTasks);

    // 우선순위 높은 태스크 기본 선택
    const highPriority = pendingTasks.find(t => t.priority === 'high');
    if (highPriority) {
      setSelectedTask(highPriority);
    }
  }, []);

  // 세션 및 타이머 업데이트
  useEffect(() => {
    const currentSession = getCurrentSession();
    setSession(currentSession);

    let interval: number;
    if (currentSession && !currentSession.isPaused && !currentSession.completedAt) {
      interval = window.setInterval(() => {
        const latestSession = getCurrentSession();
        if (!latestSession) {
          clearInterval(interval);
          setSession(null);
          return;
        }

        const remaining = getRemainingTime(latestSession);
        setRemainingTime(remaining);
        setProgress(getProgress(latestSession));

        // 시간 종료 체크
        if (remaining <= 0) {
          completeSession(latestSession.id);
          setSession(null);
          setTodayStats(getTodayStats());

          // 알림 소리
          const currentSettings = getFocusSettings();
          if (currentSettings.soundEnabled) {
            playNotificationSound();
          }
        }
      }, 1000);
    } else if (currentSession) {
      setRemainingTime(getRemainingTime(currentSession));
      setProgress(getProgress(currentSession));
    } else {
      // 세션 없을 때 기본값 표시
      setRemainingTime(settings.focusDuration * 60);
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, settings.focusDuration]);

  // 알림 소리 재생
  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleStart = () => {
    const newSession = startFocusSession(
      selectedTask?.id,
      selectedTask?.title || '집중 시간'
    );
    setSession(newSession);
  };

  const handlePause = () => {
    if (!session) return;
    if (session.isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
    setSession(getCurrentSession());
  };

  const handleStop = () => {
    if (!session) return;
    if (confirm('타이머를 중단할까요?')) {
      cancelSession();
      setSession(null);
      setRemainingTime(settings.focusDuration * 60);
      setProgress(0);
    }
  };

  const handleSettingChange = (key: keyof FocusSettings, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveFocusSettings(newSettings);
  };

  const getSessionIcon = () => {
    if (!session) return <Target size={32} className="text-primary" />;
    if (session.type === 'focus') return <Target size={32} className="text-primary" />;
    return <Coffee size={32} className="text-teal-500" />;
  };

  const getSessionTitle = () => {
    if (!session) return selectedTask?.title || '집중할 준비가 됐어요';
    if (session.type === 'focus') return session.taskTitle || '집중 중...';
    if (session.type === 'short_break') return '짧은 휴식';
    return '긴 휴식';
  };

  const getSessionColor = () => {
    if (!session) return '#A996FF';
    if (session.type === 'focus') return '#A996FF';
    return '#4ECDC4';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/work')}
          className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-neutral-600" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">집중 타이머</h1>
        <div className="flex-1" />
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 text-neutral-600'}`}
        >
          <Settings2 size={20} />
        </button>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 세션 상태 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
            {getSessionIcon()}
          </div>
        </div>

        {/* 타이머 디스플레이 */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* 원형 진행 표시 */}
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="116"
                stroke="#E5E5E5"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="116"
                stroke={getSessionColor()}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 116}`}
                strokeDashoffset={`${2 * Math.PI * 116 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* 시간 표시 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-text-primary tracking-tight">
                {formatTime(remainingTime)}
              </p>
              <p className="text-sm text-neutral-500 mt-2 max-w-[180px] truncate">
                {getSessionTitle()}
              </p>
            </div>
          </div>
        </div>

        {/* 태스크 선택 */}
        {!session && (
          <div className="mb-8">
            <button
              onClick={() => setShowTaskSelector(!showTaskSelector)}
              className="w-full p-4 bg-white rounded-2xl shadow-sm border border-neutral-100 text-left hover:border-primary/50 transition-colors"
            >
              <p className="text-xs text-neutral-500 mb-1">집중할 태스크</p>
              <p className="text-sm font-medium text-text-primary">
                {selectedTask?.title || '태스크를 선택하세요'}
              </p>
            </button>

            {showTaskSelector && tasks.length > 0 && (
              <div className="mt-2 bg-white rounded-2xl shadow-lg border border-neutral-100 max-h-[200px] overflow-y-auto">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskSelector(false);
                    }}
                    className={`w-full p-3 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 ${
                      selectedTask?.id === task.id ? 'bg-primary/5 text-primary' : 'text-text-primary'
                    }`}
                  >
                    {selectedTask?.id === task.id && <Check size={14} />}
                    <span className="flex-1 truncate">{task.title}</span>
                    {task.priority === 'high' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">긴급</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {!session ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              <Play size={24} />
              <span className="text-lg font-medium">시작하기</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleStop}
                className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <RotateCcw size={22} />
              </button>
              <button
                onClick={handlePause}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  session.isPaused
                    ? 'bg-primary text-white shadow-primary/30'
                    : 'bg-white text-primary shadow-neutral-200'
                }`}
              >
                {session.isPaused ? <Play size={32} /> : <Pause size={32} />}
              </button>
              <div className="w-14 h-14" /> {/* 균형용 빈 공간 */}
            </>
          )}
        </div>

        {/* 오늘의 통계 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <h3 className="text-sm font-semibold text-text-primary mb-4">오늘의 집중</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{todayStats.focusCount}</p>
              <p className="text-xs text-neutral-500 mt-1">집중 세션</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">{todayStats.totalFocusMinutes}</p>
              <p className="text-xs text-neutral-500 mt-1">집중 시간(분)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-500">{todayStats.completionRate}%</p>
              <p className="text-xs text-neutral-500 mt-1">완료율</p>
            </div>
          </div>
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
            <h3 className="text-sm font-semibold text-text-primary mb-4">타이머 설정</h3>
            <div className="space-y-4">
              {/* 집중 시간 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">집중 시간</span>
                  <span className="text-sm font-medium text-text-primary">{settings.focusDuration}분</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={settings.focusDuration}
                  onChange={(e) => handleSettingChange('focusDuration', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* 짧은 휴식 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">짧은 휴식</span>
                  <span className="text-sm font-medium text-text-primary">{settings.shortBreakDuration}분</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={settings.shortBreakDuration}
                  onChange={(e) => handleSettingChange('shortBreakDuration', Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              {/* 긴 휴식 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">긴 휴식</span>
                  <span className="text-sm font-medium text-text-primary">{settings.longBreakDuration}분</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="5"
                  value={settings.longBreakDuration}
                  onChange={(e) => handleSettingChange('longBreakDuration', Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              {/* 알림음 */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? <Volume2 size={16} className="text-neutral-500" /> : <VolumeX size={16} className="text-neutral-400" />}
                  <span className="text-sm text-neutral-600">알림 소리</span>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-primary' : 'bg-neutral-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
