// ProjectModal - 프로젝트 추가 모달
import React, { useState } from 'react';
import { X } from 'lucide-react';

var COLORS = [
  { name: 'gray', value: '#6B7280' },
  { name: 'red', value: '#EF4444' },
  { name: 'orange', value: '#F97316' },
  { name: 'yellow', value: '#EAB308' },
  { name: 'green', value: '#22C55E' },
  { name: 'blue', value: '#3B82F6' },
  { name: 'purple', value: '#A996FF' },
  { name: 'pink', value: '#EC4899' }
];

var ICONS = ['📁', '💼', '🏠', '🎯', '📚', '💡', '🚀', '⭐', '🎨', '🔧'];

function ProjectModal(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onAdd = props.onAdd;
  
  var nameState = useState('');
  var name = nameState[0];
  var setName = nameState[1];
  
  var colorState = useState(COLORS[6].value);
  var color = colorState[0];
  var setColor = colorState[1];
  
  var iconState = useState(ICONS[0]);
  var icon = iconState[0];
  var setIcon = iconState[1];
  
  if (!isOpen) return null;
  
  var handleSubmit = function(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), color: color, icon: icon });
    setName('');
    setColor(COLORS[6].value);
    setIcon(ICONS[0]);
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center bg-black/50',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'w-full max-w-lg bg-white rounded-t-3xl p-6 animate-slide-up',
      onClick: function(e) { e.stopPropagation(); }
    },
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h2', { className: 'text-lg font-bold' }, '새 프로젝트'),
        React.createElement('button', { onClick: onClose, className: 'p-2 hover:bg-gray-100 rounded-full' },
          React.createElement(X, { size: 20 })
        )
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, '프로젝트 이름'),
          React.createElement('input', {
            type: 'text',
            value: name,
            onChange: function(e) { setName(e.target.value); },
            className: 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]',
            placeholder: '프로젝트 이름을 입력하세요',
            autoFocus: true
          })
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, '아이콘'),
          React.createElement('div', { className: 'flex gap-2 flex-wrap' },
            ICONS.map(function(i) {
              return React.createElement('button', {
                key: i,
                type: 'button',
                onClick: function() { setIcon(i); },
                className: 'w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ' + (icon === i ? 'bg-[#F0EBFF] ring-2 ring-[#A996FF]' : 'bg-gray-100 hover:bg-gray-200')
              }, i);
            })
          )
        ),
        React.createElement('div', { className: 'mb-6' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, '색상'),
          React.createElement('div', { className: 'flex gap-2 flex-wrap' },
            COLORS.map(function(c) {
              return React.createElement('button', {
                key: c.name,
                type: 'button',
                onClick: function() { setColor(c.value); },
                className: 'w-8 h-8 rounded-full transition-transform ' + (color === c.value ? 'ring-2 ring-offset-2 ring-[#A996FF] scale-110' : ''),
                style: { backgroundColor: c.value }
              });
            })
          )
        ),
        React.createElement('button', {
          type: 'submit',
          className: 'w-full py-3 bg-[#A996FF] text-white rounded-xl font-medium hover:bg-[#9580FF] transition-colors'
        }, '프로젝트 추가')
      )
    )
  );
}

export default ProjectModal;
