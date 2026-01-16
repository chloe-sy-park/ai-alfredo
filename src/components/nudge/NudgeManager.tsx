import React, { useEffect } from 'react';
import { useNudgeStore, createContextualNudge } from '../../stores/nudgeStore';
import { useUserPreferencesStore } from '../../stores/userPreferencesStore';
import { useBodyDoublingStore } from '../../stores/bodyDoublingStore';
import { useHomeModeStore } from '../../stores/homeModeStore';

export const NudgeManager: React.FC = () => {
  const { showNudge } = useNudgeStore();
  const { interventionLevel } = useUserPreferencesStore();
  const { isActive, getElapsedTime } = useBodyDoublingStore();
  const { isWorkMode } = useHomeModeStore();

  useEffect(function() {
    // 개입 수준이 낮으면 nudge 빈도 감소
    const checkInterval = interventionLevel > 50 ? 60000 : 300000; // 1분 vs 5분

    const interval = setInterval(function() {
      const now = new Date();

      // 컨텍스트 수집 - 실제 모드 사용
      const context = {
        time: now,
        workMode: isWorkMode(),
        focusTime: isActive ? getElapsedTime() : 0
      };
      
      // 컨텍스트 기반 nudge 생성
      const nudge = createContextualNudge(context);
      
      if (nudge && Math.random() < interventionLevel / 100) {
        showNudge(nudge);
      }
    }, checkInterval);
    
    return function() { clearInterval(interval); };
  }, [interventionLevel, showNudge, isActive, getElapsedTime, isWorkMode]);
  
  // 특별한 이벤트 기반 nudge
  useEffect(function() {
    if (!isActive) return;
    
    const focusTime = getElapsedTime();
    
    // 25분 집중 후 휴식 제안
    if (focusTime === 25 * 60) {
      showNudge({
        type: 'break',
        message: '🎯 25분 집중 완료! 5분 휴식하고 다시 시작해요.',
        priority: 'high',
        action: {
          label: '휴식하기',
          handler: function() { console.log('Taking a break'); }
        }
      });
    }
    
    // 50분 집중 후 긴 휴식 제안
    if (focusTime === 50 * 60) {
      showNudge({
        type: 'health',
        message: '💪 대단해요! 50분이나 집중하셨네요. 10분 정도 길게 쉬어요.',
        priority: 'high'
      });
    }
  }, [isActive, getElapsedTime, showNudge]);
  
  return null;
};