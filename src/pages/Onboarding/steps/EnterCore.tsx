import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Calendar, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface EnterCoreProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function EnterCore({ data, onNext }: EnterCoreProps) {
  const [isReady, setIsReady] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // 닉네임이 없으면 빈 문자열 (표시 시 "님" 생략 처리)
  const userName = data?.userName || '';
  const displayName = userName ? `${userName}님` : '사용자님';

  // 1.5초 후 준비 완료
  useState(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      setTimeout(() => setShowPreview(true), 300);
    }, 1500);
    return () => clearTimeout(timer);
  });

  const handleComplete = () => {
    onNext();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* 처음 몇 초: 준비 메시지 */}
        <AnimatePresence>
          {!isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center">
                {/* 알프레도 확실 애니메이션 */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 bg-[#A996FF] rounded-full flex items-center justify-center mx-auto">
                    <span className="text-5xl">🐧</span>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-lg text-[#666666] mb-2">
                    알프레도가 {displayName}을 위해
                  </p>
                  <p className="text-lg text-[#666666]">
                    첫 브리핑을 준비하고 있어요
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 준비 완료 후: 첫 브리핑 미리보기 */}
        <AnimatePresence>
          {isReady && showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 헤더 */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  준비 완료! 첫 브리핑이에요
                </h2>
                <p className="text-[#666666]">
                  매일 아침 {displayName}만의 브리핑을 준비해드려요
                </p>
              </div>

              {/* 브리핑 미리보기 */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#F8F8FF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A1A] mb-1">
                      좋은 아침이에요, {displayName}!
                    </h3>
                    <p className="text-[#666666]">
                      오늘은 {data?.context === 'work' ? '중요한 미팅과' : '행복한 하루와'} 함께 시작해볼까요?
                    </p>
                  </div>
                </div>

                {/* 오늘의 하이라이트 */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 p-3 bg-[#F8F8FF] rounded-xl"
                  >
                    <Zap className="w-4 h-4 text-[#A996FF]" />
                    <p className="text-sm text-[#666666]">
                      오후 2-4시가 가장 생산적인 시간이에요
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
                  >
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <p className="text-sm text-[#666666]">
                      {data?.calendarConnected 
                        ? '일정 분석 완료! 3개의 태스크가 있어요' 
                        : '캘린더 연동을 하면 더 똑똑해져요'
                      }
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl"
                  >
                    <BarChart3 className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-[#666666]">
                      지난주보다 23% 더 효율적이셔요
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* 하단 메시지 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8 text-center"
              >
                <p className="text-sm text-[#999999]">
                  더 많은 기능들이 기다리고 있어요 🚀
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 버튼 */}
      <AnimatePresence>
        {isReady && showPreview && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={handleComplete}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 group"
          >
            <span>알프레도와 시작하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}