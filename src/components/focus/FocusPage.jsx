import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Zap, Play, Pause, Coffee, Sparkles } from 'lucide-react';

// 시간 옵션
var TIME_OPTIONS = [
  { minutes: 15, label: '15분', emoji: '⚡', desc: '빠른 집중' },
  { minutes: 25, label: '25분', emoji: '🍅', desc: '포모도로' },
  { minutes: 45, label: '45분', emoji: '🔥', desc: '딥 워크' },
];

// 알프레도 응원 메시지
var ALFREDO_MESSAGES = {
  start: [
    '시작이 반이에요! 파이팅! 💪',
    '좋아요, 함께 집중해봐요! ✨',
    '저도 옆에서 응원할게요! 🐧',
    '지금 시작하는 게 가장 중요해요!',
    '오늘의 나를 위해, 화이팅!'
  ],
  during: [
    '잘하고 있어요! 계속 가요! 💪',
    '이 페이스 좋아요! ✨',
    '집중력 최고예요! 🔥',
    '대단해요, 계속 해봐요!',
    '거의 다 왔어요! 조금만 더!'
  ],
  fiveMin: [
    '🎉 5분 돌파! 좋은 시작이에요!',
    '⭐ 5분 집중 완료! 잘하고 있어요!',
    '✨ 벌써 5분! 이 기세로!',
    '💪 5분 클리어! 대단해요!'
  ],
  tenMin: [
    '🌟 10분 달성! 리듬을 탔어요!',
    '🔥 10분! 집중력 최고!',
    '⚡ 10분 돌파! 멋져요!',
    '✨ 10분 완료! 이대로 쭉!'
  ],
  fifteenMin: [
    '🏆 15분! 대단해요!',
    '⭐ 15분 집중! 진짜 잘하고 있어요!',
    '🚀 15분 돌파! 최고예요!',
    '💪 15분! 반 왔어요!'
  ],
  twentyMin: [
    '🎯 20분! 거의 다 왔어요!',
    '🔥 20분 돌파! 마무리 화이팅!',
    '⭐ 20분! 끝이 보여요!',
    '✨ 20분 완료! 조금만 더!'
  ],
  halfway: [
    '🎯 절반 왔어요! 잘하고 있어요!',
    '🚀 반 지났어요! 이 기세로!',
    '💪 절반 돌파! 대단해요!',
    '✨ 반이에요! 끝까지 가보자!'
  ],
  almostDone: [
    '🏁 거의 다 왔어요! 조금만 더!',
    '⚡ 막판 스퍼트! 화이팅!',
    '🔥 끝이 보여요! 조금만!',
    '💪 마지막까지 힘내요!'
  ],
  complete: [
    '🎊 완료! 정말 대단해요!',
    '🏆 해냈어요! 최고예요!',
    '⭐ 완벽해요! 자랑스러워요!',
    '🎉 끝까지 해냈네요! 멋져요!'
  ],
  paused: [
    '잠깐 쉬어가도 괜찮아요 ☕',
    '숨 고르고 다시 가요 🌿',
    '휴식도 중요해요 💜',
    '준비되면 다시 시작해요!'
  ]
};

// 랜덤 메시지
var getRandomMessage = function(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
};

// 시간 선택 화면
var TimeSelectionScreen = function(props) {
  var task = props.task;
  var onSelectTime = props.onSelectTime;
  var onBack = props.onBack;
  
  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-[#F0EBFF] to-[#E8E4F3] flex flex-col'
  },
    // 헤더
    React.createElement('div', { className: 'p-4 flex items-center' },
      React.createElement('button', {
        onClick: onBack,
        className: 'p-3 rounded-full bg-white/80 shadow-sm'
      }, React.createElement(ArrowLeft, { size: 20, className: 'text-gray-600' }))
    ),
    
    // 콘텐츠
    React.createElement('div', { className: 'flex-1 flex flex-col items-center justify-center px-6 pb-20' },
      // 알프레도
      React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '🐧'),
      
      // 태스크 정보
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 mb-2 text-center' },
        task ? task.title : '집중 모드'
      ),
      React.createElement('p', { className: 'text-gray-500 mb-8' },
        '얼마나 집중할까요?'
      ),
      
      // 시간 옵션
      React.createElement('div', { className: 'w-full max-w-sm space-y-3' },
        TIME_OPTIONS.map(function(option) {
          return React.createElement('button', {
            key: option.minutes,
            onClick: function() { onSelectTime(option.minutes); },
            className: 'w-full p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group hover:scale-[1.02] active:scale-[0.98]'
          },
            React.createElement('div', { 
              className: 'w-14 h-14 rounded-xl bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-2xl'
            }, option.emoji),
            React.createElement('div', { className: 'flex-1 text-left' },
              React.createElement('p', { className: 'font-bold text-gray-800 text-lg' }, option.label),
              React.createElement('p', { className: 'text-sm text-gray-500' }, option.desc)
            ),
            React.createElement(Play, { size: 20, className: 'text-[#A996FF] opacity-0 group-hover:opacity-100 transition-opacity' })
          );
        })
      ),
      
      // 힌트
      React.createElement('p', { className: 'text-xs text-gray-400 mt-8 text-center' },
        '💡 ADHD에는 짧은 집중 + 자주 쉬기가 효과적이에요'
      )
    )
  );
};

// 메인 타이머
var FocusTimer = function(props) {
  var task = props.task;
  var onComplete = props.onComplete;
  var onExit = props.onExit;
  var onCancel = props.onCancel;
  var onEnd = props.onEnd;
  
  var handleBack = onExit || onCancel || onEnd;
  
  // 시간 선택 상태
  var showTimeSelectionState = useState(true);
  var showTimeSelection = showTimeSelectionState[0];
  var setShowTimeSelection = showTimeSelectionState[1];
  
  // 타이머 상태
  var durationState = useState(25 * 60);
  var duration = durationState[0];
  var setDuration = durationState[1];
  
  var timeLeftState = useState(25 * 60);
  var timeLeft = timeLeftState[0];
  var setTimeLeft = timeLeftState[1];
  
  var isActiveState = useState(false);
  var isActive = isActiveState[0];
  var setIsActive = isActiveState[1];
  
  // 마일스톤 추적
  var milestonesState = useState({
    five: false,
    ten: false,
    fifteen: false,
    twenty: false,
    halfway: false,
    almostDone: false
  });
  var milestones = milestonesState[0];
  var setMilestones = milestonesState[1];
  
  // 축하 메시지
  var celebrationState = useState({ visible: false, text: '' });
  var celebration = celebrationState[0];
  var setCelebration = celebrationState[1];
  
  // 알프레도 메시지
  var alfredoMessageState = useState(getRandomMessage(ALFREDO_MESSAGES.start));
  var alfredoMessage = alfredoMessageState[0];
  var setAlfredoMessage = alfredoMessageState[1];
  
  // 휴식 모드
  var showBreakState = useState(false);
  var showBreak = showBreakState[0];
  var setShowBreak = showBreakState[1];
  
  var breakTimeState = useState(5 * 60);
  var breakTime = breakTimeState[0];
  var setBreakTime = breakTimeState[1];
  
  // 총 집중 시간
  var totalFocusTimeState = useState(0);
  var totalFocusTime = totalFocusTimeState[0];
  var setTotalFocusTime = totalFocusTimeState[1];
  
  // 타이머 효과
  useEffect(function() {
    var interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(function() {
        setTimeLeft(function(t) { return t - 1; });
        setTotalFocusTime(function(t) { return t + 1; });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.complete));
      // 완료 처리
      setTimeout(function() {
        setShowBreak(true);
      }, 2000);
    }
    
    return function() { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);
  
  // 마일스톤 체크
  useEffect(function() {
    if (!isActive) return;
    
    var elapsed = duration - timeLeft;
    var elapsedMinutes = Math.floor(elapsed / 60);
    var progress = elapsed / duration;
    
    // 5분 마일스톤
    if (elapsedMinutes >= 5 && !milestones.five) {
      setMilestones(function(m) { return Object.assign({}, m, { five: true }); });
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.fiveMin));
    }
    
    // 10분 마일스톤
    if (elapsedMinutes >= 10 && !milestones.ten) {
      setMilestones(function(m) { return Object.assign({}, m, { ten: true }); });
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.tenMin));
    }
    
    // 15분 마일스톤
    if (elapsedMinutes >= 15 && !milestones.fifteen) {
      setMilestones(function(m) { return Object.assign({}, m, { fifteen: true }); });
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.fifteenMin));
    }
    
    // 20분 마일스톤
    if (elapsedMinutes >= 20 && !milestones.twenty) {
      setMilestones(function(m) { return Object.assign({}, m, { twenty: true }); });
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.twentyMin));
    }
    
    // 절반 마일스톤
    if (progress >= 0.5 && !milestones.halfway) {
      setMilestones(function(m) { return Object.assign({}, m, { halfway: true }); });
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.halfway));
    }
    
    // 거의 완료 (90%)
    if (progress >= 0.9 && !milestones.almostDone) {
      setMilestones(function(m) { return Object.assign({}, m, { almostDone: true }); });
      showCelebration(getRandomMessage(ALFREDO_MESSAGES.almostDone));
    }
  }, [timeLeft, isActive, duration, milestones]);
  
  // 축하 표시
  var showCelebration = function(text) {
    setCelebration({ visible: true, text: text });
    setTimeout(function() {
      setCelebration({ visible: false, text: '' });
    }, 3000);
  };
  
  // 시간 선택 핸들러
  var handleSelectTime = function(minutes) {
    setDuration(minutes * 60);
    setTimeLeft(minutes * 60);
    setShowTimeSelection(false);
    setAlfredoMessage(getRandomMessage(ALFREDO_MESSAGES.start));
  };
  
  // 토글
  var toggleTimer = function() {
    if (!isActive) {
      setAlfredoMessage(getRandomMessage(ALFREDO_MESSAGES.during));
    } else {
      setAlfredoMessage(getRandomMessage(ALFREDO_MESSAGES.paused));
    }
    setIsActive(!isActive);
  };
  
  // 리셋
  var resetTimer = function() {
    setIsActive(false);
    setTimeLeft(duration);
    setMilestones({
      five: false,
      ten: false,
      fifteen: false,
      twenty: false,
      halfway: false,
      almostDone: false
    });
    setAlfredoMessage(getRandomMessage(ALFREDO_MESSAGES.start));
  };
  
  // 시간 포맷
  var formatTime = function(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  };
  
  // 진행률
  var progress = ((duration - timeLeft) / duration) * 100;
  
  // 완료 핸들러
  var handleComplete = function() {
    setIsActive(false);
    if (onComplete) onComplete();
  };
  
  // 휴식 후 계속
  var handleContinueAfterBreak = function() {
    setShowBreak(false);
    resetTimer();
    setIsActive(true);
  };
  
  // 휴식 후 종료
  var handleFinishAfterBreak = function() {
    setShowBreak(false);
    if (onComplete) onComplete();
  };
  
  // 시간 선택 화면
  if (showTimeSelection) {
    return React.createElement(TimeSelectionScreen, {
      task: task,
      onSelectTime: handleSelectTime,
      onBack: handleBack
    });
  }
  
  // 휴식 화면
  if (showBreak) {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex flex-col items-center justify-center p-6'
    },
      React.createElement('div', { className: 'text-6xl mb-4' }, '☕'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 mb-2' }, '수고했어요!'),
      React.createElement('p', { className: 'text-gray-600 mb-6' }, 
        Math.floor(totalFocusTime / 60) + '분 집중 완료!'
      ),
      
      React.createElement('div', { 
        className: 'bg-white/80 rounded-2xl p-4 max-w-sm w-full mb-8'
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('span', { className: 'text-2xl' }, '🐧'),
          React.createElement('p', { className: 'text-sm text-gray-700' },
            '잠깐 쉬어가요! 물 한 잔 마시고, 스트레칭 하고, 눈도 쉬게 해주세요. 5분 후에 다시 만나요! 💜'
          )
        )
      ),
      
      React.createElement('div', { className: 'flex gap-3' },
        React.createElement('button', {
          onClick: handleFinishAfterBreak,
          className: 'px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-sm'
        }, '여기서 끝'),
        React.createElement('button', {
          onClick: handleContinueAfterBreak,
          className: 'px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg'
        }, '한 번 더! 🔥')
      )
    );
  }
  
  // 메인 타이머 화면
  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-[#F0EBFF] to-[#E8E4F3] flex flex-col relative overflow-hidden'
  },
    // 축하 팝업
    celebration.visible && React.createElement('div', {
      className: 'absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-full shadow-xl animate-bounce'
    },
      React.createElement('p', { className: 'font-bold text-gray-800' }, celebration.text)
    ),
    
    // 헤더
    React.createElement('div', { className: 'p-4 flex items-center justify-between' },
      React.createElement('button', {
        onClick: handleBack,
        className: 'p-3 rounded-full bg-white/80 shadow-sm'
      }, React.createElement(ArrowLeft, { size: 20, className: 'text-gray-600' })),
      
      // 마일스톤 인디케이터
      React.createElement('div', { className: 'flex gap-1' },
        React.createElement('span', { 
          className: 'text-lg ' + (milestones.five ? 'opacity-100' : 'opacity-30')
        }, '⭐'),
        React.createElement('span', { 
          className: 'text-lg ' + (milestones.ten ? 'opacity-100' : 'opacity-30')
        }, '🌟'),
        React.createElement('span', { 
          className: 'text-lg ' + (milestones.fifteen ? 'opacity-100' : 'opacity-30')
        }, '✨'),
        React.createElement('span', { 
          className: 'text-lg ' + (milestones.halfway ? 'opacity-100' : 'opacity-30')
        }, '🚀')
      )
    ),
    
    // 메인 콘텐츠
    React.createElement('div', { className: 'flex-1 flex flex-col items-center justify-center px-6 pb-20' },
      // 태스크 정보
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('div', { 
          className: 'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#A996FF]/20 shadow-sm text-xs font-bold tracking-wider text-[#A996FF] mb-4'
        },
          React.createElement(Zap, { size: 12, fill: 'currentColor' }),
          'FOCUS MODE'
        ),
        React.createElement('h2', { className: 'text-xl font-bold text-gray-800 mb-1' },
          task ? task.title : 'Deep Work'
        ),
        React.createElement('p', { className: 'text-sm text-gray-500' },
          Math.floor(duration / 60) + '분 집중'
        )
      ),
      
      // 타이머 서클
      React.createElement('div', { className: 'relative w-72 h-72 flex items-center justify-center mb-8' },
        // 배경 원
        React.createElement('svg', { className: 'absolute inset-0 w-full h-full -rotate-90' },
          React.createElement('circle', {
            cx: '144', cy: '144', r: '130',
            stroke: '#E5E5EA',
            strokeWidth: '8',
            fill: 'none'
          }),
          // 진행 원
          React.createElement('circle', {
            cx: '144', cy: '144', r: '130',
            stroke: isActive ? '#A996FF' : '#C4B5FD',
            strokeWidth: '12',
            fill: 'none',
            strokeDasharray: 2 * Math.PI * 130,
            strokeDashoffset: 2 * Math.PI * 130 * (1 - progress / 100),
            strokeLinecap: 'round',
            className: 'transition-all duration-1000 ease-linear'
          })
        ),
        
        // 시간 표시
        React.createElement('div', { className: 'flex flex-col items-center' },
          React.createElement('div', { 
            className: 'text-6xl font-mono font-bold tracking-tighter tabular-nums ' +
              (isActive ? 'text-gray-800' : 'text-gray-500')
          }, formatTime(timeLeft)),
          
          !isActive && timeLeft !== duration && React.createElement('span', {
            className: 'text-[#A996FF] text-xs font-bold uppercase tracking-widest mt-2'
          }, '일시정지'),
          
          isActive && React.createElement('span', {
            className: 'text-emerald-500 text-xs font-bold uppercase tracking-widest mt-2 animate-pulse'
          }, '집중 중...')
        )
      ),
      
      // 알프레도 메시지
      React.createElement('div', {
        className: 'bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-8 max-w-sm w-full shadow-sm'
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('div', {
            className: 'w-10 h-10 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-lg'
          }, '🐧'),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('span', { className: 'text-[10px] font-bold text-gray-400 uppercase block mb-1' }, 
              'Alfredo'
            ),
            React.createElement('p', { className: 'text-sm text-gray-700 leading-relaxed' },
              alfredoMessage
            )
          )
        )
      ),
      
      // 컨트롤
      React.createElement('div', { className: 'flex items-center gap-6' },
        React.createElement('button', {
          onClick: resetTimer,
          className: 'p-4 rounded-full bg-white hover:bg-gray-50 transition-colors text-gray-400 shadow-sm'
        }, React.createElement(RefreshCw, { size: 20 })),
        
        React.createElement('button', {
          onClick: toggleTimer,
          className: 'w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ring-4 ring-[#A996FF]/30 ' +
            (isActive 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-[#A996FF] hover:bg-[#8B7CF7]')
        },
          isActive 
            ? React.createElement(Pause, { size: 28, className: 'text-white' })
            : React.createElement(Play, { size: 28, className: 'text-white ml-1' })
        ),
        
        React.createElement('button', {
          onClick: handleComplete,
          className: 'p-4 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20'
        }, React.createElement(CheckCircle2, { size: 24 }))
      )
    )
  );
};

// === Focus Completion Screen ===
var FocusCompletionScreen = function(props) {
  var completedTask = props.completedTask;
  var nextTask = props.nextTask;
  var onStartNext = props.onStartNext;
  var onTakeBreak = props.onTakeBreak;
  var onGoHome = props.onGoHome;
  var stats = props.stats;
  
  var showBreakTimerState = useState(false);
  var showBreakTimer = showBreakTimerState[0];
  var setShowBreakTimer = showBreakTimerState[1];
  
  var breakTimeLeftState = useState(5 * 60);
  var breakTimeLeft = breakTimeLeftState[0];
  var setBreakTimeLeft = breakTimeLeftState[1];
  
  useEffect(function() {
    var interval = null;
    if (showBreakTimer && breakTimeLeft > 0) {
      interval = setInterval(function() {
        setBreakTimeLeft(function(t) { return t - 1; });
      }, 1000);
    } else if (breakTimeLeft === 0) {
      setShowBreakTimer(false);
    }
    return function() { if (interval) clearInterval(interval); };
  }, [showBreakTimer, breakTimeLeft]);
  
  var formatTime = function(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins + ':' + secs.toString().padStart(2, '0');
  };
  
  if (showBreakTimer) {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] flex flex-col items-center justify-center p-6'
    },
      React.createElement('div', { className: 'text-6xl mb-6' }, '☕'),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-2' }, '휴식 시간'),
      React.createElement('p', { className: 'text-gray-500 mb-8' }, '잠시 쉬고 다시 시작해요'),
      
      React.createElement('div', { className: 'text-5xl font-mono font-bold text-emerald-600 mb-8' },
        formatTime(breakTimeLeft)
      ),
      
      React.createElement('div', { className: 'bg-white/80 backdrop-blur-xl rounded-xl p-4 max-w-xs w-full mb-8' },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('span', { className: 'text-xl' }, '🐧'),
          React.createElement('p', { className: 'text-sm text-gray-700' },
            '물 한 잔 마시고, 스트레칭 해보세요.\n5분 후에 다시 달려봐요!'
          )
        )
      ),
      
      React.createElement('button', {
        onClick: function() { setShowBreakTimer(false); },
        className: 'px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold'
      }, '휴식 끝내기')
    );
  }
  
  return React.createElement('div', {
    className: 'min-h-screen bg-[#F0EBFF] flex flex-col p-6'
  },
    React.createElement('div', { className: 'flex-1 flex flex-col items-center justify-center' },
      React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '🎉'),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-800 mb-2' }, '완료!'),
      React.createElement('p', { className: 'text-gray-500 mb-6' }, 
        '"' + (completedTask ? completedTask.title : '집중 세션') + '"'
      ),
      
      React.createElement('div', { className: 'flex gap-6 mb-8' },
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-2xl font-bold text-[#A996FF]' }, 
            (stats ? stats.focusTime : 25) + '분'
          ),
          React.createElement('p', { className: 'text-xs text-gray-400' }, '집중 시간')
        ),
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-2xl font-bold text-emerald-500' }, 
            (stats ? stats.todayCompleted : 1) + '개'
          ),
          React.createElement('p', { className: 'text-xs text-gray-400' }, '오늘 완료')
        ),
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-2xl font-bold text-[#A996FF]' }, 
            '🔥' + (stats ? stats.streak : 1)
          ),
          React.createElement('p', { className: 'text-xs text-gray-400' }, '연속')
        )
      ),
      
      React.createElement('div', { 
        className: 'bg-white/90 backdrop-blur-xl rounded-xl p-4 max-w-sm w-full mb-6 shadow-sm'
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('div', {
            className: 'w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg'
          }, '🐧'),
          React.createElement('p', { className: 'flex-1 text-sm text-gray-700 leading-relaxed' },
            stats && stats.todayCompleted >= 3
              ? '대단해요, Boss! 오늘 벌써 3개째예요. 이 페이스면 오늘 목표 완전 달성이에요! 💪'
              : '잘했어요, Boss! 하나씩 해치우는 거예요. 다음 것도 해볼까요?'
          )
        )
      ),
      
      nextTask && React.createElement('div', { className: 'w-full max-w-sm' },
        React.createElement('p', { className: 'text-xs text-gray-400 font-medium mb-2 text-center' },
          '다음은 이거 어때요?'
        ),
        React.createElement('div', { 
          className: 'bg-white border border-[#A996FF]/20 rounded-xl p-4 shadow-sm'
        },
          React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
            React.createElement('div', { 
              className: 'w-10 h-10 bg-[#A996FF]/10 rounded-xl flex items-center justify-center'
            }, React.createElement(Zap, { size: 20, className: 'text-[#A996FF]' })),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('p', { className: 'font-semibold text-gray-800' }, nextTask.title),
              React.createElement('p', { className: 'text-xs text-gray-400' },
                nextTask.project + (nextTask.deadline ? ' · ' + nextTask.deadline : '')
              )
            )
          ),
          
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', {
              onClick: function() { setShowBreakTimer(true); },
              className: 'flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all'
            }, '5분 쉬고 시작'),
            React.createElement('button', {
              onClick: function() { onStartNext(nextTask); },
              className: 'flex-1 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1'
            },
              React.createElement(Zap, { size: 14 }),
              '바로 시작'
            )
          )
        )
      ),
      
      !nextTask && React.createElement('div', { 
        className: 'bg-emerald-50 rounded-xl p-4 max-w-sm w-full text-center'
      },
        React.createElement('p', { className: 'text-emerald-700 font-medium' }, '🎊 오늘 할 일 다 끝냈어요!'),
        React.createElement('p', { className: 'text-emerald-600 text-sm mt-1' }, '푹 쉬세요, Boss!')
      )
    ),
    
    React.createElement('div', { className: 'pt-4' },
      React.createElement('button', {
        onClick: onGoHome,
        className: 'w-full py-3 text-gray-500 text-sm font-medium'
      }, '홈으로 돌아가기')
    )
  );
};

export { FocusTimer, FocusCompletionScreen };
export default FocusTimer;
