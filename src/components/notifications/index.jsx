import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Clock, Calendar, Target, CheckCircle2, 
  ChevronRight, AlertCircle, Zap
} from 'lucide-react';

const SmartNotificationToast = ({ 
  notifications = [], 
  onDismiss, 
  onAction,
  darkMode = false,
  maxShow = 2 
}) => {
  const visibleNotifications = notifications.slice(0, maxShow);
  
  if (visibleNotifications.length === 0) return null;
  
  const colorMap = {
    red: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/30', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-300' },
  };
  
  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification, index) => {
        const colors = colorMap[notification.color] || colorMap.blue;
        
        return (
          <div
            key={notification.id}
            className={`${colors.bg} ${colors.border} border rounded-xl p-3 shadow-lg backdrop-blur-sm animate-slide-in-from-top`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{notification.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${colors.text}`}>{notification.title}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  {notification.message}
                </p>
              </div>
              <button 
                onClick={() => onDismiss?.(notification.id)}
                className={`p-1 hover:bg-black/10 rounded ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <X size={14} />
              </button>
            </div>
            
            {notification.action && (
              <button
                onClick={() => onAction?.(notification.action, notification)}
                className={`mt-2 w-full py-2 rounded-lg text-xs font-semibold ${colors.text} bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-colors`}
              >
                {notification.action.label}
              </button>
            )}
          </div>
        );
      })}
      
      {notifications.length > maxShow && (
        <div className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          +{notifications.length - maxShow}개 더
        </div>
      )}
      
      <style>{`
        @keyframes slide-in-from-top {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-from-top {
          animation: slide-in-from-top 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// 알림 센터 컴포넌트 (전체 알림 목록)
const NotificationCenter = ({ 
  isOpen, 
  onClose, 
  notifications = [],
  onDismiss,
  onDismissAll,
  onAction,
  darkMode = false 
}) => {
  if (!isOpen) return null;
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 알림 그룹화
  const grouped = {
    urgent: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.URGENT),
    today: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.HIGH || n.priority === NOTIFICATION_PRIORITY.MEDIUM),
    other: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.LOW),
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-md mx-4 ${cardBg} rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col`}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-[#A996FF]" />
            <h2 className={`font-bold ${textPrimary}`}>알림</h2>
            {notifications.length > 0 && (
              <span className="px-2 py-0.5 bg-[#A996FF] text-white text-xs rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={onDismissAll}
                className={`text-xs ${textSecondary} hover:text-[#A996FF]`}
              >
                모두 지우기
              </button>
            )}
            <button onClick={onClose} className={`p-1 ${textSecondary}`}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* 알림 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🔔</span>
              <p className={`mt-2 ${textSecondary}`}>새로운 알림이 없어요</p>
            </div>
          ) : (
            <>
              {/* 긴급 */}
              {grouped.urgent.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-2">🔴 긴급</p>
                  <div className="space-y-2">
                    {grouped.urgent.map(n => (
                      <NotificationItem 
                        key={n.id} 
                        notification={n} 
                        onDismiss={onDismiss}
                        onAction={onAction}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* 오늘 */}
              {grouped.today.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold ${textSecondary} mb-2`}>📅 오늘</p>
                  <div className="space-y-2">
                    {grouped.today.map(n => (
                      <NotificationItem 
                        key={n.id} 
                        notification={n} 
                        onDismiss={onDismiss}
                        onAction={onAction}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* 기타 */}
              {grouped.other.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold ${textSecondary} mb-2`}>💡 참고</p>
                  <div className="space-y-2">
                    {grouped.other.map(n => (
                      <NotificationItem 
                        key={n.id} 
                        notification={n} 
                        onDismiss={onDismiss}
                        onAction={onAction}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 알림 아이템 컴포넌트
const NotificationItem = ({ notification, onDismiss, onAction, darkMode }) => {
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const itemBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  
  return (
    <div className={`${itemBg} rounded-xl p-3`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{notification.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${textPrimary}`}>{notification.title}</p>
          <p className={`text-xs ${textSecondary} truncate`}>{notification.message}</p>
        </div>
        <button 
          onClick={() => onDismiss?.(notification.id)}
          className={`p-1 ${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-600 rounded`}
        >
          <X size={14} />
        </button>
      </div>
      {notification.action && (
        <button
          onClick={() => onAction?.(notification.action, notification)}
          className="mt-2 w-full py-2 bg-[#A996FF]/20 text-[#A996FF] rounded-lg text-xs font-semibold hover:bg-[#A996FF]/30 transition-colors"
        >
          {notification.action.label}
        </button>
      )}
    </div>
  );
};

// === Phase 10: 프로젝트 관리 강화 ===

export { SmartNotificationToast, NotificationCenter, NotificationItem };
