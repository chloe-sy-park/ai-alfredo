/**
 * InsightChart
 * PRD Component Inventory: 인사이트 차트 컴포넌트
 * 다양한 인사이트를 시각화하는 통합 차트 컴포넌트
 */

import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

type ChartType = 'balance' | 'trend' | 'comparison' | 'progress';

interface BalanceData {
  work: number;
  life: number;
}

interface TrendData {
  label: string;
  value: number;
  change: number; // positive = up, negative = down, 0 = steady
}

interface ComparisonData {
  items: { label: string; value: number; color: string }[];
  maxValue?: number;
}

interface ProgressData {
  current: number;
  target: number;
  label: string;
}

interface InsightChartProps {
  type: ChartType;
  title?: string;
  data: BalanceData | TrendData[] | ComparisonData | ProgressData;
  height?: number;
}

// 균형 차트 (Work vs Life)
function BalanceChart({ data, height = 120 }: { data: BalanceData; height: number }) {
  var total = data.work + data.life;
  var workPercent = Math.round((data.work / total) * 100);
  var lifePercent = 100 - workPercent;

  return (
    <div style={{ height }} className="flex items-center justify-center gap-6">
      {/* 도넛 차트 시각화 */}
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* 배경 원 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="12"
          />
          {/* Work 영역 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#A996FF"
            strokeWidth="12"
            strokeDasharray={`${workPercent * 2.51} 251`}
            strokeLinecap="round"
          />
          {/* Life 영역 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#F97316"
            strokeWidth="12"
            strokeDasharray={`${lifePercent * 2.51} 251`}
            strokeDashoffset={`${-workPercent * 2.51}`}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 레전드 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#A996FF]" />
          <span className="text-sm text-[#666666] dark:text-gray-400">Work</span>
          <span className="font-semibold text-[#1A1A1A] dark:text-white">{workPercent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F97316]" />
          <span className="text-sm text-[#666666] dark:text-gray-400">Life</span>
          <span className="font-semibold text-[#1A1A1A] dark:text-white">{lifePercent}%</span>
        </div>
      </div>
    </div>
  );
}

// 트렌드 차트
function TrendChart({ data, height = 120 }: { data: TrendData[]; height: number }) {
  function getTrendIcon(change: number) {
    if (change > 0) return <TrendingUp size={14} className="text-green-500" />;
    if (change < 0) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-[#999999]" />;
  }

  function getTrendColor(change: number) {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-[#999999]';
  }

  return (
    <div style={{ minHeight: height }} className="space-y-3">
      {data.map(function(item, index) {
        return (
          <div key={index} className="flex items-center justify-between p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-[#666666] dark:text-gray-300">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1A1A1A] dark:text-white">{item.value}</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(item.change)}
                <span className={`text-xs ${getTrendColor(item.change)}`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 비교 차트 (수평 바)
function ComparisonChart({ data, height = 120 }: { data: ComparisonData; height: number }) {
  var maxValue = data.maxValue || Math.max(...data.items.map(function(i) { return i.value; }));

  return (
    <div style={{ minHeight: height }} className="space-y-3">
      {data.items.map(function(item, index) {
        var percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666666] dark:text-gray-300">{item.label}</span>
              <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{item.value}</span>
            </div>
            <div className="h-2 bg-[#E5E5E5] dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 진행 차트 (원형 진행률)
function ProgressChart({ data, height = 120 }: { data: ProgressData; height: number }) {
  var percentage = Math.min(Math.round((data.current / data.target) * 100), 100);
  var circumference = 2 * Math.PI * 40;
  var strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ height }} className="flex items-center justify-center gap-6">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#A996FF"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[#1A1A1A] dark:text-white">{percentage}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-[#666666] dark:text-gray-400">{data.label}</p>
        <p className="font-semibold text-[#1A1A1A] dark:text-white">
          {data.current} / {data.target}
        </p>
      </div>
    </div>
  );
}

export default function InsightChart({ type, title, data, height = 120 }: InsightChartProps) {
  function renderChart() {
    switch (type) {
      case 'balance':
        return <BalanceChart data={data as BalanceData} height={height} />;
      case 'trend':
        return <TrendChart data={data as TrendData[]} height={height} />;
      case 'comparison':
        return <ComparisonChart data={data as ComparisonData} height={height} />;
      case 'progress':
        return <ProgressChart data={data as ProgressData} height={height} />;
      default:
        return null;
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-[#A996FF]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{title}</h3>
        </div>
      )}
      {renderChart()}
    </div>
  );
}

// Named exports for type-specific usage
export { BalanceChart, TrendChart, ComparisonChart, ProgressChart };
