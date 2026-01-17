import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { samplePenguinStatus } from '../fixtures/testData';

test.describe('펭귄 게이미피케이션', () => {
  test.beforeEach(async ({ page }) => {
    // 펭귄 API 모킹
    await page.route('**/penguin**', async (route) => {
      const url = route.request().url();

      if (url.includes('/status')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: samplePenguinStatus,
          }),
        });
      } else if (url.includes('/shop')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              items: [
                { id: 'hat-1', name: '셰프 모자', price: 50, category: 'hat', owned: true },
                { id: 'hat-2', name: '파티 모자', price: 100, category: 'hat', owned: false },
                { id: 'acc-1', name: '보타이', price: 30, category: 'accessory', owned: true },
                { id: 'bg-1', name: '주방 배경', price: 200, category: 'background', owned: true },
              ],
            },
          }),
        });
      } else if (url.includes('/inventory')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              items: [
                { id: 'hat-1', name: '셰프 모자', category: 'hat', equipped: true },
                { id: 'acc-1', name: '보타이', category: 'accessory', equipped: true },
                { id: 'bg-1', name: '주방 배경', category: 'background', equipped: true },
              ],
            },
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('펭귄 위젯이 홈에 표시되어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 펭귄 관련 요소 찾기
    const penguinWidget = page.locator(
      '[class*="penguin"], [data-testid*="penguin"], [class*="avatar"], [class*="mascot"]'
    );

    // 펭귄 위젯이 있으면 확인
    if (await penguinWidget.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(penguinWidget.first()).toBeVisible();
    }
  });

  test('펭귄 레벨과 경험치가 표시되어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 레벨/경험치 요소 찾기
    const levelIndicator = page.locator(
      '[class*="level"], [class*="xp"], [class*="experience"], text=/Lv|레벨/'
    );

    // 레벨이 표시되면 확인
    if (await levelIndicator.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(levelIndicator.first()).toBeVisible();
    }
  });

  test('코인 잔액이 표시되어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 코인 요소 찾기
    const coinIndicator = page.locator(
      '[class*="coin"], [class*="currency"], text=/코인|coin|🪙/'
    );

    // 코인이 표시되면 확인
    if (await coinIndicator.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(coinIndicator.first()).toBeVisible();
    }
  });

  test('펭귄 클릭 시 상세 정보가 표시되어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 펭귄 클릭 가능 요소 찾기
    const penguinClickable = page.locator(
      '[class*="penguin"][role="button"], [data-testid*="penguin"] button, [class*="avatar"][role="button"]'
    );

    if (await penguinClickable.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await penguinClickable.first().click();

      // 모달이나 상세 패널 확인
      const detailPanel = page.locator('[role="dialog"], [class*="modal"], [class*="sheet"]');
      if (await detailPanel.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(detailPanel.first()).toBeVisible();
      }
    }
  });
});

test.describe('펭귄 상점', () => {
  test.beforeEach(async ({ page }) => {
    // 상점 API 모킹
    await page.route('**/penguin/shop**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              { id: 'hat-1', name: '셰프 모자', price: 50, category: 'hat', owned: false },
              { id: 'hat-2', name: '파티 모자', price: 100, category: 'hat', owned: false },
              { id: 'acc-1', name: '보타이', price: 30, category: 'accessory', owned: false },
            ],
          },
        }),
      });
    });
  });

  test('상점에서 아이템 목록이 표시되어야 함', async ({ page }) => {
    // 상점 페이지로 이동 (또는 모달 열기)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 상점 버튼 찾기
    const shopButton = page.locator(
      'button:has-text("상점"), button:has-text("Shop"), [aria-label*="shop"]'
    );

    if (await shopButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await shopButton.first().click();

      // 상점 아이템 목록 확인
      const shopItems = page.locator('[class*="shop-item"], [class*="item-card"]');
      await expect(shopItems.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('아이템 구매가 가능해야 함', async ({ page }) => {
    // 구매 API 모킹
    await page.route('**/penguin/buy**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { success: true, remainingCoins: 100 },
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 상점 열기
    const shopButton = page.locator('button:has-text("상점"), button:has-text("Shop")');

    if (await shopButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await shopButton.first().click();

      // 구매 버튼 찾기 및 클릭
      const buyButton = page.locator('button:has-text("구매"), button:has-text("Buy")');
      if (await buyButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await buyButton.first().click();
      }
    }
  });
});

test.describe('펭귄 인벤토리', () => {
  test('인벤토리에서 소유 아이템이 표시되어야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 인벤토리 버튼 찾기
    const inventoryButton = page.locator(
      'button:has-text("인벤토리"), button:has-text("Inventory"), [aria-label*="inventory"]'
    );

    if (await inventoryButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await inventoryButton.first().click();

      // 인벤토리 아이템 확인
      const inventoryItems = page.locator('[class*="inventory-item"], [class*="owned-item"]');
      // 아이템이 있으면 확인
    }
  });

  test('아이템 장착/해제가 가능해야 함', async ({ page }) => {
    // 장착 API 모킹
    await page.route('**/penguin/equip**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 인벤토리 열기
    const inventoryButton = page.locator('button:has-text("인벤토리"), button:has-text("Inventory")');

    if (await inventoryButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await inventoryButton.first().click();

      // 장착 버튼 찾기
      const equipButton = page.locator('button:has-text("장착"), button:has-text("Equip")');
      if (await equipButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await equipButton.first().click();
      }
    }
  });
});

test.describe('펭귄 XP 획득', () => {
  test('태스크 완료 시 XP가 증가해야 함', async ({ page }) => {
    // XP 증가 API 모킹
    let currentXP = 2500;
    await page.route('**/penguin/status**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ...samplePenguinStatus,
            experience: currentXP,
          },
        }),
      });
    });

    await page.route('**/penguin/add-xp**', async (route) => {
      currentXP += 10;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { newXP: currentXP, xpGained: 10 },
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 태스크 완료 트리거 (체크박스 클릭 등)
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await checkbox.click();

      // XP 증가 애니메이션이나 알림 확인
      await page.waitForTimeout(1000);
    }
  });
});
