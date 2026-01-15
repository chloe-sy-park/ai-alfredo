/**
 * Error Recovery UX 타입 정의
 * 에러 발생 시 사용자 친화적 복구 경험
 */

/**
 * 에러 심각도
 */
export type ErrorSeverity =
  | 'info'       // 정보성 (작업 계속 가능)
  | 'warning'    // 경고 (주의 필요)
  | 'error'      // 에러 (기능 제한)
  | 'critical';  // 치명적 (앱 사용 불가)

/**
 * 에러 카테고리
 */
export type ErrorCategory =
  | 'network'       // 네트워크 문제
  | 'sync'          // 동기화 실패
  | 'data'          // 데이터 문제
  | 'permission'    // 권한 문제
  | 'timeout'       // 시간 초과
  | 'validation'    // 유효성 검사 실패
  | 'unknown';      // 알 수 없음

/**
 * 사용자 친화적 에러
 */
export interface FriendlyError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  title: string;
  message: string;
  suggestion?: string;
  canRetry: boolean;
  retryAction?: () => void;
  fallbackAction?: {
    label: string;
    action: () => void;
  };
  timestamp: string;
  resolved: boolean;
}

/**
 * 에러 복구 옵션
 */
export interface RecoveryOption {
  id: string;
  label: string;
  description?: string;
  action: () => void | Promise<void>;
  isPrimary: boolean;
}

/**
 * 에러 이력
 */
export interface ErrorHistory {
  errors: FriendlyError[];
  lastError?: FriendlyError;
  recoveryAttempts: number;
  successfulRecoveries: number;
}

/**
 * 카테고리별 기본 메시지
 */
export const ERROR_MESSAGES: Record<ErrorCategory, { title: string; message: string; suggestion: string }> = {
  network: {
    title: '연결이 끊겼어요',
    message: '인터넷 연결을 확인해주세요',
    suggestion: '와이파이나 데이터 연결 상태를 확인해보세요'
  },
  sync: {
    title: '동기화에 문제가 있어요',
    message: '데이터를 가져오는 중 문제가 생겼어요',
    suggestion: '잠시 후 다시 시도해주세요'
  },
  data: {
    title: '데이터를 불러올 수 없어요',
    message: '저장된 데이터에 문제가 있어요',
    suggestion: '새로고침하거나 앱을 다시 시작해보세요'
  },
  permission: {
    title: '권한이 필요해요',
    message: '이 기능을 사용하려면 권한이 필요해요',
    suggestion: '설정에서 권한을 허용해주세요'
  },
  timeout: {
    title: '응답이 너무 오래 걸려요',
    message: '서버 응답을 기다리는 중 시간이 초과됐어요',
    suggestion: '네트워크 상태를 확인하고 다시 시도해주세요'
  },
  validation: {
    title: '입력을 확인해주세요',
    message: '입력한 내용에 문제가 있어요',
    suggestion: '내용을 다시 확인해주세요'
  },
  unknown: {
    title: '문제가 생겼어요',
    message: '예상치 못한 문제가 발생했어요',
    suggestion: '잠시 후 다시 시도해주세요'
  }
};

/**
 * 위로 메시지 (에러 발생 시)
 */
export const ERROR_COMFORT_MESSAGES = [
  '괜찮아요, 잠깐 문제가 생겼을 뿐이에요',
  '금방 해결될 거예요',
  '걱정 마세요, 데이터는 안전해요',
  '기술적인 문제예요, 당신 잘못이 아니에요'
];

/**
 * 복구 성공 메시지
 */
export const RECOVERY_SUCCESS_MESSAGES = [
  '다시 정상이에요!',
  '문제가 해결됐어요',
  '이제 잘 될 거예요',
  '복구 완료!'
];
