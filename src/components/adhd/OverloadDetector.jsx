import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Sparkles, Coffee } from 'lucide-react';
import { useBehaviorStore } from '../../stores/behaviorStore';
import { usePersonalityStore } from '../../stores/personalityStore';

/**
 * ⚠️ Overload Detector - Sunsama 스타일
 * "12시간 분량의 일을 8시간에 넣으려고 해요"
 * 과부하 감지 및 경고
 */

const OverloadDetector = ({ 
  plannedTasks = [], 
  availableHours = 8,
  onMoveTask,
  onDismiss 
}) => {
  const { inferredProfile } = useBehaviorStore();
  const { getResponse, currentMode } = usePersonalityStore();

  // 총 계획된 시간 계산
  const totalPlannedMinutes = plannedTasks.reduce(
    (sum, task) => sum + (task.estimatedMinutes || 30), 
    0
  );
  const totalPlannedHours = totalPlannedMinutes / 60;
  
  // 사용자 정확도 반영 (시간 예측이 짧은 경향이면 1.5배)
  const adjustedHours = inferredProfile.estimationAccuracy < 0.6 
    ? totalPlannedHours * 1.5 
    : totalPlannedHours;
  
  // 과부하 여부
  const isOverloaded = adjustedHours > availableHours;
  const overloadHours = Math.max(0, adjustedHours - availableHours);
  const overloadPercentage = Math.round((adjustedHours / availableHours) * 100);

  // 과부하 아니면 표시 안 함
  if (!isOverloaded || plannedTasks.length === 0) {
    return null;
  }

  // 이동 추천 태스크 (우선순위 낮은 것부터)
  const suggestedToMove = plannedTasks
    .filter(t => !t.isUrgent && !t.isImportant)
    .slice(0, Math.ceil(overloadHours / 0.5)); // 30분 태스크 기준

  // 성격별 메시지
  const messages = {
    warm: {
      title: '오늘 좀 빡빡해 보여요 💜',
      subtitle: '무리하지 않아도 괜찮아요',
    },
    direct: {
      title: '과부하 감지',
      subtitle: '일부 작업을 내일로 미루세요',
    },
    playful: {
      title: '오버히트! 🔥',
      subtitle: '쿨다운이 필요해요~',
    },
  };

  const msg = messages[currentMode] || messages.warm;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-4">
      {/* 헤더 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-amber-100 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800">{msg.title}</h3>
          <p className="text-sm text-amber-600">{msg.subtitle}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-400 hover:text-amber-600"
        >
          ✕
        </button>
      </div>

      {/* 시간 비교 */}
      <div className="bg-white/60 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">계획된 시간</span>
          <span className="font-bold text-amber-700">
            {adjustedHours.toFixed(1)}시간
            {inferredProfile.estimationAccuracy < 0.6 && (
              <span className="text-xs text-amber-500 ml-1">(보정됨)</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">사용 가능 시간</span>
          <span className="font-medium text-gray-700">{availableHours}시간</span>
        </div>
        
        {/* 진행 바 */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              overloadPercentage > 150 ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(overloadPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0h</span>
          <span className="text-amber-600 font-medium">{overloadPercentage}%</span>
          <span>{availableHours}h</span>
        </div>
      </div>

      {/* 초과 시간 */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <Clock className="w-4 h-4 text-amber-600" />
        <span className="text-amber-700">
          약 <strong>{overloadHours.toFixed(1)}시간</strong> 초과
        </span>
      </div>

      {/* 추천 액션 */}
      {suggestedToMove.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs text-gray-500 font-medium">내일로 미룰까요?</p>
          {suggestedToMove.map((task, i) => (
            <button
              key={task.id || i}
              onClick={() => onMoveTask?.(task)}
              className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-colors"
            >
              <span className="text-sm text-gray-700 truncate">{task.title}</span>
              <div className="flex items-center gap-1 text-amber-600">
                <span className="text-xs">내일</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 text-sm text-amber-600 hover:text-amber-800"
        >
          괜찮아요, 할 수 있어요
        </button>
        <button
          onClick={() => suggestedToMove.forEach(t => onMoveTask?.(t))}
          className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          추천대로 조정
        </button>
      </div>

      {/* 팁 */}
      <div className="mt-3 pt-3 border-t border-amber-200 flex items-start gap-2">
        <Coffee className="w-4 h-4 text-amber-400 mt-0.5" />
        <p className="text-xs text-amber-600">
          💡 팁: 하루에 집중 작업은 4-6시간이 한계예요. 
          나머지는 미팅, 휴식, 예상치 못한 일을 위해 비워두세요.
        </p>
      </div>
    </div>
  );
};

export default OverloadDetector;
