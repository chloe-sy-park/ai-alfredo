import { useOnboardingStore } from '../../stores/onboardingStore';

export default function Step1Welcome() {
  var { nextStep, complete } = useOnboardingStore();

  function handleSkip() {
    complete();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* 펭귄 */}
      <div className="text-8xl mb-6 animate-bounce">
        🐧
      </div>
      
      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">
        AlFredo
      </h1>
      
      {/* 서브타이틀 */}
      <p className="text-lg text-[#A996FF] font-medium mb-4">
        도구가 아니라 관계입니다
      </p>
      
      {/* 설명 */}
      <p className="text-[#666666] mb-12 max-w-xs leading-relaxed">
        당신을 키우는 AI 멘토이자,<br />
        당신이 키우는 퍼스트 펭귄
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
