import { AlfredoCard } from '../common/Card';
import IntensityBadge from '../common/IntensityBadge';

type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';

interface BriefingCardProps {
  headline: string;
  subline?: string;
  intensity?: IntensityLevel;
  onMore?: () => void;
}

export default function BriefingCard({
  headline,
  subline,
  intensity,
  onMore,
}: BriefingCardProps) {
  return (
    <AlfredoCard onMore={onMore} className="animate-slide-down">
      <div className="space-y-2">
        {/* 강도 뱃지 */}
        {intensity && (
          <div className="mb-2 animate-fade-in animation-delay-100">
            <IntensityBadge level={intensity} size="sm" />
          </div>
        )}
        
        {/* 헤드라인 */}
        <h2 className="font-semibold text-[#1A1A1A] leading-relaxed">
          {headline}
        </h2>
        
        {/* 서브라인 */}
        {subline && (
          <p className="text-sm text-[#666666] leading-relaxed animate-fade-in animation-delay-150">
            {subline}
          </p>
        )}
      </div>
    </AlfredoCard>
  );
}