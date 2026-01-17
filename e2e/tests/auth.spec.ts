import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { mockTestUser } from '../fixtures/auth';

test.describe('인증 플로우', () => {
  test('로그인 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 새 컨텍스트에서 테스트 (인증되지 않은 상태)
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.expectLoaded();
    await expect(loginPage.googleLoginButton).toBeVisible();
  });

  test('모킹된 Google 로그인이 작동해야 함', async ({ page }) => {
    // 인증 상태 클리어
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 모킹된 로그인 수행
    await loginPage.mockGoogleLogin(mockTestUser);

    // 로그인 후 리다이렉트 확인
    await page.waitForURL(/^(?!.*login).*/);
  });

  test('인증된 사용자는 홈으로 리다이렉트되어야 함', async ({ page }) => {
    // 먼저 인증 상태 설정
    await page.evaluate((user) => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { name: user.name },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockSession));
      localStorage.setItem('alfredo-onboarding-completed', 'true');
    }, mockTestUser);

    // 로그인 페이지 접근 시도
    await page.goto('/login');

    // 홈으로 리다이렉트되어야 함
    await expect(page).not.toHaveURL(/.*login.*/);
  });

  test('로그아웃 후 로그인 페이지로 이동해야 함', async ({ page }) => {
    // 인증 상태 설정
    await page.evaluate((user) => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { name: user.name },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockSession));
      localStorage.setItem('alfredo-onboarding-completed', 'true');
    }, mockTestUser);

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // 로그아웃 버튼 찾기 및 클릭
    const logoutButton = page.getByRole('button', { name: /logout|로그아웃/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // 확인 다이얼로그 처리
      const confirmButton = page.getByRole('button', { name: /confirm|확인|예/i });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // 로그인 페이지로 이동 확인
      await expect(page).toHaveURL(/.*login.*/);
    }
  });
});
