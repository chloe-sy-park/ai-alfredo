import React from 'react';

/**
 * BalanceHint - Work/Life 비율 힌트
 */
function BalanceHint({ workRatio = 50, lifeRatio = 50 }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-500">오늘의 밸런스</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-blue-400 transition-all duration-300"
          style={{ width: `${workRatio}%` }}
        />
        <div
          className="h-full bg-green-400 transition-all duration-300"
          style={{ width: `${lifeRatio}%` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-blue-500">WORK {workRatio}%</span>
        <span className="text-green-500">LIFE {lifeRatio}%</span>
      </div>
    </div>
  );
}

export default BalanceHint;
