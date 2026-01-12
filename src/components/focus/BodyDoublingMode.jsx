import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, CheckCircle2, Clock, Coffee, Sparkles } from 'lucide-react';

/**
 * 바디더블링 모드
 * Focusmate 스타일: 알프레도가 옆에서 함께 일하는 느낌
 * 
 * 플로우:
 * 1. 체크인: "오늘 뭐 하실 거예요?"
 * 2. 작업: 타이머 + 알프레도가 가끔 응원
 * 3. 체크아웃: "어떠셨어요?"
 */

// 알프레도 응원 메시지 (시간대별)
const ENCOURAGEMENT_MESSAGES = {
  start: [
    "같이 시작해요! 저도 옆에서 일할게요.",
    "좋아요, 집중 모드 ON! 🐧",
    "Boss, 같이 해봐요. 저도 여기 있을게요.",
  ],
  during: [
    "잘하고 있어요! 계속 가요.",
    "집중 잘 되고 있네요 👀",
    "저도 열심히 하고 있어요~",
    "좋은 페이스예요!",
    "한 발 한 발 나아가고 있어요.",
  ],
  halfway: [
    "반 왔어요! 잘하고 있어요.",
    "절반 지났어요. 이 기세로! 💪",
    "중간 체크! 순조롭네요.",
  ],
  almostDone: [
    "거의 다 왔어요! 조금만 더!",
    "막바지예요. 끝까지 가봐요!",
    "마무리 잘 해봐요!",
  ],
  break: [
    "잠깐 쉬어가요. 물 한 잔 어때요?",
    "눈도 쉬고, 스트레칭 해요.",
    "5분만 쉬고 다시 달려요!",
  ],
};

// 알프레도 상태 애니메이션
const ALFREDO_STATES = {
  idle: '🐧',
  working: '📝',
  cheering: '🎉',
  thinking: '🤔',
  coffee: '☕',
};

const BodyDoublingMode = ({ 
  task,
  onComplete, 
  onExit,
  defaultDuration = 25 // 분
}) => {
  // 상태
  const [phase, setPhase] = useState('checkin'); // checkin | working | checkout
  const [goal, setGoal] = useState(task?.title || '');
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [alfredoMessage, setAlfredoMessage] = useState('');
  const [alfredoState, setAlfredoState] = useState('idle');
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [checkoutFeeling, setCheckoutFeeling] = useState(null);
  const [checkoutNote, setCheckoutNote] = useState('');

  // 랜덤 메시지 선택
  const getRandomMessage = useCallback((category) => {
    const messages = ENCOURAGEMENT_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  // 타이머 로직
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
        setTotalFocusTime(t => t + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setPhase('checkout');
      setAlfredoMessage('수고했어요! 어떠셨어요?');
      setAlfredoState('cheering');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 진행률에 따른 알프레도 메시지
  useEffect(() => {
    if (phase !== 'working' || !isActive) return;
    
    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
    const focusMinutes = Math.floor(totalFocusTime / 60);
    
    // 25분마다 휴식 제안
    if (focusMinutes > 0 && focusMinutes % 25 === 0 && totalFocusTime % 60 === 0) {
      setShowBreakPrompt(true);
      setIsActive(false);
      return;
    }
    
    // 진행률에 따른 메시지 (10% 확률로 표시)
    if (Math.random() < 0.003) { // 대략 5분에 한 번
      if (progress >= 90) {
        setAlfredoMessage(getRandomMessage('almostDone'));
        setAlfredoState('cheering');
      } else if (progress >= 45 && progress <= 55) {
        setAlfredoMessage(getRandomMessage('halfway'));
        setAlfredoState('cheering');
      } else {
        setAlfredoMessage(getRandomMessage('during'));
        setAlfredoState('working');
      }
      
      // 3초 후 메시지 숨기기
      setTimeout(() => {
        setAlfredoMessage('');
        setAlfredoState('working');
      }, 4000);
    }
  }, [timeLeft, phase, isActive, duration, totalFocusTime, getRandomMessage]);

  // 체크인 완료
  const handleCheckIn = () => {
    if (!goal.trim()) return;
    setPhase('working');
    setAlfredoMessage(getRandomMessage('start'));
    setAlfredoState('working');
    setIsActive(true);
    
    setTimeout(() => {
      setAlfredoMessage('');
    }, 3000);
  };

  // 체크아웃 완료
  const handleCheckOut = () => {
    onComplete?.({
      task: goal,
      duration: Math.floor(totalFocusTime / 60),
      feeling: checkoutFeeling,
      note: checkoutNote
    });
  };

  // 휴식 후 계속
  const handleContinueAfterBreak = () => {
    setShowBreakPrompt(false);
    setIsActive(true);
    setAlfredoMessage('다시 시작해요!');
    setAlfredoState('working');
    setTimeout(() => setAlfredoMessage(''), 2000);
  };

  // 시간 포맷
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  // ========== 체크인 화면 ==========
  if (phase === 'checkin') {
    return (
      <div className="h-full bg-[#F8F6FF] flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center">
          <button 
            onClick={onExit}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* 알프레도 */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg">
            🐧
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">바디더블링 모드</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">
            저랑 같이 일해요.<br/>
            옆에 있으면 집중이 더 잘 되잖아요.
          </p>

          {/* 체크인 폼 */}
          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                오늘 뭐 하실 거예요?
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="예: 보고서 마무리하기"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]/50 focus:border-[#A996FF]"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                얼마나 집중할까요?
              </label>
              <div className="flex gap-2">
                {[15, 25, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => {
                      setDuration(min);
                      setTimeLeft(min * 60);
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      duration === min
                        ? 'bg-[#A996FF] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#A996FF]'
                    }`}
                  >
                    {min}분
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!goal.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6"
            >
              <Play size={18} />
              같이 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 휴식 프롬프트 ==========
  if (showBreakPrompt) {
    const focusMinutes = Math.floor(totalFocusTime / 60);
    return (
      <div className="h-full bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] flex flex-col items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">☕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {focusMinutes}분 집중했어요!
            </h2>
            <p className="text-gray-500">잠깐 쉬어가요</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">🐧</span>
              <p className="text-sm text-gray-700">
                {focusMinutes >= 50
                  ? "50분 넘게 집중했어요! 대단해요. 눈도 쉬고, 물 한 잔 마시고 오세요."
                  : "25분 집중 완료! 5분만 쉬고 다시 시작하면 더 효율적이에요."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setPhase('checkout');
                setShowBreakPrompt(false);
              }}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold"
            >
              여기서 끝낼게요 ✓
            </button>
            <button
              onClick={handleContinueAfterBreak}
              className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium"
            >
              더 할게요 💪
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 작업 화면 ==========
  if (phase === 'working') {
    return (
      <div className="h-full bg-[#F8F6FF] flex flex-col relative">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={onExit}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Body Doubling
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* 목표 표시 */}
          <div className="text-center mb-8">
            <p className="text-xs text-gray-400 font-medium mb-1">지금 하는 일</p>
            <h2 className="text-xl font-bold text-gray-800">{goal}</h2>
          </div>

          {/* 타이머 */}
          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="112" cy="112" r="100" 
                stroke="#E5E5EA" 
                strokeWidth="8" 
                fill="none" 
              />
              <circle 
                cx="112" cy="112" r="100" 
                stroke="#A996FF" 
                strokeWidth="10" 
                fill="none"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            
            <div className="text-center">
              <div className="text-5xl font-mono font-bold text-gray-800 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {isActive ? '집중 중...' : '일시정지'}
              </p>
            </div>
          </div>

          {/* 알프레도 영역 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 max-w-xs w-full shadow-sm border border-white mb-8">
            <div className="flex items-center gap-3">
              {/* 알프레도 아바타 */}
              <div className={`w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-2xl shadow-md transition-all ${isActive ? 'animate-pulse' : ''}`}>
                {ALFREDO_STATES[alfredoState]}
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 mb-0.5">Alfredo</p>
                <p className="text-sm text-gray-700">
                  {alfredoMessage || (isActive ? "열심히 하고 있어요..." : "일시정지 중이에요")}
                </p>
              </div>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setPhase('checkout');
                setIsActive(false);
              }}
              className="p-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CheckCircle2 size={24} />
            </button>
            
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-16 h-16 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {isActive ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" className="ml-1" />
              )}
            </button>

            <button
              onClick={() => setShowBreakPrompt(true)}
              className="p-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Coffee size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== 체크아웃 화면 ==========
  if (phase === 'checkout') {
    const focusMinutes = Math.floor(totalFocusTime / 60);
    
    return (
      <div className="h-full bg-[#F8F6FF] flex flex-col">
        {/* Header */}
        <div className="p-4">
          <button 
            onClick={onExit}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pb-6 overflow-y-auto">
          {/* 완료 헤더 */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">수고했어요!</h1>
            <p className="text-gray-500">{focusMinutes}분 동안 집중했어요</p>
          </div>

          {/* 완료한 일 */}
          <div className="bg-white/90 rounded-xl p-4 max-w-sm w-full mb-6 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-1">오늘 한 일</p>
            <p className="text-gray-800 font-medium">{goal}</p>
          </div>

          {/* 기분 선택 */}
          <div className="max-w-sm w-full mb-6">
            <p className="text-xs text-gray-400 font-medium mb-3 text-center">
              어떠셨어요?
            </p>
            <div className="flex justify-center gap-4">
              {[
                { emoji: '😊', label: '좋았어요', value: 'good' },
                { emoji: '😐', label: '그냥 그래요', value: 'neutral' },
                { emoji: '😓', label: '힘들었어요', value: 'hard' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCheckoutFeeling(option.value)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    checkoutFeeling === option.value
                      ? 'bg-[#A996FF]/20 border-2 border-[#A996FF]'
                      : 'bg-white border-2 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="text-3xl mb-1">{option.emoji}</span>
                  <span className="text-xs text-gray-500">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 메모 (선택) */}
          <div className="max-w-sm w-full mb-6">
            <p className="text-xs text-gray-400 font-medium mb-2">
              한 줄 메모 (선택)
            </p>
            <input
              type="text"
              value={checkoutNote}
              onChange={(e) => setCheckoutNote(e.target.value)}
              placeholder="예: 생각보다 잘 됐다!"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]/50"
            />
          </div>

          {/* 알프레도 메시지 */}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 max-w-sm w-full mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-lg">
                🐧
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  {checkoutFeeling === 'good' && "대단해요! 이 기세로 다음 것도 해볼까요? 💪"}
                  {checkoutFeeling === 'neutral' && "괜찮아요, 했다는 게 중요해요. 다음엔 더 잘 될 거예요."}
                  {checkoutFeeling === 'hard' && "고생했어요. 힘든데도 끝까지 해냈잖아요. 잠깐 쉬어요."}
                  {!checkoutFeeling && "기분 선택해주시면 맞춤 피드백 드릴게요!"}
                </p>
              </div>
            </div>
          </div>

          {/* 완료 버튼 */}
          <button
            onClick={handleCheckOut}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            완료하기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default BodyDoublingMode;
