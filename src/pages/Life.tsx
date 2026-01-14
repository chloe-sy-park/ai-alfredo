import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { WellbeingStatus, StatusCards, GentleNudge, LifeTrends } from '../components/life';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Heart } from 'lucide-react';

export default function Life() {
  var [condition, setCondition] = useState<ConditionLevel | null>(null);

  useEffect(function() {
    // 오늘 컨디션 로드
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCondition(todayCondition.level);
    }
  }, []);

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
        
        {/* 상태 카드 */}
        <StatusCards />
        
        {/* 부드러운 넛지 */}
        <GentleNudge />
        
        {/* 라이프 트렌드 */}
        <LifeTrends />
        
        {/* 빠른 액션 */}
        <div className="grid grid-cols-2 gap-2">
          <button className="py-3 bg-white rounded-xl text-[#666666] hover:bg-[#F5F5F5] transition-colors">
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
