import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'nudge';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    path?: string;
    onClick?: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  isOpen: boolean;
  unreadCount: number;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'welcome',
      type: 'info',
      title: '환영해요! 👋',
      message: '알프레도가 당신의 하루를 도와드릴게요',
      timestamp: new Date(),
      read: false
    },
    {
      id: 'tip-1',
      type: 'nudge',
      title: '오늘의 팁 💡',
      message: 'Top 3를 설정하면 더 효율적인 하루를 보낼 수 있어요',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    }
  ],
  isOpen: false,
  unreadCount: 2,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set(state => ({ isOpen: !state.isOpen })),

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: (id) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  removeNotification: (id) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    });
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
