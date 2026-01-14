import { motion } from 'framer-motion';
import { Sparkles, Brain, Clock, Target } from 'lucide-react';

interface IntegrationPreviewProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function IntegrationPreview({ data, onNext }: IntegrationPreviewProps) {
  const hasCalendar = data.calendarConnected;

  const previews = [
    {
      icon: Clock,
      title: "오늘의 일정 분석",
      description: hasCalendar 
        ? "오후 2-4시가 비어있네요. 집중 작업 시간으로 추천해요"
        : "캘린더를 연동하면 더 정확한 분석이 가능해요",
      enabled: hasCalendar,
      color: "bg-blue-100"
    },
    {
      icon: Brain,
      title: "AI 기반 우선순위",
      description: "당신의 패턴을 학습해서 가장 중요한 일을 먼저 제안해요",
      enabled: true,
      color: "bg-purple-100"
    },
    {
      icon: Target,
      title: "스마트 리마인더",
      description: hasCalendar
        ? "미팅 10분 전, 중요 데드라인 전에 미리 알려드려요"
        : "직접 입력한 일정만 알림을 보내드려요",
      enabled: true,
      color: "bg-green-100"
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          알프레도가 준비했어요
        </h2>
        <p className="text-[#666666]">
          이제 이런 것들을 해드릴 수 있어요
        </p>
      </div>

      {/* 미리보기 카드 */}
      <div className="flex-1 space-y-4 mb-8">
        {previews.map((preview, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`bg-white rounded-2xl p-4 border ${
              preview.enabled ? 'border-[#E5E5E5]' : 'border-[#F0F0F0] opacity-70'
            } shadow-sm`}
          >
            <div className="flex gap-3">
              <div className={`w-12 h-12 ${preview.color} rounded-xl flex items-center justify-center`}>
                <preview.icon className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  {preview.title}
                  {preview.enabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Sparkles className="w-4 h-4 text-[#A996FF]" />
                    </motion.div>
                  )}
                </h3>
                <p className="text-sm text-[#666666]">
                  {preview.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 연동 상태 */}
      {!hasCalendar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 p-4 bg-[#FFF8F0] rounded-xl border border-[#FFE0B2]"
        >
          <p className="text-sm text-[#FF9800] text-center">
            💡 캘린더를 연동하면 더 많은 기능을 사용할 수 있어요
          </p>
        </motion.div>
      )}

      {/* 버튼 */}
      <button
        onClick={() => onNext()}
        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors"
      >
        좋아요, 시작할게요
      </button>
    </div>
  );
}