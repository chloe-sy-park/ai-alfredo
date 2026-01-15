/**
 * Proxy Action Card
 * 알프레도가 대신 판단한 것을 보여주는 카드
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Clock, Target, Shield, AlertTriangle } from 'lucide-react';
import { ProxyAction } from '../../services/proxy/types';
import { useProxyStore } from '../../stores/proxyStore';

interface ProxyActionCardProps {
  action: ProxyAction;
  compact?: boolean;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export const ProxyActionCard: React.FC<ProxyActionCardProps> = ({
  action,
  compact = false,
  onAccept,
  onDismiss
}) => {
  const { acceptAction, dismissAction } = useProxyStore();

  const handleAccept = () => {
    acceptAction(action.id);
    onAccept?.();
  };

  const handleDismiss = () => {
    dismissAction(action.id);
    onDismiss?.();
  };

  // 아이콘 선택
  const getIcon = () => {
    switch (action.type) {
      case 'prioritize':
        return <Target className="w-5 h-5" />;
      case 'protect_time':
        return <Clock className="w-5 h-5" />;
      case 'overload_warn':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  // 색상 선택
  const getColorClass = () => {
    switch (action.urgency) {
      case 'high':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700';
    }
  };

  const getIconColorClass = () => {
    switch (action.urgency) {
      case 'high':
        return 'text-amber-600 dark:text-amber-400';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-lg border p-3 ${getColorClass()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={getIconColorClass()}>{getIcon()}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {action.title}
            </span>
          </div>
          {action.status === 'pending' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleAccept}
                className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border p-4 ${getColorClass()}`}
    >
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 ${getIconColorClass()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {action.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {action.description}
          </p>
        </div>
      </div>

      {/* 이유 */}
      <div className="mt-3 pl-11">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          "{action.reasoning}"
        </p>
      </div>

      {/* 액션 버튼 */}
      {action.status === 'pending' && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {action.userControls.canDismiss && (
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              괜찮아요
            </button>
          )}
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            좋아요
          </button>
        </div>
      )}

      {/* 완료 상태 */}
      {action.status === 'accepted' && (
        <div className="mt-3 pl-11 flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check className="w-4 h-4" />
          <span className="text-sm">수락했어요</span>
        </div>
      )}

      {action.status === 'dismissed' && (
        <div className="mt-3 pl-11 flex items-center gap-2 text-gray-400">
          <X className="w-4 h-4" />
          <span className="text-sm">다음에 할게요</span>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Proxy Actions 리스트
 */
interface ProxyActionsListProps {
  actions: ProxyAction[];
  maxItems?: number;
  showEmpty?: boolean;
}

export const ProxyActionsList: React.FC<ProxyActionsListProps> = ({
  actions,
  maxItems = 3,
  showEmpty = false
}) => {
  const pendingActions = actions.filter(a => a.status === 'pending');
  const displayActions = pendingActions.slice(0, maxItems);

  if (displayActions.length === 0 && !showEmpty) {
    return null;
  }

  if (displayActions.length === 0 && showEmpty) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">오늘은 특별히 챙겨드릴 게 없어요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {displayActions.map((action) => (
          <ProxyActionCard key={action.id} action={action} />
        ))}
      </AnimatePresence>

      {pendingActions.length > maxItems && (
        <button className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center gap-1">
          +{pendingActions.length - maxItems}개 더 보기
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * 작은 Proxy Badge (홈 화면용)
 */
interface ProxyBadgeProps {
  count: number;
  onClick?: () => void;
}

export const ProxyBadge: React.FC<ProxyBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium dark:bg-blue-900/30 dark:text-blue-400"
    >
      <Shield className="w-4 h-4" />
      <span>{count}개 챙겨뒀어요</span>
    </motion.button>
  );
};

export default ProxyActionCard;
