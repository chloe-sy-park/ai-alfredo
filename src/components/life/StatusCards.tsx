import { useState } from 'react';
import { Battery, Moon, Heart, Activity } from 'lucide-react';

interface StatusData {
  energy: number; // 0-100
  sleep: number; // hours
  heartRate?: number; // bpm
  steps?: number;
}

export default function StatusCards() {
  // 실제로는 헬스 데이터 API 연동 필요
  var [status] = useState<StatusData>({
    energy: 75,
    sleep: 7.5,
    heartRate: 72,
    steps: 5842
  });

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
      
      {/* 심박수 */}
      {status.heartRate && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Heart size={20} className="text-red-500" />
            <span className="text-xs text-[#999999]">심박수</span>
          </div>
          <p className="text-2xl font-bold text-[#1A1A1A]">{status.heartRate}</p>
          <p className="text-xs text-[#666666] mt-1">bpm</p>
        </div>
      )}
      
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