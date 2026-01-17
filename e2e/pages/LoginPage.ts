import { Page, Locator, expect } from '@playwright/test';

/**
 * 로그인 페이지 Page Object
 */
export class LoginPage {
  readonly page: Page;

  // 로케이터
  readonly googleLoginButton: Locator;
  readonly pageTitle: Locator;
  readonly welcomeMessage: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.googleLoginButton = page.getByRole('button', { name: /google/i });
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.logo = page.locator('[data-testid="logo"]');
  }

  /**
   * 로그인 페이지로 이동
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Google 로그인 버튼 클릭
   */
  async clickGoogleLogin() {
    await this.googleLoginButton.click();
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async expectLoaded() {
    await expect(this.googleLoginButton).toBeVisible();
  }

  /**
   * 모킹된 Google OAuth 로그인 수행
   * (실제로는 localStorage에 세션 저장)
   */
  async mockGoogleLogin(userData: {
    id: string;
    email: string;
    name: string;
  }) {
    await this.page.evaluate((user) => {
      const mockSession = {
        access_token: 'mock-access-token',
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
      localStorage.setItem(
        'sb-localhost-auth-token',
        JSON.stringify(mockSession)
      );
    }, userData);

    // 페이지 새로고침으로 세션 적용
    await this.page.reload();
  }
}
