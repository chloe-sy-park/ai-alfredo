import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

interface BoundaryPreviewProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function BoundaryPreview({ data, onNext }: BoundaryPreviewProps) {
  const [selected, setSelected] = useState<string>('balanced');

  const boundaries = [
    {
      id: 'soft',
      icon: Bell,
      title: '부드럽게',
      description: '제안만 하고 기다릴게요',
      example: '💬 "지금 쉬는 시간이면 산책 어떠세요?"',
      color: 'bg-green-100'
    },
    {
      id: 'balanced',
      icon: Shield,
      title: '균형있게',
      description: '중요한 순간에 개입해요',
      example: '💬 "미팅 10분 전이에요. 준비 시작하시죠"',
      color: 'bg-blue-100'
    },
    {
      id: 'firm',
      icon: Zap,
      title: '단호하게',
      description: '놓치면 안 되는 건 강하게 알려요',
      example: '💬 "지금 안 하면 마감 못 지켜요. 바로 시작하세요"',
      color: 'bg-red-100'
    }
  ];

  const handleContinue = () => {
    onNext({ boundary: selected });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          어떻게 도와드릴까요?
        </h2>
        <p className="text-[#666666]">
          알프레도의 개입 스타일을 선택하세요
        </p>
      </div>

      {/* 스타일 선택 */}
      <div className="flex-1 space-y-3 mb-8">
        {boundaries.map((boundary, index) => (
          <motion.button
            key={boundary.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(boundary.id)}
            className={`w-full text-left bg-white rounded-2xl p-4 border-2 transition-all ${
              selected === boundary.id
                ? 'border-[#A996FF] shadow-md'
                : 'border-[#E5E5E5] hover:border-[#D0D0D0]'
            }`}
          >
            <div className="flex gap-3 mb-3">
              <div className={`w-10 h-10 ${boundary.color} rounded-xl flex items-center justify-center`}>
                <boundary.icon className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A]">
                  {boundary.title}
                </h3>
                <p className="text-sm text-[#666666]">
                  {boundary.description}
                </p>
              </div>
              {selected === boundary.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-[#A996FF] rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}
            </div>
            
            {/* 예시 메시지 */}
            <AnimatePresence>
              {selected === boundary.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-[#F0F0F0]">
                    <p className="text-xs text-[#999999] mb-1">예시</p>
                    <p className="text-sm text-[#1A1A1A]">
                      {boundary.example}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="mb-6 p-4 bg-[#F8F8FF] rounded-xl">
        <p className="text-sm text-[#666666] text-center">
          🐧 언제든 설정에서 바꿀 수 있어요
        </p>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors"
      >
        이 스타일로 시작할게요
      </button>
    </div>
  );
}