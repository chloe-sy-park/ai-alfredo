import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { WellbeingStatus, StatusCards, GentleNudge, LifeTrends } from '../components/life';
import { HabitManager, HabitStats, WeeklyHabitView } from '../components/habits';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Heart, Plus, CheckCircle2, Circle, Flame, Settings } from 'lucide-react';
import { getHabits, getTodayLogs, getRecentLogs, toggleHabitComplete, getStreak, Habit, HabitLog } from '../services/habits';

export default function Life() {
  var [condition, setCondition] = useState<ConditionLevel | null>(null);
  var [habits, setHabits] = useState<Habit[]>([]);
  var [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  var [recentLogs, setRecentLogs] = useState<HabitLog[]>([]);
  var [showAllHabits, setShowAllHabits] = useState(false);
  var [showHabitManager, setShowHabitManager] = useState(false);
  var [showWeeklyView, setShowWeeklyView] = useState(false);

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    // 오늘 컨디션 로드
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCondition(todayCondition.level);
    }

    // 습관 데이터 로드
    setHabits(getHabits());
    setTodayLogs(getTodayLogs());
    setRecentLogs(getRecentLogs(7));
  }

  function handleToggleHabit(habitId: string) {
    toggleHabitComplete(habitId);
    loadData();
  }

  function isHabitCompleted(habitId: string): boolean {
    var log = todayLogs.find(function(l) { return l.habitId === habitId; });
    return log ? log.completed : false;
  }

  // 표시할 습관 수 제한 (3개)
  var displayHabits = showAllHabits ? habits : habits.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader />
      
      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-pink-500" />
          <h1 className="text-lg font-bold text-[#1A1A1A]">라이프</h1>
        </div>
        
        {/* 웰빙 상태 */}
        <WellbeingStatus condition={condition} />
        
        {/* 상태 카드 - 이제 습관 완료율 포함 */}
        <StatusCards />
        
        {/* 습관 통계 */}
        {habits.length > 0 && <HabitStats habits={habits} logs={recentLogs} />}

        {/* 간단한 습관 체크리스트 */}
        {habits.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A1A1A] dark:text-white">오늘의 습관</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={function() { setShowWeeklyView(!showWeeklyView); }}
                  className="text-sm text-[#A996FF] hover:text-[#8B7BE8]"
                >
                  {showWeeklyView ? '간단히' : '주간 현황'}
                </button>
                <button
                  onClick={function() { setShowHabitManager(true); }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {showWeeklyView ? (
              <div className="space-y-3">
                {habits.map(function(habit) {
                  return (
                    <WeeklyHabitView key={habit.id} habit={habit} logs={recentLogs} />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {displayHabits.map(function(habit) {
                  var completed = isHabitCompleted(habit.id);
                  var streak = getStreak(habit.id);
                  return (
                    <button
                      key={habit.id}
                      onClick={function() { handleToggleHabit(habit.id); }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-[#FAFAFA] dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {completed ? (
                        <CheckCircle2 size={20} className="text-[#A996FF]" />
                      ) : (
                        <Circle size={20} className="text-[#E5E5E5] dark:text-gray-600" />
                      )}
                      <span className="text-base">{habit.icon}</span>
                      <span className={`flex-1 text-left ${
                        completed ? 'text-[#999999] dark:text-gray-500 line-through' : 'text-[#1A1A1A] dark:text-white'
                      }`}>
                        {habit.title}
                      </span>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame size={14} />
                          <span className="text-xs font-bold">{streak}</span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {habits.length > 3 && !showAllHabits && (
                  <button
                    onClick={function() { setShowAllHabits(true); }}
                    className="w-full py-2 text-sm text-[#999999] dark:text-gray-500 hover:text-[#666666] dark:hover:text-gray-400"
                  >
                    {habits.length - 3}개 더보기
                  </button>
                )}

                {habits.length > 3 && showAllHabits && (
                  <button
                    onClick={function() { setShowAllHabits(false); }}
                    className="w-full py-2 text-sm text-[#999999] dark:text-gray-500 hover:text-[#666666] dark:hover:text-gray-400"
                  >
                    접기
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* 부드러운 넛지 - 이제 스마트하게 작동 */}
        <GentleNudge />
        
        {/* 라이프 트렌드 */}
        <LifeTrends />
        
        {/* 빠른 액션 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={function() { setShowHabitManager(true); }}
            className="py-3 bg-white dark:bg-gray-800 rounded-xl text-[#666666] dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} className="inline mr-1" />
            습관 추가
          </button>
          <button className="py-3 bg-white dark:bg-gray-800 rounded-xl text-[#666666] dark:text-gray-400 hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors">
            연락처 관리
          </button>
        </div>
      </div>

      {/* 습관 관리 모달 */}
      <HabitManager
        isOpen={showHabitManager}
        onClose={function() { setShowHabitManager(false); }}
        habits={habits}
        onUpdate={loadData}
      />
    </div>
  );
}
