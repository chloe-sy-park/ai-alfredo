import { Pause, X } from 'lucide-react';
import { useTimerStore } from '../../stores';

export default function TimerDisplay() {
  const { seconds, targetSeconds, taskName, stop, reset } = useTimerStore();
  
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = targetSeconds > 0 ? (seconds / targetSeconds) * 100 : 0;

  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Progress Ring */}
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="3"
          />
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="#A996FF"
            strokeWidth="3"
            strokeDasharray={`${progress} 100`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Time & Task */}
      <div className="flex-1">
        <div className="text-lg font-semibold text-[#1A1A1A]">
          {formatTime(seconds)}
        </div>
        {taskName && (
          <div className="text-xs text-[#666666] truncate">{taskName}</div>
        )}
      </div>
      
      {/* Controls */}
      <button onClick={stop} className="w-8 h-8 flex items-center justify-center">
        <Pause size={20} className="text-[#666666]" />
      </button>
      <button onClick={reset} className="w-8 h-8 flex items-center justify-center">
        <X size={20} className="text-[#999999]" />
      </button>
    </div>
  );
}
