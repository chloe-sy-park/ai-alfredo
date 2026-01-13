import React from 'react';
import BriefingCard from '../core/BriefingCard';
import PriorityStack from '../core/PriorityStack';
import Timeline from '../core/Timeline';

/**
 * WorkHome - WORK 모드 홈 화면
 */
function WorkHome({
  briefing,
  priorities = [],
  projects = [],
  timelineItems = [],
  actionCards = [],
  onMoreBriefing,
  onPriorityClick
}) {
  return (
    <div className="space-y-4">
      {/* W1. Briefing Card */}
      <BriefingCard
        variant={briefing?.variant || 'default'}
        headline={briefing?.headline}
        subline={briefing?.subline}
        hasMore={true}
        onMore={onMoreBriefing}
      />
      
      {/* W2. Priority Stack (WORK only) */}
      <PriorityStack
        items={priorities}
        variant="top3"
        onItemClick={onPriorityClick}
      />
      
      {/* W3. Project Pulse */}
      {projects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-3 border-b border-neutral-100">
            <h3 className="text-sm font-medium text-neutral-500">프로젝트 현황</h3>
          </div>
          <div className="p-4 space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  project.signal === 'green' ? 'bg-green-400' :
                  project.signal === 'yellow' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span className="text-neutral-700">{project.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* W4. Timeline (WORK events) */}
      <Timeline
        items={timelineItems}
        mode="work"
      />
    </div>
  );
}

export default WorkHome;
