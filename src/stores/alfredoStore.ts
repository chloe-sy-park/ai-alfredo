// =============================================
// 알프레도 육성 시스템 Zustand 스토어
// =============================================

import { create } from 'zustand';
import type {
  Domain,
  LearningType,
  LearningSource,
  StyleAxes,
  AlfredoPreferences,
  AlfredoLearning,
  AlfredoUnderstanding,
  WeeklyReport
} from '../services/alfredo/types';
import {
  loadPreferences,
  savePreferences,
  getEffectiveStyle,
  shouldSwitchDomain,
  loadLearnings,
  addLearning,
  giveLearningFeedback,
  loadUnderstanding,
  incrementUnderstanding,
  generateWeeklyReport,
  getStyleDescription
} from '../services/alfredo/alfredoService';

interface AlfredoState {
  // 데이터
  preferences: AlfredoPreferences | null;
  learnings: AlfredoLearning[];
  understanding: AlfredoUnderstanding | null;
  effectiveStyle: StyleAxes | null;

  // UI 상태
  isLoading: boolean;
  error: string | null;

  // Actions - 초기화
  initialize: (userId: string) => Promise<void>;

  // Actions - 선호도
  updatePreferences: (updates: Partial<AlfredoPreferences>) => Promise<void>;
  switchDomain: (domain: Domain) => Promise<void>;
  checkAutoSwitch: () => void;

  // Actions - 학습
  addNewLearning: (learning: {
    type: LearningType;
    category: Domain | 'general';
    summary: string;
    originalInput?: string;
    source: LearningSource;
  }) => Promise<AlfredoLearning>;
  feedbackLearning: (learningId: string, isPositive: boolean) => Promise<void>;
  refreshLearnings: () => Promise<void>;

  // Actions - 이해도
  refreshUnderstanding: () => Promise<void>;
  generateReport: () => Promise<WeeklyReport | null>;

  // Getters
  getStyleDescription: () => { tone: string; notification: string; detail: string; motivation: string } | null;
}

export const useAlfredoStore = create<AlfredoState>((set, get) => ({
  preferences: null,
  learnings: [],
  understanding: null,
  effectiveStyle: null,
  isLoading: false,
  error: null,

  // 초기화
  initialize: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const [preferences, learnings, understanding] = await Promise.all([
        loadPreferences(userId),
        loadLearnings(userId),
        loadUnderstanding(userId)
      ]);

      const effectiveStyle = getEffectiveStyle(preferences);

      set({
        preferences,
        learnings,
        understanding,
        effectiveStyle,
        isLoading: false
      });

      // 자동 영역 전환 체크
      get().checkAutoSwitch();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '초기화 실패'
      });
    }
  },

  // 선호도 업데이트
  updatePreferences: async (updates: Partial<AlfredoPreferences>) => {
    const { preferences } = get();
    if (!preferences) return;

    const updated = { ...preferences, ...updates };
    await savePreferences(updated);

    const effectiveStyle = getEffectiveStyle(updated);
    set({ preferences: updated, effectiveStyle });
  },

  // 영역 전환
  switchDomain: async (domain: Domain) => {
    const { preferences } = get();
    if (!preferences) return;

    const updated = { ...preferences, currentDomain: domain };
    await savePreferences(updated);

    const effectiveStyle = getEffectiveStyle(updated);
    set({ preferences: updated, effectiveStyle });
  },

  // 자동 영역 전환 체크
  checkAutoSwitch: () => {
    const { preferences, switchDomain } = get();
    if (!preferences) return;

    const newDomain = shouldSwitchDomain(preferences);
    if (newDomain) {
      switchDomain(newDomain);
    }
  },

  // 학습 추가
  addNewLearning: async (learning) => {
    const { preferences, learnings } = get();
    if (!preferences) throw new Error('선호도가 로드되지 않았습니다');

    const newLearning = await addLearning(preferences.userId, learning);

    // 이해도 증가
    const updatedUnderstanding = await incrementUnderstanding(
      preferences.userId,
      learning.type,
      learning.category
    );

    set({
      learnings: [newLearning, ...learnings].slice(0, 100),
      understanding: updatedUnderstanding
    });

    return newLearning;
  },

  // 학습 피드백
  feedbackLearning: async (learningId: string, isPositive: boolean) => {
    await giveLearningFeedback(learningId, isPositive);

    // 학습 목록 새로고침
    await get().refreshLearnings();
  },

  // 학습 새로고침
  refreshLearnings: async () => {
    const { preferences } = get();
    if (!preferences) return;

    const learnings = await loadLearnings(preferences.userId);
    set({ learnings });
  },

  // 이해도 새로고침
  refreshUnderstanding: async () => {
    const { preferences } = get();
    if (!preferences) return;

    const understanding = await loadUnderstanding(preferences.userId);
    set({ understanding });
  },

  // 주간 리포트 생성
  generateReport: async () => {
    const { preferences } = get();
    if (!preferences) return null;

    const report = await generateWeeklyReport(preferences.userId);

    // 이해도 새로고침
    await get().refreshUnderstanding();

    return report;
  },

  // 스타일 설명
  getStyleDescription: () => {
    const { effectiveStyle } = get();
    if (!effectiveStyle) return null;

    return getStyleDescription(effectiveStyle);
  }
}));
