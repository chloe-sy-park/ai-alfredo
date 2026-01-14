import { useState } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TrendData {
  label: string;
  value: number;
  change: number; // percentage
}

export default function LifeTrends() {
  var [period, setPeriod] = useState<'week' | 'month'>('week');
  var [trends] = useState<TrendData[]>([
    { label: '에너지 레벨', value: 72, change: 8 },
    { label: '수면 품질', value: 85, change: -3 },
    { label: '운동 빈도', value: 60, change: 15 },
    { label: '스트레스', value: 45, change: -12 }
  ]);

  // 간단한 차트 (실제로는 차트 라이브러리 사용)
  function renderMiniChart() {
    var data = [65, 70, 68, 72, 75, 71, 72];
    var max = Math.max(...data);
    
    return (
      <div className="flex items-end gap-1 h-16">
        {data.map(function(value, index) {
          var height = (value / max) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-[#A996FF] rounded-t opacity-60 hover:opacity-100 transition-opacity"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-[#A996FF]" />
          <h3 className="font-semibold text-[#1A1A1A]">라이프 트렌드</h3>
        </div>
        
        <div className="flex gap-1 p-1 bg-[#F5F5F5] rounded-lg">
          <button
            onClick={function() { setPeriod('week'); }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              period === 'week' ? 'bg-white text-[#1A1A1A]' : 'text-[#999999]'
            }`}
          >
            주간
          </button>
          <button
            onClick={function() { setPeriod('month'); }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              period === 'month' ? 'bg-white text-[#1A1A1A]' : 'text-[#999999]'
            }`}
          >
            월간
          </button>
        </div>
      </div>
      
      {/* 미니 차트 */}
      <div className="mb-6">
        {renderMiniChart()}
        <div className="flex justify-between mt-2">
          <span className="text-xs text-[#999999]">월</span>
          <span className="text-xs text-[#999999]">오늘</span>
        </div>
      </div>
      
      {/* 트렌드 목록 */}
      <div className="space-y-3">
        {trends.map(function(trend) {
          var isPositive = trend.change > 0;
          var isGoodChange = (trend.label === '스트레스' ? !isPositive : isPositive);
          
          return (
            <div key={trend.label} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#666666]">{trend.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-[#F5F5F5] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#A996FF]"
                      style={{ width: `${trend.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-medium">
                    {trend.value}%
                  </span>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 ml-4 ${
                isGoodChange ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp size={14} className={!isPositive ? 'rotate-180' : ''} />
                <span className="text-xs font-medium">
                  {Math.abs(trend.change)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-[#A996FF] hover:bg-[#F5F5F5] rounded-lg transition-colors">
        자세한 분석 보기
      </button>
    </div>
  );
}