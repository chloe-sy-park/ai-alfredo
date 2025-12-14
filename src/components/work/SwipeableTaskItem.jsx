import React, { useState, useRef } from 'react';
import { CheckCircle2, Trash2, Clock, Circle } from 'lucide-react';

// Common Components
import { DomainBadge } from '../common';

const SwipeableTaskItem = ({ task, onComplete, onDelete, onPress, darkMode }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showActions, setShowActions] = useState(null); // 'left' | 'right' | null
  
  const minSwipeDistance = 50;
  const actionThreshold = 80;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };
  
  const onTouchMove = (e) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    setTouchEnd(currentTouch);
    
    // 제한된 범위 내에서만 이동
    const limitedDiff = Math.max(-120, Math.min(120, diff));
    setTranslateX(limitedDiff);
    
    if (diff > actionThreshold) {
      setShowActions('right'); // 완료
    } else if (diff < -actionThreshold) {
      setShowActions('left'); // 삭제
    } else {
      setShowActions(null);
    }
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      resetPosition();
      return;
    }
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;
    
    if (isRightSwipe && distance > actionThreshold) {
      // 완료
      setTranslateX(400);
      setTimeout(() => {
        onComplete(task);
        resetPosition();
      }, 200);
    } else if (isLeftSwipe && distance < -actionThreshold) {
      // 삭제
      setTranslateX(-400);
      setTimeout(() => {
        onDelete(task);
        resetPosition();
      }, 200);
    } else {
      resetPosition();
    }
  };
  
  const resetPosition = () => {
    setTranslateX(0);
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setShowActions(null);
  };
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      {/* 배경 액션 */}
      <div className="absolute inset-0 flex">
        {/* 왼쪽 (삭제) */}
        <div className={`flex-1 flex items-center justify-start pl-4 bg-red-500 transition-opacity ${
          showActions === 'left' ? 'opacity-100' : 'opacity-50'
        }`}>
          <div className="text-white flex items-center gap-2">
            <Trash2 size={20} />
            <span className="font-bold">삭제</span>
          </div>
        </div>
        {/* 오른쪽 (완료) */}
        <div className={`flex-1 flex items-center justify-end pr-4 bg-emerald-500 transition-opacity ${
          showActions === 'right' ? 'opacity-100' : 'opacity-50'
        }`}>
          <div className="text-white flex items-center gap-2">
            <span className="font-bold">완료</span>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>
      
      {/* 태스크 카드 */}
      <div
        className={`${cardBg} p-4 shadow-sm relative z-10 transition-transform ${
          isSwiping ? '' : 'transition-all duration-200'
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => !isSwiping && translateX === 0 && onPress?.(task)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task);
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.status === 'done'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 hover:border-emerald-500'
            }`}
          >
            {task.status === 'done' && <CheckCircle2 size={14} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : textPrimary}`}>
              {task.title}
            </p>
            {task.project && (
              <p className={`text-xs ${textSecondary} truncate`}>{task.project}</p>
            )}
          </div>
          
          {task.importance === 'high' && (
            <span className="text-red-500 text-lg">!</span>
          )}
        </div>
      </div>
      
      {/* 스와이프 힌트 (첫 사용자용) */}
      {translateX === 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none opacity-0 group-hover:opacity-100">
          <ChevronLeft size={16} />
        </div>
      )}
    </div>
  );
};

// === Add Task Modal ===

export default SwipeableTaskItem;
