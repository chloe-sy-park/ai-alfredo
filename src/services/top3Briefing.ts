/**
 * Top 3 Briefing Service
 * Claude API를 통해 judgment + actions JSON 출력을 생성
 */

import { CalendarEvent } from './calendar/calendarService';
import { Top3Item } from './top3';
import { useAuthStore } from '../stores/authStore';

// === 타입 정의 ===

export interface Top3JudgmentRequest {
  calendarEvents: CalendarEvent[];
  top3Items: Top3Item[];
  currentTime: string;
  dayOfWeek: string;
  userName?: string;
}

export interface Top3Action {
  type: 'reorder' | 'add' | 'remove' | 'suggest' | 'warn';
  target?: string;
  detail: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Top3JudgmentResponse {
  headline: string;
  reason: string;
  suggestion?: string;
  actions: Top3Action[];
  confidence: number;
}

// === 브리핑 프롬프트 ===

function buildTop3BriefingPrompt(request: Top3JudgmentRequest): string {
  const eventsText = request.calendarEvents.length > 0
    ? request.calendarEvents.map(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}-${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
        return `- ${timeStr}: ${e.title}${e.location ? ' @ ' + e.location : ''}`;
      }).join('\n')
    : '오늘 일정 없음';

  const top3Text = request.top3Items.length > 0
    ? request.top3Items.map((item, idx) => {
        const status = item.completed ? '[완료]' : '[미완료]';
        return `${idx + 1}. ${status} ${item.title}${item.timeRange ? ' (' + item.timeRange + ')' : ''}`;
      }).join('\n')
    : '아직 Top 3가 설정되지 않음';

  return `당신은 알프레도, ADHD 친화적 AI 버틀러입니다.
사용자의 오늘 캘린더와 Top 3를 분석해서 판단과 제안을 해주세요.

## 현재 상황
- 시각: ${request.currentTime}
- 요일: ${request.dayOfWeek}
- 사용자: ${request.userName || '사용자'}님

## 오늘의 캘린더
${eventsText}

## 현재 Top 3
${top3Text}

## 지시사항
1. 캘린더와 Top 3를 비교 분석하세요
2. 우선순위가 적절한지 판단하세요
3. 시간 충돌이나 비효율적인 배치를 찾으세요
4. 구체적인 제안을 해주세요

## 출력 형식 (반드시 JSON으로)
\`\`\`json
{
  "headline": "핵심 판단 한 줄 (15자 이내)",
  "reason": "판단 근거 한 줄 (30자 이내)",
  "suggestion": "구체적 제안 한 줄 (선택사항)",
  "actions": [
    {
      "type": "reorder|add|remove|suggest|warn",
      "target": "대상 항목 (선택)",
      "detail": "구체적 내용",
      "priority": "high|medium|low"
    }
  ],
  "confidence": 0.8
}
\`\`\`

주의:
- JSON만 출력하세요. 다른 텍스트 없이.
- 한국어로 작성하세요.
- ADHD 친화적: 짧고 명확하게.
- 최대 3개의 actions만 제안하세요.`;
}

// === API 호출 ===

export async function requestTop3Judgment(
  request: Top3JudgmentRequest
): Promise<Top3JudgmentResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const authState = useAuthStore.getState();
  const accessToken = authState.accessToken;

  if (!supabaseUrl || !accessToken) {
    // 오프라인 폴백: 로컬 판단
    return generateLocalJudgment(request);
  }

  try {
    const prompt = buildTop3BriefingPrompt(request);

    const response = await fetch(`${supabaseUrl}/functions/v1/top3-briefing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ prompt, context: request }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as Top3JudgmentResponse;
  } catch (error) {
    console.error('[Top3Briefing] API call failed, using local fallback:', error);
    return generateLocalJudgment(request);
  }
}

// === 로컬 폴백 판단 ===

function generateLocalJudgment(request: Top3JudgmentRequest): Top3JudgmentResponse {
  const now = new Date(request.currentTime);
  const hour = now.getHours();
  const eventCount = request.calendarEvents.length;
  const top3Count = request.top3Items.length;
  const completedCount = request.top3Items.filter(i => i.completed).length;

  // 기본 판단
  let headline = '';
  let reason = '';
  let suggestion: string | undefined;
  const actions: Top3Action[] = [];

  if (top3Count === 0) {
    headline = '오늘의 Top 3를 정해볼까요?';
    reason = '집중할 일을 정하면 하루가 달라져요';
    suggestion = '가장 중요한 일 하나부터 시작해보세요';
    actions.push({
      type: 'suggest',
      detail: 'Top 3를 설정해보세요',
      priority: 'high',
    });
  } else if (completedCount === top3Count) {
    headline = '오늘 할 일을 다 했어요!';
    reason = `${completedCount}개 모두 완료`;
    suggestion = '남은 시간은 자유롭게 보내세요';
  } else if (eventCount >= 5) {
    headline = '미팅이 많은 날이에요';
    reason = `${eventCount}개 일정 사이에서 집중하세요`;
    suggestion = '미팅 사이 빈 시간에 Top 1만 집중';
    actions.push({
      type: 'warn',
      detail: '미팅 과부하 주의',
      priority: 'high',
    });
  } else if (hour < 12) {
    headline = '오전에 중요한 일 먼저';
    reason = '집중력 높은 오전을 활용하세요';
    if (top3Count > 0 && !request.top3Items[0].completed) {
      actions.push({
        type: 'suggest',
        target: request.top3Items[0].title,
        detail: '지금 이걸 먼저 해보세요',
        priority: 'high',
      });
    }
  } else if (hour < 18) {
    const remaining = top3Count - completedCount;
    headline = `오후, ${remaining}개 남았어요`;
    reason = '마감 전에 마무리해볼까요';
    const firstIncomplete = request.top3Items.find(i => !i.completed);
    if (firstIncomplete) {
      actions.push({
        type: 'suggest',
        target: firstIncomplete.title,
        detail: '이것부터 마무리하세요',
        priority: 'medium',
      });
    }
  } else {
    const remaining = top3Count - completedCount;
    if (remaining > 0) {
      headline = '하루 마무리 시간';
      reason = `${remaining}개 미완료, 내일로 넘길 수도`;
      suggestion = '중요한 건 내일 Top 1으로';
    } else {
      headline = '오늘도 수고했어요';
      reason = '편안한 저녁 보내세요';
    }
  }

  // 시간 충돌 감지
  const upcomingEvents = request.calendarEvents.filter(e => {
    const start = new Date(e.start);
    return start > now && (start.getTime() - now.getTime()) < 30 * 60 * 1000;
  });

  if (upcomingEvents.length > 0) {
    actions.push({
      type: 'warn',
      target: upcomingEvents[0].title,
      detail: `${upcomingEvents[0].title} 30분 이내 시작`,
      priority: 'high',
    });
  }

  return {
    headline,
    reason,
    suggestion,
    actions: actions.slice(0, 3),
    confidence: 0.6,
  };
}
