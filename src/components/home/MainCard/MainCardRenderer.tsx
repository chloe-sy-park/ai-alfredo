// MainCardRenderer.tsx - 상태에 따른 MainCard 자동 렌더링
import { ReactNode } from 'react';
import { OSType } from './MainCardShell';
import { MainCardReady } from './MainCardReady';
import { MainCardEmpty } from './MainCardEmpty';
import { MainCardError, ErrorType } from './MainCardError';
import { MainCardOffline } from './MainCardOffline';
import { MainCardSkeleton } from './MainCardSkeleton';

export type GlassState = 'loading' | 'ready' | 'empty' | 'error' | 'offline';

interface ReadyContent {
  contextIcon: ReactNode;
  contextText: string;
  coreInsight: string;
  ctaLabel: string;
  followUp?: string;
}

interface MainCardRendererProps {
  os: OSType;
  glassState: GlassState;
  errorType?: ErrorType;

  // Ready State Content
  readyContent?: ReadyContent;

  // Offline State
  hasCache?: boolean;
  lastUpdated?: string;

  // Event Handlers
  onCta?: () => void;
  onRetry?: () => void;
  onViewCache?: () => void;
  onSettings?: () => void;
  onSetup?: () => void;
}

/**
 * MainCardRenderer - 상태 머신 기반 MainCard 자동 렌더링
 *
 * glassState에 따라 적절한 MainCard 컴포넌트를 렌더링합니다.
 * - loading: MainCardSkeleton
 * - ready: MainCardReady (readyContent 필요)
 * - empty: MainCardEmpty
 * - error: MainCardError
 * - offline: MainCardOffline
 */
export function MainCardRenderer({
  os,
  glassState,
  errorType,
  readyContent,
  hasCache = false,
  lastUpdated,
  onCta,
  onRetry = () => {},
  onViewCache,
  onSettings,
  onSetup,
}: MainCardRendererProps) {
  // 150ms fade transition (CSS에서 처리)
  const transitionClass = 'os-transition-enter';

  switch (glassState) {
    case 'loading':
      return (
        <div className={transitionClass}>
          <MainCardSkeleton os={os} />
        </div>
      );

    case 'ready':
      if (!readyContent) {
        // readyContent가 없으면 skeleton 표시
        return (
          <div className={transitionClass}>
            <MainCardSkeleton os={os} />
          </div>
        );
      }
      return (
        <div className={transitionClass}>
          <MainCardReady
            os={os}
            contextIcon={readyContent.contextIcon}
            contextText={readyContent.contextText}
            coreInsight={readyContent.coreInsight}
            ctaLabel={readyContent.ctaLabel}
            onCtaClick={onCta || (() => {})}
            followUp={readyContent.followUp}
          />
        </div>
      );

    case 'empty':
      return (
        <div className={transitionClass}>
          <MainCardEmpty os={os} onCtaClick={onSetup || (() => {})} />
        </div>
      );

    case 'error':
      return (
        <div className={transitionClass}>
          <MainCardError
            os={os}
            errorType={errorType || 'generic'}
            onRetry={onRetry}
            onSettings={onSettings}
          />
        </div>
      );

    case 'offline':
      return (
        <div className={transitionClass}>
          <MainCardOffline
            os={os}
            hasCache={hasCache}
            lastUpdated={lastUpdated}
            onViewCache={onViewCache}
            onRetry={onRetry}
          />
        </div>
      );

    default:
      return (
        <div className={transitionClass}>
          <MainCardSkeleton os={os} />
        </div>
      );
  }
}

export default MainCardRenderer;
