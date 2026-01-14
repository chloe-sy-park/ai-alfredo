import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { WellbeingStatus, StatusCards, GentleNudge, LifeTrends } from '../components/life';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Heart, Plus, CheckCircle2, Circle } from 'lucide-react';
import { getHabits, getTodayLogs, toggleHabitComplete, Habit, HabitLog } from '../services/habits';

export default function Life() {
  var [condition, setCondition] = useState<ConditionLevel | null>(null);
  var [habits, setHabits] = useState<Habit[]>([]);
  var [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  var [showAllHabits, setShowAllHabits] = useState(false);

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
        
        {/* 간단한 습관 체크리스트 */}
        {habits.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A1A1A]">오늘의 습관</h3>
              <button className="text-sm text-[#A996FF] hover:text-[#8B7BE8]">
                관리
              </button>
            </div>
            
            <div className="space-y-2">
              {displayHabits.map(function(habit) {
                var completed = isHabitCompleted(habit.id);
                return (
                  <button
                    key={habit.id}
                    onClick={function() { handleToggleHabit(habit.id); }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-[#FAFAFA] rounded-lg transition-colors"
                  >
                    {completed ? (
                      <CheckCircle2 size={20} className="text-[#A996FF]" />
                    ) : (
                      <Circle size={20} className="text-[#E5E5E5]" />
                    )}
                    <span className="text-base">{habit.icon}</span>
                    <span className={`flex-1 text-left ${
                      completed ? 'text-[#999999] line-through' : 'text-[#1A1A1A]'
                    }`}>
                      {habit.title}
                    </span>
                  </button>
                );
              })}
              
              {habits.length > 3 && !showAllHabits && (
                <button
                  onClick={function() { setShowAllHabits(true); }}
                  className="w-full py-2 text-sm text-[#999999] hover:text-[#666666]"
                >
                  {habits.length - 3}개 더보기
                </button>
              )}
              
              {habits.length > 3 && showAllHabits && (
                <button
                  onClick={function() { setShowAllHabits(false); }}
                  className="w-full py-2 text-sm text-[#999999] hover:text-[#666666]"
                >
                  접기
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* 부드러운 넛지 - 이제 스마트하게 작동 */}
        <GentleNudge />
        
        {/* 라이프 트렌드 */}
        <LifeTrends />
        
        {/* 빠른 액션 */}
        <div className="grid grid-cols-2 gap-2">
          <button className="py-3 bg-white rounded-xl text-[#666666] hover:bg-[#F5F5F5] transition-colors">
            <Plus size={16} className="inline mr-1" />
            습관 추가
          </button>
          <button className="py-3 bg-white rounded-xl text-[#666666] hover:bg-[#F5F5F5] transition-colors">
            연락처 관리
          </button>
        </div>
      </div>
    </div>
  );
}
