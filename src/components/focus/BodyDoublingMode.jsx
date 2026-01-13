import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Play, Pause, CheckCircle2, Coffee, Sparkles } from 'lucide-react';

/**
 * 바디더블링 모드 v2
 * Focusmate 스타일: 알프레도가 옆에서 함께 일하는 느낌
 * 
 * 개선사항:
 * - 50개+ 응원 메시지
 * - 알프레도 행동 다양화 (커피, 책, 스트레칭 등)
 * - 5분마다 체크인
 * - ADHD 친화적 미세 성취 축하
 * - 시각적 변화로 지루함 방지
 */

// 알프레도 응원 메시지 (확장판 - 50개+)
const ENCOURAGEMENT_MESSAGES = {
  start: [
    "같이 시작해요! 저도 옆에서 일할게요.",
    "좋아요, 집중 모드 ON! 🐧",
    "Boss, 같이 해봐요. 저도 여기 있을게요.",
    "오늘도 같이 달려봐요!",
    "저도 준비됐어요. 시작해볼까요?",
    "함께라면 더 잘 될 거예요.",
    "좋은 선택이에요! 저도 옆에서 응원할게요.",
    "자, 같이 한 발씩 가봐요!",
  ],
  during: [
    "잘하고 있어요! 계속 가요.",
    "집중 잘 되고 있네요 👀",
    "저도 열심히 하고 있어요~",
    "좋은 페이스예요!",
    "한 발 한 발 나아가고 있어요.",
    "그 기세 좋아요!",
    "묵묵히 하는 거, 멋져요.",
    "저도 옆에서 같이 하고 있어요.",
    "Boss 집중하는 모습 보기 좋네요.",
    "흐름 좋아요, 계속 가요!",
    "차분하게 잘 하고 있어요.",
    "이 페이스면 충분해요.",
    "조급해하지 않아도 돼요.",
    "천천히 해도 괜찮아요.",
    "지금 이 순간에 집중해요.",
  ],
  fiveMin: [
    "5분 지났어요! 잘 하고 있어요.",
    "벌써 5분! 좋은 시작이에요.",
    "5분 집중 성공 ✓",
    "작은 5분이 모여 큰 성과가 돼요.",
  ],
  tenMin: [
    "10분 돌파! 대단해요.",
    "10분째 집중 중! 💪",
    "어느새 10분이나 했네요.",
    "10분 완료, 잘 하고 있어요!",
  ],
  fifteenMin: [
    "15분! 정말 잘 하고 있어요.",
    "15분 집중, 쉽지 않은 건데 해냈어요.",
    "벌써 15분이에요. 멋져요!",
  ],
  halfway: [
    "반 왔어요! 잘하고 있어요.",
    "절반 지났어요. 이 기세로! 💪",
    "중간 체크! 순조롭네요.",
    "반환점 돌았어요! 조금만 더!",
    "50% 달성! 끝이 보여요.",
    "절반 완료, 나머지도 할 수 있어요.",
  ],
  almostDone: [
    "거의 다 왔어요! 조금만 더!",
    "막바지예요. 끝까지 가봐요!",
    "마무리 잘 해봐요!",
    "끝이 코앞이에요!",
    "마지막 스퍼트! 💨",
    "거의 다 됐어요, 파이팅!",
    "조금만 더 버텨요!",
  ],
  break: [
    "잠깐 쉬어가요. 물 한 잔 어때요?",
    "눈도 쉬고, 스트레칭 해요.",
    "5분만 쉬고 다시 달려요!",
    "휴식도 일의 일부예요.",
    "잠깐 멈춰도 괜찮아요.",
    "숨 한 번 크게 쉬어요.",
  ],
  struggling: [
    "힘들어도 괜찮아요. 여기 있잖아요.",
    "잠깐 쉬어가도 돼요.",
    "완벽하지 않아도 괜찮아요.",
    "오늘 컨디션이 안 좋을 수도 있어요.",
    "앉아만 있어도 대단한 거예요.",
    "포기하지 않는 것만으로 충분해요.",
  ],
  complete: [
    "해냈어요! 정말 대단해요! 🎉",
    "끝까지 했네요. 자랑스러워요!",
    "완료! Boss 최고예요!",
    "수고했어요. 정말 잘했어요.",
    "목표 달성! 축하해요! 🎊",
  ],
};

// 알프레도 상태 & 행동 (확장)
const ALFREDO_STATES = {
  idle: { emoji: '🐧', action: '대기 중' },
  working: { emoji: '📝', action: '같이 일하는 중' },
  typing: { emoji: '⌨️', action: '뭔가 쓰는 중' },
  reading: { emoji: '📖', action: '자료 읽는 중' },
  coffee: { emoji: '☕', action: '커피 마시는 중' },
  stretching: { emoji: '🙆', action: '스트레칭 중' },
  thinking: { emoji: '🤔', action: '고민하는 중' },
  cheering: { emoji: '🎉', action: '응원 중' },
  relaxed: { emoji: '😌', action: '쉬는 중' },
  focused: { emoji: '🎯', action: '집중하는 중' },
  writing: { emoji: '✍️', action: '메모하는 중' },
  music: { emoji: '🎧', action: '음악 듣는 중' },
};

// 알프레도가 하는 행동들 (랜덤으로 바뀜)
const ALFREDO_ACTIVITIES = [
  { state: 'working', duration: 60 },
  { state: 'typing', duration: 30 },
  { state: 'reading', duration: 45 },
  { state: 'coffee', duration: 20 },
  { state: 'thinking', duration: 25 },
  { state: 'focused', duration: 50 },
  { state: 'writing', duration: 35 },
  { state: 'music', duration: 40 },
];

const BodyDoublingMode = ({ 
  task,
  onComplete, 
  onEnd,
  onExit,
  defaultDuration = 25
}) => {
  // 상태
  const [phase, setPhase] = useState('checkin');
  const [goal, setGoal] = useState(task?.title || '');
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [alfredoMessage, setAlfredoMessage] = useState('');
  const [alfredoState, setAlfredoState] = useState('idle');
  const [alfredoActivity, setAlfredoActivity] = useState('같이 시작할 준비 중');
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [checkoutFeeling, setCheckoutFeeling] = useState(null);
  const [checkoutNote, setCheckoutNote] = useState('');
  const [milestones, setMilestones] = useState({ five: false, ten: false, fifteen: false, half: false });
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');
  
  const activityTimerRef = useRef(null);

  // 랜덤 메시지 선택
  const getRandomMessage = useCallback((category) => {
    const messages = ENCOURAGEMENT_MESSAGES[category];
    if (!messages || messages.length === 0) return '';
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  // 랜덤 알프레도 활동 선택
  const pickRandomActivity = useCallback(() => {
    const activity = ALFREDO_ACTIVITIES[Math.floor(Math.random() * ALFREDO_ACTIVITIES.length)];
    setAlfredoState(activity.state);
    setAlfredoActivity(ALFREDO_STATES[activity.state].action);
    return activity.duration;
  }, []);

  // 알프레도 활동 루프
  useEffect(() => {
    if (phase !== 'working' || !isActive) {
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      return;
    }

    const scheduleNextActivity = () => {
      const duration = pickRandomActivity();
      activityTimerRef.current = setTimeout(scheduleNextActivity, duration * 1000);
    };

    scheduleNextActivity();

    return () => {
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [phase, isActive, pickRandomActivity]);

  // 미세 성취 축하
  const showCelebration = useCallback((text) => {
    setCelebrationText(text);
    setCelebrationVisible(true);
    setTimeout(() => setCelebrationVisible(false), 2500);
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
      setAlfredoMessage(getRandomMessage('complete'));
      setAlfredoState('cheering');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, getRandomMessage]);

  // 마일스톤 체크 (5분, 10분, 15분, 절반)
  useEffect(() => {
    if (phase !== 'working' || !isActive) return;
    
    const focusMinutes = Math.floor(totalFocusTime / 60);
    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
    
    // 5분 마일스톤
    if (focusMinutes >= 5 && !milestones.five) {
      setMilestones(prev => ({ ...prev, five: true }));
      setAlfredoMessage(getRandomMessage('fiveMin'));
      setAlfredoState('cheering');
      showCelebration('5분 집중! 🌟');
      setTimeout(() => setAlfredoState('working'), 3000);
    }
    
    // 10분 마일스톤
    if (focusMinutes >= 10 && !milestones.ten) {
      setMilestones(prev => ({ ...prev, ten: true }));
      setAlfredoMessage(getRandomMessage('tenMin'));
      setAlfredoState('cheering');
      showCelebration('10분 돌파! 💪');
      setTimeout(() => setAlfredoState('working'), 3000);
    }
    
    // 15분 마일스톤
    if (focusMinutes >= 15 && !milestones.fifteen) {
      setMilestones(prev => ({ ...prev, fifteen: true }));
      setAlfredoMessage(getRandomMessage('fifteenMin'));
      setAlfredoState('cheering');
      showCelebration('15분 완료! ⭐');
      setTimeout(() => setAlfredoState('working'), 3000);
    }
    
    // 절반 마일스톤
    if (progress >= 48 && progress <= 52 && !milestones.half) {
      setMilestones(prev => ({ ...prev, half: true }));
      setAlfredoMessage(getRandomMessage('halfway'));
      setAlfredoState('cheering');
      showCelebration('반 왔어요! 🚀');
      setTimeout(() => setAlfredoState('working'), 3000);
    }
    
    // 거의 완료
    if (progress >= 85 && progress <= 90) {
      if (Math.random() < 0.02) {
        setAlfredoMessage(getRandomMessage('almostDone'));
        setAlfredoState('cheering');
        setTimeout(() => {
          setAlfredoMessage('');
          setAlfredoState('focused');
        }, 4000);
      }
    }
    
    // 25분마다 휴식 제안
    if (focusMinutes > 0 && focusMinutes % 25 === 0 && totalFocusTime % 60 === 0) {
      setShowBreakPrompt(true);
      setIsActive(false);
    }
    
    // 일반 응원 (3분마다 정도)
    if (totalFocusTime > 0 && totalFocusTime % 180 === 0) {
      if (!alfredoMessage) {
        setAlfredoMessage(getRandomMessage('during'));
        setTimeout(() => setAlfredoMessage(''), 4000);
      }
    }
  }, [timeLeft, phase, isActive, duration, totalFocusTime, milestones, getRandomMessage, showCelebration, alfredoMessage]);

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
    const handler = onComplete || onEnd;
    handler?.({
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
    setAlfredoMessage('다시 시작해요! 💪');
    setAlfredoState('working');
    setTimeout(() => setAlfredoMessage(''), 2000);
  };

  // 나가기 핸들러
  const handleExit = () => {
    const handler = onExit || onEnd;
    handler?.();
  };

  // 시간 포맷
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const currentAlfredoEmoji = ALFREDO_STATES[alfredoState]?.emoji || '🐧';

  // ========== 체크인 화면 ==========
  if (phase === 'checkin') {
    return (
      <div className="h-full bg-[#F8F6FF] flex flex-col">
        <div className="p-4 flex items-center">
          <button 
            onClick={handleExit}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg animate-bounce">
            🐧
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">바디더블링 모드</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">
            저랑 같이 일해요.<br/>
            옆에 있으면 집중이 더 잘 되잖아요.
          </p>

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
                  : getRandomMessage('break')}
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
      <div className="h-full bg-[#F8F6FF] flex flex-col relative overflow-hidden">
        {/* 미세 성취 축하 팝업 */}
        {celebrationVisible && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm">
              {celebrationText}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <button 
            onClick={handleExit}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Body Doubling
          </div>
          <div className="w-9" />
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
                stroke="url(#gradient)" 
                strokeWidth="10" 
                fill="none"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A996FF" />
                  <stop offset="100%" stopColor="#8B7CF7" />
                </linearGradient>
              </defs>
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

          {/* 알프레도 영역 (개선) */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 max-w-xs w-full shadow-sm border border-white/50 mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full flex items-center justify-center text-2xl shadow-md transition-all duration-300 ${isActive ? 'scale-100' : 'scale-95 opacity-80'}`}>
                {currentAlfredoEmoji}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-[#A996FF]">Alfredo</p>
                  {isActive && (
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {alfredoMessage || alfredoActivity}
                </p>
              </div>
            </div>
            
            {/* 마일스톤 표시 */}
            <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className={`text-lg ${milestones.five ? '' : 'grayscale opacity-30'}`}>⭐</span>
              <span className={`text-lg ${milestones.ten ? '' : 'grayscale opacity-30'}`}>🌟</span>
              <span className={`text-lg ${milestones.fifteen ? '' : 'grayscale opacity-30'}`}>✨</span>
              <span className={`text-lg ${milestones.half ? '' : 'grayscale opacity-30'}`}>🚀</span>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setPhase('checkout');
                setIsActive(false);
              }}
              className="p-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-colors"
            >
              <CheckCircle2 size={24} />
            </button>
            
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all ${
                isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white'
              }`}
            >
              {isActive ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" className="ml-1" />
              )}
            </button>

            <button
              onClick={() => setShowBreakPrompt(true)}
              className="p-4 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200 transition-colors"
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
    const milestonesAchieved = Object.values(milestones).filter(Boolean).length;
    
    return (
      <div className="h-full bg-[#F8F6FF] flex flex-col">
        <div className="p-4">
          <button 
            onClick={handleExit}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pb-6 overflow-y-auto">
          {/* 완료 헤더 */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3 animate-bounce">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">수고했어요!</h1>
            <p className="text-gray-500">{focusMinutes}분 동안 집중했어요</p>
            {milestonesAchieved > 0 && (
              <p className="text-sm text-[#A996FF] mt-1">
                마일스톤 {milestonesAchieved}개 달성! 
                {milestonesAchieved >= 3 && ' 🏆'}
              </p>
            )}
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
                      ? 'bg-[#A996FF]/20 border-2 border-[#A996FF] scale-105'
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
                  {checkoutFeeling === 'hard' && "고생했어요. 힘든데도 끝까지 해냈잖아요. 잠깐 쉬어요. ☕"}
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
