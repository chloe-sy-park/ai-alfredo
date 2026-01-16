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

// 결정 피로 분석 결과
export interface DecisionFatigueAnalysis {
  level: 'low' | 'moderate' | 'high';
  consecutiveCount: number;           // 연속 결정 횟수
  recentDecisionsInHour: number;      // 최근 1시간 내 결정 수
  averageTimeBetween: number | null;  // 결정 간 평균 시간 (분)
  warning: string | null;             // 경고 메시지
  suggestion: string | null;          // 제안 메시지
}

interface LiftStore {
  lifts: LiftRecord[];
  addLift: (lift: Omit<LiftRecord, 'id' | 'timestamp'>) => void;
  getWeeklyLifts: () => LiftRecord[];
  getMonthlyLifts: () => LiftRecord[];
  getLiftsByDateRange: (startDate: Date, endDate: Date) => LiftRecord[];
  getDecisionFatigueAnalysis: () => DecisionFatigueAnalysis;
  getTodayLifts: () => LiftRecord[];
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
      },

      getTodayLifts: () => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        return get().getLiftsByDateRange(todayStart, todayEnd);
      },

      // 결정 피로 흐름 분석 - PRD Phase 3
      getDecisionFatigueAnalysis: () => {
        const lifts = get().lifts;
        const now = new Date();

        // 최근 1시간 내 결정들
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentLifts = lifts.filter(function(lift) {
          const liftTime = new Date(lift.timestamp);
          return liftTime >= oneHourAgo;
        }).sort(function(a, b) {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        const recentDecisionsInHour = recentLifts.length;

        // 연속 결정 횟수 계산 (30분 이내 연속)
        let consecutiveCount = 0;
        if (recentLifts.length > 1) {
          consecutiveCount = 1;
          for (let i = 1; i < recentLifts.length; i++) {
            const prevTime = new Date(recentLifts[i - 1].timestamp).getTime();
            const currTime = new Date(recentLifts[i].timestamp).getTime();
            const diffMinutes = (currTime - prevTime) / (1000 * 60);

            if (diffMinutes <= 30) {
              consecutiveCount++;
            } else {
              consecutiveCount = 1;
            }
          }
        }

        // 결정 간 평균 시간 계산
        let averageTimeBetween: number | null = null;
        if (recentLifts.length >= 2) {
          let totalTime = 0;
          for (let i = 1; i < recentLifts.length; i++) {
            const prevTime = new Date(recentLifts[i - 1].timestamp).getTime();
            const currTime = new Date(recentLifts[i].timestamp).getTime();
            totalTime += (currTime - prevTime) / (1000 * 60);
          }
          averageTimeBetween = Math.round(totalTime / (recentLifts.length - 1));
        }

        // 피로도 레벨 결정
        let level: 'low' | 'moderate' | 'high' = 'low';
        let warning: string | null = null;
        let suggestion: string | null = null;

        // 높은 피로도: 1시간 내 5개 이상 또는 연속 4개 이상
        if (recentDecisionsInHour >= 5 || consecutiveCount >= 4) {
          level = 'high';
          warning = '결정 피로가 높아요. 잠시 쉬어가세요.';
          suggestion = '중요한 결정은 나중으로 미루고, 지금은 간단한 일만 해보세요.';
        }
        // 중간 피로도: 1시간 내 3-4개 또는 연속 3개
        else if (recentDecisionsInHour >= 3 || consecutiveCount >= 3) {
          level = 'moderate';
          warning = '결정이 연속으로 이어지고 있어요.';
          suggestion = '다음 결정 전에 잠시 숨을 고르세요.';
        }
        // 낮은 피로도: 정상
        else {
          level = 'low';
          // 낮은 피로도일 때는 경고/제안 없음
        }

        return {
          level: level,
          consecutiveCount: consecutiveCount,
          recentDecisionsInHour: recentDecisionsInHour,
          averageTimeBetween: averageTimeBetween,
          warning: warning,
          suggestion: suggestion
        };
      }
    }),
    {
      name: 'alfredo-lift-storage'
    }
  )
);