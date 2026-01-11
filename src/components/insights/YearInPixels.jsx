import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';

/**
 * 🟦 Year in Pixels - Daylio 스타일
 * 365일을 기분 색상으로 시각화
 * 한 눈에 연간 패턴 파악
 */

const MOOD_COLORS = {
  5: { bg: 'bg-green-400', label: '최고', emoji: '🤩' },
  4: { bg: 'bg-emerald-300', label: '좋음', emoji: '😊' },
  3: { bg: 'bg-yellow-300', label: '보통', emoji: '😐' },
  2: { bg: 'bg-orange-300', label: '저조', emoji: '😔' },
  1: { bg: 'bg-red-300', label: '힘듦', emoji: '😫' },
  0: { bg: 'bg-gray-100', label: '기록없음', emoji: '' },
};

const MONTHS_KR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

const YearInPixels = ({ moodData = {}, year: initialYear }) => {
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('year'); // 'year' | 'month'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // 연간 데이터 생성
  const yearData = useMemo(() => {
    const data = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        day: d.getDate(),
        month: d.getMonth(),
        dayOfWeek: d.getDay(),
        mood: moodData[dateStr] || 0,
      });
    }
    
    return data;
  }, [year, moodData]);

  // 통계 계산
  const stats = useMemo(() => {
    const recorded = yearData.filter(d => d.mood > 0);
    if (recorded.length === 0) return null;
    
    const avgMood = recorded.reduce((sum, d) => sum + d.mood, 0) / recorded.length;
    const moodCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    recorded.forEach(d => { moodCounts[d.mood]++; });
    
    const bestMonth = MONTHS_KR[
      [...Array(12)].map((_, m) => {
        const monthDays = recorded.filter(d => d.month === m);
        return monthDays.length ? monthDays.reduce((s, d) => s + d.mood, 0) / monthDays.length : 0;
      }).reduce((best, val, idx, arr) => val > arr[best] ? idx : best, 0)
    ];
    
    // 연속 좋은 기분 스트릭
    let maxStreak = 0, currentStreak = 0;
    recorded.forEach(d => {
      if (d.mood >= 4) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return {
      recordedDays: recorded.length,
      avgMood: avgMood.toFixed(1),
      moodCounts,
      bestMonth,
      maxStreak,
    };
  }, [yearData]);

  // 월별 데이터
  const monthData = useMemo(() => {
    return yearData.filter(d => d.month === selectedMonth);
  }, [yearData, selectedMonth]);

  // 픽셀 클릭 핸들러
  const handlePixelClick = (day) => {
    setSelectedDay(day);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="font-bold">Year in Pixels</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear(y => y - 1)}
              className="p-1 hover:bg-white/20 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              className="p-1 hover:bg-white/20 rounded"
              disabled={year >= new Date().getFullYear()}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 뷰 모드 토글 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('year')}
            className={`px-3 py-1 rounded-full text-sm ${
              viewMode === 'year' ? 'bg-white text-purple-600' : 'bg-white/20'
            }`}
          >
            연간
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-full text-sm ${
              viewMode === 'month' ? 'bg-white text-purple-600' : 'bg-white/20'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* 연간 뷰 */}
      {viewMode === 'year' && (
        <div className="p-4">
          <div className="grid grid-cols-12 gap-1 mb-4">
            {MONTHS_KR.map((month, i) => (
              <div key={i} className="text-xs text-center text-gray-400">
                {month.slice(0, 1)}
              </div>
            ))}
          </div>
          
          {/* 픽셀 그리드 - 12열 x 31행 */}
          <div className="grid grid-cols-12 gap-[2px]">
            {[...Array(31)].map((_, dayIndex) => (
              <React.Fragment key={dayIndex}>
                {[...Array(12)].map((_, monthIndex) => {
                  const day = yearData.find(
                    d => d.month === monthIndex && d.day === dayIndex + 1
                  );
                  
                  if (!day) {
                    return <div key={monthIndex} className="w-full aspect-square" />;
                  }
                  
                  return (
                    <button
                      key={monthIndex}
                      onClick={() => handlePixelClick(day)}
                      className={`w-full aspect-square rounded-sm ${
                        MOOD_COLORS[day.mood].bg
                      } hover:ring-2 hover:ring-purple-400 transition-all ${
                        selectedDay?.date === day.date ? 'ring-2 ring-purple-500' : ''
                      }`}
                      title={`${day.date}: ${MOOD_COLORS[day.mood].label}`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 월간 뷰 */}
      {viewMode === 'month' && (
        <div className="p-4">
          {/* 월 선택 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setSelectedMonth(m => Math.max(0, m - 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-bold text-lg text-gray-800">
              {year}년 {MONTHS_KR[selectedMonth]}
            </span>
            <button
              onClick={() => setSelectedMonth(m => Math.min(11, m + 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_KR.map(day => (
              <div key={day} className="text-center text-xs text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {/* 첫 주 빈 칸 */}
            {[...Array(monthData[0]?.dayOfWeek || 0)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {monthData.map(day => (
              <button
                key={day.date}
                onClick={() => handlePixelClick(day)}
                className={`aspect-square rounded-lg flex items-center justify-center ${
                  MOOD_COLORS[day.mood].bg
                } hover:ring-2 hover:ring-purple-400 transition-all ${
                  selectedDay?.date === day.date ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <span className={`text-xs ${
                  day.mood > 0 ? 'text-white font-medium' : 'text-gray-400'
                }`}>
                  {day.day}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 날짜 정보 */}
      {selectedDay && (
        <div className="px-4 pb-4">
          <div className={`p-3 rounded-xl ${MOOD_COLORS[selectedDay.mood].bg}/20`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MOOD_COLORS[selectedDay.mood].emoji || '📅'}</span>
              <div>
                <p className="font-medium text-gray-800">{selectedDay.date}</p>
                <p className="text-sm text-gray-600">
                  {MOOD_COLORS[selectedDay.mood].label}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 통계 */}
      {stats && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-700 mb-3">{year}년 통계</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">기록한 날</p>
                <p className="font-bold text-lg text-gray-800">{stats.recordedDays}일</p>
              </div>
              <div>
                <p className="text-gray-500">평균 기분</p>
                <p className="font-bold text-lg text-gray-800">
                  {MOOD_COLORS[Math.round(stats.avgMood)].emoji} {stats.avgMood}
                </p>
              </div>
              <div>
                <p className="text-gray-500">최고의 달</p>
                <p className="font-bold text-lg text-gray-800">{stats.bestMonth}</p>
              </div>
              <div>
                <p className="text-gray-500">최장 좋은 기분</p>
                <p className="font-bold text-lg text-gray-800">{stats.maxStreak}일 연속</p>
              </div>
            </div>

            {/* 기분 분포 */}
            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-2">기분 분포</p>
              <div className="flex gap-1">
                {[5, 4, 3, 2, 1].map(mood => (
                  <div key={mood} className="flex-1">
                    <div className={`h-2 ${MOOD_COLORS[mood].bg} rounded-full`} />
                    <p className="text-xs text-center text-gray-500 mt-1">
                      {stats.moodCounts[mood]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 레전드 */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {[5, 4, 3, 2, 1, 0].map(mood => (
            <div key={mood} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${MOOD_COLORS[mood].bg}`} />
              <span className="text-xs text-gray-500">{MOOD_COLORS[mood].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 공유 버튼 */}
      <div className="px-4 pb-4 flex gap-2">
        <button className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
          <Share2 className="w-4 h-4" />
          공유하기
        </button>
        <button className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
          <Download className="w-4 h-4" />
          이미지 저장
        </button>
      </div>
    </div>
  );
};

export default YearInPixels;
