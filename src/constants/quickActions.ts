import { MessageCircle, Plus, Smile, FileText, Timer, CalendarPlus } from 'lucide-react';

export interface QuickAction {
  id: string;
  icon: typeof MessageCircle;
  label: string;
  action: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'chat', icon: MessageCircle, label: '채팅', action: 'openChat' },
  { id: 'task', icon: Plus, label: '태스크', action: 'addTask' },
  { id: 'condition', icon: Smile, label: '컨디션', action: 'setCondition' },
  { id: 'memo', icon: FileText, label: '메모', action: 'addMemo' },
  { id: 'timer', icon: Timer, label: '타이머', action: 'startTimer' },
  { id: 'event', icon: CalendarPlus, label: '일정', action: 'addEvent' },
];
