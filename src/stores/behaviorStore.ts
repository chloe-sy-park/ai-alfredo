import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// 🧠 암묵적 학습 시스템 (TikTok/Spotify 스타일)
// "물어보지 않고 행동으로 배운다"
// ============================================

interface TaskBehavior {
  taskId: string;
  taskTitle: string;
  category?: string;
  // 시간 관련
  estimatedMinutes?: number;
  actualMinutes?: number;
  startedAt?: string;
  completedAt?: string;
  // 행동 패턴
  deferCount: number; // 미룬 횟수
  viewCount: number; // 본 횟수 (관심도)
  dwellTime: number; // 머문 시간 (초)
  // 결과
  completed: boolean;
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
}

interface EnergyPattern {
  hour: number;
  completionRate: number;
  avgDwellTime: number;
  sampleSize: number;
}

interface DayPattern {
  day: number; // 0=일, 1=월, ...
  completionRate: number;
  avgTasksCompleted: number;
  busiestHour: number;
  sampleSize: number;
}

interface CategoryPattern {
  category: string;
  avgCompletionTime: number;
  deferRate: number; // 미루는 비율
  preferredHour: number; // 주로 하는 시간
  completionRate: number;
}

interface BehaviorInsight {
  id: string;
  type: 'chronotype' | 'energy' | 'pattern' | 'stress' | 'strength';
  confidence: 1 | 2 | 3; // ⭐ 확신도
  message: string;
  detail?: string;
  discoveredAt: string;
  dismissed: boolean;
}

interface BehaviorState {
  // 원시 데이터
  taskBehaviors: TaskBehavior[];
  sessionStarts: string[]; // 앱 실행 시간들
  
  // 학습된 패턴
  energyPatterns: EnergyPattern[];
  dayPatterns: DayPattern[];
  categoryPatterns: CategoryPattern[];
  
  // 추론된 인사이트
  insights: BehaviorInsight[];
  
  // 사용자 프로필 (추론)
  inferredProfile: {
    chronotype: 'morning' | 'evening' | 'flexible' | 'unknown';
    peakHours: number[]; // 최고 집중 시간
    lowHours: number[]; // 에너지 낮은 시간
    busyDays: number[]; // 바쁜 요일
    calmDays: number[]; // 여유로운 요일
    avgDailyTasks: number;
    estimationAccuracy: number; // 시간 예측 정확도 (0-1)
  };
  
  // 액션
  trackTaskView: (taskId: string, title: string, seconds: number) => void;
  trackTaskStart: (taskId: string, title: string, estimatedMinutes?: number) => void;
  trackTaskComplete: (taskId: string, actualMinutes?: number) => void;
  trackTaskDefer: (taskId: string) => void;
  trackSessionStart: () => void;
  
  // 분석
  analyzePatterns: () => void;
  generateInsights: () => void;
  
  // 예측
  predictBestTime: (category?: string) => number; // 추천 시간 (hour)
  predictDuration: (taskTitle: string, category?: string) => number; // 예상 소요 시간
  
  // 인사이트 관리
  dismissInsight: (id: string) => void;
  getActiveInsights: () => BehaviorInsight[];
}

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      taskBehaviors: [],
      sessionStarts: [],
      energyPatterns: [],
      dayPatterns: [],
      categoryPatterns: [],
      insights: [],
      inferredProfile: {
        chronotype: 'unknown',
        peakHours: [],
        lowHours: [],
        busyDays: [],
        calmDays: [],
        avgDailyTasks: 0,
        estimationAccuracy: 0.5,
      },

      // 태스크 조회 추적 (체류 시간)
      trackTaskView: (taskId, title, seconds) => {
        set(state => {
          const existing = state.taskBehaviors.find(t => t.taskId === taskId);
          if (existing) {
            existing.viewCount++;
            existing.dwellTime += seconds;
            return { taskBehaviors: [...state.taskBehaviors] };
          } else {
            return {
              taskBehaviors: [...state.taskBehaviors, {
                taskId,
                taskTitle: title,
                deferCount: 0,
                viewCount: 1,
                dwellTime: seconds,
                completed: false,
                dayOfWeek: new Date().getDay(),
                hourOfDay: new Date().getHours(),
              }]
            };
          }
        });
      },

      // 태스크 시작 추적
      trackTaskStart: (taskId, title, estimatedMinutes) => {
        const now = new Date();
        set(state => {
          const behaviors = [...state.taskBehaviors];
          const idx = behaviors.findIndex(t => t.taskId === taskId);
          
          if (idx >= 0) {
            behaviors[idx] = {
              ...behaviors[idx],
              startedAt: now.toISOString(),
              estimatedMinutes,
              hourOfDay: now.getHours(),
              dayOfWeek: now.getDay(),
            };
          } else {
            behaviors.push({
              taskId,
              taskTitle: title,
              startedAt: now.toISOString(),
              estimatedMinutes,
              deferCount: 0,
              viewCount: 1,
              dwellTime: 0,
              completed: false,
              dayOfWeek: now.getDay(),
              hourOfDay: now.getHours(),
            });
          }
          
          return { taskBehaviors: behaviors };
        });
      },

      // 태스크 완료 추적
      trackTaskComplete: (taskId, actualMinutes) => {
        const now = new Date();
        set(state => {
          const behaviors = [...state.taskBehaviors];
          const idx = behaviors.findIndex(t => t.taskId === taskId);
          
          if (idx >= 0) {
            const task = behaviors[idx];
            const startTime = task.startedAt ? new Date(task.startedAt) : now;
            const calculatedMinutes = actualMinutes ?? Math.round((now.getTime() - startTime.getTime()) / 60000);
            
            behaviors[idx] = {
              ...task,
              completedAt: now.toISOString(),
              actualMinutes: calculatedMinutes,
              completed: true,
            };
          }
          
          return { taskBehaviors: behaviors };
        });
        
        // 패턴 분석 트리거
        get().analyzePatterns();
      },

      // 미루기 추적
      trackTaskDefer: (taskId) => {
        set(state => {
          const behaviors = [...state.taskBehaviors];
          const idx = behaviors.findIndex(t => t.taskId === taskId);
          
          if (idx >= 0) {
            behaviors[idx].deferCount++;
          }
          
          return { taskBehaviors: behaviors };
        });
      },

      // 세션 시작 추적
      trackSessionStart: () => {
        const now = new Date().toISOString();
        set(state => ({
          sessionStarts: [...state.sessionStarts.slice(-100), now] // 최근 100개만 유지
        }));
      },

      // 패턴 분석
      analyzePatterns: () => {
        const { taskBehaviors } = get();
        const completed = taskBehaviors.filter(t => t.completed);
        
        if (completed.length < 5) return; // 최소 5개 이상 데이터 필요
        
        // 시간대별 완료율
        const hourGroups: { [hour: number]: TaskBehavior[] } = {};
        completed.forEach(t => {
          const hour = t.hourOfDay;
          if (!hourGroups[hour]) hourGroups[hour] = [];
          hourGroups[hour].push(t);
        });
        
        const energyPatterns: EnergyPattern[] = Object.entries(hourGroups).map(([hour, tasks]) => ({
          hour: parseInt(hour),
          completionRate: tasks.length / (taskBehaviors.filter(t => t.hourOfDay === parseInt(hour)).length || 1),
          avgDwellTime: tasks.reduce((sum, t) => sum + t.dwellTime, 0) / tasks.length,
          sampleSize: tasks.length,
        }));
        
        // 요일별 패턴
        const dayGroups: { [day: number]: TaskBehavior[] } = {};
        completed.forEach(t => {
          if (!dayGroups[t.dayOfWeek]) dayGroups[t.dayOfWeek] = [];
          dayGroups[t.dayOfWeek].push(t);
        });
        
        const dayPatterns: DayPattern[] = Object.entries(dayGroups).map(([day, tasks]) => {
          const hours = tasks.map(t => t.hourOfDay);
          const hourCounts: { [h: number]: number } = {};
          hours.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });
          const busiestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
          
          return {
            day: parseInt(day),
            completionRate: tasks.length / (taskBehaviors.filter(t => t.dayOfWeek === parseInt(day)).length || 1),
            avgTasksCompleted: tasks.length / 4, // 대략 4주로 나눔
            busiestHour: busiestHour ? parseInt(busiestHour[0]) : 10,
            sampleSize: tasks.length,
          };
        });
        
        // 크로노타입 추론
        const morningTasks = completed.filter(t => t.hourOfDay >= 6 && t.hourOfDay < 12).length;
        const eveningTasks = completed.filter(t => t.hourOfDay >= 18 && t.hourOfDay < 24).length;
        const total = completed.length;
        
        let chronotype: 'morning' | 'evening' | 'flexible' | 'unknown' = 'unknown';
        if (total >= 10) {
          if (morningTasks / total > 0.5) chronotype = 'morning';
          else if (eveningTasks / total > 0.4) chronotype = 'evening';
          else chronotype = 'flexible';
        }
        
        // 피크 시간 찾기
        const peakHours = energyPatterns
          .filter(p => p.sampleSize >= 3)
          .sort((a, b) => b.completionRate - a.completionRate)
          .slice(0, 3)
          .map(p => p.hour);
        
        // 시간 예측 정확도
        const withEstimates = completed.filter(t => t.estimatedMinutes && t.actualMinutes);
        let estimationAccuracy = 0.5;
        if (withEstimates.length >= 3) {
          const errors = withEstimates.map(t => 
            Math.abs((t.actualMinutes! - t.estimatedMinutes!) / t.estimatedMinutes!)
          );
          const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
          estimationAccuracy = Math.max(0, 1 - avgError);
        }
        
        set({
          energyPatterns,
          dayPatterns,
          inferredProfile: {
            ...get().inferredProfile,
            chronotype,
            peakHours,
            estimationAccuracy,
            avgDailyTasks: completed.length / 7, // 주당으로 나눔
          },
        });
        
        // 인사이트 생성
        get().generateInsights();
      },

      // 인사이트 생성
      generateInsights: () => {
        const { inferredProfile, energyPatterns, taskBehaviors } = get();
        const newInsights: BehaviorInsight[] = [];
        const now = new Date().toISOString();
        
        // 크로노타입 인사이트
        if (inferredProfile.chronotype !== 'unknown') {
          const messages = {
            morning: '아침형이시네요! 오전에 중요한 일 하시면 좋아요 ☀️',
            evening: '저녁형이시구나! 오후-저녁에 집중력이 높아요 🌙',
            flexible: '시간대에 유연하시네요! 언제든 집중 가능 💪',
          };
          newInsights.push({
            id: 'chronotype',
            type: 'chronotype',
            confidence: taskBehaviors.filter(t => t.completed).length >= 20 ? 3 : 2,
            message: messages[inferredProfile.chronotype],
            discoveredAt: now,
            dismissed: false,
          });
        }
        
        // 피크 시간 인사이트
        if (inferredProfile.peakHours.length > 0) {
          const peakHour = inferredProfile.peakHours[0];
          newInsights.push({
            id: 'peak-hour',
            type: 'energy',
            confidence: 2,
            message: `${peakHour}시가 가장 집중 잘 되는 시간이에요 ⚡`,
            detail: `이 시간에 완료율이 가장 높아요`,
            discoveredAt: now,
            dismissed: false,
          });
        }
        
        // 시간 예측 정확도 인사이트
        if (inferredProfile.estimationAccuracy < 0.5) {
          newInsights.push({
            id: 'time-blindness',
            type: 'pattern',
            confidence: 2,
            message: '시간 예측이 실제보다 짧은 편이에요',
            detail: '예상 시간의 1.5배로 계획해보세요',
            discoveredAt: now,
            dismissed: false,
          });
        }
        
        // 미루기 패턴 인사이트
        const highDeferTasks = taskBehaviors.filter(t => t.deferCount >= 3);
        if (highDeferTasks.length >= 2) {
          newInsights.push({
            id: 'defer-pattern',
            type: 'pattern',
            confidence: 2,
            message: '자주 미루는 유형의 태스크가 있어요',
            detail: '작게 쪼개면 시작하기 쉬워요',
            discoveredAt: now,
            dismissed: false,
          });
        }
        
        set({ insights: newInsights });
      },

      // 최적 시간 예측
      predictBestTime: (category) => {
        const { inferredProfile, energyPatterns } = get();
        
        if (energyPatterns.length === 0) {
          // 기본값: 크로노타입 기반
          if (inferredProfile.chronotype === 'morning') return 10;
          if (inferredProfile.chronotype === 'evening') return 19;
          return 14; // 기본
        }
        
        // 완료율 가장 높은 시간
        const sorted = [...energyPatterns].sort((a, b) => b.completionRate - a.completionRate);
        return sorted[0]?.hour ?? 10;
      },

      // 소요 시간 예측
      predictDuration: (taskTitle, category) => {
        const { taskBehaviors, inferredProfile } = get();
        
        // 비슷한 태스크 찾기
        const similar = taskBehaviors.filter(t => 
          t.completed && 
          t.actualMinutes && 
          (t.taskTitle.includes(taskTitle.slice(0, 5)) || 
           (category && t.category === category))
        );
        
        if (similar.length >= 2) {
          const avgMinutes = similar.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) / similar.length;
          return Math.round(avgMinutes);
        }
        
        // 기본 추정 (정확도 낮으면 1.5배)
        const baseEstimate = 30;
        const multiplier = inferredProfile.estimationAccuracy < 0.6 ? 1.5 : 1;
        return Math.round(baseEstimate * multiplier);
      },

      dismissInsight: (id) => {
        set(state => ({
          insights: state.insights.map(i => 
            i.id === id ? { ...i, dismissed: true } : i
          )
        }));
      },

      getActiveInsights: () => {
        return get().insights.filter(i => !i.dismissed);
      },
    }),
    {
      name: 'alfredo-behavior-store',
    }
  )
);

export default useBehaviorStore;
