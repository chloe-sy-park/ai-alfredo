import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, MessageCircle } from 'lucide-react';
import {
  getProactiveDialog,
  recordNudgeShown,
  ACTION_TYPES,
  PROACTIVE_DIALOG_STATS,
} from '../../data/ProactiveDialogs.js';

// ═══════════════════════════════════════════════════════════════════════════
// 🐧 ProactiveNudge.jsx - 알프레도 선제적 대화 플로팅 UI
// 알프레도가 먼저 말을 거는 플로팅 말풍선 컴포넌트
// 참고: Anima AI (능동적 대화), Focus Friend (캐릭터 연결), Pi (선택지 제공)
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 펭귄 이모지 상태
// ─────────────────────────────────────────────────────────────────────────────
const PENGUIN_STATES = {
  default: '🐧',
  happy: '🐧✨',
  thinking: '🐧💭',
  celebrate: '🎉🐧🎉',
  sleep: '😴🐧',
  wave: '👋🐧',
};

// ─────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────
export const ProactiveNudge = ({
  // 컨텍스트 데이터
  context = {},
  
  // 콜백
  onAction,
  onDismiss,
  onSnooze,
  
  // 설정
  enabled = true,
  position = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  autoShowDelay = 3000, // 앱 오픈 후 표시까지 딜레이
  autoHideDelay = 0, // 0이면 자동 숨김 안 함
  
  // 스타일
  darkMode = false,
  compact = false,
}) => {
  const [currentDialog, setCurrentDialog] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [penguinState, setPenguinState] = useState('default');
  
  const timerRef = useRef(null);
  const autoHideRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // 대화 가져오기
  // ─────────────────────────────────────────────────────────────────────────
  const fetchDialog = useCallback(() => {
    if (!enabled) return;
    
    const dialog = getProactiveDialog(context);
    if (dialog) {
      setCurrentDialog(dialog);
      recordNudgeShown(dialog.id);
      
      // 애니메이션과 함께 표시
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(true);
        setIsExpanded(true);
        setIsAnimating(false);
      }, 100);
      
      // 자동 숨김 설정
      if (autoHideDelay > 0) {
        autoHideRef.current = setTimeout(() => {
          handleMinimize();
        }, autoHideDelay);
      }
    }
  }, [enabled, context, autoHideDelay]);

  // ─────────────────────────────────────────────────────────────────────────
  // 초기 로드 시 대화 가져오기
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (enabled && autoShowDelay > 0) {
      timerRef.current = setTimeout(fetchDialog, autoShowDelay);
    } else if (enabled) {
      fetchDialog();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [enabled, autoShowDelay, fetchDialog]);

  // ─────────────────────────────────────────────────────────────────────────
  // 핸들러
  // ─────────────────────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExpanded(false);
      setCurrentDialog(null);
      setIsAnimating(false);
      onDismiss?.();
    }, 200);
  }, [onDismiss]);

  const handleMinimize = useCallback(() => {
    setIsExpanded(false);
    setPenguinState('wave');
    setTimeout(() => setPenguinState('default'), 1000);
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
  }, []);

  const handleResponseClick = useCallback((response) => {
    // 액션 타입에 따른 펭귄 상태 변경
    if (response.action === ACTION_TYPES.CELEBRATE) {
      setPenguinState('celebrate');
    } else if (response.action === ACTION_TYPES.TAKE_BREAK) {
      setPenguinState('sleep');
    } else {
      setPenguinState('happy');
    }
    
    // 콜백 호출
    onAction?.(response.action, response);
    
    // 스눕이 아니면 닫기
    if (response.action === ACTION_TYPES.SNOOZE) {
      onSnooze?.();
      handleMinimize();
    } else if (response.action !== ACTION_TYPES.DISMISS) {
      // 액션 후 잠시 대기 후 닫기
      setTimeout(handleDismiss, 500);
    } else {
      handleDismiss();
    }
  }, [onAction, onSnooze, handleDismiss, handleMinimize]);

  // ─────────────────────────────────────────────────────────────────────────
  // 렌더링 조건
  // ─────────────────────────────────────────────────────────────────────────
  if (!isVisible || !currentDialog) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // 위치 스타일
  // ─────────────────────────────────────────────────────────────────────────
  const positionStyles = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 테마 스타일
  // ─────────────────────────────────────────────────────────────────────────
  const theme = {
    bg: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    buttonBg: darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    accentBg: 'bg-[#A996FF]/10',
    accentText: 'text-[#8B7CF7]',
    accentBorder: 'border-[#A996FF]/30',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div 
      className={`fixed ${positionStyles[position]} z-50 transition-all duration-300 ${
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {isExpanded ? (
        // ═══════════════════════════════════════════════════════════════════
        // 확장된 말풍선
        // ═══════════════════════════════════════════════════════════════════
        <div 
          className={`${theme.bg} rounded-2xl shadow-xl border ${theme.border} overflow-hidden
            ${compact ? 'w-72' : 'w-80'} animate-slideUp`}
        >
          {/* 헤더 */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${theme.border}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{PENGUIN_STATES[penguinState]}</span>
              <span className={`text-sm font-medium ${theme.accentText}`}>알프레도</span>
            </div>
            <button 
              onClick={handleDismiss}
              className={`p-1.5 rounded-full ${theme.buttonBg} transition-colors`}
            >
              <X size={14} className={theme.textSecondary} />
            </button>
          </div>
          
          {/* 메시지 */}
          <div className="px-4 py-4">
            <p className={`${theme.text} text-sm leading-relaxed`}>
              {currentDialog.message}
            </p>
          </div>
          
          {/* 응답 버튼들 */}
          <div className={`px-4 pb-4 space-y-2`}>
            {currentDialog.responses.map((response, index) => (
              <button
                key={response.id}
                onClick={() => handleResponseClick(response)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 active:scale-98
                  ${index === 0 
                    ? `${theme.accentBg} ${theme.accentText} border ${theme.accentBorder}` 
                    : `${theme.buttonBg} ${theme.text}`
                  }`}
              >
                <span className="text-base">{response.icon}</span>
                <span className="flex-1 text-left">{response.text}</span>
                <ChevronRight size={14} className="opacity-50" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        // ═══════════════════════════════════════════════════════════════════
        // 최소화된 펭귄 버튼
        // ═══════════════════════════════════════════════════════════════════
        <button
          onClick={handleExpand}
          className={`${theme.bg} rounded-full shadow-lg border ${theme.border}
            p-3 flex items-center gap-2 transition-all duration-200
            hover:shadow-xl hover:scale-105 active:scale-95 animate-bounce-subtle`}
        >
          <span className="text-2xl">{PENGUIN_STATES[penguinState]}</span>
          <div className={`w-2 h-2 rounded-full bg-[#A996FF] animate-pulse`} />
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 최소화된 알프레도 버튼 (별도 사용 가능)
// ─────────────────────────────────────────────────────────────────────────────
export const AlfredoMiniButton = ({
  onClick,
  hasNotification = false,
  penguinState = 'default',
  darkMode = false,
}) => {
  const theme = {
    bg: darkMode ? 'bg-gray-800' : 'bg-white',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <button
      onClick={onClick}
      className={`${theme.bg} rounded-full shadow-lg border ${theme.border}
        p-3 flex items-center gap-2 transition-all duration-200
        hover:shadow-xl hover:scale-105 active:scale-95`}
    >
      <span className="text-2xl">{PENGUIN_STATES[penguinState]}</span>
      {hasNotification && (
        <div className={`w-2 h-2 rounded-full bg-[#A996FF] animate-pulse`} />
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 인라인 넛지 (페이지 내 삽입용)
// ─────────────────────────────────────────────────────────────────────────────
export const InlineNudge = ({
  message,
  responses = [],
  onAction,
  onDismiss,
  darkMode = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const theme = {
    bg: darkMode ? 'bg-[#A996FF]/10' : 'bg-[#F5F3FF]',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-[#C4B5FD]' : 'text-[#8B7CF7]',
    buttonBg: darkMode ? 'bg-[#A996FF]/20 hover:bg-[#A996FF]/30' : 'bg-white hover:bg-gray-50',
    border: darkMode ? 'border-[#A996FF]/30' : 'border-[#E9E3FF]',
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleAction = (response) => {
    onAction?.(response.action, response);
    if (response.action === ACTION_TYPES.DISMISS) {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`${theme.bg} rounded-2xl p-4 border ${theme.border} ${className}`}>
      {/* 메시지 */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl">🐧</span>
        <div className="flex-1">
          <p className={`${theme.text} text-sm`}>{message}</p>
        </div>
        <button 
          onClick={handleDismiss}
          className={`p-1 rounded-full ${theme.buttonBg} transition-colors`}
        >
          <X size={12} className={theme.textSecondary} />
        </button>
      </div>
      
      {/* 응답 버튼들 */}
      {responses.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-8">
          {responses.map((response) => (
            <button
              key={response.id}
              onClick={() => handleAction(response)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                ${theme.buttonBg} ${theme.text} border ${theme.border} transition-all`}
            >
              <span>{response.icon}</span>
              <span>{response.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 간단한 토스트 스타일 넛지
// ─────────────────────────────────────────────────────────────────────────────
export const ToastNudge = ({
  message,
  action,
  onAction,
  onDismiss,
  duration = 5000,
  darkMode = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const theme = {
    bg: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-800',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    accentText: 'text-[#8B7CF7]',
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50
        ${theme.bg} rounded-full shadow-lg border ${theme.border}
        px-4 py-2 flex items-center gap-3 animate-slideUp`}
    >
      <span className="text-lg">🐧</span>
      <p className={`${theme.text} text-sm`}>{message}</p>
      {action && (
        <button 
          onClick={() => {
            onAction?.(action.action, action);
            setIsVisible(false);
          }}
          className={`${theme.accentText} text-sm font-medium`}
        >
          {action.text}
        </button>
      )}
      <button 
        onClick={() => {
          setIsVisible(false);
          onDismiss?.();
        }}
        className="text-gray-400"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 훅: 선제적 대화 관리
// ─────────────────────────────────────────────────────────────────────────────
export const useProactiveDialog = (context = {}, options = {}) => {
  const {
    enabled = true,
    checkInterval = 5 * 60 * 1000, // 5분마다 체크
  } = options;
  
  const [dialog, setDialog] = useState(null);
  const [isShowing, setIsShowing] = useState(false);

  const checkForDialog = useCallback(() => {
    if (!enabled || isShowing) return;
    
    const newDialog = getProactiveDialog(context);
    if (newDialog) {
      setDialog(newDialog);
      recordNudgeShown(newDialog.id);
    }
  }, [enabled, isShowing, context]);

  const showDialog = useCallback(() => {
    setIsShowing(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsShowing(false);
    setDialog(null);
  }, []);

  const snoozeDialog = useCallback((minutes = 30) => {
    setIsShowing(false);
    setTimeout(() => {
      checkForDialog();
    }, minutes * 60 * 1000);
  }, [checkForDialog]);

  // 주기적 체크
  useEffect(() => {
    if (!enabled) return;
    
    // 초기 체크
    checkForDialog();
    
    // 주기적 체크
    const interval = setInterval(checkForDialog, checkInterval);
    return () => clearInterval(interval);
  }, [enabled, checkInterval, checkForDialog]);

  return {
    dialog,
    isShowing,
    showDialog,
    hideDialog,
    snoozeDialog,
    checkForDialog,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 통계 (디버그용)
// ─────────────────────────────────────────────────────────────────────────────
export const getDialogStats = () => PROACTIVE_DIALOG_STATS;

// ─────────────────────────────────────────────────────────────────────────────
// CSS 애니메이션 (tailwind.config.js에 추가 필요)
// ─────────────────────────────────────────────────────────────────────────────
/*
// tailwind.config.js에 추가:
module.exports = {
  theme: {
    extend: {
      animation: {
        'slideUp': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
}
*/

export default ProactiveNudge;