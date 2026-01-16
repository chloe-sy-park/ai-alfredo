/**
 * Power Balance 서비스
 * 사용자와 AI 간의 권력 균형 관리
 */

import {
  ControlArea,
  ControlLevel,
  UserPowerSettings,
  OverrideRecord,
  DelegationRequest,
  UndoOption,
  DEFAULT_CONTROL_SETTINGS,
  DELEGATION_MESSAGES,
  USER_PRIORITY_MESSAGES
} from './types';

const POWER_SETTINGS_KEY = 'alfredo_power_settings';
const DELEGATION_KEY = 'alfredo_delegations';
const UNDO_KEY = 'alfredo_undo_options';

// ========== 컨트롤 설정 관리 ==========

/**
 * 권한 설정 로드
 */
export function loadPowerSettings(): UserPowerSettings {
  try {
    const stored = localStorage.getItem(POWER_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load power settings:', e);
  }

  return {
    controls: { ...DEFAULT_CONTROL_SETTINGS },
    overrideHistory: [],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * 권한 설정 저장
 */
function savePowerSettings(settings: UserPowerSettings): void {
  try {
    settings.lastUpdated = new Date().toISOString();
    localStorage.setItem(POWER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save power settings:', e);
  }
}

/**
 * 특정 영역 컨트롤 레벨 가져오기
 */
export function getControlLevel(area: ControlArea): ControlLevel {
  const settings = loadPowerSettings();
  return settings.controls[area] || DEFAULT_CONTROL_SETTINGS[area];
}

/**
 * 컨트롤 레벨 업데이트
 */
export function setControlLevel(area: ControlArea, level: ControlLevel): void {
  const settings = loadPowerSettings();
  settings.controls[area] = level;
  savePowerSettings(settings);
}

/**
 * 모든 컨트롤 설정 가져오기
 */
export function getAllControlSettings(): Record<ControlArea, ControlLevel> {
  return loadPowerSettings().controls;
}

/**
 * 기본값으로 리셋
 */
export function resetToDefaults(): void {
  const settings = loadPowerSettings();
  settings.controls = { ...DEFAULT_CONTROL_SETTINGS };
  savePowerSettings(settings);
}

// ========== 오버라이드 (사용자 결정 우선) ==========

/**
 * 오버라이드 기록
 */
export function recordOverride(
  area: ControlArea,
  aiSuggestion: string,
  userDecision: string,
  reason?: string
): OverrideRecord {
  const settings = loadPowerSettings();

  const record: OverrideRecord = {
    id: `override_${Date.now()}`,
    area,
    aiSuggestion,
    userDecision,
    reason,
    timestamp: new Date().toISOString()
  };

  settings.overrideHistory.push(record);

  // 최근 100개만 유지
  if (settings.overrideHistory.length > 100) {
    settings.overrideHistory.splice(0, settings.overrideHistory.length - 100);
  }

  savePowerSettings(settings);

  return record;
}

/**
 * 오버라이드 이력 조회
 */
export function getOverrideHistory(limit: number = 20): OverrideRecord[] {
  const settings = loadPowerSettings();
  return settings.overrideHistory.slice(-limit).reverse();
}

/**
 * 영역별 오버라이드 빈도
 */
export function getOverrideFrequency(): Record<ControlArea, number> {
  const settings = loadPowerSettings();
  const frequency: Record<ControlArea, number> = {
    scheduling: 0,
    task_priority: 0,
    notifications: 0,
    suggestions: 0,
    automation: 0,
    data_usage: 0
  };

  settings.overrideHistory.forEach(record => {
    frequency[record.area]++;
  });

  return frequency;
}

// ========== 위임 요청 ==========

/**
 * 위임 요청 생성
 */
export function createDelegationRequest(
  area: ControlArea,
  action: string,
  reason: string,
  duration?: 'once' | 'session' | 'always'
): DelegationRequest {
  const request: DelegationRequest = {
    id: `delegation_${Date.now()}`,
    area,
    action,
    reason,
    duration,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    const stored = localStorage.getItem(DELEGATION_KEY);
    const requests: DelegationRequest[] = stored ? JSON.parse(stored) : [];
    requests.push(request);
    localStorage.setItem(DELEGATION_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save delegation request:', e);
  }

  return request;
}

/**
 * 위임 요청 응답
 */
export function respondToDelegation(
  requestId: string,
  approved: boolean
): DelegationRequest | null {
  try {
    const stored = localStorage.getItem(DELEGATION_KEY);
    const requests: DelegationRequest[] = stored ? JSON.parse(stored) : [];

    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = approved ? 'approved' : 'denied';
      request.respondedAt = new Date().toISOString();
      localStorage.setItem(DELEGATION_KEY, JSON.stringify(requests));
      return request;
    }
  } catch (e) {
    console.error('Failed to respond to delegation:', e);
  }

  return null;
}

/**
 * 펜딩 위임 요청 조회
 */
export function getPendingDelegations(): DelegationRequest[] {
  try {
    const stored = localStorage.getItem(DELEGATION_KEY);
    const requests: DelegationRequest[] = stored ? JSON.parse(stored) : [];
    return requests.filter(r => r.status === 'pending');
  } catch (e) {
    console.error('Failed to get pending delegations:', e);
  }
  return [];
}

// ========== 되돌리기 (Undo) ==========

/**
 * 되돌리기 옵션 등록
 */
export function registerUndoOption(
  action: string,
  description: string,
  deadlineMinutes: number = 5
): UndoOption {
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + deadlineMinutes);

  const option: UndoOption = {
    id: `undo_${Date.now()}`,
    action,
    description,
    canUndo: true,
    undoDeadline: deadline.toISOString()
  };

  try {
    const stored = localStorage.getItem(UNDO_KEY);
    const options: UndoOption[] = stored ? JSON.parse(stored) : [];
    options.push(option);

    // 최근 20개만 유지
    if (options.length > 20) {
      options.splice(0, options.length - 20);
    }

    localStorage.setItem(UNDO_KEY, JSON.stringify(options));
  } catch (e) {
    console.error('Failed to register undo option:', e);
  }

  return option;
}

/**
 * 되돌리기 실행
 */
export function executeUndo(optionId: string): boolean {
  try {
    const stored = localStorage.getItem(UNDO_KEY);
    const options: UndoOption[] = stored ? JSON.parse(stored) : [];

    const option = options.find(o => o.id === optionId);
    if (option && option.canUndo) {
      // 기한 확인
      if (option.undoDeadline && new Date(option.undoDeadline) < new Date()) {
        option.canUndo = false;
        localStorage.setItem(UNDO_KEY, JSON.stringify(options));
        return false;
      }

      option.undoneAt = new Date().toISOString();
      option.canUndo = false;
      localStorage.setItem(UNDO_KEY, JSON.stringify(options));
      return true;
    }
  } catch (e) {
    console.error('Failed to execute undo:', e);
  }

  return false;
}

/**
 * 사용 가능한 되돌리기 옵션 조회
 */
export function getAvailableUndos(): UndoOption[] {
  try {
    const stored = localStorage.getItem(UNDO_KEY);
    const options: UndoOption[] = stored ? JSON.parse(stored) : [];

    const now = new Date();
    return options.filter(o => {
      if (!o.canUndo) return false;
      if (o.undoDeadline && new Date(o.undoDeadline) < now) return false;
      return true;
    });
  } catch (e) {
    console.error('Failed to get available undos:', e);
  }
  return [];
}

// ========== 권한 분석 ==========

/**
 * 현재 권한 균형 분석
 */
export function analyzePowerBalance(): {
  userControlled: number;
  aiAssisted: number;
  balanced: number;
  overrideRate: number;
} {
  const settings = loadPowerSettings();
  const controls = Object.values(settings.controls);

  let userControlled = 0;
  let aiAssisted = 0;
  let balanced = 0;

  controls.forEach(level => {
    if (level === 'user_full' || level === 'user_primary') {
      userControlled++;
    } else if (level === 'ai_suggest' || level === 'ai_auto') {
      aiAssisted++;
    } else {
      balanced++;
    }
  });

  // 오버라이드 비율 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOverrides = settings.overrideHistory.filter(
    r => new Date(r.timestamp) > thirtyDaysAgo
  );

  return {
    userControlled,
    aiAssisted,
    balanced,
    overrideRate: recentOverrides.length
  };
}

/**
 * 권한 조정 제안
 */
export function suggestPowerAdjustment(): {
  area: ControlArea;
  currentLevel: ControlLevel;
  suggestedLevel: ControlLevel;
  reason: string;
} | null {
  const frequency = getOverrideFrequency();
  const settings = loadPowerSettings();

  // 가장 많이 오버라이드된 영역 찾기
  let maxArea: ControlArea | null = null;
  let maxCount = 0;

  (Object.entries(frequency) as [ControlArea, number][]).forEach(([area, count]) => {
    if (count > maxCount && count >= 3) {
      maxCount = count;
      maxArea = area;
    }
  });

  if (maxArea) {
    const currentLevel = settings.controls[maxArea];

    // 사용자 컨트롤 방향으로 조정 제안
    const adjustmentMap: Partial<Record<ControlLevel, ControlLevel>> = {
      ai_auto: 'ai_suggest',
      ai_suggest: 'balanced',
      balanced: 'user_primary'
    };

    const suggestedLevel = adjustmentMap[currentLevel];

    if (suggestedLevel) {
      return {
        area: maxArea,
        currentLevel,
        suggestedLevel,
        reason: `이 영역에서 ${maxCount}번이나 다르게 결정하셨어요. 더 직접 컨트롤하시는 게 좋을 것 같아요.`
      };
    }
  }

  return null;
}

// ========== 메시지 생성 ==========

/**
 * 위임 요청 메시지
 */
export function getDelegationRequestMessage(): string {
  const messages = DELEGATION_MESSAGES.request;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 위임 승인 메시지
 */
export function getDelegationApprovedMessage(): string {
  const messages = DELEGATION_MESSAGES.approved;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 위임 거절 메시지
 */
export function getDelegationDeniedMessage(): string {
  const messages = DELEGATION_MESSAGES.denied;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 사용자 우선 메시지
 */
export function getUserPriorityMessage(): string {
  return USER_PRIORITY_MESSAGES[Math.floor(Math.random() * USER_PRIORITY_MESSAGES.length)];
}

/**
 * 컨트롤 레벨에 따른 행동 가이드
 */
export function getActionGuide(area: ControlArea): string {
  const level = getControlLevel(area);

  switch (level) {
    case 'user_full':
      return '요청하시면 도와드릴게요';
    case 'user_primary':
      return '정보를 드릴게요, 결정은 맡길게요';
    case 'balanced':
      return '같이 생각해볼까요?';
    case 'ai_suggest':
      return '제가 제안드릴게요, 확인해주세요';
    case 'ai_auto':
      return '제가 처리해드릴게요';
    default:
      return '';
  }
}
