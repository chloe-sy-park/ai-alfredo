import React, { useEffect } from 'react';
import { useNudgeStore, createContextualNudge } from '../../stores/nudgeStore';
import { useUserPreferencesStore } from '../../stores/userPreferencesStore';
import { useBodyDoublingStore } from '../../stores/bodyDoublingStore';

export const NudgeManager: React.FC = () => {
  const { showNudge } = useNudgeStore();
  const { interventionLevel } = useUserPreferencesStore();
  const { isActive, getElapsedTime } = useBodyDoublingStore();
  
  useEffect(() => {
    // 개입 수준이 낮으면 nudge 빈도 감소
    const checkInterval = interventionLevel > 50 ? 60000 : 300000; // 1분 vs 5분
    
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      // 컨텍스트 수집
      const context = {
        time: now,
        workMode: true, // TODO: 실제 모드 확인
        focusTime: isActive ? getElapsedTime() : 0
      };
      
      // 컨텍스트 기반 nudge 생성
      const nudge = createContextualNudge(context);
      
      if (nudge && Math.random() < interventionLevel / 100) {
        showNudge(nudge);
      }
    }, checkInterval);
    
    return () => clearInterval(interval);
  }, [interventionLevel, showNudge, isActive, getElapsedTime]);
  
  // 특별한 이벤트 기반 nudge
  useEffect(() => {
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
          handler: () => console.log('Taking a break')
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