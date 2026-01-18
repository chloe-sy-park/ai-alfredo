import { useOnboardingStore } from '../../stores/onboardingStore';

export default function Step4Intervention() {
  var { nextStep } = useOnboardingStore();

  var scenarios = [
    {
      situation: '중요한 작업 계속 미루고 있을 때',
      message: '"이 작업은 오늘 3시까지 1개 완료 필요. 지금 시작하시겠어요?"',
      emoji: '⏰'
    },
    {
      situation: '연속으로 3시간 일했을 때',
      message: '"2시간 이상 집중했습니다. 10분 휴식을 추천합니다."',
      emoji: '☕'
    },
    {
      situation: '저녁 시간에 업무 요청이 들어올 때',
      message: '"현재 Life 모드입니다. 내일 오전에 처리하면 어떨까요?"',
      emoji: '🌙'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          AlFredo는 이렇게 개입합니다
        </h1>
      </div>
      
      {/* 시나리오 카드들 */}
      <div className="flex-1 space-y-4">
        {scenarios.map(function(scenario, index) {
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5]"
            >
              {/* 상황 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#999999] bg-[#F5F5F5] px-2 py-1 rounded">상황</span>
                <span className="text-sm text-[#666666]">{scenario.situation}</span>
              </div>
              
              {/* AlFredo 메시지 */}
              <div className="flex items-start gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <span className="text-2xl">{scenario.emoji}</span>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-default)' }}>
                      <img
                        src="/assets/alfredo/avatar/alfredo-avatar-24.png"
                        alt="알프레도"
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-lg">🎩</span>'; }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>AlFredo</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{scenario.message}</p>
                </div>
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
        이해했어요
      </button>
    </div>
  );
}
