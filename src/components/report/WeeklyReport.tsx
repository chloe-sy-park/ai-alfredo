import { useState } from 'react';
import ReportSection from './ReportSection';
import { DonutChart, TimelineChart, LineChart } from './charts';
import { TrendingUp } from 'lucide-react';

export default function WeeklyReport() {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  
  // 샘플 데이터
  const balanceData = [
    { name: 'Work', value: 40, color: '#A996FF' },
    { name: 'Life', value: 60, color: '#E5E5E5' }
  ];
  
  const liftPoints = [
    { date: '월', intensity: 'low' as const },
    { date: '수', intensity: 'high' as const, time: '14:30', label: '프로젝트 → 가족' },
    { date: '금', intensity: 'mid' as const, time: '18:00', label: '업무 → 운동' },
  ];
  
  const weeklyPattern = [
    { name: '월', value: 70 },
    { name: '화', value: 65 },
    { name: '수', value: 45 },
    { name: '목', value: 50 },
    { name: '금', value: 55 },
    { name: '토', value: 80 },
    { name: '일', value: 75 },
  ];
  
  return (
    <div className="space-y-6">
      {/* Section 1: One-line Summary */}
      <section className="py-6">
        <h2 className="text-2xl font-bold leading-tight">
          이번 주는<br />
          삶이 일을 두 번 밀어냈고,<br />
          그 선택은 대체로 옳았어요.
        </h2>
      </section>

      {/* Section 2: Balance Overview */}
      <ReportSection title="균형">
        <div 
          className="cursor-pointer"
          onClick={() => setExpandedChart(expandedChart === 'balance' ? null : 'balance')}
        >
          <DonutChart 
            data={balanceData}
            minimal={expandedChart !== 'balance'}
            centerLabel="4:6"
          />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          일과 삶의 비중이 4:6으로 삶에 더 치중했어요.
        </p>
        
        {expandedChart === 'balance' && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 mb-4">주간 변화 추이</p>
            <LineChart 
              data={weeklyPattern}
              minimal={false}
              showGrid={true}
            />
          </div>
        )}
      </ReportSection>

      {/* Section 3: Judgement Lift Summary */}
      <ReportSection title="판단 조정">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-primary">3</div>
            <div className="text-sm text-gray-500 mt-1">전체 Lift</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-3xl font-bold text-primary">2</div>
            <div className="text-sm text-gray-500 mt-1">Work → Life</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp size={16} className="text-primary" />
          <span>지난주 대비 판단 변경이 50% 감소했어요</span>
        </div>
      </ReportSection>

      {/* Section 4: Lift Timeline */}
      <ReportSection title="타임라인">
        <div 
          className="cursor-pointer"
          onClick={() => setExpandedChart(expandedChart === 'timeline' ? null : 'timeline')}
        >
          <TimelineChart 
            points={liftPoints}
            minimal={expandedChart !== 'timeline'}
          />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          수요일 오후가 가장 큰 전환점이었어요.
        </p>
      </ReportSection>

      {/* Section 5: Alfredo's Take */}
      <ReportSection variant="highlight">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <span>🐧</span>
          <span>알프레도의 시선</span>
        </h3>
        <p className="leading-relaxed">
          이번 주에는<br />
          결정을 미루지 않았어요.<br />
          그래서 흐름이 흔들리지 않았습니다.
        </p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          특히 수요일 오후의 빠른 전환이<br />
          나머지 주를 편안하게 만들었네요.
        </p>
      </ReportSection>

      {/* Section 6: Suggestions */}
      <ReportSection title="다음 주 실험">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-primary mt-0.5">•</span>
            <span className="text-gray-700 dark:text-gray-300">
              수요일 오후 패턴을 기억해두기
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-0.5">•</span>
            <span className="text-gray-700 dark:text-gray-300">
              일 마감이 겹칠 때 미리 조정하기
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-0.5">•</span>
            <span className="text-gray-700 dark:text-gray-300">
              주말 재충전 시간 확보하기
            </span>
          </li>
        </ul>
      </ReportSection>
    </div>
  );
}