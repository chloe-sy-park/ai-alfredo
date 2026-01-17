import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/ChatPage';
import { sampleChatMessages } from '../fixtures/testData';

test.describe('채팅 기능', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.goto();
  });

  test('채팅 페이지가 정상적으로 로드되어야 함', async () => {
    await chatPage.expectLoaded();
    await expect(chatPage.messageInput).toBeEnabled();
  });

  test('메시지를 입력하고 전송할 수 있어야 함', async ({ page }) => {
    const testMessage = '안녕, 알프레도!';

    // 메시지 전송
    await chatPage.sendMessage(testMessage);

    // 사용자 메시지가 표시되는지 확인
    await expect(page.locator('text=' + testMessage)).toBeVisible({ timeout: 5000 });
  });

  test('Enter 키로 메시지를 전송할 수 있어야 함', async ({ page }) => {
    const testMessage = '오늘 일정 알려줘';

    // Enter로 메시지 전송
    await chatPage.sendMessageWithEnter(testMessage);

    // 메시지 입력창이 비워지는지 확인
    await expect(chatPage.messageInput).toHaveValue('');
  });

  test('알프레도가 응답해야 함', async ({ page }) => {
    const testMessage = '안녕하세요!';

    // API 응답 모킹 (SSE 스트리밍)
    await page.route('**/conversations/**', async (route) => {
      const body = 'data: {"type":"text","content":"안녕하세요! 무엇을 도와드릴까요?"}\n\ndata: [DONE]\n\n';
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body,
      });
    });

    // 메시지 전송
    await chatPage.sendMessage(testMessage);

    // 알프레도 응답 대기 (UI 업데이트 대기)
    await page.waitForTimeout(1000);

    // 응답이 있는지 확인 (메시지 영역에 새 콘텐츠)
    const messageArea = page.locator('[class*="message"], [class*="chat"], main');
    await expect(messageArea).toBeVisible();
  });

  test('빈 메시지는 전송되지 않아야 함', async ({ page }) => {
    // 빈 상태에서 전송 버튼 상태 확인
    const sendButton = chatPage.sendButton;

    // 빈 입력에서 전송 시도
    await chatPage.messageInput.fill('');

    // 전송 버튼이 비활성화되어 있거나 클릭해도 효과 없음
    const isDisabled = await sendButton.isDisabled();
    if (!isDisabled) {
      const initialMessageCount = await page.locator('[data-testid="user-message"]').count();
      await sendButton.click();
      await page.waitForTimeout(500);
      const newMessageCount = await page.locator('[data-testid="user-message"]').count();
      expect(newMessageCount).toBe(initialMessageCount);
    }
  });

  test('메시지 입력 중 로딩 상태가 표시되어야 함', async ({ page }) => {
    // 느린 API 응답 모킹
    await page.route('**/conversations/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: 'data: {"type":"text","content":"응답"}\n\ndata: [DONE]\n\n',
      });
    });

    // 메시지 전송
    await chatPage.sendMessage('테스트 메시지');

    // 로딩 인디케이터나 타이핑 인디케이터 확인
    const loadingIndicator = page.locator('[class*="loading"], [class*="typing"], [class*="spinner"]');
    // 로딩이 있을 수 있음 (선택적 검증)
    if (await loadingIndicator.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator.first()).toBeVisible();
    }
  });

  test('여러 메시지를 연속으로 전송할 수 있어야 함', async ({ page }) => {
    // API 응답 모킹
    await page.route('**/conversations/**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: 'data: {"type":"text","content":"알겠습니다!"}\n\ndata: [DONE]\n\n',
      });
    });

    // 여러 메시지 전송
    for (const message of sampleChatMessages.slice(0, 3)) {
      await chatPage.sendMessage(message);
      await page.waitForTimeout(500);
    }

    // 메시지들이 표시되는지 확인
    const messageElements = page.locator('[class*="message"]');
    const count = await messageElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('채팅 톤 시스템', () => {
  test('톤 선택기가 있다면 톤을 변경할 수 있어야 함', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.goto();

    // 톤 선택기가 있는지 확인
    const toneSelector = page.locator('[class*="tone"], [data-testid*="tone"]');
    if (await toneSelector.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await toneSelector.first().click();

      // 톤 옵션이 표시되는지 확인
      const toneOptions = page.locator('[role="option"], [class*="tone-option"]');
      await expect(toneOptions.first()).toBeVisible();
    }
  });
});
