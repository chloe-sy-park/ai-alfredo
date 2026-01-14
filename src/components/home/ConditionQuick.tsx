import { useState, useEffect } from 'react';
import { 
  ConditionLevel, 
  conditionConfig, 
  getTodayCondition, 
  setTodayCondition,
  getConditionAdvice 
} from '../../services/condition';

interface ConditionQuickProps {
  onConditionChange?: (level: ConditionLevel) => void;
}

export default function ConditionQuick({ onConditionChange }: ConditionQuickProps) {
  var [currentLevel, setCurrentLevel] = useState<ConditionLevel | null>(null);
  var [advice, setAdvice] = useState<string>('');
  var [isExpanded, setIsExpanded] = useState(false);

  useEffect(function() {
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCurrentLevel(todayCondition.level);
      setAdvice(getConditionAdvice(todayCondition.level));
    }
  }, []);

  function handleSelect(level: ConditionLevel) {
    setTodayCondition(level);
    setCurrentLevel(level);
    setAdvice(getConditionAdvice(level));
    setIsExpanded(false);
    
    if (onConditionChange) {
      onConditionChange(level);
    }
  }

  var levels: ConditionLevel[] = ['great', 'good', 'normal', 'bad'];

  // 컨디션 미설정 상태
  if (!currentLevel) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-card">
        <p className="text-sm text-[#666666] mb-3">오늘 컨디션은 어때요?</p>
        <div className="flex gap-2">
          {levels.map(function(level) {
            var info = conditionConfig[level];
            return (
              <button
                key={level}
                onClick={function() { handleSelect(level); }}
                className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-[#F5F5F5] hover:border-[#A996FF]/30 hover:bg-[#F0F0FF] transition-all min-h-[80px]"
              >
                <span className="text-2xl">{info.emoji}</span>
                <span className="text-sm font-medium text-[#666666]">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  var currentInfo = conditionConfig[currentLevel];

  // 컨디션 설정된 상태 - 컴팩트 뷰
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <button
        onClick={function() { setIsExpanded(!isExpanded); }}
        className="w-full p-4 flex items-center gap-3 text-left min-h-[64px]"
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentInfo.color + '20' }}
        >
          <span className="text-xl">{currentInfo.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#1A1A1A]">오늘 컨디션</span>
            <span 
              className="text-sm px-2 py-0.5 rounded-full font-medium"
              style={{ 
                backgroundColor: currentInfo.color + '20',
                color: currentInfo.color
              }}
            >
              {currentInfo.label}
            </span>
          </div>
          <p className="text-sm text-[#999999] mt-1 line-clamp-1">{advice}</p>
        </div>
        <span className={'text-[#999999] transition-transform duration-200 ' + (isExpanded ? 'rotate-180' : '')}>
          ▾
        </span>
      </button>

      {/* 확장된 선택 영역 */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-[#E5E5E5] pt-3">
            <p className="text-sm text-[#999999] mb-2">변경하기</p>
            <div className="flex gap-2">
              {levels.map(function(level) {
                var info = conditionConfig[level];
                var isSelected = level === currentLevel;
                return (
                  <button
                    key={level}
                    onClick={function() { handleSelect(level); }}
                    className={
                      'flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all min-h-[72px] ' +
                      (isSelected 
                        ? 'border-[#A996FF] bg-[#F0F0FF]' 
                        : 'border-[#F5F5F5] hover:border-[#E5E5E5]')
                    }
                  >
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-sm font-medium text-[#666666]">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
