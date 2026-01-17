/**
 * Proxy Moments 타입 정의
 * 알프레도가 사용자를 대신해서 판단/행동하는 순간들
 */

// 대행 액션 종류
export type ProxyActionType =
  | 'prioritize'      // 우선순위 자동 정리
  | 'protect_time'    // 시간 보호 (점심, 휴식)
  | 'suggest_decline' // 거절 제안
  | 'suggest_postpone'// 보류 제안
  | 'summarize'       // 요약 정리
  | 'pattern_detect'  // 패턴 감지
  | 'overload_warn'   // 과부하 경고
  | 'focus_suggest';  // 집중 시간 제안

// 대행 액션 긴급도
export type ProxyUrgency = 'low' | 'medium' | 'high';

// 사용자 알림 방식
export type NotifyStyle =
  | 'silent'          // 조용히 (나중에 요약으로)
  | 'subtle'          // 은은하게 (작은 배지)
  | 'gentle'          // 부드럽게 (인앱 알림)
  | 'prominent';      // 명확하게 (푸시 + 인앱)

// 대행 액션 결과
export interface ProxyAction {
  id: string;
  type: ProxyActionType;
  title: string;           // "점심 시간 확보해뒀어요"
  description: string;     // 상세 설명
  reasoning: string;       // 왜 이렇게 했는지
  urgency: ProxyUrgency;
  notifyStyle: NotifyStyle;

  // 사용자 선택권
  userControls: {
    canUndo: boolean;      // 되돌리기 가능
    canModify: boolean;    // 수정 가능
    canDismiss: boolean;   // 무시 가능
  };

  // 관련 데이터
  relatedData?: {
    taskIds?: string[];
    eventIds?: string[];
    timeSlot?: { start: string; end: string };
    scoreBreakdowns?: ScoreBreakdown[];  // 우선순위 점수 상세
  };

  // 상태
  status: 'pending' | 'accepted' | 'dismissed' | 'modified';
  createdAt: string;
  respondedAt?: string;
}

// 과부하 감지 결과
export interface OverloadDetection {
  isOverloaded: boolean;
  level: 'none' | 'watch' | 'warning' | 'critical';
  score: number;  // 0-100
  factors: OverloadFactor[];
  suggestions: ProxyAction[];
}

// 과부하 요인
export interface OverloadFactor {
  type: 'meetings' | 'tasks' | 'deadlines' | 'consecutive' | 'no_break' | 'late_hours';
  severity: 'low' | 'medium' | 'high';
  description: string;
  value?: number;
}

// 시간 보호 제안
export interface TimeProtection {
  type: 'lunch' | 'break' | 'focus' | 'buffer';
  suggestedSlot: {
    start: string;
    end: string;
  };
  reason: string;
  priority: number;
}

// 점수 상세 (투명성용)
export interface ScoreBreakdown {
  deadline: number;
  starred: number;
  waiting: number;
  duration: number;
  deferred: number;
  scheduled: number;
}

// 우선순위 추천
export interface PriorityRecommendation {
  taskId: string;
  rank: number;          // 1, 2, 3
  confidence: number;    // 0-1
  reasoning: string;
  factors: string[];     // ['deadline: today', 'starred', 'waiting: boss']
  scoreBreakdown?: ScoreBreakdown;  // 점수 투명성 (선택적)
}

// 패턴 감지
export interface PatternDetection {
  type: 'recurring_task' | 'time_preference' | 'energy_pattern' | 'meeting_pattern';
  pattern: string;
  confidence: number;
  suggestion?: string;
  actionable: boolean;
}

// Proxy Summary (일일 요약용)
export interface ProxySummary {
  date: string;
  actionsCount: number;
  acceptedCount: number;
  dismissedCount: number;
  timeSavedMinutes: number;
  highlights: string[];
  actions: ProxyAction[];
}
