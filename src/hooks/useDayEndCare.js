import { useState, useEffect, useCallback } from 'react';

/**
 * 실패 케어 & 하루 마무리 트리거 훅
 * - 저녁 21시 이후 자동 트리거
 * - 오늘 완료한 태스크 수 기반 메시지 분기
 * - 하루 1회만 표시
 */

const STORAGE_KEY = 'alfredo_dayend_shown';

export function useDayEndCare(completedToday = 0, totalTasks = 0) {
  const [shouldShow, setShouldShow] = useState(false);
  const [careType, setCareType] = useState('partialComplete');
  
  // 오늘 이미 표시했는지 확인
  const hasShownToday = useCallback(() => {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (!lastShown) return false;
    
    const lastDate = new Date(lastShown).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
  }, []);
  
  // 표시 완료 기록
  const markAsShown = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setShouldShow(false);
  }, []);
  
  // 케어 타입 결정
  const determineCareType = useCallback(() => {
    const completionRate = totalTasks > 0 ? completedToday / totalTasks : 0;
    
    if (completedToday === 0) {
      return 'zeroComplete';
    } else if (completionRate < 0.3) {
      return 'lowComplete';
    } else if (completionRate < 0.7) {
      return 'partialComplete';
    } else {
      return 'goodJob'; // 잘 했을 때도 메시지
    }
  }, [completedToday, totalTasks]);
  
  // 저녁 시간 체크 (21시~23시)
  useEffect(() => {
    const checkEvening = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // 21시~23시 사이이고, 오늘 아직 안 보여줬으면
      if (hour >= 21 && hour < 24 && !hasShownToday()) {
        setCareType(determineCareType());
        setShouldShow(true);
      }
    };
    
    // 즉시 체크
    checkEvening();
    
    // 1분마다 체크
    const interval = setInterval(checkEvening, 60000);
    
    return () => clearInterval(interval);
  }, [hasShownToday, determineCareType]);
  
  // 수동 트리거 (저녁 리뷰 버튼용)
  const triggerManually = useCallback(() => {
    setCareType(determineCareType());
    setShouldShow(true);
  }, [determineCareType]);
  
  return {
    shouldShow,
    careType,
    markAsShown,
    triggerManually,
  };
}

export default useDayEndCare;
