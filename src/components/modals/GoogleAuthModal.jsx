import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, RefreshCw } from 'lucide-react';

const GoogleAuthModal = ({ isOpen, onClose, service = 'googleCalendar', onConnect, onDisconnect, isConnected, userEmail, darkMode }) => {
  const [step, setStep] = useState(isConnected ? 'connected' : 'intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setStep(isConnected ? 'connected' : 'intro');
      setError(null);
    }
  }, [isOpen, isConnected]);
  
  if (!isOpen) return null;
  
  const serviceInfo = {
    googleCalendar: {
      name: 'Google Calendar',
      icon: '📅',
      color: 'from-blue-500 to-blue-600',
      permissions: ['캘린더 읽기/쓰기', '일정 알림 접근'],
      benefits: ['자동 일정 동기화', '알프레도가 일정 기반 추천', '집중 시간 자동 차단']
    },
    gmail: {
      name: 'Gmail',
      icon: '📧',
      color: 'from-red-500 to-red-600',
      permissions: ['이메일 읽기', '라벨 접근'],
      benefits: ['중요 메일 알림', '인박스 자동 정리', '할 일 자동 추출']
    },
    notion: {
      name: 'Notion',
      icon: '📝',
      color: 'from-gray-700 to-gray-800',
      permissions: ['페이지 읽기/쓰기', '데이터베이스 접근'],
      benefits: ['노션 태스크 동기화', '문서 내용 분석', '자동 정리']
    },
    slack: {
      name: 'Slack',
      icon: '💬',
      color: 'from-purple-500 to-purple-600',
      permissions: ['메시지 읽기', '채널 접근'],
      benefits: ['중요 메시지 알림', '미팅 리마인더', '상태 자동 업데이트']
    }
  };
  
  const info = serviceInfo[service] || serviceInfo.googleCalendar;
  
  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setStep('loading');
    
    try {
      // 실제 Google OAuth 연결 시도
      const result = await onConnect?.(service);
      
      // onConnect는 비동기로 tokenClient.requestAccessToken()을 호출하므로
      // 결과는 useGoogleCalendar 훅에서 상태 업데이트로 반영됨
      // 여기서는 로딩 상태만 유지
      
      // 타임아웃 처리 (10초 후 에러 표시)
      setTimeout(() => {
        if (!isConnected) {
          setIsLoading(false);
          // 연결이 안됐으면 intro로 돌아가기
          // (하지만 isConnected가 true가 되면 useEffect가 'connected'로 변경함)
        }
      }, 10000);
      
    } catch (err) {
      setError(err.message || '연결 중 오류가 발생했습니다');
      setStep('intro');
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = () => {
    if (window.confirm(`${info.name} 연결을 해제하시겠어요?\n\n연동된 데이터는 더 이상 동기화되지 않습니다.`)) {
      onDisconnect?.(service);
      onClose();
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep('intro');
  };
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm ${bgColor} rounded-2xl shadow-2xl overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${info.color} p-6 text-white text-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3">
            {info.icon}
          </div>
          <h2 className="text-xl font-bold">{info.name}</h2>
          <p className="text-sm text-white/80 mt-1">
            {step === 'connected' ? '연결됨' : 'Life Butler와 연결'}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {step === 'intro' && (
            <>
              {/* 에러 메시지 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">연결 실패</p>
                    <p className="text-red-600 text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-5">
                <h3 className={`font-bold ${textPrimary} mb-2`}>🔐 요청 권한</h3>
                <ul className="space-y-1.5">
                  {info.permissions.map((p, i) => (
                    <li key={i} className={`text-sm ${textSecondary} flex items-center gap-2`}>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-bold ${textPrimary} mb-2`}>✨ 연결하면</h3>
                <ul className="space-y-1.5">
                  {info.benefits.map((b, i) => (
                    <li key={i} className="text-sm text-emerald-600 flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={handleConnect}
                className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl hover:bg-[#8B7CF7] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 계정으로 연결
              </button>
              
              <p className={`text-xs ${textSecondary} text-center mt-3`}>
                연결은 언제든지 설정에서 해제할 수 있어요
              </p>
            </>
          )}
          
          {step === 'loading' && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 border-4 border-[#A996FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={textPrimary}>Google 계정 연결 중...</p>
              <p className={`text-sm ${textSecondary} mt-1`}>팝업 창에서 계정을 선택해주세요</p>
              
              <button
                onClick={handleRetry}
                className={`mt-6 text-sm ${textSecondary} hover:text-[#A996FF] transition-colors flex items-center gap-1 mx-auto`}
              >
                <RefreshCw size={14} />
                다시 시도
              </button>
            </div>
          )}
          
          {step === 'connected' && (
            <>
              <div className="bg-emerald-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Check size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">연결 완료!</p>
                    <p className="text-sm text-emerald-600">{userEmail || 'Google 계정'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className={`font-bold ${textPrimary} mb-2`}>📊 동기화 상태</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={textSecondary}>상태</span>
                    <span className="text-emerald-600 font-medium">● 연결됨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>자동 동기화</span>
                    <span className={textPrimary}>활성화됨</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} font-bold rounded-xl hover:opacity-90 transition-colors`}
                >
                  닫기
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  연결 해제
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
