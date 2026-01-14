import { useState, useEffect } from 'react';
import { Battery, Moon, Heart, Activity, CheckCircle2, Target } from 'lucide-react';
import { getTodayCompletionRate, getHabits, getTodayLogs } from '../../services/habits';

interface StatusData {
  energy: number; // 0-100
  sleep: number; // hours
  heartRate?: number; // bpm
  steps?: number;
  habitCompletion: number; // 0-100
  habitsCompleted: number;
  totalHabits: number;
}

export default function StatusCards() {
  // 실제로는 헬스 데이터 API 연동 필요
  var [status, setStatus] = useState<StatusData>({
    energy: 75,
    sleep: 7.5,
    heartRate: 72,
    steps: 5842,
    habitCompletion: 0,
    habitsCompleted: 0,
    totalHabits: 0
  });

  useEffect(function() {
    // 습관 완료율 계산
    var habits = getHabits();
    var todayLogs = getTodayLogs();
    var completedCount = todayLogs.filter(function(log) { return log.completed; }).length;
    var completionRate = getTodayCompletionRate();
    
    setStatus(function(prev) {
      return {
        ...prev,
        habitCompletion: completionRate,
        habitsCompleted: completedCount,
        totalHabits: habits.length
      };
    });
  }, []);

  function getEnergyColor(level: number): string {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    if (level >= 20) return 'text-orange-500';
    return 'text-red-500';
  }

  function getSleepQuality(hours: number): string {
    if (hours >= 7 && hours <= 9) return '좋음';
    if (hours >= 6) return '보통';
    return '부족';
  }

  function getHabitColor(rate: number): string {
    if (rate >= 80) return 'bg-green-400';
    if (rate >= 50) return 'bg-yellow-400';
    return 'bg-orange-400';
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 에너지 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <Battery size={20} className={getEnergyColor(status.energy)} />
          <span className="text-xs text-[#999999]">에너지</span>
        </div>
        <p className="text-2xl font-bold text-[#1A1A1A]">{status.energy}%</p>
        <div className="mt-2 bg-[#F5F5F5] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${status.energy >= 50 ? 'bg-green-400' : 'bg-orange-400'}`}
            style={{ width: `${status.energy}%` }}
          />
        </div>
      </div>
      
      {/* 수면 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <Moon size={20} className="text-indigo-500" />
          <span className="text-xs text-[#999999]">수면</span>
        </div>
        <p className="text-2xl font-bold text-[#1A1A1A]">{status.sleep}h</p>
        <p className="text-xs text-[#666666] mt-1">{getSleepQuality(status.sleep)}</p>
      </div>
      
      {/* 습관 완료율 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle2 size={20} className="text-[#A996FF]" />
          <span className="text-xs text-[#999999]">오늘의 습관</span>
        </div>
        <p className="text-2xl font-bold text-[#1A1A1A]">{status.habitCompletion}%</p>
        <p className="text-xs text-[#666666] mt-1">
          {status.habitsCompleted}/{status.totalHabits} 완료
        </p>
        <div className="mt-2 bg-[#F5F5F5] rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getHabitColor(status.habitCompletion)}`}
            style={{ width: `${status.habitCompletion}%` }}
          />
        </div>
      </div>
      
      {/* 걸음수 */}
      {status.steps && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-blue-500" />
            <span className="text-xs text-[#999999]">걸음수</span>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            {(status.steps / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-[#666666] mt-1">걸음</p>
        </div>
      )}
    </div>
  );
}
