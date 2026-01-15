// WeeklyReport.tsx - 주간 리포트 컴포넌트
import React from 'react';
import { LiftRecord } from '../../stores/liftStore';
import { DonutChart } from './charts/DonutChart';
import { TimelineChart } from './charts/TimelineChart';
import { ChevronRight } from 'lucide-react';

interface WeeklyReportProps {
  lifts: LiftRecord[];
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ lifts }) => {
  // Work vs Life 비율 계산 (실제로는 활동 기록에서 계산)
  const workLifeBalance = {
    work: 65,
    life: 35
  };
  
  // Lift 통계
  const liftStats = {
    total: lifts.length,
    apply: lifts.filter(l => l.type === 'apply').length,
    maintain: lifts.filter(l => l.type === 'maintain').length,
    consider: lifts.filter(l => l.type === 'consider').length
  };
  
  return (
    <div className="px-4 py-6 space-y-8">
      {/* Section 1: One-line Summary */}
      <section className="bg-white rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
          이번 주는<br />
          삶이 일을 두 번 밀어냈고,<br />
          그 선택은 대체로 옳았어요.
        </h2>
      </section>
      
      {/* Section 2: Balance Overview */}
      <section className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">균형 개요</h3>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            자세히 <ChevronRight className="inline w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <DonutChart 
            data={[
              { name: 'Work', value: workLifeBalance.work },
              { name: 'Life', value: workLifeBalance.life }
            ]}
            width={120}
            height={120}
          />
          <div>
            <p className="text-gray-600">
              일과 삶의 비중이 이번 주는 일 쪽으로 기울었지만,<br />
              중요한 순간에는 삶을 선택했어요.
            </p>
          </div>
        </div>
      </section>
      
      {/* Section 3: Judgement Lift Summary */}
      <section className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">판단 변화</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#A996FF]">{liftStats.total}</div>
            <div className="text-sm text-gray-600 mt-1">전체 변화</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{liftStats.apply}</div>
            <div className="text-sm text-gray-600 mt-1">적용</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">{liftStats.maintain}</div>
            <div className="text-sm text-gray-600 mt-1">유지</div>
          </div>
        </div>
        
        <p className="text-gray-600 mt-4">
          이번 주에는 {liftStats.total}번의 판단 재조정이 있었고,
          그 중 {liftStats.apply}번을 실제로 반영했어요.
        </p>
      </section>
      
      {/* Section 4: Lift Timeline */}
      <section className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">변화 타임라인</h3>
        
        <TimelineChart lifts={lifts} height={200} />
        
        <p className="text-gray-600 mt-4">
          화요일 오후와 목요일 아침의 판단 변경이<br />
          이번 주 흐름을 결정했어요.
        </p>
      </section>
      
      {/* Section 5: Alfredo's Take */}
      <section className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알프레도의 관찰</h3>
        <p className="text-gray-700 leading-relaxed">
          이번 주에는 결정을 미루지 않았어요.<br />
          그래서 흐름이 흔들리지 않았습니다.<br /><br />
          특히 화요일에 미팅 대신 개인 시간을 선택한 것이<br />
          나머지 주를 안정적으로 만들었어요.
        </p>
      </section>
      
      {/* Section 6: Suggestions to Try */}
      <section className="bg-[#F9F7FF] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">다음 주 실험</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-[#A996FF] mt-1">•</span>
            <p className="text-gray-700">아침 시간대 판단은 전날 밤에 미리 해보기</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#A996FF] mt-1">•</span>
            <p className="text-gray-700">Work 시간이 길어질 때 15분 단위로 체크인하기</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#A996FF] mt-1">•</span>
            <p className="text-gray-700">목요일 오후를 '판단 없는 시간'으로 실험해보기</p>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default WeeklyReport;