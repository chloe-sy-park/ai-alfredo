// EditProjectModal - 프로젝트 편집 모달
import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

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

function EditProjectModal(props) {
  var isOpen = props.isOpen;
  var project = props.project;
  var onClose = props.onClose;
  var onUpdate = props.onUpdate;
  var onDelete = props.onDelete;
  
  var nameState = useState(project ? project.name : '');
  var name = nameState[0];
  var setName = nameState[1];
  
  var colorState = useState(project ? project.color : COLORS[0].value);
  var color = colorState[0];
  var setColor = colorState[1];
  
  var iconState = useState(project ? project.icon : '📁');
  var icon = iconState[0];
  var setIcon = iconState[1];
  
  if (!isOpen || !project) return null;
  
  var handleSubmit = function(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdate({ name: name.trim(), color: color, icon: icon });
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
        React.createElement('h2', { className: 'text-lg font-bold' }, '프로젝트 편집'),
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
            placeholder: '프로젝트 이름'
          })
        ),
        React.createElement('div', { className: 'mb-4' },
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
        React.createElement('div', { className: 'flex gap-3 mt-6' },
          React.createElement('button', {
            type: 'button',
            onClick: onDelete,
            className: 'flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors'
          },
            React.createElement(Trash2, { size: 18 }),
            '삭제'
          ),
          React.createElement('button', {
            type: 'submit',
            className: 'flex-1 py-3 bg-[#A996FF] text-white rounded-xl font-medium hover:bg-[#9580FF] transition-colors'
          }, '저장')
        )
      )
    )
  );
}

export default EditProjectModal;
