import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function Step1Welcome() {
  var { nextStep, complete } = useOnboardingStore();
  var { completeOnboarding } = useAuthStore();
  var navigate = useNavigate();

  function handleSkip() {
    complete();
    completeOnboarding();
    navigate('/');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 알프레도 */}
      <div className="w-32 h-32 mb-6 animate-scale-in rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
        <img
          src="/assets/alfredo/avatar/alfredo-avatar-120.png"
          alt="알프레도"
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-8xl">🎩</span>'; }}
        />
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold heading-kr mb-3" style={{ color: 'var(--text-primary)' }}>
        AlFredo
      </h1>

      {/* 서브타이틀 */}
      <p className="text-lg font-medium mb-4" style={{ color: 'var(--accent-primary)' }}>
        도구가 아니라 관계입니다
      </p>

      {/* 설명 */}
      <p className="mb-12 max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        당신을 키우는 AI 라이프 버틀러,<br />
        당신과 함께 성장하는 알프레도
      </p>
      
      {/* CTA 버튼 */}
      <button
        onClick={nextStep}
        className="w-full max-w-xs py-4 bg-[#1A1A1A] text-white rounded-2xl font-semibold text-lg hover:bg-[#333333] transition-colors"
      >
        시작하기
      </button>
      
      {/* 건너뛰기 */}
      <button
        onClick={handleSkip}
        className="mt-4 text-[#999999] text-sm hover:text-[#666666]"
      >
        건너뛰기
      </button>
    </div>
  );
}
