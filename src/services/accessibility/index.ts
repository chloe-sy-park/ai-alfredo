/**
 * Accessibility 서비스
 */

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

const SETTINGS_KEY = 'alfredo_accessibility';

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  focusIndicators: true
};

export const ACCESSIBILITY_LABELS: Record<keyof AccessibilitySettings, { label: string; description: string }> = {
  reduceMotion: {
    label: '움직임 줄이기',
    description: '애니메이션과 전환 효과를 최소화해요'
  },
  highContrast: {
    label: '고대비 모드',
    description: '텍스트와 배경의 대비를 높여요'
  },
  largeText: {
    label: '큰 텍스트',
    description: '모든 텍스트 크기를 키워요'
  },
  screenReaderOptimized: {
    label: '스크린 리더 최적화',
    description: '스크린 리더 사용을 위해 최적화해요'
  },
  keyboardNavigation: {
    label: '키보드 탐색',
    description: '키보드만으로 앱을 사용할 수 있어요'
  },
  focusIndicators: {
    label: '포커스 표시',
    description: '현재 선택된 요소를 명확히 표시해요'
  }
};

export function loadAccessibility(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_ACCESSIBILITY, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load accessibility:', e);
  }

  // 시스템 설정 감지
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

  return {
    ...DEFAULT_ACCESSIBILITY,
    reduceMotion: prefersReducedMotion,
    highContrast: prefersHighContrast
  };
}

export function saveAccessibility(settings: Partial<AccessibilitySettings>): void {
  try {
    const current = loadAccessibility();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    applyAccessibility(updated);
  } catch (e) {
    console.error('Failed to save accessibility:', e);
  }
}

export function applyAccessibility(settings: AccessibilitySettings): void {
  const root = document.documentElement;

  root.classList.toggle('reduce-motion', settings.reduceMotion);
  root.classList.toggle('high-contrast', settings.highContrast);
  root.classList.toggle('large-text', settings.largeText);
  root.classList.toggle('sr-optimized', settings.screenReaderOptimized);
  root.classList.toggle('keyboard-nav', settings.keyboardNavigation);
  root.classList.toggle('focus-visible', settings.focusIndicators);
}

export function toggleSetting(key: keyof AccessibilitySettings): boolean {
  const settings = loadAccessibility();
  const newValue = !settings[key];
  saveAccessibility({ [key]: newValue });
  return newValue;
}

export function resetAccessibility(): void {
  localStorage.removeItem(SETTINGS_KEY);
  applyAccessibility(DEFAULT_ACCESSIBILITY);
}

// 초기화
if (typeof window !== 'undefined') {
  applyAccessibility(loadAccessibility());
}
