import { useState, useCallback } from 'react';
import { dnaEngine, DNAProfile, DNABasedSuggestion, CalendarEvent } from '../services/dna';
import { useAuthStore } from '../stores/authStore';

/**
 * DNA 엔진 훅
 * 캘린더 데이터를 분석하고 인사이트를 제공
 */
export function useDNAEngine() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<DNAProfile | null>(null);
  const [suggestions, setSuggestions] = useState<DNABasedSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<'day1' | 'week1' | 'week2'>('day1');

  /**
   * 캘린더 데이터 분석 실행
   */
  const analyzeCalendar = useCallback(async (events: CalendarEvent[]) => {
    if (!user?.id) return;
    
    setIsAnalyzing(true);
    try {
      const result = dnaEngine.analyzeCalendar(user.id, events);
      setProfile(result);
      
      // 분석된 데이터 양에 따라 페이즈 결정
      const daysSinceFirstEvent = result.analyzedEventsCount > 0
        ? Math.floor((Date.now() - result.dataRangeStart.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      let phase: 'day1' | 'week1' | 'week2' = 'day1';
      if (daysSinceFirstEvent >= 14) {
        phase = 'week2';
      } else if (daysSinceFirstEvent >= 7) {
        phase = 'week1';
      }
      setAnalysisPhase(phase);
      
      // 제안 생성
      const newSuggestions = dnaEngine.generateSuggestions(phase);
      setSuggestions(newSuggestions);
      
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.id]);

  /**
   * 아침 브리핑 메시지 가져오기
   */
  const getMorningBriefing = useCallback((todayEvents: number, nextMeeting?: { title: string; time: string }) => {
    return dnaEngine.getMorningBriefing(todayEvents, nextMeeting);
  }, []);

  /**
   * 저녁 메시지 가져오기
   */
  const getEveningMessage = useCallback((completedTasks: number, totalTasks: number) => {
    return dnaEngine.getEveningMessage(completedTasks, totalTasks);
  }, []);

  /**
   * 스트레스 레벨 가져오기
   */
  const getStressLevel = useCallback(() => {
    return dnaEngine.getStressLevel();
  }, []);

  /**
   * 집중 시간 추천 가져오기
   */
  const getBestFocusTime = useCallback(() => {
    return dnaEngine.getBestFocusTime();
  }, []);

  /**
   * 피크 시간대 가져오기
   */
  const getPeakHours = useCallback(() => {
    return dnaEngine.getPeakHours();
  }, []);

  /**
   * 크로노타입 가져오기
   */
  const getChronotype = useCallback(() => {
    return dnaEngine.getChronotype();
  }, []);

  return {
    // 상태
    profile,
    suggestions,
    isAnalyzing,
    analysisPhase,
    
    // 액션
    analyzeCalendar,
    
    // 메시지 생성
    getMorningBriefing,
    getEveningMessage,
    
    // 인사이트 접근
    getStressLevel,
    getBestFocusTime,
    getPeakHours,
    getChronotype,
  };
}

/**
 * DNA 기반 개인화된 추천 훅
 */
export function useDNARecommendations() {
  const { profile, getPeakHours, getStressLevel } = useDNAEngine();
  
  /**
   * 현재 시간이 피크 시간인지 확인
   */
  const isCurrentlyPeakTime = useCallback(() => {
    const peakHours = getPeakHours();
    const currentHour = new Date().getHours();
    return peakHours.includes(currentHour);
  }, [getPeakHours]);

  /**
   * 현재 상태에 맞는 태스크 유형 추천
   */
  const getRecommendedTaskType = useCallback((): 'deep_work' | 'light_work' | 'break' => {
    const peakHours = getPeakHours();
    const stressLevel = getStressLevel();
    const currentHour = new Date().getHours();
    
    // 스트레스 높으면 가벼운 작업 추천
    if (stressLevel === 'burnout' || stressLevel === 'high') {
      return 'light_work';
    }
    
    // 피크 시간이면 딥워크
    if (peakHours.includes(currentHour)) {
      return 'deep_work';
    }
    
    // 오후 슬럼프 시간 (13-15시)
    if (currentHour >= 13 && currentHour <= 15) {
      return 'light_work';
    }
    
    return 'deep_work';
  }, [getPeakHours, getStressLevel]);

  /**
   * 브리핑 톤 결정
   */
  const getBriefingTone = useCallback((): 'energetic' | 'gentle' | 'supportive' => {
    const stressLevel = getStressLevel();
    
    if (stressLevel === 'burnout') return 'supportive';
    if (stressLevel === 'high') return 'gentle';
    return 'energetic';
  }, [getStressLevel]);

  return {
    profile,
    isCurrentlyPeakTime,
    getRecommendedTaskType,
    getBriefingTone,
  };
}
