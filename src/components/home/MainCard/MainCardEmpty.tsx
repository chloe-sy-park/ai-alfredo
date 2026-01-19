// MainCardEmpty.tsx - Empty State MainCard
import { MainCardShell, OSType } from './MainCardShell';
import { Calendar, Heart, Wallet, ChevronRight } from 'lucide-react';

interface MainCardEmptyProps {
  os: OSType;
  onCtaClick: () => void;
}

// OS별 Empty 상태 콘텐츠
const emptyContent: Record<OSType, {
  icon: React.ReactNode;
  context: string;
  insight: string;
  cta: string;
  followUp: string;
}> = {
  work: {
    icon: <Calendar size={16} />,
    context: 'Work Setup',
    insight: '캘린더를 연결하면 하루 일정을 한눈에 볼 수 있어요.',
    cta: 'Connect calendar',
    followUp: 'Takes about 1 minute.'
  },
  life: {
    icon: <Heart size={16} />,
    context: 'Life Setup',
    insight: '루틴을 추가하면 더 나은 습관을 만들 수 있어요.',
    cta: 'Add a routine',
    followUp: 'Takes about 1 minute.'
  },
  finance: {
    icon: <Wallet size={16} />,
    context: 'Finance Setup',
    insight: '예산을 설정하면 지출을 효과적으로 관리할 수 있어요.',
    cta: 'Set up budget',
    followUp: 'Takes about 1 minute.'
  }
};

/**
 * MainCardEmpty - 데이터가 없는 빈 상태의 MainCard
 *
 * 4블록 구조 유지:
 * A. Context: OS Setup
 * B. Insight: 연결/추가 유도 메시지
 * C. CTA: Connect/Add 버튼 (Gold)
 * D. Follow-up: "Takes about 1 minute."
 */
export function MainCardEmpty({ os, onCtaClick }: MainCardEmptyProps) {
  const content = emptyContent[os];

  return (
    <MainCardShell os={os}>
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* A: Context */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-400">
            {content.icon}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            {content.context}
          </span>
        </div>

        {/* B: Core Insight */}
        <p className="text-base text-text-primary dark:text-white leading-relaxed font-medium">
          {content.insight}
        </p>

        {/* C: CTA (Gold) */}
        <button
          onClick={onCtaClick}
          className="
            w-full
            flex items-center justify-between
            px-4 py-3
            rounded-xl
            bg-gold-500
            text-[#1A140B]
            font-medium
            hover:bg-gold-600
            focus:outline-none
            focus:ring-[3px]
            focus:ring-gold-500/28
            transition-all
            duration-200
            ease-out
          "
        >
          <span>{content.cta}</span>
          <ChevronRight size={18} />
        </button>

        {/* D: Follow-up */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          {content.followUp}
        </p>
      </div>
    </MainCardShell>
  );
}

export default MainCardEmpty;
