import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const GoogleAuthModal = ({ isOpen, onClose, service, onConnect, onDisconnect, isConnected }) => {
  const [step, setStep] = useState(isConnected ? 'connected' : 'intro'); // intro, loading, connected
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setStep(isConnected ? 'connected' : 'intro');
      setSelectedAccount(isConnected ? 'user@gmail.com' : null);
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
  
  const handleConnect = () => {
    setStep('loading');
    // OAuth 시뮬레이션
    setTimeout(() => {
      setSelectedAccount('user@gmail.com');
      setStep('connected');
      onConnect?.(service);
    }, 1500);
  };
  
  const handleDisconnect = () => {
    if (window.confirm(`${info.name} 연결을 해제하시겠어요?\n\n연동된 데이터는 더 이상 동기화되지 않습니다.`)) {
      onDisconnect?.(service);
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
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
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">🔐 요청 권한</h3>
                <ul className="space-y-1.5">
                  {info.permissions.map((p, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">✨ 연결하면</h3>
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
                className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl hover:bg-[#8B7CF7] transition-colors"
              >
                Google 계정으로 연결
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                연결은 언제든지 설정에서 해제할 수 있어요
              </p>
            </>
          )}
          
          {step === 'loading' && (
            <div className="py-10 text-center">
              <div className="w-12 h-12 border-4 border-[#A996FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Google 계정 연결 중...</p>
              <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요</p>
            </div>
          )}
          
          {step === 'connected' && (
            <>
              <div className="bg-emerald-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">연결 완료!</p>
                    <p className="text-sm text-emerald-600">{selectedAccount}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">📊 동기화 상태</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">마지막 동기화</span>
                    <span className="text-gray-700">방금 전</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">동기화 항목</span>
                    <span className="text-gray-700">{service === 'gmail' ? '24개 메일' : '12개 일정'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
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

// === Reflect Modal ===

export default GoogleAuthModal;
