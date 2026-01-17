import { Page, Locator, expect } from '@playwright/test';

/**
 * 설정 페이지 Page Object
 */
export class SettingsPage {
  readonly page: Page;

  // 섹션
  readonly profileSection: Locator;
  readonly notificationSection: Locator;
  readonly integrationSection: Locator;
  readonly privacySection: Locator;

  // 프로필
  readonly profileName: Locator;
  readonly profileEmail: Locator;
  readonly editProfileButton: Locator;

  // 알림 설정
  readonly pushNotificationToggle: Locator;
  readonly emailNotificationToggle: Locator;
  readonly quietHoursToggle: Locator;
  readonly quietHoursStart: Locator;
  readonly quietHoursEnd: Locator;

  // 톤 설정
  readonly tonePresetSelector: Locator;

  // 연동
  readonly googleCalendarConnect: Locator;
  readonly outlookConnect: Locator;
  readonly googleCalendarStatus: Locator;

  // 데이터
  readonly exportDataButton: Locator;
  readonly deleteAccountButton: Locator;
  readonly logoutButton: Locator;

  // 다크 모드
  readonly darkModeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // 섹션
    this.profileSection = page.locator('[data-testid="profile-section"]');
    this.notificationSection = page.locator('[data-testid="notification-section"]');
    this.integrationSection = page.locator('[data-testid="integration-section"]');
    this.privacySection = page.locator('[data-testid="privacy-section"]');

    // 프로필
    this.profileName = page.locator('[data-testid="profile-name"]');
    this.profileEmail = page.locator('[data-testid="profile-email"]');
    this.editProfileButton = page.getByRole('button', { name: /edit|수정/i });

    // 알림
    this.pushNotificationToggle = page.locator('[data-testid="push-notification-toggle"]');
    this.emailNotificationToggle = page.locator('[data-testid="email-notification-toggle"]');
    this.quietHoursToggle = page.locator('[data-testid="quiet-hours-toggle"]');
    this.quietHoursStart = page.locator('[data-testid="quiet-hours-start"]');
    this.quietHoursEnd = page.locator('[data-testid="quiet-hours-end"]');

    // 톤
    this.tonePresetSelector = page.locator('[data-testid="tone-preset-selector"]');

    // 연동
    this.googleCalendarConnect = page.getByRole('button', { name: /google.*connect|구글.*연동/i });
    this.outlookConnect = page.getByRole('button', { name: /outlook.*connect|아웃룩.*연동/i });
    this.googleCalendarStatus = page.locator('[data-testid="google-calendar-status"]');

    // 데이터
    this.exportDataButton = page.getByRole('button', { name: /export|내보내기/i });
    this.deleteAccountButton = page.getByRole('button', { name: /delete.*account|계정.*삭제/i });
    this.logoutButton = page.getByRole('button', { name: /logout|로그아웃/i });

    // 다크 모드
    this.darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
  }

  /**
   * 설정 페이지로 이동
   */
  async goto() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 페이지가 로드되었는지 확인
   */
  async expectLoaded() {
    await expect(this.page.getByText(/설정|settings/i)).toBeVisible();
  }

  /**
   * 푸시 알림 토글
   */
  async togglePushNotification() {
    await this.pushNotificationToggle.click();
  }

  /**
   * 푸시 알림 상태 확인
   */
  async isPushNotificationEnabled(): Promise<boolean> {
    return await this.pushNotificationToggle.isChecked();
  }

  /**
   * 조용한 시간 설정
   */
  async setQuietHours(start: string, end: string) {
    // 토글이 꺼져있으면 켜기
    const isEnabled = await this.quietHoursToggle.isChecked();
    if (!isEnabled) {
      await this.quietHoursToggle.click();
    }

    await this.quietHoursStart.fill(start);
    await this.quietHoursEnd.fill(end);
  }

  /**
   * 톤 프리셋 선택
   */
  async selectTonePreset(preset: 'butler' | 'friend' | 'coach') {
    await this.tonePresetSelector.click();
    await this.page.getByRole('option', { name: new RegExp(preset, 'i') }).click();
  }

  /**
   * 다크 모드 토글
   */
  async toggleDarkMode() {
    await this.darkModeToggle.click();
  }

  /**
   * 다크 모드 상태 확인
   */
  async isDarkModeEnabled(): Promise<boolean> {
    return await this.darkModeToggle.isChecked();
  }

  /**
   * 로그아웃
   */
  async logout() {
    await this.logoutButton.click();
    // 확인 다이얼로그가 있다면 처리
    const confirmButton = this.page.getByRole('button', { name: /confirm|확인|예/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    await this.page.waitForURL(/.*login.*/);
  }

  /**
   * 데이터 내보내기
   */
  async exportData() {
    // 다운로드 이벤트 대기
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportDataButton.click();
    return await downloadPromise;
  }

  /**
   * Google 캘린더 연결 상태 확인
   */
  async isGoogleCalendarConnected(): Promise<boolean> {
    const status = await this.googleCalendarStatus.textContent();
    return status?.includes('연결됨') || status?.includes('connected') || false;
  }
}
