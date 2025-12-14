import React from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const ReflectModal = ({ isOpen, onClose, changes = [] }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
      >
        {/* Header */}
        <div className="bg-[#F5F3FF] border-b border-[#A996FF]/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#A996FF] rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Alfredo Report</span>
          </div>
          <span className="text-[11px] text-gray-400">방금 전</span>
        </div>
        
        <div className="p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-1">What Changed?</h2>
          <p className="text-sm text-gray-500 mb-5">
            현재 상황에 맞춰 우선순위를 최적화했어요.
          </p>
          
          {/* Change Logs */}
          <div className="space-y-2 mb-6">
            {changes.length > 0 ? changes.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#A996FF] shrink-0 mt-0.5">
                  <ArrowRight size={10} />
                </div>
                <span className="text-sm text-gray-700 leading-snug">{log}</span>
              </div>
            )) : (
              <div className="text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                변경사항이 없습니다.
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl shadow-lg shadow-[#A996FF]/25 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#8B7BE8]"
          >
            <CheckCircle2 size={18} /> 확인
          </button>
        </div>
      </div>
    </div>
  );
};

// === Sparkline Chart (Stock Ticker Style) ===

export default ReflectModal;
