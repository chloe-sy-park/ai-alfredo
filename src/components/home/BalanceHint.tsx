interface BalanceHintProps {
  workPercent: number;
  lifePercent: number;
}

export default function BalanceHint({ workPercent, lifePercent }: BalanceHintProps) {
  return (
    <div className="bg-gradient-to-r from-lavender-100 to-life-bg rounded-card-lg p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          오늘 <span className="font-medium text-work-text">WORK {workPercent}%</span>
          {' '}·{' '}
          <span className="font-medium text-life-text">LIFE {lifePercent}%</span> 예정
        </p>
      </div>
      {/* Progress bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden mt-2 bg-white/50">
        <div 
          className="bg-work-text transition-all duration-normal"
          style={{ width: `${workPercent}%` }}
        />
        <div 
          className="bg-life-text transition-all duration-normal"
          style={{ width: `${lifePercent}%` }}
        />
      </div>
    </div>
  );
}
