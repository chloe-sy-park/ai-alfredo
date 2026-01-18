/**
 * Smart Insight Card
 *
 * Low-Integration Smartness UX 인사이트 카드
 * - DAY_TYPE: 하루 타입 분류
 * - MOMENT: 지금 이 순간 해석
 * - AVOID_ONE: 오늘 피해야 할 것 1개
 *
 * 점수/퍼센트 노출 금지 - confidence는 언어로만 표현
 */

import { X } from 'lucide-react';
import Card from '../common/Card';
import {
  Insight,
  InsightType,
  DAY_TYPE_META,
  CONFIDENCE_LANGUAGE
} from '../../services/smartInsight/types';

// ============================================================
// Types
// ============================================================

interface SmartInsightCardProps {
  insight: Insight;
  onCTA?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================
// Helper Functions
// ============================================================

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

/**
 * Confidence에 따른 스타일
 */
function getConfidenceStyle(confidence: Insight['confidence']): {
  bg: string;
  text: string;
  border: string;
} {
  switch (confidence) {
    case 'HIGH':
      return {
        bg: 'bg-[#E8F5E9]',
        text: 'text-[#2E7D32]',
        border: 'border-[#C8E6C9]'
      };
    case 'MED':
      return {
        bg: 'bg-[#F3E8FF]',
        text: 'text-[#7C3AED]',
        border: 'border-[#E9D5FF]'
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-[#F5F5F5]',
        text: 'text-[#666666]',
        border: 'border-[#E5E5E5]'
      };
  }
}

// ============================================================
// Component
// ============================================================

export default function SmartInsightCard({
  insight,
  onCTA,
  onDismiss,
  showDismiss = true,
  className = '',
  style
}: SmartInsightCardProps) {
  const icon = getInsightIcon(insight.type, insight.dayType);
  const typeLabel = getInsightTypeLabel(insight.type);
  const confidenceStyle = getConfidenceStyle(insight.confidence);
  const confidenceText = CONFIDENCE_LANGUAGE[insight.confidence];

  return (
    <Card
      variant="default"
      className={`relative animate-fade-in ${className}`}
      hoverable
      style={style}
    >
      {/* Dismiss 버튼 */}
      {showDismiss && onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#F5F5F5] transition-colors"
          aria-label="닫기"
        >
          <X size={16} className="text-[#999999]" />
        </button>
      )}

      <div className="space-y-3">
        {/* 타입 라벨 + 아이콘 */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${confidenceStyle.bg} ${confidenceStyle.text}`}
          >
            {typeLabel}
          </span>
        </div>

        {/* 제목 (22-36자) */}
        <h3 className="font-semibold text-[#1A1A1A] leading-snug pr-6">
          {insight.title}
        </h3>

        {/* 이유 (28-44자) */}
        <p className="text-sm text-[#666666] leading-relaxed">
          {insight.reason}
        </p>

        {/* Confidence 고백 (LOW/MED일 때만) */}
        {insight.confidence !== 'HIGH' && confidenceText.disclosure && (
          <p className="text-xs text-[#999999] italic">
            {confidenceText.disclosure}
          </p>
        )}

        {/* CTA 버튼 */}
        {insight.cta && onCTA && (
          <button
            onClick={onCTA}
            className={`w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all
              ${insight.type === 'AVOID_ONE'
                ? 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                : 'bg-[#F0EDFF] text-[#7C3AED] hover:bg-[#E8E4FF]'
              }
            `}
          >
            {insight.cta.label}
          </button>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// Smart Insight Section
// ============================================================

interface SmartInsightSectionProps {
  insights: Insight[];
  onCTA: (insight: Insight) => void;
  onDismiss: (insightId: string) => void;
  className?: string;
}

export function SmartInsightSection({
  insights,
  onCTA,
  onDismiss,
  className = ''
}: SmartInsightSectionProps) {
  if (insights.length === 0) {
    return null;
  }

  // 최대 2개만 표시
  const visibleInsights = insights.slice(0, 2);

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleInsights.map((insight, index) => (
        <SmartInsightCard
          key={insight.id}
          insight={insight}
          onCTA={() => onCTA(insight)}
          onDismiss={() => onDismiss(insight.id)}
          className={`animate-slide-down`}
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
