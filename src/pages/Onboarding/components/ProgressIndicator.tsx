interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps
}: ProgressIndicatorProps) {
  // Welcome(0)과 EnterCore(마지막) 제외한 실제 진행 스텝
  const displayTotal = totalSteps - 2; // Welcome과 EnterCore 제외

  // 첫 화면(Welcome)과 마지막 화면(EnterCore)에서는 표시하지 않음
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  if (isFirstStep || isLastStep) {
    return null;
  }

  // 실제 표시되는 스텝 (1부터 시작)
  const displayStep = Math.min(currentStep, displayTotal);
  const progressPercent = Math.min(Math.round((displayStep / displayTotal) * 100), 100);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="온보딩 진행률">
      {/* 스텝 번호 표시 */}
      <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
        <span>Step {displayStep} of {displayTotal}</span>
        <span>{progressPercent}%</span>
      </div>

      {/* 프로그레스 바 */}
      <div className="flex items-center gap-2">
        {[...Array(displayTotal)].map((_, index) => (
          <div
            key={index}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: index < displayStep
                ? 'var(--accent-primary)'
                : 'var(--border-default)'
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}