import { Page, Locator, expect } from '@playwright/test';

/**
 * 홈 페이지 Page Object
 */
export class HomePage {
  readonly page: Page;

  // 네비게이션
  readonly chatTab: Locator;
  readonly calendarTab: Locator;
  readonly settingsTab: Locator;
  readonly workModeTab: Locator;
  readonly lifeModeTab: Locator;

  // 브리핑 섹션
  readonly briefingCard: Locator;
  readonly briefingTitle: Locator;
  readonly briefingContent: Locator;

  // 태스크 섹션
  readonly topTasksSection: Locator;
  readonly taskCards: Locator;
  readonly addTaskButton: Locator;

  // 펭귄 위젯
  readonly penguinWidget: Locator;
  readonly penguinLevel: Locator;
  readonly penguinCoins: Locator;

  // 넛지
  readonly nudgeToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // 네비게이션
    this.chatTab = page.getByRole('link', { name: /chat|채팅|알프레도/i });
    this.calendarTab = page.getByRole('link', { name: /calendar|캘린더|일정/i });
    this.settingsTab = page.getByRole('link', { name: /settings|설정/i });
    this.workModeTab = page.locator('[data-testid="work-mode-tab"]');
    this.lifeModeTab = page.locator('[data-testid="life-mode-tab"]');

    // 브리핑
    this.briefingCard = page.locator('[data-testid="briefing-card"]');
    this.briefingTitle = page.locator('[data-testid="briefing-title"]');
    this.briefingContent = page.locator('[data-testid="briefing-content"]');

    // 태스크
    this.topTasksSection = page.locator('[data-testid="top-tasks"]');
    this.taskCards = page.locator('[data-testid="task-card"]');
    this.addTaskButton = page.getByRole('button', { name: /add|추가|새 태스크/i });

    // 펭귄
    this.penguinWidget = page.locator('[data-testid="penguin-widget"]');
    this.penguinLevel = page.locator('[data-testid="penguin-level"]');
    this.penguinCoins = page.locator('[data-testid="penguin-coins"]');

    // 넛지
    this.nudgeToast = page.locator('[data-testid="nudge-toast"]');
  }

  /**
   * 홈 페이지로 이동
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async expectLoaded() {
    // 메인 콘텐츠 영역이 보이는지 확인
    await expect(this.page.locator('main, [role="main"], #root')).toBeVisible();
  }

  /**
   * 채팅 페이지로 이동
   */
  async navigateToChat() {
    await this.chatTab.click();
    await this.page.waitForURL(/.*chat.*/);
  }

  /**
   * 캘린더 페이지로 이동
   */
  async navigateToCalendar() {
    await this.calendarTab.click();
    await this.page.waitForURL(/.*calendar.*/);
  }

  /**
   * 설정 페이지로 이동
   */
  async navigateToSettings() {
    await this.settingsTab.click();
    await this.page.waitForURL(/.*settings.*/);
  }

  /**
   * Work 모드로 전환
   */
  async switchToWorkMode() {
    await this.workModeTab.click();
  }

  /**
   * Life 모드로 전환
   */
  async switchToLifeMode() {
    await this.lifeModeTab.click();
  }

  /**
   * 브리핑 카드가 표시되는지 확인
   */
  async expectBriefingVisible() {
    await expect(this.briefingCard).toBeVisible();
  }

  /**
   * Top 태스크가 표시되는지 확인
   */
  async expectTopTasksVisible() {
    await expect(this.topTasksSection).toBeVisible();
  }

  /**
   * 태스크 수 확인
   */
  async getTaskCount(): Promise<number> {
    return await this.taskCards.count();
  }

  /**
   * 첫 번째 태스크 완료 처리
   */
  async completeFirstTask() {
    const firstTask = this.taskCards.first();
    const checkbox = firstTask.getByRole('checkbox');
    await checkbox.check();
  }

  /**
   * 넛지 토스트가 표시되는지 확인
   */
  async expectNudgeVisible() {
    await expect(this.nudgeToast).toBeVisible({ timeout: 10000 });
  }

  /**
   * 펭귄 위젯 레벨 가져오기
   */
  async getPenguinLevel(): Promise<string> {
    return await this.penguinLevel.textContent() || '0';
  }
}
