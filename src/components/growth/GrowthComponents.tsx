/**
 * Growth Archive UI 컴포넌트
 * 알프레도가 배워온 것들을 시각화
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Heart, Target, Lightbulb, MessageCircle } from 'lucide-react';
import {
  GrowthItem,
  GrowthCategory,
  DiscoveredPattern,
  GROWTH_CATEGORY_LABELS,
  GROWTH_CATEGORY_ICONS,
  PATTERN_TYPE_LABELS
} from '../../services/growth/types';
import {
  generateGrowthSummary,
  generateGrowthTimeline,
  calculateLearningProgress,
  getConfidentPatterns,
  getConfidentPreferences,
  generateGrowthStory
} from '../../services/growth/growthService';

/**
 * 성장 요약 카드
 */
export function GrowthSummaryCard() {
  const summary = generateGrowthSummary();
  const progress = calculateLearningProgress();
  const story = generateGrowthStory();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Brain className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">알프레도의 성장</h3>
          <p className="text-sm text-gray-600">Lv.{progress.level}</p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{progress.currentPoints}점</span>
          <span>다음 레벨: {progress.nextLevelAt}점</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress.currentPoints % 100)}%` }}
            className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
          />
        </div>
      </div>

      {/* 스토리 */}
      <p className="text-sm text-gray-700 mb-4 italic">
        "{story}"
      </p>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2">
        <StatMini label="배운 것" value={summary.totalLearnings} />
        <StatMini label="패턴" value={summary.topPatterns.length} />
        <StatMini label="신뢰도" value={`${Math.round(summary.averageConfidence * 100)}%`} />
      </div>
    </div>
  );
}

/**
 * 미니 통계
 */
function StatMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/50 rounded-lg p-2 text-center">
      <div className="font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

/**
 * 성장 항목 카드
 */
interface GrowthItemCardProps {
  item: GrowthItem;
  compact?: boolean;
}

export function GrowthItemCard({ item, compact = false }: GrowthItemCardProps) {
  const icon = GROWTH_CATEGORY_ICONS[item.category];
  const label = GROWTH_CATEGORY_LABELS[item.category];

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
        <ConfidenceBadge confidence={item.confidence} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <ConfidenceBadge confidence={item.confidence} />
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{label}</span>
            <span>·</span>
            <span>{formatDate(item.learnedAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 신뢰도 배지
 */
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);

  let colorClass = 'bg-gray-100 text-gray-600';
  if (percentage >= 80) colorClass = 'bg-green-100 text-green-700';
  else if (percentage >= 60) colorClass = 'bg-blue-100 text-blue-700';
  else if (percentage >= 40) colorClass = 'bg-yellow-100 text-yellow-700';

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
      {percentage}%
    </span>
  );
}

/**
 * 발견된 패턴 카드
 */
interface PatternCardProps {
  pattern: DiscoveredPattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const typeLabel = PATTERN_TYPE_LABELS[pattern.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {typeLabel}
        </span>
        <ConfidenceBadge confidence={pattern.confidence} />
      </div>

      <p className="font-medium text-gray-900 mb-2">{pattern.description}</p>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{pattern.occurrences}회 발견</span>
        <span>·</span>
        <span>마지막: {formatDate(pattern.lastSeen)}</span>
      </div>

      {pattern.examples && pattern.examples.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-100">
          <p className="text-xs text-gray-500 mb-1">예시:</p>
          <p className="text-sm text-gray-600 italic">
            "{pattern.examples[pattern.examples.length - 1]}"
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * 성장 타임라인
 */
interface GrowthTimelineProps {
  days?: number;
}

export function GrowthTimeline({ days = 30 }: GrowthTimelineProps) {
  const timeline = generateGrowthTimeline(days);

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 기록된 성장이 없어요
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((day, index) => (
        <motion.div
          key={day.date}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-sm font-medium text-gray-700">
              {formatDateFull(day.date)}
            </span>
            <span className="text-xs text-gray-400">
              {day.items.length}개 학습
            </span>
          </div>

          <div className="ml-4 space-y-2">
            {day.items.slice(0, 3).map(item => (
              <GrowthItemCard key={item.id} item={item} compact />
            ))}
            {day.items.length > 3 && (
              <p className="text-xs text-gray-400 ml-3">
                +{day.items.length - 3}개 더
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * 카테고리별 성장 분포
 */
export function GrowthDistribution() {
  const summary = generateGrowthSummary();
  const total = summary.totalLearnings || 1;

  const categories: { category: GrowthCategory; count: number; icon: React.ReactNode }[] = [
    { category: 'preference', count: summary.byCategory.preference, icon: <Heart className="w-4 h-4" /> },
    { category: 'pattern', count: summary.byCategory.pattern, icon: <TrendingUp className="w-4 h-4" /> },
    { category: 'accuracy', count: summary.byCategory.accuracy, icon: <Target className="w-4 h-4" /> },
    { category: 'interaction', count: summary.byCategory.interaction, icon: <MessageCircle className="w-4 h-4" /> },
    { category: 'understanding', count: summary.byCategory.understanding, icon: <Lightbulb className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-3">
      {categories.map(({ category, count, icon }) => (
        <div key={category} className="flex items-center gap-3">
          <div className="text-gray-400">{icon}</div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{GROWTH_CATEGORY_LABELS[category]}</span>
              <span className="text-gray-500">{count}개</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / total) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 주요 패턴 목록
 */
export function TopPatternsList() {
  const patterns = getConfidentPatterns(0.5).slice(0, 5);

  if (patterns.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        아직 발견된 패턴이 없어요
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patterns.map(pattern => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  );
}

/**
 * 선호도 목록
 */
export function PreferencesList() {
  const preferences = getConfidentPreferences(0.5);

  if (preferences.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        아직 파악된 선호도가 없어요
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {preferences.map(pref => (
        <div
          key={pref.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-gray-700">{pref.key}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {String(pref.value)}
            </span>
            <ConfidenceBadge confidence={pref.confidence} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 성장 레벨 배지
 */
export function GrowthLevelBadge() {
  const progress = calculateLearningProgress();

  const levelColors: Record<number, string> = {
    1: 'from-gray-400 to-gray-500',
    2: 'from-green-400 to-green-500',
    3: 'from-blue-400 to-blue-500',
    4: 'from-purple-400 to-purple-500',
    5: 'from-yellow-400 to-orange-500'
  };

  const colorClass = levelColors[Math.min(progress.level, 5)] || levelColors[5];

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white text-sm font-medium`}>
      <Brain className="w-4 h-4" />
      <span>Lv.{progress.level}</span>
    </div>
  );
}

/**
 * 성장 인사이트 카드
 */
export function GrowthInsightCard() {
  const summary = generateGrowthSummary();
  const patterns = getConfidentPatterns(0.7);

  if (patterns.length === 0 && summary.totalLearnings < 5) {
    return null;
  }

  // 가장 확실한 패턴 선택
  const topPattern = patterns[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <span className="font-medium text-gray-900">알프레도의 인사이트</span>
      </div>

      {topPattern ? (
        <p className="text-sm text-gray-700">
          "{topPattern.description}" 패턴이 {topPattern.occurrences}회나 보였어요.
          {topPattern.confidence >= 0.8 && ' 꽤 확실해요!'}
        </p>
      ) : (
        <p className="text-sm text-gray-700">
          지금까지 {summary.totalLearnings}가지를 배웠어요.
          조금씩 더 잘 알아가고 있어요.
        </p>
      )}
    </motion.div>
  );
}

// ========== 유틸리티 함수 ==========

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return '오늘';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  }

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
}
