import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

// 컨디션 옵션 (Moodistory 스타일 - 5단계)
var CONDITIONS = [
  { value: 1, emoji: '😫', label: '힘들어요', color: '#EF4444', bgColor: 'bg-red-500/20' },
  { value: 2, emoji: '😔', label: '그저그래요', color: '#F59E0B', bgColor: 'bg-amber-500/20' },
  { value: 3, emoji: '😐', label: '보통이에요', color: '#6B7280', bgColor: 'bg-gray-500/20' },
  { value: 4, emoji: '🙂', label: '괜찮아요', color: '#10B981', bgColor: 'bg-emerald-500/20' },
  { value: 5, emoji: '😊', label: '좋아요!', color: '#8B5CF6', bgColor: 'bg-purple-500/20' }
];

// 알프레도 반응 (컨디션별)
var getAlfredoReaction = function(condition) {
  var reactions = {
    1: { emoji: '🥺', message: '힘들구나... 오늘은 천천히 가요' },
    2: { emoji: '😌', message: '그럴 수 있어요. 무리하지 말아요' },
    3: { emoji: '🐧', message: '알겠어요! 적당히 할게요' },
    4: { emoji: '😊', message: '좋아요! 오늘도 화이팅!' },
    5: { emoji: '🎉', message: '완전 좋아요! 오늘 뭐든 할 수 있어요!' }
  };
  return reactions[condition] || reactions[3];
};

// 미니 버튼 (홈 헤더용)
export var ConditionMiniButton = function(props) {
  var condition = props.condition || 3;
  var onClick = props.onClick;
  var darkMode = props.darkMode;
  
  var currentCondition = CONDITIONS.find(function(c) { return c.value === condition; }) || CONDITIONS[2];
  
  return React.createElement('button', {
    onClick: onClick,
    className: 'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all btn-press ' +
      (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80') +
      ' shadow-sm'
  },
    React.createElement('span', { className: 'text-lg' }, currentCondition.emoji),
    React.createElement(ChevronDown, { 
      size: 14, 
      className: darkMode ? 'text-gray-400' : 'text-gray-500'
    })
  );
};

// 퀵 선택 팝업 (바텀시트 스타일)
export var ConditionQuickPicker = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var condition = props.condition || 3;
  var onSelect = props.onSelect;
  var darkMode = props.darkMode;
  
  var handleSelect = function(value) {
    if (onSelect) onSelect(value);
    if (onClose) onClose();
  };
  
  var reaction = getAlfredoReaction(condition);
  
  if (!isOpen) return null;
  
  return React.createElement('div', { 
    className: 'fixed inset-0 z-50'
  },
    // 백드롭
    React.createElement('div', { 
      className: 'absolute inset-0 bg-black/40',
      onClick: onClose
    }),
    
    // 바텀시트
    React.createElement('div', { 
      className: 'absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-10 animate-slideUp ' +
        (darkMode ? 'bg-[#1C1C1E]' : 'bg-white')
    },
      // 핸들
      React.createElement('div', { 
        className: 'w-10 h-1 rounded-full mx-auto mb-6 ' +
          (darkMode ? 'bg-gray-600' : 'bg-gray-300')
      }),
      
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h3', { 
          className: 'text-lg font-semibold ' + (darkMode ? 'text-white' : 'text-gray-900')
        }, '지금 컨디션은 어때요?'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 -mr-2 rounded-full ' +
            (darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100')
        },
          React.createElement(X, { size: 20, className: darkMode ? 'text-gray-400' : 'text-gray-500' })
        )
      ),
      
      // 컨디션 선택 그리드
      React.createElement('div', { className: 'grid grid-cols-5 gap-2 mb-6' },
        CONDITIONS.map(function(c) {
          var isSelected = c.value === condition;
          return React.createElement('button', {
            key: c.value,
            onClick: function() { handleSelect(c.value); },
            className: 'flex flex-col items-center gap-2 py-4 rounded-2xl transition-all btn-press ' +
              (isSelected 
                ? c.bgColor + ' ring-2 ring-offset-2 ' + (darkMode ? 'ring-white/30 ring-offset-[#1C1C1E]' : 'ring-gray-300 ring-offset-white')
                : (darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'))
          },
            React.createElement('span', { className: 'text-3xl' }, c.emoji),
            React.createElement('span', { 
              className: 'text-xs ' + 
                (isSelected 
                  ? (darkMode ? 'text-white' : 'text-gray-900') + ' font-medium'
                  : (darkMode ? 'text-gray-400' : 'text-gray-500'))
            }, c.label)
          );
        })
      ),
      
      // 알프레도 반응
      React.createElement('div', { 
        className: 'flex items-center gap-3 p-4 rounded-2xl ' +
          (darkMode ? 'bg-white/5' : 'bg-gray-50')
      },
        React.createElement('span', { className: 'text-2xl' }, reaction.emoji),
        React.createElement('p', { 
          className: 'text-sm ' + (darkMode ? 'text-gray-300' : 'text-gray-600')
        }, reaction.message)
      )
    )
  );
};

// 인라인 퀵 선택 (홈에 직접 표시)
export var ConditionInlinePicker = function(props) {
  var condition = props.condition || 3;
  var onSelect = props.onSelect;
  var darkMode = props.darkMode;
  var compact = props.compact;
  
  return React.createElement('div', { 
    className: 'flex items-center ' + (compact ? 'gap-1' : 'gap-2')
  },
    CONDITIONS.map(function(c) {
      var isSelected = c.value === condition;
      return React.createElement('button', {
        key: c.value,
        onClick: function() { if (onSelect) onSelect(c.value); },
        className: 'transition-all btn-press ' +
          (compact ? 'p-1.5 rounded-full' : 'p-2 rounded-xl') + ' ' +
          (isSelected 
            ? c.bgColor + ' scale-110'
            : 'opacity-50 hover:opacity-100')
      },
        React.createElement('span', { 
          className: compact ? 'text-lg' : 'text-2xl' 
        }, c.emoji)
      );
    })
  );
};

// 전체 컨디션 관리 컴포넌트
export var ConditionQuickChange = function(props) {
  var condition = props.condition || 3;
  var onConditionChange = props.onConditionChange;
  var darkMode = props.darkMode;
  var variant = props.variant || 'mini'; // 'mini' | 'inline' | 'full'
  
  var isPickerOpen = useState(false);
  var pickerOpen = isPickerOpen[0];
  var setPickerOpen = isPickerOpen[1];
  
  if (variant === 'inline') {
    return React.createElement(ConditionInlinePicker, {
      condition: condition,
      onSelect: onConditionChange,
      darkMode: darkMode,
      compact: false
    });
  }
  
  if (variant === 'compact') {
    return React.createElement(ConditionInlinePicker, {
      condition: condition,
      onSelect: onConditionChange,
      darkMode: darkMode,
      compact: true
    });
  }
  
  // mini (기본) - 버튼 클릭 시 바텀시트
  return React.createElement('div', null,
    React.createElement(ConditionMiniButton, {
      condition: condition,
      onClick: function() { setPickerOpen(true); },
      darkMode: darkMode
    }),
    React.createElement(ConditionQuickPicker, {
      isOpen: pickerOpen,
      onClose: function() { setPickerOpen(false); },
      condition: condition,
      onSelect: onConditionChange,
      darkMode: darkMode
    })
  );
};

export default ConditionQuickChange;
