// DNA 확장 엔진 내보내기
export * from './types';
export { CalendarAnalyzer } from './calendarAnalyzer';
export { DNAMessageGenerator } from './messageGenerator';

import { CalendarAnalyzer } from './calendarAnalyzer';
import { DNAMessageGenerator } from './messageGenerator';
import { CalendarEvent, DNAProfile, DNABasedSuggestion } from './types';

/**
 * DNA 엔진 메인 클래스
 * 캘린더 데이터를 분석하고 인사이트를 생성하는 통합 인터페이스
 */
export class DNAEngine {
  private profile: DNAProfile | null = null;
  private messageGenerator: DNAMessageGenerator | null = null;

  /**
   * 캘린더 데이터로 DNA 프로필 생성
   */
  analyzeCalendar(userId: string, events: CalendarEvent[]): DNAProfile {
    const analyzer = new CalendarAnalyzer(events);
    this.profile = analyzer.analyze(userId);
    this.messageGenerator = new DNAMessageGenerator(this.profile);
    return this.profile;
  }

  /**
   * 현재 프로필 가져오기
   */
  getProfile(): DNAProfile | null {
    return this.profile;
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
}

// 싱글톤 인스턴스
export const dnaEngine = new DNAEngine();
