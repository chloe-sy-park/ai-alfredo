// MainCardShell.tsx - Glass Surface Shell (Design System v1)
// Glass 스타일은 오직 MainCard에서만 사용 가능
import { ReactNode } from 'react';

export type OSType = 'work' | 'life' | 'finance';

interface MainCardShellProps {
  os: OSType;
  children: ReactNode;
  className?: string;
}

// OS별 accent 색상 (텍스트/아웃라인용, 배경/CTA에는 사용 금지)
const osAccentColors: Record<OSType, { text: string; border: string; icon: string }> = {
  work: {
    text: 'text-os-work',
    border: 'border-os-work/20',
    icon: '#4A5C73'
  },
  life: {
    text: 'text-os-life',
    border: 'border-os-life/20',
    icon: '#7E9B8A'
  },
  finance: {
    text: 'text-os-finance',
    border: 'border-os-finance/20',
    icon: '#8C7A5E'
  }
};

/**
 * MainCardShell - Glass Surface 고정 셸
 *
 * 규칙:
 * - Glass 스타일은 이 컴포넌트 내부에서만 적용
 * - Light: almost solid (96% opacity, 4px blur)
 * - Dark: soft frosted (88% opacity, 8px blur)
 * - 한 화면에 Glass Surface는 최대 1개
 */
export function MainCardShell({ os, children, className = '' }: MainCardShellProps) {
  const osColors = osAccentColors[os];

  return (
    <div
      className={`
        main-card-shell
        rounded-2xl
        p-5
        relative
        overflow-hidden

        /* Light Mode Glass */
        bg-[rgba(255,255,255,0.96)]
        backdrop-blur-[4px]
        border
        border-[rgba(20,21,24,0.06)]
        shadow-[0_2px_8px_rgba(0,0,0,0.04)]

        /* Dark Mode Glass */
        dark:bg-[rgba(26,26,26,0.88)]
        dark:backdrop-blur-[8px]
        dark:border-[rgba(255,255,255,0.08)]
        dark:shadow-[0_2px_10px_rgba(0,0,0,0.22)]

        /* Hover */
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
        dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.28)]

        /* Transition - 허용된 애니메이션만 */
        transition-shadow
        duration-200
        ease-out

        ${className}
      `}
      data-os={os}
    >
      {/* OS Accent Indicator (미세한 상단 라인) */}
      <div
        className={`absolute top-0 left-5 right-5 h-[2px] rounded-full opacity-40`}
        style={{ backgroundColor: osColors.icon }}
      />

      {children}
    </div>
  );
}

export default MainCardShell;
