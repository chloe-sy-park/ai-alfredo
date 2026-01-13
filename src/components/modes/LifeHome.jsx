import React from 'react';
import BriefingCard from '../core/BriefingCard';
import PriorityStack from '../core/PriorityStack';
import Timeline from '../core/Timeline';
import LifeFactors from '../life/LifeFactors';
import RelationshipReminder from '../life/RelationshipReminder';

/**
 * LifeHome - LIFE 모드 홈 화면
 * 
 * 스펙:
 * - 나를 소모하지 않으면서 하루를 잘 굴리도록 돕는다
 * 
 * Must Show:
 * - L1. Alfredo LIFE Briefing
 * - L2. Life Priority (오늘 꼭 챙겨야 할 개인 항목)
 * - L3. Life Factors Overview (습관/건강/취미/개인목표)
 * - L4. Relationship Reminders (이름 직접 언급)
 * - L5. Life Timeline (개인 일정 강조, 업무는 흐리게)
 * 
 * Must NOT Show:
 * - 업무 프로젝트
 * - KPI, 완료율
 * - 생산성 점수
 */

function LifeHome(props) {
  var briefing = props.briefing;
  var priorities = props.priorities || [];
  var lifeFactors = props.lifeFactors || [];
  var relationships = props.relationships || [];
  var timelineItems = props.timelineItems || [];
  var onMoreBriefing = props.onMoreBriefing;
  var onPriorityClick = props.onPriorityClick;
  var onRelationshipClick = props.onRelationshipClick;
  var onTimelineClick = props.onTimelineClick;
  
  return React.createElement('div', {
    className: 'space-y-4'
  },
    // L1. Briefing Card
    React.createElement(BriefingCard, {
      variant: briefing.variant || 'default',
      headline: briefing.headline,
      subline: briefing.subline,
      hasMore: true,
      onMore: onMoreBriefing,
      hintBadge: briefing.hintBadge
    }),
    
    // L2. Life Priority
    React.createElement(PriorityStack, {
      items: priorities.map(function(p) {
        return Object.assign({}, p, { sourceTag: 'LIFE' });
      }),
      variant: 'top3',
      onItemClick: onPriorityClick
    }),
    
    // L3. Life Factors
    lifeFactors.length > 0 && React.createElement(LifeFactors, {
      items: lifeFactors
    }),
    
    // L4. Relationship Reminders
    relationships.length > 0 && React.createElement(RelationshipReminder, {
      reminders: relationships,
      onOpen: onRelationshipClick
    }),
    
    // L5. Life Timeline
    React.createElement(Timeline, {
      items: timelineItems,
      mode: 'life',
      title: '오늘 일정',
      onItemClick: onTimelineClick
    })
  );
}

export default LifeHome;
