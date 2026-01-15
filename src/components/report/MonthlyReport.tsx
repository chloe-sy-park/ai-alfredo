// MonthlyReport.tsx - 월간 리포트 컴포넌트
import React from 'react';
import { LiftRecord } from '../../stores/liftStore';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';

interface MonthlyReportProps {
  lifts: LiftRecord[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ lifts }) => {
  // 월간 데이터는 추후 실제 데이터로 대체
  const balanceStabilityData = [
    { week: '1주', work: 70, life: 30 },
    { week: '2주', work: 65, life: 35 },
    { week: '3주', work: 60, life: 40 },
    { week: '4주', work: 65, life: 35 }
  ];
  
  const repeatedPatterns = [
    { pattern: '아침 루틴 vs 긴급 업무', count: 12 },
    { pattern: '집중 시간 vs 미팅', count: 8 },
    { pattern: '운동 vs 야근', count: 6 },
    { pattern: '개인 프로젝트 vs 휴식', count: 4 }
  ];
  
  return (
    <div className="px-4 py-6 space-y-8">
      {/* Section 1: Month Summary */}
      <section className="bg-white rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
          이번 달은<br />
          균형점을 찾아가는 과정이었고,<br />
          패턴이 안정되기 시작했어요.
        </h2>
      </section>
      
      {/* Section 2: Balance Stability Chart */}
      <section className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">균형 안정도</h3>
        
        <LineChart 
          data={balanceStabilityData}
          dataKeys={['work', 'life']}
          height={200}
        />
        
        <p className="text-gray-600 mt-4">
          3주차에 Life 비중이 늘어난 후로<br />
          전체적인 만족도가 향상되었어요.
        </p>
      </section>
      
      {/* Section 3: Repeated Trade-offs */}
      <section className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">반복된 트레이드오프</h3>
        
        <BarChart 
          data={repeatedPatterns}
          dataKey="count"
          height={200}
        />
        
        <p className="text-gray-600 mt-4">
          '아침 루틴 vs 긴급 업무' 선택이 가장 자주 발생했고,<br />
          점차 아침 루틴을 선택하는 비율이 높아졌어요.
        </p>
      </section>
      
      {/* Section 4: Alfredo's Long-term Take */}
      <section className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알프레도의 장기 관찰</h3>
        <p className="text-gray-700 leading-relaxed">
          한 달 동안 총 {lifts.length}번의 판단 조정이 있었어요.<br /><br />
          
          초반에는 매일 5-6번씩 조정이 필요했지만,<br />
          후반으로 갈수록 2-3번으로 줄어들었습니다.<br /><br />
          
          특히 '아침 시간 사용'에 대한 기준이 확립되면서<br />
          하루의 시작이 안정적으로 변했어요.<br /><br />
          
          다음 달에는 이 패턴을 유지하면서<br />
          저녁 시간대의 기준도 만들어가면 좋겠어요.
        </p>
      </section>
    </div>
  );
};

export default MonthlyReport;