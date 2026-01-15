/**
 * Capability Boundary 서비스
 * 알프레도의 능력 범위 관리
 */

import {
  Capability,
  CapabilityCategory,
  CapabilityStatus,
  BoundaryMoment,
  BoundaryReason,
  BoundaryResponse,
  DEFAULT_CAPABILITIES,
  CANNOT_DO,
  BOUNDARY_RESPONSES
} from './types';

const BOUNDARY_HISTORY_KEY = 'alfredo_boundary_history';

// ========== 능력 조회 ==========

/**
 * 모든 능력 목록
 */
export function getAllCapabilities(): Capability[] {
  return DEFAULT_CAPABILITIES;
}

/**
 * 카테고리별 능력
 */
export function getCapabilitiesByCategory(category: CapabilityCategory): Capability[] {
  return DEFAULT_CAPABILITIES.filter(cap => cap.category === category);
}

/**
 * 상태별 능력
 */
export function getCapabilitiesByStatus(status: CapabilityStatus): Capability[] {
  return DEFAULT_CAPABILITIES.filter(cap => cap.status === status);
}

/**
 * 사용 가능한 능력만
 */
export function getAvailableCapabilities(): Capability[] {
  return DEFAULT_CAPABILITIES.filter(
    cap => cap.status === 'available' || cap.status === 'limited'
  );
}

/**
 * 특정 능력 조회
 */
export function getCapability(id: string): Capability | undefined {
  return DEFAULT_CAPABILITIES.find(cap => cap.id === id);
}

/**
 * 못하는 것 목록
 */
export function getCannotDoList(): string[] {
  return CANNOT_DO;
}

// ========== 능력 검색 ==========

/**
 * 키워드로 능력 검색
 */
export function searchCapabilities(query: string): Capability[] {
  const lowerQuery = query.toLowerCase();

  return DEFAULT_CAPABILITIES.filter(cap => {
    const searchText = `${cap.name} ${cap.description} ${cap.examples?.join(' ') || ''}`.toLowerCase();
    return searchText.includes(lowerQuery);
  });
}

/**
 * 요청이 가능한 범위인지 확인
 */
export function checkCapability(request: string): {
  isCapable: boolean;
  matchedCapability?: Capability;
  boundaryReason?: BoundaryReason;
} {
  const lowerRequest = request.toLowerCase();

  // 키워드 매칭
  const keywords: Record<string, string[]> = {
    cap_calendar_view: ['일정', '캘린더', '스케줄', '미팅', '약속'],
    cap_task_view: ['할 일', '태스크', '투두', '해야 할'],
    cap_task_prioritize: ['우선순위', '먼저', '중요한', 'top', '순서'],
    cap_workload_analysis: ['바빠', '여유', '과부하', '업무량'],
    cap_suggestion: ['추천', '제안', '뭐하면', '어떻게'],
    cap_email: ['이메일', '메일', '보내'],
    cap_auto_schedule: ['자동', '알아서', '스스로']
  };

  for (const [capId, words] of Object.entries(keywords)) {
    if (words.some(word => lowerRequest.includes(word))) {
      const capability = getCapability(capId);
      if (capability) {
        if (capability.status === 'unavailable') {
          return {
            isCapable: false,
            matchedCapability: capability,
            boundaryReason: 'technical_limit'
          };
        }
        return {
          isCapable: true,
          matchedCapability: capability
        };
      }
    }
  }

  // 기본: 가능하다고 가정
  return { isCapable: true };
}

// ========== 경계 상황 관리 ==========

/**
 * 경계 상황 기록
 */
export function recordBoundaryMoment(
  requestedAction: string,
  reason: BoundaryReason
): BoundaryMoment {
  const moment: BoundaryMoment = {
    id: `boundary_${Date.now()}`,
    requestedAction,
    reason,
    alternativeSuggestion: getAlternativeSuggestion(reason),
    timestamp: new Date().toISOString()
  };

  try {
    const stored = localStorage.getItem(BOUNDARY_HISTORY_KEY);
    const history: BoundaryMoment[] = stored ? JSON.parse(stored) : [];

    history.push(moment);

    // 최근 50개만 유지
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    localStorage.setItem(BOUNDARY_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to record boundary moment:', e);
  }

  return moment;
}

/**
 * 경계 이력 로드
 */
export function loadBoundaryHistory(): BoundaryMoment[] {
  try {
    const stored = localStorage.getItem(BOUNDARY_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load boundary history:', e);
  }
  return [];
}

/**
 * 경계 응답 생성
 */
export function generateBoundaryResponse(reason: BoundaryReason): BoundaryResponse {
  const responses = BOUNDARY_RESPONSES[reason];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * 대안 제안 생성
 */
function getAlternativeSuggestion(reason: BoundaryReason): string | undefined {
  const alternatives: Record<BoundaryReason, string> = {
    technical_limit: '비슷한 다른 기능을 사용해보세요',
    data_access: '해당 서비스를 연결하면 도움드릴 수 있어요',
    user_safety: '제가 정보를 정리해드릴게요, 결정은 직접 해주세요',
    ethical: '다른 방식으로 도움드릴게요',
    out_of_scope: '일정과 할 일 관리는 잘 도와드릴 수 있어요!'
  };

  return alternatives[reason];
}

// ========== 능력 요약 ==========

/**
 * 능력 요약 생성
 */
export function generateCapabilitySummary(): {
  total: number;
  available: number;
  limited: number;
  unavailable: number;
  comingSoon: number;
  byCategory: Record<CapabilityCategory, number>;
} {
  const capabilities = getAllCapabilities();

  const byCategory: Record<CapabilityCategory, number> = {
    scheduling: 0,
    task_management: 0,
    analysis: 0,
    suggestion: 0,
    automation: 0,
    communication: 0,
    learning: 0
  };

  capabilities.forEach(cap => {
    byCategory[cap.category]++;
  });

  return {
    total: capabilities.length,
    available: capabilities.filter(c => c.status === 'available').length,
    limited: capabilities.filter(c => c.status === 'limited').length,
    unavailable: capabilities.filter(c => c.status === 'unavailable').length,
    comingSoon: capabilities.filter(c => c.status === 'coming_soon').length,
    byCategory
  };
}

/**
 * "할 수 있어요" 메시지 생성
 */
export function generateCanDoMessage(): string {
  const available = getAvailableCapabilities();
  const examples = available
    .filter(c => c.examples && c.examples.length > 0)
    .flatMap(c => c.examples!)
    .slice(0, 3);

  if (examples.length > 0) {
    return `이런 것들을 도와드릴 수 있어요: "${examples.join('", "')}"`;
  }

  return '일정 관리, 할 일 정리, 우선순위 제안 등을 도와드릴 수 있어요.';
}

/**
 * "이건 어려워요" 메시지 생성
 */
export function generateCannotDoMessage(): string {
  const samples = CANNOT_DO.slice(0, 2);
  return `${samples.join(', ')} 같은 건 아직 어려워요.`;
}

/**
 * 능력 소개 메시지
 */
export function getCapabilityIntroduction(): string {
  return `저는 일정과 할 일을 관리하는 데 특화되어 있어요.
캘린더를 확인하고, 할 일의 우선순위를 정하고, 바쁜 정도를 분석하는 걸 잘해요.
대신 이메일을 보내거나, 중요한 결정을 대신하는 건 어려워요.
궁금한 게 있으면 물어봐주세요!`;
}
