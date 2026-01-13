import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Clock, Calendar, Trash2, Edit3, ChevronRight, Sparkles, Sun, Moon, Coffee, Heart, Dumbbell, Book, Pill, Droplets } from 'lucide-react';

// 루틴 프리셋 템플릿
var ROUTINE_PRESETS = {
  morning: {
    title: '아침 루틴',
    icon: '🌅',
    items: [
      { icon: '💧', title: '물 한 잔', time: '07:00', category: 'health' },
      { icon: '🧘', title: '스트레칭 5분', time: '07:05', category: 'health' },
      { icon: '🪥', title: '양치하기', time: '07:10', category: 'self' },
      { icon: '☀️', title: '햇빛 쬐기', time: '07:15', category: 'health' },
      { icon: '🍳', title: '아침 식사', time: '07:30', category: 'health' }
    ]
  },
  evening: {
    title: '저녁 루틴',
    icon: '🌙',
    items: [
      { icon: '📱', title: '스마트폰 내려놓기', time: '22:00', category: 'health' },
      { icon: '📖', title: '10분 독서', time: '22:10', category: 'growth' },
      { icon: '✍️', title: '하루 기록', time: '22:20', category: 'growth' },
      { icon: '🪥', title: '양치하기', time: '22:30', category: 'self' },
      { icon: '😴', title: '취침', time: '23:00', category: 'health' }
    ]
  },
  health: {
    title: '건강 루틴',
    icon: '💪',
    items: [
      { icon: '💊', title: '영양제 챙기기', time: '08:00', category: 'health' },
      { icon: '💧', title: '물 2L 마시기', time: null, category: 'health' },
      { icon: '🚶', title: '만보 걷기', time: null, category: 'health' },
      { icon: '🏋️', title: '운동 30분', time: '19:00', category: 'health' }
    ]
  },
  focus: {
    title: '집중력 루틴',
    icon: '🎯',
    items: [
      { icon: '📋', title: '오늘 할 일 정리', time: '09:00', category: 'work' },
      { icon: '🍅', title: '포모도로 1세트', time: '09:30', category: 'work' },
      { icon: '☕', title: '커피 브레이크', time: '11:00', category: 'self' },
      { icon: '🎯', title: '중요한 일 먼저', time: '14:00', category: 'work' }
    ]
  }
};

// 카테고리 정보
var CATEGORIES = [
  { id: 'health', label: '건강', color: 'emerald', icon: Heart },
  { id: 'work', label: '업무', color: 'blue', icon: Calendar },
  { id: 'growth', label: '성장', color: 'purple', icon: Book },
  { id: 'self', label: '셀프케어', color: 'pink', icon: Sparkles }
];

// 요일
var DAYS = [
  { id: '일', label: '일' },
  { id: '월', label: '월' },
  { id: '화', label: '화' },
  { id: '수', label: '수' },
  { id: '목', label: '목' },
  { id: '금', label: '금' },
  { id: '토', label: '토' }
];

// 아이콘 선택지
var ICONS = ['📌', '⭐', '💧', '🏃', '📚', '💊', '🧘', '☀️', '🌙', '💪', '🎯', '✅', '🔔', '💡', '🎨', '🎵', '🍎', '☕'];

var RoutineManageModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var routines = props.routines || [];
  var onSave = props.onSave;
  var onDelete = props.onDelete;
  var darkMode = props.darkMode;
  
  // 뷰 상태: 'list' | 'add' | 'edit' | 'presets'
  var viewState = useState('list');
  var view = viewState[0];
  var setView = viewState[1];
  
  // 편집 중인 루틴
  var editingState = useState(null);
  var editing = editingState[0];
  var setEditing = editingState[1];
  
  // 새 루틴 폼
  var formState = useState({
    icon: '📌',
    title: '',
    time: '',
    days: ['월', '화', '수', '목', '금'],
    category: 'self',
    reminder: true
  });
  var form = formState[0];
  var setForm = formState[1];
  
  // 모달 열릴 때 초기화
  useEffect(function() {
    if (isOpen) {
      setView('list');
      setEditing(null);
      setForm({
        icon: '📌',
        title: '',
        time: '',
        days: ['월', '화', '수', '목', '금'],
        category: 'self',
        reminder: true
      });
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  
  // 새 루틴 추가
  var handleAddRoutine = function() {
    setView('add');
    setEditing(null);
    setForm({
      icon: '📌',
      title: '',
      time: '',
      days: ['월', '화', '수', '목', '금'],
      category: 'self',
      reminder: true
    });
  };
  
  // 루틴 편집
  var handleEditRoutine = function(routine) {
    setEditing(routine);
    setForm({
      icon: routine.icon || '📌',
      title: routine.title || routine.name || '',
      time: routine.time || '',
      days: routine.days || ['월', '화', '수', '목', '금'],
      category: routine.category || 'self',
      reminder: routine.reminder !== false
    });
    setView('edit');
  };
  
  // 저장
  var handleSave = function() {
    if (!form.title.trim()) return;
    
    var routineData = {
      id: editing ? editing.id : 'routine_' + Date.now(),
      icon: form.icon,
      title: form.title.trim(),
      time: form.time || null,
      days: form.days,
      category: form.category,
      reminder: form.reminder,
      completed: editing ? editing.completed : false,
      createdAt: editing ? editing.createdAt : new Date().toISOString()
    };
    
    if (onSave) onSave(routineData, !!editing);
    setView('list');
    setEditing(null);
  };
  
  // 삭제
  var handleDelete = function(routineId) {
    if (onDelete) onDelete(routineId);
    setView('list');
    setEditing(null);
  };
  
  // 프리셋 추가
  var handleAddPreset = function(presetKey) {
    var preset = ROUTINE_PRESETS[presetKey];
    if (!preset || !onSave) return;
    
    preset.items.forEach(function(item, idx) {
      var routineData = {
        id: 'routine_' + Date.now() + '_' + idx,
        icon: item.icon,
        title: item.title,
        time: item.time,
        days: ['월', '화', '수', '목', '금', '토', '일'],
        category: item.category,
        reminder: !!item.time,
        completed: false,
        createdAt: new Date().toISOString()
      };
      onSave(routineData, false);
    });
    
    setView('list');
  };
  
  // 요일 토글
  var toggleDay = function(day) {
    if (form.days.includes(day)) {
      setForm(Object.assign({}, form, { 
        days: form.days.filter(function(d) { return d !== day; })
      }));
    } else {
      setForm(Object.assign({}, form, { 
        days: form.days.concat([day])
      }));
    }
  };
  
  // 리스트 뷰
  var renderListView = function() {
    return React.createElement('div', { className: 'flex-1 overflow-y-auto' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h2', { className: textPrimary + ' text-xl font-bold' }, '루틴 관리'),
        React.createElement('button', {
          onClick: onClose,
          className: textSecondary + ' p-2 hover:bg-gray-100 rounded-full transition-colors'
        }, React.createElement(X, { size: 20 }))
      ),
      
      // 알프레도 팁
      React.createElement('div', { 
        className: 'bg-gradient-to-r from-[#A996FF]/20 to-[#8B7CF7]/10 rounded-2xl p-4 mb-4'
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('span', { className: 'text-2xl' }, '🐧'),
          React.createElement('div', null,
            React.createElement('p', { className: textPrimary + ' text-sm font-medium' },
              '작은 루틴부터 시작해보세요!'
            ),
            React.createElement('p', { className: textSecondary + ' text-xs mt-1' },
              'ADHD에는 2-3개의 핵심 루틴이 효과적이에요'
            )
          )
        )
      ),
      
      // 빠른 추가 버튼들
      React.createElement('div', { className: 'flex gap-2 mb-4' },
        React.createElement('button', {
          onClick: handleAddRoutine,
          className: 'flex-1 py-3 bg-[#A996FF] text-white rounded-xl font-semibold flex items-center justify-center gap-2'
        },
          React.createElement(Plus, { size: 18 }),
          '새 루틴'
        ),
        React.createElement('button', {
          onClick: function() { setView('presets'); },
          className: 'flex-1 py-3 ' + cardBg + ' ' + textPrimary + ' rounded-xl font-semibold flex items-center justify-center gap-2 border ' + borderColor
        },
          React.createElement(Sparkles, { size: 18, className: 'text-[#A996FF]' }),
          '템플릿'
        )
      ),
      
      // 루틴 목록
      React.createElement('div', { className: 'space-y-2' },
        routines.length === 0
          ? React.createElement('div', { className: 'text-center py-8' },
              React.createElement('div', { className: 'text-4xl mb-3' }, '📝'),
              React.createElement('p', { className: textSecondary + ' text-sm' }, '아직 루틴이 없어요'),
              React.createElement('p', { className: textSecondary + ' text-xs' }, '위 버튼으로 추가해보세요!')
            )
          : routines.map(function(routine) {
              return React.createElement('div', {
                key: routine.id,
                className: cardBg + ' rounded-xl p-3 flex items-center gap-3 border ' + borderColor
              },
                React.createElement('div', {
                  className: 'w-10 h-10 rounded-full bg-[#A996FF]/20 flex items-center justify-center text-lg'
                }, routine.icon || '📌'),
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('p', { className: textPrimary + ' font-medium text-sm' },
                    routine.title || routine.name
                  ),
                  React.createElement('div', { className: 'flex items-center gap-2 mt-0.5' },
                    routine.time && React.createElement('span', { className: textSecondary + ' text-xs flex items-center gap-1' },
                      React.createElement(Clock, { size: 10 }),
                      routine.time
                    ),
                    routine.days && React.createElement('span', { className: textSecondary + ' text-xs' },
                      routine.days.join(' ')
                    )
                  )
                ),
                React.createElement('button', {
                  onClick: function() { handleEditRoutine(routine); },
                  className: 'p-2 hover:bg-[#A996FF]/10 rounded-lg transition-colors'
                }, React.createElement(Edit3, { size: 16, className: 'text-[#A996FF]' }))
              );
            })
      )
    );
  };
  
  // 추가/편집 뷰
  var renderFormView = function() {
    return React.createElement('div', { className: 'flex-1 overflow-y-auto' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('button', {
          onClick: function() { setView('list'); },
          className: textSecondary + ' text-sm'
        }, '← 뒤로'),
        React.createElement('h2', { className: textPrimary + ' font-bold' },
          editing ? '루틴 편집' : '새 루틴'
        ),
        React.createElement('div', { className: 'w-10' })
      ),
      
      // 아이콘 선택
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-xs font-medium block mb-2' }, '아이콘'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          ICONS.map(function(icon) {
            return React.createElement('button', {
              key: icon,
              onClick: function() { setForm(Object.assign({}, form, { icon: icon })); },
              className: 'w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ' +
                (form.icon === icon 
                  ? 'bg-[#A996FF] ring-2 ring-[#A996FF] ring-offset-2' 
                  : cardBg + ' hover:bg-[#A996FF]/10')
            }, icon);
          })
        )
      ),
      
      // 제목
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-xs font-medium block mb-2' }, '루틴 이름'),
        React.createElement('input', {
          type: 'text',
          value: form.title,
          onChange: function(e) { setForm(Object.assign({}, form, { title: e.target.value })); },
          placeholder: '예: 물 한 잔 마시기',
          className: 'w-full px-4 py-3 rounded-xl border ' + borderColor + ' ' + bgColor + ' ' + textPrimary + ' focus:outline-none focus:ring-2 focus:ring-[#A996FF]'
        })
      ),
      
      // 시간
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-xs font-medium block mb-2' }, '시간 (선택)'),
        React.createElement('input', {
          type: 'time',
          value: form.time,
          onChange: function(e) { setForm(Object.assign({}, form, { time: e.target.value })); },
          className: 'w-full px-4 py-3 rounded-xl border ' + borderColor + ' ' + bgColor + ' ' + textPrimary + ' focus:outline-none focus:ring-2 focus:ring-[#A996FF]'
        })
      ),
      
      // 반복 요일
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-xs font-medium block mb-2' }, '반복 요일'),
        React.createElement('div', { className: 'flex gap-1' },
          DAYS.map(function(day) {
            var isSelected = form.days.includes(day.id);
            return React.createElement('button', {
              key: day.id,
              onClick: function() { toggleDay(day.id); },
              className: 'flex-1 py-2 rounded-lg text-sm font-medium transition-all ' +
                (isSelected 
                  ? 'bg-[#A996FF] text-white' 
                  : cardBg + ' ' + textSecondary + ' hover:bg-[#A996FF]/10')
            }, day.label);
          })
        )
      ),
      
      // 카테고리
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: textSecondary + ' text-xs font-medium block mb-2' }, '카테고리'),
        React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
          CATEGORIES.map(function(cat) {
            var isSelected = form.category === cat.id;
            return React.createElement('button', {
              key: cat.id,
              onClick: function() { setForm(Object.assign({}, form, { category: cat.id })); },
              className: 'p-3 rounded-xl flex items-center gap-2 transition-all ' +
                (isSelected 
                  ? 'bg-[#A996FF] text-white' 
                  : cardBg + ' ' + textPrimary + ' hover:bg-[#A996FF]/10 border ' + borderColor)
            },
              React.createElement(cat.icon, { size: 16 }),
              React.createElement('span', { className: 'text-sm' }, cat.label)
            );
          })
        )
      ),
      
      // 알림
      React.createElement('div', { className: 'mb-6' },
        React.createElement('button', {
          onClick: function() { setForm(Object.assign({}, form, { reminder: !form.reminder })); },
          className: 'w-full p-3 rounded-xl flex items-center justify-between ' + cardBg + ' border ' + borderColor
        },
          React.createElement('span', { className: textPrimary + ' text-sm' }, '알림 받기'),
          React.createElement('div', {
            className: 'w-12 h-6 rounded-full transition-all ' +
              (form.reminder ? 'bg-[#A996FF]' : 'bg-gray-300')
          },
            React.createElement('div', {
              className: 'w-5 h-5 rounded-full bg-white shadow-sm transform transition-all mt-0.5 ' +
                (form.reminder ? 'translate-x-6' : 'translate-x-0.5')
            })
          )
        )
      ),
      
      // 버튼
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('button', {
          onClick: handleSave,
          disabled: !form.title.trim(),
          className: 'w-full py-3 bg-[#A996FF] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
        }, editing ? '저장하기' : '추가하기'),
        
        editing && React.createElement('button', {
          onClick: function() { handleDelete(editing.id); },
          className: 'w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2'
        },
          React.createElement(Trash2, { size: 16 }),
          '삭제하기'
        )
      )
    );
  };
  
  // 프리셋 뷰
  var renderPresetsView = function() {
    return React.createElement('div', { className: 'flex-1 overflow-y-auto' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('button', {
          onClick: function() { setView('list'); },
          className: textSecondary + ' text-sm'
        }, '← 뒤로'),
        React.createElement('h2', { className: textPrimary + ' font-bold' }, '루틴 템플릿'),
        React.createElement('div', { className: 'w-10' })
      ),
      
      // 알프레도 설명
      React.createElement('div', { 
        className: 'bg-gradient-to-r from-[#A996FF]/20 to-[#8B7CF7]/10 rounded-2xl p-4 mb-4'
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('span', { className: 'text-2xl' }, '🐧'),
          React.createElement('p', { className: textPrimary + ' text-sm' },
            '추천 루틴 세트예요! 탭하면 한 번에 추가돼요. 나중에 자유롭게 수정할 수 있어요.'
          )
        )
      ),
      
      // 프리셋 목록
      React.createElement('div', { className: 'space-y-3' },
        Object.keys(ROUTINE_PRESETS).map(function(key) {
          var preset = ROUTINE_PRESETS[key];
          return React.createElement('button', {
            key: key,
            onClick: function() { handleAddPreset(key); },
            className: cardBg + ' rounded-2xl p-4 w-full text-left border ' + borderColor + ' hover:border-[#A996FF]/50 transition-all'
          },
            React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
              React.createElement('div', {
                className: 'w-12 h-12 rounded-xl bg-[#A996FF]/20 flex items-center justify-center text-2xl'
              }, preset.icon),
              React.createElement('div', { className: 'flex-1' },
                React.createElement('p', { className: textPrimary + ' font-bold' }, preset.title),
                React.createElement('p', { className: textSecondary + ' text-xs' },
                  preset.items.length + '개 루틴 포함'
                )
              ),
              React.createElement(ChevronRight, { size: 20, className: textSecondary })
            ),
            React.createElement('div', { className: 'flex flex-wrap gap-1' },
              preset.items.slice(0, 4).map(function(item, idx) {
                return React.createElement('span', {
                  key: idx,
                  className: 'text-xs px-2 py-1 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200') + ' ' + textSecondary
                }, item.icon + ' ' + item.title);
              }),
              preset.items.length > 4 && React.createElement('span', {
                className: 'text-xs px-2 py-1 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-200') + ' ' + textSecondary
              }, '+' + (preset.items.length - 4))
            )
          );
        })
      )
    );
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center'
  },
    // 배경
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/50',
      onClick: onClose
    }),
    
    // 모달
    React.createElement('div', {
      className: bgColor + ' rounded-t-3xl w-full max-w-lg max-h-[85vh] flex flex-col relative animate-slide-up'
    },
      // 핸들
      React.createElement('div', { className: 'flex justify-center py-3' },
        React.createElement('div', { className: 'w-10 h-1 rounded-full bg-gray-300' })
      ),
      
      // 콘텐츠
      React.createElement('div', { className: 'flex-1 overflow-hidden px-5 pb-8' },
        view === 'list' && renderListView(),
        (view === 'add' || view === 'edit') && renderFormView(),
        view === 'presets' && renderPresetsView()
      )
    )
  );
};

export default RoutineManageModal;
