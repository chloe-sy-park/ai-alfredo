import React, { useState, useEffect } from 'react';
import { 
  Heart, Droplets, Moon, Footprints, Pill, Users, BookOpen,
  ChevronRight, Plus, Check, Calendar, Clock, Phone, MessageCircle,
  Sparkles, Sun, Cloud, CloudRain, Coffee, Zap, Target, AlertCircle,
  Activity, Smile, Frown, Meh, TrendingUp, Bell, Star
} from 'lucide-react';
import { mockRoutines, mockWeather } from '../../data/mockData';

// 알프레도 브리핑 컴포넌트 (일상 버전)
var AlfredoBriefing = function(props) {
  var darkMode = props.darkMode;
  var healthData = props.healthData || {};
  var relationships = props.relationships || [];
  var routines = props.routines || [];
  var mood = props.mood;
  var energy = props.energy;
  var weather = props.weather;
  var userName = props.userName || 'Boss';
  
  var hour = new Date().getHours();
  
  // 시간대별 인사 (일상 버전)
  var getGreeting = function() {
    if (hour < 6) return '새벽이에요, 푹 주무셨나요?';
    if (hour < 10) return '좋은 아침이에요! 오늘 컨디션은 어떠세요?';
    if (hour < 12) return '활기찬 오전 보내고 계신가요?';
    if (hour < 14) return '점심 맛있게 드셨나요?';
    if (hour < 18) return '오후도 건강하게 보내세요!';
    if (hour < 21) return '저녁 시간이에요, 하루 마무리 잘 하세요';
    return '편안한 밤 되세요 😴';
  };
  
  // 오늘 완료한 루틴
  var completedRoutines = routines.filter(function(r) { return r.completed; }).length;
  var totalRoutines = routines.length;
  
  // 연락 필요한 사람
  var needContact = relationships.filter(function(r) {
    if (!r.lastContact) return true;
    var lastDate = new Date(r.lastContact);
    var daysSince = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    return daysSince > (r.contactFrequency || 30);
  });
  
  // 건강 요약
  var waterGoal = healthData.waterGoal || 8;
  var waterIntake = healthData.waterIntake || 0;
  var steps = healthData.steps || 0;
  var sleepHours = healthData.sleepHours || 0;
  
  var cardBg = darkMode ? 'bg-gradient-to-br from-[#2D2640] to-[#1F1833]' : 'bg-gradient-to-br from-[#A996FF]/20 to-[#8B7CF7]/10';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + (darkMode ? 'border-[#A996FF]/20' : 'border-[#A996FF]/30') },
    // 헤더
    React.createElement('div', { className: 'flex items-start gap-3 mb-3' },
      React.createElement('div', { className: 'text-2xl' }, '🐧'),
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', { className: textPrimary + ' font-medium text-sm' }, getGreeting()),
        React.createElement('p', { className: textSecondary + ' text-xs mt-0.5' },
          '오늘의 건강과 일상을 챙겨드릴게요'
        )
      )
    ),
    
    // 건강 통계
    React.createElement('div', { className: 'flex items-center gap-4 mb-3 text-xs' },
      React.createElement('div', { className: 'flex items-center gap-1 ' + (waterIntake >= waterGoal ? 'text-blue-400' : textSecondary) },
        React.createElement(Droplets, { size: 12 }),
        React.createElement('span', null, waterIntake + '/' + waterGoal + '잔')
      ),
      React.createElement('div', { className: 'flex items-center gap-1 ' + (steps >= 10000 ? 'text-emerald-400' : textSecondary) },
        React.createElement(Footprints, { size: 12 }),
        React.createElement('span', null, steps.toLocaleString() + '걸음')
      ),
      React.createElement('div', { className: 'flex items-center gap-1 ' + (sleepHours >= 7 ? 'text-purple-400' : textSecondary) },
        React.createElement(Moon, { size: 12 }),
        React.createElement('span', null, sleepHours + '시간 수면')
      ),
      completedRoutines > 0 && React.createElement('div', { className: 'flex items-center gap-1 text-amber-400' },
        React.createElement(Check, { size: 12 }),
        React.createElement('span', null, completedRoutines + '/' + totalRoutines + ' 루틴')
      )
    ),
    
    // 알림 메시지
    React.createElement('div', { className: 'flex items-center justify-between text-xs ' + textSecondary },
      needContact.length > 0 && React.createElement('div', { className: 'flex items-center gap-1 text-pink-400' },
        React.createElement(Heart, { size: 12 }),
        React.createElement('span', null, needContact[0].name + '님께 연락할 때가 됐어요')
      ),
      mood && React.createElement('div', { className: 'flex items-center gap-1' },
        mood >= 4 ? React.createElement(Smile, { size: 12, className: 'text-emerald-400' }) :
        mood >= 3 ? React.createElement(Meh, { size: 12, className: 'text-amber-400' }) :
        React.createElement(Frown, { size: 12, className: 'text-red-400' }),
        React.createElement('span', null, '기분 ' + mood + '/5')
      )
    )
  );
};

// 퀵 액션 버튼들 (일상 버전)
var QuickActions = function(props) {
  var darkMode = props.darkMode;
  var onLogWater = props.onLogWater;
  var onLogMood = props.onLogMood;
  var onOpenRoutines = props.onOpenRoutines;
  var onOpenJournal = props.onOpenJournal;
  
  var btnClass = darkMode 
    ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' 
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200';
  
  var actions = [
    { icon: Droplets, label: '물 +1', onClick: onLogWater, color: 'text-blue-500' },
    { icon: Smile, label: '기분 기록', onClick: onLogMood, color: 'text-amber-500' },
    { icon: Activity, label: '루틴', onClick: onOpenRoutines, color: 'text-emerald-500' },
    { icon: BookOpen, label: '일기', onClick: onOpenJournal, color: 'text-purple-500' }
  ];
  
  return React.createElement('div', { className: 'flex gap-2 mb-4 overflow-x-auto pb-2' },
    actions.map(function(action, idx) {
      return React.createElement('button', {
        key: idx,
        onClick: action.onClick,
        className: btnClass + ' flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all'
      },
        React.createElement(action.icon, { size: 16, className: action.color }),
        React.createElement('span', null, action.label)
      );
    })
  );
};

// 건강 트래킹 카드
var HealthCard = function(props) {
  var darkMode = props.darkMode;
  var healthData = props.healthData || {};
  var onUpdate = props.onUpdate;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var items = [
    { 
      icon: Droplets, 
      label: '물', 
      value: (healthData.waterIntake || 0) + '/' + (healthData.waterGoal || 8) + '잔',
      color: 'text-blue-500',
      progress: (healthData.waterIntake || 0) / (healthData.waterGoal || 8)
    },
    { 
      icon: Moon, 
      label: '수면', 
      value: (healthData.sleepHours || 0) + '시간',
      color: 'text-purple-500',
      progress: (healthData.sleepHours || 0) / 8
    },
    { 
      icon: Footprints, 
      label: '걸음', 
      value: (healthData.steps || 0).toLocaleString(),
      color: 'text-emerald-500',
      progress: (healthData.steps || 0) / 10000
    },
    { 
      icon: Pill, 
      label: '약', 
      value: healthData.medication ? '완료' : '미완료',
      color: 'text-amber-500',
      progress: healthData.medication ? 1 : 0
    }
  ];
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement(Heart, { size: 18, className: 'text-red-400' }),
        '오늘의 건강'
      ),
      React.createElement('button', { className: textSecondary + ' text-xs' }, '편집')
    ),
    React.createElement('div', { className: 'grid grid-cols-4 gap-3' },
      items.map(function(item, idx) {
        return React.createElement('button', {
          key: idx,
          onClick: function() { if (onUpdate) onUpdate(item.label); },
          className: 'flex flex-col items-center p-2 rounded-xl ' + (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') + ' transition-all'
        },
          React.createElement('div', { 
            className: 'w-10 h-10 rounded-full flex items-center justify-center mb-1 ' +
              (item.progress >= 1 ? 'bg-emerald-500/20' : (darkMode ? 'bg-gray-700' : 'bg-gray-100'))
          },
            React.createElement(item.icon, { size: 18, className: item.progress >= 1 ? 'text-emerald-500' : item.color })
          ),
          React.createElement('span', { className: textSecondary + ' text-[10px]' }, item.label),
          React.createElement('span', { className: textPrimary + ' text-xs font-medium' }, item.value)
        );
      })
    )
  );
};

// 루틴 카드
var RoutineCard = function(props) {
  var darkMode = props.darkMode;
  var routines = props.routines || mockRoutines || [];
  var onToggle = props.onToggle;
  var onOpenRoutines = props.onOpenRoutines;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 오늘 해당하는 루틴만
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  var today = dayNames[new Date().getDay()];
  var todayRoutines = routines.filter(function(r) {
    if (!r.days) return true;
    return r.days.includes(today);
  }).slice(0, 4);
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement(Activity, { size: 18, className: 'text-emerald-500' }),
        '오늘의 루틴'
      ),
      React.createElement('button', { 
        onClick: onOpenRoutines,
        className: textSecondary + ' text-xs flex items-center gap-1' 
      }, 
        '전체 보기',
        React.createElement(ChevronRight, { size: 14 })
      )
    ),
    todayRoutines.length === 0 
      ? React.createElement('p', { className: textSecondary + ' text-sm text-center py-4' }, '오늘은 예정된 루틴이 없어요')
      : React.createElement('div', { className: 'space-y-2' },
          todayRoutines.map(function(routine, idx) {
            return React.createElement('button', {
              key: idx,
              onClick: function() { if (onToggle) onToggle(routine.id); },
              className: 'w-full flex items-center gap-3 p-2 rounded-xl ' + 
                (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') + ' transition-all'
            },
              React.createElement('div', { 
                className: 'w-8 h-8 rounded-full flex items-center justify-center ' +
                  (routine.completed 
                    ? 'bg-emerald-500 text-white' 
                    : (darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'))
              },
                routine.completed 
                  ? React.createElement(Check, { size: 16 }) 
                  : React.createElement('span', { className: 'text-sm' }, routine.icon || '📌')
              ),
              React.createElement('div', { className: 'flex-1 text-left' },
                React.createElement('p', { 
                  className: textPrimary + ' text-sm ' + (routine.completed ? 'line-through opacity-50' : '')
                }, routine.title || routine.name),
                routine.time && React.createElement('p', { className: textSecondary + ' text-xs' }, routine.time)
              )
            );
          })
        )
  );
};

// 관계 카드
var RelationshipsCard = function(props) {
  var darkMode = props.darkMode;
  var relationships = props.relationships || [];
  var onContact = props.onContact;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  // 연락 필요한 사람들
  var needContact = relationships.filter(function(r) {
    if (!r.lastContact) return true;
    var lastDate = new Date(r.lastContact);
    var daysSince = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    return daysSince > (r.contactFrequency || 30);
  }).slice(0, 3);
  
  if (needContact.length === 0) return null;
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('h3', { className: textPrimary + ' font-bold flex items-center gap-2' },
        React.createElement(Users, { size: 18, className: 'text-pink-500' }),
        '연락할 때가 됐어요'
      )
    ),
    React.createElement('div', { className: 'space-y-2' },
      needContact.map(function(person, idx) {
        var lastDate = person.lastContact ? new Date(person.lastContact) : null;
        var daysSince = lastDate ? Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24)) : '?';
        
        return React.createElement('div', {
          key: idx,
          className: 'flex items-center justify-between p-2 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')
        },
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement('div', { className: 'w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm' },
              (person.name || '?')[0]
            ),
            React.createElement('div', null,
              React.createElement('p', { className: textPrimary + ' text-sm font-medium' }, person.name),
              React.createElement('p', { className: textSecondary + ' text-xs' }, daysSince + '일 전 연락')
            )
          ),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', {
              onClick: function() { if (onContact) onContact(person, 'call'); },
              className: 'w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center'
            }, React.createElement(Phone, { size: 14 })),
            React.createElement('button', {
              onClick: function() { if (onContact) onContact(person, 'message'); },
              className: 'w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center'
            }, React.createElement(MessageCircle, { size: 14 }))
          )
        );
      })
    )
  );
};

var LifePage = function(props) {
  var darkMode = props.darkMode;
  var healthData = props.healthData || {};
  var setHealthData = props.setHealthData;
  var routines = props.routines || mockRoutines || [];
  var setRoutines = props.setRoutines;
  var relationships = props.relationships || [];
  var mood = props.mood;
  var energy = props.energy;
  var setMood = props.setMood;
  var setEnergy = props.setEnergy;
  var onOpenRoutines = props.onOpenRoutines;
  var onOpenJournal = props.onOpenJournal;
  var onOpenMoodLog = props.onOpenMoodLog;
  var weather = props.weather || mockWeather;
  var userName = props.userName;

  var handleLogWater = function() {
    if (setHealthData) {
      var current = healthData.waterIntake || 0;
      setHealthData(Object.assign({}, healthData, { waterIntake: current + 1 }));
    }
  };

  var handleToggleRoutine = function(routineId) {
    if (setRoutines) {
      setRoutines(routines.map(function(r) {
        if (r.id === routineId) {
          return Object.assign({}, r, { completed: !r.completed });
        }
        return r;
      }));
    }
  };

  var handleUpdateHealth = function(type) {
    // 건강 데이터 업데이트 모달 열기
    console.log('Update health:', type);
  };

  var handleContact = function(person, method) {
    console.log('Contact', person.name, 'via', method);
  };

  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';

  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    React.createElement('div', { className: 'px-4 pt-4' },
      // 헤더
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '일상'),
        React.createElement('button', {
          onClick: onOpenRoutines,
          className: 'w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center text-white shadow-lg'
        },
          React.createElement(Plus, { size: 20 })
        )
      ),
      
      // 알프레도 브리핑
      React.createElement(AlfredoBriefing, {
        darkMode: darkMode,
        healthData: healthData,
        relationships: relationships,
        routines: routines,
        mood: mood,
        energy: energy,
        weather: weather,
        userName: userName
      }),
      
      // 퀵 액션 버튼
      React.createElement(QuickActions, {
        darkMode: darkMode,
        onLogWater: handleLogWater,
        onLogMood: onOpenMoodLog,
        onOpenRoutines: onOpenRoutines,
        onOpenJournal: onOpenJournal
      }),
      
      // 건강 트래킹
      React.createElement(HealthCard, {
        darkMode: darkMode,
        healthData: healthData,
        onUpdate: handleUpdateHealth
      }),
      
      // 오늘의 루틴
      React.createElement(RoutineCard, {
        darkMode: darkMode,
        routines: routines,
        onToggle: handleToggleRoutine,
        onOpenRoutines: onOpenRoutines
      }),
      
      // 연락할 사람들
      React.createElement(RelationshipsCard, {
        darkMode: darkMode,
        relationships: relationships,
        onContact: handleContact
      })
    )
  );
};

export default LifePage;
