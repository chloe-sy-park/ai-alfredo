import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Zap } from 'lucide-react';
import { useState, CSSProperties } from 'react';

interface BoundaryPreviewProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

interface BoundaryOption {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  example: string;
  bgStyle: CSSProperties;
}

export default function BoundaryPreview({ onNext }: BoundaryPreviewProps) {
  const [selected, setSelected] = useState<string>('balanced');

  const boundaries: BoundaryOption[] = [
    {
      id: 'soft',
      icon: Bell,
      title: '부드럽게',
      description: '제안만 하고 기다릴게요',
      example: '💬 "지금 쉬는 시간이면 산책 어떠세요?"',
      bgStyle: { backgroundColor: 'rgba(126, 155, 138, 0.15)' }
    },
    {
      id: 'balanced',
      icon: Shield,
      title: '균형있게',
      description: '중요한 순간에 개입해요',
      example: '💬 "미팅 10분 전이에요. 준비 시작하시죠"',
      bgStyle: { backgroundColor: 'rgba(201, 162, 94, 0.15)' }
    },
    {
      id: 'firm',
      icon: Zap,
      title: '단호하게',
      description: '놓치면 안 되는 건 강하게 알려요',
      example: '💬 "지금 안 하면 마감 못 지켜요. 바로 시작하세요"',
      bgStyle: { backgroundColor: 'rgba(224, 70, 70, 0.1)' }
    }
  ];

  const handleContinue = () => {
    onNext({ boundary: selected });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2
          className="text-xl font-bold mb-2 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          어떻게 도와드릴까요?
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
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
            className="w-full text-left rounded-2xl p-4 border-2 transition-all"
            style={{
              backgroundColor: 'var(--surface-default)',
              borderColor: selected === boundary.id
                ? 'var(--accent-primary)'
                : 'var(--border-default)',
              boxShadow: selected === boundary.id ? '0 4px 12px rgba(0,0,0,0.08)' : undefined
            }}
          >
            <div className="flex gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={boundary.bgStyle}
              >
                <boundary.icon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {boundary.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {boundary.description}
                </p>
              </div>
              {selected === boundary.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <span style={{ color: 'var(--accent-on)' }} className="text-sm">✓</span>
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
                  <div className="pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>예시</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
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
      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-subtle)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          🎩 언제든 설정에서 바꿀 수 있어요
        </p>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-2xl ui-button transition-colors"
        style={{
          backgroundColor: 'var(--text-primary)',
          color: 'var(--surface-default)'
        }}
      >
        이 스타일로 시작할게요
      </button>
    </div>
  );
}
