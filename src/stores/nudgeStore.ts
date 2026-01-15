import { create } from 'zustand';

export interface Nudge {
  id: string;
  type: 'focus' | 'break' | 'transition' | 'health' | 'celebration';
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  priority?: 'low' | 'medium' | 'high';
  duration?: number; // 표시 시간 (ms)
}

interface NudgeState {
  activeNudges: Nudge[];
  history: Nudge[];
  
  // Actions
  showNudge: (nudge: Omit<Nudge, 'id'>) => void;
  hideNudge: (id: string) => void;
  clearAllNudges: () => void;
  getActiveNudge: () => Nudge | null;
}

export const useNudgeStore = create<NudgeState>((set, get) => ({
  activeNudges: [],
  history: [],
  
  showNudge: (nudgeData) => {
    const nudge: Nudge = {
      ...nudgeData,
      id: Date.now().toString(),
      duration: nudgeData.duration || 5000
    };
    
    set(state => ({
      activeNudges: [...state.activeNudges, nudge],
      history: [...state.history, nudge]
    }));
    
    // 자동 숨김
    if (nudge.duration && nudge.duration > 0) {
      setTimeout(() => {
        get().hideNudge(nudge.id);
      }, nudge.duration);
    }
  },
  
  hideNudge: (id) => {
    set(state => ({
      activeNudges: state.activeNudges.filter(n => n.id !== id)
    }));
  },
  
  clearAllNudges: () => {
    set({ activeNudges: [] });
  },
  
  getActiveNudge: () => {
    const { activeNudges } = get();
    // 우선순위가 높은 것부터 반환
    const sorted = [...activeNudges].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return bPriority - aPriority;
    });
    
    return sorted[0] || null;
  }
}));

// 컨텍스트 기반 Nudge 생성 헬퍼
export const createContextualNudge = (
  context: { 
    time?: Date;
    condition?: string;
    workMode?: boolean;
    focusTime?: number;
  }
): Omit<Nudge, 'id'> | null => {
  const hour = context.time?.getHours() || new Date().getHours();
  
  // 아침 인사
  if (hour >= 6 && hour < 9) {
    return {
      type: 'transition',
      message: '🌅 좋은 아침! 오늘 가장 중요한 일부터 시작해볼까요?',
      priority: 'medium'
    };
  }
  
  // 점심시간 알림
  if (hour === 12) {
    return {
      type: 'health',
      message: '🥗 점심 시간이에요. 잠깐 쉬고 에너지를 충전하세요!',
      priority: 'high',
      action: {
        label: '알았어',
        handler: () => console.log('Lunch time acknowledged')
      }
    };
  }
  
  // 장시간 집중 알림
  if (context.focusTime && context.focusTime > 90 * 60) { // 90분 이상
    return {
      type: 'break',
      message: '💆 90분 넘게 집중하셨네요! 5분만 스트레칭하고 올까요?',
      priority: 'high',
      action: {
        label: '5분 휴식하기',
        handler: () => console.log('Taking a break')
      }
    };
  }
  
  // 저녁 마무리
  if (hour >= 18 && hour < 20 && context.workMode) {
    return {
      type: 'transition',
      message: '🌆 오늘 하루도 수고했어요. 마무리할 시간이에요!',
      priority: 'low'
    };
  }
  
  return null;
};