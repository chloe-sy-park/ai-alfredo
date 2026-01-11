import React from 'react';

// 🐧 알프레도 저녁 브리핑 시스템 V2
// Day One 스타일의 하루 마무리 + 회고 시스템

// ============================================================
// 1. 저녁 인사 패턴 (하루 마무리용)
// ============================================================

var EVENING_GREETINGS = {
  // 완료율 높음 (70%+)
  highCompletion: {
    high: [
      '오늘 정말 많이 하셨네요! 대단해요 ✨',
      'Boss, 오늘 완전 생산적인 날이었어요! 👏',
      '와, 오늘 진짜 열심히 하셨다! 자랑스러워요 💜'
    ],
    medium: [
      '오늘 많이 해냈어요! 수고했어요.',
      '하루 잘 보내셨네요. 대단해요 👏',
      '오늘 목표 달성! 축하해요 🎉'
    ],
    low: [
      '컨디션 안 좋은데 이만큼 하다니... 진짜 대단해요 💜',
      '힘든 와중에도 해냈어요. 정말 수고했어요.',
      '오늘 무리했죠? 내일은 좀 쉬어가도 돼요.'
    ]
  },
  // 완료율 보통 (30-70%)
  mediumCompletion: {
    high: [
      '오늘 괜찮게 보냈어요! 못한 건 내일 해도 돼요.',
      '하루 수고했어요. 남은 건 내일의 Boss에게 넘겨요!',
      '적당히 했어요! 완벽하지 않아도 괜찮아요 💜'
    ],
    medium: [
      '오늘도 수고했어요. 하루가 끝났네요.',
      '이만하면 됐어요. 이제 쉬어요.',
      '오늘 하루 잘 버텼어요 👏'
    ],
    low: [
      '힘든 하루였죠? 그래도 조금은 했어요.',
      '오늘은 쉬어가는 날이에요. 괜찮아요 💜',
      '컨디션 안 좋은 날은 이 정도면 충분해요.'
    ]
  },
  // 완료율 낮음 (30% 미만)
  lowCompletion: {
    high: [
      '오늘은 좀 어려웠죠? 내일 다시 해봐요!',
      '괜찮아요, 그런 날도 있어요. 내일이 있잖아요 ✨',
      '오늘은 쉬어가는 날이었네요. 그것도 필요해요!'
    ],
    medium: [
      '오늘은 잘 안 됐죠? 다 그런 날 있어요 💜',
      '괜찮아요. 못한 건 내일 해도 돼요.',
      '하루가 끝났어요. 내일 다시 시작하면 돼요!'
    ],
    low: [
      '오늘은 쉬는 날이에요. 아무것도 안 해도 괜찮아요 💜',
      '힘든 날엔 그냥 쉬는 게 답이에요.',
      '내일은 더 나을 거예요. 오늘은 푹 쉬세요.'
    ]
  },
  // 태스크 없는 날
  noTasks: [
    '오늘은 태스크 없이 자유롭게 보냈네요! 🎉',
    '할 일 없는 날도 필요해요. 잘 쉬었어요?',
    '여유로운 하루였네요. 이런 날도 소중해요 💜'
  ]
};

// ============================================================
// 2. 하루 요약 생성
// ============================================================

var generateDaySummary = function(tasks, events, condition) {
  var completed = tasks.filter(function(t) { return t.completed; });
  var remaining = tasks.filter(function(t) { return !t.completed; });
  var total = tasks.length;
  var completionRate = total > 0 ? (completed.length / total) * 100 : 100;
  
  // 오늘 있었던 일정
  var now = new Date();
  var todayEvents = events.filter(function(e) {
    var eventDate = new Date(e.start || e.startTime);
    return eventDate.toDateString() === now.toDateString();
  });
  
  var summary = {
    taskCompleted: completed.length,
    taskRemaining: remaining.length,
    taskTotal: total,
    completionRate: Math.round(completionRate),
    eventCount: todayEvents.length,
    completedTaskNames: completed.slice(0, 3).map(function(t) { return t.title; }),
    remainingTaskNames: remaining.slice(0, 3).map(function(t) { return t.title; })
  };
  
  return summary;
};

// ============================================================
// 3. 성취 메시지 생성
// ============================================================

var getAchievementMessage = function(summary, condition) {
  var rate = summary.completionRate;
  var completed = summary.taskCompleted;
  
  // 태스크 없는 날
  if (summary.taskTotal === 0) {
    return {
      emoji: '🌙',
      message: '오늘은 태스크 없이 보냈어요!',
      detail: '가끔은 이런 날도 필요해요.'
    };
  }
  
  // 모두 완료
  if (summary.taskRemaining === 0 && completed > 0) {
    return {
      emoji: '🎉',
      message: completed + '개 전부 완료!',
      detail: '완벽한 하루였어요! 정말 대단해요, Boss.'
    };
  }
  
  // 완료율 높음
  if (rate >= 70) {
    return {
      emoji: '✨',
      message: completed + '개 완료 (' + rate + '%)',
      detail: '오늘 정말 많이 했어요!'
    };
  }
  
  // 완료율 보통
  if (rate >= 30) {
    return {
      emoji: '👏',
      message: completed + '개 완료',
      detail: '충분히 잘했어요. 나머지는 내일!'
    };
  }
  
  // 완료율 낮지만 컨디션도 낮았음
  if (condition <= 2) {
    return {
      emoji: '💜',
      message: completed > 0 ? completed + '개라도 완료!' : '오늘은 쉬는 날',
      detail: '컨디션 안 좋은 날은 이 정도면 충분해요.'
    };
  }
  
  // 완료율 낮음
  return {
    emoji: '🌱',
    message: completed > 0 ? completed + '개 완료' : '아직 시작 전',
    detail: '괜찮아요! 내일 다시 시작하면 돼요.'
  };
};

// ============================================================
// 4. 내일 미리보기
// ============================================================

var getTomorrowPreview = function(events, tasks) {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // 내일 일정
  var tomorrowEvents = events.filter(function(e) {
    var eventDate = new Date(e.start || e.startTime);
    return eventDate.toDateString() === tomorrow.toDateString();
  });
  
  // 롤오버될 태스크 (오늘 못한 것)
  var rolloverTasks = tasks.filter(function(t) { return !t.completed; });
  
  var preview = {
    eventCount: tomorrowEvents.length,
    rolloverCount: rolloverTasks.length,
    firstEvent: tomorrowEvents.length > 0 ? tomorrowEvents[0] : null,
    hasBusyDay: tomorrowEvents.length >= 5
  };
  
  // 메시지 생성
  if (tomorrowEvents.length === 0 && rolloverTasks.length === 0) {
    preview.message = '내일은 여유로운 날이에요! 🎉';
  } else if (preview.hasBusyDay) {
    preview.message = '내일 일정이 ' + tomorrowEvents.length + '개예요. 푹 쉬어두세요!';
  } else if (tomorrowEvents.length > 0) {
    var firstTitle = preview.firstEvent.title || preview.firstEvent.summary || '일정';
    var eventTime = new Date(preview.firstEvent.start || preview.firstEvent.startTime);
    var hour = eventTime.getHours();
    var minute = eventTime.getMinutes();
    var timeStr = hour + ':' + (minute < 10 ? '0' : '') + minute;
    preview.message = '내일 ' + timeStr + '에 \"' + firstTitle.slice(0, 12) + '\"부터 시작!';
  } else if (rolloverTasks.length > 0) {
    preview.message = '오늘 못한 ' + rolloverTasks.length + '개, 내일 다시 도전!';
  }
  
  return preview;
};

// ============================================================
// 5. 회고 프롬프트 (Day One 스타일)
// ============================================================

var REFLECTION_PROMPTS = {
  // 좋은 날
  good: [
    '오늘 가장 뿌듯했던 순간은 뭐예요?',
    '오늘 뭐가 가장 즐거웠어요?',
    '오늘 감사한 일이 있었어요?',
    '오늘의 나에게 한마디 해준다면?'
  ],
  // 보통 날
  neutral: [
    '오늘 하루 어땠어요?',
    '내일은 뭐 하고 싶어요?',
    '오늘 배운 게 있어요?',
    '오늘 기억에 남는 순간이 있어요?'
  ],
  // 힘든 날
  tough: [
    '오늘 힘들었죠? 어떤 게 가장 힘들었어요?',
    '내일 자신에게 해주고 싶은 말이 있어요?',
    '오늘 그래도 괜찮았던 순간이 있어요?',
    '지금 필요한 게 뭐예요?'
  ]
};

var getReflectionPrompt = function(completionRate, condition) {
  var category = 'neutral';
  
  if (completionRate >= 70 && condition >= 3) {
    category = 'good';
  } else if (completionRate < 30 || condition <= 2) {
    category = 'tough';
  }
  
  var prompts = REFLECTION_PROMPTS[category];
  return {
    prompt: prompts[Math.floor(Math.random() * prompts.length)],
    category: category
  };
};

// ============================================================
// 6. 마무리 인사
// ============================================================

var getClosingMessage = function(condition, hour) {
  // 늦은 밤 (22시 이후)
  if (hour >= 22) {
    var lateNight = [
      '이제 정말 쉬세요. 내일 또 봐요! 🌙',
      '늦었어요! 푹 주무세요. 좋은 꿈 꿔요 💜',
      '오늘 수고했어요. 잘 자요 ⭐'
    ];
    return lateNight[Math.floor(Math.random() * lateNight.length)];
  }
  
  // 저녁 (18-22시)
  if (condition <= 2) {
    var lowEnergy = [
      '푹 쉬세요. 내일은 더 나을 거예요 💜',
      '오늘은 충분히 했어요. 이제 쉬어요.',
      '내일의 Boss를 위해 충전하세요!'
    ];
    return lowEnergy[Math.floor(Math.random() * lowEnergy.length)];
  }
  
  var normal = [
    '남은 저녁 편하게 보내세요! 🌙',
    '좋은 저녁 되세요. 내일 또 봐요!',
    '수고했어요! 맛있는 저녁 드세요 🍽️'
  ];
  return normal[Math.floor(Math.random() * normal.length)];
};

// ============================================================
// 7. 통합 저녁 브리핑 생성 함수
// ============================================================

export var generateEveningBriefingV2 = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 3;
  var userName = props.userName || 'Boss';
  
  var now = new Date();
  var hour = now.getHours();
  
  // 하루 요약
  var summary = generateDaySummary(tasks, events, condition);
  
  // 컨디션 레벨
  var conditionLevel = condition <= 2 ? 'low' : (condition >= 4 ? 'high' : 'medium');
  
  // 완료율 레벨
  var completionLevel = 'low';
  if (summary.taskTotal === 0) {
    completionLevel = 'noTasks';
  } else if (summary.completionRate >= 70) {
    completionLevel = 'highCompletion';
  } else if (summary.completionRate >= 30) {
    completionLevel = 'mediumCompletion';
  } else {
    completionLevel = 'lowCompletion';
  }
  
  // 인사말 선택
  var greetingOptions;
  if (completionLevel === 'noTasks') {
    greetingOptions = EVENING_GREETINGS.noTasks;
  } else {
    greetingOptions = EVENING_GREETINGS[completionLevel][conditionLevel];
  }
  var greeting = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];
  
  // 성취 메시지
  var achievement = getAchievementMessage(summary, condition);
  
  // 내일 미리보기
  var tomorrow = getTomorrowPreview(events, tasks);
  
  // 회고 프롬프트
  var reflection = getReflectionPrompt(summary.completionRate, condition);
  
  // 마무리 인사
  var closing = getClosingMessage(condition, hour);
  
  return {
    greeting: greeting,
    summary: summary,
    achievement: achievement,
    tomorrow: tomorrow,
    reflection: reflection,
    closing: closing,
    conditionLevel: conditionLevel,
    completionLevel: completionLevel,
    hour: hour
  };
};

// ============================================================
// 8. 간단한 저녁 메시지 (아일랜드용)
// ============================================================

export var getSimpleEveningMessage = function(props) {
  var tasks = props.tasks || [];
  var condition = props.condition || 3;
  var userName = props.userName || 'Boss';
  
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var remaining = tasks.filter(function(t) { return !t.completed; }).length;
  var total = tasks.length;
  var rate = total > 0 ? Math.round((completed / total) * 100) : 100;
  
  // 태스크 없는 날
  if (total === 0) {
    return {
      line1: '오늘 하루 수고했어요 💜',
      line2: '푹 쉬세요!',
      type: 'noTasks'
    };
  }
  
  // 모두 완료
  if (remaining === 0) {
    return {
      line1: '🎉 오늘 ' + total + '개 전부 완료!',
      line2: '완벽한 하루! 정말 대단해요',
      type: 'allDone'
    };
  }
  
  // 높은 완료율
  if (rate >= 70) {
    return {
      line1: '✨ ' + completed + '개 완료! (' + rate + '%)',
      line2: '오늘 정말 잘했어요!',
      type: 'highCompletion'
    };
  }
  
  // 컨디션 낮고 완료율 낮음
  if (condition <= 2 && rate < 50) {
    return {
      line1: '힘든 하루였죠? 💜',
      line2: '오늘은 쉬어가는 날이에요',
      type: 'lowEnergy'
    };
  }
  
  // 보통 완료율
  if (rate >= 30) {
    return {
      line1: completed + '개 완료! 수고했어요 👏',
      line2: '나머지는 내일 해도 돼요',
      type: 'mediumCompletion'
    };
  }
  
  // 낮은 완료율
  return {
    line1: '오늘은 좀 어려웠죠?',
    line2: '괜찮아요, 내일 다시 해봐요! 💜',
    type: 'lowCompletion'
  };
};

// ============================================================
// 9. 저녁 브리핑 카드 컴포넌트
// ============================================================

export var EveningBriefingCardV2 = function(props) {
  var darkMode = props.darkMode;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 3;
  var userName = props.userName || 'Boss';
  var onReflect = props.onReflect;
  var onDismiss = props.onDismiss;
  var showReflection = props.showReflection !== false;
  
  var briefing = generateEveningBriefingV2({
    tasks: tasks,
    events: events,
    condition: condition,
    userName: userName
  });
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var subtleBg = darkMode ? 'bg-gray-700/50' : 'bg-purple-50';
  
  return React.createElement('div', {
    className: cardBg + ' rounded-2xl p-5 border ' + (darkMode ? 'border-gray-700' : 'border-gray-200')
  },
    // 인사말 + 이모지
    React.createElement('div', { className: 'mb-4' },
      React.createElement('span', { className: 'text-3xl mr-2' }, '🐧'),
      React.createElement('p', { className: textPrimary + ' text-lg leading-relaxed' }, briefing.greeting)
    ),
    
    // 성취 요약 박스
    React.createElement('div', {
      className: subtleBg + ' rounded-xl p-4 mb-4'
    },
      React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
        React.createElement('span', { className: 'text-2xl' }, briefing.achievement.emoji),
        React.createElement('span', { className: textPrimary + ' font-semibold text-lg' }, 
          briefing.achievement.message
        )
      ),
      React.createElement('p', { className: textSecondary + ' text-sm' }, 
        briefing.achievement.detail
      ),
      
      // 완료한 태스크 목록 (있으면)
      briefing.summary.completedTaskNames.length > 0 && React.createElement('div', {
        className: 'mt-3 pt-3 border-t ' + (darkMode ? 'border-gray-600' : 'border-purple-200')
      },
        React.createElement('p', { className: textSecondary + ' text-xs mb-1' }, '✓ 완료한 일'),
        briefing.summary.completedTaskNames.map(function(name, i) {
          return React.createElement('span', {
            key: i,
            className: 'inline-block text-xs px-2 py-1 rounded-full mr-1 mb-1 ' + 
              (darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
          }, name.slice(0, 12));
        })
      )
    ),
    
    // 내일 미리보기
    briefing.tomorrow.message && React.createElement('div', {
      className: 'flex items-center gap-2 mb-4 text-sm'
    },
      React.createElement('span', null, '📅'),
      React.createElement('span', { className: textSecondary }, briefing.tomorrow.message)
    ),
    
    // 회고 프롬프트 (옵션)
    showReflection && React.createElement('div', {
      className: 'mb-4 p-3 rounded-xl border-2 border-dashed ' + 
        (darkMode ? 'border-purple-700 bg-purple-900/20' : 'border-purple-300 bg-purple-50')
    },
      React.createElement('p', { className: 'text-sm mb-2 ' + (darkMode ? 'text-purple-300' : 'text-purple-600') },
        '💭 ' + briefing.reflection.prompt
      ),
      onReflect && React.createElement('button', {
        onClick: function() { onReflect(briefing.reflection.prompt); },
        className: 'text-xs text-purple-500 hover:text-purple-400 underline'
      }, '답변하기')
    ),
    
    // 마무리 인사
    React.createElement('p', {
      className: textSecondary + ' text-sm mb-4 italic'
    }, briefing.closing),
    
    // 닫기 버튼
    onDismiss && React.createElement('button', {
      onClick: onDismiss,
      className: 'w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity'
    }, '하루 마무리 🌙')
  );
};

// ============================================================
// 10. Export
// ============================================================

export default {
  generateEveningBriefingV2: generateEveningBriefingV2,
  getSimpleEveningMessage: getSimpleEveningMessage,
  EveningBriefingCardV2: EveningBriefingCardV2,
  EVENING_GREETINGS: EVENING_GREETINGS,
  REFLECTION_PROMPTS: REFLECTION_PROMPTS
};
