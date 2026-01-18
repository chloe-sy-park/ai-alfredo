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
        <h2
          className="text-xl font-bold mb-2 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          캘린더를 연동하면
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
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
        <div
          className="w-32 h-32 rounded-3xl flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: isConnected ? 'rgba(31, 169, 123, 0.1)' : 'rgba(201, 162, 94, 0.1)' }}
        >
          <Calendar
            className="w-16 h-16"
            style={{ color: isConnected ? 'var(--state-success)' : 'var(--accent-primary)' }}
          />
          
          {/* 연동 성공 체크 */}
          {isConnected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--state-success)' }}
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 혜택 리스트 */}
      <div className="flex-1 space-y-3 mb-8">
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
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
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
              style={{ backgroundColor: 'rgba(201, 162, 94, 0.2)' }}
            >
              <Check className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{benefit}</p>
          </motion.div>
        ))}
      </div>

      {/* PRD Phase 3: Capability-first Consent - 샘플 브리핑 미리보기 */}
      <div className="mb-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between p-3 rounded-xl transition-colors"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              이 데이터를 쓰면, 이런 판단이 가능해져요
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${showPreview ? 'rotate-90' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
          />
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
              <div
                className="mt-3 p-4 rounded-xl shadow-sm"
                style={{
                  backgroundColor: 'var(--surface-default)',
                  borderColor: 'var(--border-default)',
                  borderWidth: 1
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    샘플 브리핑 미리보기
                  </span>
                </div>

                {/* 샘플 브리핑 카드 */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSampleIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--surface-subtle)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: 'var(--surface-subtle)' }}
                      >
                        <img
                          src="/assets/alfredo/avatar/alfredo-avatar-32.png"
                          alt="알프레도"
                          className="w-6 h-6 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SAMPLE_BRIEFINGS[currentSampleIndex].statusColor}`}>
                            {SAMPLE_BRIEFINGS[currentSampleIndex].status}
                          </span>
                        </div>
                        <p
                          className="text-sm leading-snug"
                          style={{ color: 'var(--text-primary)' }}
                        >
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
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: index === currentSampleIndex
                          ? 'var(--accent-primary)'
                          : 'var(--border-default)'
                      }}
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
      <div
        className="mb-6 p-4 rounded-xl"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <p
          className="text-sm text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          🔒 데이터는 안전하게 보호되며, 읽기 권한만 요청해요
        </p>
      </div>

      {/* 버튼 */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-4 rounded-2xl ui-button transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: isConnecting ? 'var(--border-default)' : 'var(--accent-primary)',
              color: isConnecting ? 'var(--text-tertiary)' : 'var(--accent-on)'
            }}
          >
            {isConnecting ? (
              <>
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--text-tertiary)' }}
                />
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
              className="w-full py-4 rounded-2xl ui-button transition-colors flex items-center justify-center gap-2 group"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-on)'
              }}
            >
              <span>계속하기</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {!isConnected && (
          <button
            onClick={() => onNext({ calendarConnected: false })}
            className="w-full py-4 ui-button transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            나중에 연동할게요
          </button>
        )}
      </div>
    </div>
  );
}