// Alfredo Briefing Service - DNA 기반 브리핑 생성

import { CalendarEvent } from './calendar/calendarService';
import { ConditionLevel } from './condition/conditionService';
import { Task } from './tasks';

export interface BriefingContext {
  currentTime: Date;
  dayOfWeek: string;
  weather?: WeatherData;
  todayCalendar: CalendarEvent[];
  incompleteTasks: Task[];
  condition?: ConditionLevel;
  userPattern?: UserPattern;
}

export interface UserPattern {
  peakHours: number[]; // [10, 11, 14, 15] 등
  averageMeetingCount: number;
  stressThreshold: number;
  preferredWorkStyle: 'morning' | 'afternoon' | 'evening' | 'mixed';
  recentStressLevel: 'low' | 'normal' | 'high';
}

export interface BriefingOutput {
  headline: string;      // 핵심 메시지 (1-2줄)
  subline: string;       // 보조 메시지
  intensity: DayIntensity;
  reasoning: string;     // 판단 근거
  tone: BriefingTone;    // 메시지 톤
  priority?: string;     // 오늘의 우선순위 힌트
}

export interface DayIntensity {
  level: 'light' | 'normal' | 'heavy' | 'overloaded';
  score: number; // 0-100
  factors: string[]; // ['meetings: 5', 'deadline: urgent', 'condition: bad']
}

export type BriefingTone = 'encouraging' | 'supportive' | 'energetic' | 'gentle' | 'urgent';

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  description: string;
  icon: string;
}

// 날씨 상태
var WEATHER_MESSAGES = {
  rainy: ['우산 잊지 마세요', '비 오는 날엔 실내 작업에 집중하기 좋죠'],
  snowy: ['미끄러운 길 조심하세요', '따뜻하게 입으세요'],
  sunny: ['날씨가 좋네요', '잠깐 산책하기 좋은 날이에요'],
  cloudy: ['흐린 날이에요', '실내 조명을 밝게 해보세요'],
  stormy: ['폭풍우 조심하세요', '외출을 삼가세요']
};

// 요일별 메시지
var DAY_MESSAGES: { [key: string]: string } = {
  월요일: '새로운 한 주',
  화요일: '본격적인 시작',
  수요일: '중간 지점',
  목요일: '조금만 더',
  금요일: '마지막 스퍼트',
  토요일: '주말의 시작',
  일요일: '충전의 시간'
};

// 하루 강도 계산
export function assessDayIntensity(context: BriefingContext): DayIntensity {
  var factors: string[] = [];
  var score = 0;
  
  // 일정 수 (description이나 location에 특정 키워드가 있으면 미팅으로 간주)
  var meetingCount = context.todayCalendar.filter(function(e) {
    return e.title.includes('미팅') || 
           e.title.includes('회의') || 
           e.location?.includes('회의실') ||
           e.description?.includes('미팅');
  }).length;
  
  if (meetingCount >= 5) {
    score += 40;
    factors.push('meetings: ' + meetingCount);
  } else if (meetingCount >= 3) {
    score += 20;
    factors.push('meetings: ' + meetingCount);
  }
  
  // 연속 미팅 체크
  var hasBackToBack = checkBackToBackMeetings(context.todayCalendar);
  if (hasBackToBack) {
    score += 20;
    factors.push('back-to-back meetings');
  }
  
  // 빈 시간 계산
  var freeHours = calculateFreeHours(context.todayCalendar);
  if (freeHours < 2) {
    score += 20;
    factors.push('low free time: ' + freeHours + 'h');
  }
  
  // 미완료 태스크
  var urgentTasks = context.incompleteTasks.filter(function(t) {
    return t.priority === 'high' || isToday(t.dueDate);
  }).length;
  
  if (urgentTasks >= 3) {
    score += 20;
    factors.push('urgent tasks: ' + urgentTasks);
  }
  
  // 컨디션 반영
  if (context.condition === 'bad') {
    score += 20;
    factors.push('condition: bad');
  } else if (context.condition === 'great') {
    score -= 10;
    factors.push('condition: great');
  }
  
  // 레벨 결정
  var level: DayIntensity['level'];
  if (score >= 80) level = 'overloaded';
  else if (score >= 60) level = 'heavy';
  else if (score >= 30) level = 'normal';
  else level = 'light';
  
  return { level: level, score: score, factors: factors };
}

// 연속 미팅 체크
function checkBackToBackMeetings(calendar: CalendarEvent[]): boolean {
  var sorted = calendar.slice().sort(function(a, b) {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  for (var i = 0; i < sorted.length - 1; i++) {
    var end = new Date(sorted[i].end);
    var nextStart = new Date(sorted[i + 1].start);
    var gap = (nextStart.getTime() - end.getTime()) / 1000 / 60; // 분
    
    if (gap <= 15) return true;
  }
  
  return false;
}

// 빈 시간 계산 (9-18시 기준)
function calculateFreeHours(calendar: CalendarEvent[]): number {
  var workStart = 9;
  var workEnd = 18;
  var totalWorkHours = workEnd - workStart;
  
  var busyMinutes = 0;
  calendar.forEach(function(event) {
    var start = new Date(event.start);
    var end = new Date(event.end);
    var startHour = start.getHours() + start.getMinutes() / 60;
    var endHour = end.getHours() + end.getMinutes() / 60;
    
    if (endHour > workStart && startHour < workEnd) {
      var effectiveStart = Math.max(startHour, workStart);
      var effectiveEnd = Math.min(endHour, workEnd);
      busyMinutes += (effectiveEnd - effectiveStart) * 60;
    }
  });
  
  return Math.max(0, totalWorkHours - busyMinutes / 60);
}

// 오늘 날짜인지 체크
function isToday(date?: string): boolean {
  if (!date) return false;
  var today = new Date();
  var target = new Date(date);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

// 톤 결정
function decideTone(intensity: DayIntensity, context: BriefingContext): BriefingTone {
  // 컨디션 나쁘면 supportive
  if (context.condition === 'bad') return 'supportive';
  
  // 긴급한 일 많으면 urgent
  if (intensity.level === 'overloaded') return 'urgent';
  
  // 아침이면 energetic
  var hour = context.currentTime.getHours();
  if (hour < 10 && intensity.level !== 'heavy') return 'energetic';
  
  // 저녁이면 gentle
  if (hour >= 18) return 'gentle';
  
  // 기본은 encouraging
  return 'encouraging';
}

// 메인 브리핑 생성 함수
export function generateBriefing(context: BriefingContext): BriefingOutput {
  var intensity = assessDayIntensity(context);
  var tone = decideTone(intensity, context);
  
  // 헤드라인 생성
  var headline = generateHeadline(intensity, context, tone);
  var subline = generateSubline(intensity, context, tone);
  
  // 우선순위 힌트
  var priority: string | undefined;
  if (intensity.level === 'overloaded' || intensity.level === 'heavy') {
    priority = '가장 중요한 3개만 집중하세요';
  }
  
  // 판단 근거
  var reasoning = generateReasoning(intensity, context);
  
  return {
    headline: headline,
    subline: subline,
    intensity: intensity,
    reasoning: reasoning,
    tone: tone,
    priority: priority
  };
}

// 헤드라인 생성
function generateHeadline(intensity: DayIntensity, context: BriefingContext, tone: BriefingTone): string {
  var hour = context.currentTime.getHours();
  
  // 컨디션 최우선
  if (context.condition === 'bad') {
    return '오늘은 무리하지 않는 게 가장 생산적이에요';
  }
  
  // 강도별 메시지
  switch (intensity.level) {
    case 'overloaded':
      return '오늘 정말 바쁜 날이에요. 우선순위에만 집중하세요';
      
    case 'heavy':
      if (tone === 'supportive') {
        return '바쁜 하루지만, 하나씩 해결하면 돼요';
      } else {
        return '오늘 좀 바빠요. 페이스 조절이 중요해요';
      }
      
    case 'light':
      if (hour < 12) {
        return '여유로운 하루예요. 미뤄둔 일 처리하기 좋아요';
      } else {
        return '오늘은 좀 한가해요. 내일 준비해볼까요?';
      }
      
    default:
      // 시간대별 기본 메시지
      if (hour < 10) {
        return '좋은 아침이에요! 오늘 하루 잘 시작해봐요';
      } else if (hour < 14) {
        return '지금이 가장 집중하기 좋은 시간이에요';
      } else if (hour < 18) {
        return '오후도 힘내요! 조금만 더 하면 돼요';
      } else {
        return '오늘도 수고했어요. 이제 마무리할 시간이에요';
      }
  }
}

// 서브라인 생성
function generateSubline(intensity: DayIntensity, context: BriefingContext, _tone: BriefingTone): string {
  // 날씨 언급
  if (context.weather && (context.weather.condition === 'rainy' || context.weather.condition === 'snowy')) {
    var weatherMsg = WEATHER_MESSAGES[context.weather.condition];
    return weatherMsg[0] + ' ' + context.weather.icon;
  }
  
  // 강도별 조언
  switch (intensity.level) {
    case 'overloaded':
      return '모든 걸 다 하려고 하지 마세요 🎯';
      
    case 'heavy':
      return '중간중간 쉬는 것도 일의 일부예요 ☕';
      
    case 'light':
      return '여유가 있을 때 미래를 준비하세요 ✨';
      
    default:
      // 요일별 메시지
      return DAY_MESSAGES[context.dayOfWeek] + '이에요 💪';
  }
}

// 판단 근거 생성
function generateReasoning(intensity: DayIntensity, _context: BriefingContext): string {
  var reasons: string[] = [];

  // 주요 팩터 설명
  intensity.factors.forEach(function(factor) {
    if (factor.includes('meetings:')) {
      var count = factor.split(': ')[1];
      reasons.push('오늘 미팅이 ' + count + '개');
    } else if (factor === 'back-to-back meetings') {
      reasons.push('연속된 미팅');
    } else if (factor.includes('urgent tasks:')) {
      var taskCount = factor.split(': ')[1];
      reasons.push('긴급한 일 ' + taskCount + '개');
    } else if (factor === 'condition: bad') {
      reasons.push('컨디션이 좋지 않음');
    }
  });

  if (reasons.length === 0) {
    reasons.push('평범한 일정');
  }

  return reasons.join(', ') + '을 고려했어요.';
}

// ========================================
// PRD Phase 3: 판단 설명 (Default: 1줄 요약 + Expand: 상세 근거)
// 알프레도는 "정리하는 멘토" - 설명 과잉 ❌, 설명 안함 ❌
// ========================================

export interface JudgmentExplanation {
  why: string;          // 💡 Why this is #1 - 왜 이것이 최우선인지
  whatChanged: string;  // 🔄 What changed today - 오늘 바뀐 점
  tradeOff: string;     // ⚖️ Trade-off - 선택의 트레이드오프
}

// 판단 설명 생성 (MoreSheet용)
export function generateJudgmentExplanation(context: BriefingContext): JudgmentExplanation {
  var intensity = assessDayIntensity(context);
  var hour = context.currentTime.getHours();

  // 1. Why this is #1 - 현재 판단의 핵심 이유
  var why = generateWhyExplanation(intensity, context, hour);

  // 2. What changed today - 오늘의 변화 요소
  var whatChanged = generateWhatChangedExplanation(intensity, context);

  // 3. Trade-off - 이 선택의 트레이드오프
  var tradeOff = generateTradeOffExplanation(intensity, context);

  return { why: why, whatChanged: whatChanged, tradeOff: tradeOff };
}

// Why 설명 생성
function generateWhyExplanation(intensity: DayIntensity, context: BriefingContext, hour: number): string {
  // 컨디션이 안 좋으면 이게 최우선
  if (context.condition === 'bad') {
    return '지금 컨디션이 좋지 않아요. 무리하면 내일까지 영향이 가기 때문에, 오늘은 에너지 관리가 가장 중요해요. 급한 건 최소한만 하고 회복에 집중하는 게 결국 더 생산적이에요.';
  }

  // 과부하 상태
  if (intensity.level === 'overloaded') {
    var meetingFactor = intensity.factors.find(function(f) { return f.includes('meetings:'); });
    var taskFactor = intensity.factors.find(function(f) { return f.includes('urgent tasks:'); });

    if (meetingFactor && taskFactor) {
      return '미팅도 많고 처리해야 할 급한 일도 있어요. 전부 다 하려면 무리가 갈 수 있어서, 가장 중요한 3가지에만 집중하는 게 나아요. 나머지는 내일로 미뤄도 괜찮아요.';
    } else if (meetingFactor) {
      return '오늘 미팅이 정말 많아요. 미팅 사이에 처리할 시간이 거의 없기 때문에, 미팅 전에 꼭 준비해야 할 것만 챙기고, 나머지 업무는 내일로 미루는 게 현명해요.';
    } else {
      return '처리할 일이 많이 몰려있어요. 다 하려고 하면 집중력이 분산되니까, 오늘 꼭 끝내야 하는 것 위주로 정리하는 게 좋아요.';
    }
  }

  // 바쁜 상태
  if (intensity.level === 'heavy') {
    if (intensity.factors.includes('back-to-back meetings')) {
      return '연속된 미팅이 있어서 정신없을 수 있어요. 미팅 사이에 5분이라도 정리하는 시간을 두면 훨씬 나아요.';
    }
    return '바쁜 하루지만 불가능한 수준은 아니에요. 페이스 조절만 잘 하면 충분히 소화할 수 있어요.';
  }

  // 여유로운 상태
  if (intensity.level === 'light') {
    if (hour < 12) {
      return '오늘은 일정이 많지 않아요. 이럴 때 미뤄둔 일을 처리하거나, 내일을 미리 준비해두면 좋아요.';
    }
    return '여유로운 오후예요. 급한 게 없을 때 장기적인 일을 조금씩 진행해보세요.';
  }

  // 일반 상태
  if (hour < 12) {
    return '오전은 집중력이 가장 좋은 시간이에요. 중요한 일을 먼저 처리하면 오후가 훨씬 편해져요.';
  } else if (hour < 18) {
    return '오후에는 집중력이 조금 떨어질 수 있어요. 루틴한 일이나 미팅을 배치하면 좋아요.';
  }
  return '하루 마무리 시간이에요. 내일 시작을 위해 오늘 한 일을 정리하고 내일 계획을 살펴보면 좋아요.';
}

// What Changed 설명 생성
function generateWhatChangedExplanation(intensity: DayIntensity, context: BriefingContext): string {
  var changes: string[] = [];

  // 미팅 수 변화 분석
  var meetingCount = context.todayCalendar.filter(function(e) {
    return e.title.includes('미팅') || e.title.includes('회의');
  }).length;

  if (meetingCount > 3) {
    changes.push('오늘 미팅이 ' + meetingCount + '개로 평소보다 많아요');
  } else if (meetingCount === 0) {
    changes.push('오늘은 미팅이 없어서 집중하기 좋은 날이에요');
  }

  // 컨디션 변화
  if (context.condition === 'bad') {
    changes.push('컨디션이 평소보다 좋지 않네요');
  } else if (context.condition === 'great') {
    changes.push('컨디션이 좋아서 더 많은 걸 할 수 있어요');
  }

  // 연속 미팅
  if (intensity.factors.includes('back-to-back meetings')) {
    changes.push('연속 미팅이 있어서 쉴 틈이 부족해요');
  }

  // 긴급 태스크
  var urgentFactor = intensity.factors.find(function(f) { return f.includes('urgent tasks:'); });
  if (urgentFactor) {
    var urgentCount = urgentFactor.split(': ')[1];
    changes.push('급히 처리해야 할 일이 ' + urgentCount + '개 있어요');
  }

  // 빈 시간
  var freeTimeFactor = intensity.factors.find(function(f) { return f.includes('low free time:'); });
  if (freeTimeFactor) {
    changes.push('일정 사이 여유 시간이 거의 없어요');
  }

  if (changes.length === 0) {
    return '오늘은 특별히 변한 게 없어요. 평소처럼 진행하면 돼요.';
  }

  return changes.join('. ') + '.';
}

// Trade-off 설명 생성
function generateTradeOffExplanation(intensity: DayIntensity, context: BriefingContext): string {
  // 컨디션 안 좋을 때
  if (context.condition === 'bad') {
    return '지금 무리하면 더 많은 걸 할 수 있지만, 내일 컨디션이 더 나빠질 수 있어요. 장기적으로는 오늘 쉬는 게 더 나은 선택이에요.';
  }

  // 과부하 상태
  if (intensity.level === 'overloaded') {
    return '모든 걸 다 하려면 퀄리티가 떨어지거나 야근이 불가피해요. 중요한 것에 집중하면 일부는 못 하지만, 전체적인 결과는 더 좋아요.';
  }

  // 바쁜 상태
  if (intensity.level === 'heavy') {
    return '빡빡하게 다 채우면 시간은 효율적이지만 정신적으로 지칠 수 있어요. 중간중간 쉬면 총량은 줄어도 지속 가능해요.';
  }

  // 여유로운 상태
  if (intensity.level === 'light') {
    return '여유가 있다고 쉬기만 하면 편하지만, 미래 준비가 안 돼요. 지금 조금 투자하면 나중에 더 여유로워져요.';
  }

  // 일반 상태
  return '지금 판단은 균형을 맞춘 거예요. 더 공격적으로 가면 빨라지지만 리스크가 커지고, 보수적으로 가면 안전하지만 느려져요.';
}

// 히스토리 입력 타입
interface PatternHistory {
  calendarEvents?: CalendarEvent[];
  conditionHistory?: { level: ConditionLevel; date: string }[];
  taskHistory?: { completedAt?: string; category?: string }[];
}

// 사용자 패턴 학습 - 히스토리 기반 분석
export function learnUserPattern(history: PatternHistory): UserPattern {
  // 기본값 설정
  var peakHours = [10, 11, 14, 15];
  var averageMeetingCount = 3;
  var stressThreshold = 5;
  var preferredWorkStyle: 'morning' | 'afternoon' | 'evening' | 'mixed' = 'morning';
  var recentStressLevel: 'low' | 'normal' | 'high' = 'normal';

  // 1. 캘린더 이벤트 기반 피크 시간 분석
  if (history.calendarEvents && history.calendarEvents.length > 0) {
    var hourCounts: { [key: number]: number } = {};

    history.calendarEvents.forEach(function(event) {
      if (event.start) {
        var startDate = new Date(event.start);
        var hour = startDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // 가장 많은 이벤트가 있는 시간대 추출 (상위 4개)
    var sortedHours = Object.keys(hourCounts)
      .map(function(h) { return parseInt(h); })
      .sort(function(a, b) { return (hourCounts[b] || 0) - (hourCounts[a] || 0); })
      .slice(0, 4);

    if (sortedHours.length > 0) {
      peakHours = sortedHours;
    }

    // 미팅 평균 계산
    var meetingEvents = history.calendarEvents.filter(function(e) {
      return e.title && (
        e.title.includes('미팅') ||
        e.title.includes('회의') ||
        e.title.includes('meeting')
      );
    });
    if (meetingEvents.length > 0) {
      // 최근 7일 기준 평균
      averageMeetingCount = Math.ceil(meetingEvents.length / 7);
    }

    // 선호 작업 스타일 분석
    var morningCount = 0;
    var afternoonCount = 0;
    var eveningCount = 0;

    history.calendarEvents.forEach(function(event) {
      if (event.start) {
        var hour = new Date(event.start).getHours();
        if (hour >= 6 && hour < 12) morningCount++;
        else if (hour >= 12 && hour < 18) afternoonCount++;
        else eveningCount++;
      }
    });

    if (morningCount > afternoonCount && morningCount > eveningCount) {
      preferredWorkStyle = 'morning';
    } else if (afternoonCount > morningCount && afternoonCount > eveningCount) {
      preferredWorkStyle = 'afternoon';
    } else if (eveningCount > morningCount && eveningCount > afternoonCount) {
      preferredWorkStyle = 'evening';
    } else {
      preferredWorkStyle = 'mixed';
    }
  }

  // 2. 컨디션 히스토리 기반 스트레스 분석
  if (history.conditionHistory && history.conditionHistory.length > 0) {
    var badCount = 0;
    var goodCount = 0;
    var recentConditions = history.conditionHistory.slice(0, 7); // 최근 7일

    recentConditions.forEach(function(c) {
      if (c.level === 'bad') badCount++;
      else if (c.level === 'great' || c.level === 'good') goodCount++;
    });

    // 스트레스 레벨 결정
    if (badCount >= 3) {
      recentStressLevel = 'high';
      stressThreshold = 3; // 스트레스가 높으면 임계치 낮춤
    } else if (goodCount >= 4) {
      recentStressLevel = 'low';
      stressThreshold = 7; // 컨디션이 좋으면 임계치 높임
    } else {
      recentStressLevel = 'normal';
      stressThreshold = 5;
    }
  }

  return {
    peakHours: peakHours,
    averageMeetingCount: averageMeetingCount,
    stressThreshold: stressThreshold,
    preferredWorkStyle: preferredWorkStyle,
    recentStressLevel: recentStressLevel
  };
}

// ========================================
// PRD: PostAction 브리핑 패턴
// 액션 완료 후 즉각적인 피드백 메시지 생성
// ========================================

export type PostActionType =
  | 'task_completed'
  | 'focus_set'
  | 'focus_cleared'
  | 'condition_updated'
  | 'mode_changed'
  | 'memo_saved'
  | 'meeting_minutes_generated'
  | 'habit_checked'
  | 'briefing_feedback';

export interface PostActionContext {
  type: PostActionType;
  data?: {
    taskTitle?: string;
    focusTitle?: string;
    condition?: ConditionLevel;
    mode?: 'all' | 'work' | 'life';
    remainingTasks?: number;
    streakCount?: number;
    feedback?: 'positive' | 'different' | 'skip';
  };
}

export interface PostActionBriefing {
  headline: string;
  subline: string;
  duration: number; // 표시 시간 (ms)
  tone: 'celebration' | 'encouragement' | 'neutral' | 'gentle';
}

// PostAction 브리핑 생성
export function generatePostActionBriefing(context: PostActionContext): PostActionBriefing {
  switch (context.type) {
    case 'task_completed': {
      var remaining = context.data?.remainingTasks || 0;
      var headline = '잘했어요! ✨';
      var subline = remaining > 0
        ? '다음 우선순위로 넘어갈까요? ' + remaining + '개 남았어요'
        : '오늘 할 일을 모두 끝냈어요! 🎉';
      return {
        headline: headline,
        subline: subline,
        duration: 3000,
        tone: 'celebration'
      };
    }

    case 'focus_set': {
      var title = context.data?.focusTitle || '작업';
      return {
        headline: '집중 모드 시작 🎯',
        subline: '"' + title + '"에 집중해볼게요',
        duration: 2500,
        tone: 'encouragement'
      };
    }

    case 'focus_cleared':
      return {
        headline: '집중 세션 종료',
        subline: '수고했어요! 잠시 쉬어가도 좋아요',
        duration: 2500,
        tone: 'gentle'
      };

    case 'condition_updated': {
      var condition = context.data?.condition;
      var conditionMessages: Record<ConditionLevel, { headline: string; subline: string }> = {
        great: {
          headline: '컨디션 좋네요! 💪',
          subline: '이 에너지로 중요한 일을 처리해봐요'
        },
        good: {
          headline: '컨디션 체크 완료',
          subline: '좋은 상태예요. 오늘 일정 그대로 진행해요'
        },
        normal: {
          headline: '컨디션 체크 완료',
          subline: '무리하지 않는 선에서 진행해요'
        },
        bad: {
          headline: '오늘은 쉬어가도 괜찮아요 🌿',
          subline: '급한 것만 처리하고 컨디션 회복에 집중하세요'
        }
      };
      var msg = condition ? conditionMessages[condition] : conditionMessages.normal;
      return {
        headline: msg.headline,
        subline: msg.subline,
        duration: 3000,
        tone: condition === 'bad' ? 'gentle' : 'neutral'
      };
    }

    case 'mode_changed': {
      var mode = context.data?.mode || 'all';
      var modeMessages: Record<string, { headline: string; subline: string }> = {
        all: {
          headline: '전체 보기로 전환',
          subline: 'Work와 Life를 함께 관리해요'
        },
        work: {
          headline: '업무 모드 🖥️',
          subline: '업무에 집중하는 시간이에요'
        },
        life: {
          headline: '라이프 모드 🌸',
          subline: '나를 위한 시간이에요'
        }
      };
      var modeMsg = modeMessages[mode];
      return {
        headline: modeMsg.headline,
        subline: modeMsg.subline,
        duration: 2000,
        tone: 'neutral'
      };
    }

    case 'memo_saved':
      return {
        headline: '메모 저장됨 📝',
        subline: '나중에 다시 볼 수 있어요',
        duration: 2000,
        tone: 'neutral'
      };

    case 'meeting_minutes_generated':
      return {
        headline: '회의록 생성 완료 📋',
        subline: '주요 결정사항과 후속 작업을 정리했어요',
        duration: 3000,
        tone: 'celebration'
      };

    case 'habit_checked': {
      var streak = context.data?.streakCount || 0;
      var streakMsg = streak > 1 ? streak + '일 연속 달성! 🔥' : '오늘도 실천했어요';
      return {
        headline: '습관 체크 완료 ✓',
        subline: streakMsg,
        duration: 2500,
        tone: streak > 3 ? 'celebration' : 'encouragement'
      };
    }

    case 'briefing_feedback': {
      var feedback = context.data?.feedback;
      var feedbackMessages: Record<string, { headline: string; subline: string; tone: 'celebration' | 'encouragement' | 'neutral' | 'gentle' }> = {
        positive: {
          headline: '피드백 감사해요! 💜',
          subline: '앞으로 더 유용한 브리핑을 준비할게요',
          tone: 'celebration'
        },
        different: {
          headline: '알겠어요!',
          subline: '다른 관점으로 다시 생각해볼게요',
          tone: 'neutral'
        },
        skip: {
          headline: '좋아요 👍',
          subline: '필요할 때 언제든 불러주세요',
          tone: 'gentle'
        }
      };
      var fbMsg = feedback ? feedbackMessages[feedback] : feedbackMessages.positive;
      return {
        headline: fbMsg.headline,
        subline: fbMsg.subline,
        duration: 2500,
        tone: fbMsg.tone
      };
    }

    default:
      return {
        headline: '완료됨',
        subline: '',
        duration: 1500,
        tone: 'neutral'
      };
  }
}
