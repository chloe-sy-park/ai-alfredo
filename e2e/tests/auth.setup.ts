import { test as setup, expect } from '@playwright/test';
import { mockTestUser } from '../fixtures/auth';

const authFile = 'e2e/.auth/user.json';

/**
 * 인증 설정 테스트
 * 다른 테스트 전에 실행되어 인증 상태를 저장
 */
setup('authenticate', async ({ page }) => {
  // 앱 로드
  await page.goto('/');

  // 모킹된 세션 설정
  await page.evaluate((user) => {
    const mockSession = {
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          avatar_url: 'https://example.com/avatar.png',
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    };

    // Supabase 세션 저장
    localStorage.setItem(
      'sb-localhost-auth-token',
      JSON.stringify(mockSession)
    );

    // 온보딩 완료 표시
    localStorage.setItem('alfredo-onboarding-completed', 'true');
    localStorage.setItem('alfredo-onboarding-step', 'complete');
  }, mockTestUser);

  // 페이지 새로고침으로 세션 적용
  await page.reload();
  await page.waitForLoadState('networkidle');

  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
});
