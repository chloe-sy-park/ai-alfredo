import React from 'react';

/**
 * ProjectPulse - 프로젝트/목표 상태 요약
 * 
 * 스펙:
 * - Green / Yellow / Red 신호
 * - 이유는 More/Chat로
 * 
 * Props:
 * - projects: Array<{ id; name; signal: 'green'|'yellow'|'red' }>
 * - onOpen?(id)
 */

function ProjectPulse(props) {
  var projects = props.projects || [];
  var onOpen = props.onOpen;
  
  // 신호별 스타일
  var signalStyles = {
    green: 'bg-success/10 border-success/20',
    yellow: 'bg-warning/10 border-warning/20',
    red: 'bg-error/10 border-error/20'
  };
  
  var dotStyles = {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-error'
  };
  
  return React.createElement('div', {
    className: 'bg-white rounded-card p-4 shadow-card'
  },
    // 헤더
    React.createElement('p', {
      className: 'text-sm text-neutral-500 mb-3'
    }, '프로젝트 상태'),
    
    // 프로젝트 리스트
    React.createElement('div', { className: 'space-y-2' },
      projects.map(function(project) {
        return React.createElement('button', {
          key: project.id,
          onClick: function() { onOpen && onOpen(project.id); },
          className: [
            'w-full flex items-center gap-3 p-2 rounded-lg border',
            'transition-colors duration-normal',
            signalStyles[project.signal] || signalStyles.green
          ].join(' ')
        },
          // 신호 점
          React.createElement('span', {
            className: [
              'w-2 h-2 rounded-full flex-shrink-0',
              dotStyles[project.signal] || dotStyles.green
            ].join(' ')
          }),
          
          // 프로젝트명
          React.createElement('span', {
            className: 'text-md font-medium text-neutral-800 truncate'
          }, project.name)
        );
      })
    ),
    
    // 빈 상태
    projects.length === 0 && React.createElement('p', {
      className: 'text-sm text-neutral-400 text-center py-4'
    }, '진행 중인 프로젝트가 없어요')
  );
}

export default ProjectPulse;
