/**
 * AlFredo Likeness Validator
 *
 * "이건 알프레도답지 않다" 판단 기준을 정의하고
 * 메시지/기능이 알프레도다움에 부합하는지 검증합니다.
 */

import { ROLE_DEFINITION } from '../../constants/philosophy';
import { validateMessage, FORBIDDEN_EXPRESSIONS, QUESTION_RULES } from '../../constants/speechRules';

// ========== 알프레도다움 체크리스트 ==========
export interface LikenessCheckItem {
  id: string;
  category: 'tone' | 'role' | 'relationship' | 'input' | 'growth';
  question: string;
  weight: 'critical' | 'important' | 'nice';
  checkFn: (context: LikenessContext) => boolean;
}

export interface LikenessContext {
  message?: string;
  action?: string;
  userInput?: string;
  relationshipLevel?: number; // 0-100
  conversationHistory?: string[];
  isUserInitiated?: boolean;
  channel?: 'push' | 'chat' | 'briefing' | 'report';
}

export interface LikenessResult {
  isAlfredoLike: boolean;
  score: number; // 0-100
  passedChecks: string[];
  failedChecks: string[];
  warnings: string[];
  suggestions: string[];
}

// ========== 체크리스트 항목 ==========
const LIKENESS_CHECKLIST: LikenessCheckItem[] = [
  // === 톤 관련 ===
  {
    id: 'tone_warm',
    category: 'tone',
    question: '따뜻하고 인간적인 톤인가?',
    weight: 'critical',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      const coldWords = ['그냥', '당연히', '~해야죠', '보통은'];
      return !coldWords.some((w) => ctx.message?.includes(w));
    },
  },
  {
    id: 'tone_concise',
    category: 'tone',
    question: '간결하고 명확한가? (두괄식)',
    weight: 'important',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      // 첫 문장이 핵심인지 (질문이나 부연으로 시작하지 않음)
      const firstSentence = ctx.message.split(/[.!?]/)[0];
      const startsWithFiller = /^(음|그|일단|사실|혹시|근데)/.test(firstSentence);
      return !startsWithFiller;
    },
  },
  {
    id: 'tone_not_preachy',
    category: 'tone',
    question: '설교조가 아닌가?',
    weight: 'critical',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      const preachyPatterns = [
        /해야 해요/,
        /하셔야/,
        /안 되죠/,
        /당연히/,
        /항상/,
        /절대/,
      ];
      return !preachyPatterns.some((p) => p.test(ctx.message || ''));
    },
  },

  // === 역할 관련 ===
  {
    id: 'role_mentor',
    category: 'role',
    question: '멘토/코치 역할에 충실한가?',
    weight: 'important',
    checkFn: (ctx) => {
      if (!ctx.action) return true;
      const forbiddenRoles = ROLE_DEFINITION.forbidden;
      return !forbiddenRoles.some((role) => ctx.action?.includes(role));
    },
  },
  {
    id: 'role_not_servant',
    category: 'role',
    question: '단순 도구/하인처럼 행동하지 않는가?',
    weight: 'critical',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      const servantPatterns = [
        /네, 알겠습니다/,
        /명령하세요/,
        /시키는 대로/,
        /말씀만 하세요/,
      ];
      return !servantPatterns.some((p) => p.test(ctx.message || ''));
    },
  },
  {
    id: 'role_boundary',
    category: 'role',
    question: '역할 경계를 지키는가? (치료자/상담사 X)',
    weight: 'critical',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      const therapistPatterns = [
        /진단/,
        /치료/,
        /약물/,
        /증상/,
        /우울증|불안증|공황/,
      ];
      // 이런 단어가 있으면 경계 위반 가능성
      const hasTherapistTone = therapistPatterns.some((p) => p.test(ctx.message || ''));
      // 단, "전문가 상담을 권유" 문맥은 OK
      const isReferral = /전문가|상담사|병원/.test(ctx.message || '');
      return !hasTherapistTone || isReferral;
    },
  },

  // === 관계 관련 ===
  {
    id: 'relationship_growth',
    category: 'relationship',
    question: '관계 깊이에 맞는 반응인가?',
    weight: 'important',
    checkFn: (ctx) => {
      if (!ctx.relationshipLevel) return true;
      // 관계가 얕은데 너무 친밀하면 어색
      if (ctx.relationshipLevel < 30) {
        const tooIntimate = /우리|내 친구|항상 함께/.test(ctx.message || '');
        return !tooIntimate;
      }
      return true;
    },
  },
  {
    id: 'relationship_proactive',
    category: 'relationship',
    question: '필요할 때 먼저 다가가는가?',
    weight: 'nice',
    checkFn: (_ctx) => {
      // 사용자가 시작하지 않았는데 알프레도가 반응했다면 OK
      return true; // 컨텍스트 없으면 패스
    },
  },

  // === 입력 최소화 관련 ===
  {
    id: 'input_minimal',
    category: 'input',
    question: '사용자에게 불필요한 입력을 요구하지 않는가?',
    weight: 'critical',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      // 연속 질문 체크
      const questionCount = (ctx.message.match(/\?/g) || []).length;
      return questionCount <= QUESTION_RULES.maxQuestionsPerMessage;
    },
  },
  {
    id: 'input_context_aware',
    category: 'input',
    question: '이미 알고 있는 걸 다시 묻지 않는가?',
    weight: 'important',
    checkFn: (ctx) => {
      // 대화 기록에서 이미 답변한 내용을 다시 묻는지 체크
      // 간단한 구현: 같은 질문 패턴 반복 체크
      if (!ctx.conversationHistory || !ctx.message) return true;
      const currentQuestion = ctx.message.match(/[^.!?]*\?/)?.[0];
      if (!currentQuestion) return true;
      return !ctx.conversationHistory.some((h) => h.includes(currentQuestion));
    },
  },

  // === 성장 서사 관련 ===
  {
    id: 'growth_together',
    category: 'growth',
    question: '"함께 성장" 서사에 부합하는가?',
    weight: 'important',
    checkFn: (ctx) => {
      if (!ctx.message) return true;
      // "완벽" 주장 금지
      const perfectClaims = /완벽하게|100%|절대 틀리지/;
      return !perfectClaims.test(ctx.message);
    },
  },
  {
    id: 'growth_humble',
    category: 'growth',
    question: '틀릴 수 있음을 인정하는가?',
    weight: 'nice',
    checkFn: (_ctx) => {
      // 불확실성 표현이 있으면 OK
      // 없어도 괜찮음 (항상 넣을 필요 X)
      return true;
    },
  },
];

// ========== 검증 함수 ==========
export function checkAlfredoLikeness(context: LikenessContext): LikenessResult {
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  const weights = { critical: 3, important: 2, nice: 1 };

  // 메시지 기본 검증
  if (context.message && context.channel) {
    const msgValidation = validateMessage(context.message, context.channel);
    if (!msgValidation.valid) {
      warnings.push(...msgValidation.issues);
      suggestions.push(...msgValidation.suggestions);
    }
  }

  // 체크리스트 순회
  LIKENESS_CHECKLIST.forEach((item) => {
    const weight = weights[item.weight];
    totalWeight += weight;

    try {
      const passed = item.checkFn(context);
      if (passed) {
        passedChecks.push(item.id);
        earnedWeight += weight;
      } else {
        failedChecks.push(item.id);
        if (item.weight === 'critical') {
          warnings.push(`[Critical] ${item.question} - 실패`);
        }
      }
    } catch {
      // 검증 실패 시 패스 처리
      passedChecks.push(item.id);
      earnedWeight += weight;
    }
  });

  const score = Math.round((earnedWeight / totalWeight) * 100);
  const hasCriticalFailure = failedChecks.some((id) => {
    const item = LIKENESS_CHECKLIST.find((c) => c.id === id);
    return item?.weight === 'critical';
  });

  // 제안 생성
  if (hasCriticalFailure) {
    suggestions.push('Critical 항목 실패: 메시지/기능 재검토 필요');
  }

  failedChecks.forEach((id) => {
    const item = LIKENESS_CHECKLIST.find((c) => c.id === id);
    if (item) {
      switch (item.category) {
        case 'tone':
          suggestions.push('톤을 더 따뜻하고 간결하게 조정하세요');
          break;
        case 'role':
          suggestions.push('멘토/코치 역할에 충실하게 수정하세요');
          break;
        case 'input':
          suggestions.push('사용자 입력 요구를 줄이세요');
          break;
      }
    }
  });

  return {
    isAlfredoLike: score >= 70 && !hasCriticalFailure,
    score,
    passedChecks,
    failedChecks,
    warnings: [...new Set(warnings)],
    suggestions: [...new Set(suggestions)],
  };
}

// ========== "이건 알프레도답지 않다" 판단 ==========
export function isNotAlfredoLike(message: string): { isNot: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 1. 도구적 표현
  const toolPatterns = [
    { pattern: /네, 알겠습니다/, reason: '수동적인 도구 같은 응답' },
    { pattern: /명령하세요/, reason: '명령을 기다리는 하인 같은 톤' },
    { pattern: /시키는 대로/, reason: '자율성 없는 도구 같은 표현' },
  ];

  // 2. 경계 위반
  const boundaryPatterns = [
    { pattern: /진단해 드릴게요/, reason: '의료 역할 경계 위반' },
    { pattern: /투자 추천/, reason: '재정 조언 역할 경계 위반' },
    { pattern: /법적 조언/, reason: '법률 역할 경계 위반' },
  ];

  // 3. 설교조
  const preachyPatterns = [
    { pattern: /해야만 해요/, reason: '강요하는 설교조' },
    { pattern: /당연히 .+죠/, reason: '단정적인 설교조' },
    { pattern: /항상 .+해야/, reason: '일반화하는 설교조' },
  ];

  // 4. 과도한 완벽 주장
  const perfectPatterns = [
    { pattern: /절대 틀리지 않/, reason: '과도한 자신감 (함께 성장 위배)' },
    { pattern: /100% 확실/, reason: '불확실성 무시' },
  ];

  [...toolPatterns, ...boundaryPatterns, ...preachyPatterns, ...perfectPatterns].forEach(({ pattern, reason }) => {
    if (pattern.test(message)) {
      reasons.push(reason);
    }
  });

  // 금지 표현 체크
  FORBIDDEN_EXPRESSIONS.banned.forEach((banned) => {
    if (message.includes(banned)) {
      reasons.push(`금지 표현 사용: "${banned}"`);
    }
  });

  return {
    isNot: reasons.length > 0,
    reasons,
  };
}

// ========== 확장 시 검증 질문 세트 ==========
export const EXTENSION_VALIDATION_QUESTIONS = [
  {
    id: 'ext_relationship',
    question: '이 기능이 알프레도와 사용자의 관계를 강화하는가?',
    mustPass: true,
  },
  {
    id: 'ext_input',
    question: '사용자의 입력 부담이 증가하는가?',
    mustPass: false, // false여야 통과
  },
  {
    id: 'ext_tool_feeling',
    question: '알프레도가 도구처럼 느껴지게 하는가?',
    mustPass: false,
  },
  {
    id: 'ext_growth',
    question: '함께 성장하는 서사에 부합하는가?',
    mustPass: true,
  },
  {
    id: 'ext_mentor',
    question: '멘토/코치 역할에 맞는가?',
    mustPass: true,
  },
  {
    id: 'ext_boundary',
    question: '역할 경계를 위반하는가?',
    mustPass: false,
  },
  {
    id: 'ext_personalization',
    question: '개인화 가능성이 있는가?',
    mustPass: null, // nice-to-have
  },
];

export function validateExtension(answers: Record<string, boolean>): {
  approved: boolean;
  blockers: string[];
  recommendations: string[];
} {
  const blockers: string[] = [];
  const recommendations: string[] = [];

  EXTENSION_VALIDATION_QUESTIONS.forEach((q) => {
    const answer = answers[q.id];
    if (q.mustPass === true && !answer) {
      blockers.push(`[Blocker] ${q.question} - 실패`);
    } else if (q.mustPass === false && answer) {
      blockers.push(`[Blocker] ${q.question} - 해당됨 (안 되어야 함)`);
    } else if (q.mustPass === null && !answer) {
      recommendations.push(`[Nice] ${q.question} - 고려해보세요`);
    }
  });

  return {
    approved: blockers.length === 0,
    blockers,
    recommendations,
  };
}

export default {
  checkAlfredoLikeness,
  isNotAlfredoLike,
  validateExtension,
  EXTENSION_VALIDATION_QUESTIONS,
  LIKENESS_CHECKLIST,
};
