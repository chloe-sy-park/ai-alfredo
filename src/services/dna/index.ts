// DNA 확장 엔진 내보내기
export * from './types';
export { CalendarAnalyzer } from './calendarAnalyzer';
export { DNAMessageGenerator } from './messageGenerator';

// 새로 추가된 모듈
export * from './eventClassifier';
export * from './todayAnalyzer';
export * from './insightToAction';

import { CalendarAnalyzer } from './calendarAnalyzer';
import { DNAMessageGenerator } from './messageGenerator';
import { CalendarEvent, DNAProfile, DNABasedSuggestion, TodayContext, SpecialEventAlert, BurnoutWarning, AlfredoAction } from './types';
import { classifyEvents, predictDailyEnergyDrain } from './eventClassifier';
import { analyzeTodayContext, detectSpecialEvents, analyzeBurnoutRisk, generateContextMessage } from './todayAnalyzer';
import { getRecommendedActions, determineBriefingTone, getRandomGreeting, formatWithConfidence, insightToNaturalLanguage } from './insightToAction';

/**
 * DNA 엔진 메인 클래스
 * 캘린더 데이터를 분석하고 인사이트를 생성하는 통합 인터페이스
 */
export class DNAEngine {
  private profile: DNAProfile | null = null;
  private messageGenerator: DNAMessageGenerator | null = null;
  private todayContext: TodayContext | null = null;
  private events: CalendarEvent[] = [];

  /**
   * 캘린더 데이터로 DNA 프로필 생성
   */
  analyzeCalendar(userId: string, events: CalendarEvent[]): DNAProfile {
    this.events = events;
    const analyzer = new CalendarAnalyzer(events);
    this.profile = analyzer.analyze(userId);
    this.messageGenerator = new DNAMessageGenerator(this.profile);
    
    // 오늘 컨텍스트도 함께 분석
    this.todayContext = analyzeTodayContext(events, this.profile);
    
    return this.profile;
  }

  /**
   * 현재 프로필 가져오기
   */
  getProfile(): DNAProfile | null {
    return this.profile;
  }

  /**
   * 오늘 컨텍스트 가져오기
   */
  getTodayContext(): TodayContext | null {
    if (!this.todayContext && this.events.length > 0) {
      this.todayContext = analyzeTodayContext(this.events, this.profile || undefined);
    }
    return this.todayContext;
  }

  /**
   * 오늘 컨텍스트 새로고침
   */
  refreshTodayContext(): TodayContext | null {
    if (this.events.length > 0) {
      this.todayContext = analyzeTodayContext(this.events, this.profile || undefined);
    }
    return this.todayContext;
  }

  /**
   * 분석 결과 기반 메시지 생성
   */
  generateSuggestions(phase: 'day1' | 'week1' | 'week2'): DNABasedSuggestion[] {
    if (!this.messageGenerator) return [];

    switch (phase) {
      case 'day1':
        return this.messageGenerator.generateDay1Messages();
      case 'week1':
        return [
          ...this.messageGenerator.generateWeek1Messages(),
          ...this.messageGenerator.generateStressMessages()
        ];
      case 'week2':
        return [
          ...this.messageGenerator.generateWeek2Messages(),
          ...this.messageGenerator.generateStressMessages(),
          ...this.messageGenerator.generateWorkLifeBalanceMessages()
        ];
    }
  }

  /**
   * 아침 브리핑 메시지 생성
   */
  getMorningBriefing(todayEvents: number, nextMeeting?: { title: string; time: string }): string {
    if (!this.messageGenerator) {
      return `좋은 아침이에요! 오늘 일정 ${todayEvents}개 있어요.`;
    }
    return this.messageGenerator.generateMorningBriefing(todayEvents, nextMeeting);
  }

  /**
   * 저녁 마무리 메시지 생성
   */
  getEveningMessage(completedTasks: number, totalTasks: number): string {
    if (!this.messageGenerator) {
      return '오늘 하루 수고했어요!';
    }
    return this.messageGenerator.generateEveningMessage(completedTasks, totalTasks);
  }

  /**
   * 현재 스트레스 레벨 확인
   */
  getStressLevel(): 'low' | 'medium' | 'high' | 'burnout' | null {
    return this.profile?.stressIndicators.level || null;
  }

  /**
   * 집중 시간 추천
   */
  getBestFocusTime(): { day: string; time: string } | null {
    if (!this.profile || this.profile.focusTime.bestSlots.length === 0) {
      return null;
    }
    
    const slot = this.profile.focusTime.bestSlots[0];
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    
    return {
      day: dayNames[slot.dayOfWeek],
      time: `${slot.startHour}시-${slot.endHour}시`
    };
  }

  /**
   * 피크 시간대 가져오기
   */
  getPeakHours(): number[] {
    return this.profile?.energyPattern.peakHours || [];
  }

  /**
   * 크로노타입 가져오기
   */
  getChronotype(): 'morning' | 'evening' | 'neutral' | null {
    return this.profile?.chronotype.type || null;
  }

  // ========== 새로 추가된 메서드 ==========

  /**
   * 특별 이벤트 알림 가져오기 (발표, 마감 등)
   */
  getSpecialAlerts(daysAhead: number = 3): SpecialEventAlert[] {
    return detectSpecialEvents(this.events, daysAhead);
  }

  /**
   * 번아웃 경고 분석
   */
  getBurnoutWarning(): BurnoutWarning {
    return analyzeBurnoutRisk(this.events, this.profile || undefined);
  }

  /**
   * 오늘 에너지 소모 예측 (0-100)
   */
  getTodayEnergyDrain(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = this.events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate >= today && eventDate < tomorrow;
    });
    
    return predictDailyEnergyDrain(classifyEvents(todayEvents));
  }

  /**
   * 현재 상태 기반 추천 액션 가져오기
   */
  getRecommendedActions(): AlfredoAction[] {
    const context = this.getTodayContext();
    if (!context) return [];
    return getRecommendedActions(this.profile, context);
  }

  /**
   * 브리핑 톤 결정
   */
  getBriefingTone(): 'energetic' | 'gentle' | 'supportive' {
    const context = this.getTodayContext();
    if (!context) return 'gentle';
    return determineBriefingTone(this.profile, context);
  }

  /**
   * 컨텍스트 기반 인사말
   */
  getContextGreeting(): string {
    const context = this.getTodayContext();
    if (!context) return '안녕하세요!';
    return getRandomGreeting(this.profile, context);
  }

  /**
   * 컨텍스트 기반 상황 메시지
   */
  getContextMessage(): string {
    const context = this.getTodayContext();
    if (!context) return '';
    return generateContextMessage(context);
  }

  /**
   * 오늘 바쁜 정도 가져오기
   */
  getTodayBusyLevel(): 'light' | 'normal' | 'heavy' | 'extreme' | null {
    return this.todayContext?.busyLevel || null;
  }

  /**
   * 워라밸 상태 가져오기
   */
  getWorkLifeBalance(): 'good' | 'moderate' | 'poor' | null {
    return this.profile?.workLifeBalance.status || null;
  }

  /**
   * 미팅 비율 가져오기
   */
  getMeetingRatio(): number {
    return this.profile?.workStyle.meetingRatio || 0;
  }

  /**
   * 확신도 기반 문장 포맷
   */
  formatWithConfidence(statement: string, confidence: 1 | 2 | 3): string {
    return formatWithConfidence(statement, confidence);
  }

  /**
   * 인사이트를 자연어로 변환
   */
  insightToText(type: string, value: any, confidence: 1 | 2 | 3): string {
    return insightToNaturalLanguage(type as any, value, confidence);
  }
}

// 싱글톤 인스턴스
export const dnaEngine = new DNAEngine();
