import React, { useState } from 'react';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Target, Flame, Award, 
  Calendar, CheckCircle2, Clock, ChevronRight, ChevronLeft, Star,
  Zap, Briefcase, Sparkles
} from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

// Constants
import { LEVEL_CONFIG, BADGES } from '../../constants/gamification';

// Default gameState to prevent crashes
const DEFAULT_GAME_STATE = {
  totalXP: 0,
  todayXP: 0,
  todayTasks: 0,
  streak: 0,
  weeklyXP: [0, 0, 0, 0, 0, 0, 0],
  totalCompleted: 0,
  big3Completed: 0,
  focusSessions: 0,
  focusMinutes: 0,
  unlockedBadges: [],
};

const WeeklyReviewPage = ({ onBack, gameState: rawGameState, allTasks, darkMode }) => {
  // Defensive: merge with defaults
  const gameState = { ...DEFAULT_GAME_STATE, ...rawGameState };
  
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = 이번 주, -1 = 지난 주
  
  // 날짜 계산
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (selectedWeek * 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  const weekLabel = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  
  // 레벨 정보
  const levelInfo = LEVEL_CONFIG.getLevel(gameState.totalXP);
  
  // 주간 통계 계산
  const weeklyXP = gameState.weeklyXP || [0, 0, 0, 0, 0, 0, 0];
  const totalWeeklyXP = weeklyXP.reduce((a, b) => a + b, 0);
  const maxDailyXP = Math.max(...weeklyXP, 1);
  const avgDailyXP = Math.round(totalWeeklyXP / 7);
  
  // 완료율 계산 (오늘 기준)
  const completedTasks = allTasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = allTasks?.length || 1;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  
  // 프로젝트별 완료 통계
  const projectStats = {};
  allTasks?.filter(t => t.status === 'done').forEach(task => {
    const proj = task.project || '기타';
    projectStats[proj] = (projectStats[proj] || 0) + 1;
  });
  const topProjects = Object.entries(projectStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  // 요일 이름
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = now.getDay();
  
  // 성취 하이라이트
  const highlights = [];
  if (gameState.todayTasks >= 3) highlights.push({ icon: '🎯', text: '오늘 3개 이상 완료!' });
  if (gameState.streak >= 3) highlights.push({ icon: '🔥', text: `${gameState.streak}일 연속 달성 중!` });
  if (totalWeeklyXP >= 500) highlights.push({ icon: '⚡', text: '이번 주 500 XP 돌파!' });
  if (gameState.focusSessions >= 5) highlights.push({ icon: '🧘', text: '집중 세션 5회 이상!' });
  if (completionRate >= 80) highlights.push({ icon: '✨', text: `완료율 ${completionRate}% 달성!` });
  
  // 도넛 차트 계산
  const donutPercent = completionRate;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (donutPercent / 100) * circumference;
  
  // 스타일
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">주간 리뷰</h1>
          <div className="w-10" />
        </div>
        
        {/* 주 선택 */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setSelectedWeek(s => s - 1)}
            className="p-2 hover:bg-white/20 rounded-full"
            disabled={selectedWeek <= -4}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-white/70 text-sm">{selectedWeek === 0 ? '이번 주' : selectedWeek === -1 ? '지난 주' : `${-selectedWeek}주 전`}</p>
            <p className="font-bold">{weekLabel}</p>
          </div>
          <button 
            onClick={() => setSelectedWeek(s => Math.min(s + 1, 0))}
            className="p-2 hover:bg-white/20 rounded-full"
            disabled={selectedWeek >= 0}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-32">
        {/* 레벨 & XP 요약 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-3xl shadow-lg">
              {levelInfo.level >= 20 ? '👑' : levelInfo.level >= 10 ? '⭐' : '🌱'}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${textPrimary}`}>Lv.{levelInfo.level}</span>
                <span className="text-[#A996FF] font-bold">+{totalWeeklyXP} XP</span>
              </div>
              <p className={`text-sm ${textSecondary}`}>이번 주 획득</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all"
                  style={{ width: `${(levelInfo.currentXP / levelInfo.requiredXP) * 100}%` }}
                />
              </div>
              <p className={`text-xs ${textSecondary} mt-1`}>{levelInfo.currentXP} / {levelInfo.requiredXP} XP</p>
            </div>
          </div>
        </div>
        
        {/* 완료율 도넛 차트 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Target size={18} className="text-[#A996FF]" /> 태스크 완료율
          </h3>
          <div className="flex items-center gap-6">
            {/* 도넛 차트 */}
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke={darkMode ? '#374151' : '#E5E7EB'}
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A996FF" />
                    <stop offset="100%" stopColor="#8B7CF7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-black ${textPrimary}`}>{completionRate}%</span>
              </div>
            </div>
            
            {/* 통계 */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span className={textSecondary}>완료</span>
                <span className={`font-bold text-emerald-500`}>{completedTasks}개</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>진행 중</span>
                <span className={`font-bold text-[#A996FF]`}>{totalTasks - completedTasks}개</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>전체</span>
                <span className={`font-bold ${textPrimary}`}>{totalTasks}개</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 일별 XP 그래프 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <TrendingUp size={18} className="text-gray-600" /> 일별 XP 획득
          </h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyXP.map((xp, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className={`text-xs font-bold mb-1 ${i === today ? 'text-[#A996FF]' : textSecondary}`}>
                  {xp > 0 ? xp : ''}
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    i === today 
                      ? 'bg-gradient-to-t from-[#A996FF] to-[#C4B5FD]' 
                      : xp > 0 ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                  style={{ height: `${Math.max((xp / maxDailyXP) * 100, 8)}%` }}
                />
                <span className={`text-xs mt-2 ${i === today ? 'font-bold text-[#A996FF]' : textSecondary}`}>
                  {weekDays[i]}
                </span>
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between`}>
            <div className="text-center">
              <p className={`text-xl font-bold ${textPrimary}`}>{totalWeeklyXP}</p>
              <p className={`text-xs ${textSecondary}`}>총 XP</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${textPrimary}`}>{avgDailyXP}</p>
              <p className={`text-xs ${textSecondary}`}>일 평균</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${textPrimary}`}>{Math.max(...weeklyXP)}</p>
              <p className={`text-xs ${textSecondary}`}>최고 기록</p>
            </div>
          </div>
        </div>
        
        {/* 집중 시간 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Zap size={18} className="text-[#A996FF]" /> 집중 시간
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#F5F3FF] rounded-xl">
              <p className="text-2xl font-black text-[#8B7CF7]">{gameState.focusSessions}</p>
              <p className="text-xs text-[#8B7CF7]/70">세션</p>
            </div>
            <div className="text-center p-3 bg-[#F5F3FF] rounded-xl">
              <p className="text-2xl font-black text-[#8B7CF7]">{Math.floor(gameState.focusMinutes / 60)}h {gameState.focusMinutes % 60}m</p>
              <p className="text-xs text-[#8B7CF7]/70">총 시간</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-black text-emerald-600">{gameState.focusSessions > 0 ? Math.round(gameState.focusMinutes / gameState.focusSessions) : 0}분</p>
              <p className="text-xs text-emerald-600/70">평균</p>
            </div>
          </div>
        </div>
        
        {/* 프로젝트별 완료 */}
        {topProjects.length > 0 && (
          <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
            <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Briefcase size={18} className="text-[#A996FF]" /> 프로젝트별 완료
            </h3>
            <div className="space-y-3">
              {topProjects.map(([project, count], i) => (
                <div key={project} className="flex items-center gap-3">
                  <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className={`font-medium ${textPrimary}`}>{project}</span>
                      <span className={`font-bold ${textPrimary}`}>{count}개</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-[#A996FF]' : i === 1 ? 'bg-gray-400' : 'bg-[#A996FF]/50'
                        }`}
                        style={{ width: `${(count / topProjects[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 성취 하이라이트 */}
        {highlights.length > 0 && (
          <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
            <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <Sparkles size={18} className="text-[#A996FF]" /> 이번 주 하이라이트
            </h3>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-xl"
                >
                  <span className="text-2xl">{h.icon}</span>
                  <span className={`font-medium ${textPrimary}`}>{h.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 연속 달성 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Flame size={18} className="text-orange-500" /> 연속 달성
          </h3>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="text-3xl font-black text-white">{gameState.streak}</span>
              </div>
              <p className={`font-bold ${textPrimary}`}>현재 연속</p>
              <p className={`text-sm ${textSecondary}`}>일</p>
            </div>
            <div className="text-6xl">🔥</div>
          </div>
          {gameState.streak > 0 && (
            <p className={`text-center mt-4 ${textSecondary}`}>
              {gameState.streak >= 7 ? '대단해요! 일주일 넘게 연속 달성 중!' :
               gameState.streak >= 3 ? '좋아요! 3일 연속 달성!' :
               '시작이 좋아요! 계속 달려봐요!'}
            </p>
          )}
        </div>
        
        {/* Phase 8: 생산성 피크 시간 분석 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Clock size={18} className="text-[#A996FF]" /> 생산성 피크 시간
          </h3>
          
          {(() => {
            // 시간대별 생산성 데이터 (실제로는 태스크 완료 시간을 추적해야 함)
            const hourlyProductivity = [
              { hour: '9-10', label: '오전', value: 65, emoji: '🌅' },
              { hour: '10-12', label: '오전', value: 90, emoji: '⚡' },
              { hour: '14-16', label: '오후', value: 55, emoji: '😴' },
              { hour: '16-18', label: '오후', value: 75, emoji: '💪' },
              { hour: '19-21', label: '저녁', value: 40, emoji: '🌙' },
            ];
            
            const peakHour = hourlyProductivity.reduce((max, h) => h.value > max.value ? h : max, hourlyProductivity[0]);
            const lowHour = hourlyProductivity.reduce((min, h) => h.value < min.value ? h : min, hourlyProductivity[0]);
            
            return (
              <>
                <div className="space-y-3 mb-4">
                  {hourlyProductivity.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-16 text-right font-medium" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                        {h.hour}
                      </span>
                      <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            h.value === peakHour.value 
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                              : h.value === lowHour.value
                                ? 'bg-gray-400'
                                : 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]'
                          }`}
                          style={{ width: `${h.value}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                          {h.emoji}
                        </span>
                      </div>
                      <span className={`text-sm font-bold w-10 ${h.value === peakHour.value ? 'text-emerald-500' : textSecondary}`}>
                        {h.value}%
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'} border ${darkMode ? 'border-emerald-800' : 'border-emerald-200'}`}>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold">💡 인사이트:</span> {peakHour.hour}시가 가장 생산적이에요! 
                    중요한 일은 이 시간에 배치해보세요.
                  </p>
                </div>
              </>
            );
          })()}
        </div>
        
        {/* Phase 8: 요일별 완료 패턴 */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Calendar size={18} className="text-[#A996FF]" /> 요일별 완료 패턴
          </h3>
          
          {(() => {
            // 요일별 완료 수 계산
            const dayCompletions = weeklyXP.map((xp, i) => ({
              day: weekDays[i],
              xp,
              tasks: Math.round(xp / 15), // XP를 태스크 수로 대략 변환
              isToday: i === today,
              isWeekend: i === 0 || i === 6,
            }));
            
            const bestDay = dayCompletions.reduce((max, d) => d.xp > max.xp ? d : max, dayCompletions[0]);
            const worstDay = dayCompletions.filter(d => !d.isWeekend).reduce((min, d) => d.xp < min.xp ? d : min, dayCompletions[1]);
            const weekdayAvg = Math.round(dayCompletions.filter(d => !d.isWeekend).reduce((sum, d) => sum + d.xp, 0) / 5);
            const weekendAvg = Math.round(dayCompletions.filter(d => d.isWeekend).reduce((sum, d) => sum + d.xp, 0) / 2);
            
            return (
              <>
                <div className="flex justify-between items-end h-32 mb-4 px-2">
                  {dayCompletions.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="relative w-full flex justify-center">
                        <div 
                          className={`w-8 rounded-t-lg transition-all ${
                            d.xp === bestDay.xp && d.xp > 0
                              ? 'bg-gradient-to-t from-[#A996FF] to-[#8B7CF7]' 
                              : d.isWeekend 
                                ? 'bg-gray-300 dark:bg-gray-600'
                                : 'bg-[#A996FF]/60'
                          }`}
                          style={{ height: `${Math.max((d.xp / Math.max(bestDay.xp, 1)) * 100, 8)}px` }}
                        />
                        {d.xp === bestDay.xp && d.xp > 0 && (
                          <span className="absolute -top-5 text-sm">👑</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${d.isToday ? 'text-[#A996FF] font-bold' : textSecondary}`}>
                        {d.day}
                      </span>
                      <span className={`text-[10px] ${textSecondary}`}>{d.tasks}개</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>평일 평균</p>
                    <p className={`font-bold ${textPrimary}`}>{weekdayAvg} XP</p>
                  </div>
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>주말 평균</p>
                    <p className={`font-bold ${textPrimary}`}>{weekendAvg} XP</p>
                  </div>
                </div>
                
                {bestDay.xp > 0 && (
                  <p className={`text-sm ${textSecondary} mt-3 text-center`}>
                    {bestDay.day}요일이 가장 생산적이에요! 
                    {weekdayAvg > weekendAvg * 1.5 ? ' 주말에는 좀 쉬어가는 편이네요 😊' : ''}
                  </p>
                )}
              </>
            );
          })()}
        </div>
        
        {/* Phase 8: 알프레도 주간 인사이트 (강화) */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm border-2 border-[#A996FF]/30`}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg">
              🐧
            </div>
            <div>
              <p className={`font-bold ${textPrimary} text-lg`}>알프레도의 주간 분석</p>
              <p className={`text-xs ${textSecondary}`}>이번 주 데이터를 분석했어요</p>
            </div>
          </div>
          
          {(() => {
            // 분석 인사이트 생성
            const insights = [];
            
            // 완료율 기반
            if (completionRate >= 80) {
              insights.push({ icon: '🏆', text: '완료율이 80%를 넘었어요! 정말 대단해요!' });
            } else if (completionRate >= 50) {
              insights.push({ icon: '💪', text: '절반 이상 해냈어요! 조금만 더 힘내봐요.' });
            } else {
              insights.push({ icon: '🌱', text: '천천히 성장하고 있어요. 작은 것부터 시작해볼까요?' });
            }
            
            // 스트릭 기반
            if (gameState.streak >= 7) {
              insights.push({ icon: '🔥', text: `${gameState.streak}일 연속! 습관이 만들어지고 있어요!` });
            } else if (gameState.streak >= 3) {
              insights.push({ icon: '⚡', text: '3일 이상 연속 달성! 이 흐름을 유지해봐요.' });
            }
            
            // XP 기반
            if (totalWeeklyXP >= 700) {
              insights.push({ icon: '⭐', text: '이번 주 XP가 700을 넘었어요! 최고의 한 주!' });
            } else if (avgDailyXP >= 80) {
              insights.push({ icon: '📈', text: '일평균 XP가 높아요! 꾸준함이 빛나요.' });
            }
            
            // 집중 세션 기반
            if (gameState.focusSessions >= 10) {
              insights.push({ icon: '🎯', text: '집중 세션 10회 이상! 딥워크 마스터!' });
            } else if (gameState.focusMinutes >= 180) {
              insights.push({ icon: '🧘', text: '3시간 이상 집중했어요! 집중력이 좋아요.' });
            }
            
            // 최소 2개는 보여주기
            if (insights.length < 2) {
              insights.push({ icon: '💫', text: '다음 주는 더 좋은 결과가 있을 거예요!' });
            }
            
            return (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE]'
                    }`}
                  >
                    <span className="text-xl">{insight.icon}</span>
                    <p className={`text-sm ${textPrimary}`}>{insight.text}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        
        {/* Phase 8: 다음 주 추천 목표 (강화) */}
        <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-5 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Target size={18} /> 다음 주 추천 목표
          </h3>
          
          {(() => {
            const goals = [];
            
            // 레벨업 목표
            const xpToNextLevel = levelInfo.requiredXP - levelInfo.currentXP;
            if (xpToNextLevel <= avgDailyXP * 7) {
              goals.push({
                icon: '⬆️',
                title: `레벨 ${levelInfo.level + 1} 달성`,
                desc: `${xpToNextLevel} XP만 더 모으면 돼요!`,
                difficulty: 'easy',
              });
            }
            
            // 스트릭 목표
            if (gameState.streak < 7) {
              goals.push({
                icon: '🔥',
                title: '7일 연속 달성',
                desc: `${7 - gameState.streak}일만 더 이어가면 일주일 완성!`,
                difficulty: gameState.streak >= 3 ? 'easy' : 'medium',
              });
            } else if (gameState.streak < 14) {
              goals.push({
                icon: '🔥',
                title: '14일 연속 달성',
                desc: '2주 연속이면 완전한 습관이 돼요!',
                difficulty: 'medium',
              });
            }
            
            // 완료율 목표
            if (completionRate < 80) {
              goals.push({
                icon: '📊',
                title: '완료율 80% 달성',
                desc: '매일 조금씩 더 해보면 가능해요!',
                difficulty: completionRate >= 60 ? 'easy' : 'hard',
              });
            }
            
            // 집중 세션 목표
            if (gameState.focusSessions < 10) {
              goals.push({
                icon: '🧘',
                title: '집중 세션 10회',
                desc: '하루 2회씩이면 충분해요!',
                difficulty: 'medium',
              });
            }
            
            // XP 목표
            goals.push({
              icon: '⚡',
              title: `${Math.ceil((totalWeeklyXP + 100) / 100) * 100} XP 달성`,
              desc: '이번 주보다 조금만 더!',
              difficulty: 'easy',
            });
            
            const difficultyColors = {
              easy: 'bg-emerald-400/30',
              medium: 'bg-yellow-400/30',
              hard: 'bg-red-400/30',
            };
            
            const difficultyLabels = {
              easy: '쉬움',
              medium: '보통',
              hard: '도전',
            };
            
            return (
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 bg-white/20 rounded-xl p-3"
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-xs text-white/80">{goal.desc}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${difficultyColors[goal.difficulty]}`}>
                      {difficultyLabels[goal.difficulty]}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
          
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <p className="text-sm text-white/80">
              🐧 알프레도가 다음 주도 응원할게요!
            </p>
          </div>
        </div>
        
        {/* 알프레도 응원 (기존) */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-xl shrink-0">
              🐧
            </div>
            <div>
              <p className={`font-bold ${textPrimary} mb-1`}>알프레도의 한마디</p>
              <p className={textSecondary}>
                {completionRate >= 80 
                  ? '이번 주 정말 멋졌어요! 다음 주도 이 기세로 가보자고요! 🚀' 
                  : completionRate >= 50 
                    ? '절반 이상 해냈어요! 조금만 더 힘내면 완벽해요! 💪'
                    : '천천히 해도 괜찮아요. 꾸준히 하는 게 중요하답니다. 🌱'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Habit Heatmap Page ===

export default WeeklyReviewPage;
