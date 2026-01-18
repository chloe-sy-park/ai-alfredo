import { CSSProperties, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, HelpCircle, LucideIcon } from 'lucide-react';

interface LightContextProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

interface ContextOption {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bgStyle: CSSProperties;
  iconStyle: CSSProperties;
  selectedBorderColor: string;
}

export default function LightContext({ onNext }: LightContextProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const contexts: ContextOption[] = [
    {
      id: 'work',
      icon: Briefcase,
      title: '일에 집중하고 싶어요',
      description: '업무 효율과 성과 향상',
      bgStyle: { backgroundColor: 'rgba(74, 92, 115, 0.1)' },
      iconStyle: { color: 'var(--os-work)' },
      selectedBorderColor: 'var(--os-work)'
    },
    {
      id: 'life',
      icon: Heart,
      title: '삶의 균형을 찾고 싶어요',
      description: '일상과 건강, 관계 관리',
      bgStyle: { backgroundColor: 'rgba(126, 155, 138, 0.1)' },
      iconStyle: { color: 'var(--os-life)' },
      selectedBorderColor: 'var(--os-life)'
    },
    {
      id: 'unsure',
      icon: HelpCircle,
      title: '아직 잘 모르겠어요',
      description: '알프레도가 파악해드릴게요',
      bgStyle: { backgroundColor: 'var(--surface-subtle)' },
      iconStyle: { color: 'var(--text-secondary)' },
      selectedBorderColor: 'var(--accent-primary)'
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
        <h2
          className="text-xl font-bold mb-2 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          어떤 부분에서 도움이 필요하신가요?
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
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
            className="w-full rounded-2xl p-4 transition-all"
            style={{
              backgroundColor: 'var(--surface-default)',
              borderWidth: 2,
              borderColor: selected === context.id ? context.selectedBorderColor : 'var(--border-default)',
              boxShadow: selected === context.id ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={context.bgStyle}
              >
                <context.icon className="w-6 h-6" style={context.iconStyle} />
              </div>
              <div className="flex-1 text-left">
                <h3
                  className="font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {context.title}
                </h3>
                <p
                  className="text-sm body-text"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {context.description}
                </p>
              </div>
              {selected === context.id && (
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
          </motion.button>
        ))}
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className="w-full py-4 rounded-2xl ui-button transition-all"
        style={{
          backgroundColor: selected ? 'var(--accent-primary)' : 'var(--border-default)',
          color: selected ? 'var(--accent-on)' : 'var(--text-tertiary)',
          cursor: selected ? 'pointer' : 'not-allowed'
        }}
      >
        계속하기
      </button>
    </div>
  );
}