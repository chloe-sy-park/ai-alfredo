import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function Step5Growth() {
  var { complete } = useOnboardingStore();
  var { completeOnboarding } = useAuthStore();
  var navigate = useNavigate();

  function handleComplete() {
    complete(); // onboardingStore 업데이트
    completeOnboarding(); // authStore 업데이트 (App.tsx에서 사용)
    navigate('/');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* 헤더 */}
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">
        AlFredo는 성장합니다
      </h1>
      
      {/* 펭귄 + 프로그레스 */}
      <div className="bg-[#F0F0FF] rounded-3xl p-8 mb-8 w-full max-w-xs">
        <div className="text-6xl mb-4">🐧</div>
        
        {/* 성장률 */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl font-bold text-[#A996FF]">5%</span>
        </div>
        
        {/* 프로그레스 바 */}
        <div className="w-full h-3 bg-[#E5E0FF] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#A996FF] rounded-full transition-all duration-1000"
            style={{ width: '5%' }}
          />
        </div>
      </div>
      
      {/* 설명 */}
      <div className="max-w-xs space-y-4 mb-12">
        <p className="text-[#666666] leading-relaxed">
          처음에는 <span className="text-[#A996FF] font-medium">5% 정도</span>만 알고 있습니다.<br />
          하지만 함께하는 시간만큼<br />
          정확해집니다.
        </p>
        
        <div className="h-px bg-[#E5E5E5] w-16 mx-auto" />
        
        <p className="text-[#1A1A1A] font-medium">
          AlFredo를 키우는 과정에서,<br />
          AlFredo는 당신도 성장시킵니다.
        </p>
      </div>
      
      {/* CTA */}
      <button
        onClick={handleComplete}
        className="w-full max-w-xs py-4 bg-[#1A1A1A] text-white rounded-2xl font-semibold text-lg hover:bg-[#333333] transition-colors"
      >
        함께 시작하기
      </button>
    </div>
  );
}
