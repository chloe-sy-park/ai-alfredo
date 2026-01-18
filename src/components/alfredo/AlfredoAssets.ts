/**
 * Alfredo Character Assets
 *
 * 알프레도 캐릭터 이미지 경로 상수 및 유틸리티
 */

// ===== Avatar Images (투명 배경, UI용) =====
export const ALFREDO_AVATAR = {
  xs: '/assets/alfredo/avatar/alfredo-avatar-24.png',    // 24px
  sm: '/assets/alfredo/avatar/alfredo-avatar-32.png',    // 32px
  md: '/assets/alfredo/avatar/alfredo-avatar-48.png',    // 48px
  lg: '/assets/alfredo/avatar/alfredo-avatar-64.png',    // 64px
  xl: '/assets/alfredo/avatar/alfredo-avatar-80.png',    // 80px
  '2xl': '/assets/alfredo/avatar/alfredo-avatar-120.png', // 120px
  '3xl': '/assets/alfredo/avatar/alfredo-avatar-256.png', // 256px
  '4xl': '/assets/alfredo/avatar/alfredo-avatar-512.png', // 512px
  master: '/assets/alfredo/avatar/alfredo-avatar-1024.png', // 1024px (원본)
} as const;

// ===== App Icons (어두운 배경, 앱 아이콘용) =====
export const ALFREDO_APP_ICON = {
  sm: '/assets/alfredo/app-icon/alfredo-app-icon-512.png',   // 512px
  lg: '/assets/alfredo/app-icon/alfredo-app-icon-1024.png',  // 1024px
} as const;

// Type exports
export type AlfredoAvatarSize = keyof typeof ALFREDO_AVATAR;
export type AlfredoAppIconSize = keyof typeof ALFREDO_APP_ICON;

/**
 * 컴포넌트 사이즈에 따른 적절한 아바타 이미지 선택
 *
 * @param componentSize - Tailwind 사이즈 클래스 기준 (sm, md, lg, xl)
 * @returns 적절한 해상도의 이미지 경로
 */
export function getAvatarForSize(componentSize: 'sm' | 'md' | 'lg' | 'xl'): string {
  // 컴포넌트 사이즈 → 실제 픽셀 매핑 (2x 해상도 고려)
  const sizeMap: Record<string, AlfredoAvatarSize> = {
    sm: 'md',    // w-12 (48px) → 48px image (retina: 96px needed, use 120px)
    md: 'xl',    // w-20 (80px) → 80px image (retina: 160px needed, use 256px)
    lg: '2xl',   // w-32 (128px) → 120px image (retina: 256px needed)
    xl: '3xl',   // w-48 (192px) → 256px image (retina: 512px needed)
  };

  return ALFREDO_AVATAR[sizeMap[componentSize] || 'xl'];
}

/**
 * 고해상도 디스플레이용 srcSet 생성
 */
export function getAvatarSrcSet(componentSize: 'sm' | 'md' | 'lg' | 'xl'): string {
  const sizes: Record<string, [AlfredoAvatarSize, AlfredoAvatarSize]> = {
    sm: ['md', 'xl'],      // 1x: 48px, 2x: 80px
    md: ['xl', '2xl'],     // 1x: 80px, 2x: 120px
    lg: ['2xl', '3xl'],    // 1x: 120px, 2x: 256px
    xl: ['3xl', '4xl'],    // 1x: 256px, 2x: 512px
  };

  const [size1x, size2x] = sizes[componentSize] || ['xl', '2xl'];
  return `${ALFREDO_AVATAR[size1x]} 1x, ${ALFREDO_AVATAR[size2x]} 2x`;
}

/**
 * 이미지 preload를 위한 경로 배열 반환
 */
export function getPreloadAvatars(): string[] {
  return [
    ALFREDO_AVATAR.md,   // 가장 많이 사용되는 사이즈
    ALFREDO_AVATAR.xl,
    ALFREDO_AVATAR['2xl'],
  ];
}

export default ALFREDO_AVATAR;
