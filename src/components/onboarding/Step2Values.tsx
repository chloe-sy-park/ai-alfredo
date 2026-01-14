import { useOnboardingStore } from '../../stores/onboardingStore';
import { ClipboardList, Target, BarChart3 } from 'lucide-react';

export default function Step2Values() {
  var { nextStep } = useOnboardingStore();

  var values = [
    {
      icon: ClipboardList,
      title: '오늘 할 일 우선순위',
      example: '마케팅 보고서 검토 → 팀 미팅 → 디자인 문서 작성',
      description: '일석삼조 앞뒤로 배치'
    },
    {
      icon: Target,
      title: '지금 집중할 것',
      example: '마케팅 보고서 최종 검토',
      description: '당일의 작업 목록을 분석해서'
    },
    {
      icon: BarChart3,
      title: '이번 주 패턴',
      example: '오후 3-5시 사이 집중력 하락',
      description: '매일 리듬 측정'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          AlFredo는 이렇게 도와줍니다
        </h1>
      </div>
      
      {/* 가치 카드들 */}
      <div className="flex-1 space-y-4">
        {values.map(function(item, index) {
          var IconComponent = item.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#F0F0FF] rounded-xl flex items-center justify-center">
                  <IconComponent size={20} className="text-[#A996FF]" />
                </div>
                <h3 className="font-semibold text-[#1A1A1A]">{item.title}</h3>
              </div>
              <div className="ml-13 pl-[52px]">
                <p className="text-sm text-[#1A1A1A] mb-1">{item.example}</p>
                <p className="text-xs text-[#999999]">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* CTA */}
      <button
        onClick={nextStep}
        className="w-full py-4 bg-[#A996FF] text-white rounded-2xl font-semibold text-lg hover:bg-[#8B7BE8] transition-colors mt-8"
      >
        다음
      </button>
    </div>
  );
}
