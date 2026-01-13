import React from 'react';

/**
 * BalanceHint - 홈에 작은 균형 힌트
 * 
 * 스펙:
 * - 미니 차트 또는 텍스트 힌트
 * - 하루의 균형 상태만 암시
 * - 기본은 미니멀
 * 
 * Props:
 * - workRatio: number
 * - lifeRatio: number
 * - text?: string ("균형이 나쁘지 않음")
 */

function BalanceHint(props) {
  var workRatio = props.workRatio || 50;
  var lifeRatio = props.lifeRatio || 50;
  var text = props.text;
  
  // 균형 상태 판단
  var getBalanceStatus = function() {
    var diff = Math.abs(workRatio - lifeRatio);
    if (diff <= 20) return 'balanced';
    if (workRatio > lifeRatio) return 'work-heavy';
    return 'life-heavy';
  };
  
  var status = getBalanceStatus();
  
  return React.createElement('div', {
    className: [
      'rounded-card-lg p-3',
      'bg-gradient-to-r from-work-bg/50 to-life-bg/50'
    ].join(' ')
  },
    // 바 차트
    React.createElement('div', {
      className: 'flex items-center gap-2 mb-1'
    },
      // WORK 바
      React.createElement('div', {
        className: 'h-1.5 rounded-full bg-work-text/30',
        style: { width: workRatio + '%' }
      }),
      
      // LIFE 바
      React.createElement('div', {
        className: 'h-1.5 rounded-full bg-life-text/30',
        style: { width: lifeRatio + '%' }
      })
    ),
    
    // 텍스트 힌트
    React.createElement('p', {
      className: 'text-sm text-neutral-600'
    }, text || ('오늘 WORK ' + workRatio + '% · LIFE ' + lifeRatio + '%'))
  );
}

export default BalanceHint;
