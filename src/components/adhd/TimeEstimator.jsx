import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, TrendingUp, TrendingDown, Minus, Brain, Lightbulb } from 'lucide-react';
import { useBehaviorStore } from '../../stores/behaviorStore';

/**
 * ⏱️ Time Estimator - Sunsama/Trevor AI 스타일
 * ADHD Time Blindness 지원
 * "예상보다 1.5배 걸리는 경향이 있어요"
 */

const TimeEstimator = ({ taskTitle, category, onEstimate }) => {
  const { predictDuration, inferredProfile, taskBehaviors } = useBehaviorStore();
  
  const [userEstimate, setUserEstimate] = useState(30);
  const [showInsight, setShowInsight] = useState(false);
  
  // AI 예측값
  const aiPrediction = predictDuration(taskTitle, category);
  
  // 정확도 계산
  const accuracy = inferredProfile.estimationAccuracy;
  const hasLowAccuracy = accuracy < 0.6;
  
  // 비슷한 과거 태스크 찾기
  const similarTasks = taskBehaviors.filter(t => 
    t.completed && 
    t.actualMinutes &&
    (t.taskTitle.toLowerCase().includes(taskTitle.toLowerCase().slice(0, 5)) ||
     (category && t.category === category))
  ).slice(0, 3);

  // 추천 시간 계산 (사용자 정확도 반영)
  const recommendedEstimate = hasLowAccuracy 
    ? Math.round(userEstimate * 1.5) 
    : userEstimate;

  const presetTimes = [15, 30, 45, 60, 90, 120];

  const handleConfirm = () => {
    onEstimate?.({
      userEstimate,
      aiPrediction,
      recommended: recommendedEstimate,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-800">시간 예측</h3>
        {hasLowAccuracy && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
            <Brain className="w-3 h-3" />
            학습 중
          </span>
        )}
      </div>

      {/* 태스크 이름 */}
      <div className="text-sm text-gray-600 mb-4 px-3 py-2 bg-gray-50 rounded-lg">
        "{taskTitle}"
      </div>

      {/* 프리셋 버튼 */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {presetTimes.map(time => (
          <button
            key={time}
            onClick={() => setUserEstimate(time)}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              userEstimate === time
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {time >= 60 ? `${time / 60}h` : `${time}m`}
          </button>
        ))}
      </div>

      {/* 슬라이더 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>5분</span>
          <span className="font-medium text-blue-600">{userEstimate}분</span>
          <span>3시간</span>
        </div>
        <input
          type="range"
          min="5"
          max="180"
          step="5"
          value={userEstimate}
          onChange={(e) => setUserEstimate(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* AI 인사이트 */}
      {(aiPrediction || hasLowAccuracy) && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <button
            onClick={() => setShowInsight(!showInsight)}
            className="flex items-center justify-between w-full"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              알프레도의 제안
            </span>
            <span className="text-xs text-gray-500">
              {showInsight ? '접기' : '펼치기'}
            </span>
          </button>
          
          {showInsight && (
            <div className="mt-3 space-y-2">
              {/* AI 예측 */}
              {aiPrediction && aiPrediction !== userEstimate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">예상 소요 시간:</span>
                  <span className="font-semibold text-blue-600">{aiPrediction}분</span>
                  {aiPrediction > userEstimate ? (
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  ) : aiPrediction < userEstimate ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}

              {/* 정확도 경고 */}
              {hasLowAccuracy && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-medium">시간 예측이 짧은 편이에요</p>
                    <p className="text-amber-600 mt-0.5">
                      추천: <span className="font-bold">{recommendedEstimate}분</span> (1.5배)
                    </p>
                  </div>
                </div>
              )}

              {/* 비슷한 태스크 기록 */}
              {similarTasks.length > 0 && (
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">비슷한 작업 기록:</p>
                  <ul className="space-y-1">
                    {similarTasks.map((task, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="truncate max-w-[150px]">{task.taskTitle}</span>
                        <span className="text-gray-700">{task.actualMinutes}분</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 확인 버튼 */}
      <button
        onClick={handleConfirm}
        className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Clock className="w-4 h-4" />
        {hasLowAccuracy ? `${recommendedEstimate}분으로 설정` : `${userEstimate}분으로 설정`}
      </button>

      {/* 수동 오버라이드 */}
      {hasLowAccuracy && recommendedEstimate !== userEstimate && (
        <button
          onClick={() => onEstimate?.({ userEstimate, aiPrediction, recommended: userEstimate })}
          className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          아니요, {userEstimate}분으로 할게요
        </button>
      )}
    </div>
  );
};

export default TimeEstimator;
