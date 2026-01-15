/**
 * Customization Options 서비스
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type DensityMode = 'compact' | 'comfortable' | 'spacious';

export interface CustomizationSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  density: DensityMode;
  accentColor: string;
  showEmojis: boolean;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  hapticEnabled: boolean;
}

const SETTINGS_KEY = 'alfredo_customization';

export const DEFAULT_CUSTOMIZATION: CustomizationSettings = {
  theme: 'system',
  fontSize: 'medium',
  density: 'comfortable',
  accentColor: '#3B82F6',
  showEmojis: true,
  animationsEnabled: true,
  soundsEnabled: false,
  hapticEnabled: true
};

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: '라이트',
  dark: '다크',
  system: '시스템 설정'
};

export const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: '작게',
  medium: '보통',
  large: '크게'
};

export const DENSITY_LABELS: Record<DensityMode, string> = {
  compact: '조밀하게',
  comfortable: '보통',
  spacious: '넓게'
};

export function loadCustomization(): CustomizationSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Failed to load customization:', e);
  }
  return { ...DEFAULT_CUSTOMIZATION };
}

export function saveCustomization(settings: Partial<CustomizationSettings>): void {
  try {
    const current = loadCustomization();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch (e) {
    console.error('Failed to save customization:', e);
  }
}

export function setTheme(theme: ThemeMode): void {
  saveCustomization({ theme });
  applyTheme(theme);
}

export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export function setFontSize(size: FontSize): void {
  saveCustomization({ fontSize: size });
  document.documentElement.dataset.fontSize = size;
}

export function setDensity(density: DensityMode): void {
  saveCustomization({ density });
  document.documentElement.dataset.density = density;
}

export function resetCustomization(): void {
  localStorage.removeItem(SETTINGS_KEY);
}
