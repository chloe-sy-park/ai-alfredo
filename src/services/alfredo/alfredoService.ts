// =============================================
// 알프레도 육성 시스템 서비스
// =============================================

import { supabase } from '../../lib/supabase';
import type {
  Domain,
  LearningType,
  LearningSource,
  StyleAxes,
  DomainOverrides,
  AlfredoPreferences,
  AlfredoLearning,
  AlfredoUnderstanding,
  WeeklyReport,
  PendingLearning,
  WeeklyLearningItem
} from './types';
import { DEFAULT_DOMAIN_STYLES, LEARNING_POINTS, LEVEL_TITLES } from './types';

// LocalStorage 키
const STORAGE_KEYS = {
  preferences: 'alfredo_preferences',
  learnings: 'alfredo_learnings',
  understanding: 'alfredo_understanding'
};

// =============================================
// 선호도 (Preferences) 관리
// =============================================

// 1-5 스케일을 0-100 스케일로 변환
function scaleToPercent(value: number): number {
  return Math.round((value - 1) * 25); // 1→0, 2→25, 3→50, 4→75, 5→100
}

// 0-100 스케일을 1-5 스케일로 변환
function percentToScale(value: number): number {
  return Math.round(value / 25) + 1; // 0→1, 25→2, 50→3, 75→4, 100→5
}

// 기본 선호도 생성
function createDefaultPreferences(userId: string): AlfredoPreferences {
  return {
    id: `pref-${Date.now()}`,
    userId,
    toneWarmth: 75, // warmth: 4
    notificationFreq: 50, // proactivity: 3
    dataDepth: 50, // directness: 3
    motivationStyle: 50, // pressure: 3
    domainOverrides: {},
    currentDomain: 'work',
    autoDomainSwitch: true,
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    workDays: [1, 2, 3, 4, 5],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 선호도 로드 (user_settings 테이블 사용)
export async function loadPreferences(userId: string): Promise<AlfredoPreferences> {
  // Supabase에서 로드 시도 (user_settings 테이블)
  try {
    const { data, error } = await (supabase as any)
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      // tone_axes에서 값 추출 (기존 데이터 호환)
      const toneAxes = data.tone_axes || {};

      return {
        id: data.id,
        userId: data.user_id,
        // tone_axes의 1-5 스케일을 0-100으로 변환
        toneWarmth: scaleToPercent(toneAxes.warmth ?? 4),
        notificationFreq: scaleToPercent(toneAxes.proactivity ?? 3),
        dataDepth: scaleToPercent(toneAxes.directness ?? 3),
        motivationStyle: scaleToPercent(toneAxes.pressure ?? 2),
        // 새로운 Phase 3 필드들
        domainOverrides: (data.domain_overrides as DomainOverrides) || {},
        currentDomain: (data.current_domain as Domain) || 'work',
        autoDomainSwitch: data.auto_domain_switch ?? true,
        workHoursStart: data.work_start_time || '09:00',
        workHoursEnd: data.work_end_time || '18:00',
        workDays: data.work_days || [1, 2, 3, 4, 5],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    }
  } catch (e) {
    console.warn('Supabase 로드 실패, localStorage 사용:', e);
  }

  // LocalStorage 폴백
  const stored = localStorage.getItem(STORAGE_KEYS.preferences);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.userId === userId) {
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt)
      };
    }
  }

  return createDefaultPreferences(userId);
}

// 선호도 저장 (user_settings 테이블 사용)
export async function savePreferences(preferences: AlfredoPreferences): Promise<void> {
  const updated = { ...preferences, updatedAt: new Date() };

  // LocalStorage 저장
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated));

  // Supabase 저장 시도 (user_settings 테이블)
  try {
    await (supabase as any)
      .from('user_settings')
      .update({
        // tone_axes 업데이트 (0-100을 1-5로 변환)
        tone_axes: {
          warmth: percentToScale(preferences.toneWarmth),
          proactivity: percentToScale(preferences.notificationFreq),
          directness: percentToScale(preferences.dataDepth),
          humor: 3, // 기존 값 유지
          pressure: percentToScale(preferences.motivationStyle)
        },
        // 새로운 Phase 3 필드들
        domain_overrides: preferences.domainOverrides,
        current_domain: preferences.currentDomain,
        auto_domain_switch: preferences.autoDomainSwitch,
        work_start_time: preferences.workHoursStart,
        work_end_time: preferences.workHoursEnd,
        work_days: preferences.workDays,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', preferences.userId);
  } catch (e) {
    console.warn('Supabase 저장 실패:', e);
  }
}

// 현재 영역에 맞는 스타일 계산
export function getEffectiveStyle(preferences: AlfredoPreferences): StyleAxes {
  const domain = preferences.currentDomain;
  const overrides = preferences.domainOverrides[domain] || {};
  const defaults = DEFAULT_DOMAIN_STYLES[domain];

  return {
    toneWarmth: overrides.toneWarmth ?? defaults.toneWarmth ?? preferences.toneWarmth,
    notificationFreq: overrides.notificationFreq ?? defaults.notificationFreq ?? preferences.notificationFreq,
    dataDepth: overrides.dataDepth ?? defaults.dataDepth ?? preferences.dataDepth,
    motivationStyle: overrides.motivationStyle ?? defaults.motivationStyle ?? preferences.motivationStyle
  };
}

// 영역 자동 전환 확인
export function shouldSwitchDomain(preferences: AlfredoPreferences): Domain | null {
  if (!preferences.autoDomainSwitch) return null;

  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=월 ~ 7=일
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isWorkDay = preferences.workDays.includes(currentDay);
  const isWorkHours = currentTime >= preferences.workHoursStart && currentTime < preferences.workHoursEnd;

  const shouldBeWork = isWorkDay && isWorkHours;
  const currentIsWork = preferences.currentDomain === 'work';

  if (shouldBeWork && !currentIsWork) return 'work';
  if (!shouldBeWork && currentIsWork) return 'life';

  return null;
}

// =============================================
// 학습 (Learnings) 관리
// =============================================

// 학습 추가
export async function addLearning(
  userId: string,
  learning: {
    type: LearningType;
    category: Domain | 'general';
    summary: string;
    originalInput?: string;
    source: LearningSource;
    sourceMessageId?: string;
  }
): Promise<AlfredoLearning> {
  const newLearning: AlfredoLearning = {
    id: `learn-${Date.now()}`,
    userId,
    learningType: learning.type,
    category: learning.category,
    summary: learning.summary,
    originalInput: learning.originalInput,
    source: learning.source,
    sourceMessageId: learning.sourceMessageId,
    confidence: 50,
    positiveFeedbackCount: 0,
    negativeFeedbackCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // LocalStorage 저장
  const stored = localStorage.getItem(STORAGE_KEYS.learnings);
  const learnings: AlfredoLearning[] = stored ? JSON.parse(stored) : [];
  learnings.unshift(newLearning);
  // 최근 200개만 유지
  const trimmed = learnings.slice(0, 200);
  localStorage.setItem(STORAGE_KEYS.learnings, JSON.stringify(trimmed));

  // Supabase 저장 시도
  try {
    await (supabase as any).from('alfredo_learnings').insert({
      user_id: userId,
      learning_type: learning.type,
      category: learning.category,
      summary: learning.summary,
      original_input: learning.originalInput,
      source: learning.source,
      source_message_id: learning.sourceMessageId,
      confidence: 50
    });
  } catch (e) {
    console.warn('학습 저장 실패:', e);
  }

  return newLearning;
}

// 학습 로드
export async function loadLearnings(userId: string): Promise<AlfredoLearning[]> {
  // Supabase에서 로드 시도
  try {
    const { data, error } = await (supabase as any)
      .from('alfredo_learnings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data && !error) {
      return data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        learningType: item.learning_type as LearningType,
        category: item.category as Domain | 'general',
        summary: item.summary,
        originalInput: item.original_input,
        appliedRules: item.applied_rules,
        confidence: item.confidence,
        positiveFeedbackCount: item.positive_feedback_count,
        negativeFeedbackCount: item.negative_feedback_count,
        source: item.source as LearningSource,
        sourceMessageId: item.source_message_id,
        isActive: item.is_active,
        lastAppliedAt: item.last_applied_at ? new Date(item.last_applied_at) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
  } catch (e) {
    console.warn('Supabase 로드 실패:', e);
  }

  // LocalStorage 폴백
  const stored = localStorage.getItem(STORAGE_KEYS.learnings);
  if (stored) {
    const learnings: AlfredoLearning[] = JSON.parse(stored);
    return learnings
      .filter(l => l.userId === userId && l.isActive)
      .map(l => ({
        ...l,
        createdAt: new Date(l.createdAt),
        updatedAt: new Date(l.updatedAt),
        lastAppliedAt: l.lastAppliedAt ? new Date(l.lastAppliedAt) : undefined
      }));
  }

  return [];
}

// 학습 피드백 (좋아요/싫어요)
export async function giveLearningFeedback(
  learningId: string,
  isPositive: boolean
): Promise<void> {
  // LocalStorage 업데이트
  const stored = localStorage.getItem(STORAGE_KEYS.learnings);
  if (stored) {
    const learnings: AlfredoLearning[] = JSON.parse(stored);
    const index = learnings.findIndex(l => l.id === learningId);
    if (index >= 0) {
      if (isPositive) {
        learnings[index].positiveFeedbackCount++;
        learnings[index].confidence = Math.min(100, learnings[index].confidence + 5);
      } else {
        learnings[index].negativeFeedbackCount++;
        learnings[index].confidence = Math.max(0, learnings[index].confidence - 10);
        // 신뢰도가 너무 낮으면 비활성화
        if (learnings[index].confidence < 20) {
          learnings[index].isActive = false;
        }
      }
      learnings[index].updatedAt = new Date();
      localStorage.setItem(STORAGE_KEYS.learnings, JSON.stringify(learnings));
    }
  }

  // Supabase 업데이트 시도
  try {
    if (isPositive) {
      await (supabase as any).rpc('increment_learning_feedback', {
        learning_id: learningId,
        is_positive: true
      });
    } else {
      await (supabase as any).rpc('increment_learning_feedback', {
        learning_id: learningId,
        is_positive: false
      });
    }
  } catch (e) {
    console.warn('피드백 저장 실패:', e);
  }
}

// =============================================
// 이해도 (Understanding) 관리
// =============================================

// 기본 이해도 생성
function createDefaultUnderstanding(userId: string): AlfredoUnderstanding {
  return {
    id: `understand-${Date.now()}`,
    userId,
    understandingScore: 10,
    level: 1,
    title: LEVEL_TITLES[1],
    weeklyLearnings: [],
    pendingLearnings: [
      { topic: '선호하는 알림 시간대', progress: 0, hint: '사용하면서 파악할게요' },
      { topic: '집중이 잘 되는 시간', progress: 0, hint: '패턴을 분석 중이에요' },
      { topic: '스트레스 받는 상황', progress: 0, hint: '대화하면서 알아갈게요' }
    ],
    workUnderstanding: 10,
    lifeUnderstanding: 10,
    totalInteractions: 0,
    totalLearnings: 0,
    totalCorrections: 0,
    daysTogether: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 이해도 로드
export async function loadUnderstanding(userId: string): Promise<AlfredoUnderstanding> {
  // Supabase에서 로드 시도
  try {
    const { data, error } = await (supabase as any)
      .from('alfredo_understanding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      return {
        id: data.id,
        userId: data.user_id,
        understandingScore: data.understanding_score,
        level: data.level,
        title: data.title,
        weeklyLearnings: (data.weekly_learnings as WeeklyLearningItem[]) || [],
        pendingLearnings: (data.pending_learnings as PendingLearning[]) || [],
        workUnderstanding: data.work_understanding,
        lifeUnderstanding: data.life_understanding,
        totalInteractions: data.total_interactions,
        totalLearnings: data.total_learnings,
        totalCorrections: data.total_corrections,
        daysTogether: data.days_together,
        lastWeeklyReportAt: data.last_weekly_report_at ? new Date(data.last_weekly_report_at) : undefined,
        lastWeeklyReport: data.last_weekly_report as WeeklyReport | undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    }
  } catch (e) {
    console.warn('Supabase 로드 실패:', e);
  }

  // LocalStorage 폴백
  const stored = localStorage.getItem(STORAGE_KEYS.understanding);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.userId === userId) {
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        lastWeeklyReportAt: parsed.lastWeeklyReportAt ? new Date(parsed.lastWeeklyReportAt) : undefined
      };
    }
  }

  return createDefaultUnderstanding(userId);
}

// 이해도 저장
export async function saveUnderstanding(understanding: AlfredoUnderstanding): Promise<void> {
  const updated = { ...understanding, updatedAt: new Date() };

  // 레벨 계산
  updated.level = Math.min(10, Math.floor(updated.understandingScore / 10) + 1);
  updated.title = LEVEL_TITLES[updated.level] || LEVEL_TITLES[1];

  // LocalStorage 저장
  localStorage.setItem(STORAGE_KEYS.understanding, JSON.stringify(updated));

  // Supabase 저장 시도
  try {
    await (supabase as any)
      .from('alfredo_understanding')
      .upsert({
        user_id: understanding.userId,
        understanding_score: updated.understandingScore,
        level: updated.level,
        title: updated.title,
        weekly_learnings: updated.weeklyLearnings,
        pending_learnings: updated.pendingLearnings,
        work_understanding: updated.workUnderstanding,
        life_understanding: updated.lifeUnderstanding,
        total_interactions: updated.totalInteractions,
        total_learnings: updated.totalLearnings,
        total_corrections: updated.totalCorrections,
        days_together: updated.daysTogether,
        last_weekly_report_at: updated.lastWeeklyReportAt?.toISOString(),
        last_weekly_report: updated.lastWeeklyReport,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
  } catch (e) {
    console.warn('이해도 저장 실패:', e);
  }
}

// 이해도 증가
export async function incrementUnderstanding(
  userId: string,
  learningType: LearningType,
  category: Domain | 'general'
): Promise<AlfredoUnderstanding> {
  const understanding = await loadUnderstanding(userId);

  // 점수 증가
  const points = LEARNING_POINTS[learningType];
  understanding.understandingScore = Math.min(100, understanding.understandingScore + points);

  // 영역별 이해도 증가
  if (category === 'work') {
    understanding.workUnderstanding = Math.min(100, understanding.workUnderstanding + 2);
  } else if (category === 'life') {
    understanding.lifeUnderstanding = Math.min(100, understanding.lifeUnderstanding + 2);
  }

  // 통계 업데이트
  understanding.totalLearnings++;
  if (learningType === 'correction') {
    understanding.totalCorrections++;
  }

  await saveUnderstanding(understanding);
  return understanding;
}

// =============================================
// 주간 리포트
// =============================================

// 주간 리포트 생성
export async function generateWeeklyReport(userId: string): Promise<WeeklyReport> {
  const understanding = await loadUnderstanding(userId);
  const learnings = await loadLearnings(userId);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  // 이번 주 학습 필터링
  const thisWeekLearnings = learnings.filter(l =>
    new Date(l.createdAt) >= weekStart
  );

  const report: WeeklyReport = {
    id: `report-${Date.now()}`,
    userId,
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: now.toISOString().split('T')[0],
    learningsCount: thisWeekLearnings.length,
    correctionsCount: thisWeekLearnings.filter(l => l.learningType === 'correction').length,
    understandingChange: thisWeekLearnings.reduce(
      (sum, l) => sum + LEARNING_POINTS[l.learningType],
      0
    ),
    learnedItems: thisWeekLearnings.slice(0, 5).map(l => ({
      id: l.id,
      summary: l.summary,
      learnedAt: l.createdAt.toISOString().split('T')[0]
    })),
    pendingItems: understanding.pendingLearnings,
    highlightMessage: generateHighlightMessage(understanding, thisWeekLearnings.length),
    createdAt: new Date()
  };

  // 이해도 업데이트
  understanding.lastWeeklyReportAt = new Date();
  understanding.lastWeeklyReport = report;
  understanding.weeklyLearnings = report.learnedItems;
  await saveUnderstanding(understanding);

  // Supabase 저장
  try {
    await (supabase as any).from('alfredo_weekly_reports').insert({
      user_id: userId,
      week_start: report.weekStart,
      week_end: report.weekEnd,
      learnings_count: report.learningsCount,
      corrections_count: report.correctionsCount,
      understanding_change: report.understandingChange,
      learned_items: report.learnedItems,
      pending_items: report.pendingItems,
      highlight_message: report.highlightMessage
    });
  } catch (e) {
    console.warn('주간 리포트 저장 실패:', e);
  }

  return report;
}

// 하이라이트 메시지 생성
function generateHighlightMessage(understanding: AlfredoUnderstanding, weeklyCount: number): string {
  const { level, daysTogether } = understanding;

  if (weeklyCount === 0) {
    return '이번 주는 조용했네요. 천천히 알아가도 괜찮아요 🐧';
  }

  if (level <= 2) {
    return `${daysTogether}일 동안 ${weeklyCount}가지를 배웠어요. 점점 더 잘 도와드릴 수 있을 거예요!`;
  }

  if (level <= 5) {
    return `이번 주 ${weeklyCount}가지를 새로 알게 됐어요. 점점 더 잘 맞춰드릴 수 있을 것 같아요 ✨`;
  }

  if (level <= 8) {
    return `벌써 ${daysTogether}일째! 이번 주도 ${weeklyCount}가지를 배웠어요. 이제 꽤 잘 알게 된 것 같아요 💜`;
  }

  return `${daysTogether}일 동안 함께해서 행복해요. 이번 주도 ${weeklyCount}가지를 더 알게 됐어요 🎉`;
}

// =============================================
// 스타일 텍스트 생성
// =============================================

export function getStyleDescription(style: StyleAxes): {
  tone: string;
  notification: string;
  detail: string;
  motivation: string;
} {
  return {
    tone: style.toneWarmth > 70 ? '다정하게' : style.toneWarmth > 40 ? '중립적으로' : '직설적으로',
    notification: style.notificationFreq > 70 ? '자주' : style.notificationFreq > 40 ? '적당히' : '필요시만',
    detail: style.dataDepth > 70 ? '상세하게' : style.dataDepth > 40 ? '적당히' : '핵심만',
    motivation: style.motivationStyle > 70 ? '도전적으로' : style.motivationStyle > 40 ? '균형있게' : '느긋하게'
  };
}
