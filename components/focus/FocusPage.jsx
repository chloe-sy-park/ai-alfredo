import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Common Components
import { AlfredoAvatar } from '../common';

const FocusTimer = ({ task, onComplete, onExit }) => {
  const [duration] = useState(task?.duration ? task.duration * 60 : 25 * 60);
  const [timeLeft, setTimeLeft] = useState(task?.duration ? task.duration * 60 : 25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // 총 집중 시간 (초)
  const [breakReminderShown, setBreakReminderShown] = useState({}); // 이미 보여준 리마인더 추적
  
  // 휴식 리마인더 시점 (분 단위)
  const breakPoints = [25, 50, 90];
  
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
        setTotalFocusTime(t => t + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);
  
  // 휴식 리마인더 체크
  useEffect(() => {
    const focusMinutes = Math.floor(totalFocusTime / 60);
    breakPoints.forEach(point => {
      if (focusMinutes >= point && !breakReminderShown[point]) {
        setShowBreakReminder(true);
        setBreakReminderShown(prev => ({ ...prev, [point]: true }));
        setIsActive(false); // 타이머 일시정지
      }
    });
  }, [totalFocusTime]);
  
  const handleDismissBreak = () => {
    setShowBreakReminder(false);
    setIsActive(true); // 타이머 재개
  };
  
  const handleTakeBreak = () => {
    setShowBreakReminder(false);
    // 5분 후 자동 재개는 FocusCompletionScreen의 휴식과 유사하게 처리
  };
  
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = ((duration - timeLeft) / duration) * 100;
  const focusMinutes = Math.floor(totalFocusTime / 60);
  
  // 휴식 리마인더 팝업
  if (showBreakReminder) {
    return (
      <div className="h-full bg-[#F0EBFF] flex flex-col items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-6 max-w-sm w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">☕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {focusMinutes}분 집중했어요!
            </h2>
            <p className="text-gray-500">대단해요, Boss! 👏</p>
          </div>
          
          <div className="bg-[#F5F3FF] rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">🐧</span>
              <p className="text-sm text-gray-700">
                {focusMinutes >= 90 
                  ? "90분 넘게 집중하셨어요! 정말 대단해요. 이제 좀 쉬어가세요. 몸도 마음도 충전이 필요해요."
                  : focusMinutes >= 50
                  ? "50분이나 집중했어요! 슬슬 눈도 쉬고, 물 한 잔 어때요?"
                  : "25분 집중 완료! 짧게 스트레칭 하고 오면 다음 집중이 더 잘 돼요."}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleTakeBreak}
              className="w-full py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl font-semibold"
            >
              5분 휴식하기 ☕
            </button>
            <button
              onClick={handleDismissBreak}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
            >
              계속 집중할게요 💪
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-[#F0EBFF] text-gray-800 flex flex-col relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <button onClick={onExit} className="p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-800 shadow-sm border border-white/50 transition-all">
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        {/* Task Info */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#A996FF]/20 shadow-sm text-[11px] font-bold tracking-widest text-[#A996FF] mb-5">
            <Zap size={12} fill="currentColor" />
            {task ? 'FOCUS MODE' : 'QUICK SESSION'}
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-2 text-gray-800 max-w-[280px] mx-auto">
            {task ? task.title : 'Deep Work'}
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            {task ? task.project : '집중해서 작업하세요'}
          </p>
        </div>
        
        {/* Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="128" cy="128" r="110" stroke="#E5E5EA" strokeWidth="6" fill="none" />
            <circle 
              cx="128" cy="128" r="110" 
              stroke="#A996FF" 
              strokeWidth="10" 
              fill="none"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="flex flex-col items-center">
            <div className="text-6xl font-mono font-bold tracking-tighter tabular-nums text-gray-800">
              {formatTime(timeLeft)}
            </div>
            {!isActive && timeLeft !== 0 && timeLeft !== duration && (
              <span className="text-[#A996FF] text-xs font-bold uppercase tracking-widest mt-2">Paused</span>
            )}
            {timeLeft === 0 && (
              <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-2">Finished!</span>
            )}
          </div>
        </div>
        
        {/* Alfredo Message */}
        {task && (
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-xl p-4 mb-8 max-w-xs w-full shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center text-sm">🐧</div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Alfredo says</span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {task.deadline 
                    ? "마감이 임박한 업무예요. 지금 끝내두면 오후가 훨씬 가벼워질 겁니다." 
                    : "에너지가 좋을 때 어려운 일부터 처리하죠. 시작이 반입니다."}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center gap-8">
          <button onClick={resetTimer} className="p-4 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-400 shadow-sm">
            <RefreshCw size={20} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-[#A996FF]/30"
          >
            {isActive ? (
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            ) : (
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
            )}
          </button>
          
          <button onClick={onComplete} className="p-4 rounded-full bg-[#A996FF]/10 text-[#A996FF] hover:bg-[#A996FF]/20 transition-colors border border-[#A996FF]/20">
            <CheckCircle2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// === Focus Completion Screen (다음 추천) ===
const FocusCompletionScreen = ({ completedTask, nextTask, onStartNext, onTakeBreak, onGoHome, stats }) => {
  const [showBreakTimer, setShowBreakTimer] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(5 * 60); // 5분
  
  useEffect(() => {
    let interval = null;
    if (showBreakTimer && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft(t => t - 1);
      }, 1000);
    } else if (breakTimeLeft === 0) {
      setShowBreakTimer(false);
    }
    return () => clearInterval(interval);
  }, [showBreakTimer, breakTimeLeft]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 휴식 화면
  if (showBreakTimer) {
    return (
      <div className="h-full bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-6">☕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">휴식 시간</h2>
        <p className="text-gray-500 mb-8">잠시 쉬고 다시 시작해요</p>
        
        <div className="text-5xl font-mono font-bold text-emerald-600 mb-8">
          {formatTime(breakTimeLeft)}
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 max-w-xs w-full mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl">🐧</span>
            <div>
              <p className="text-sm text-gray-700">
                물 한 잔 마시고, 스트레칭 해보세요.
                <br />5분 후에 다시 달려봐요!
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowBreakTimer(false)}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold"
        >
          휴식 끝내기
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-[#F0EBFF] flex flex-col p-6">
      {/* 축하 헤더 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">완료!</h1>
        <p className="text-gray-500 mb-6">"{completedTask?.title}"</p>
        
        {/* 통계 */}
        <div className="flex gap-6 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A996FF]">{stats?.focusTime || 25}분</p>
            <p className="text-xs text-gray-400">집중 시간</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500">{stats?.todayCompleted || 1}개</p>
            <p className="text-xs text-gray-400">오늘 완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A996FF]">🔥{stats?.streak || 1}</p>
            <p className="text-xs text-gray-400">연속</p>
          </div>
        </div>
        
        {/* 알프레도 메시지 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 max-w-sm w-full mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg">
              🐧
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                {stats?.todayCompleted >= 3 
                  ? "대단해요, Boss! 오늘 벌써 3개째예요. 이 페이스면 오늘 목표 완전 달성이에요! 💪"
                  : "잘했어요, Boss! 하나씩 해치우는 거예요. 다음 것도 해볼까요?"}
              </p>
            </div>
          </div>
        </div>
        
        {/* 다음 추천 */}
        {nextTask && (
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 font-medium mb-2 text-center">다음은 이거 어때요?</p>
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-4 shadow-sm border border-[#A996FF]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#A996FF]/10 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-[#A996FF]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{nextTask.title}</p>
                  <p className="text-xs text-gray-400">{nextTask.project} {nextTask.deadline && `· ${nextTask.deadline}`}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBreakTimer(true)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  5분 쉬고 시작
                </button>
                <button
                  onClick={() => onStartNext(nextTask)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1"
                >
                  <Zap size={14} />
                  바로 시작
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!nextTask && (
          <div className="bg-emerald-50 rounded-xl p-4 max-w-sm w-full text-center">
            <p className="text-emerald-700 font-medium">🎊 오늘 할 일 다 끝냈어요!</p>
            <p className="text-emerald-600 text-sm mt-1">푹 쉬세요, Boss!</p>
          </div>
        )}
      </div>
      
      {/* 하단 버튼 */}
      <div className="pt-4">
        <button
          onClick={onGoHome}
          className="w-full py-3 text-gray-500 text-sm font-medium"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

// === Phase 7: 반복 일정/루틴 시스템 ===

export { FocusTimer, FocusCompletionScreen };
export default FocusTimer;
