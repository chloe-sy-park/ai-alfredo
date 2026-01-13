import React from 'react';
import BriefingCard from '../core/BriefingCard';
import PriorityStack from '../core/PriorityStack';
import BalanceHint from '../core/BalanceHint';
import Timeline from '../core/Timeline';

/**
 * AllHome - ALL 모드 홈 화면
 */
function AllHome({
  briefing,
  priorities = [],
  timelineItems = [],
  workRatio = 50,
  lifeRatio = 50,
  onMoreBriefing,
  onPriorityClick,
  onTimelineClick,
  onMorePriority
}) {
  return (
    <div className="space-y-4">
      {/* A1. Briefing Card */}
      <BriefingCard
        variant={briefing?.variant || 'default'}
        headline={briefing?.headline}
        subline={briefing?.subline}
        hasMore={true}
        onMore={onMoreBriefing}
        hintBadge={briefing?.hintBadge}
      />
      
      {/* A2. Priority Stack */}
      <PriorityStack
        items={priorities}
        variant="top3"
        onItemClick={onPriorityClick}
        showMore={priorities.length > 3}
        onMore={onMorePriority}
      />
      
      {/* A3. Balance Hint */}
      <BalanceHint
        workRatio={workRatio}
        lifeRatio={lifeRatio}
      />
      
      {/* A4. Timeline */}
      <Timeline
        items={timelineItems}
        mode="all"
        onItemClick={onTimelineClick}
      />
    </div>
  );
}

export default AllHome;
