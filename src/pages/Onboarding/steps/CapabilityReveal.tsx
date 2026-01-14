import { motion } from 'framer-motion';
import { Calendar, Brain, BarChart3, Clock } from 'lucide-react';

interface CapabilityRevealProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function CapabilityReveal({ data, onNext, onSkip }: CapabilityRevealProps) {
  const capabilities = [
    {
      icon: Calendar,
      title: "일정 자동 분석",
      example: "내일 미팅 3개, 오후 2-3시가 집중하기 좋아요",
      color: "bg-blue-100"
    },
    {
      icon: Brain,
      title: "우선순위 판단",
      example: "프로젝트 제안서가 가장 급해요. 2시간 내 완료 가능",
      color: "bg-purple-100"
    },
    {
      icon: BarChart3,
      title: "패턴 발견",
      example: "화요일 오전이 가장 생산적이에요. 중요한 일 배치했어요",
      color: "bg-green-100"
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          아무것도 입력하지 않아도
        </h2>
        <p className="text-[#666666]">
          알프레도가 먼저 파악하고 제안해요
        </p>
      </div>

      {/* 카드 리스트 */}
      <div className="flex-1 space-y-3 mb-12">
        {capabilities.map((cap, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-2xl p-4 border border-[#E5E5E5] shadow-sm"
          >
            <div className="flex gap-3">
              <div className={`w-10 h-10 ${cap.color} rounded-xl flex items-center justify-center`}>
                <cap.icon className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A] mb-1">
                  {cap.title}
                </h3>
                <p className="text-sm text-[#666666]">
                  {cap.example}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 하단 메시지 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-8 text-center"
      >
        <p className="text-sm text-[#999999]">
          시간이 지날수록 더 정확해져요
        </p>
      </motion.div>

      {/* 버튼 */}
      <button
        onClick={() => onNext()}
        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors"
      >
        좋아요, 계속할게요
      </button>
    </div>
  );
}