import { corsHeaders } from './cors.ts';

// 표준 API 응답 인터페이스
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// 성공 응답
export function successResponse<T>(
  data: T,
  status = 200,
  meta?: ApiResponse<T>['meta']
): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    body.meta = meta;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 에러 응답
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): Response {
  const body: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 일반적인 에러 코드
export const ErrorCodes = {
  // 인증 관련
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // 리소스 관련
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // 요청 관련
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_FIELD: 'MISSING_FIELD',

  // 서버 관련
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Rate Limit
  RATE_LIMITED: 'RATE_LIMITED',

  // 구독 관련
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
} as const;
