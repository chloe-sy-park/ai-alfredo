import { useState, useEffect } from 'react';
import { 
  ConditionLevel, 
  conditionInfo, 
  getTodayCondition, 
  saveCondition,
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
    saveCondition(level);
    setCurrentLevel(level);
    setAdvice(getConditionAdvice(level));
    setIsExpanded(false);
    
    if (onConditionChange) {
      onConditionChange(level);
    }
  }

  var levels: ConditionLevel[] = ['great', 'okay', 'tired'];

  // 컨디션 미설정 상태
  if (!currentLevel) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-3">오늘 컨디션은 어때요?</p>
        <div className="flex gap-2">
          {levels.map(function(level) {
            var info = conditionInfo[level];
            return (
              <button
                key={level}
                onClick={function() { handleSelect(level); }}
                className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-gray-100 hover:border-lavender-200 hover:bg-lavender-50 transition-all"
              >
                <span className="text-2xl">{info.emoji}</span>
                <span className="text-xs font-medium text-gray-600">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  var currentInfo = conditionInfo[currentLevel];

  // 컨디션 설정된 상태 - 컴팩트 뷰
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={function() { setIsExpanded(!isExpanded); }}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentInfo.color + '20' }}
        >
          <span className="text-xl">{currentInfo.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">오늘 컨디션</span>
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: currentInfo.color + '20',
                color: currentInfo.color
              }}
            >
              {currentInfo.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{advice}</p>
        </div>
        <span className={'text-gray-400 transition-transform ' + (isExpanded ? 'rotate-180' : '')}>
          ▾
        </span>
      </button>

      {/* 확장된 선택 영역 */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 mb-2">변경하기</p>
            <div className="flex gap-2">
              {levels.map(function(level) {
                var info = conditionInfo[level];
                var isSelected = level === currentLevel;
                return (
                  <button
                    key={level}
                    onClick={function() { handleSelect(level); }}
                    className={
                      'flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ' +
                      (isSelected 
                        ? 'border-lavender-400 bg-lavender-50' 
                        : 'border-gray-100 hover:border-gray-200')
                    }
                  >
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-xs font-medium text-gray-600">{info.label}</span>
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
