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
      <div className="bg-white rounded-[16px] p-[16px] shadow-card">
        <p className="text-sm text-neutral-500 mb-[12px]">오늘 컨디션은 어때요?</p>
        <div className="flex gap-[8px]">
          {levels.map(function(level) {
            var info = conditionConfig[level];
            return (
              <button
                key={level}
                onClick={function() { handleSelect(level); }}
                className="flex-1 flex flex-col items-center gap-[4px] p-[12px] rounded-[16px] border-2 border-neutral-100 hover:border-lavender-200 hover:bg-lavender-50 transition-all min-h-[80px]"
              >
                <span className="text-2xl">{info.emoji}</span>
                <span className="text-sm font-medium text-neutral-600">{info.label}</span>
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
    <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
      <button
        onClick={function() { setIsExpanded(!isExpanded); }}
        className="w-full p-[16px] flex items-center gap-[12px] text-left min-h-[64px]"
      >
        <div 
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentInfo.color + '20' }}
        >
          <span className="text-xl">{currentInfo.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-[8px]">
            <span className="text-sm font-medium">오늘 컨디션</span>
            <span 
              className="text-sm px-[8px] py-[2px] rounded-full"
              style={{ 
                backgroundColor: currentInfo.color + '20',
                color: currentInfo.color
              }}
            >
              {currentInfo.label}
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-[4px] line-clamp-1">{advice}</p>
        </div>
        <span className={'text-neutral-400 transition-transform ' + (isExpanded ? 'rotate-180' : '')}>
          ▾
        </span>
      </button>

      {/* 확장된 선택 영역 */}
      {isExpanded && (
        <div className="px-[16px] pb-[16px] pt-0">
          <div className="border-t border-neutral-100 pt-[12px]">
            <p className="text-sm text-neutral-400 mb-[8px]">변경하기</p>
            <div className="flex gap-[8px]">
              {levels.map(function(level) {
                var info = conditionConfig[level];
                var isSelected = level === currentLevel;
                return (
                  <button
                    key={level}
                    onClick={function() { handleSelect(level); }}
                    className={
                      'flex-1 flex flex-col items-center gap-[4px] p-[12px] rounded-[16px] border-2 transition-all min-h-[72px] ' +
                      (isSelected 
                        ? 'border-lavender-400 bg-lavender-50' 
                        : 'border-neutral-100 hover:border-neutral-200')
                    }
                  >
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-sm font-medium text-neutral-600">{info.label}</span>
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
