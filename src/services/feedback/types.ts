/**
 * Feedback Loop UX 타입 정의
 */

export type FeedbackType =
  | 'suggestion_helpful'    // 제안이 도움됨
  | 'suggestion_not_helpful'// 제안이 안 도움됨
  | 'feature_request'       // 기능 요청
  | 'bug_report'           // 버그 신고
  | 'general';             // 일반 피드백

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface Feedback {
  id: string;
  type: FeedbackType;
  rating?: FeedbackRating;
  message?: string;
  context?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  helpfulSuggestions: number;
  notHelpfulSuggestions: number;
}

export const FEEDBACK_PROMPTS = {
  after_suggestion: '이 제안이 도움이 됐나요?',
  after_task: '할 일 관리가 편했나요?',
  periodic: '알프레도와의 경험은 어떠세요?'
};

export const THANK_YOU_MESSAGES = [
  '피드백 감사해요!',
  '의견 주셔서 고마워요',
  '더 나아지는 데 도움이 돼요',
  '소중한 의견이에요'
];
