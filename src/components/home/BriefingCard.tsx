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
    <AlfredoCard onMore={onMore} className="animate-fade-in">
      <div className="space-y-2">
        {/* 강도 뱃지 */}
        {intensity && (
          <div className="mb-2">
            <IntensityBadge level={intensity} size="sm" />
          </div>
        )}
        
        {/* 헤드라인 */}
        <h2 className="font-semibold text-neutral-800 leading-relaxed">
          {headline}
        </h2>
        
        {/* 서브라인 */}
        {subline && (
          <p className="text-sm text-neutral-500 leading-relaxed">
            {subline}
          </p>
        )}
      </div>
    </AlfredoCard>
  );
}
