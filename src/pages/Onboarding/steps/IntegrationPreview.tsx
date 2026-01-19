import { motion } from 'framer-motion';
import { Sparkles, Brain, Clock, Target } from 'lucide-react';
import { CSSProperties } from 'react';

interface IntegrationPreviewProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

interface PreviewItem {
  icon: typeof Clock;
  title: string;
  description: string;
  enabled: boolean;
  bgStyle: CSSProperties;
}

export default function IntegrationPreview({ data, onNext }: IntegrationPreviewProps) {
  const hasCalendar = data.calendarConnected;

  const previews: PreviewItem[] = [
    {
      icon: Clock,
      title: "오늘의 일정 분석",
      description: hasCalendar
        ? "오후 2-4시가 비어있네요. 집중 작업 시간으로 추천해요"
        : "캘린더를 연동하면 더 정확한 분석이 가능해요",
      enabled: hasCalendar,
      bgStyle: { backgroundColor: 'rgba(74, 92, 115, 0.12)' }
    },
    {
      icon: Brain,
      title: "AI 기반 우선순위",
      description: "당신의 패턴을 학습해서 가장 중요한 일을 먼저 제안해요",
      enabled: true,
      bgStyle: { backgroundColor: 'rgba(201, 162, 94, 0.15)' }
    },
    {
      icon: Target,
      title: "스마트 리마인더",
      description: hasCalendar
        ? "미팅 10분 전, 중요 데드라인 전에 미리 알려드려요"
        : "직접 입력한 일정만 알림을 보내드려요",
      enabled: true,
      bgStyle: { backgroundColor: 'rgba(126, 155, 138, 0.15)' }
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
          알프레도가 준비했어요
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
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
            className="rounded-2xl p-4 shadow-card"
            style={{
              backgroundColor: 'var(--surface-default)',
              border: '1px solid var(--border-default)',
              opacity: preview.enabled ? 1 : 0.7
            }}
          >
            <div className="flex gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={preview.bgStyle}
              >
                <preview.icon className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  {preview.title}
                  {preview.enabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    </motion.div>
                  )}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
          className="mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: 'rgba(214, 139, 44, 0.1)',
            border: '1px solid rgba(214, 139, 44, 0.3)'
          }}
        >
          <p className="text-sm text-center" style={{ color: 'var(--state-warning)' }}>
            💡 캘린더를 연동하면 더 많은 기능을 사용할 수 있어요
          </p>
        </motion.div>
      )}

      {/* 버튼 */}
      <button
        onClick={() => onNext()}
        className="w-full py-4 rounded-2xl ui-button transition-colors"
        style={{
          backgroundColor: 'var(--text-primary)',
          color: 'var(--surface-default)'
        }}
      >
        좋아요, 시작할게요
      </button>
    </div>
  );
}
