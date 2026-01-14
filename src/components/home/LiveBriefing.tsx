import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';

interface LiveBriefingProps {
  headline: string;
  subline: string;
  intensity?: IntensityLevel;
  onMore?: () => void;
}

export default function LiveBriefing({ headline, subline, intensity = 'normal', onMore }: LiveBriefingProps) {
  var [isExpanded, setIsExpanded] = useState(false);

  // 강도별 배지 색상
  function getIntensityStyle() {
    switch (intensity) {
      case 'light':
        return { bg: 'bg-green-100', text: 'text-green-700', label: '여유' };
      case 'normal':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: '보통' };
      case 'heavy':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: '바쁨' };
      case 'overloaded':
        return { bg: 'bg-red-100', text: 'text-red-700', label: '과부하' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: '보통' };
    }
  }

  var intensityStyle = getIntensityStyle();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]">
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        {/* 펭귄 아바타 */}
        <div className="w-12 h-12 bg-[#F0F0FF] rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🐧</span>
        </div>
        
        {/* 브리핑 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[#A996FF]">AlFredo 브리핑</span>
            <span className={intensityStyle.bg + ' ' + intensityStyle.text + ' text-xs px-2 py-0.5 rounded-full'}>
              {intensityStyle.label}
            </span>
          </div>
          
          <p className="text-[#1A1A1A] font-medium leading-snug">
            {headline}
          </p>
          
          {isExpanded && (
            <p className="text-sm text-[#666666] mt-1">
              {subline}
            </p>
          )}
        </div>
      </div>
      
      {/* 확장 토글 */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0F0F0]">
        <button
          onClick={function() { setIsExpanded(!isExpanded); }}
          className="flex items-center gap-1 text-xs text-[#999999] hover:text-[#666666]"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              접기
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              자세히
            </>
          )}
        </button>
        
        {onMore && (
          <button
            onClick={onMore}
            className="text-xs text-[#A996FF] hover:text-[#8B7BE8]"
          >
            판단 근거 보기
          </button>
        )}
      </div>
    </div>
  );
}
