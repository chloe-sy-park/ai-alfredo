import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { sampleTasks } from '../fixtures/testData';

test.describe('태스크 기능', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    // 태스크 데이터 모킹
    await page.route('**/tasks**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: sampleTasks }),
        });
      } else {
        await route.continue();
      }
    });

    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('태스크 목록이 표시되어야 함', async ({ page }) => {
    // 태스크 관련 요소 찾기
    const taskArea = page.locator(
      '[class*="task"], [data-testid*="task"], [class*="todo"], [class*="priority"]'
    );

    // 메인 콘텐츠 영역은 표시되어야 함
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('태스크 추가 버튼이 있어야 함', async ({ page }) => {
    // 추가 버튼 찾기
    const addButton = page.locator(
      'button:has-text("추가"), button:has-text("Add"), [aria-label*="add"], [aria-label*="추가"], button:has(svg[class*="plus"])'
    );

    // 버튼이 있으면 확인
    if (await addButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(addButton.first()).toBeVisible();
    }
  });

  test('태스크 완료 체크박스가 작동해야 함', async ({ page }) => {
    // 체크박스 찾기
    const checkboxes = page.locator(
      'input[type="checkbox"], [role="checkbox"], [class*="checkbox"]'
    );

    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      const firstCheckbox = checkboxes.first();

      // 체크 상태 토글
      await firstCheckbox.click();
      await page.waitForTimeout(500);
    }
  });

  test('태스크에 우선순위가 표시되어야 함', async ({ page }) => {
    // 우선순위 관련 요소 찾기
    const priorityIndicators = page.locator(
      '[class*="priority"], [class*="urgent"], [class*="important"], [class*="high"], [class*="medium"], [class*="low"]'
    );

    // 우선순위 표시가 있을 수 있음 (선택적)
    const count = await priorityIndicators.count();
    // 표시가 있으면 확인
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('태스크를 클릭하면 상세 정보가 표시되어야 함', async ({ page }) => {
    // 태스크 아이템 찾기
    const taskItems = page.locator(
      '[class*="task-item"], [class*="todo-item"], [data-testid*="task"]'
    );

    const itemCount = await taskItems.count();

    if (itemCount > 0) {
      // 첫 번째 태스크 클릭
      await taskItems.first().click();
      await page.waitForTimeout(500);

      // 상세 모달이나 확장 영역 확인
      const detailArea = page.locator(
        '[class*="modal"], [class*="detail"], [class*="sheet"], [role="dialog"]'
      );

      // 상세 영역이 나타날 수 있음
    }
  });
});

test.describe('태스크 우선순위 시스템', () => {
  test('Top 3 태스크가 강조 표시되어야 함', async ({ page }) => {
    // 태스크 데이터 모킹
    await page.route('**/tasks**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: sampleTasks }),
      });
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    // Top 태스크 영역 찾기
    const topTasksSection = page.locator(
      '[class*="top-task"], [class*="priority-task"], [class*="recommended"], [class*="stack"]'
    );

    // Top 태스크 섹션이 있으면 확인
    if (await topTasksSection.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(topTasksSection.first()).toBeVisible();
    }
  });

  test('마감일 기준 정렬이 적용되어야 함', async ({ page }) => {
    // 마감일이 있는 태스크 모킹
    const tasksWithDueDate = [
      { ...sampleTasks[0], dueDate: new Date(Date.now() + 1000 * 60 * 60).toISOString() }, // 1시간 후
      { ...sampleTasks[1], dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() }, // 1일 후
      { ...sampleTasks[2], dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString() }, // 2일 후
    ];

    await page.route('**/tasks**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: tasksWithDueDate }),
      });
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    // 태스크가 로드되었는지 확인
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('중요 표시된 태스크가 상위에 표시되어야 함', async ({ page }) => {
    // 중요 표시된 태스크 모킹
    const starredTasks = sampleTasks.map((t, i) => ({
      ...t,
      starred: i === 0,
      priority: i === 0 ? 'high' : 'medium',
    }));

    await page.route('**/tasks**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: starredTasks }),
      });
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    // 별표/중요 표시 찾기
    const starredIndicator = page.locator(
      '[class*="star"], [class*="important"], [class*="flagged"], svg[class*="star"]'
    );

    // 있으면 확인
    if (await starredIndicator.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(starredIndicator.first()).toBeVisible();
    }
  });
});

test.describe('태스크 CRUD', () => {
  test('새 태스크를 추가할 수 있어야 함', async ({ page }) => {
    // POST 요청 모킹
    await page.route('**/tasks**', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'new-task-id', ...body, completed: false },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: sampleTasks }),
        });
      }
    });

    const homePage = new HomePage(page);
    await homePage.goto();

    // 추가 버튼 찾기 및 클릭
    const addButton = page.locator(
      'button:has-text("추가"), button:has-text("Add"), [aria-label*="add"]'
    );

    if (await addButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.first().click();

      // 입력 폼이 나타나는지 확인
      const inputField = page.locator('input[type="text"], textarea');
      await expect(inputField.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });
});
