// Chat message types and interfaces
// 알프레도 챗 시스템의 핵심 타입 정의

import type { SafetyLevel, CrisisResource } from '../services/safety';

export interface ChatMessage {
  id: string;
  role: 'user' | 'alfredo';
  content: string;
  timestamp: Date;

  // 알프레도 응답 구조
  understanding?: string; // R1: 이해 선언
  summary?: string; // R2: 구조화 요약
  judgement?: JudgementReflection; // R3: 판단 반영

  // 메타데이터
  context?: ChatContext;
  dnaInsights?: DNAInsight[];

  // 안전 시스템 관련
  safetyLevel?: SafetyLevel;
  isSafetyMessage?: boolean;
  crisisResources?: CrisisResource[];

  // 스트리밍 상태
  isStreaming?: boolean;
}

export interface JudgementReflection {
  type: 'apply' | 'maintain' | 'consider';
  message: string;
  changes?: string[];
  confidence: number; // 0-1
}

export interface ChatContext {
  entry: 'priority' | 'more' | 'pattern' | 'briefing' | 'manual';
  triggerData?: any; // 진입 시점의 데이터
  currentState?: {
    intensity: string;
    condition: string;
    top3Count: number;
    calendarEvents: number;
  };
}

// DNA 확장 엔진 추론
export interface DNAInsight {
  type: 'chronotype' | 'energy' | 'workstyle' | 'stress' | 'worklife' | 'focus';
  signal: string; // 원시 신호 (예: "첫 일정이 주로 9시 이전")
  inference: string; // 추론 (예: "아침형")
  confidence: number; // 확신도 (1-3)
  usage: string; // 활용 방법
}

// 채팅 세션
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'idle' | 'closed';
  insights: DNAInsight[]; // 세션에서 발견된 인사이트
}

// 알프레도 응답 생성기 타입
export interface AlfredoResponseGenerator {
  analyze(userInput: string, context: ChatContext): Promise<{
    understanding: string;
    summary: string;
    judgement: JudgementReflection;
    insights?: DNAInsight[];
  }>;
}

// 챗 진입점 설정
export const CHAT_ENTRY_POINTS = {
  priority: {
    title: '우선순위 조정',
    prompt: '지금 가장 중요한 게 뭐라고 생각하세요?',
    icon: '🎯'
  },
  more: {
    title: '판단 근거 논의',
    prompt: '알프레도의 판단이 맞지 않나요?',
    icon: '🤔'
  },
  pattern: {
    title: '패턴 변화 대화',
    prompt: '최근에 뭔가 바뀐 게 있나요?',
    icon: '🔄'
  },
  briefing: {
    title: '브리핑 피드백',
    prompt: '오늘 브리핑이 어떤가요?',
    icon: '📝'
  },
  manual: {
    title: '직접 대화',
    prompt: '무엇을 도와드릴까요?',
    icon: '💬'
  }
} as const;