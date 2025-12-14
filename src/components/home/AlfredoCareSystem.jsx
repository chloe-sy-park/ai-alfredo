import React, { useState, useEffect } from 'react';
import { X, Shield, Sparkles, Send, Moon, Sun } from 'lucide-react';

// ============================================
// 💜 실패 케어 시스템 (W1-3)
// ============================================

// 실패 케어 메시지 풀
const FAILURE_CARE_MESSAGES = {
  // 0개 완료
  zeroComplete: [
    "괜찮아요, 그런 날도 있어요. 내일 다시 시작하면 돼요. 💜",
    "오늘은 쉬어가는 날이었어요. 푹 쉬고 내일 같이 해봐요.",
    "가끔은 아무것도 안 하는 것도 필요해요. 자신을 탓하지 마세요.",
    "힘든 날이었나요? 내일은 분명 더 나을 거예요. 🌅",
    "100점이 아니어도 괜찮아요. 내일 또 시작하면 돼요.",
  ],
  
  // 목표 대비 절반 이하
  underHalf: [
    "조금밖에 못했어도 괜찮아요. 한 개라도 한 게 대단해요!",
    "오늘 컨디션이 안 좋았나 봐요. 충분히 쉬세요. 💜",
    "완벽하지 않아도 돼요. 내일 이어서 하면 되니까요.",
  ],
  
  // 연속 실패 (2일 이상)
  consecutiveFail: [
    "요즘 힘드시죠? 목표를 조금 줄여볼까요?",
    "무리하고 계신 건 아닌지... 쉬어가도 괜찮아요.",
    "할 일이 너무 많은 건 아닐까요? 같이 정리해봐요.",
  ],
  
  // 스트릭 보호권 사용 가능
  streakProtection: [
    "스트릭 보호권 쓸까요? 연속 기록 지켜드릴게요! 🛡️",
    "오늘 힘들었잖아요. 보호권으로 스트릭 유지해드릴까요?",
  ],
};

// 실패 케어 모달 컴포넌트
const FailureCareModal = ({
  isOpen,
  onClose,
  completedTasks = 0,
  totalTasks = 0,
  consecutiveFailDays = 0,
  currentStreak = 0,
  streakProtectionLeft = 3, // 월 3회
  onUseStreakProtection,
  onReduceGoals,
  darkMode = false,
}) => {
  if (!isOpen) return null;
  
  // 상황에 맞는 메시지 선택
  const getMessage = () => {
    if (consecutiveFailDays >= 2) {
      return FAILURE_CARE_MESSAGES.consecutiveFail[
        Math.floor(Math.random() * FAILURE_CARE_MESSAGES.consecutiveFail.length)
      ];
    }
    if (completedTasks === 0) {
      return FAILURE_CARE_MESSAGES.zeroComplete[
        Math.floor(Math.random() * FAILURE_CARE_MESSAGES.zeroComplete.length)
      ];
    }
    return FAILURE_CARE_MESSAGES.underHalf[
      Math.floor(Math.random() * FAILURE_CARE_MESSAGES.underHalf.length)
    ];
  };
  
  const message = getMessage();
  const canUseProtection = currentStreak > 0 && streakProtectionLeft > 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className={`w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 - 부드러운 그라데이션 */}
        <div className="bg-gradient-to-r from-[#C4B5FD] to-[#A996FF] p-6 text-center">
          <div className="text-4xl mb-3">🐧💜</div>
          <h2 className="text-xl font-bold text-white">괜찮아요, Boss</h2>
        </div>
        
        {/* 본문 */}
        <div className="p-5">
          {/* 알프레도 메시지 */}
          <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]'} rounded-xl p-4 mb-4`}>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-200' : 'text-[#6D28D9]'}`}>
              {message}
            </p>
          </div>
          
          {/* 오늘 결과 (부드럽게) */}
          <div className={`flex items-center justify-center gap-4 mb-4 py-3 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {completedTasks}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>완료</p>
            </div>
            <div className={`w-px h-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {totalTasks}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>목표</p>
            </div>
          </div>
          
          {/* 스트릭 보호권 */}
          {canUseProtection && (
            <button
              onClick={() => {
                onUseStreakProtection?.();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              <Shield size={18} />
              스트릭 보호권 사용 ({streakProtectionLeft}회 남음)
            </button>
          )}
          
          {/* 연속 실패 시 목표 줄이기 제안 */}
          {consecutiveFailDays >= 2 && (
            <button
              onClick={() => {
                onReduceGoals?.();
                onClose();
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 mb-3 ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              } rounded-xl font-medium hover:opacity-80 transition-all`}
            >
              <Sparkles size={18} />
              목표 조정하기
            </button>
          )}
          
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold"
          >
            내일 다시 시작할게요 🌅
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 💌 "내일의 나" 메시지 시스템 (W1-4)
// ============================================

// 저녁에 작성하는 내일의 나에게 메시지 입력 컴포넌트
const TomorrowMessageInput = ({
  isOpen,
  onClose,
  onSave,
  existingMessage = '',
  darkMode = false,
}) => {
  const [message, setMessage] = useState(existingMessage);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    setMessage(existingMessage);
  }, [existingMessage]);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    if (message.trim()) {
      onSave?.(message.trim());
      setSaved(true);
      setTimeout(() => {
        onClose();
        setSaved(false);
      }, 1500);
    }
  };
  
  const placeholders = [
    "내일 아침의 나에게 남길 말...",
    "보고서 70%까지 했어, 마무리만!",
    "오늘 힘들었어, 내일은 천천히 해",
    "아침에 커피 마시면서 이어서!",
    "회의 준비물: 노트북, 명함",
  ];
  
  const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className={`w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#7C4DFF] p-5 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
          >
            <X size={18} />
          </button>
          <div className="text-3xl mb-2">🌙✉️</div>
          <h2 className="text-lg font-bold text-white">내일의 나에게</h2>
          <p className="text-sm text-white/80 mt-1">아침에 알프레도가 전해드릴게요</p>
        </div>
        
        {/* 본문 */}
        <div className="p-5">
          {saved ? (
            // 저장 완료 애니메이션
            <div className="text-center py-8">
              <div className="text-5xl mb-3 animate-bounce">💌</div>
              <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                메시지 저장 완료!
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                내일 아침에 전해드릴게요 🐧
              </p>
            </div>
          ) : (
            <>
              {/* 입력 영역 */}
              <div className="mb-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={randomPlaceholder}
                  maxLength={200}
                  className={`w-full h-32 p-4 ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-200 placeholder-gray-500' 
                      : 'bg-gray-50 text-gray-700 placeholder-gray-400'
                  } rounded-xl resize-none focus:ring-2 focus:ring-[#A996FF] outline-none text-sm leading-relaxed`}
                />
                <p className={`text-right text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {message.length}/200
                </p>
              </div>
              
              {/* 빠른 템플릿 */}
              <div className="mb-4">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  빠른 선택
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "오늘 한 거 이어서!",
                    "아침 미팅 준비",
                    "무리하지 말기",
                    "화이팅! 💪",
                  ].map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessage(template)}
                      className={`px-3 py-1.5 text-xs rounded-full ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={!message.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                  message.trim()
                    ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
                메시지 보내기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 아침에 보여주는 어젯밤 메시지 컴포넌트
const TomorrowMessageDisplay = ({
  message,
  createdAt, // timestamp
  onDismiss,
  darkMode = false,
}) => {
  if (!message) return null;
  
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const timeString = `${createdDate.getMonth() + 1}/${createdDate.getDate()} 저녁`;
  
  return (
    <div className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-[#A996FF]/30'} backdrop-blur-xl rounded-xl p-4 mb-4 border shadow-sm`}>
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#7C4DFF] rounded-xl flex items-center justify-center shrink-0">
          <span className="text-lg">💌</span>
        </div>
        
        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              어젯밤 Boss가 남긴 메시지
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'} rounded-full`}>
              {timeString}
            </span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
            "{message}"
          </p>
        </div>
        
        {/* 닫기 */}
        <button 
          onClick={onDismiss}
          className={`shrink-0 w-6 h-6 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X size={16} />
        </button>
      </div>
      
      {/* 알프레도 코멘트 */}
      <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <p className={`text-xs ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'} flex items-center gap-1`}>
          <span>🐧</span> 좋은 아침이에요! 어젯밤 메시지 전해드려요 ☀️
        </p>
      </div>
    </div>
  );
};

// ============================================
// 🌙 저녁 마무리 + 내일 메시지 통합 컴포넌트
// ============================================

const EveningWrapUp = ({
  isOpen,
  onClose,
  completedTasks = 0,
  totalTasks = 0,
  streak = 0,
  focusMinutes = 0,
  tomorrowMessage = '',
  onSaveTomorrowMessage,
  streakProtectionLeft = 3,
  onUseStreakProtection,
  darkMode = false,
}) => {
  const [message, setMessage] = useState(tomorrowMessage);
  const [showStreakProtection, setShowStreakProtection] = useState(false);
  
  if (!isOpen) return null;
  
  const needsCare = completedTasks === 0 || (completedTasks < totalTasks * 0.5);
  const canProtectStreak = streak > 0 && streakProtectionLeft > 0 && completedTasks === 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className={`w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
          >
            <X size={18} />
          </button>
          <div className="text-4xl mb-2">🌙</div>
          <h2 className="text-xl font-bold text-white">오늘 하루 마무리</h2>
          <p className="text-white/80 text-sm mt-1">수고했어요, Boss!</p>
        </div>
        
        {/* 오늘 통계 */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-emerald-50'} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${completedTasks > 0 ? 'text-emerald-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {completedTasks}
              </p>
              <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-emerald-600/70'}`}>완료</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]'} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]'}`}>
                {Math.floor(focusMinutes / 60)}h
              </p>
              <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-[#8B7CF7]/70'}`}>집중</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-orange-50'} rounded-xl p-3 text-center`}>
              <p className="text-2xl font-bold text-orange-500">🔥{streak}</p>
              <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-orange-600/70'}`}>연속</p>
            </div>
          </div>
          
          {/* 케어 메시지 (필요시) */}
          {needsCare && (
            <div className={`${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'} rounded-xl p-4 mb-4`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">🐧</span>
                <p className={`text-sm ${darkMode ? 'text-[#C4B5FD]' : 'text-[#6D28D9]'}`}>
                  {completedTasks === 0 
                    ? "괜찮아요, 쉬어가는 날도 필요해요. 내일 다시 시작하면 돼요. 💜"
                    : "하나씩 해낸 게 중요해요. 내일 아침에 또 정리해드릴게요."}
                </p>
              </div>
            </div>
          )}
          
          {/* 스트릭 보호권 (필요시) */}
          {canProtectStreak && (
            <button
              onClick={() => {
                onUseStreakProtection?.();
                setShowStreakProtection(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-semibold"
            >
              <Shield size={18} />
              스트릭 보호권 사용하기 ({streakProtectionLeft}회 남음)
            </button>
          )}
          
          {/* 내일의 나에게 메시지 */}
          <div className="mb-4">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium mb-2`}>
              💌 내일 아침의 나에게 (선택)
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="내일 이어서 할 일, 메모 등..."
              maxLength={200}
              className={`w-full h-20 p-3 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 placeholder-gray-500' 
                  : 'bg-gray-50 text-gray-700 placeholder-gray-400'
              } rounded-xl resize-none focus:ring-2 focus:ring-[#A996FF] outline-none text-sm`}
            />
          </div>
          
          {/* 마무리 버튼 */}
          <button
            onClick={() => {
              if (message.trim()) {
                onSaveTomorrowMessage?.(message.trim());
              }
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold"
          >
            {completedTasks >= totalTasks && totalTasks > 0 
              ? "완벽한 하루였어요! 😴" 
              : "하루 마무리 완료 😴"}
          </button>
        </div>
      </div>
    </div>
  );
};

export { 
  FailureCareModal, 
  TomorrowMessageInput, 
  TomorrowMessageDisplay, 
  EveningWrapUp,
  FAILURE_CARE_MESSAGES 
};
