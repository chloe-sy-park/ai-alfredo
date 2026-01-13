import { useState, useEffect, useCallback } from 'react';

/**
 * 시간 추정 코치 훅
 * ADHD 사용자의 시간 맹점 해결
 * - 예상 시간 vs 실제 시간 추적
 * - 개인별 보정 계수 학습
 * - 더 나은 시간 추정 제안
 */

const STORAGE_KEY = 'alfredo_time_estimates';

// 기본 구조
const DEFAULT_DATA = {
  entries: [],           // { taskId, taskName, estimated, actual, category, date }
  correctionFactor: 1.0, // 개인 보정 계수
  categoryFactors: {},   // 카테고리별 보정 계수
  totalEstimated: 0,
  totalActual: 0,
  entryCount: 0,
};

export function useTimeEstimator() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [activeTimer, setActiveTimer] = useState(null); // { taskId, taskName, estimated, startTime, category }
  
  // 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('시간 추정 데이터 로드 실패:', e);
      }
    }
  }, []);
  
  // 데이터 저장
  const saveData = useCallback((newData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
  }, []);
  
  // 타이머 시작
  const startTimer = useCallback((taskId, taskName, estimatedMinutes, category = 'general') => {
    setActiveTimer({
      taskId,
      taskName,
      estimated: estimatedMinutes,
      startTime: Date.now(),
      category,
    });
    return true;
  }, []);
  
  // 타이머 종료 & 기록
  const stopTimer = useCallback((completed = true) => {
    if (!activeTimer) return null;
    
    const endTime = Date.now();
    const actualMinutes = Math.round((endTime - activeTimer.startTime) / 60000);
    
    const entry = {
      taskId: activeTimer.taskId,
      taskName: activeTimer.taskName,
      estimated: activeTimer.estimated,
      actual: actualMinutes,
      category: activeTimer.category,
      date: new Date().toISOString(),
      completed,
    };
    
    // 새 데이터 계산
    const newEntries = [...data.entries, entry].slice(-100); // 최근 100개만 유지
    const newTotalEstimated = data.totalEstimated + entry.estimated;
    const newTotalActual = data.totalActual + entry.actual;
    const newEntryCount = data.entryCount + 1;
    
    // 전체 보정 계수 계산
    const newCorrectionFactor = newTotalEstimated > 0 
      ? newTotalActual / newTotalEstimated 
      : 1.0;
    
    // 카테고리별 보정 계수 업데이트
    const categoryEntries = newEntries.filter(e => e.category === entry.category);
    const catEstimated = categoryEntries.reduce((sum, e) => sum + e.estimated, 0);
    const catActual = categoryEntries.reduce((sum, e) => sum + e.actual, 0);
    const newCategoryFactors = {
      ...data.categoryFactors,
      [entry.category]: catEstimated > 0 ? catActual / catEstimated : 1.0,
    };
    
    const newData = {
      entries: newEntries,
      correctionFactor: Math.round(newCorrectionFactor * 100) / 100,
      categoryFactors: newCategoryFactors,
      totalEstimated: newTotalEstimated,
      totalActual: newTotalActual,
      entryCount: newEntryCount,
    };
    
    saveData(newData);
    setActiveTimer(null);
    
    return {
      ...entry,
      difference: actualMinutes - entry.estimated,
      ratio: entry.estimated > 0 ? actualMinutes / entry.estimated : 1,
    };
  }, [activeTimer, data, saveData]);
  
  // 타이머 취소
  const cancelTimer = useCallback(() => {
    setActiveTimer(null);
  }, []);
  
  // 보정된 시간 추정 제안
  const getSuggestedTime = useCallback((estimatedMinutes, category = 'general') => {
    const factor = data.categoryFactors[category] || data.correctionFactor || 1.0;
    return Math.round(estimatedMinutes * factor);
  }, [data]);
  
  // 인사이트 메시지 생성
  const getInsightMessage = useCallback(() => {
    if (data.entryCount < 3) {
      return null; // 데이터 부족
    }
    
    const factor = data.correctionFactor;
    
    if (factor > 1.5) {
      return {
        type: 'warning',
        emoji: '⏱️',
        message: `예상보다 평균 ${Math.round((factor - 1) * 100)}% 더 걸려요`,
        suggestion: '시간 추정 시 1.5배로 잡아보세요',
      };
    } else if (factor > 1.2) {
      return {
        type: 'info',
        emoji: '📊',
        message: `예상보다 약 ${Math.round((factor - 1) * 100)}% 더 걸리는 편이에요`,
        suggestion: '약간의 여유를 두면 좋아요',
      };
    } else if (factor < 0.8) {
      return {
        type: 'success',
        emoji: '⚡',
        message: '예상보다 빠르게 끝내는 편이에요!',
        suggestion: '좀 더 도전적인 목표도 괜찮아요',
      };
    }
    
    return {
      type: 'success',
      emoji: '✅',
      message: '시간 추정을 잘 하고 있어요!',
      suggestion: '지금처럼 하면 돼요',
    };
  }, [data]);
  
  // 최근 기록 가져오기
  const getRecentEntries = useCallback((limit = 5) => {
    return data.entries.slice(-limit).reverse();
  }, [data]);
  
  // 카테고리별 통계
  const getCategoryStats = useCallback(() => {
    const stats = {};
    
    for (const [category, factor] of Object.entries(data.categoryFactors)) {
      const entries = data.entries.filter(e => e.category === category);
      stats[category] = {
        factor: Math.round(factor * 100) / 100,
        count: entries.length,
        avgDiff: entries.length > 0 
          ? Math.round(entries.reduce((sum, e) => sum + (e.actual - e.estimated), 0) / entries.length)
          : 0,
      };
    }
    
    return stats;
  }, [data]);
  
  // 현재 타이머 경과 시간
  const getElapsedMinutes = useCallback(() => {
    if (!activeTimer) return 0;
    return Math.round((Date.now() - activeTimer.startTime) / 60000);
  }, [activeTimer]);
  
  return {
    // 상태
    data,
    activeTimer,
    isTimerRunning: !!activeTimer,
    
    // 타이머 제어
    startTimer,
    stopTimer,
    cancelTimer,
    getElapsedMinutes,
    
    // 인사이트
    getSuggestedTime,
    getInsightMessage,
    getRecentEntries,
    getCategoryStats,
    
    // 통계
    correctionFactor: data.correctionFactor,
    entryCount: data.entryCount,
  };
}

export default useTimeEstimator;
