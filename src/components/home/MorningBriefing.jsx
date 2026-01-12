import React, { useMemo } from 'react';
import { Sun, Cloud, CloudRain, Calendar, Clock, Zap, Coffee, Moon, Star, ChevronRight } from 'lucide-react';

// ☀️ 아침 브리핑 컴포넌트 (theSkimm + Morning Brew 스타일)
// - 친근한 어조로 하루 시작
// - 핵심 정보만 카드 형태로
// - DNA 인사이트 연동
// - 컨디션 기반 메시지 분기

// 요일 이름
var DAYS = ['일', '월', '화', '수', '목', '금', '토'];
var DAY_VIBES = {
  0: { emoji: '🌴', vibe: '일요일', tip: '내일 월요일이에요. 미리 마음 준비해두면 좋아요.' },
  1: { emoji: '💪', vibe: '월요일', tip: '한 주의 시작! 가볍게 시작해요.' },
  2: { emoji: '🚀', vibe: '화요일', tip: '이제 엔진 좀 달궈졌죠?' },
  3: { emoji: '🏔️', vibe: '수요일', tip: '주중 정상! 고지가 보여요.' },
  4: { emoji: '🎯', vibe: '목요일', tip: '거의 다 왔어요. 스퍼트!' },
  5: { emoji: '🎉', vibe: '금요일', tip: '불금이에요! 오늘만 버텨요.' },
  6: { emoji: '☕', vibe: '토요일', tip: '주말이에요. 충전하세요!' }
};

// 시간대별 인사
var getGreeting = function(hour, condition, userName) {
  var name = userName || 'Boss';
  
  // 컨디션이 낮을 때 (1-2)
  if (condition && condition <= 2) {
    if (hour < 9) return name + ', 천천히 시작해도 괜찮아요 ☕';
    if (hour < 11) return '오늘 좀 힘드시죠? 무리하지 마세요 💜';
    return name + ', 오늘은 쉬엄쉬엄 가요';
  }
  
  // 일반 인사
  if (hour < 6) return name + ', 일찍 일어나셨네요! 🌅';
  if (hour < 9) return '좋은 아침이에요, ' + name + ' ☀️';
  if (hour < 11) return name + ', 오늘도 화이팅! 💪';
  return name + ', 점심 전에 한 스퍼트! 🚀';
};

// 날씨 아이콘
var WeatherIcon = function(props) {
  var condition = props.condition || '';
  var size = props.size || 20;
  
  var lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('rain') || lowerCondition.includes('비')) {
    return React.createElement(CloudRain, { size: size, className: 'text-blue-400' });
  }
  if (lowerCondition.includes('cloud') || lowerCondition.includes('구름')) {
    return React.createElement(Cloud, { size: size, className: 'text-gray-400' });
  }
  return React.createElement(Sun, { size: size, className: 'text-yellow-500' });
};

// 📰 헤드라인 카드 (theSkimm 스타일)
var HeadlineCard = function(props) {
  var greeting = props.greeting;
  var subText = props.subText;
  var weather = props.weather;
  var dayInfo = props.dayInfo;
  var onTapAlfredo = props.onTapAlfredo;
  
  return React.createElement('div', {
    className: 'bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform',
    onClick: onTapAlfredo
  },
    // 배경 장식
    React.createElement('div', {
      className: 'absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2'
    }),
    React.createElement('div', {
      className: 'absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2'
    }),
    
    // 콘텐츠
    React.createElement('div', { className: 'relative z-10' },
      // 알프레도 + 날씨
      React.createElement('div', { className: 'flex items-start justify-between mb-3' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-3xl' }, '🐧'),
          React.createElement('span', { 
            className: 'text-xs bg-white/20 px-2 py-0.5 rounded-full' 
          }, dayInfo.emoji + ' ' + dayInfo.vibe)
        ),
        weather && React.createElement('div', { 
          className: 'flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg'
        },
          React.createElement(WeatherIcon, { condition: weather.condition, size: 16 }),
          React.createElement('span', { className: 'text-sm' }, weather.temp + '°')
        )
      ),
      
      // 인사말
      React.createElement('h2', {
        className: 'text-xl font-bold mb-1 leading-tight'
      }, greeting),
      
      // 서브텍스트
      React.createElement('p', {
        className: 'text-white/80 text-sm'
      }, subText),
      
      // 탭 힌트
      React.createElement('div', {
        className: 'flex items-center gap-1 mt-3 text-white/60 text-xs'
      },
        React.createElement('span', null, '탭하면 알프레도와 대화해요'),
        React.createElement(ChevronRight, { size: 12 })
      )
    )
  );
};

// 📊 오늘의 숫자 카드
var TodayNumbersCard = function(props) {
  var events = props.events || [];
  var tasks = props.tasks || [];
  var focusTime = props.focusTime;
  
  var meetingCount = events.length;
  var pendingCount = tasks.filter(function(t) { return !t.completed; }).length;
  var completedCount = tasks.filter(function(t) { return t.completed; }).length;
  
  // 첫 일정 시간
  var firstEvent = events[0];
  var firstEventTime = firstEvent 
    ? new Date(firstEvent.start || firstEvent.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null;
  
  return React.createElement('div', {
    className: 'bg-white rounded-2xl p-4 shadow-sm'
  },
    React.createElement('h3', {
      className: 'text-sm font-medium text-gray-500 mb-3 flex items-center gap-2'
    },
      React.createElement(Zap, { size: 14, className: 'text-yellow-500' }),
      '오늘 한눈에'
    ),
    
    React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
      // 미팅
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { 
          className: 'text-2xl font-bold text-purple-600' 
        }, meetingCount),
        React.createElement('div', { 
          className: 'text-xs text-gray-500' 
        }, '미팅')
      ),
      
      // 할 일
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { 
          className: 'text-2xl font-bold text-blue-600' 
        }, pendingCount),
        React.createElement('div', { 
          className: 'text-xs text-gray-500' 
        }, '할 일')
      ),
      
      // 완료
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { 
          className: 'text-2xl font-bold text-green-600' 
        }, completedCount),
        React.createElement('div', { 
          className: 'text-xs text-gray-500' 
        }, '완료')
      )
    ),
    
    // 첫 일정 표시
    firstEventTime && React.createElement('div', {
      className: 'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600'
    },
      React.createElement(Clock, { size: 14 }),
      React.createElement('span', null, '첫 일정 '),
      React.createElement('span', { className: 'font-medium text-purple-600' }, firstEventTime),
      React.createElement('span', { className: 'text-gray-400 truncate flex-1' }, 
        ' · ' + (firstEvent.title || firstEvent.summary || '').slice(0, 15)
      )
    )
  );
};

// 🧬 DNA 인사이트 카드
var DNAInsightMini = function(props) {
  var chronotype = props.chronotype;
  var peakHours = props.peakHours;
  var stressLevel = props.stressLevel;
  var suggestion = props.suggestion;
  
  if (!chronotype && !suggestion) return null;
  
  return React.createElement('div', {
    className: 'bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4'
  },
    React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
      React.createElement('span', { className: 'text-lg' }, '🧬'),
      React.createElement('span', { 
        className: 'text-sm font-medium text-indigo-700' 
      }, '알프레도가 알아낸 것')
    ),
    
    suggestion 
      ? React.createElement('p', {
          className: 'text-sm text-gray-700'
        }, suggestion)
      : React.createElement('div', { className: 'space-y-1' },
          chronotype && React.createElement('p', {
            className: 'text-sm text-gray-600'
          }, '• ' + (chronotype === 'morning' ? '아침형' : '저녁형') + '이시네요'),
          peakHours && React.createElement('p', {
            className: 'text-sm text-gray-600'
          }, '• ' + peakHours + '에 집중이 잘 되시는 편'),
          stressLevel === 'high' && React.createElement('p', {
            className: 'text-sm text-orange-600'
          }, '• 요즘 좀 바쁘신 것 같아요')
        )
  );
};

// ☕ 오늘의 팁 카드
var DailyTipCard = function(props) {
  var tip = props.tip;
  var condition = props.condition;
  
  // 컨디션별 팁
  var getTip = function() {
    if (condition && condition <= 2) {
      return '오늘은 가장 중요한 것 하나만 해도 충분해요. 나머지는 내일로 미뤄도 괜찮아요. 💜';
    }
    if (condition && condition >= 4) {
      return '컨디션 좋을 때 어려운 일 먼저! 에너지 있을 때 밀어붙여요. 🔥';
    }
    return tip || '작은 것부터 시작하면 큰 것도 할 수 있어요. 일단 시작해봐요! ✨';
  };
  
  return React.createElement('div', {
    className: 'bg-amber-50 rounded-2xl p-4 flex items-start gap-3'
  },
    React.createElement(Coffee, { 
      size: 20, 
      className: 'text-amber-600 mt-0.5 flex-shrink-0' 
    }),
    React.createElement('div', null,
      React.createElement('h4', {
        className: 'text-sm font-medium text-amber-800 mb-1'
      }, '오늘의 한마디'),
      React.createElement('p', {
        className: 'text-sm text-amber-700'
      }, getTip())
    )
  );
};

// 🚨 긴급 알림 배너
var UrgentBanner = function(props) {
  var event = props.event;
  var minutesUntil = props.minutesUntil;
  
  if (!event || minutesUntil > 30) return null;
  
  var title = event.title || event.summary || '일정';
  var isVeryUrgent = minutesUntil <= 10;
  
  return React.createElement('div', {
    className: 'rounded-xl p-3 flex items-center gap-3 ' +
      (isVeryUrgent ? 'bg-red-500 animate-pulse' : 'bg-orange-500')
  },
    React.createElement('span', { className: 'text-xl' }, '⚡'),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('p', {
        className: 'text-white font-medium text-sm'
      }, minutesUntil + '분 뒤: ' + title.slice(0, 20) + (title.length > 20 ? '...' : ''))
    )
  );
};

// 🌅 메인 아침 브리핑 컴포넌트
export var MorningBriefing = function(props) {
  var darkMode = props.darkMode;
  var condition = props.condition || 3;
  var tasks = props.tasks || [];
  var events = props.events || [];
  var weather = props.weather;
  var userName = props.userName || 'Boss';
  var onTapAlfredo = props.onTapAlfredo;
  
  // DNA 관련 props
  var dnaProfile = props.dnaProfile;
  var dnaSuggestions = props.dnaSuggestions;
  var getChronotype = props.getChronotype;
  var getPeakHours = props.getPeakHours;
  var getStressLevel = props.getStressLevel;
  
  // 현재 시간
  var now = new Date();
  var hour = now.getHours();
  var dayOfWeek = now.getDay();
  var dayInfo = DAY_VIBES[dayOfWeek];
  
  // 오늘 일정 필터
  var todayEvents = useMemo(function() {
    var todayStr = now.toDateString();
    return events.filter(function(e) {
      var eventDate = new Date(e.start || e.startTime);
      return eventDate.toDateString() === todayStr;
    }).sort(function(a, b) {
      return new Date(a.start || a.startTime) - new Date(b.start || b.startTime);
    });
  }, [events, now]);
  
  // 긴급 일정 체크 (30분 이내)
  var urgentEvent = useMemo(function() {
    var found = null;
    var minDiff = 31;
    
    todayEvents.forEach(function(e) {
      var start = new Date(e.start || e.startTime);
      var diffMin = Math.round((start - now) / 1000 / 60);
      if (diffMin > 0 && diffMin <= 30 && diffMin < minDiff) {
        found = { event: e, minutesUntil: diffMin };
        minDiff = diffMin;
      }
    });
    
    return found;
  }, [todayEvents, now]);
  
  // 인사말 생성
  var greeting = getGreeting(hour, condition, userName);
  
  // 서브텍스트 생성
  var getSubText = function() {
    var pendingCount = tasks.filter(function(t) { return !t.completed; }).length;
    var meetingCount = todayEvents.length;
    
    if (pendingCount === 0 && meetingCount === 0) {
      return '오늘은 여유로운 하루네요! 🌿';
    }
    
    var parts = [];
    if (meetingCount > 0) parts.push('미팅 ' + meetingCount + '개');
    if (pendingCount > 0) parts.push('할 일 ' + pendingCount + '개');
    
    return parts.join(', ') + ' 있어요. ' + dayInfo.tip;
  };
  
  // DNA 인사이트
  var chronotype = getChronotype ? getChronotype() : null;
  var peakHours = getPeakHours ? getPeakHours() : null;
  var stressLevel = getStressLevel ? getStressLevel() : null;
  var suggestion = dnaSuggestions && dnaSuggestions[0] ? dnaSuggestions[0].text : null;
  
  return React.createElement('div', {
    className: 'space-y-3 px-4 pt-2'
  },
    // 긴급 배너
    urgentEvent && React.createElement(UrgentBanner, {
      event: urgentEvent.event,
      minutesUntil: urgentEvent.minutesUntil
    }),
    
    // 헤드라인 카드
    React.createElement(HeadlineCard, {
      greeting: greeting,
      subText: getSubText(),
      weather: weather,
      dayInfo: dayInfo,
      onTapAlfredo: onTapAlfredo
    }),
    
    // 오늘의 숫자
    React.createElement(TodayNumbersCard, {
      events: todayEvents,
      tasks: tasks
    }),
    
    // DNA 인사이트 (있을 때만)
    (chronotype || suggestion) && React.createElement(DNAInsightMini, {
      chronotype: chronotype,
      peakHours: peakHours,
      stressLevel: stressLevel,
      suggestion: suggestion
    }),
    
    // 오늘의 팁
    React.createElement(DailyTipCard, {
      tip: dayInfo.tip,
      condition: condition
    })
  );
};

export default MorningBriefing;
