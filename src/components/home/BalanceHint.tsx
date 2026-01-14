interface BalanceHintProps {
  workPercent: number;
  lifePercent: number;
}

export default function BalanceHint({ workPercent, lifePercent }: BalanceHintProps) {
  return (
    <div className="bg-gradient-to-r from-[#F0F0FF] to-[#FEF3C7] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#666666]">
          오늘 <span className="font-semibold text-[#A996FF]">WORK {workPercent}%</span>
          {' '}·{' '}
          <span className="font-semibold text-[#F97316]">LIFE {lifePercent}%</span> 예정
        </p>
      </div>
      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-white/60">
        <div 
          className="bg-[#A996FF] transition-all duration-200"
          style={{ width: workPercent + '%' }}
        />
        <div 
          className="bg-[#F97316] transition-all duration-200"
          style={{ width: lifePercent + '%' }}
        />
      </div>
    </div>
  );
}
