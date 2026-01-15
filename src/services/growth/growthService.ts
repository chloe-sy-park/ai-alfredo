/**
 * Growth Archive 서비스
 * 알프레도가 배워온 것들을 관리
 */

import {
  GrowthItem,
  GrowthCategory,
  GrowthSource,
  Preference,
  DiscoveredPattern,
  PatternType,
  GrowthSummary,
  GrowthTimelineItem,
  GROWTH_MESSAGES
} from './types';

const GROWTH_KEY = 'alfredo_growth_archive';
const PREFERENCES_KEY = 'alfredo_preferences';
const PATTERNS_KEY = 'alfredo_patterns';

// ========== 성장 항목 관리 ==========

/**
 * 성장 항목 저장
 */
export function recordGrowth(
  category: GrowthCategory,
  title: string,
  description: string,
  source: GrowthSource = 'inferred',
  confidence: number = 0.5,
  metadata?: Record<string, unknown>
): GrowthItem {
  const item: GrowthItem = {
    id: `growth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category,
    title,
    description,
    learnedAt: new Date().toISOString(),
    confidence: Math.min(1, Math.max(0, confidence)),
    source,
    metadata
  };

  try {
    const stored = localStorage.getItem(GROWTH_KEY);
    const items: GrowthItem[] = stored ? JSON.parse(stored) : [];

    items.push(item);

    // 최근 200개만 유지
    if (items.length > 200) {
      items.splice(0, items.length - 200);
    }

    localStorage.setItem(GROWTH_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to record growth:', e);
  }

  return item;
}

/**
 * 모든 성장 항목 로드
 */
export function loadGrowthItems(): GrowthItem[] {
  try {
    const stored = localStorage.getItem(GROWTH_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load growth items:', e);
  }
  return [];
}

/**
 * 카테고리별 성장 항목
 */
export function getGrowthByCategory(category: GrowthCategory): GrowthItem[] {
  return loadGrowthItems().filter(item => item.category === category);
}

/**
 * 최근 성장 항목
 */
export function getRecentGrowth(limit: number = 10): GrowthItem[] {
  const items = loadGrowthItems();
  return items.slice(-limit).reverse();
}

// ========== 선호도 관리 ==========

/**
 * 선호도 저장/업데이트
 */
export function setPreference(
  key: string,
  value: string | number | boolean,
  confidence: number = 0.5
): Preference {
  const preferences = loadPreferences();
  const existing = preferences.find(p => p.key === key);

  if (existing) {
    // 기존 선호도 업데이트
    existing.value = value;
    existing.confidence = Math.min(1, existing.confidence + 0.1); // 확인될 때마다 신뢰도 증가
    existing.lastConfirmedAt = new Date().toISOString();
  } else {
    // 새 선호도 추가
    const preference: Preference = {
      id: `pref_${Date.now()}`,
      key,
      value,
      learnedAt: new Date().toISOString(),
      confidence
    };
    preferences.push(preference);

    // 성장 기록
    recordGrowth(
      'preference',
      `${key} 선호도 발견`,
      `${key}: ${value}`,
      'inferred',
      confidence
    );
  }

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.error('Failed to save preference:', e);
  }

  return preferences.find(p => p.key === key)!;
}

/**
 * 선호도 로드
 */
export function loadPreferences(): Preference[] {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return [];
}

/**
 * 특정 선호도 가져오기
 */
export function getPreference(key: string): Preference | undefined {
  return loadPreferences().find(p => p.key === key);
}

/**
 * 높은 신뢰도 선호도 가져오기
 */
export function getConfidentPreferences(minConfidence: number = 0.7): Preference[] {
  return loadPreferences().filter(p => p.confidence >= minConfidence);
}

// ========== 패턴 관리 ==========

/**
 * 패턴 발견/업데이트
 */
export function recordPattern(
  type: PatternType,
  description: string,
  example?: string
): DiscoveredPattern {
  const patterns = loadPatterns();
  const existing = patterns.find(
    p => p.type === type && p.description === description
  );

  if (existing) {
    // 기존 패턴 업데이트
    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
    existing.confidence = Math.min(1, existing.confidence + 0.05);
    if (example && !existing.examples?.includes(example)) {
      existing.examples = [...(existing.examples || []), example].slice(-5);
    }
  } else {
    // 새 패턴 추가
    const pattern: DiscoveredPattern = {
      id: `pattern_${Date.now()}`,
      type,
      description,
      occurrences: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      confidence: 0.3,
      examples: example ? [example] : []
    };
    patterns.push(pattern);

    // 성장 기록
    recordGrowth(
      'pattern',
      `${description} 패턴 발견`,
      `이런 패턴이 보여요: ${description}`,
      'pattern',
      0.3
    );
  }

  try {
    localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns));
  } catch (e) {
    console.error('Failed to save pattern:', e);
  }

  return patterns.find(
    p => p.type === type && p.description === description
  )!;
}

/**
 * 패턴 로드
 */
export function loadPatterns(): DiscoveredPattern[] {
  try {
    const stored = localStorage.getItem(PATTERNS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load patterns:', e);
  }
  return [];
}

/**
 * 높은 신뢰도 패턴 가져오기
 */
export function getConfidentPatterns(minConfidence: number = 0.6): DiscoveredPattern[] {
  return loadPatterns()
    .filter(p => p.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * 타입별 패턴 가져오기
 */
export function getPatternsByType(type: PatternType): DiscoveredPattern[] {
  return loadPatterns().filter(p => p.type === type);
}

// ========== 요약 및 분석 ==========

/**
 * 성장 요약 생성
 */
export function generateGrowthSummary(): GrowthSummary {
  const items = loadGrowthItems();
  const patterns = getConfidentPatterns(0.5);

  const byCategory: Record<GrowthCategory, number> = {
    preference: 0,
    pattern: 0,
    accuracy: 0,
    interaction: 0,
    understanding: 0
  };

  items.forEach(item => {
    byCategory[item.category]++;
  });

  const totalConfidence = items.reduce((sum, item) => sum + item.confidence, 0);

  return {
    totalLearnings: items.length,
    byCategory,
    recentLearnings: items.slice(-5).reverse(),
    topPatterns: patterns.slice(0, 5),
    averageConfidence: items.length > 0 ? totalConfidence / items.length : 0
  };
}

/**
 * 성장 타임라인 생성
 */
export function generateGrowthTimeline(days: number = 30): GrowthTimelineItem[] {
  const items = loadGrowthItems();
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 날짜별로 그룹핑
  const grouped: Record<string, GrowthItem[]> = {};

  items
    .filter(item => new Date(item.learnedAt) >= startDate)
    .forEach(item => {
      const dateKey = new Date(item.learnedAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

  // 타임라인 항목 생성
  const timeline: GrowthTimelineItem[] = Object.entries(grouped)
    .map(([date, dayItems]) => {
      // 하이라이트 선택 (가장 높은 신뢰도)
      const sortedItems = [...dayItems].sort((a, b) => b.confidence - a.confidence);
      const highlight = sortedItems[0]?.title;

      return {
        date,
        items: dayItems,
        highlight
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return timeline;
}

/**
 * 학습 진행도 계산
 */
export function calculateLearningProgress(): {
  level: number;
  nextLevelAt: number;
  currentPoints: number;
} {
  const items = loadGrowthItems();
  const patterns = loadPatterns();
  const preferences = loadPreferences();

  // 포인트 계산
  let points = 0;
  points += items.length * 5;  // 학습 항목당 5점
  points += patterns.filter(p => p.confidence >= 0.7).length * 20;  // 확실한 패턴당 20점
  points += preferences.filter(p => p.confidence >= 0.7).length * 15;  // 확실한 선호도당 15점

  // 레벨 계산 (100점당 1레벨)
  const level = Math.floor(points / 100) + 1;
  const nextLevelAt = level * 100;

  return {
    level,
    nextLevelAt,
    currentPoints: points
  };
}

/**
 * 새 학습 메시지 생성
 */
export function getNewLearningMessage(): string {
  const messages = GROWTH_MESSAGES.newLearning;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 패턴 발견 메시지 생성
 */
export function getPatternFoundMessage(): string {
  const messages = GROWTH_MESSAGES.patternFound;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 알프레도의 성장 스토리 생성
 */
export function generateGrowthStory(): string {
  const summary = generateGrowthSummary();
  const progress = calculateLearningProgress();

  if (summary.totalLearnings === 0) {
    return '아직 배운 게 많지 않지만, 점점 알아가고 있어요.';
  }

  if (progress.level >= 5) {
    return `벌써 ${summary.totalLearnings}가지를 배웠어요. 이제 꽤 잘 알게 된 것 같아요!`;
  }

  if (summary.topPatterns.length >= 3) {
    return `${summary.topPatterns.length}개의 패턴을 발견했어요. 점점 더 잘 이해하고 있어요.`;
  }

  return `지금까지 ${summary.totalLearnings}가지를 배웠어요. 앞으로 더 잘 도울 수 있을 거예요.`;
}

/**
 * 특정 항목의 신뢰도 업데이트
 */
export function updateGrowthConfidence(
  itemId: string,
  delta: number
): void {
  try {
    const stored = localStorage.getItem(GROWTH_KEY);
    const items: GrowthItem[] = stored ? JSON.parse(stored) : [];

    const item = items.find(i => i.id === itemId);
    if (item) {
      item.confidence = Math.min(1, Math.max(0, item.confidence + delta));
      localStorage.setItem(GROWTH_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to update growth confidence:', e);
  }
}
