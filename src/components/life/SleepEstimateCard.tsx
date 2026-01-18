/**
 * SleepEstimateCard
 *
 * 아침 브리핑에서 수면 추정 결과를 표시하는 카드
 * - 추정된 수면 시간 표시
 * - 확신도(⭐) 표시
 * - [맞아요] / [조금 달라요] 버튼
 */

import { useState } from 'react';
import { useLifeOSStore, SleepWindow } from '../../stores/lifeOSStore';

interface SleepEstimateCardProps {
  date: string;
  sleepWindow?: SleepWindow | null;
  isLoading?: boolean;
  onConfirmAccurate?: (date: string) => void;
  onRequestCorrection?: (date: string) => void;
  mode?: 'default' | 'compact' | 'travel';
}

// Helper: 시간 포맷 (01:20 형식)
function formatTime(isoString: string | null): string {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper: 확신도 별 표시
function renderConfidenceStars(stars: 1 | 2 | 3): string {
  return '⭐'.repeat(stars);
}

// Helper: 수면 시간 포맷 (6시간 30분)
function formatDuration(minutes: number | null): string {
  if (!minutes) return '--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

export default function SleepEstimateCard({
  date,
  sleepWindow,
  isLoading = false,
  onConfirmAccurate,
  onRequestCorrection,
  mode = 'default',
}: SleepEstimateCardProps) {
  const [responded, setResponded] = useState(false);
  const { confirmSleepAccurate } = useLifeOSStore();

  // 수면 데이터가 없으면 표시하지 않음
  if (!sleepWindow && !isLoading) {
    return null;
  }

  const handleConfirm = () => {
    setResponded(true);
    if (onConfirmAccurate) {
      onConfirmAccurate(date);
    } else {
      confirmSleepAccurate(date);
    }
  };

  const handleCorrection = () => {
    if (onRequestCorrection) {
      onRequestCorrection(date);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  // 이미 응답한 경우
  if (responded) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          🎩 알겠어요, 기억할게요
        </span>
      </div>
    );
  }

  // 컴팩트 모드
  if (mode === 'compact') {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">😴</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {formatDuration(sleepWindow?.durationMin || null)}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {renderConfidenceStars(sleepWindow?.confidenceStars || 1)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--surface-subtle)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">😴</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            어젯밤 수면 추정
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          확신도 {renderConfidenceStars(sleepWindow?.confidenceStars || 1)}
        </span>
      </div>

      {/* 수면 시간 */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatTime(sleepWindow?.bedtimeTs || null)}
          </span>
          <span className="text-lg" style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatTime(sleepWindow?.waketimeTs || null)}
          </span>
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          약 {formatDuration(sleepWindow?.durationMin || null)}
        </span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
          }}
        >
          맞아요
        </button>
        <button
          onClick={handleCorrection}
          className="flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors"
          style={{
            backgroundColor: 'var(--surface-default)',
            color: 'var(--text-secondary)',
          }}
        >
          조금 달라요
        </button>
      </div>

      {/* 정정된 경우 표시 */}
      {sleepWindow?.source === 'corrected_by_user' && (
        <div className="mt-3 text-center">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            ✓ 정정됨
          </span>
        </div>
      )}
    </div>
  );
}
