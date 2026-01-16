import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore, Notification } from '../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const { markAsRead, removeNotification } = useNotificationStore();

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    nudge: 'bg-purple-50 border-purple-200'
  };

  const handleClick = () => {
    markAsRead(notification.id);
    if (notification.action?.path) {
      navigate(notification.action.path);
    } else if (notification.action?.onClick) {
      notification.action.onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`p-3 rounded-lg border ${typeStyles[notification.type]} ${
        !notification.read ? 'ring-2 ring-[#A996FF]/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-[#1A1A1A]">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 bg-[#A996FF] rounded-full" />
            )}
          </div>
          <p className="text-xs text-[#666666] mt-1">{notification.message}</p>
          <p className="text-xs text-[#999999] mt-2">
            {formatTimeAgo(notification.timestamp)}
          </p>
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="p-1 text-[#999999] hover:text-[#666666] hover:bg-white/50 rounded"
        >
          <X size={14} />
        </button>
      </div>
      {notification.action && (
        <button
          onClick={handleClick}
          className="mt-2 text-xs text-[#A996FF] hover:text-[#8B7BE8] font-medium"
        >
          {notification.action.label} →
        </button>
      )}
    </motion.div>
  );
}

export default function NotificationPanel() {
  const { isOpen, close, notifications, unreadCount, markAllAsRead, clearAll } =
    useNotificationStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-16 right-4 w-80 max-h-[70vh] bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#A996FF]" />
                <h3 className="font-semibold text-[#1A1A1A]">알림</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#A996FF] text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={close}
                className="p-1 text-[#999999] hover:text-[#666666] hover:bg-[#F5F5F5] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#E5E5E5]">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#666666] hover:bg-[#F5F5F5] rounded"
                >
                  <CheckCheck size={14} />
                  모두 읽음
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#666666] hover:bg-[#F5F5F5] rounded"
                >
                  <Trash2 size={14} />
                  전체 삭제
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(70vh-120px)] p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={32} className="mx-auto text-[#E5E5E5] mb-2" />
                  <p className="text-sm text-[#999999]">알림이 없어요</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
