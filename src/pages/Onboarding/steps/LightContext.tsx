import { motion } from 'framer-motion';
import { Briefcase, Heart, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface LightContextProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function LightContext({ data, onNext }: LightContextProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const contexts = [
    {
      id: 'work',
      icon: Briefcase,
      title: '일에 집중하고 싶어요',
      description: '업무 효율과 성과 향상',
      color: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    {
      id: 'life',
      icon: Heart,
      title: '삶의 균형을 찾고 싶어요',
      description: '일상과 건강, 관계 관리',
      color: 'bg-pink-100',
      borderColor: 'border-pink-300'
    },
    {
      id: 'unsure',
      icon: HelpCircle,
      title: '아직 잘 모르겠어요',
      description: '알프레도가 파악해드릴게요',
      color: 'bg-gray-100',
      borderColor: 'border-gray-300'
    }
  ];

  const handleSelect = (contextId: string) => {
    setSelected(contextId);
  };

  const handleContinue = () => {
    if (selected) {
      onNext({ context: selected });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          어떤 부분에서 도움이 필요하신가요?
        </h2>
        <p className="text-[#666666]">
          나중에 언제든 바꿀 수 있어요
        </p>
      </div>

      {/* 선택 카드 */}
      <div className="flex-1 space-y-3 mb-12">
        {contexts.map((context, index) => (
          <motion.button
            key={context.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(context.id)}
            className={`w-full bg-white rounded-2xl p-4 border-2 transition-all ${
              selected === context.id 
                ? context.borderColor + ' shadow-md' 
                : 'border-[#E5E5E5] hover:border-[#D0D0D0]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 ${context.color} rounded-xl flex items-center justify-center`}>
                <context.icon className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-[#1A1A1A] mb-1">
                  {context.title}
                </h3>
                <p className="text-sm text-[#666666]">
                  {context.description}
                </p>
              </div>
              {selected === context.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-[#A996FF] rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full py-4 rounded-2xl font-medium transition-all ${
          selected 
            ? 'bg-[#1A1A1A] text-white hover:bg-[#333333]' 
            : 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
        }`}
      >
        계속하기
      </button>
    </div>
  );
}