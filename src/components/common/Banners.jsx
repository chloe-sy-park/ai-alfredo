import React from 'react';
import { Moon, WifiOff, Download, X } from 'lucide-react';

const DoNotDisturbBanner = ({ isActive, remainingTime, onDisable }) => {
  if (!isActive) return null;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <Moon size={14} />
        </div>
        <span className="text-sm font-medium">방해 금지 모드</span>
        {remainingTime && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {formatTime(remainingTime)}
          </span>
        )}
      </div>
      <button
        onClick={onDisable}
        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
      >
        해제
      </button>
    </div>
  );
};

// === Offline Banner ===
const OfflineBanner = ({ isOffline }) => {
  if (!isOffline) return null;
  
  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2">
      <span className="text-lg">📡</span>
      <span className="text-sm font-medium">오프라인 상태예요 - 일부 기능이 제한될 수 있어요</span>
    </div>
  );
};

// === PWA Install Banner ===
const PWAInstallBanner = ({ show, onInstall, onDismiss }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-50 animate-[slideUp_0.3s_ease-out] border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-2xl shrink-0">
          🐧
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800">Life Butler 설치하기</h3>
          <p className="text-xs text-gray-500">홈 화면에서 바로 실행해요</p>
        </div>
        <button 
          onClick={onDismiss}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onDismiss}
          className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
        >
          나중에
        </button>
        <button
          onClick={onInstall}
          className="flex-1 py-2.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl text-sm font-bold hover:opacity-90"
        >
          설치하기
        </button>
      </div>
    </div>
  );
};

// === Do Not Disturb Modal ===

export { DoNotDisturbBanner, OfflineBanner, PWAInstallBanner };
