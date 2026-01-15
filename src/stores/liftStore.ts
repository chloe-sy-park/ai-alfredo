// liftStore.ts - Lift 기록 관리
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LiftRecord {
  id: string;
  timestamp: Date;
  type: 'apply' | 'maintain' | 'consider';
  category: 'priority' | 'schedule' | 'worklife' | 'condition';
  previousDecision: string;
  newDecision: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

interface LiftStore {
  lifts: LiftRecord[];
  addLift: (lift: Omit<LiftRecord, 'id' | 'timestamp'>) => void;
  getWeeklyLifts: () => LiftRecord[];
  getMonthlyLifts: () => LiftRecord[];
  getLiftsByDateRange: (startDate: Date, endDate: Date) => LiftRecord[];
}

export const useLiftStore = create<LiftStore>()(
  persist(
    (set, get) => ({
      lifts: [],
      
      addLift: (liftData) => {
        const newLift: LiftRecord = {
          id: Date.now().toString(),
          timestamp: new Date(),
          ...liftData
        };
        
        set((state) => ({
          lifts: [...state.lifts, newLift]
        }));
      },
      
      getWeeklyLifts: () => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        return get().getLiftsByDateRange(weekStart, weekEnd);
      },
      
      getMonthlyLifts: () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return get().getLiftsByDateRange(monthStart, monthEnd);
      },
      
      getLiftsByDateRange: (startDate, endDate) => {
        return get().lifts.filter(lift => {
          const liftDate = new Date(lift.timestamp);
          return liftDate >= startDate && liftDate <= endDate;
        });
      }
    }),
    {
      name: 'alfredo-lift-storage'
    }
  )
);