import { useState, useEffect } from 'react';
import {
  ConditionLevel,
  conditionConfig,
  getTodayCondition,
  setTodayCondition
} from '../../services/condition';

interface ConditionCompactProps {
  onConditionChange?: (level: ConditionLevel) => void;
}

/**
 * 컴팩트 컨디션 체크 컴포넌트
 * 한 줄로 표시: 오늘 컨디션은 어때요? [최고][좋음][보통][힘듦]
 */
export default function ConditionCompact({ onConditionChange }: ConditionCompactProps) {
  const [currentLevel, setCurrentLevel] = useState<ConditionLevel | null>(null);

  useEffect(() => {
    const todayCondition = getTodayCondition();
    if (todayCondition) {
      setCurrentLevel(todayCondition.level);
    }
  }, []);

  function handleSelect(level: ConditionLevel) {
    setTodayCondition(level);
    setCurrentLevel(level);

    if (onConditionChange) {
      onConditionChange(level);
    }
  }

  const levels: ConditionLevel[] = ['great', 'good', 'normal', 'bad'];

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#666666] flex-shrink-0">
          오늘 컨디션은?
        </span>
        <div className="flex gap-1.5">
          {levels.map((level) => {
            const info = conditionConfig[level];
            const isSelected = level === currentLevel;
            return (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className={`
                  px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  flex items-center gap-1
                  ${isSelected
                    ? 'bg-[#A996FF]/20 text-[#7C3AED] border border-[#A996FF]'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EBEBEB] border border-transparent'
                  }
                `}
                title={info.label}
              >
                <span className="text-sm">{info.emoji}</span>
                <span className="hidden sm:inline">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
