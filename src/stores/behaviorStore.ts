import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// Types
// =============================================================================

export type BehaviorSignalType =
  | 'task_completion'
  | 'task_skip'
  | 'task_defer'
  | 'focus_session_complete'
  | 'focus_session_abandon'
  | 'mood_entry'
  | 'feature_usage'
  | 'time_of_day_activity'
  | 'screen_time'
  | 'suggestion_accepted'
  | 'suggestion_dismissed';

export interface BehaviorSignal {
  id: string;
  type: BehaviorSignalType;
  timestamp: Date;
  metadata: Record<string, unknown>;
  context?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: number;
    energyLevel?: 'high' | 'medium' | 'low';
  };
}

export interface TimePattern {
  hour: number;
  successRate: number;
  sampleSize: number;
}

export interface TaskTypePattern {
  type: string;
  completionRate: number;
  averageTimeToComplete: number; // minutes
  deferRate: number;
}

export interface EnergyPattern {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  averageProductivity: number; // 0-100
  sampleSize: number;
}

export interface LearnedPatterns {
  peakProductivityHours: number[];
  lowEnergyHours: number[];
  preferredTaskTypes: string[];
  avoidedTaskTypes: string[];
  averageTaskDuration: number;
  timeEstimationAccuracy: number; // ratio: actual/estimated
  busiestDays: number[];
  breakFrequency: number; // average breaks per hour
}

export interface BehaviorState {
  // Raw signals (last 30 days)
  signals: BehaviorSignal[];
  
  // Analyzed patterns
  timePatterns: TimePattern[];
  taskTypePatterns: TaskTypePattern[];
  energyPatterns: EnergyPattern[];
  learnedPatterns: LearnedPatterns;
  
  // Meta
  lastAnalyzedAt: Date | null;
  totalSignalsRecorded: number;
  analysisConfidence: 'low' | 'medium' | 'high';
  
  // Actions
  recordSignal: (type: BehaviorSignalType, metadata?: Record<string, unknown>) => void;
  analyzePatterns: () => void;
  getRecommendation: (context: { taskType?: string; timeOfDay?: string }) => string | null;
  getPeakHours: () => number[];
  getTimeEstimateMultiplier: () => number;
  clearOldSignals: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// Store
// =============================================================================

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      // Initial state
      signals: [],
      timePatterns: [],
      taskTypePatterns: [],
      energyPatterns: [],
      learnedPatterns: {
        peakProductivityHours: [],
        lowEnergyHours: [],
        preferredTaskTypes: [],
        avoidedTaskTypes: [],
        averageTaskDuration: 30,
        timeEstimationAccuracy: 1.0,
        busiestDays: [],
        breakFrequency: 0.5,
      },
      lastAnalyzedAt: null,
      totalSignalsRecorded: 0,
      analysisConfidence: 'low',

      // Record a new behavioral signal
      recordSignal: (type, metadata = {}) => {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();

        const signal: BehaviorSignal = {
          id: generateId(),
          type,
          timestamp: now,
          metadata,
          context: {
            timeOfDay: getTimeOfDay(hour),
            dayOfWeek,
          },
        };

        set((state) => ({
          signals: [...state.signals, signal].slice(-1000), // Keep last 1000 signals
          totalSignalsRecorded: state.totalSignalsRecorded + 1,
        }));

        // Auto-analyze if enough new signals
        const { signals, lastAnalyzedAt } = get();
        const signalsSinceAnalysis = lastAnalyzedAt
          ? signals.filter((s) => new Date(s.timestamp) > new Date(lastAnalyzedAt)).length
          : signals.length;

        if (signalsSinceAnalysis >= 10) {
          get().analyzePatterns();
        }
      },

      // Analyze patterns from recorded signals
      analyzePatterns: () => {
        const { signals } = get();
        if (signals.length < 5) return;

        // Time patterns analysis
        const hourlyStats: Record<number, { success: number; total: number }> = {};
        
        signals.forEach((signal) => {
          const hour = new Date(signal.timestamp).getHours();
          if (!hourlyStats[hour]) {
            hourlyStats[hour] = { success: 0, total: 0 };
          }
          hourlyStats[hour].total++;
          if (signal.type === 'task_completion' || signal.type === 'focus_session_complete') {
            hourlyStats[hour].success++;
          }
        });

        const timePatterns: TimePattern[] = Object.entries(hourlyStats).map(([hour, stats]) => ({
          hour: parseInt(hour),
          successRate: stats.total > 0 ? stats.success / stats.total : 0,
          sampleSize: stats.total,
        }));

        // Find peak hours (top 3 hours with highest success rate and enough samples)
        const peakHours = timePatterns
          .filter((p) => p.sampleSize >= 3)
          .sort((a, b) => b.successRate - a.successRate)
          .slice(0, 3)
          .map((p) => p.hour);

        // Find low energy hours
        const lowHours = timePatterns
          .filter((p) => p.sampleSize >= 3 && p.successRate < 0.3)
          .map((p) => p.hour);

        // Task type patterns
        const taskTypeStats: Record<string, { completed: number; deferred: number; total: number; durations: number[] }> = {};
        
        signals.forEach((signal) => {
          if (signal.metadata.taskType) {
            const type = signal.metadata.taskType as string;
            if (!taskTypeStats[type]) {
              taskTypeStats[type] = { completed: 0, deferred: 0, total: 0, durations: [] };
            }
            taskTypeStats[type].total++;
            if (signal.type === 'task_completion') {
              taskTypeStats[type].completed++;
              if (signal.metadata.duration) {
                taskTypeStats[type].durations.push(signal.metadata.duration as number);
              }
            }
            if (signal.type === 'task_defer') {
              taskTypeStats[type].deferred++;
            }
          }
        });

        const taskTypePatterns: TaskTypePattern[] = Object.entries(taskTypeStats).map(([type, stats]) => ({
          type,
          completionRate: stats.total > 0 ? stats.completed / stats.total : 0,
          averageTimeToComplete: stats.durations.length > 0
            ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
            : 30,
          deferRate: stats.total > 0 ? stats.deferred / stats.total : 0,
        }));

        // Time estimation accuracy
        const estimationSignals = signals.filter(
          (s) => s.metadata.estimatedTime && s.metadata.actualTime
        );
        const timeEstimationAccuracy = estimationSignals.length > 0
          ? estimationSignals.reduce(
              (acc, s) => acc + (s.metadata.actualTime as number) / (s.metadata.estimatedTime as number),
              0
            ) / estimationSignals.length
          : 1.0;

        // Energy patterns
        const _energyPatterns: EnergyPattern[] = (['morning', 'afternoon', 'evening', 'night'] as const).map(
          (timeOfDay) => {
            const relevantSignals = signals.filter((s) => s.context?.timeOfDay === timeOfDay);
            const successSignals = relevantSignals.filter(
              (s) => s.type === 'task_completion' || s.type === 'focus_session_complete'
            );
            return {
              timeOfDay,
              averageProductivity: relevantSignals.length > 0
                ? (successSignals.length / relevantSignals.length) * 100
                : 50,
              sampleSize: relevantSignals.length,
            };
          }
        );

        // Determine confidence level
        const totalSamples = signals.length;
        const confidence: 'low' | 'medium' | 'high' =
          totalSamples < 20 ? 'low' : totalSamples < 100 ? 'medium' : 'high';

        // Preferred/avoided task types
        const preferredTaskTypes = taskTypePatterns
          .filter((p) => p.completionRate > 0.7)
          .map((p) => p.type);
        const avoidedTaskTypes = taskTypePatterns
          .filter((p) => p.deferRate > 0.5)
          .map((p) => p.type);

        // Busiest days
        const dayStats: Record<number, number> = {};
        signals.forEach((signal) => {
          const day = signal.context?.dayOfWeek ?? new Date(signal.timestamp).getDay();
          dayStats[day] = (dayStats[day] || 0) + 1;
        });
        const busiestDays = Object.entries(dayStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([day]) => parseInt(day));

        set({
          timePatterns,
          taskTypePatterns,
          energyPatterns: _energyPatterns,
          learnedPatterns: {
            peakProductivityHours: peakHours,
            lowEnergyHours: lowHours,
            preferredTaskTypes,
            avoidedTaskTypes,
            averageTaskDuration: taskTypePatterns.length > 0
              ? taskTypePatterns.reduce((acc, p) => acc + p.averageTimeToComplete, 0) /
                taskTypePatterns.length
              : 30,
            timeEstimationAccuracy,
            busiestDays,
            breakFrequency: 0.5, // TODO: Calculate from actual break signals
          },
          lastAnalyzedAt: new Date(),
          analysisConfidence: confidence,
        });
      },

      // Get contextual recommendation
      getRecommendation: (context) => {
        const { learnedPatterns, analysisConfidence } = get();
        if (analysisConfidence === 'low') return null;

        const currentHour = new Date().getHours();
        const isPeakTime = learnedPatterns.peakProductivityHours.includes(currentHour);
        const isLowTime = learnedPatterns.lowEnergyHours.includes(currentHour);

        if (isPeakTime) {
          return '지금이 집중하기 좋은 시간이에요! 중요한 일을 처리해보세요.';
        }
        if (isLowTime) {
          return '이 시간대엔 가벼운 일 위주로 하는 게 좋아요.';
        }
        if (context.taskType && learnedPatterns.avoidedTaskTypes.includes(context.taskType)) {
          return `${context.taskType} 작업은 작은 단위로 나눠서 해보는 건 어때요?`;
        }

        return null;
      },

      // Get peak productivity hours
      getPeakHours: () => {
        return get().learnedPatterns.peakProductivityHours;
      },

      // Get time estimation multiplier
      getTimeEstimateMultiplier: () => {
        return get().learnedPatterns.timeEstimationAccuracy;
      },

      // Clear old signals (keep last 30 days)
      clearOldSignals: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        set((state) => ({
          signals: state.signals.filter(
            (s) => new Date(s.timestamp) > thirtyDaysAgo
          ),
        }));
      },
    }),
    {
      name: 'alfredo-behavior-store',
      partialize: (state) => ({
        signals: state.signals.slice(-500), // Only persist last 500 signals
        learnedPatterns: state.learnedPatterns,
        lastAnalyzedAt: state.lastAnalyzedAt,
        totalSignalsRecorded: state.totalSignalsRecorded,
        analysisConfidence: state.analysisConfidence,
      }),
    }
  )
);

export default useBehaviorStore;
