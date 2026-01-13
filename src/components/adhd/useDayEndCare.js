import { useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

/**
 * 🌙 useDayEndCare - 저녁 케어 시스템 훅
 * 21시-23시 자동 트리거, 완료율 기반 케어 타입 분기
 */

var STORAGE_KEY = 'alfredo_day_end_care';

export function useDayEndCare() {
  var modalState = useState(false);
  var showModal = modalState[0];
  var setShowModal = modalState[1];
  
  var careTypeState = useState('neutral');
  var careType = careTypeState[0];
  var setCareType = careTypeState[1];
  
  var completionRateState = useState(0);
  var completionRate = completionRateState[0];
  var setCompletionRate = completionRateState[1];
  
  // 오늘 이미 표시했는지 확인
  var hasShownToday = useCallback(function() {
    var saved = loadFromStorage(STORAGE_KEY);
    if (!saved || !saved.lastShown) return false;
    
    var lastShown = new Date(saved.lastShown);
    var today = new Date();
    return lastShown.toDateString() === today.toDateString();
  }, []);
  
  // 표시 기록 저장
  var markAsShown = useCallback(function() {
    saveToStorage(STORAGE_KEY, {
      lastShown: new Date().toISOString(),
      careType: careType,
      completionRate: completionRate
    });
  }, [careType, completionRate]);
  
  // 케어 타입 결정
  var determineCareType = useCallback(function(rate) {
    if (rate >= 80) return 'celebration';      // 🎉 축하 모드
    if (rate >= 50) return 'encouragement';    // 💪 격려 모드
    if (rate >= 20) return 'gentle';           // 🤗 부드러운 위로
    return 'compassion';                        // 💜 깊은 공감
  }, []);
  
  // 완료율 업데이트 시 케어 타입도 업데이트
  useEffect(function() {
    setCareType(determineCareType(completionRate));
  }, [completionRate, determineCareType]);
  
  // 자동 트리거 (21시-23시)
  useEffect(function() {
    var checkTime = function() {
      var hour = new Date().getHours();
      
      // 21시-23시 사이이고, 오늘 아직 안 보여줬으면
      if (hour >= 21 && hour < 23 && !hasShownToday()) {
        setShowModal(true);
      }
    };
    
    // 즉시 체크
    checkTime();
    
    // 10분마다 체크
    var interval = setInterval(checkTime, 10 * 60 * 1000);
    
    return function() { clearInterval(interval); };
  }, [hasShownToday]);
  
  // 수동 트리거
  var triggerManually = useCallback(function() {
    setShowModal(true);
  }, []);
  
  return {
    showModal: showModal,
    setShowModal: setShowModal,
    careType: careType,
    completionRate: completionRate,
    setCompletionRate: setCompletionRate,
    markAsShown: markAsShown,
    triggerManually: triggerManually
  };
}

export default useDayEndCare;
