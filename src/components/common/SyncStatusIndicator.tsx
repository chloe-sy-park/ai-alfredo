/**
 * SyncStatusIndicator
 * 동기화 상태 표시 컴포넌트
 */

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import { subscribeSyncState, getSyncState, SyncStatus } from '../../services/sync/syncService';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  pendingCount: number;
  error: string | null;
}

const STATUS_CONFIG: Record<SyncStatus, {
  icon: typeof Cloud;
  color: string;
  darkColor: string;
  label: string;
  animate?: boolean;
}> = {
  idle: {
    icon: Cloud,
    color: 'text-green-500',
    darkColor: 'dark:text-green-400',
    label: '동기화됨'
  },
  syncing: {
    icon: Loader2,
    color: 'text-[#A996FF]',
    darkColor: 'dark:text-[#A996FF]',
    label: '동기화 중...',
    animate: true
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    darkColor: 'dark:text-red-400',
    label: '동기화 오류'
  },
  offline: {
    icon: CloudOff,
    color: 'text-gray-500',
    darkColor: 'dark:text-gray-400',
    label: '오프라인'
  },
};

interface SyncStatusIndicatorProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function SyncStatusIndicator({
  size = 'sm',
  showLabel = false,
}: SyncStatusIndicatorProps) {
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());

  useEffect(() => {
    return subscribeSyncState(setSyncState);
  }, []);

  const config = STATUS_CONFIG[syncState.status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.color} ${config.darkColor}`}
      title={config.label}
    >
      <Icon
        size={iconSize}
        className={config.animate ? 'animate-spin' : ''}
      />
      {showLabel && (
        <span className="text-xs font-medium">{config.label}</span>
      )}
      {syncState.pendingCount > 0 && (
        <span className="text-[10px] bg-[#A996FF]/20 text-[#A996FF] px-1.5 rounded-full">
          {syncState.pendingCount}
        </span>
      )}
    </div>
  );
}

export default SyncStatusIndicator;
