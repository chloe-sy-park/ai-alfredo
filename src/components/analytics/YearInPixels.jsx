import React, { useState, useMemo } from 'react';
import { useYearInPixels, useDailyConditions } from '../../hooks/useDailyConditions';

// 🎨 Year in Pixels - Daylio 스타일 시각화
// ADHD 친화적 디자인: 낮은 인지 부하, 직관적인 색상 코딩

var MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
var DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

var YearInPixels = function(props) {
  var onDaySelect = props.onDaySelect;
  var showFullYear = props.showFullYear;
  var initialYear = props.year;
  
  var currentDate = new Date();
  var yearState = useState(initialYear || currentDate.getFullYear());
  var year = yearState[0];
  var setYear = yearState[1];
  
  var viewState = useState(showFullYear ? 'year' : 'month');
  var viewMode = viewState[0];
  var setViewMode = viewState[1];
  
  var monthState = useState(currentDate.getMonth());
  var selectedMonth = monthState[0];
  var setSelectedMonth = monthState[1];
  
  var dayDetailState = useState(null);
  var selectedDay = dayDetailState[0];
  var setSelectedDay = dayDetailState[1];
  
  var yearData = useYearInPixels(year);
  var dailyConditions = useDailyConditions();
  var CONDITION_LEVELS = dailyConditions.CONDITION_LEVELS;
  
  // 오늘 날짜 키
  var todayKey = useMemo(function() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }, []);
  
  // 날짜 클릭 핸들러
  var handleDayClick = function(dayData) {
    setSelectedDay(dayData);
    if (onDaySelect) {
      onDaySelect(dayData);
    }
  };
  
  // 월 뷰 렌더링
  var renderMonthView = function(monthData, isCompact) {
    var daysGrid = [];
    var firstDayOfWeek = monthData.firstDayOfWeek;
    
    // 빈 셀 추가 (월 시작 요일 맞추기)
    for (var i = 0; i < firstDayOfWeek; i++) {
      daysGrid.push(
        React.createElement('div', {
          key: 'empty-' + monthData.month + '-' + i,
          className: isCompact ? 'w-3 h-3' : 'w-8 h-8'
        })
      );
    }
    
    // 날짜 셀 추가
    monthData.days.forEach(function(day) {
      var isToday = day.date === todayKey;
      var hasRecord = day.level !== null;
      
      var cellStyle = {
        backgroundColor: day.color,
        transition: 'all 0.2s ease'
      };
      
      var cellClass = isCompact 
        ? 'w-3 h-3 rounded-sm cursor-pointer hover:scale-125 hover:z-10'
        : 'w-8 h-8 rounded-lg cursor-pointer hover:scale-110 flex items-center justify-center text-xs font-medium';
      
      if (isToday) {
        cellClass += ' ring-2 ring-blue-500 ring-offset-1';
      }
      
      if (!hasRecord) {
        cellStyle.backgroundColor = '#f3f4f6';
      }
      
      daysGrid.push(
        React.createElement('div', {
          key: day.date,
          className: cellClass,
          style: cellStyle,
          onClick: function() { handleDayClick(day); },
          title: day.date + (hasRecord ? ' - ' + CONDITION_LEVELS[day.level].label : ' - 기록 없음')
        }, isCompact ? null : day.day)
      );
    });
    
    return daysGrid;
  };
  
  // 전체 연도 뷰
  var renderYearView = function() {
    return React.createElement('div', { className: 'space-y-4' },
      yearData.months.map(function(monthData, idx) {
        return React.createElement('div', { 
          key: idx,
          className: 'bg-white rounded-xl p-4 shadow-sm'
        },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('h4', { className: 'text-sm font-medium text-gray-700' }, MONTH_NAMES[idx]),
            React.createElement('span', { className: 'text-xs text-gray-400' },
              monthData.days.filter(function(d) { return d.level !== null; }).length + '일 기록'
            )
          ),
          React.createElement('div', { 
            className: 'grid gap-1',
            style: { gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }
          },
            // 요일 헤더
            DAY_NAMES.map(function(name, i) {
              return React.createElement('div', {
                key: 'header-' + i,
                className: 'w-3 h-3 text-[8px] text-gray-400 text-center'
              }, name);
            }),
            // 날짜 그리드
            renderMonthView(monthData, true)
          )
        );
      })
    );
  };
  
  // 현재 월 상세 뷰
  var renderCurrentMonthView = function() {
    var monthData = yearData.months[selectedMonth];
    
    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-sm' },
      // 월 네비게이션
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('button', {
          className: 'p-2 rounded-full hover:bg-gray-100 transition-colors',
          onClick: function() {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setYear(year - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }
        },
          React.createElement('svg', { className: 'w-5 h-5 text-gray-600', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 19l-7-7 7-7' })
          )
        ),
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' },
          year + '년 ' + MONTH_NAMES[selectedMonth]
        ),
        React.createElement('button', {
          className: 'p-2 rounded-full hover:bg-gray-100 transition-colors',
          onClick: function() {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setYear(year + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }
        },
          React.createElement('svg', { className: 'w-5 h-5 text-gray-600', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 5l7 7-7 7' })
          )
        )
      ),
      
      // 요일 헤더
      React.createElement('div', { 
        className: 'grid gap-2 mb-2',
        style: { gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }
      },
        DAY_NAMES.map(function(name, i) {
          return React.createElement('div', {
            key: 'header-' + i,
            className: 'text-center text-xs font-medium text-gray-500'
          }, name);
        })
      ),
      
      // 날짜 그리드
      React.createElement('div', { 
        className: 'grid gap-2',
        style: { gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }
      },
        renderMonthView(monthData, false)
      )
    );
  };
  
  // 선택된 날짜 상세
  var renderDayDetail = function() {
    if (!selectedDay) return null;
    
    var hasRecord = selectedDay.level !== null;
    var levelInfo = hasRecord ? CONDITION_LEVELS[selectedDay.level] : null;
    
    return React.createElement('div', { 
      className: 'mt-4 bg-gray-50 rounded-xl p-4 animate-in fade-in duration-200'
    },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          hasRecord 
            ? React.createElement('span', { className: 'text-3xl' }, levelInfo.emoji)
            : React.createElement('div', { className: 'w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400' }, '?'),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium text-gray-900' }, selectedDay.date),
            React.createElement('p', { 
              className: 'text-sm',
              style: { color: hasRecord ? levelInfo.color : '#9ca3af' }
            }, hasRecord ? levelInfo.label : '기록 없음')
          )
        ),
        React.createElement('button', {
          className: 'p-2 rounded-full hover:bg-gray-200 transition-colors',
          onClick: function() { setSelectedDay(null); }
        },
          React.createElement('svg', { className: 'w-5 h-5 text-gray-500', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
          )
        )
      )
    );
  };
  
  // 통계 요약
  var renderStats = function() {
    var stats = yearData.stats;
    
    return React.createElement('div', { className: 'grid grid-cols-2 gap-3 mt-4' },
      // 총 기록 일수
      React.createElement('div', { className: 'bg-purple-50 rounded-xl p-4' },
        React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, stats.totalDays),
        React.createElement('p', { className: 'text-xs text-purple-500' }, '총 기록 일수')
      ),
      // 평균 컨디션
      React.createElement('div', { className: 'bg-green-50 rounded-xl p-4' },
        React.createElement('p', { className: 'text-2xl font-bold text-green-600' }, 
          stats.averageLevel ? stats.averageLevel.toFixed(1) : '-'
        ),
        React.createElement('p', { className: 'text-xs text-green-500' }, '평균 컨디션')
      ),
      // 현재 스트릭
      React.createElement('div', { className: 'bg-orange-50 rounded-xl p-4' },
        React.createElement('p', { className: 'text-2xl font-bold text-orange-600' }, stats.currentStreak),
        React.createElement('p', { className: 'text-xs text-orange-500' }, '연속 기록 🔥')
      ),
      // 최장 스트릭
      React.createElement('div', { className: 'bg-blue-50 rounded-xl p-4' },
        React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, stats.maxStreak),
        React.createElement('p', { className: 'text-xs text-blue-500' }, '최장 스트릭')
      )
    );
  };
  
  // 범례
  var renderLegend = function() {
    return React.createElement('div', { className: 'flex items-center justify-center gap-2 mt-4 flex-wrap' },
      React.createElement('span', { className: 'text-xs text-gray-500 mr-2' }, '컨디션:'),
      Object.keys(CONDITION_LEVELS).map(function(level) {
        var info = CONDITION_LEVELS[level];
        return React.createElement('div', {
          key: level,
          className: 'flex items-center gap-1'
        },
          React.createElement('div', {
            className: 'w-4 h-4 rounded-sm',
            style: { backgroundColor: info.color }
          }),
          React.createElement('span', { className: 'text-xs text-gray-600' }, info.emoji)
        );
      }),
      React.createElement('div', { className: 'flex items-center gap-1 ml-2' },
        React.createElement('div', { className: 'w-4 h-4 rounded-sm bg-gray-200' }),
        React.createElement('span', { className: 'text-xs text-gray-400' }, '없음')
      )
    );
  };
  
  // 뷰 모드 토글
  var renderViewToggle = function() {
    return React.createElement('div', { className: 'flex bg-gray-100 rounded-xl p-1 mb-4' },
      React.createElement('button', {
        className: 'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ' + 
          (viewMode === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'),
        onClick: function() { setViewMode('month'); }
      }, '이번 달'),
      React.createElement('button', {
        className: 'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ' + 
          (viewMode === 'year' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'),
        onClick: function() { setViewMode('year'); }
      }, '전체 연도')
    );
  };
  
  return React.createElement('div', { className: 'space-y-4' },
    // 헤더
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-xl font-bold text-gray-900 flex items-center gap-2' },
          '🎨 Year in Pixels'
        ),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' },
          '하루하루가 모여 만드는 나의 기록'
        )
      ),
      // 연도 선택
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', {
          className: 'p-1 rounded hover:bg-gray-100',
          onClick: function() { setYear(year - 1); }
        },
          React.createElement('svg', { className: 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 19l-7-7 7-7' })
          )
        ),
        React.createElement('span', { className: 'text-sm font-medium text-gray-700 min-w-[4rem] text-center' }, year + '년'),
        React.createElement('button', {
          className: 'p-1 rounded hover:bg-gray-100',
          onClick: function() { setYear(year + 1); }
        },
          React.createElement('svg', { className: 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 5l7 7-7 7' })
          )
        )
      )
    ),
    
    // 뷰 모드 토글
    renderViewToggle(),
    
    // 메인 뷰
    viewMode === 'month' ? renderCurrentMonthView() : renderYearView(),
    
    // 선택된 날짜 상세
    renderDayDetail(),
    
    // 범례
    renderLegend(),
    
    // 통계 요약
    renderStats()
  );
};

export default YearInPixels;
