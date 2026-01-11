import React from 'react';
import { ArrowRight, Clock, Sparkles, X } from 'lucide-react';
import { useForgivingStore } from '../../stores/forgivingStore';
import { usePersonalityStore } from '../../stores/personalityStore';

/**
 * 🔄 Rollover Banner - Sunsama 스타일
 * "어제 못 끝낸 것들" 부드럽게 안내
 * 자동 롤오버 + 비처벌적 톤
 */

const RolloverBanner = ({ tasks = [], onComplete, onDismiss, onViewAll }) => {
  const { rolloverTasks, clearRollover, getEncouragement } = useForgivingStore();
  const { getResponse, currentMode } = usePersonalityStore();

  // 롤오버된 태스크가 없으면 표시 안 함
  const displayTasks = tasks.length > 0 ? tasks : rolloverTasks;
  if (displayTasks.length === 0) return null;

  // 성격별 메시지
  const messages = {
    warm: {
      title: '어제 못 끝낸 게 있어요',
      subtitle: '괜찮아요, 오늘 천천히 마무리해요 💜',
    },
    direct: {
      title: '미완료 태스크',
      subtitle: '오늘 우선순위에 넣으세요',
    },
    playful: {
      title: '어제의 모험이 계속돼요!',
      subtitle: '오늘 깨워버려요! 🗡️',
    },
  };

  const msg = messages[currentMode] || messages.warm;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 mb-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-purple-800">{msg.title}</h3>
            <p className="text-sm text-purple-600">{msg.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-purple-400 hover:text-purple-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 태스크 리스트 */}
      <div className="space-y-2 mb-3">
        {displayTasks.slice(0, 3).map((task, i) => (
          <div 
            key={task.id || i}
            className="flex items-center justify-between p-3 bg-white rounded-xl"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onComplete?.(task);
                  clearRollover(task.id);
                }}
                className="w-5 h-5 border-2 border-purple-300 rounded-full hover:border-purple-500 hover:bg-purple-100 transition-colors"
              />
              <div>
                <p className="text-sm text-gray-700">{task.title}</p>
                {task.rolloverCount > 1 && (
                  <p className="text-xs text-gray-400">
                    {task.rolloverCount}번째 이월
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs text-purple-400">
              {task.originalDate?.slice(5) || '어제'}
            </span>
          </div>
        ))}
      </div>

      {/* 더 보기 */}
      {displayTasks.length > 3 && (
        <button
          onClick={onViewAll}
          className="w-full py-2 text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1"
        >
          +{displayTasks.length - 3}개 더 보기
          <ArrowRight className="w-3 h-3" />
        </button>
      )}

      {/* 전체 완료 버튼 */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => displayTasks.forEach(t => clearRollover(t.id))}
          className="flex-1 py-2 border border-purple-200 rounded-xl text-sm text-purple-600 hover:bg-purple-50"
        >
          다 취소하기
        </button>
        <button
          onClick={() => {
            displayTasks.forEach(t => {
              onComplete?.(t);
              clearRollover(t.id);
            });
          }}
          className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          전체 완료
        </button>
      </div>
    </div>
  );
};

export default RolloverBanner;
