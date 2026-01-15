/**
 * Memory Framing UI 컴포넌트
 * 알프레도와 함께한 기억을 시각화
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Memory,
  MemoryCollection,
  MemoryType,
  MEMORY_FRAMES
} from '../../services/memory/types';
import {
  getRecentMemories,
  getHighlightMemories,
  getTodayMemories,
  getRecentCollections,
  getDaysTogether,
  getTodaySummaryMessage,
  markCollectionViewed
} from '../../services/memory/memoryService';

/**
 * 기억 카드
 */
interface MemoryCardProps {
  memory: Memory;
  compact?: boolean;
  onClick?: () => void;
}

export function MemoryCard({ memory, compact = false, onClick }: MemoryCardProps) {
  const frame = MEMORY_FRAMES[memory.type]?.[0];
  const emoji = frame?.emoji || '📝';

  const toneColors: Record<string, string> = {
    celebratory: 'bg-yellow-50 border-yellow-200',
    reflective: 'bg-blue-50 border-blue-200',
    encouraging: 'bg-green-50 border-green-200',
    grateful: 'bg-purple-50 border-purple-200',
    supportive: 'bg-orange-50 border-orange-200'
  };

  const colorClass = toneColors[memory.tone] || 'bg-gray-50 border-gray-200';

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 rounded-lg border ${colorClass} cursor-pointer`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-sm text-gray-700 truncate">{memory.title}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${colorClass}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{memory.title}</h4>
          {memory.description && (
            <p className="text-sm text-gray-600 mt-1">{memory.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {formatMemoryDate(memory.createdAt)}
          </p>
        </div>
        {memory.importance === 'highlight' && (
          <span className="text-yellow-500">⭐</span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * 오늘의 기억 목록
 */
export function TodayMemories() {
  const memories = getTodayMemories();
  const summaryMessage = getTodaySummaryMessage();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">오늘의 순간</h3>
        <span className="text-xs text-gray-500">{memories.length}개</span>
      </div>

      {memories.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          {summaryMessage}
        </p>
      ) : (
        <div className="space-y-2">
          {memories.slice(0, 5).map(memory => (
            <MemoryCard key={memory.id} memory={memory} compact />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 최근 기억 타임라인
 */
interface MemoryTimelineProps {
  limit?: number;
}

export function MemoryTimeline({ limit = 10 }: MemoryTimelineProps) {
  const memories = getRecentMemories(limit);

  if (memories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 함께한 기억이 없어요
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 타임라인 선 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-10"
          >
            {/* 타임라인 점 */}
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full ${
                memory.importance === 'highlight'
                  ? 'bg-yellow-400'
                  : memory.importance === 'notable'
                  ? 'bg-blue-400'
                  : 'bg-gray-300'
              }`}
            />

            <MemoryCard memory={memory} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * 하이라이트 캐러셀
 */
export function HighlightCarousel() {
  const highlights = getHighlightMemories().slice(0, 5);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  if (highlights.length === 0) {
    return null;
  }

  const current = highlights[currentIndex];

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">✨ 특별한 순간</h3>
        <div className="flex gap-1">
          {highlights.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-orange-400' : 'bg-orange-200'
              }`}
            />
          ))}
        </div>
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <MemoryCard memory={current} />
      </motion.div>
    </div>
  );
}

/**
 * 기억 컬렉션 카드 (주간/월간 리뷰)
 */
interface CollectionCardProps {
  collection: MemoryCollection;
  onClick?: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const periodLabel = collection.period === 'weekly' ? '주간' : '월간';
  const dateRange = formatDateRange(collection.startDate, collection.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${
        collection.viewed
          ? 'bg-white border-gray-200'
          : 'bg-blue-50 border-blue-200'
      } cursor-pointer`}
      onClick={() => {
        markCollectionViewed(collection.id);
        onClick?.();
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-gray-500">{periodLabel} 리뷰</span>
          <h3 className="font-medium text-gray-900">{collection.summary.headline}</h3>
        </div>
        {!collection.viewed && (
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-3">{dateRange}</p>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatItem
          label="활동일"
          value={collection.summary.stats.daysActive}
          suffix="일"
        />
        <StatItem
          label="완료"
          value={collection.summary.stats.tasksCompleted}
          suffix="개"
        />
        <StatItem
          label="집중"
          value={Math.floor(collection.summary.stats.focusMinutes / 60)}
          suffix="시간"
        />
      </div>

      {/* 하이라이트 */}
      {collection.summary.highlights.length > 0 && (
        <div className="space-y-1">
          {collection.summary.highlights.slice(0, 2).map((highlight, i) => (
            <p key={i} className="text-xs text-gray-600">
              • {highlight}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * 통계 아이템
 */
function StatItem({
  label,
  value,
  suffix
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-gray-900">
        {value}
        <span className="text-xs font-normal text-gray-500">{suffix}</span>
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

/**
 * 최근 컬렉션 목록
 */
export function RecentCollections() {
  const collections = getRecentCollections(3);

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">📊 지난 기록</h3>
      <div className="space-y-3">
        {collections.map(collection => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}

/**
 * 함께한 날 카운터
 */
export function DaysTogetherCounter() {
  const days = getDaysTogether();

  if (days === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">오늘 처음 만났어요 👋</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4"
    >
      <div className="text-4xl font-bold text-gray-900 mb-1">
        D+{days}
      </div>
      <p className="text-sm text-gray-600">
        {days < 7
          ? '알아가는 중이에요'
          : days < 30
          ? '점점 가까워지고 있어요'
          : days < 100
          ? '꽤 많이 함께했네요'
          : '오래된 친구가 됐어요'}
      </p>
    </motion.div>
  );
}

/**
 * 컬렉션 상세 모달
 */
interface CollectionDetailModalProps {
  collection: MemoryCollection;
  isOpen: boolean;
  onClose: () => void;
}

export function CollectionDetailModal({
  collection,
  isOpen,
  onClose
}: CollectionDetailModalProps) {
  if (!isOpen) return null;

  const periodLabel = collection.period === 'weekly' ? '주간' : '월간';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <span className="text-xs text-gray-500">{periodLabel} 리뷰</span>
          <h2 className="text-xl font-bold text-gray-900">
            {collection.summary.headline}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {formatDateRange(collection.startDate, collection.endDate)}
          </p>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* 통계 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {collection.summary.stats.daysActive}
              </div>
              <div className="text-xs text-gray-500">활동한 날</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {collection.summary.stats.tasksCompleted}
              </div>
              <div className="text-xs text-gray-500">완료한 일</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(collection.summary.stats.focusMinutes / 60)}
              </div>
              <div className="text-xs text-gray-500">집중 시간</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {collection.summary.stats.milestonesAchieved}
              </div>
              <div className="text-xs text-gray-500">마일스톤</div>
            </div>
          </div>

          {/* 하이라이트 */}
          {collection.summary.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                ✨ 하이라이트
              </h3>
              <ul className="space-y-1">
                {collection.summary.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    • {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 기억들 */}
          {collection.memories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                📝 특별한 순간들
              </h3>
              <div className="space-y-2">
                {collection.memories.slice(0, 5).map(memory => (
                  <MemoryCard key={memory.id} memory={memory} compact />
                ))}
              </div>
            </div>
          )}

          {/* 회고 메시지 */}
          {collection.summary.reflection && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 italic">
                "{collection.summary.reflection}"
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * 기억 타입 아이콘
 */
export function getMemoryTypeIcon(type: MemoryType): string {
  const frame = MEMORY_FRAMES[type]?.[0];
  return frame?.emoji || '📝';
}

// ========== 유틸리티 함수 ==========

function formatMemoryDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
  const endStr = end.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });

  return `${startStr} - ${endStr}`;
}
