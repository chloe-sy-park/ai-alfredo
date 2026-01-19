// MainCardReady.tsx - Ready State MainCard (4블록 구조 고정)
import { ReactNode } from 'react';
import { MainCardShell, OSType } from './MainCardShell';
import { ChevronRight } from 'lucide-react';

interface MainCardReadyProps {
  os: OSType;
  // A: Context (1줄) - 아이콘 + 컨텍스트 텍스트
  contextIcon: ReactNode;
  contextText: string;
  // B: Core Insight (1문장)
  coreInsight: string;
  // C: CTA (1개 Gold 버튼)
  ctaLabel: string;
  onCtaClick: () => void;
  // D: Follow-up (1줄 optional)
  followUp?: string;
}

/**
 * MainCardReady - 데이터가 있는 정상 상태의 MainCard
 *
 * 4블록 구조 (불변):
 * A. Context (1줄)
 * B. Core Insight (1문장)
 * C. CTA (1개 Gold)
 * D. Follow-up (1줄 optional)
 *
 * 금지사항:
 * - 리스트/그래프/링프로그레스/여러 버튼/링크/스크롤
 */
export function MainCardReady({
  os,
  contextIcon,
  contextText,
  coreInsight,
  ctaLabel,
  onCtaClick,
  followUp
}: MainCardReadyProps) {
  return (
    <MainCardShell os={os}>
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* A: Context (1줄) */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-400">
            {contextIcon}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            {contextText}
          </span>
        </div>

        {/* B: Core Insight (1문장) */}
        <p className="text-base text-text-primary dark:text-white leading-relaxed font-medium">
          {coreInsight}
        </p>

        {/* C: CTA (1개 Gold) */}
        <button
          onClick={onCtaClick}
          className="
            w-full
            flex items-center justify-between
            px-4 py-3
            rounded-xl

            /* Gold CTA - Primary Accent */
            bg-gold-500
            text-[#1A140B]
            font-medium

            /* Hover */
            hover:bg-gold-600

            /* Focus Ring */
            focus:outline-none
            focus:ring-[3px]
            focus:ring-gold-500/28

            /* Transition */
            transition-all
            duration-200
            ease-out
          "
        >
          <span>{ctaLabel}</span>
          <ChevronRight size={18} />
        </button>

        {/* D: Follow-up (1줄 optional) */}
        {followUp && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            {followUp}
          </p>
        )}
      </div>
    </MainCardShell>
  );
}

export default MainCardReady;
