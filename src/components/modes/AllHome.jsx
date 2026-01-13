import React from 'react';
import BriefingCard from '../core/BriefingCard';
import PriorityStack from '../core/PriorityStack';
import BalanceHint from '../core/BalanceHint';
import Timeline from '../core/Timeline';

/**
 * AllHome - ALL 모드 홈 화면
 * 
 * 스펙:
 * - 하루 전체에서 생산성을 최대화하는 우선순위 제시
 * - ALL은 WORK와 LIFE의 합이 아니라 재정렬된 판단 결과
 * 
 * Must Show:
 * - A1. Alfredo ALL Briefing (Top)
 * - A2. Unified Priority Stack (Core)
 * - A3. Balance Hint (Minimal)
 * - A4. Unified Timeline
 * 
 * Must NOT Show:
 * - 프로젝트 상세 리스트
 * - 습관 트래커
 * - 이메일 인박스
 * - 점수 기반 랭킹
 */

function AllHome(props) {
  var briefing = props.briefing;
  var priorities = props.priorities || [];
  var timelineItems = props.timelineItems || [];
  var workRatio = props.workRatio || 50;
  var lifeRatio = props.lifeRatio || 50;
  var onMoreBriefing = props.onMoreBriefing;
  var onPriorityClick = props.onPriorityClick;
  var onTimelineClick = props.onTimelineClick;
  var onMorePriority = props.onMorePriority;
  
  return React.createElement('div', {
    className: 'space-y-4'
  },
    // A1. Briefing Card
    React.createElement(BriefingCard, {
      variant: briefing.variant || 'default',
      headline: briefing.headline,
      subline: briefing.subline,
      hasMore: true,
      onMore: onMoreBriefing,
      hintBadge: briefing.hintBadge
    }),
    
    // A2. Priority Stack
    React.createElement(PriorityStack, {
      items: priorities,
      variant: 'top3',
      onItemClick: onPriorityClick,
      showMore: priorities.length > 3,
      onMore: onMorePriority
    }),
    
    // A3. Balance Hint
    React.createElement(BalanceHint, {
      workRatio: workRatio,
      lifeRatio: lifeRatio
    }),
    
    // A4. Timeline
    React.createElement(Timeline, {
      items: timelineItems,
      mode: 'all',
      onItemClick: onTimelineClick
    })
  );
}

export default AllHome;
