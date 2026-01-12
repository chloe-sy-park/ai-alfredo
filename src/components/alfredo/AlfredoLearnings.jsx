import React, { useState, useEffect } from 'react';

/**
 * 알프레도가 배운 것 리스트 컴포넌트
 * - DNA 프로파일 기반 학습 내용 시각화
 * - 수정/삭제 기능
 * - 새로 가르치기 모달
 */
var AlfredoLearnings = function(props) {
  var darkMode = props.darkMode;
  var onLearningChange = props.onLearningChange;
  
  // 배운 것 리스트
  var _learningsState = useState(function() {
    var saved = localStorage.getItem('alfredo_learnings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) {
        return getDefaultLearnings();
      }
    }
    return getDefaultLearnings();
  });
  var learnings = _learningsState[0];
  var setLearnings = _learningsState[1];
  
  var _showAddState = useState(false);
  var showAddModal = _showAddState[0];
  var setShowAddModal = _showAddState[1];
  
  var _newLearningState = useState('');
  var newLearning = _newLearningState[0];
  var setNewLearning = _newLearningState[1];
  
  // 기본 학습 내용 (DNA 프로파일 기반)
  function getDefaultLearnings() {
    return [
      {
        id: 'chronotype',
        userInput: '첫 일정이 보통 10시 이후',
        summary: '아침 10시 전엔 알림 최소화',
        type: 'time_preference',
        confidence: 0.8,
        icon: '🌅',
        editable: false // 자동 학습
      },
      {
        id: 'energy_pattern',
        userInput: '수요일 오후에 집중 작업 많음',
        summary: '수요일 오후 = 집중력 피크',
        type: 'energy_pattern',
        confidence: 0.7,
        icon: '⚡',
        editable: false
      },
      {
        id: 'meeting_limit',
        userInput: '미팅 3개 넘는 날은 완료율 낮음',
        summary: '미팅 3개 넘으면 휴식 강조',
        type: 'stress_signal',
        confidence: 0.75,
        icon: '😮‍💨',
        editable: false
      }
    ];
  }
  
  // localStorage 저장
  useEffect(function() {
    localStorage.setItem('alfredo_learnings', JSON.stringify(learnings));
    if (onLearningChange) {
      onLearningChange(learnings);
    }
  }, [learnings]);
  
  // 학습 삭제
  var handleDelete = function(id) {
    if (window.confirm('이 학습을 삭제하시겠어요?')) {
      setLearnings(learnings.filter(function(l) { return l.id !== id; }));
    }
  };
  
  // 새 학습 추가
  var handleAddLearning = function() {
    if (!newLearning.trim()) return;
    
    var newItem = {
      id: 'user_' + Date.now(),
      userInput: newLearning,
      summary: newLearning,
      type: 'user_defined',
      confidence: 1.0,
      icon: '📌',
      editable: true
    };
    
    setLearnings([].concat(learnings, [newItem]));
    setNewLearning('');
    setShowAddModal(false);
  };
  
  // 다크모드 색상
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var bgCard = darkMode ? 'bg-gray-800' : 'bg-white/70';
  var bgItem = darkMode ? 'bg-gray-700/50' : 'bg-white';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 신뢰도 바
  var ConfidenceBar = function(barProps) {
    var confidence = barProps.confidence;
    var width = Math.round(confidence * 100) + '%';
    return React.createElement('div', { 
      className: 'h-1 w-12 ' + (darkMode ? 'bg-gray-600' : 'bg-gray-200') + ' rounded-full overflow-hidden',
      title: '확신도 ' + Math.round(confidence * 100) + '%'
    },
      React.createElement('div', {
        className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full',
        style: { width: width }
      })
    );
  };
  
  // 학습 아이템
  var LearningItem = function(itemProps) {
    var item = itemProps.item;
    
    return React.createElement('div', { 
      className: bgItem + ' rounded-xl p-3 shadow-sm border ' + borderColor
    },
      React.createElement('div', { className: 'flex items-start justify-between' },
        React.createElement('div', { className: 'flex items-start gap-3 flex-1' },
          React.createElement('span', { className: 'text-xl' }, item.icon),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, 
              '"' + item.userInput + '"'
            ),
            React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, 
              '→ ' + item.summary
            ),
            React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
              React.createElement(ConfidenceBar, { confidence: item.confidence }),
              React.createElement('span', { className: textSecondary + ' text-[10px]' },
                item.editable ? '직접 가르침' : '자동 학습'
              )
            )
          )
        ),
        item.editable && React.createElement('button', {
          onClick: function() { handleDelete(item.id); },
          className: 'text-red-400 hover:text-red-500 p-1',
          title: '삭제'
        }, '✕')
      )
    );
  };
  
  // 추가 모달
  var AddModal = function() {
    if (!showAddModal) return null;
    
    return React.createElement('div', {
      className: 'fixed inset-0 bg-black/50 z-50 flex items-end justify-center',
      onClick: function() { setShowAddModal(false); }
    },
      React.createElement('div', {
        className: (darkMode ? 'bg-gray-800' : 'bg-white') + ' rounded-t-2xl w-full max-w-md p-4 pb-8',
        onClick: function(e) { e.stopPropagation(); }
      },
        React.createElement('div', { className: 'w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4' }),
        React.createElement('h3', { className: textPrimary + ' font-bold text-lg mb-4' }, 
          '🐧 알프레도에게 가르치기'
        ),
        React.createElement('p', { className: textSecondary + ' text-sm mb-4' },
          '예: "아침엔 말 걸지 마", "운동 약속은 절대 건드리지 마", "월요일은 항상 힘들어"'
        ),
        React.createElement('input', {
          type: 'text',
          value: newLearning,
          onChange: function(e) { setNewLearning(e.target.value); },
          placeholder: '알프레도에게 알려주세요...',
          className: (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800') + ' w-full px-4 py-3 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-[#A996FF]'
        }),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', {
            onClick: function() { setShowAddModal(false); },
            className: (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600') + ' flex-1 py-3 rounded-xl font-medium'
          }, '취소'),
          React.createElement('button', {
            onClick: handleAddLearning,
            disabled: !newLearning.trim(),
            className: 'flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white disabled:opacity-50'
          }, '기억해둘게요 📝')
        )
      )
    );
  };
  
  return React.createElement('div', { className: bgCard + ' backdrop-blur-xl rounded-xl p-4' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement('span', { className: 'text-xl' }, '📚'),
        '알프레도가 배운 것들'
      ),
      React.createElement('span', { className: textSecondary + ' text-xs' },
        learnings.length + '개 기억 중'
      )
    ),
    
    // 학습 리스트
    React.createElement('div', { className: 'space-y-3' },
      learnings.length === 0 
        ? React.createElement('p', { className: textSecondary + ' text-center py-8 text-sm' },
            '아직 배운 게 없어요.\n같이 시간을 보내면 알아갈게요! 🐧'
          )
        : learnings.map(function(item) {
            return React.createElement(LearningItem, { key: item.id, item: item });
          })
    ),
    
    // 추가 버튼
    React.createElement('button', {
      onClick: function() { setShowAddModal(true); },
      className: 'w-full mt-4 py-3 rounded-xl border-2 border-dashed ' + borderColor + ' ' + textSecondary + ' text-sm font-medium hover:border-[#A996FF] hover:text-[#A996FF] transition-colors'
    }, '+ 새로 가르치기'),
    
    // 추가 모달
    React.createElement(AddModal)
  );
};

export default AlfredoLearnings;
