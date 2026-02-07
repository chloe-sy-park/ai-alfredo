/**
 * Lift Record Table - MVP
 * 판단 이력(Lift) 테이블 + 저장 로직
 */

import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Eye, Clock, TrendingUp } from 'lucide-react';
import { useLiftStore, LiftRecord } from '../../stores/liftStore';
import Card from '../common/Card';

type TimeFilter = 'today' | 'week' | 'month';

const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444' },
  medium: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B' },
  low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E' },
};

const TYPE_LABELS: Record<string, { icon: typeof ArrowUpRight; label: string }> = {
  apply: { icon: ArrowUpRight, label: '적용' },
  maintain: { icon: ArrowRight, label: '유지' },
  consider: { icon: Eye, label: '검토' },
};

const CATEGORY_LABELS: Record<string, string> = {
  priority: '우선순위',
  schedule: '일정',
  worklife: '워라밸',
  condition: '컨디션',
};

function formatTime(timestamp: Date): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDate(timestamp: Date): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

interface LiftRecordTableProps {
  maxRows?: number;
  showFilter?: boolean;
  compact?: boolean;
}

export default function LiftRecordTable({
  maxRows = 10,
  showFilter = true,
  compact = false,
}: LiftRecordTableProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const { getTodayLifts, getWeeklyLifts, getMonthlyLifts, getDecisionFatigueAnalysis } = useLiftStore();

  const lifts = (() => {
    switch (timeFilter) {
      case 'today': return getTodayLifts();
      case 'week': return getWeeklyLifts();
      case 'month': return getMonthlyLifts();
    }
  })();

  const displayLifts = lifts.slice(0, maxRows);
  const fatigueAnalysis = getDecisionFatigueAnalysis();

  if (compact) {
    return (
      <Card className="animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Lift 기록
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-tertiary)',
            }}>
              {lifts.length}건
            </span>
          </div>
          {fatigueAnalysis.level !== 'low' && (
            <span className="text-[11px] px-2 py-1 rounded-full" style={{
              backgroundColor: fatigueAnalysis.level === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: fatigueAnalysis.level === 'high' ? '#EF4444' : '#F59E0B',
            }}>
              {fatigueAnalysis.warning}
            </span>
          )}
        </div>

        {displayLifts.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
            아직 기록이 없어요
          </p>
        ) : (
          <div className="space-y-1.5">
            {displayLifts.slice(0, 3).map((lift) => (
              <LiftRowCompact key={lift.id} lift={lift} />
            ))}
            {lifts.length > 3 && (
              <p className="text-[11px] text-center pt-1" style={{ color: 'var(--text-tertiary)' }}>
                +{lifts.length - 3}건 더
              </p>
            )}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Lift 기록
          </h2>
        </div>
        {showFilter && (
          <div className="flex gap-1">
            {(['today', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: timeFilter === filter ? 'var(--accent-primary)' : 'var(--surface-subtle)',
                  color: timeFilter === filter ? 'var(--accent-on)' : 'var(--text-tertiary)',
                }}
              >
                {filter === 'today' ? '오늘' : filter === 'week' ? '이번 주' : '이번 달'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 결정 피로 경고 */}
      {fatigueAnalysis.level !== 'low' && (
        <div
          className="mb-4 p-3 rounded-xl text-sm"
          style={{
            backgroundColor: fatigueAnalysis.level === 'high' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            color: fatigueAnalysis.level === 'high' ? '#DC2626' : '#D97706',
          }}
        >
          <p className="font-medium">{fatigueAnalysis.warning}</p>
          {fatigueAnalysis.suggestion && (
            <p className="text-xs mt-1 opacity-80">{fatigueAnalysis.suggestion}</p>
          )}
        </div>
      )}

      {/* 리스트 */}
      {displayLifts.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={24} style={{ color: 'var(--text-disabled)' }} className="mx-auto mb-2" />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            아직 판단 기록이 없어요
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>
            Top 3를 설정하면 기록이 시작돼요
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayLifts.map((lift) => (
            <LiftRow key={lift.id} lift={lift} showDate={timeFilter !== 'today'} />
          ))}
        </div>
      )}
    </Card>
  );
}

function LiftRow({ lift, showDate = false }: { lift: LiftRecord; showDate?: boolean }) {
  const typeInfo = TYPE_LABELS[lift.type] || TYPE_LABELS.apply;
  const TypeIcon = typeInfo.icon;
  const impactColor = IMPACT_COLORS[lift.impact] || IMPACT_COLORS.medium;

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl transition-colors"
      style={{ backgroundColor: 'var(--surface-default)' }}
    >
      {/* 타입 아이콘 */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: impactColor.bg }}
      >
        <TypeIcon size={14} style={{ color: impactColor.text }} />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-tertiary)',
          }}>
            {CATEGORY_LABELS[lift.category] || lift.category}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
            {showDate ? formatDate(lift.timestamp) + ' ' : ''}{formatTime(lift.timestamp)}
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
          {lift.previousDecision} → {lift.newDecision}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {lift.reason}
        </p>
      </div>

      {/* 영향도 */}
      <span
        className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: impactColor.bg, color: impactColor.text }}
      >
        {lift.impact === 'high' ? '높음' : lift.impact === 'medium' ? '중간' : '낮음'}
      </span>
    </div>
  );
}

function LiftRowCompact({ lift }: { lift: LiftRecord }) {
  const impactColor = IMPACT_COLORS[lift.impact] || IMPACT_COLORS.medium;

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
      style={{ backgroundColor: 'var(--surface-default)' }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: impactColor.text }}
      />
      <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
        {lift.newDecision}
      </span>
      <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-disabled)' }}>
        {formatTime(lift.timestamp)}
      </span>
    </div>
  );
}
