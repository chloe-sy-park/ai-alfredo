// Lift 타입 정의
export interface Lift {
  id: string;
  timestamp: Date;
  type: 'work-to-life' | 'life-to-work' | 'priority-change' | 'other';
  intensity: 'low' | 'mid' | 'high';
  from: string;
  to: string;
  reason?: string;
  metadata?: {
    taskId?: string;
    projectId?: string;
    location?: string;
  };
}

export interface LiftStats {
  total: number;
  workToLife: number;
  lifeToWork: number;
  avgPerDay: number;
  mostActiveTime?: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

class LiftService {
  private readonly STORAGE_KEY = 'alfredo_lifts';

  // Lift 생성
  createLift(lift: Omit<Lift, 'id'>): Lift {
    const newLift: Lift = {
      ...lift,
      id: this.generateId(),
    };
    
    const lifts = this.getAllLifts();
    lifts.push(newLift);
    this.saveLifts(lifts);
    
    return newLift;
  }

  // 모든 Lift 가져오기
  getAllLifts(): Lift[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const lifts = JSON.parse(stored);
      // Date 객체로 변환
      return lifts.map((lift: any) => ({
        ...lift,
        timestamp: new Date(lift.timestamp)
      }));
    } catch {
      return [];
    }
  }

  // 특정 기간의 Lift 가져오기
  getLiftsInRange(startDate: Date, endDate: Date): Lift[] {
    const allLifts = this.getAllLifts();
    return allLifts.filter(lift => {
      const liftDate = new Date(lift.timestamp);
      return liftDate >= startDate && liftDate <= endDate;
    });
  }

  // 주간 Lift 가져오기
  getWeeklyLifts(weekStart?: Date): Lift[] {
    const start = weekStart || this.getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    return this.getLiftsInRange(start, end);
  }

  // 월간 Lift 가져오기
  getMonthlyLifts(monthStart?: Date): Lift[] {
    const start = monthStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    
    return this.getLiftsInRange(start, end);
  }

  // Lift 통계 계산
  calculateStats(lifts: Lift[]): LiftStats {
    if (lifts.length === 0) {
      return {
        total: 0,
        workToLife: 0,
        lifeToWork: 0,
        avgPerDay: 0,
        trend: 'stable'
      };
    }

    const workToLife = lifts.filter(l => l.type === 'work-to-life').length;
    const lifeToWork = lifts.filter(l => l.type === 'life-to-work').length;
    
    // 날짜 범위 계산
    const dates = lifts.map(l => new Date(l.timestamp));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24)));
    
    // 가장 활발한 시간대 계산
    const hourCounts = new Map<number, number>();
    lifts.forEach(lift => {
      const hour = new Date(lift.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    const mostActiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // 트렌드 계산 (간단한 예시)
    const trend = this.calculateTrend(lifts);
    
    return {
      total: lifts.length,
      workToLife,
      lifeToWork,
      avgPerDay: lifts.length / daysDiff,
      mostActiveTime: mostActiveHour ? `${mostActiveHour}시` : undefined,
      trend
    };
  }

  // 트렌드 계산
  private calculateTrend(lifts: Lift[]): 'increasing' | 'decreasing' | 'stable' {
    if (lifts.length < 2) return 'stable';
    
    // 최근 7일과 그 이전 7일 비교
    const now = new Date();
    const week1Start = new Date(now);
    week1Start.setDate(week1Start.getDate() - 14);
    const week1End = new Date(now);
    week1End.setDate(week1End.getDate() - 7);
    
    const week1Lifts = lifts.filter(l => {
      const date = new Date(l.timestamp);
      return date >= week1Start && date < week1End;
    });
    
    const week2Lifts = lifts.filter(l => {
      const date = new Date(l.timestamp);
      return date >= week1End;
    });
    
    const diff = week2Lifts.length - week1Lifts.length;
    if (diff > 2) return 'increasing';
    if (diff < -2) return 'decreasing';
    return 'stable';
  }

  // Lift 패턴 분석
  analyzePatterns(lifts: Lift[]): Array<{
    pattern: string;
    frequency: number;
    insight: string;
  }> {
    const patterns = [];
    
    // 시간대별 패턴
    const timePatterns = this.analyzeTimePatterns(lifts);
    patterns.push(...timePatterns);
    
    // 타입별 패턴
    const typePatterns = this.analyzeTypePatterns(lifts);
    patterns.push(...typePatterns);
    
    return patterns;
  }

  private analyzeTimePatterns(lifts: Lift[]) {
    const patterns = [];
    const afternoonLifts = lifts.filter(l => {
      const hour = new Date(l.timestamp).getHours();
      return hour >= 14 && hour <= 17;
    });
    
    if (afternoonLifts.length > lifts.length * 0.5) {
      patterns.push({
        pattern: 'afternoon-switch',
        frequency: afternoonLifts.length,
        insight: '오후 시간대에 판단 변경이 집중되어 있어요'
      });
    }
    
    return patterns;
  }

  private analyzeTypePatterns(lifts: Lift[]) {
    const patterns = [];
    const workToLifeRatio = lifts.filter(l => l.type === 'work-to-life').length / lifts.length;
    
    if (workToLifeRatio > 0.7) {
      patterns.push({
        pattern: 'work-to-life-dominant',
        frequency: Math.round(workToLifeRatio * 100),
        insight: '일에서 삶으로의 전환이 주로 일어나고 있어요'
      });
    }
    
    return patterns;
  }

  // 유틸리티 메서드
  private generateId(): string {
    return `lift_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private saveLifts(lifts: Lift[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lifts));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
    return new Date(d.setDate(diff));
  }

  // Lift 삭제 (디버깅용)
  clearAllLifts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// 싱글톤 인스턴스
export const liftService = new LiftService();

// 사용 예시를 위한 헬퍼 함수
export function recordLift(
  type: Lift['type'],
  from: string,
  to: string,
  intensity: Lift['intensity'] = 'mid',
  reason?: string
): Lift {
  return liftService.createLift({
    timestamp: new Date(),
    type,
    intensity,
    from,
    to,
    reason
  });
}