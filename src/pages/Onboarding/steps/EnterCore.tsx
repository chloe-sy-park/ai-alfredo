import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EnterCoreProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function EnterCore({ data, onNext }: EnterCoreProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 알프레도가 준비하는 시간
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const userName = data.userName || 'Boss';
  const context = data.context || 'unsure';
  
  const getContextMessage = () => {
    switch(context) {
      case 'work':
        return '업무 중심으로 준비했어요';
      case 'life':
        return '일상과 균형을 중심으로 준비했어요';
      default:
        return '전체적으로 살펴볼게요';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* 펭귄 애니메이션 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-[#A996FF] to-[#8B7ACC] rounded-full flex items-center justify-center shadow-lg">
          <span className="text-6xl">🐧</span>
        </div>
        
        {/* 반짝임 효과 */}
        {isReady && (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-[#A996FF]" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-1 -left-3"
            >
              <Sparkles className="w-5 h-5 text-[#8B7ACC]" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* 준비 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12 px-8"
      >
        {!isReady ? (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
              알프레도가 준비하고 있어요
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">
              준비됐어요, {userName}님!
            </h2>
            <p className="text-[#666666] mb-2">
              {getContextMessage()}
            </p>
            <p className="text-sm text-[#999999]">
              이제 시작해볼까요?
            </p>
          </>
        )}
      </motion.div>

      {/* 브리핑 미리보기 */}
      {isReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full px-8 mb-12"
        >
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-sm text-left">
            <p className="text-xs text-[#999999] mb-1">첫 브리핑</p>
            <p className="text-[#1A1A1A] font-medium">
              오늘은 가볍게 시작해요. 알프레도와 천천히 알아가는 시간이에요.
            </p>
          </div>
        </motion.div>
      )}

      {/* 시작 버튼 */}
      {isReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full px-8"
        >
          <button
            onClick={() => onNext()}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 group"
          >
            <span>알프레도와 시작하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}
    </div>
  );
}