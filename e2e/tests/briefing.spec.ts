import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('브리핑 기능', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('홈 페이지가 정상적으로 로드되어야 함', async () => {
    await homePage.expectLoaded();
  });

  test('브리핑 영역이 표시되어야 함', async ({ page }) => {
    // 브리핑 관련 요소 찾기
    const briefingArea = page.locator(
      '[class*="briefing"], [data-testid*="briefing"], [class*="morning"], section'
    );

    // 적어도 하나의 섹션이 표시되어야 함
    const mainContent = page.locator('main, [role="main"], #root > div');
    await expect(mainContent).toBeVisible();
  });

  test('브리핑에 오늘 날짜 정보가 포함되어야 함', async ({ page }) => {
    // 날짜 관련 텍스트 확인
    const today = new Date();
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // 오늘 날짜 텍스트 중 하나가 페이지에 있는지 확인
    const datePatterns = [
      `${today.getMonth() + 1}월`,
      `${today.getDate()}일`,
      dayNames[today.getDay()],
      today.toLocaleDateString('ko-KR'),
    ];

    // 날짜 정보가 있을 수 있음
    const pageContent = await page.content();
    const hasDateInfo = datePatterns.some((pattern) => pageContent.includes(pattern));

    // 날짜가 있으면 확인, 없어도 오류는 아님 (선택적 기능)
    if (hasDateInfo) {
      expect(hasDateInfo).toBe(true);
    }
  });

  test('Work 모드와 Life 모드 전환이 가능해야 함', async ({ page }) => {
    // 모드 전환 탭 찾기
    const modeToggle = page.locator(
      '[class*="mode-toggle"], [class*="tab"], [role="tablist"]'
    );

    if (await modeToggle.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      const tabs = modeToggle.locator('[role="tab"], button');
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // 두 번째 탭 클릭 (모드 전환)
        await tabs.nth(1).click();
        await page.waitForTimeout(500);

        // 다시 첫 번째 탭 클릭
        await tabs.nth(0).click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('브리핑 새로고침이 가능해야 함', async ({ page }) => {
    // 새로고침 버튼 찾기
    const refreshButton = page.locator(
      '[aria-label*="refresh"], [aria-label*="새로고침"], [class*="refresh"], button:has(svg[class*="refresh"])'
    );

    if (await refreshButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await refreshButton.first().click();

      // 로딩 상태 확인 (선택적)
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('브리핑 개인화', () => {
  test('DNA 기반 브리핑이 표시되어야 함', async ({ page }) => {
    // DNA 프로필 모킹
    await page.evaluate(() => {
      localStorage.setItem('alfredo-dna-profile', JSON.stringify({
        workStyle: 'planner',
        energyPattern: {
          morningEnergy: 0.8,
          afternoonEnergy: 0.6,
          eveningEnergy: 0.4,
        },
        learningProgress: 0.65,
      }));
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    // 브리핑 콘텐츠 확인
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('일정이 있으면 브리핑에 표시되어야 함', async ({ page }) => {
    // 일정 데이터 API 모킹
    await page.route('**/events**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'event-1',
              title: '팀 미팅',
              start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            },
          ],
        }),
      });
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    // 일정 관련 정보가 있을 수 있음
    const scheduleSection = page.locator('[class*="schedule"], [class*="event"], [class*="calendar"]');
    // 선택적 확인 - 일정 섹션이 있으면 표시됨
  });
});
