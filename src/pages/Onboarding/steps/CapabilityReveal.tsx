import { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Brain, BarChart3, LucideIcon } from 'lucide-react';

interface CapabilityRevealProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

interface Capability {
  icon: LucideIcon;
  title: string;
  example: string;
  bgStyle: CSSProperties;
  iconStyle: CSSProperties;
}

export default function CapabilityReveal({ onNext }: CapabilityRevealProps) {
  const capabilities: Capability[] = [
    {
      icon: Calendar,
      title: "일정 자동 분석",
      example: "내일 미팅 3개, 오후 2-3시가 집중하기 좋아요",
      bgStyle: { backgroundColor: 'rgba(74, 92, 115, 0.1)' },
      iconStyle: { color: 'var(--os-work)' }
    },
    {
      icon: Brain,
      title: "우선순위 판단",
      example: "프로젝트 제안서가 가장 급해요. 2시간 내 완료 가능",
      bgStyle: { backgroundColor: 'rgba(201, 162, 94, 0.1)' },
      iconStyle: { color: 'var(--accent-primary)' }
    },
    {
      icon: BarChart3,
      title: "패턴 발견",
      example: "화요일 오전이 가장 생산적이에요. 중요한 일 배치했어요",
      bgStyle: { backgroundColor: 'rgba(126, 155, 138, 0.1)' },
      iconStyle: { color: 'var(--os-life)' }
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2
          className="text-xl font-bold mb-2 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          아무것도 입력하지 않아도
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
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
            className="rounded-2xl p-4 shadow-sm"
            style={{
              backgroundColor: 'var(--surface-default)',
              borderColor: 'var(--border-default)',
              borderWidth: 1
            }}
          >
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={cap.bgStyle}
              >
                <cap.icon className="w-5 h-5" style={cap.iconStyle} />
              </div>
              <div className="flex-1">
                <h3
                  className="font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {cap.title}
                </h3>
                <p
                  className="text-sm body-text"
                  style={{ color: 'var(--text-secondary)' }}
                >
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
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          시간이 지날수록 더 정확해져요
        </p>
      </motion.div>

      {/* 버튼 */}
      <button
        onClick={() => onNext()}
        className="w-full py-4 rounded-2xl ui-button transition-colors"
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--accent-on)'
        }}
      >
        좋아요, 계속할게요
      </button>
    </div>
  );
}