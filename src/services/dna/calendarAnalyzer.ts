import { 
  CalendarEvent, 
  DNAProfile, 
  ConfidenceLevel,
  Chronotype,
  WorkStyle,
  StressLevel,
  WorkLifeBalance,
  TimeSlot,
  AnalysisOptions 
} from './types';

/**
 * 캐린더 데이터를 분석하여 DNA 프로필을 생성하는 엔진
 */
export class CalendarAnalyzer {
  private events: CalendarEvent[] = [];
  private options: AnalysisOptions;

  constructor(events: CalendarEvent[], options?: Partial<AnalysisOptions>) {
    this.events = events;
    this.options = {
      includeRecurring: true,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
        end: new Date()
      },
      minEventsRequired: 10,
      ...options
    };
  }

  /**
   * 전체 DNA 프로필 생성
   */
  analyze(userId: string): DNAProfile {
    const filteredEvents = this.filterEvents();
    
    return {
      userId,
      chronotype: this.analyzeChronotype(filteredEvents),
      energyPattern: this.analyzeEnergyPattern(filteredEvents),
      workStyle: this.analyzeWorkStyle(filteredEvents),
      stressIndicators: this.analyzeStressIndicators(filteredEvents),
      workLifeBalance: this.analyzeWorkLifeBalance(filteredEvents),
      focusTime: this.analyzeFocusTime(filteredEvents),
      weekdayPatterns: this.analyzeWeekdayPatterns(filteredEvents),
      analyzedEventsCount: filteredEvents.length,
      dataRangeStart: this.options.dateRange.start,
      dataRangeEnd: this.options.dateRange.end,
      lastAnalyzedAt: new Date(),
      version: 1
    };
  }

  private filterEvents(): CalendarEvent[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate >= this.options.dateRange.start &&
        eventDate <= this.options.dateRange.end &&
        event.status !== 'cancelled' &&
        (this.options.includeRecurring || !event.isRecurring)
      );
    });
  }

  /**
   * 크로노타입 분석 (아침형/저녁형)
   */
  private analyzeChronotype(events: CalendarEvent[]): DNAProfile['chronotype'] {
    const firstEventTimes: number[] = [];
    
    // 일별 첫 일정 시간 수집
    const eventsByDay = this.groupEventsByDay(events);
    
    for (const dayEvents of Object.values(eventsByDay)) {
      const workEvents = dayEvents.filter(e => !e.isAllDay);
      if (workEvents.length > 0) {
        const earliest = workEvents.reduce((min, e) => 
          new Date(e.start) < new Date(min.start) ? e : min
        );
        firstEventTimes.push(new Date(earliest.start).getHours() + 
          new Date(earliest.start).getMinutes() / 60);
      }
    }

    if (firstEventTimes.length < 5) {
      return {
        type: 'neutral',
        confidence: 1,
        firstEventAvgTime: '09:00'
      };
    }

    const avgFirstEvent = firstEventTimes.reduce((a, b) => a + b, 0) / firstEventTimes.length;
    const avgHour = Math.floor(avgFirstEvent);
    const avgMin = Math.round((avgFirstEvent - avgHour) * 60);

    let type: Chronotype = 'neutral';
    let confidence: ConfidenceLevel = 2;

    if (avgFirstEvent < 9) {
      type = 'morning';
      confidence = avgFirstEvent < 8 ? 3 : 2;
    } else if (avgFirstEvent > 10) {
      type = 'evening';
      confidence = avgFirstEvent > 11 ? 3 : 2;
    }

    return {
      type,
      confidence,
      firstEventAvgTime: `${String(avgHour).padStart(2, '0')}:${String(avgMin).padStart(2, '0')}`
    };
  }

  /**
   * 에너지 패턴 분석
   */
  private analyzeEnergyPattern(events: CalendarEvent[]): DNAProfile['energyPattern'] {
    const hourlyEventCount: number[] = new Array(24).fill(0);
    const meetingEndTimes: Date[] = [];

    events.forEach(event => {
      if (!event.isAllDay) {
        const startHour = new Date(event.start).getHours();
        hourlyEventCount[startHour]++;
        
        // 미팅 종료 시간 수집
        if (this.isMeeting(event)) {
          meetingEndTimes.push(new Date(event.end));
        }
      }
    });

    // 피크 시간 찾기 (상위 3시간)
    const sortedHours = hourlyEventCount
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.hour >= 8 && h.hour <= 20) // 업무 시간만
      .sort((a, b) => b.count - a.count);

    const peakHours = sortedHours.slice(0, 3).map(h => h.hour);
    
    // 슬럼프 시간 찾기 (일정이 적은 시간, 주로 13-15시)
    const lowHours = sortedHours
      .filter(h => h.hour >= 12 && h.hour <= 16)
      .slice(-2)
      .map(h => h.hour);

    return {
      peakHours,
      lowHours: lowHours.length > 0 ? lowHours : [14, 15],
      recoveryNeededAfterMeetings: 30, // 기본값, 추후 학습
      confidence: events.length >= 30 ? 3 : events.length >= 15 ? 2 : 1
    };
  }

  /**
   * 업무 스타일 분석
   */
  private analyzeWorkStyle(events: CalendarEvent[]): DNAProfile['workStyle'] {
    const workEvents = events.filter(e => e.calendarType === 'work' || e.calendarType === 'unknown');
    const meetings = workEvents.filter(e => this.isMeeting(e));
    const meetingRatio = workEvents.length > 0 
      ? Math.round((meetings.length / workEvents.length) * 100) 
      : 0;

    const recurringCount = events.filter(e => e.isRecurring).length;
    const prefersRoutine = recurringCount / events.length > 0.3;

    let type: WorkStyle = 'balanced';
    if (meetingRatio > 60) type = 'collaborative';
    else if (meetingRatio < 30) type = 'independent';

    return {
      type,
      meetingRatio,
      prefersSoloWork: meetingRatio < 40,
      prefersRoutine,
      confidence: workEvents.length >= 20 ? 3 : workEvents.length >= 10 ? 2 : 1
    };
  }

  /**
   * 스트레스 지표 분석
   */
  private analyzeStressIndicators(events: CalendarEvent[]): DNAProfile['stressIndicators'] {
    const cancelledEvents = this.events.filter(e => e.status === 'cancelled');
    const recentCancellations = cancelledEvents.filter(e => {
      const daysSince = (Date.now() - new Date(e.updatedAt || e.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;

    // 주말 업무 일수
    const weekendWorkDays = this.countWeekendWorkDays(events);

    // 하루 평균 빈 시간 계산
    const averageFreeTimePerDay = this.calculateAverageFreeTime(events);

    let level: StressLevel = 'low';
    if (recentCancellations >= 5 || weekendWorkDays >= 3 || averageFreeTimePerDay < 60) {
      level = 'burnout';
    } else if (recentCancellations >= 3 || weekendWorkDays >= 2 || averageFreeTimePerDay < 120) {
      level = 'high';
    } else if (recentCancellations >= 1 || weekendWorkDays >= 1 || averageFreeTimePerDay < 180) {
      level = 'medium';
    }

    return {
      level,
      recentCancellations,
      weekendWorkDays,
      averageFreeTimePerDay,
      confidence: events.length >= 20 ? 3 : 2
    };
  }

  /**
   * 워라밸 분석
   */
  private analyzeWorkLifeBalance(events: CalendarEvent[]): DNAProfile['workLifeBalance'] {
    const personalEvents = events.filter(e => e.calendarType === 'personal');
    const personalEventRatio = events.length > 0 
      ? Math.round((personalEvents.length / events.length) * 100)
      : 0;

    // 야근 일수 (저녁 7시 이후 업무 일정)
    const afterHoursWorkDays = this.countAfterHoursWorkDays(events);

    // 운동/취미 루틴 여부
    const exerciseKeywords = ['운동', '헬스', '요가', '필라테스', '러닝', '수영', 'gym', 'workout', 'exercise'];
    const hasExerciseRoutine = events.some(e => 
      exerciseKeywords.some(keyword => 
        e.title.toLowerCase().includes(keyword.toLowerCase())
      ) && e.isRecurring
    );

    let status: WorkLifeBalance = 'good';
    if (afterHoursWorkDays >= 3 || personalEventRatio < 10) {
      status = 'poor';
    } else if (afterHoursWorkDays >= 1 || personalEventRatio < 20) {
      status = 'moderate';
    }

    return {
      status,
      personalEventRatio,
      afterHoursWorkDays,
      hasExerciseRoutine,
      confidence: events.length >= 20 ? 3 : 2
    };
  }

  /**
   * 집중 시간 분석
   */
  private analyzeFocusTime(events: CalendarEvent[]): DNAProfile['focusTime'] {
    const freeSlots: TimeSlot[] = [];
    const eventsByDay = this.groupEventsByDay(events);

    // 요일별 빈 시간대 찾기
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) { // 평일만
      const dayEvents = Object.entries(eventsByDay)
        .filter(([dateStr]) => new Date(dateStr).getDay() === dayOfWeek)
        .flatMap(([, evts]) => evts);

      // 시간대별 일정 유무 체크
      for (let hour = 8; hour <= 18; hour++) {
        const hasEventAtHour = dayEvents.some(e => {
          const startHour = new Date(e.start).getHours();
          const endHour = new Date(e.end).getHours();
          return hour >= startHour && hour < endHour;
        });

        if (!hasEventAtHour) {
          const existing = freeSlots.find(
            s => s.dayOfWeek === dayOfWeek && s.endHour === hour
          );
          if (existing) {
            existing.endHour = hour + 1;
          } else {
            freeSlots.push({
              dayOfWeek,
              startHour: hour,
              endHour: hour + 1,
              quality: 'good'
            });
          }
        }
      }
    }

    // 2시간 이상 빈 슬롯만 excellent로
    const bestSlots = freeSlots
      .map(slot => ({
        ...slot,
        quality: (slot.endHour - slot.startHour >= 2 ? 'excellent' : 'good') as TimeSlot['quality']
      }))
      .filter(slot => slot.endHour - slot.startHour >= 1)
      .slice(0, 5);

    const totalFreeHours = bestSlots.reduce(
      (sum, slot) => sum + (slot.endHour - slot.startHour), 0
    );

    return {
      bestSlots,
      averageDeepWorkHours: Math.round(totalFreeHours / 5 * 10) / 10, // 하루 평균
      confidence: events.length >= 20 ? 3 : 2
    };
  }

  /**
   * 요일별 패턴 분석
   */
  private analyzeWeekdayPatterns(events: CalendarEvent[]): DNAProfile['weekdayPatterns'] {
    const countByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    const meetingsByDay: number[] = [0, 0, 0, 0, 0, 0, 0];

    events.forEach(event => {
      const day = new Date(event.start).getDay();
      countByDay[day]++;
      if (this.isMeeting(event)) {
        meetingsByDay[day]++;
      }
    });

    // 평일만 고려 (1-5)
    const weekdayIndices = [1, 2, 3, 4, 5];
    const busiestDay = weekdayIndices.reduce((max, day) => 
      countByDay[day] > countByDay[max] ? day : max, 1
    );
    const lightestDay = weekdayIndices.reduce((min, day) => 
      countByDay[day] < countByDay[min] ? day : min, 1
    );

    const avgMeetings = meetingsByDay.slice(1, 6).reduce((a, b) => a + b, 0) / 5;
    const meetingHeavyDays = weekdayIndices.filter(
      day => meetingsByDay[day] > avgMeetings * 1.3
    );

    return {
      busiestDay,
      lightestDay,
      meetingHeavyDays,
      confidence: events.length >= 20 ? 3 : 2
    };
  }

  // ===== Helper Methods =====

  private groupEventsByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
    return events.reduce((acc, event) => {
      const dateStr = new Date(event.start).toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }

  private isMeeting(event: CalendarEvent): boolean {
    const meetingKeywords = [
      '미팅', '회의', 'meeting', 'sync', '1:1', '면담', 
      '스탠드업', 'standup', '전체회의', 'call'
    ];
    const title = event.title.toLowerCase();
    return meetingKeywords.some(kw => title.includes(kw.toLowerCase())) ||
      (event.attendees !== undefined && event.attendees > 1);
  }

  private countWeekendWorkDays(events: CalendarEvent[]): number {
    const weekendDates = new Set<string>();
    events
      .filter(e => e.calendarType !== 'personal')
      .forEach(e => {
        const day = new Date(e.start).getDay();
        if (day === 0 || day === 6) {
          weekendDates.add(new Date(e.start).toISOString().split('T')[0]);
        }
      });
    return weekendDates.size;
  }

  private countAfterHoursWorkDays(events: CalendarEvent[]): number {
    const afterHoursDates = new Set<string>();
    events
      .filter(e => e.calendarType !== 'personal')
      .forEach(e => {
        const hour = new Date(e.start).getHours();
        if (hour >= 19) {
          afterHoursDates.add(new Date(e.start).toISOString().split('T')[0]);
        }
      });
    return afterHoursDates.size;
  }

  private calculateAverageFreeTime(events: CalendarEvent[]): number {
    const eventsByDay = this.groupEventsByDay(events);
    const freeTimes: number[] = [];

    for (const dayEvents of Object.values(eventsByDay)) {
      const workEvents = dayEvents.filter(e => !e.isAllDay);
      const totalBusyMinutes = workEvents.reduce((sum, e) => {
        const duration = (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60);
        return sum + duration;
      }, 0);
      
      // 업무 시간 (9-18, 9시간 = 540분) 기준
      const freeMinutes = Math.max(0, 540 - totalBusyMinutes);
      freeTimes.push(freeMinutes);
    }

    return freeTimes.length > 0 
      ? Math.round(freeTimes.reduce((a, b) => a + b, 0) / freeTimes.length)
      : 540;
  }
}
