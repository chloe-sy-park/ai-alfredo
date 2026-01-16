// =============================================
// 채팅에서 학습 추출 서비스
// =============================================

import type { LearningType } from './types';

export interface ExtractedLearning {
  type: LearningType;
  category: 'work' | 'life' | 'general';
  summary: string;
  originalInput: string;
  confidence: number;
}

// 선호도 감지 패턴
const PREFERENCE_PATTERNS = [
  { pattern: /아침.*싫|아침.*안.*좋|아침.*힘들/i, summary: '아침에 활동하기 힘들어함', category: 'general' as const },
  { pattern: /저녁.*좋|밤.*좋|저녁.*활발/i, summary: '저녁 시간대를 선호함', category: 'general' as const },
  { pattern: /조용.*좋|혼자.*집중|방해.*싫/i, summary: '조용한 환경에서 집중을 선호함', category: 'work' as const },
  { pattern: /미팅.*싫|회의.*많|회의.*줄/i, summary: '회의가 많은 것을 선호하지 않음', category: 'work' as const },
  { pattern: /운동.*좋|운동.*해야|운동.*중요/i, summary: '운동을 중요하게 생각함', category: 'life' as const },
  { pattern: /알림.*많|알림.*자주|리마인드.*자주/i, summary: '자주 알림받기를 원함', category: 'general' as const },
  { pattern: /알림.*적|알림.*줄|방해.*하지/i, summary: '알림을 적게 받기를 원함', category: 'general' as const },
];

// 패턴 감지
const PATTERN_PATTERNS = [
  { pattern: /월요일.*힘들|월요일.*싫|월요일.*피곤/i, summary: '월요일에 에너지가 낮음', category: 'work' as const },
  { pattern: /금요일.*피곤|금요일.*힘들|주말.*전.*피곤/i, summary: '금요일에 피로가 누적됨', category: 'work' as const },
  { pattern: /점심.*후.*졸|점심.*먹.*졸|오후.*졸/i, summary: '점심 후 졸림을 느낌', category: 'general' as const },
  { pattern: /주말.*일|주말.*업무|토요일.*일|일요일.*일/i, summary: '주말에도 업무를 하는 경향', category: 'work' as const },
  { pattern: /야근.*많|밤.*일|늦.*까지.*일/i, summary: '야근이 잦음', category: 'work' as const },
];

// 피드백 감지 (긍정적)
const POSITIVE_FEEDBACK_PATTERNS = [
  { pattern: /좋아|좋았|도움.*됐|도움이.*됐|덕분|고마워|감사/i, type: 'positive' as const },
  { pattern: /맞아|그래|정확|딱.*맞|이해.*잘/i, type: 'positive' as const },
];

// 피드백 감지 (부정적/교정)
const CORRECTION_PATTERNS = [
  { pattern: /아니|아닌데|틀렸|잘못|그건.*아니/i, summary: '이전 판단에 대한 교정', type: 'correction' as const },
  { pattern: /너무.*많|너무.*적|과하|부족/i, summary: '정도에 대한 조정 요청', type: 'correction' as const },
];

// 맥락 감지
const CONTEXT_PATTERNS = [
  { pattern: /이번.*주.*중요|이번.*주.*프로젝트|이번.*주.*마감/i, summary: '이번 주 중요한 일정이 있음', category: 'work' as const },
  { pattern: /요즘.*바쁘|최근.*바쁘|일이.*많/i, summary: '최근 업무가 많음', category: 'work' as const },
  { pattern: /오늘.*중요|오늘.*발표|오늘.*미팅/i, summary: '오늘 중요한 일정이 있음', category: 'work' as const },
  { pattern: /휴가|여행|쉬|휴식/i, summary: '휴식 계획이 있음', category: 'life' as const },
];

/**
 * 사용자 메시지에서 학습 추출
 */
export function extractLearningsFromMessage(
  userMessage: string,
  _alfredoResponse: string,
  context: { entry?: string }
): ExtractedLearning[] {
  const learnings: ExtractedLearning[] = [];

  // 1. 선호도 감지
  for (const { pattern, summary, category } of PREFERENCE_PATTERNS) {
    if (pattern.test(userMessage)) {
      learnings.push({
        type: 'preference',
        category,
        summary,
        originalInput: userMessage,
        confidence: 60
      });
    }
  }

  // 2. 패턴 감지
  for (const { pattern, summary, category } of PATTERN_PATTERNS) {
    if (pattern.test(userMessage)) {
      learnings.push({
        type: 'pattern',
        category,
        summary,
        originalInput: userMessage,
        confidence: 55
      });
    }
  }

  // 3. 교정 감지
  for (const { pattern, summary } of CORRECTION_PATTERNS) {
    if (pattern.test(userMessage)) {
      learnings.push({
        type: 'correction',
        category: context.entry === 'work' ? 'work' : context.entry === 'life' ? 'life' : 'general',
        summary,
        originalInput: userMessage,
        confidence: 70
      });
    }
  }

  // 4. 맥락 감지
  for (const { pattern, summary, category } of CONTEXT_PATTERNS) {
    if (pattern.test(userMessage)) {
      learnings.push({
        type: 'context',
        category,
        summary,
        originalInput: userMessage,
        confidence: 65
      });
    }
  }

  // 중복 제거 (같은 type + category 조합)
  const uniqueLearnings = learnings.reduce((acc, learning) => {
    const key = `${learning.type}-${learning.category}-${learning.summary}`;
    if (!acc.find(l => `${l.type}-${l.category}-${l.summary}` === key)) {
      acc.push(learning);
    }
    return acc;
  }, [] as ExtractedLearning[]);

  return uniqueLearnings;
}

/**
 * 긍정/부정 피드백 감지
 */
export function detectFeedbackSentiment(message: string): 'positive' | 'negative' | 'neutral' {
  for (const { pattern } of POSITIVE_FEEDBACK_PATTERNS) {
    if (pattern.test(message)) {
      return 'positive';
    }
  }

  for (const { pattern } of CORRECTION_PATTERNS) {
    if (pattern.test(message)) {
      return 'negative';
    }
  }

  return 'neutral';
}

/**
 * 학습 컨텍스트를 프롬프트용 문자열로 변환
 */
export function formatLearningsForPrompt(
  learnings: Array<{ learningType: string; summary: string; confidence: number; category?: string }>
): string {
  if (learnings.length === 0) return '';

  const grouped = learnings.reduce((acc, l) => {
    const key = l.learningType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(l);
    return acc;
  }, {} as Record<string, typeof learnings>);

  let result = '## 사용자에 대해 알고 있는 것:\n';

  if (grouped.preference?.length) {
    result += '\n### 선호도:\n';
    grouped.preference.forEach(l => {
      result += `- ${l.summary} (신뢰도 ${l.confidence}%)\n`;
    });
  }

  if (grouped.pattern?.length) {
    result += '\n### 발견한 패턴:\n';
    grouped.pattern.forEach(l => {
      result += `- ${l.summary} (신뢰도 ${l.confidence}%)\n`;
    });
  }

  if (grouped.context?.length) {
    result += '\n### 현재 맥락:\n';
    grouped.context.forEach(l => {
      result += `- ${l.summary}\n`;
    });
  }

  if (grouped.correction?.length) {
    result += '\n### 주의 사항 (이전 교정):\n';
    grouped.correction.forEach(l => {
      result += `- ${l.summary}\n`;
    });
  }

  return result;
}
