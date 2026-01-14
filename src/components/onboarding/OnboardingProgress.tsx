interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex gap-2 px-6 pt-6">
      {Array.from({ length: totalSteps }).map(function(_, index) {
        var stepNum = index + 1;
        var isActive = stepNum <= currentStep;
        var isCurrent = stepNum === currentStep;
        
        return (
          <div 
            key={index}
            className={'h-1 flex-1 rounded-full transition-all duration-300 ' +
              (isActive ? 'bg-[#A996FF]' : 'bg-[#E5E0FF]') +
              (isCurrent ? ' scale-y-150' : '')}
          />
        );
      })}
    </div>
  );
}
