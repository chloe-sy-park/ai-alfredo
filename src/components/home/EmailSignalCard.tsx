/**
 * Email Signal Card
 *
 * Today에 표시되는 이메일 신호 카드
 * Type A (미팅 초대) 또는 Type B (Work-Context)만 표시
 *
 * 금지사항:
 * - 본문 표시
 * - 자동 Task 생성
 * - 답장 기능
 */

import { Mail, ExternalLink, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import { EmailSignal, EmailType, EMAIL_TYPE_LABELS } from '../../services/email/types';
import { useEmailSignalStore } from '../../services/email/emailSignalStore';

// ============================================================
// Types
// ============================================================

interface EmailSignalCardProps {
  signal: EmailSignal;
  className?: string;
  style?: React.CSSProperties;
}

interface EmailSignalSectionProps {
  className?: string;
}

// ============================================================
// Helper Functions
// ============================================================

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return '어제';
}

function getTypeIcon(type: EmailType): string {
  switch (type) {
    case 'A': return '📅';
    case 'B': return '💼';
    default: return '📧';
  }
}

// ============================================================
// Single Email Signal Card
// ============================================================

export function EmailSignalCard({
  signal,
  className = '',
  style
}: EmailSignalCardProps) {
  const openDeepLink = () => {
    if (signal.deepLink) {
      window.open(signal.deepLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      variant="default"
      hoverable
      className={`cursor-pointer ${className}`}
      style={style}
      onClick={openDeepLink}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-10 h-10 rounded-full bg-[#F0EDFF] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getTypeIcon(signal.type)}</span>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 헤드라인 */}
          <p className="text-sm font-medium text-[#1A1A1A] leading-snug">
            {signal.headline}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* 타입 라벨 */}
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#F0EDFF] text-[#7C3AED]">
              {EMAIL_TYPE_LABELS[signal.type]}
            </span>

            {/* 시간 */}
            <span className="text-xs text-[#999999]">
              {getTimeAgo(signal.receivedAt)}
            </span>

            {/* 발신자 */}
            <span className="text-xs text-[#999999] truncate max-w-[120px]">
              {signal.senderName || signal.sender.split('@')[0]}
            </span>
          </div>

          {/* 연결된 미팅 표시 */}
          {signal.relatedMeetingTitle && (
            <p className="text-xs text-[#666666] mt-1.5 flex items-center gap-1">
              <span className="text-[#7C3AED]">↳</span>
              "{signal.relatedMeetingTitle}" 관련
            </p>
          )}
        </div>

        {/* 딥링크 아이콘 */}
        <div className="flex-shrink-0">
          <ExternalLink size={16} className="text-[#999999]" />
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Silent Correction Chip
// ============================================================

interface SilentCorrectionChipProps {
  emailId: string;
  currentType: EmailType;
  onCorrect: (emailId: string, isWork: boolean) => void;
}

export function SilentCorrectionChip({
  emailId,
  currentType,
  onCorrect
}: SilentCorrectionChipProps) {
  const isWork = currentType === 'A' || currentType === 'B' || currentType === 'C';

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#999999]">
        {isWork ? 'Work' : 'Life'}로 분류됨
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCorrect(emailId, !isWork);
        }}
        className="text-[#7C3AED] hover:underline"
      >
        {isWork ? 'Life예요' : 'Work예요'}
      </button>
    </div>
  );
}

// ============================================================
// Email Signal Section (for Home.tsx)
// ============================================================

export function EmailSignalSection({ className = '' }: EmailSignalSectionProps) {
  const { isLoading, getSignalsForToday } = useEmailSignalStore();
  const todaySignals = getSignalsForToday();

  // 신호가 없으면 렌더링 안 함
  if (todaySignals.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-[#7C3AED]" />
          <h3 className="text-sm font-medium text-[#1A1A1A]">
            확인하면 좋을 이메일
          </h3>
        </div>

        {todaySignals.length > 0 && (
          <span className="text-xs text-[#999999]">
            {todaySignals.length}개
          </span>
        )}
      </div>

      {/* 로딩 */}
      {isLoading && (
        <Card variant="default" className="animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#F5F5F5] rounded w-3/4" />
              <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
            </div>
          </div>
        </Card>
      )}

      {/* 신호 카드 목록 */}
      {!isLoading && todaySignals.map((signal, index) => (
        <EmailSignalCard
          key={signal.id}
          signal={signal}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        />
      ))}

      {/* 더 보기 (미구현 - Inbox UI 금지) */}
      {/* Email은 앱 내에서 관리하지 않음 */}
    </div>
  );
}

// ============================================================
// Compact Email Signal (for briefing)
// ============================================================

interface CompactEmailSignalProps {
  signals: EmailSignal[];
  onOpenAll?: () => void;
}

export function CompactEmailSignal({ signals, onOpenAll }: CompactEmailSignalProps) {
  if (signals.length === 0) return null;

  const firstSignal = signals[0];

  return (
    <button
      onClick={onOpenAll}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#F9F8FF] hover:bg-[#F0EDFF] transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-full bg-[#F0EDFF] flex items-center justify-center">
        <Mail size={14} className="text-[#7C3AED]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1A1A1A] truncate">
          {firstSignal.headline}
        </p>
        {signals.length > 1 && (
          <p className="text-xs text-[#999999]">
            +{signals.length - 1}개 더
          </p>
        )}
      </div>

      <ChevronRight size={16} className="text-[#999999]" />
    </button>
  );
}

// ============================================================
// Default Export
// ============================================================

export default EmailSignalCard;
