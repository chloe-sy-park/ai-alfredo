import React, { useState } from 'react';
import { Play, Sparkles, Folder, Clock } from 'lucide-react';

// 🎯 지금 이거부터 카드 - 심플 버전
export var FocusNowCard = function(props) {
  var task = props.task;
  var darkMode = props.darkMode;
  var onStart = props.onStart;
  var onLater = props.onLater;
  
  // 배경색
  var bgClass = darkMode ? 'bg-[#2C2C2E]' : 'bg-white';
  var textColor = darkMode ? 'text-white' : 'text-gray-900';
  var subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  if (!task) {
    // 할 일이 없을 때
    return React.createElement('div', {
      className: bgClass + ' rounded-2xl p-5 shadow-lg text-center ' +
        (darkMode ? '' : 'border border-gray-100')
    },
      React.createElement('span', { className: 'text-4xl mb-3 block' }, '🎉'),
      React.createElement('h3', {
        className: textColor + ' font-bold text-lg mb-1'
      }, '오늘 할 일 다 끝!'),
      React.createElement('p', {
        className: subTextColor + ' text-sm'
      }, '푹 쉬거나, 하고 싶은 거 하세요 💜')
    );
  }
  
  // 태그 정보 생성
  var tags = [];
  if (task.project) {
    tags.push({ icon: Folder, label: task.project });
  }
  if (task.deadline || task.dueDate) {
    var deadline = new Date(task.deadline || task.dueDate);
    var now = new Date();
    var diffHours = (deadline - now) / 1000 / 60 / 60;
    
    if (diffHours > 0 && diffHours <= 24) {
      tags.push({ icon: Clock, label: '오늘 마감', urgent: true });
    } else if (diffHours > 24) {
      tags.push({ icon: Clock, label: deadline.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) });
    } else {
      tags.push({ icon: Clock, label: '마감 지남', urgent: true });
    }
  }
  
  return React.createElement('div', {
    className: bgClass + ' rounded-2xl overflow-hidden shadow-lg ' +
      (darkMode ? '' : 'border border-gray-100')
  },
    // 헤더
    React.createElement('div', {
      className: 'px-5 py-4 flex items-center justify-between'
    },
      // 왼쪽: 제목 + AI 추천 배지
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('h3', {
          className: textColor + ' font-bold text-base'
        }, '지금 이거부터'),
        React.createElement('span', {
          className: 'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ' +
            'bg-[#A996FF]/20 text-[#A996FF]'
        },
          React.createElement(Sparkles, { size: 10 }),
          ' AI 추천'
        )
      ),
      
      // 오른쪽: 태그들
      React.createElement('div', { className: 'flex items-center gap-2' },
        tags.map(function(tag, idx) {
          return React.createElement('span', {
            key: idx,
            className: 'flex items-center gap-1 px-2 py-1 rounded-lg text-xs ' +
              (tag.urgent 
                ? 'bg-red-500/20 text-red-400'
                : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'))
          },
            React.createElement(tag.icon, { size: 12 }),
            tag.label
          );
        })
      )
    ),
    
    // 콘텐츠
    React.createElement('div', { className: 'px-5 pb-5' },
      // 태스크 이름 + 액션 버튼
      React.createElement('div', {
        className: 'flex items-center justify-between gap-4'
      },
        // 태스크 이름
        React.createElement('p', {
          className: textColor + ' font-medium text-base flex-1'
        }, task.title),
        
        // 버튼들
        React.createElement('div', { className: 'flex items-center gap-2' },
          // 나중에
          React.createElement('button', {
            onClick: function() { if (onLater) onLater(task); },
            className: 'px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ' +
              (darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
          }, '나중에'),
          
          // 시작하기
          React.createElement('button', {
            onClick: function() { if (onStart) onStart(task); },
            className: 'px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ' +
              'bg-[#A996FF] text-white hover:bg-[#8B7CF7] flex items-center gap-1'
          },
            React.createElement(Play, { size: 14, className: 'fill-current' }),
            '시작하기'
          )
        )
      )
    )
  );
};

export default FocusNowCard;
