/**
 * Performance Perception 서비스
 * 사용자가 느끼는 성능 최적화
 */

export interface PerformanceMetrics {
  loadTime: number;
  interactionDelay: number;
  animationFps: number;
  dataFetchTime: number;
}

export interface SkeletonConfig {
  type: 'card' | 'list' | 'text' | 'avatar' | 'custom';
  count?: number;
  height?: number;
}

const METRICS_KEY = 'alfredo_perf_metrics';

// 로딩 상태 메시지
export const LOADING_MESSAGES = [
  '잠시만요...',
  '가져오는 중...',
  '준비 중...',
  '로딩 중...'
];

// 진행 상태 메시지
export const PROGRESS_MESSAGES = {
  start: '시작하는 중...',
  fetching: '데이터를 가져오는 중...',
  processing: '처리하는 중...',
  almost: '거의 다 됐어요!',
  complete: '완료!'
};

/**
 * 로딩 메시지 가져오기
 */
export function getLoadingMessage(): string {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

/**
 * 성능 측정 시작
 */
export function startMeasure(name: string): () => number {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    recordMetric(name, duration);
    return duration;
  };
}

/**
 * 메트릭 기록
 */
export function recordMetric(name: string, value: number): void {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    const metrics: Record<string, number[]> = stored ? JSON.parse(stored) : {};

    if (!metrics[name]) metrics[name] = [];
    metrics[name].push(value);

    // 최근 100개만 유지
    if (metrics[name].length > 100) {
      metrics[name] = metrics[name].slice(-100);
    }

    localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  } catch (e) {
    console.error('Failed to record metric:', e);
  }
}

/**
 * 평균 메트릭 가져오기
 */
export function getAverageMetric(name: string): number {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    const metrics: Record<string, number[]> = stored ? JSON.parse(stored) : {};

    if (!metrics[name] || metrics[name].length === 0) return 0;

    return metrics[name].reduce((a, b) => a + b, 0) / metrics[name].length;
  } catch (e) {
    console.error('Failed to get metric:', e);
    return 0;
  }
}

/**
 * 인지된 성능 최적화를 위한 지연 추가
 */
export function addPerceivedDelay(minDelay: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, minDelay));
}

/**
 * 최소 로딩 시간 보장 (너무 빠르면 깜빡임)
 */
export async function withMinimumLoadTime<T>(
  promise: Promise<T>,
  minTime: number = 500
): Promise<T> {
  const start = Date.now();
  const result = await promise;
  const elapsed = Date.now() - start;

  if (elapsed < minTime) {
    await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
  }

  return result;
}

/**
 * 진행 상태 계산
 */
export function calculateProgress(
  current: number,
  total: number,
  smoothing: boolean = true
): number {
  const raw = Math.min((current / total) * 100, 100);

  if (smoothing) {
    // 끝부분에서 천천히 (90% 이상에서 느리게)
    if (raw > 90) {
      return 90 + (raw - 90) * 0.5;
    }
  }

  return Math.round(raw);
}

/**
 * 스켈레톤 설정 생성
 */
export function createSkeletonConfig(
  type: SkeletonConfig['type'],
  count: number = 3
): SkeletonConfig {
  return { type, count };
}

/**
 * 캐시 히트율 계산
 */
export function getCacheHitRate(): number {
  try {
    const stored = localStorage.getItem(METRICS_KEY);
    const metrics: Record<string, number[]> = stored ? JSON.parse(stored) : {};

    const hits = metrics['cache_hit']?.length || 0;
    const misses = metrics['cache_miss']?.length || 0;

    if (hits + misses === 0) return 100;
    return Math.round((hits / (hits + misses)) * 100);
  } catch (e) {
    return 100;
  }
}
