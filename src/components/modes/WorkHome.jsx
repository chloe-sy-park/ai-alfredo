import React from 'react';
import BriefingCard from '../core/BriefingCard';
import PriorityStack from '../core/PriorityStack';
import Timeline from '../core/Timeline';
import ProjectPulse from '../work/ProjectPulse';
import ActionCard from '../work/ActionCard';

/**
 * WorkHome - WORK 모드 홈 화면
 * 
 * 스펙:
 * - 업무에서 중요한 판단을 실행과 결과로 연결
 * 
 * Must Show:
 * - W1. Alfredo WORK Briefing
 * - W2. Today's Work Priority (최대 3개)
 * - W3. Project & Goal Pulse (Green/Yellow/Red)
 * - W4. Work Timeline (회의 중심)
 * - W5. Action Intelligence Cards
 * 
 * Must NOT Show:
 * - 전체 할 일 리스트
 * - 개인 일정
 * - 감정/컨디션 UI
 */

function WorkHome(props) {
  var briefing = props.briefing;
  var priorities = props.priorities || [];
  var projects = props.projects || [];
  var timelineItems = props.timelineItems || [];
  var actionCards = props.actionCards || [];
  var onMoreBriefing = props.onMoreBriefing;
  var onPriorityClick = props.onPriorityClick;
  var onProjectClick = props.onProjectClick;
  var onTimelineClick = props.onTimelineClick;
  var onActionClick = props.onActionClick;
  
  return React.createElement('div', {
    className: 'space-y-4'
  },
    // W1. Briefing Card
    React.createElement(BriefingCard, {
      variant: briefing.variant || 'default',
      headline: briefing.headline,
      subline: briefing.subline,
      hasMore: true,
      onMore: onMoreBriefing,
      hintBadge: briefing.hintBadge
    }),
    
    // W2. Work Priority
    React.createElement(PriorityStack, {
      items: priorities.map(function(p) {
        return Object.assign({}, p, { sourceTag: 'WORK' });
      }),
      variant: 'top3',
      onItemClick: onPriorityClick
    }),
    
    // W3. Project Pulse
    projects.length > 0 && React.createElement(ProjectPulse, {
      projects: projects,
      onOpen: onProjectClick
    }),
    
    // W4. Work Timeline
    React.createElement(Timeline, {
      items: timelineItems,
      mode: 'work',
      title: '오늘 일정',
      onItemClick: onTimelineClick
    }),
    
    // W5. Action Cards
    actionCards.length > 0 && React.createElement('div', {
      className: 'space-y-3'
    },
      actionCards.map(function(card, index) {
        return React.createElement(ActionCard, Object.assign({
          key: index
        }, card, {
          onOpen: function() { onActionClick && onActionClick(card); }
        }));
      })
    )
  );
}

export default WorkHome;
