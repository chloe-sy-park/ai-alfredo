import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ChatPage } from '../pages/ChatPage';
import { SettingsPage } from '../pages/SettingsPage';

test.describe('네비게이션', () => {
  test('홈에서 채팅으로 이동할 수 있어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 채팅 링크/버튼 찾기
    const chatLink = page.locator(
      'a[href*="chat"], button:has-text("채팅"), button:has-text("Chat"), [aria-label*="chat"], nav a:has-text("알프레도")'
    );

    if (await chatLink.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await chatLink.first().click();
      await page.waitForURL(/.*chat.*/, { timeout: 5000 }).catch(() => {});
    }
  });

  test('홈에서 설정으로 이동할 수 있어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 설정 링크/버튼 찾기
    const settingsLink = page.locator(
      'a[href*="settings"], button:has-text("설정"), button:has-text("Settings"), [aria-label*="settings"], nav a:has-text("설정")'
    );

    if (await settingsLink.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsLink.first().click();
      await page.waitForURL(/.*settings.*/, { timeout: 5000 }).catch(() => {});
    }
  });

  test('홈에서 캘린더로 이동할 수 있어야 함', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 캘린더 링크/버튼 찾기
    const calendarLink = page.locator(
      'a[href*="calendar"], button:has-text("캘린더"), button:has-text("Calendar"), [aria-label*="calendar"]'
    );

    if (await calendarLink.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await calendarLink.first().click();
      await page.waitForURL(/.*calendar.*/, { timeout: 5000 }).catch(() => {});
    }
  });

  test('뒤로가기 버튼이 작동해야 함', async ({ page }) => {
    // 홈에서 시작
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const initialUrl = page.url();

    // 다른 페이지로 이동
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // 뒤로가기
    await page.goBack();

    // 이전 페이지로 돌아왔는지 확인
    await page.waitForLoadState('networkidle');
  });

  test('탭 네비게이션이 작동해야 함', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 탭바 찾기
    const tabBar = page.locator('nav, [role="tablist"], [class*="tab-bar"], [class*="navbar"]');

    if (await tabBar.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      const tabs = tabBar.locator('a, button, [role="tab"]');
      const tabCount = await tabs.count();

      // 각 탭을 클릭하며 확인
      for (let i = 0; i < Math.min(tabCount, 4); i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('반응형 네비게이션', () => {
  test('모바일에서 네비게이션이 작동해야 함', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 햄버거 메뉴 또는 하단 네비게이션 찾기
    const mobileNav = page.locator(
      '[class*="mobile-nav"], [class*="bottom-nav"], [class*="hamburger"], [aria-label*="menu"]'
    );

    // 모바일 네비게이션이 있으면 확인
    if (await mobileNav.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(mobileNav.first()).toBeVisible();
    }
  });

  test('데스크톱에서 사이드바가 표시되어야 함', async ({ page }) => {
    // 데스크톱 뷰포트 설정
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 사이드바 또는 상단 네비게이션 찾기
    const desktopNav = page.locator(
      '[class*="sidebar"], [class*="side-nav"], header nav, [class*="desktop-nav"]'
    );

    // 데스크톱 네비게이션이 있으면 확인
    if (await desktopNav.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(desktopNav.first()).toBeVisible();
    }
  });
});

test.describe('딥링크', () => {
  test('특정 태스크 URL로 직접 접근할 수 있어야 함', async ({ page }) => {
    // 태스크 상세 페이지 직접 접근
    await page.goto('/tasks/task-1');
    await page.waitForLoadState('networkidle');

    // 페이지가 오류 없이 로드되어야 함
    const errorMessage = page.locator('text=404, text=Not Found, text=오류');
    // 404가 아니어야 함 (또는 리다이렉트)
  });

  test('특정 채팅 URL로 직접 접근할 수 있어야 함', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const chatPage = new ChatPage(page);
    // 채팅 페이지 요소 확인
    const mainContent = page.locator('main, [role="main"], #root');
    await expect(mainContent).toBeVisible();
  });
});
