interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ 
  currentStep, 
  totalSteps 
}: ProgressIndicatorProps) {
  // 실제 표시되는 스텝은 1부터 시작 (Welcome 제외)
  const displayStep = currentStep;
  const displayTotal = totalSteps - 2; // Welcome과 EnterCore 제외

  return (
    <div className="w-full">
      {/* 스텝 번호 표시 */}
      <div className="flex justify-between text-xs text-[#999999] mb-2">
        <span>Step {displayStep} of {displayTotal}</span>
        <span>{Math.round((displayStep / displayTotal) * 100)}%</span>
      </div>
      
      {/* 프로그레스 바 */}
      <div className="flex items-center gap-2">
        {[...Array(displayTotal)].map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < displayStep 
                ? 'bg-[#A996FF]' 
                : 'bg-[#E5E5E5]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}