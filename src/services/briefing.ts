// Alfredo Briefing Service - DNA 기반 브리핑 생성

import { CalendarEvent } from './calendar';
import { ConditionLevel } from './condition';
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
  var reasons = [];
  
  // 주요 팩터 설명
  intensity.factors.forEach(function(factor) {
    if (factor.includes('meetings:')) {
      var count = factor.split(': ')[1];
      reasons.push('오늘 미팅이 ' + count + '개');
    } else if (factor === 'back-to-back meetings') {
      reasons.push('연속된 미팅');
    } else if (factor.includes('urgent tasks:')) {
      var count = factor.split(': ')[1];
      reasons.push('긴급한 일 ' + count + '개');
    } else if (factor === 'condition: bad') {
      reasons.push('컨디션이 좋지 않음');
    }
  });
  
  if (reasons.length === 0) {
    reasons.push('평범한 일정');
  }
  
  return reasons.join(', ') + '을 고려했어요.';
}

// 사용자 패턴 학습 (추후 구현)
export function learnUserPattern(_history: any[]): UserPattern {
  // TODO: 실제 구현 시 히스토리 분석
  return {
    peakHours: [10, 11, 14, 15],
    averageMeetingCount: 3,
    stressThreshold: 5,
    preferredWorkStyle: 'morning',
    recentStressLevel: 'normal'
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
  | 'habit_checked';

export interface PostActionContext {
  type: PostActionType;
  data?: {
    taskTitle?: string;
    focusTitle?: string;
    condition?: ConditionLevel;
    mode?: 'all' | 'work' | 'life';
    remainingTasks?: number;
    streakCount?: number;
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

    default:
      return {
        headline: '완료됨',
        subline: '',
        duration: 1500,
        tone: 'neutral'
      };
  }
}
