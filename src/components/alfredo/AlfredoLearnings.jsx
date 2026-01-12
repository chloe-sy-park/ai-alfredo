import React, { useState, useEffect } from 'react';
import { getLearnings, saveLearning, deleteLearning, getLearningStats } from '../../utils/alfredoLearning';

/**
 * 알프레도가 배운 것 리스트 컴포넌트
 * - alfredoLearning.js 유틸리티 연동
 * - 실시간 통계 표시
 * - 수정/삭제 기능
 */
var AlfredoLearnings = function(props) {
  var darkMode = props.darkMode;
  var onLearningChange = props.onLearningChange;
  
  var _learningsState = useState(getLearnings);
  var learnings = _learningsState[0];
  var setLearnings = _learningsState[1];
  
  var _statsState = useState(getLearningStats);
  var stats = _statsState[0];
  var setStats = _statsState[1];
  
  var _showAddState = useState(false);
  var showAddModal = _showAddState[0];
  var setShowAddModal = _showAddState[1];
  
  var _newLearningState = useState('');
  var newLearning = _newLearningState[0];
  var setNewLearning = _newLearningState[1];
  
  // 데이터 새로고침
  var refreshData = function() {
    setLearnings(getLearnings());
    setStats(getLearningStats());
  };
  
  useEffect(function() {
    refreshData();
    // 1분마다 새로고침
    var interval = setInterval(refreshData, 60000);
    return function() { clearInterval(interval); };
  }, []);
  
  useEffect(function() {
    if (onLearningChange) {
      onLearningChange(learnings);
    }
  }, [learnings]);
  
  // 학습 삭제
  var handleDelete = function(id) {
    if (window.confirm('이 학습을 삭제하시겠어요?')) {
      deleteLearning(id);
      refreshData();
    }
  };
  
  // 새 학습 추가
  var handleAddLearning = function() {
    if (!newLearning.trim()) return;
    
    saveLearning({
      category: 'user_defined',
      content: newLearning,
      source: 'direct',
      confidence: 80
    });
    
    setNewLearning('');
    setShowAddModal(false);
    refreshData();
  };
  
  // 카테고리 아이콘
  var getCategoryIcon = function(category) {
    var icons = {
      time: '🌅',
      style: '💬',
      energy: '⚡',
      preference: '❤️',
      dislike: '👎',
      memory: '📌',
      user_defined: '✏️'
    };
    return icons[category] || '📚';
  };
  
  // 소스 라벨
  var getSourceLabel = function(source) {
    var labels = {
      feedback: '피드백 분석',
      direct: '직접 가르침',
      calendar: '캘린더 분석',
      chat: '대화 학습'
    };
    return labels[source] || '자동 학습';
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
    var width = confidence + '%';
    return React.createElement('div', { 
      className: 'h-1 w-12 ' + (darkMode ? 'bg-gray-600' : 'bg-gray-200') + ' rounded-full overflow-hidden',
      title: '확신도 ' + confidence + '%'
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
    var isDirectLearning = item.source === 'direct' || item.source === 'chat';
    
    return React.createElement('div', { 
      className: bgItem + ' rounded-xl p-3 shadow-sm border ' + borderColor
    },
      React.createElement('div', { className: 'flex items-start justify-between' },
        React.createElement('div', { className: 'flex items-start gap-3 flex-1' },
          React.createElement('span', { className: 'text-xl' }, getCategoryIcon(item.category)),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, 
              '"' + item.content + '"'
            ),
            React.createElement('div', { className: 'flex items-center gap-2 mt-2' },
              React.createElement(ConfidenceBar, { confidence: item.confidence }),
              React.createElement('span', { className: textSecondary + ' text-[10px]' },
                getSourceLabel(item.source)
              )
            )
          )
        ),
        isDirectLearning && React.createElement('button', {
          onClick: function() { handleDelete(item.id); },
          className: 'text-red-400 hover:text-red-500 p-1',
          title: '삭제'
        }, '✕')
      )
    );
  };
  
  // 통계 배지
  var StatsBadge = function() {
    if (stats.totalFeedbacks === 0) return null;
    
    return React.createElement('div', {
      className: (darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 mb-4'
    },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-lg' }, '📊'),
          React.createElement('span', { className: textSecondary + ' text-xs' }, '학습 현황')
        ),
        React.createElement('div', { className: 'flex items-center gap-3 text-xs' },
          React.createElement('span', { className: textSecondary },
            '피드백 ' + stats.totalFeedbacks + '개'
          ),
          React.createElement('span', { className: 'text-emerald-500 font-medium' },
            '👍 ' + stats.positiveRate + '%'
          )
        )
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
          '예: "아침엔 말 걸지 마", "운동 약속은 절대 건드리지 마"'
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
    
    // 통계 배지
    React.createElement(StatsBadge),
    
    // 학습 리스트
    React.createElement('div', { className: 'space-y-3' },
      learnings.length === 0 
        ? React.createElement('p', { className: textSecondary + ' text-center py-8 text-sm' },
            '아직 배운 게 없어요.\n채팅에서 피드백을 주시면 배워갈게요! 🐧'
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
