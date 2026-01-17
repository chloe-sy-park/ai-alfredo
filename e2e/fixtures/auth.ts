import { test as base, expect, Page } from '@playwright/test';

/**
 * 테스트 사용자 정보
 */
export interface TestUser {
  email: string;
  name: string;
  id: string;
}

/**
 * 확장된 테스트 Fixture 타입
 */
export interface TestFixtures {
  authenticatedPage: Page;
  testUser: TestUser;
}

/**
 * 모킹된 테스트 사용자
 */
export const mockTestUser: TestUser = {
  email: 'test@example.com',
  name: 'Test User',
  id: 'test-user-id-123',
};

/**
 * 인증 상태를 모킹하는 헬퍼
 */
export async function mockAuthState(page: Page, user: TestUser = mockTestUser) {
  // Supabase 세션 모킹
  await page.addInitScript((userData) => {
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: {
        id: userData.id,
        email: userData.email,
        user_metadata: {
          name: userData.name,
          avatar_url: 'https://example.com/avatar.png',
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    };

    // localStorage에 세션 저장
    localStorage.setItem(
      'sb-localhost-auth-token',
      JSON.stringify(mockSession)
    );

    // 온보딩 완료 상태 저장
    localStorage.setItem('alfredo-onboarding-completed', 'true');
  }, user);
}

/**
 * 인증 상태를 클리어하는 헬퍼
 */
export async function clearAuthState(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('sb-localhost-auth-token');
    localStorage.removeItem('alfredo-onboarding-completed');
  });
}

/**
 * 인증된 테스트 fixture
 */
export const test = base.extend<TestFixtures>({
  // 인증된 페이지 제공
  authenticatedPage: async ({ page }, use) => {
    await mockAuthState(page);
    await use(page);
  },

  // 테스트 사용자 정보 제공
  testUser: async ({}, use) => {
    await use(mockTestUser);
  },
});

export { expect };
