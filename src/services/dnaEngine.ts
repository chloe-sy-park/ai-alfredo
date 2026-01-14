// DNA 확장 엔진
// "작은 DNA 하나로 화성연쇄살인범을 잡았듯, 캘린더 하나로 사용자의 모든 것을 추론한다"

import { CalendarEvent } from './calendar';
import { DNAInsight } from '../types/chat';

export class DNAExpansionEngine {
  // 크로노타입 (아침형/저녁형) 분석
  static analyzeChronotype(events: CalendarEvent[]): DNAInsight[] {
    var insights: DNAInsight[] = [];
    
    // 첫 일정 시간 분석
    var firstEventTimes = events
      .filter(e => !e.allDay)
      .map(e => new Date(e.start).getHours());
    
    if (firstEventTimes.length > 0) {
      var avgFirstHour = firstEventTimes.reduce((a, b) => a + b, 0) / firstEventTimes.length;
      
      if (avgFirstHour < 9) {
        insights.push({
          type: 'chronotype',
          signal: '첫 일정이 주로 9시 이전',
          inference: '아침형',
          confidence: 3,
          usage: '아침 브리핑 강화, 오전 중요 작업 추천'
        });
      } else if (avgFirstHour >= 10) {
        insights.push({
          type: 'chronotype',
          signal: '첫 일정이 주로 10시 이후',
          inference: '저녁형',
          confidence: 3,
          usage: '오후/저녁 집중 시간 추천, 아침은 가볍게'
        });
      }
    }
    
    // 저녁 일정 분석
    var eveningEvents = events.filter(e => {
      var hour = new Date(e.start).getHours();
      return hour >= 19;
    });
    
    if (eveningEvents.length > events.length * 0.3) {
      insights.push({
        type: 'chronotype',
        signal: '저녁 7시 이후 일정 많음',
        inference: '저녁형',
        confidence: 2,
        usage: '저녁 시간 활용 제안'
      });
    }
    
    return insights;
  }
  
  // 에너지 패턴 분석
  static analyzeEnergyPattern(events: CalendarEvent[]): DNAInsight[] {
    var insights: DNAInsight[] = [];
    
    // 연속 미팅 패턴 분석
    var sortedEvents = [...events].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    
    for (var i = 0; i < sortedEvents.length - 2; i++) {
      var current = sortedEvents[i];
      var next1 = sortedEvents[i + 1];
      var next2 = sortedEvents[i + 2];
      
      // 3개 연속 미팅 체크
      if (current.title.includes('미팅') && 
          next1.title.includes('미팅') && 
          next2.title.includes('미팅')) {
        
        var endTime = new Date(next2.end);
        var afterMeeting = sortedEvents.find(e => 
          new Date(e.start) > endTime && 
          new Date(e.start).getTime() - endTime.getTime() < 2 * 60 * 60 * 1000 // 2시간 이내
        );
        
        if (!afterMeeting) {
          insights.push({
            type: 'energy',
            signal: '미팅 3개 연속 후 빈 시간',
            inference: '미팅 후 회복 필요',
            confidence: 3,
            usage: '연속 미팅 후 휴식 시간 자동 확보 제안'
          });
          break;
        }
      }
    }
    
    // 점심 후 패턴
    var afternoonEvents = events.filter(e => {
      var hour = new Date(e.start).getHours();
      return hour >= 13 && hour <= 15;
    });
    
    if (afternoonEvents.length < events.length * 0.1) {
      insights.push({
        type: 'energy',
        signal: '점심 후 일정 적음',
        inference: '오후 슬럼프',
        confidence: 2,
        usage: '오후 1-3시 가벼운 작업 추천'
      });
    }
    
    return insights;
  }
  
  // 업무 스타일 분석
  static analyzeWorkStyle(events: CalendarEvent[]): DNAInsight[] {
    var insights: DNAInsight[] = [];
    
    // 미팅 비율 계산
    // 참석자 수가 없으므로 제목으로만 판단
    var meetingEvents = events.filter(e => 
      e.title.includes('미팅') || 
      e.title.includes('회의') || 
      e.title.includes('meeting') ||
      e.title.includes('Meeting') ||
      e.title.includes('sync') ||
      e.title.includes('1:1')
    );
    
    var meetingRatio = meetingEvents.length / events.length;
    
    if (meetingRatio > 0.6) {
      insights.push({
        type: 'workstyle',
        signal: '미팅 비율 > 60%',
        inference: '협업 중심',
        confidence: 3,
        usage: '미팅 준비/정리 시간 확보 중요'
      });
    } else if (meetingRatio < 0.3) {
      insights.push({
        type: 'workstyle',
        signal: '미팅 비율 < 30%',
        inference: '독립 작업 중심',
        confidence: 3,
        usage: '집중 시간 블록 확보 우선'
      });
    }
    
    // 1:1 미팅 분석 (제목에 1:1이 포함된 경우)
    var oneOnOnes = meetingEvents.filter(e => e.title.includes('1:1'));
    if (oneOnOnes.length > meetingEvents.length * 0.3) {
      insights.push({
        type: 'workstyle',
        signal: '1:1 미팅 많음',
        inference: '관계 중시 / 매니저',
        confidence: 2,
        usage: '사람별 맥락 관리 중요'
      });
    }
    
    return insights;
  }
  
  // 스트레스 신호 감지
  static detectStressSignals(
    events: CalendarEvent[], 
    previousEvents?: CalendarEvent[]
  ): DNAInsight[] {
    var insights: DNAInsight[] = [];
    
    // 주말 업무 체크
    var weekendWork = events.filter(e => {
      var day = new Date(e.start).getDay();
      return (day === 0 || day === 6) && 
             (e.title.includes('업무') || e.title.includes('작업') || 
              e.title.includes('work') || e.title.includes('Work'));
    });
    
    if (weekendWork.length > 0) {
      insights.push({
        type: 'stress',
        signal: '주말 업무 일정 등장',
        inference: '과부하',
        confidence: 3,
        usage: '번아웃 경고, 휴식 강조'
      });
    }
    
    // 취소 빈도 체크 - 취소된 이벤트는 무시 (상태 필드가 없음)
    
    return insights;
  }
  
  // 종합 분석
  static analyzeCalendar(
    events: CalendarEvent[],
    previousEvents?: CalendarEvent[]
  ): DNAInsight[] {
    var allInsights: DNAInsight[] = [];
    
    // 각 분석 실행
    allInsights.push(...this.analyzeChronotype(events));
    allInsights.push(...this.analyzeEnergyPattern(events));
    allInsights.push(...this.analyzeWorkStyle(events));
    allInsights.push(...this.detectStressSignals(events, previousEvents));
    
    // 중복 제거 및 정렬 (확신도 높은 순)
    var uniqueInsights = allInsights.filter((insight, index, self) =>
      index === self.findIndex(i => 
        i.type === insight.type && i.inference === insight.inference
      )
    );
    
    return uniqueInsights.sort((a, b) => b.confidence - a.confidence);
  }
  
  // 인사이트 기반 브리핑 개인화
  static personalizeBriefing(
    insights: DNAInsight[],
    baseMessage: string
  ): string {
    var personalizedMessage = baseMessage;
    
    // 크로노타입 반영
    var chronotype = insights.find(i => i.type === 'chronotype');
    if (chronotype?.inference === '저녁형') {
      personalizedMessage = personalizedMessage.replace(
        '아침',
        '오후'
      );
    }
    
    // 스트레스 반영
    var stress = insights.find(i => i.type === 'stress');
    if (stress) {
      personalizedMessage += '\n\n💜 무리하지 마세요. 오늘은 꼭 필요한 것만 하고 쉬어요.';
    }
    
    return personalizedMessage;
  }
}
