/**
 * 🏠 HomeIntegrated - 새 컴포넌트들이 통합된 홈 페이지 래퍼
 * 
 * 통합된 기능:
 * - RolloverBanner (Sunsama 스타일)
 * - StreakDisplay (Headspace/Duolingo 스타일)
 * - AlfredoAvatar (감정 표현)
 * - TwoTapMood (빠른 컨디션 로깅)
 * - OverloadDetector (과부하 감지)
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

// 새 컴포넌트들
import { RolloverBanner } from '../forgiving';
import { StreakDisplay } from '../forgiving';
import { AlfredoAvatar } from '../character';
import { TwoTapMood, OverloadDetector } from '../adhd';

// Store
import { useForgivingStore } from '../../stores';
import { usePersonalityStore } from '../../stores';
import { useBehaviorStore } from '../../stores';

/**
 * 홈 페이지에 추가할 새 섹션들의 래퍼 컴포넌트
 */
export function HomeEnhancements({ darkMode, tasks, onToggleTask, onOpenTask }) {
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showOverloadModal, setShowOverloadModal] = useState(false);
  
  const { emotion } = usePersonalityStore();
  const { getRolledOverTasks, completeRolledOverTask, dismissRolledOverTask } = useForgivingStore();
  const { getCurrentHourProductivity } = useBehaviorStore();
  
  const rolledOverTasks = getRolledOverTasks();
  
  // 현재 시간대 생산성
  const currentProductivity = getCurrentHourProductivity();
  
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white/80';
  
  return (
    <div className="space-y-4">
      {/* 통합 알프레도 상태 섹션 */}
      <div className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'}`}>
        <div className="flex items-center justify-between">
          {/* 알프레도 아바타 + 인사 */}
          <div className="flex items-center gap-3">
            <AlfredoAvatar 
              emotion={emotion} 
              size="lg" 
              animate={true}
            />
            <div>
              <p className={`${textPrimary} font-medium`}>
                오늘도 함께해요! 👋
              </p>
              <p className={`${textSecondary} text-sm`}>
                {currentProductivity > 70 
                  ? '지금 집중력이 좋은 시간대예요' 
                  : '편하게 시작해봐요'}
              </p>
            </div>
          </div>
          
          {/* 스트릭 표시 */}
          <StreakDisplay compact={true} darkMode={darkMode} />
        </div>
      </div>
      
      {/* 롤오버 배너 (어제 미완료 태스크 있을 때만) */}
      {rolledOverTasks.length > 0 && (
        <RolloverBanner
          tasks={rolledOverTasks}
          onComplete={(taskId) => {
            completeRolledOverTask(taskId);
            if (onToggleTask) onToggleTask(taskId);
          }}
          onDismiss={dismissRolledOverTask}
          darkMode={darkMode}
        />
      )}
      
      {/* 빠른 컨디션 체크 버튼 */}
      <button
        onClick={() => setShowMoodModal(true)}
        className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'} w-full flex items-center justify-between hover:scale-[1.02] transition-transform`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">😊</span>
          <span className={textPrimary}>지금 컨디션 기록하기</span>
        </div>
        <ChevronRight className={textSecondary} size={20} />
      </button>
      
      {/* Two-Tap Mood 모달 */}
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMoodModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <TwoTapMood 
              onComplete={() => setShowMoodModal(false)}
              darkMode={darkMode}
            />
          </div>
        </div>
      )}
      
      {/* Overload Detector 모달 */}
      {showOverloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOverloadModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <OverloadDetector
              tasks={tasks}
              onAdjust={() => setShowOverloadModal(false)}
              darkMode={darkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 홈 페이지에서 과부하 감지 호출
 */
export function useOverloadCheck(tasks) {
  const [showWarning, setShowWarning] = useState(false);
  const { getEstimationAccuracy } = useBehaviorStore();
  
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    
    const todayTasks = tasks.filter(t => {
      if (t.completed) return false;
      if (!t.dueDate) return true;
      const due = new Date(t.dueDate);
      const today = new Date();
      return due.toDateString() === today.toDateString();
    });
    
    const totalMinutes = todayTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
    const accuracy = getEstimationAccuracy();
    const adjustedMinutes = totalMinutes * (accuracy < 60 ? 1.5 : 1);
    const availableMinutes = 8 * 60; // 8시간
    
    if (adjustedMinutes > availableMinutes) {
      setShowWarning(true);
    }
  }, [tasks]);
  
  return { showWarning, setShowWarning };
}

export default HomeEnhancements;
