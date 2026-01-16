import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, Check, ChevronRight, Sparkles, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CalendarConnectProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

// PRD Phase 3: Capability-first Consent - 샘플 브리핑 미리보기
var SAMPLE_BRIEFINGS = [
  {
    headline: '오늘 미팅이 4개 있어요. 오전에 집중 시간을 확보하세요.',
    status: '바쁨',
    statusColor: 'bg-orange-100 text-orange-700',
  },
  {
    headline: '오후 2시 중요 미팅 전에 30분 여유가 있어요.',
    status: '안정',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    headline: '오늘은 일정이 없어요. 미뤄둔 일을 처리하기 좋아요.',
    status: '여유',
    statusColor: 'bg-blue-100 text-blue-700',
  },
];

export default function CalendarConnect({ onNext }: CalendarConnectProps) {
  var [isConnecting, setIsConnecting] = useState(false);
  var [isConnected, setIsConnected] = useState(false);
  var [showPreview, setShowPreview] = useState(false);
  var [currentSampleIndex, setCurrentSampleIndex] = useState(0);

  var benefits = [
    "하루 일정을 자동으로 분석해요",
    "중요한 미팅 전 미리 알려드려요",
    "비어있는 시간대를 찾아 집중 시간을 제안해요",
    "일정 충돌을 미리 방지해요"
  ];

  // 샘플 브리핑 자동 순환 (미리보기 열려 있을 때만)
  useEffect(() => {
    if (!showPreview) return;

    var timer = setInterval(() => {
      setCurrentSampleIndex((prev) => (prev + 1) % SAMPLE_BRIEFINGS.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [showPreview]);

  const handleConnect = async () => {
    setIsConnecting(true);
    // 실제로는 Google Calendar API 호출
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1500);
  };

  const handleContinue = () => {
    onNext({ calendarConnected: isConnected });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          캘린더를 연동하면
        </h2>
        <p className="text-[#666666]">
          알프레도가 더 똑똑해져요
        </p>
      </div>

      {/* 캘린더 아이콘 */}
      <motion.div 
        className="mb-8 flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`w-32 h-32 ${isConnected ? 'bg-green-100' : 'bg-purple-100'} rounded-3xl flex items-center justify-center relative overflow-hidden`}>
          <Calendar className={`w-16 h-16 ${isConnected ? 'text-green-600' : 'text-[#A996FF]'}`} />
          
          {/* 연동 성공 체크 */}
          {isConnected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 혜택 리스트 */}
      <div className="flex-1 space-y-3 mb-8">
        <p className="text-sm font-semibold text-[#1A1A1A] mb-4">
          이런 것들이 가능해져요:
        </p>
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="w-5 h-5 bg-[#A996FF] bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-[#A996FF]" />
            </div>
            <p className="text-sm text-[#666666] flex-1">{benefit}</p>
          </motion.div>
        ))}
      </div>

      {/* PRD Phase 3: Capability-first Consent - 샘플 브리핑 미리보기 */}
      <div className="mb-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between p-3 bg-[#F8F8FF] rounded-xl hover:bg-[#F0F0FF] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#A996FF]" />
            <span className="text-sm font-medium text-[#666666]">
              이 데이터를 쓰면, 이런 판단이 가능해져요
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-[#999999] transition-transform ${showPreview ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 bg-white rounded-xl border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#A996FF]" />
                  <span className="text-xs font-medium text-[#A996FF]">샘플 브리핑 미리보기</span>
                </div>

                {/* 샘플 브리핑 카드 */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSampleIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-[#FAFAFA] rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#F0F0FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🐧</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SAMPLE_BRIEFINGS[currentSampleIndex].statusColor}`}>
                            {SAMPLE_BRIEFINGS[currentSampleIndex].status}
                          </span>
                        </div>
                        <p className="text-sm text-[#1A1A1A] leading-snug">
                          {SAMPLE_BRIEFINGS[currentSampleIndex].headline}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* 샘플 인디케이터 */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {SAMPLE_BRIEFINGS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSampleIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSampleIndex ? 'bg-[#A996FF]' : 'bg-[#E5E5E5]'
                      }`}
                      aria-label={`샘플 ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 안내 메시지 */}
      <div className="mb-6 p-4 bg-[#F8F8FF] rounded-xl">
        <p className="text-sm text-[#666666] text-center">
          🔒 데이터는 안전하게 보호되며, 읽기 권한만 요청해요
        </p>
      </div>

      {/* 버튼 */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
              isConnecting 
                ? 'bg-[#E5E5E5] text-[#999999]' 
                : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
            }`}
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-[#999999] border-t-transparent rounded-full animate-spin" />
                <span>연동 중...</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span>Google Calendar 연동하기</span>
              </>
            )}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 group"
            >
              <span>계속하기</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
        
        {!isConnected && (
          <button
            onClick={() => onNext({ calendarConnected: false })}
            className="w-full py-4 text-[#666666] font-medium hover:text-[#1A1A1A] transition-colors"
          >
            나중에 연동할게요
          </button>
        )}
      </div>
    </div>
  );
}