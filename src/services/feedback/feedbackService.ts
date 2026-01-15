/**
 * Feedback Loop 서비스
 */

import {
  Feedback,
  FeedbackType,
  FeedbackRating,
  FeedbackStats,
  THANK_YOU_MESSAGES
} from './types';

const FEEDBACK_KEY = 'alfredo_feedback';

export function submitFeedback(
  type: FeedbackType,
  options: {
    rating?: FeedbackRating;
    message?: string;
    context?: string;
  } = {}
): Feedback {
  const feedback: Feedback = {
    id: `feedback_${Date.now()}`,
    type,
    rating: options.rating,
    message: options.message,
    context: options.context,
    timestamp: new Date().toISOString(),
    acknowledged: false
  };

  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    const feedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
    feedbacks.push(feedback);
    if (feedbacks.length > 100) feedbacks.splice(0, feedbacks.length - 100);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  } catch (e) {
    console.error('Failed to save feedback:', e);
  }

  return feedback;
}

export function loadFeedback(): Feedback[] {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load feedback:', e);
  }
  return [];
}

export function getFeedbackStats(): FeedbackStats {
  const feedbacks = loadFeedback();
  const withRating = feedbacks.filter(f => f.rating);
  const totalRating = withRating.reduce((sum, f) => sum + (f.rating || 0), 0);

  return {
    totalFeedback: feedbacks.length,
    averageRating: withRating.length > 0 ? totalRating / withRating.length : 0,
    helpfulSuggestions: feedbacks.filter(f => f.type === 'suggestion_helpful').length,
    notHelpfulSuggestions: feedbacks.filter(f => f.type === 'suggestion_not_helpful').length
  };
}

export function getThankYouMessage(): string {
  return THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
}

export function markFeedbackAcknowledged(feedbackId: string): void {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    const feedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (feedback) {
      feedback.acknowledged = true;
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
    }
  } catch (e) {
    console.error('Failed to acknowledge feedback:', e);
  }
}
