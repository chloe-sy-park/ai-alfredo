import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface DailyEntryProps {
  onComplete: () => void;
  userName: string;
  briefing: {
    headline: string;
    subline: string;
  };
  isFirstVisitToday: boolean;
}

export default function DailyEntry({ onComplete, userName, briefing, isFirstVisitToday }: DailyEntryProps) {
  var [step, setStep] = useState(0); // 0: penguin, 1: briefing, 2: fade out
  
  useEffect(function() {
    if (!isFirstVisitToday) {
      // 오늘 이미 봤으면 스킵
      onComplete();
      return;
    }
    
    // Step 타이밍
    var timer1 = setTimeout(function() { setStep(1); }, 800); // 펭귄 후 브리핑
    var timer2 = setTimeout(function() { setStep(2); }, 3500); // 전체 3.5초
    var timer3 = setTimeout(function() { onComplete(); }, 4000); // 페이드아웃 후 완료
    
    return function() {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isFirstVisitToday, onComplete]);
  
  if (!isFirstVisitToday) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-b from-[#F0F0FF] to-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: step < 2 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[400px] mx-auto px-8 text-center">
          {/* Step 0: 알프레도 등장 */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="alfredo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                  <img
                    src="/assets/alfredo/avatar/alfredo-avatar-120.png"
                    alt="알프레도"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-6xl">🎩</span>'; }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>알프레도가 준비했어요</p>
                </motion.div>
              </motion.div>
            )}
            
            {/* Step 1: 브리핑 */}
            {step >= 1 && (
              <motion.div
                key="briefing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* 작은 알프레도 */}
                <div className="w-12 h-12 mx-auto mb-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                  <img
                    src="/assets/alfredo/avatar/alfredo-avatar-48.png"
                    alt="알프레도"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-3xl">🎩</span>'; }}
                  />
                </div>
                
                {/* 인사 */}
                <motion.p
                  className="text-[#999999] text-sm mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {userName}님을 위한
                </motion.p>
                
                {/* 메인 브리핑 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 leading-tight">
                    {briefing.headline}
                  </h2>
                  <p className="text-[#666666] text-sm">
                    {briefing.subline}
                  </p>
                </motion.div>
                
                {/* 스파클 애니메이션 */}
                <motion.div
                  className="mt-6 flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles size={20} className="text-[#A996FF]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}