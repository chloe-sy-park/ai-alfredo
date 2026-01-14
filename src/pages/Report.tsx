import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Target,
  Zap,
  Heart,
  Award,
  ChevronRight
} from 'lucide-react';
import { getTasks, Task } from '../services/tasks';
import { getHabits, getTodayCompletionRate } from '../services/habits';
import { getConditionHistory, ConditionRecord, conditionConfig } from '../services/condition';

interface WeekStats {
  totalTasks: number;
  completedTasks: number;
  avgCondition: number;
  habitCompletionRate: number;
  mostProductiveDay: string;
  streakDays: number;
}

export default function Report() {
  var navigate = useNavigate();
  var [stats, setStats] = useState<WeekStats | null>(null);
  var [conditionHistory, setConditionHistory] = useState<ConditionRecord[]>([]);

  useEffect(function() {
    loadWeeklyData();
  }, []);

  function loadWeeklyData() {
    // 이번 주 데이터 계산
    var tasks = getTasks();
    var habits = getHabits();
    var history = getConditionHistory(7);
    setConditionHistory(history);

    // 이번 주 시작일
    var now = new Date();
    var weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // 이번 주 태스크
    var weekTasks = tasks.filter(function(t) {
      var created = new Date(t.createdAt);
      return created >= weekStart;
    });

    var completed = weekTasks.filter(function(t) { return t.status === 'done'; });

    // 평균 컨디션
    var avgCondition = 0;
    if (history.length > 0) {
      var conditionValues: Record<string, number> = {
        great: 4,
        good: 3,
        normal: 2,
        bad: 1
      };
      var sum = history.reduce(function(acc, h) {
        return acc + (conditionValues[h.level] || 2);
      }, 0);
      avgCondition = sum / history.length;
    }

    // 가장 생산적인 요일
    var dayCompletions: Record<string, number> = {};
    var days = ['일', '월', '화', '수', '목', '금', '토'];
    completed.forEach(function(t) {
      if (t.completedAt) {
        var day = days[new Date(t.completedAt).getDay()];
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      }
    });
    var mostProductiveDay = '월';
    var maxCompletions = 0;
    Object.keys(dayCompletions).forEach(function(day) {
      if (dayCompletions[day] > maxCompletions) {
        maxCompletions = dayCompletions[day];
        mostProductiveDay = day;
      }
    });

    setStats({
      totalTasks: weekTasks.length,
      completedTasks: completed.length,
      avgCondition: Math.round(avgCondition * 10) / 10,
      habitCompletionRate: getTodayCompletionRate(),
      mostProductiveDay: mostProductiveDay + '요일',
      streakDays: calculateStreak(history)
    });
  }

  function calculateStreak(history: ConditionRecord[]): number {
    // 연속 기록 일수
    var streak = 0;
    var today = new Date();
    
    for (var i = 0; i < 30; i++) {
      var checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      var dateStr = checkDate.toISOString().split('T')[0];
      
      var found = history.find(function(h) { return h.date === dateStr; });
      if (found) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }

  function getConditionEmoji(value: number): string {
    if (value >= 3.5) return '😄';
    if (value >= 2.5) return '🙂';
    if (value >= 1.5) return '😐';
    return '😔';
  }

  function getInsightMessage(): string {
    if (!stats) return '';
    
    var messages = [];
    
    if (stats.completedTasks >= stats.totalTasks * 0.8) {
      messages.push('이번 주 목표 달성률이 훌륭해요! 🎉');
    } else if (stats.completedTasks >= stats.totalTasks * 0.5) {
      messages.push('절반 이상 완료했어요. 잘하고 있어요! 👍');
    } else {
      messages.push('다음 주엔 조금 더 작은 목표로 시작해볼까요? 💪');
    }

    if (stats.avgCondition >= 3) {
      messages.push('컨디션 관리가 잘 되고 있어요.');
    } else {
      messages.push('충분한 휴식도 생산성의 일부예요.');
    }

    return messages.join(' ');
  }

  var completionRate = stats ? Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto">
        
        {/* 헤더 */}
        <div className="sticky top-0 bg-background z-10 px-4 py-3 flex items-center gap-3">
          <button onClick={function() { navigate(-1); }} className="p-2 rounded-full hover:bg-white">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold">주간 리포트</h1>
          <span className="ml-auto text-sm text-gray-400">이번 주</span>
        </div>

        <div className="p-4 space-y-4">
          
          {/* 알프레도 인사이트 */}
          <div className="bg-gradient-to-r from-lavender-100 to-purple-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🐧</span>
              <div>
                <p className="font-semibold text-gray-800">알프레도의 한마디</p>
                <p className="text-sm text-gray-600 mt-1">{getInsightMessage()}</p>
              </div>
            </div>
          </div>

          {/* 주요 지표 */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              
              {/* 완료율 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-green-500" />
                  <span className="text-sm text-gray-500">완료율</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-green-500">{completionRate}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.completedTasks}/{stats.totalTasks} 완료
                </p>
              </div>

              {/* 평균 컨디션 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={16} className="text-pink-500" />
                  <span className="text-sm text-gray-500">평균 컨디션</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl">{getConditionEmoji(stats.avgCondition)}</span>
                  <span className="text-lg font-bold text-gray-700">{stats.avgCondition}/4</span>
                </div>
              </div>

              {/* 최고 생산성 요일 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-500">최고 생산성</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.mostProductiveDay}</span>
              </div>

              {/* 연속 기록 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-orange-500" />
                  <span className="text-sm text-gray-500">연속 기록</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-orange-500">{stats.streakDays}</span>
                  <span className="text-sm text-gray-400 mb-1">일</span>
                </div>
              </div>
            </div>
          )}

          {/* 컨디션 그래프 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-lavender-400" />
              이번 주 컨디션
            </h3>
            
            <div className="flex justify-between items-end h-24">
              {Array.from({ length: 7 }).map(function(_, idx) {
                var date = new Date();
                date.setDate(date.getDate() - (6 - idx));
                var dateStr = date.toISOString().split('T')[0];
                var record = conditionHistory.find(function(h) { return h.date === dateStr; });
                
                var conditionValues: Record<string, number> = {
                  great: 100,
                  good: 75,
                  normal: 50,
                  bad: 25
                };
                var height = record ? conditionValues[record.level] : 0;
                var days = ['일', '월', '화', '수', '목', '금', '토'];
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div 
                      className="w-8 bg-lavender-200 rounded-t transition-all"
                      style={{ height: height + '%', minHeight: height > 0 ? 8 : 0 }}
                    >
                      {record && (
                        <div className="w-full h-full bg-lavender-400 rounded-t flex items-start justify-center pt-1">
                          <span className="text-xs">{conditionConfig[record.level].emoji}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{days[date.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 습관 완료율 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="font-semibold">오늘 습관 달성률</span>
              </div>
              <span className="text-2xl font-bold text-lavender-500">
                {stats?.habitCompletionRate || 0}%
              </span>
            </div>
          </div>

          {/* 다음 주 목표 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">다음 주 목표 설정</h3>
                <p className="text-sm text-gray-400">알프레도와 함께 계획해보세요</p>
              </div>
              <button 
                onClick={function() { navigate('/chat'); }}
                className="p-2 bg-lavender-100 rounded-full text-lavender-500"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
