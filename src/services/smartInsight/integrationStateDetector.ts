/**
 * Integration State Detector
 *
 * 현재 연동 상태를 감지하여 IntegrationState 반환
 * - NONE: 연동 0개
 * - CALENDAR_ONLY: 캘린더 1개 연동
 * - CALENDAR_PLUS: 캘린더 + Notion (향후)
 */

import { isCalendarConnected } from '../calendar';
import { IntegrationState } from './types';

/**
 * 현재 연동 상태 감지
 *
 * @returns IntegrationState
 */
export function detectIntegrationState(): IntegrationState {
  const hasCalendar = isCalendarConnected();

  // TODO: Notion 연동 확인 (향후 구현)
  // const hasNotion = isNotionConnected();
  const hasNotion = false;

  if (!hasCalendar) {
    return 'NONE';
  }

  if (hasCalendar && hasNotion) {
    return 'CALENDAR_PLUS';
  }

  return 'CALENDAR_ONLY';
}

/**
 * 캘린더 연동 여부만 확인
 */
export function hasCalendarIntegration(): boolean {
  return isCalendarConnected();
}

/**
 * Notion 연동 여부 확인 (향후 구현)
 */
export function hasNotionIntegration(): boolean {
  // TODO: 실제 Notion 연동 확인 로직
  return false;
}

/**
 * 연동 상태 설명 텍스트 반환
 */
export function getIntegrationStateDescription(state: IntegrationState): string {
  switch (state) {
    case 'NONE':
      return '아직 연동된 서비스가 없어요';
    case 'CALENDAR_ONLY':
      return '캘린더가 연동되어 있어요';
    case 'CALENDAR_PLUS':
      return '캘린더와 Notion이 연동되어 있어요';
    default:
      return '';
  }
}

/**
 * 연동 상태에 따른 CTA 레이블 반환
 */
export function getIntegrationCTALabel(state: IntegrationState): string {
  switch (state) {
    case 'NONE':
      return '캘린더 연동하면 더 정확해져요';
    case 'CALENDAR_ONLY':
      return 'Notion 연동하면 더 많이 알 수 있어요';
    case 'CALENDAR_PLUS':
      return '';
    default:
      return '';
  }
}
