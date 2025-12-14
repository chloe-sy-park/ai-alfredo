import React, { useState } from 'react';
import { X, Moon, Clock } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const DoNotDisturbModal = ({ isOpen, onClose, onEnable, currentDuration }) => {
  const [duration, setDuration] = useState(currentDuration || 25);
  
  if (!isOpen) return null;
  
  const durations = [
    { value: 15, label: '15분' },
    { value: 25, label: '25분' },
    { value: 45, label: '45분' },
    { value: 60, label: '1시간' },
    { value: 120, label: '2시간' },
    { value: -1, label: '직접 해제할 때까지' },
  ];
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-xl flex items-center justify-center text-3xl mb-3">
            🌙
          </div>
          <h2 className="text-xl font-bold">방해 금지 모드</h2>
          <p className="text-white/80 text-sm mt-1">알림 없이 집중하세요</p>
        </div>
        
        {/* 내용 */}
        <div className="p-5">
          <p className="text-sm text-gray-500 mb-4">지속 시간을 선택하세요</p>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {durations.map(d => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  duration === d.value
                    ? 'bg-[#8B7CF7] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          
          {/* 활성화 시 차단되는 것들 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">활성화 시:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> 푸시 알림 차단
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✕</span> 브리핑 알림 차단
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 긴급 알림은 표시
              </li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                onEnable(duration);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white font-medium hover:opacity-90 transition-opacity"
            >
              활성화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Widget Gallery & Editor ===

export default DoNotDisturbModal;
