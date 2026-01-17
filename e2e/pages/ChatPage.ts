import { Page, Locator, expect } from '@playwright/test';

/**
 * 채팅 페이지 Page Object
 */
export class ChatPage {
  readonly page: Page;

  // 메시지 입력
  readonly messageInput: Locator;
  readonly sendButton: Locator;

  // 메시지 목록
  readonly messageList: Locator;
  readonly userMessages: Locator;
  readonly alfredoMessages: Locator;
  readonly loadingIndicator: Locator;

  // 톤 선택
  readonly toneSelector: Locator;
  readonly butlerTone: Locator;
  readonly friendTone: Locator;
  readonly coachTone: Locator;

  // 헤더
  readonly backButton: Locator;
  readonly pageTitle: Locator;

  // 빠른 액션
  readonly quickActions: Locator;
  readonly voiceInputButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // 메시지 입력
    this.messageInput = page.getByPlaceholder(/메시지|message|알프레도에게/i);
    this.sendButton = page.getByRole('button', { name: /send|전송|보내기/i });

    // 메시지 목록
    this.messageList = page.locator('[data-testid="message-list"]');
    this.userMessages = page.locator('[data-testid="user-message"]');
    this.alfredoMessages = page.locator('[data-testid="alfredo-message"]');
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]');

    // 톤 선택
    this.toneSelector = page.locator('[data-testid="tone-selector"]');
    this.butlerTone = page.locator('[data-testid="tone-butler"]');
    this.friendTone = page.locator('[data-testid="tone-friend"]');
    this.coachTone = page.locator('[data-testid="tone-coach"]');

    // 헤더
    this.backButton = page.getByRole('button', { name: /back|뒤로/i });
    this.pageTitle = page.locator('[data-testid="chat-title"]');

    // 빠른 액션
    this.quickActions = page.locator('[data-testid="quick-actions"]');
    this.voiceInputButton = page.getByRole('button', { name: /voice|음성/i });
  }

  /**
   * 채팅 페이지로 이동
   */
  async goto() {
    await this.page.goto('/chat');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async expectLoaded() {
    await expect(this.messageInput).toBeVisible();
  }

  /**
   * 메시지 전송
   */
  async sendMessage(message: string) {
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }

  /**
   * 메시지 입력 후 Enter로 전송
   */
  async sendMessageWithEnter(message: string) {
    await this.messageInput.fill(message);
    await this.messageInput.press('Enter');
  }

  /**
   * 알프레도 응답 대기
   */
  async waitForAlfredoResponse(timeout = 30000) {
    // 로딩 인디케이터가 사라질 때까지 대기
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });

    // 새 알프레도 메시지가 나타날 때까지 대기
    const initialCount = await this.alfredoMessages.count();
    await expect(async () => {
      const currentCount = await this.alfredoMessages.count();
      expect(currentCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout });
  }

  /**
   * 마지막 알프레도 메시지 가져오기
   */
  async getLastAlfredoMessage(): Promise<string> {
    const lastMessage = this.alfredoMessages.last();
    return await lastMessage.textContent() || '';
  }

  /**
   * 마지막 사용자 메시지 가져오기
   */
  async getLastUserMessage(): Promise<string> {
    const lastMessage = this.userMessages.last();
    return await lastMessage.textContent() || '';
  }

  /**
   * 메시지 수 가져오기
   */
  async getMessageCount(): Promise<{ user: number; alfredo: number }> {
    return {
      user: await this.userMessages.count(),
      alfredo: await this.alfredoMessages.count(),
    };
  }

  /**
   * 톤 변경
   */
  async selectTone(tone: 'butler' | 'friend' | 'coach') {
    await this.toneSelector.click();
    switch (tone) {
      case 'butler':
        await this.butlerTone.click();
        break;
      case 'friend':
        await this.friendTone.click();
        break;
      case 'coach':
        await this.coachTone.click();
        break;
    }
  }

  /**
   * 메시지가 전송되었는지 확인
   */
  async expectMessageSent(message: string) {
    await expect(this.userMessages.filter({ hasText: message })).toBeVisible();
  }

  /**
   * 알프레도가 응답했는지 확인
   */
  async expectAlfredoResponded() {
    await expect(this.alfredoMessages.last()).toBeVisible();
  }

  /**
   * 채팅 기록 지우기 (있다면)
   */
  async clearChatHistory() {
    const clearButton = this.page.getByRole('button', { name: /clear|지우기|초기화/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      // 확인 다이얼로그가 있다면 처리
      const confirmButton = this.page.getByRole('button', { name: /confirm|확인/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }
  }
}
