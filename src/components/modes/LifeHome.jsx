import React from 'react';
import BriefingCard from '../core/BriefingCard';
import PriorityStack from '../core/PriorityStack';
import Timeline from '../core/Timeline';
import { TrendingUp, TrendingDown, Minus, Heart } from 'lucide-react';

/**
 * LifeHome - LIFE 모드 홈 화면
 */
function LifeHome({
  briefing,
  priorities = [],
  lifeFactors = [],
  relationships = [],
  timelineItems = [],
  onMoreBriefing,
  onPriorityClick
}) {
  const getSignalIcon = (signal) => {
    switch(signal) {
      case 'up': return <TrendingUp size={14} className="text-green-500" />;
      case 'down': return <TrendingDown size={14} className="text-red-500" />;
      default: return <Minus size={14} className="text-neutral-400" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* L1. Briefing Card */}
      <BriefingCard
        variant={briefing?.variant || 'default'}
        headline={briefing?.headline}
        subline={briefing?.subline}
        hasMore={true}
        onMore={onMoreBriefing}
      />
      
      {/* L2. Priority Stack (LIFE only) */}
      <PriorityStack
        items={priorities}
        variant="top3"
        onItemClick={onPriorityClick}
      />
      
      {/* L3. Life Factors */}
      {lifeFactors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-3 border-b border-neutral-100">
            <h3 className="text-sm font-medium text-neutral-500">컨디션 요소</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {lifeFactors.map((factor) => (
              <div key={factor.id} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-xl">
                {getSignalIcon(factor.signal)}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-700">{factor.label}</p>
                  <p className="text-xs text-neutral-400 truncate">{factor.statusText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* L4. Relationship Reminder */}
      {relationships.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-3 border-b border-neutral-100 flex items-center gap-2">
            <Heart size={14} className="text-pink-400" />
            <h3 className="text-sm font-medium text-neutral-500">연락해볼까요?</h3>
          </div>
          <div className="p-4 space-y-3">
            {relationships.map((person, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="font-medium text-neutral-700">{person.name}</span>
                <span className="text-sm text-neutral-400">{person.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* L5. Timeline (LIFE events) */}
      <Timeline
        items={timelineItems}
        mode="life"
      />
    </div>
  );
}

export default LifeHome;
