import React, { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useNudgeStore } from '../../stores/nudgeStore';
import { motion, AnimatePresence } from 'framer-motion';

export const NudgeBubble: React.FC = () => {
  const { getActiveNudge, hideNudge } = useNudgeStore();
  const [nudge, setNudge] = useState(getActiveNudge());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNudge(getActiveNudge());
    }, 100);
    
    return () => clearInterval(interval);
  }, [getActiveNudge]);
  
  if (!nudge) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ 
          type: 'spring',
          duration: 0.4,
          bounce: 0.3
        }}
        className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <img
                  src="/assets/alfredo/avatar/alfredo-avatar-32.png"
                  alt="알프레도"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-2xl">🎩</span>'; }}
                />
              </div>
              <span className="text-xs text-gray-500">
                알프레도
              </span>
            </div>
            <button
              onClick={() => hideNudge(nudge.id)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {/* 메시지 */}
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {nudge.body}
          </p>

          {/* 액션 버튼 */}
          {nudge.actions && nudge.actions.length > 0 && (
            <button
              onClick={() => {
                nudge.actions?.[0]?.handler?.();
                hideNudge(nudge.id);
              }}
              className="
                w-full py-2 px-3
                bg-[#A996FF]/10 hover:bg-[#A996FF]/20
                text-[#A996FF] text-sm font-medium
                rounded-lg transition-colors
                flex items-center justify-center gap-1
              "
            >
              {nudge.actions[0].label}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};