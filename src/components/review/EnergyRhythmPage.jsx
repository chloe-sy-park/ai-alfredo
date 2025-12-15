import React, { useState } from 'react';
import { ArrowLeft, Battery, Zap, Moon, Sun, TrendingUp, TrendingDown, Clock, Cloud, Sparkles, Lightbulb } from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

const EnergyRhythmPage = ({ onBack, gameState, userData, darkMode }) => {
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  const [energyLog, setEnergyLog] = useState(() => {
    const logs = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      
      const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
      logs.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        morning: d === 0 ? (userData?.energy || 3) : Math.floor((Math.sin(seed * 1.1) + 1) * 2),
        afternoon: d === 0 ? Math.max(0, (userData?.energy || 3) - 1) : Math.floor((Math.sin(seed * 1.3) + 1) * 2),
        evening: d === 0 ? Math.max(0, (userData?.energy || 3) - 2) : Math.floor((Math.sin(seed * 1.5) + 1) * 2),
        mood: d === 0 ? (userData?.mood || 'good') : ['great', 'good', 'okay', 'tired'][Math.floor((Math.sin(seed * 2) + 1) * 2)],
      });
    }
    return logs;
  });
  
  const currentEnergy = userData?.energy || 3;
  const currentMood = userData?.mood || 'good';
  
  const getEnergyColor = (level) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    return colors[Math.min(level, 4)];
  };
  
  const getMoodIcon = (mood) => {
    const icons = { great: '😄', good: '🙂', okay: '😐', tired: '😔', stressed: '😰' };
    return icons[mood] || '🙂';
  };
  
  const getMoodLabel = (mood) => {
    const labels = { great: '아주 좋음', good: '좋음', okay: '보통', tired: '피곤', stressed: '스트레스' };
    return labels[mood] || '보통';
  };
  
  const avgMorning = Math.round(energyLog.reduce((sum, d) => sum + d.morning, 0) / energyLog.length * 10) / 10;
  const avgAfternoon = Math.round(energyLog.reduce((sum, d) => sum + d.afternoon, 0) / energyLog.length * 10) / 10;
  const avgEvening = Math.round(energyLog.reduce((sum, d) => sum + d.evening, 0) / energyLog.length * 10) / 10;
  
  const bestTime = avgMorning >= avgAfternoon && avgMorning >= avgEvening ? 'morning' :
                   avgAfternoon >= avgEvening ? 'afternoon' : 'evening';
  const bestTimeLabel = { morning: '오전', afternoon: '오후', evening: '저녁' }[bestTime];
  
  const getPatternInsight = () => {
    if (avgMorning > avgAfternoon && avgAfternoon > avgEvening) {
      return '아침형 인간이에요! 중요한 일은 오전에 처리하는 게 좋아요.';
    } else if (avgEvening > avgAfternoon && avgAfternoon > avgMorning) {
      return '저녁형 인간이에요! 오후~저녁에 집중력이 높아져요.';
    } else if (avgAfternoon > avgMorning && avgAfternoon > avgEvening) {
      return '오후에 에너지가 가장 높아요! 점심 후가 골든타임이에요.';
    } else {
      return '에너지가 하루 종일 꾸준해요! 언제든 집중할 수 있어요.';
    }
  };
  
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">에너지 리듬</h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-white/80 text-sm">나의 하루 에너지 패턴 분석</p>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 현재 상태 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4`}>지금 내 상태</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={textSecondary}>에너지</span>
                <span className="font-bold" style={{ color: getEnergyColor(currentEnergy) }}>
                  {['매우 낮음', '낮음', '보통', '높음', '매우 높음'][currentEnergy]}
                </span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`flex-1 h-3 rounded-full transition-all ${
                      level <= currentEnergy ? '' : 'opacity-20'
                    }`}
                    style={{ backgroundColor: getEnergyColor(level) }}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-center px-4 border-l border-gray-200">
              <div className="text-3xl mb-1">{getMoodIcon(currentMood)}</div>
              <span className={`text-sm ${textSecondary}`}>{getMoodLabel(currentMood)}</span>
            </div>
          </div>
        </div>
        
        {/* 오늘의 에너지 곡선 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Zap size={18} className="text-amber-500" /> 오늘의 에너지 곡선
          </h3>
          
          <div className="relative h-40">
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-400">
              <span>높음</span>
              <span>보통</span>
              <span>낮음</span>
            </div>
            
            <div className="ml-10 h-full relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2].map(i => (
                  <div key={i} className="border-b border-gray-100 border-dashed" />
                ))}
              </div>
              
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                <path
                  d={`M 0 ${100 - (energyLog[6]?.morning || 2) * 20} 
                      Q 75 ${100 - (energyLog[6]?.morning || 2) * 22} 100 ${100 - ((energyLog[6]?.morning + energyLog[6]?.afternoon) / 2 || 2) * 20}
                      Q 125 ${100 - (energyLog[6]?.afternoon || 2) * 18} 150 ${100 - (energyLog[6]?.afternoon || 2) * 20}
                      Q 200 ${100 - (energyLog[6]?.afternoon || 2) * 22} 225 ${100 - ((energyLog[6]?.afternoon + energyLog[6]?.evening) / 2 || 2) * 20}
                      Q 275 ${100 - (energyLog[6]?.evening || 2) * 18} 300 ${100 - (energyLog[6]?.evening || 2) * 20}
                      L 300 100 L 0 100 Z`}
                  fill="url(#energyGradient)"
                />
                
                <path
                  d={`M 0 ${100 - (energyLog[6]?.morning || 2) * 20} 
                      Q 75 ${100 - (energyLog[6]?.morning || 2) * 22} 100 ${100 - ((energyLog[6]?.morning + energyLog[6]?.afternoon) / 2 || 2) * 20}
                      Q 125 ${100 - (energyLog[6]?.afternoon || 2) * 18} 150 ${100 - (energyLog[6]?.afternoon || 2) * 20}
                      Q 200 ${100 - (energyLog[6]?.afternoon || 2) * 22} 225 ${100 - ((energyLog[6]?.afternoon + energyLog[6]?.evening) / 2 || 2) * 20}
                      Q 275 ${100 - (energyLog[6]?.evening || 2) * 18} 300 ${100 - (energyLog[6]?.evening || 2) * 20}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                <circle cx="50" cy={100 - (energyLog[6]?.morning || 2) * 20} r="6" fill="#f59e0b" />
                <circle cx="150" cy={100 - (energyLog[6]?.afternoon || 2) * 20} r="6" fill="#f59e0b" />
                <circle cx="250" cy={100 - (energyLog[6]?.evening || 2) * 20} r="6" fill="#f59e0b" />
              </svg>
              
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>오전</span>
                <span>오후</span>
                <span>저녁</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 시간대별 평균 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Clock size={18} className="text-gray-600" /> 시간대별 평균 (7일)
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-amber-500" />
                  <span className={textPrimary}>오전</span>
                  {bestTime === 'morning' && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-0.5 rounded-full">🏆 베스트</span>}
                </div>
                <span className="font-bold" style={{ color: getEnergyColor(Math.round(avgMorning)) }}>{avgMorning.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(avgMorning / 4) * 100}%`, backgroundColor: getEnergyColor(Math.round(avgMorning)) }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-gray-500" />
                  <span className={textPrimary}>오후</span>
                  {bestTime === 'afternoon' && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-0.5 rounded-full">🏆 베스트</span>}
                </div>
                <span className="font-bold" style={{ color: getEnergyColor(Math.round(avgAfternoon)) }}>{avgAfternoon.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(avgAfternoon / 4) * 100}%`, backgroundColor: getEnergyColor(Math.round(avgAfternoon)) }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Moon size={16} className="text-indigo-500" />
                  <span className={textPrimary}>저녁</span>
                  {bestTime === 'evening' && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-0.5 rounded-full">🏆 베스트</span>}
                </div>
                <span className="font-bold" style={{ color: getEnergyColor(Math.round(avgEvening)) }}>{avgEvening.toFixed(1)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(avgEvening / 4) * 100}%`, backgroundColor: getEnergyColor(Math.round(avgEvening)) }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 7일 에너지 트렌드 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={18} className="text-emerald-500" /> 7일 에너지 트렌드
          </h3>
          
          <div className="flex items-end justify-between h-32 gap-2">
            {energyLog.map((day, i) => {
              const avgEnergy = (day.morning + day.afternoon + day.evening) / 3;
              const isToday = i === energyLog.length - 1;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <span className={`text-lg mb-1`}>{getMoodIcon(day.mood)}</span>
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      isToday 
                        ? 'bg-gradient-to-t from-amber-400 to-amber-300' 
                        : 'bg-gradient-to-t from-gray-300 to-gray-200'
                    }`}
                    style={{ height: `${(avgEnergy / 4) * 80 + 20}%` }}
                  />
                  <span className={`text-xs mt-2 ${isToday ? 'font-bold text-amber-500' : textSecondary}`}>
                    {dayNames[day.dayOfWeek]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 무드 분포 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Sparkles size={18} className="text-[#A996FF]" /> 이번 주 무드 분포
          </h3>
          
          <div className="flex justify-around">
            {['great', 'good', 'okay', 'tired'].map(mood => {
              const count = energyLog.filter(d => d.mood === mood).length;
              const percentage = Math.round((count / 7) * 100);
              
              return (
                <div key={mood} className="text-center">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1 ${
                      count > 0 ? 'bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE]' : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    {getMoodIcon(mood)}
                  </div>
                  <p className={`text-sm font-bold ${textPrimary}`}>{count}일</p>
                  <p className={`text-xs ${textSecondary}`}>{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 인사이트 */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-5 text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Lightbulb size={18} /> 에너지 인사이트
          </h3>
          
          <div className="space-y-3">
            <div className="bg-white/20 rounded-xl p-3">
              <p className="font-medium">🏆 골든타임: {bestTimeLabel}</p>
              <p className="text-sm text-white/80 mt-1">{getPatternInsight()}</p>
            </div>
            
            <div className="bg-white/20 rounded-xl p-3">
              <p className="font-medium">💡 추천</p>
              <p className="text-sm text-white/80 mt-1">
                {bestTime === 'morning' 
                  ? 'Big3 태스크를 오전에 배치해보세요. 집중력이 가장 높을 때 중요한 일을 끝낼 수 있어요!'
                  : bestTime === 'afternoon'
                    ? '점심 후 1-2시간이 골든타임이에요. 이 시간에 깊은 집중이 필요한 작업을 해보세요!'
                    : '저녁 시간을 활용해보세요. 방해받지 않는 조용한 시간에 집중하기 좋아요!'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 알프레도 응원 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-xl shrink-0">
              🐧
            </div>
            <div>
              <p className={`font-bold ${textPrimary} mb-1`}>알프레도의 한마디</p>
              <p className={textSecondary}>
                {currentEnergy >= 3 
                  ? '오늘 에너지가 좋네요! 이 기운으로 Big3 하나 끝내볼까요? 🚀' 
                  : currentEnergy >= 2 
                    ? '괜찮아요, 무리하지 말고 작은 것부터 시작해봐요. 💪'
                    : '오늘은 쉬어가는 날로 해요. 충분한 휴식도 생산성의 일부예요. 🌙'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyRhythmPage;
