/**
 * InsightCarousel.tsx
 * 오늘 하루 / 지금 이 순간 카드를 좌우 슬라이드로 표시하는 캐러셀
 */

import { useState, useRef, TouchEvent } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Insight,
  InsightType,
  DAY_TYPE_META,
  CONFIDENCE_LANGUAGE
} from '../../services/smartInsight/types';

interface InsightCarouselProps {
  insights: Insight[];
  onCTA: (insight: Insight) => void;
  onDismiss: (insightId: string) => void;
}

/**
 * 인사이트 타입별 아이콘
 */
function getInsightIcon(type: InsightType, dayType?: string): string {
  if (type === 'DAY_TYPE' && dayType) {
    return DAY_TYPE_META[dayType as keyof typeof DAY_TYPE_META]?.emoji || '📊';
  }

  switch (type) {
    case 'MOMENT':
      return '💭';
    case 'AVOID_ONE':
      return '⚠️';
    default:
      return '💡';
  }
}

/**
 * 인사이트 타입별 라벨
 */
function getInsightTypeLabel(type: InsightType): string {
  switch (type) {
    case 'DAY_TYPE':
      return '오늘 하루';
    case 'MOMENT':
      return '지금 이 순간';
    case 'AVOID_ONE':
      return '오늘은 피해요';
    default:
      return '인사이트';
  }
}

export default function InsightCarousel({
  insights,
  onCTA,
  onDismiss
}: InsightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (insights.length === 0) {
    return null;
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && currentIndex < insights.length - 1) {
      // Swipe left - next
      setCurrentIndex(currentIndex + 1);
    } else if (diff < -threshold && currentIndex > 0) {
      // Swipe right - prev
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < insights.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentInsight = insights[currentIndex];
  const icon = getInsightIcon(currentInsight.type, currentInsight.dayType);
  const typeLabel = getInsightTypeLabel(currentInsight.type);
  const confidenceText = CONFIDENCE_LANGUAGE[currentInsight.confidence];

  return (
    <div className="relative">
      {/* 캐러셀 컨테이너 */}
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative p-4 rounded-2xl"
            style={{ backgroundColor: 'var(--surface-default)' }}
          >
            {/* Dismiss 버튼 */}
            <button
              onClick={() => onDismiss(currentInsight.id)}
              className="absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10"
              style={{ color: 'var(--text-tertiary)' }}
              aria-label="닫기"
            >
              <X size={16} />
            </button>

            <div className="space-y-2">
              {/* 타입 라벨 + 아이콘 */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(169, 150, 255, 0.15)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  {typeLabel}
                </span>
              </div>

              {/* 제목 */}
              <h3
                className="font-semibold leading-snug pr-6"
                style={{ color: 'var(--text-primary)' }}
              >
                {currentInsight.title}
              </h3>

              {/* 이유 */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {currentInsight.reason}
              </p>

              {/* Confidence 고백 */}
              {currentInsight.confidence !== 'HIGH' && confidenceText.disclosure && (
                <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                  {confidenceText.disclosure}
                </p>
              )}

              {/* CTA 버튼 */}
              {currentInsight.cta && (
                <button
                  onClick={() => onCTA(currentInsight)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'rgba(169, 150, 255, 0.15)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  {currentInsight.cta.label}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 페이지 인디케이터 & 네비게이션 */}
      {insights.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          {/* 이전 버튼 */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-full transition-colors disabled:opacity-30"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="이전"
          >
            <ChevronLeft size={18} />
          </button>

          {/* 도트 인디케이터 */}
          <div className="flex items-center gap-1.5">
            {insights.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-4'
                    : ''
                }`}
                style={{
                  backgroundColor:
                    idx === currentIndex
                      ? 'var(--accent-primary)'
                      : 'var(--border-default)'
                }}
                aria-label={`${idx + 1}번째 인사이트`}
              />
            ))}
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={goToNext}
            disabled={currentIndex === insights.length - 1}
            className="p-1.5 rounded-full transition-colors disabled:opacity-30"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="다음"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
