import { defineConfig, devices } from '@playwright/test';

/**
 * AI 알프레도 E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/tests',

  /* 병렬 실행 설정 */
  fullyParallel: true,

  /* CI에서 실패 시 재시도 하지 않음 */
  forbidOnly: !!process.env.CI,

  /* 재시도 횟수: 로컬 0, CI 2 */
  retries: process.env.CI ? 2 : 0,

  /* 병렬 워커 수: CI에서는 제한 */
  workers: process.env.CI ? 1 : undefined,

  /* 리포터 설정 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* 공통 테스트 설정 */
  use: {
    /* 기본 URL */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    /* 실패 시 스크린샷 */
    screenshot: 'only-on-failure',

    /* 실패 시 트레이스 */
    trace: 'on-first-retry',

    /* 비디오 녹화 */
    video: 'on-first-retry',
  },

  /* 프로젝트별 브라우저 설정 */
  projects: [
    /* 인증 설정 프로젝트 */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    /* 데스크톱 Chrome 테스트 */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    /* 모바일 Chrome 테스트 */
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    /* 데스크톱 Safari 테스트 */
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* 로컬 개발 서버 자동 실행 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
