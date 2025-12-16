import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Check, X, Flame, Calendar, TrendingUp, MoreHorizontal, Edit2, Trash2, Clock, Target } from 'lucide-react';

// localStorage 키
var STORAGE_KEY = 'lifebutler_habits';

// 기본 습관 템플릿
var HABIT_TEMPLATES = [
  { icon: '💧', name: '물 8잔 마시기', frequency: 'daily', target: 8, unit: '잔' },
  { icon: '🏃', name: '운동하기', frequency: 'daily', target: 1, unit: '회' },
  { icon: '📚', name: '독서하기', frequency: 'daily', target: 30, unit: '분' },
  { icon: '🧘', name: '명상하기', frequency: 'daily', target: 10, unit: '분' },
  { icon: '😴', name: '7시간 이상 수면', frequency: 'daily', target: 7, unit: '시간' },
  { icon: '🥗', name: '건강한 식사', frequency: 'daily', target: 3, unit: '끼' },
  { icon: '📝', name: '일기 쓰기', frequency: 'daily', target: 1, unit: '회' },
  { icon: '🚶', name: '10000보 걷기', frequency: 'daily', target: 10000, unit: '보' },
  { icon: '📱', name: 'SNS 1시간 이하', frequency: 'daily', target: 60, unit: '분' },
  { icon: '🌅', name: '일찍 일어나기', frequency: 'daily', target: 1, unit: '회' }
];

// 빈도 옵션
var FREQUENCY_OPTIONS = {
  daily: { label: '매일', days: 7 },
  weekdays: { label: '평일만', days: 5 },
  weekends: { label: '주말만', days: 2 },
  weekly: { label: '주 N회', days: 0 }
};

// 날짜 유틸
function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekDates(date) {
  var d = new Date(date);
  var day = d.getDay();
  var start = new Date(d);
  start.setDate(d.getDate() - day);
  
  var dates = [];
  for (var i = 0; i < 7; i++) {
    var curr = new Date(start);
    curr.setDate(start.getDate() + i);
    dates.push(curr);
  }
  return dates;
}

// 습관 데이터 로드
function loadHabitData() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load habit data:', e);
  }
  return { habits: [], logs: {} };
}

// 습관 데이터 저장
function saveHabitData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save habit data:', e);
  }
}

// 스트릭 계산
function calculateStreak(logs, habitId) {
  var today = new Date();
  var streak = 0;
  
  for (var i = 0; i < 365; i++) {
    var date = new Date(today);
    date.setDate(today.getDate() - i);
    var key = formatDateKey(date);
    
    if (logs[key] && logs[key][habitId]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
}

// ✅ 습관 체크 버튼
export var HabitCheckButton = function(props) {
  var checked = props.checked;
  var progress = props.progress || 0;
  var target = props.target || 1;
  var onClick = props.onClick;
  var darkMode = props.darkMode;
  var size = props.size || 'medium';
  
  var isComplete = progress >= target;
  var percentage = Math.min(100, (progress / target) * 100);
  
  var sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-10 h-10 text-base'
  };
  
  return React.createElement('button', {
    onClick: onClick,
    className: sizeClasses[size] + ' rounded-lg flex items-center justify-center transition-all ' +
      (isComplete 
        ? 'bg-emerald-500 text-white' 
        : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'))
  },
    isComplete 
      ? React.createElement(Check, { size: size === 'small' ? 12 : 16 })
      : (target > 1 ? progress : '')
  );
};

// 📋 습관 카드
export var HabitCard = function(props) {
  var habit = props.habit;
  var todayLog = props.todayLog;
  var streak = props.streak || 0;
  var weekLogs = props.weekLogs || {};
  var onCheck = props.onCheck;
  var onEdit = props.onEdit;
  var onDelete = props.onDelete;
  var darkMode = props.darkMode;
  var compact = props.compact;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var progress = todayLog || 0;
  var isComplete = progress >= habit.target;
  var weekDates = getWeekDates(new Date());
  
  var menuState = useState(false);
  var showMenu = menuState[0];
  var setShowMenu = menuState[1];
  
  if (compact) {
    return React.createElement('div', {
      className: cardBg + ' rounded-xl p-3 border ' + borderColor + ' flex items-center gap-3'
    },
      React.createElement('span', { className: 'text-xl' }, habit.icon),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('p', { className: textPrimary + ' text-sm font-medium truncate' }, habit.name),
        React.createElement('div', { className: 'flex items-center gap-2 mt-1' },
          streak > 0 && React.createElement('span', { className: 'text-orange-500 text-xs flex items-center gap-0.5' },
            React.createElement(Flame, { size: 10 }),
            streak
          ),
          React.createElement('span', { className: textSecondary + ' text-xs' }, 
            progress + '/' + habit.target + ' ' + habit.unit
          )
        )
      ),
      React.createElement(HabitCheckButton, {
        checked: isComplete,
        progress: progress,
        target: habit.target,
        onClick: function() { if (onCheck) onCheck(habit); },
        darkMode: darkMode,
        size: 'medium'
      })
    );
  }
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    // 헤더
    React.createElement('div', { className: 'flex items-start justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-2xl' }, habit.icon),
        React.createElement('div', null,
          React.createElement('p', { className: textPrimary + ' font-bold' }, habit.name),
          React.createElement('p', { className: textSecondary + ' text-xs' }, 
            FREQUENCY_OPTIONS[habit.frequency]?.label || '매일'
          )
        )
      ),
      React.createElement('div', { className: 'relative' },
        React.createElement('button', {
          onClick: function() { setShowMenu(!showMenu); },
          className: textSecondary + ' hover:' + textPrimary
        }, React.createElement(MoreHorizontal, { size: 18 })),
        showMenu && React.createElement('div', {
          className: cardBg + ' absolute right-0 top-6 rounded-lg shadow-lg border ' + borderColor + ' py-1 z-10'
        },
          React.createElement('button', {
            onClick: function() { if (onEdit) onEdit(habit); setShowMenu(false); },
            className: 'w-full px-4 py-2 text-left text-sm ' + textPrimary + ' hover:bg-[#A996FF]/10 flex items-center gap-2'
          }, React.createElement(Edit2, { size: 14 }), '수정'),
          React.createElement('button', {
            onClick: function() { if (onDelete) onDelete(habit); setShowMenu(false); },
            className: 'w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2'
          }, React.createElement(Trash2, { size: 14 }), '삭제')
        )
      )
    ),
    
    // 진행률
    React.createElement('div', { className: 'mb-3' },
      React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
        React.createElement('span', { className: textSecondary }, progress + ' / ' + habit.target + ' ' + habit.unit),
        React.createElement('span', { className: isComplete ? 'text-emerald-500' : textSecondary }, 
          Math.round((progress / habit.target) * 100) + '%'
        )
      ),
      React.createElement('div', { className: 'h-2 rounded-full ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100') + ' overflow-hidden' },
        React.createElement('div', {
          className: 'h-full rounded-full transition-all ' + (isComplete ? 'bg-emerald-500' : 'bg-[#A996FF]'),
          style: { width: Math.min(100, (progress / habit.target) * 100) + '%' }
        })
      )
    ),
    
    // 주간 기록
    React.createElement('div', { className: 'flex items-center justify-between pt-3 border-t ' + borderColor },
      React.createElement('div', { className: 'flex gap-1' },
        weekDates.map(function(date) {
          var key = formatDateKey(date);
          var isToday = key === formatDateKey(new Date());
          var dayLog = weekLogs[key] || 0;
          var dayComplete = dayLog >= habit.target;
          
          return React.createElement('div', {
            key: key,
            className: 'w-5 h-5 rounded text-[10px] flex items-center justify-center ' +
              (dayComplete 
                ? 'bg-emerald-500 text-white' 
                : (isToday 
                  ? 'ring-1 ring-[#A996FF] ' + (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                  : (darkMode ? 'bg-gray-700' : 'bg-gray-100')))
          }, ['일','월','화','수','목','금','토'][date.getDay()]);
        })
      ),
      streak > 0 && React.createElement('div', { className: 'flex items-center gap-1 text-orange-500' },
        React.createElement(Flame, { size: 14 }),
        React.createElement('span', { className: 'text-sm font-bold' }, streak + '일')
      )
    ),
    
    // 체크 버튼
    React.createElement('button', {
      onClick: function() { if (onCheck) onCheck(habit); },
      className: 'w-full mt-3 py-2 rounded-xl text-sm font-medium transition-all ' +
        (isComplete 
          ? 'bg-emerald-500/20 text-emerald-500'
          : 'bg-[#A996FF] text-white hover:bg-[#8B7CF7]')
    }, isComplete ? '✓ 완료!' : (habit.target > 1 ? '+1 기록하기' : '완료하기'))
  );
};

// ➕ 습관 추가/편집 모달
export var HabitEditModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onSave = props.onSave;
  var habit = props.habit; // 편집 시 기존 습관
  var darkMode = props.darkMode;
  
  var formState = useState({
    icon: habit?.icon || '✨',
    name: habit?.name || '',
    frequency: habit?.frequency || 'daily',
    target: habit?.target || 1,
    unit: habit?.unit || '회'
  });
  var form = formState[0];
  var setForm = formState[1];
  
  if (!isOpen) return null;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-100';
  
  var icons = ['✨', '💧', '🏃', '📚', '🧘', '😴', '🥗', '📝', '🚶', '📱', '🌅', '💪', '🎯', '⭐', '🔥'];
  
  var handleSave = function() {
    if (!form.name.trim()) return;
    if (onSave) {
      onSave({
        id: habit?.id || 'habit-' + Date.now(),
        icon: form.icon,
        name: form.name.trim(),
        frequency: form.frequency,
        target: parseInt(form.target) || 1,
        unit: form.unit,
        createdAt: habit?.createdAt || new Date().toISOString()
      });
    }
    onClose();
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-end z-50',
    onClick: onClose
  },
    React.createElement('div', {
      className: cardBg + ' w-full rounded-t-3xl p-4 pb-8 max-h-[80vh] overflow-y-auto',
      onClick: function(e) { e.stopPropagation(); }
    },
      // 핸들
      React.createElement('div', { className: 'flex justify-center mb-4' },
        React.createElement('div', { className: 'w-10 h-1 rounded-full ' + (darkMode ? 'bg-gray-600' : 'bg-gray-300') })
      ),
      
      // 제목
      React.createElement('h2', { className: textPrimary + ' text-lg font-bold mb-4' }, 
        habit ? '습관 수정' : '새 습관 추가'
      ),
      
      // 아이콘 선택
      React.createElement('div', { className: 'mb-4' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, '아이콘'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          icons.map(function(icon) {
            return React.createElement('button', {
              key: icon,
              onClick: function() { setForm(Object.assign({}, form, { icon: icon })); },
              className: 'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ' +
                (form.icon === icon 
                  ? 'bg-[#A996FF] ring-2 ring-[#A996FF]' 
                  : inputBg)
            }, icon);
          })
        )
      ),
      
      // 이름
      React.createElement('div', { className: 'mb-4' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, '습관 이름'),
        React.createElement('input', {
          type: 'text',
          value: form.name,
          onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })); },
          placeholder: '예: 물 마시기, 운동하기',
          className: 'w-full px-4 py-3 rounded-xl ' + inputBg + ' ' + textPrimary + ' outline-none focus:ring-2 focus:ring-[#A996FF]'
        })
      ),
      
      // 빈도
      React.createElement('div', { className: 'mb-4' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, '빈도'),
        React.createElement('div', { className: 'flex gap-2' },
          Object.keys(FREQUENCY_OPTIONS).map(function(freq) {
            return React.createElement('button', {
              key: freq,
              onClick: function() { setForm(Object.assign({}, form, { frequency: freq })); },
              className: 'flex-1 py-2 rounded-lg text-sm font-medium transition-all ' +
                (form.frequency === freq 
                  ? 'bg-[#A996FF] text-white' 
                  : inputBg + ' ' + textSecondary)
            }, FREQUENCY_OPTIONS[freq].label);
          })
        )
      ),
      
      // 목표
      React.createElement('div', { className: 'mb-6' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, '목표'),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('input', {
            type: 'number',
            value: form.target,
            onChange: function(e) { setForm(Object.assign({}, form, { target: e.target.value })); },
            min: 1,
            className: 'flex-1 px-4 py-3 rounded-xl ' + inputBg + ' ' + textPrimary + ' outline-none focus:ring-2 focus:ring-[#A996FF]'
          }),
          React.createElement('input', {
            type: 'text',
            value: form.unit,
            onChange: function(e) { setForm(Object.assign({}, form, { unit: e.target.value })); },
            placeholder: '단위',
            className: 'w-20 px-4 py-3 rounded-xl ' + inputBg + ' ' + textPrimary + ' outline-none focus:ring-2 focus:ring-[#A996FF]'
          })
        )
      ),
      
      // 템플릿
      !habit && React.createElement('div', { className: 'mb-6' },
        React.createElement('p', { className: textSecondary + ' text-sm mb-2' }, '또는 템플릿 선택'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          HABIT_TEMPLATES.slice(0, 5).map(function(template, idx) {
            return React.createElement('button', {
              key: idx,
              onClick: function() { 
                setForm({
                  icon: template.icon,
                  name: template.name,
                  frequency: template.frequency,
                  target: template.target,
                  unit: template.unit
                });
              },
              className: 'px-3 py-1.5 rounded-full text-xs ' + inputBg + ' ' + textSecondary + ' hover:bg-[#A996FF]/20'
            }, template.icon + ' ' + template.name);
          })
        )
      ),
      
      // 버튼
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', {
          onClick: onClose,
          className: 'flex-1 py-3 rounded-xl ' + inputBg + ' ' + textSecondary + ' font-medium'
        }, '취소'),
        React.createElement('button', {
          onClick: handleSave,
          disabled: !form.name.trim(),
          className: 'flex-1 py-3 rounded-xl bg-[#A996FF] text-white font-medium disabled:opacity-50'
        }, '저장')
      )
    )
  );
};

// 📊 습관 트래커 메인
export var HabitTracker = function(props) {
  var darkMode = props.darkMode;
  var compact = props.compact;
  
  var dataState = useState(loadHabitData);
  var data = dataState[0];
  var setData = dataState[1];
  
  var modalState = useState({ open: false, habit: null });
  var modal = modalState[0];
  var setModal = modalState[1];
  
  // 저장
  useEffect(function() {
    saveHabitData(data);
  }, [data]);
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var today = formatDateKey(new Date());
  var weekDates = getWeekDates(new Date());
  
  // 체크 핸들러
  var handleCheck = function(habit) {
    setData(function(prev) {
      var newLogs = Object.assign({}, prev.logs);
      if (!newLogs[today]) newLogs[today] = {};
      
      var currentProgress = newLogs[today][habit.id] || 0;
      if (currentProgress >= habit.target) {
        // 리셋
        newLogs[today][habit.id] = 0;
      } else {
        // 증가
        newLogs[today][habit.id] = currentProgress + 1;
      }
      
      return Object.assign({}, prev, { logs: newLogs });
    });
  };
  
  // 저장 핸들러
  var handleSave = function(habit) {
    setData(function(prev) {
      var existingIdx = prev.habits.findIndex(function(h) { return h.id === habit.id; });
      var newHabits = prev.habits.slice();
      
      if (existingIdx >= 0) {
        newHabits[existingIdx] = habit;
      } else {
        newHabits.push(habit);
      }
      
      return Object.assign({}, prev, { habits: newHabits });
    });
  };
  
  // 삭제 핸들러
  var handleDelete = function(habit) {
    if (confirm('"' + habit.name + '" 습관을 삭제할까요?')) {
      setData(function(prev) {
        return Object.assign({}, prev, {
          habits: prev.habits.filter(function(h) { return h.id !== habit.id; })
        });
      });
    }
  };
  
  // 주간 로그 가져오기
  var getWeekLogs = function(habitId) {
    var logs = {};
    weekDates.forEach(function(date) {
      var key = formatDateKey(date);
      logs[key] = data.logs[key] ? (data.logs[key][habitId] || 0) : 0;
    });
    return logs;
  };
  
  if (compact) {
    return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
      React.createElement('div', { className: 'flex items-center justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Target, { size: 18, className: 'text-[#A996FF]' }),
          React.createElement('h3', { className: textPrimary + ' font-bold' }, '습관 트래커')
        ),
        React.createElement('button', {
          onClick: function() { setModal({ open: true, habit: null }); },
          className: 'text-[#A996FF]'
        }, React.createElement(Plus, { size: 18 }))
      ),
      data.habits.length > 0 
        ? React.createElement('div', { className: 'space-y-2' },
            data.habits.slice(0, 3).map(function(habit) {
              return React.createElement(HabitCard, {
                key: habit.id,
                habit: habit,
                todayLog: data.logs[today] ? data.logs[today][habit.id] : 0,
                streak: calculateStreak(data.logs, habit.id),
                weekLogs: getWeekLogs(habit.id),
                onCheck: handleCheck,
                darkMode: darkMode,
                compact: true
              });
            })
          )
        : React.createElement('p', { className: textSecondary + ' text-sm text-center py-4' }, '습관을 추가해보세요!'),
      
      React.createElement(HabitEditModal, {
        isOpen: modal.open,
        onClose: function() { setModal({ open: false, habit: null }); },
        onSave: handleSave,
        habit: modal.habit,
        darkMode: darkMode
      })
    );
  }
  
  return React.createElement('div', null,
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(Target, { size: 20, className: 'text-[#A996FF]' }),
        React.createElement('h2', { className: textPrimary + ' text-xl font-bold' }, '습관 트래커')
      ),
      React.createElement('button', {
        onClick: function() { setModal({ open: true, habit: null }); },
        className: 'w-10 h-10 rounded-full bg-[#A996FF] text-white flex items-center justify-center'
      }, React.createElement(Plus, { size: 20 }))
    ),
    
    // 습관 목록
    data.habits.length > 0 
      ? React.createElement('div', { className: 'space-y-4' },
          data.habits.map(function(habit) {
            return React.createElement(HabitCard, {
              key: habit.id,
              habit: habit,
              todayLog: data.logs[today] ? data.logs[today][habit.id] : 0,
              streak: calculateStreak(data.logs, habit.id),
              weekLogs: getWeekLogs(habit.id),
              onCheck: handleCheck,
              onEdit: function(h) { setModal({ open: true, habit: h }); },
              onDelete: handleDelete,
              darkMode: darkMode
            });
          })
        )
      : React.createElement('div', { className: cardBg + ' rounded-2xl p-8 border ' + borderColor + ' text-center' },
          React.createElement('span', { className: 'text-4xl block mb-3' }, '🎯'),
          React.createElement('p', { className: textPrimary + ' font-medium mb-1' }, '습관을 추가해보세요!'),
          React.createElement('p', { className: textSecondary + ' text-sm mb-4' }, '매일 작은 습관이 큰 변화를 만들어요'),
          React.createElement('button', {
            onClick: function() { setModal({ open: true, habit: null }); },
            className: 'px-4 py-2 bg-[#A996FF] text-white rounded-xl font-medium'
          }, '+ 습관 추가')
        ),
    
    React.createElement(HabitEditModal, {
      isOpen: modal.open,
      onClose: function() { setModal({ open: false, habit: null }); },
      onSave: handleSave,
      habit: modal.habit,
      darkMode: darkMode
    })
  );
};

export default {
  HabitCard: HabitCard,
  HabitCheckButton: HabitCheckButton,
  HabitEditModal: HabitEditModal,
  HabitTracker: HabitTracker,
  HABIT_TEMPLATES: HABIT_TEMPLATES
};
