import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function Welcome({ onNext, onSkip }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* 펭귄 아이콘 */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2 
        }}
        className="mb-12"
      >
        <div className="w-24 h-24 bg-[#A996FF] rounded-full flex items-center justify-center">
          <span className="text-5xl">🐧</span>
        </div>
      </motion.div>

      {/* 메인 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">
          안녕하세요, 저는 알프레도예요
        </h1>
        <p className="text-[#666666] text-lg px-8">
          당신만의 AI 멘토가 되어<br />
          함께 성장하고 싶어요
        </p>
      </motion.div>

      {/* 서브 메시지 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-16 px-8"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-[#999999]">
          <Sparkles className="w-4 h-4" />
          <span>도구가 아닌, 관계를 시작해요</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </motion.div>

      {/* 버튼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="w-full px-8 space-y-3"
      >
        <button
          onClick={() => onNext()}
          className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors"
        >
          시작하기
        </button>
        
        <button
          onClick={onSkip}
          className="w-full py-4 text-[#666666] font-medium hover:text-[#1A1A1A] transition-colors"
        >
          나중에 하기
        </button>
      </motion.div>
    </div>
  );
}