import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, StopCircle } from 'lucide-react';
import { useBodyDoublingStore } from '../stores/bodyDoublingStore';

const BodyDoubling: React.FC = function() {
  const navigate = useNavigate();
  const {
    isActive,
    currentSession,
    startSession,
    endSession,
    getRemainingTime
  } = useBodyDoublingStore();
  
  const [task, setTask] = useState('');
  const [duration, setDuration] = useState(25);
  const [remainingTime, setRemainingTime] = useState(0);
  
  // 타이머 업데이트
  useEffect(function() {
    if (!isActive) return;
    
    const interval = setInterval(function() {
      const remaining = getRemainingTime();
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        endSession(true);
        alert('🎉 세션 완료! 잘 하셨어요!');
      }
    }, 1000);
    
    return function() { clearInterval(interval); };
  }, [isActive, getRemainingTime, endSession]);
  
  // 시간 포맷팅
  const formatTime = function(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + secs.toString().padStart(2, '0');
  };
  
  const handleStart = function() {
    if (!task.trim()) {
      alert('무엇을 하실 건지 알려주세요!');
      return;
    }
    startSession(task, duration);
  };
  
  const handleStop = function() {
    if (window.confirm('정말 세션을 종료하시겠습니까?')) {
      endSession(false);
      setTask('');
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={function() { navigate(-1); }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">함께 일하기</h1>
      </header>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {!isActive ? (
          // 세션 시작 화면
          <div className="w-full max-w-sm space-y-6">
            {/* 펭귄 + 메시지 */}
            <div className="text-center">
              <div className="text-6xl mb-4">🐧</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                함께 집중해요!
              </h2>
              <p className="text-gray-600 text-sm">
                알프레도가 옆에서 같이 일할게요
              </p>
            </div>
            
            {/* 입력 폼 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  무엇을 하실 건가요?
                </label>
                <input
                  type="text"
                  value={task}
                  onChange={function(e) { setTask(e.target.value); }}
                  placeholder="예: 이메일 정리하기"
                  className="
                    w-full px-4 py-3 rounded-xl border border-gray-200
                    focus:outline-none focus:ring-2 focus:ring-[#A996FF] focus:border-transparent
                  "
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  얼마나 집중할까요?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 25, 45].map(function(min) {
                    return (
                      <button
                        key={min}
                        onClick={function() { setDuration(min); }}
                        className={[
                          'py-3 rounded-lg font-medium transition-colors',
                          duration === min
                            ? 'bg-[#A996FF] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        ].join(' ')}
                      >
                        {min}분
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* 시작 버튼 */}
            <button
              onClick={handleStart}
              className="
                w-full py-4 bg-[#1A1A1A] text-white rounded-xl
                font-semibold text-lg hover:bg-[#333333] transition-colors
                flex items-center justify-center gap-2
              "
            >
              <Play className="w-5 h-5" />
              시작하기
            </button>
          </div>
        ) : (
          // 세션 진행 화면
          <div className="w-full max-w-sm space-y-6 text-center">
            {/* 펭귄 애니메이션 */}
            <div className="relative">
              <div className="text-8xl animate-bounce">
                🐧
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="text-xs text-gray-500">
                  열심히 하고 있어요!
                </div>
              </div>
            </div>
            
            {/* 진행 정보 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentSession?.task}
              </h2>
              
              {/* 타이머 */}
              <div className="text-5xl font-bold text-[#A996FF]">
                {formatTime(remainingTime)}
              </div>
              
              {/* 진행률 바 */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#A996FF] transition-all duration-1000"
                  style={{
                    width: (currentSession
                        ? ((currentSession.duration * 60 - remainingTime) /
                            (currentSession.duration * 60)) *
                          100
                        : 0) + '%'
                  }}
                />
              </div>
            </div>
            
            {/* 제어 버튼 */}
            <button
              onClick={handleStop}
              className="
                py-3 px-6 bg-red-500 text-white rounded-xl
                font-medium hover:bg-red-600 transition-colors
                flex items-center gap-2 mx-auto
              "
            >
              <StopCircle className="w-5 h-5" />
              그만하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyDoubling;