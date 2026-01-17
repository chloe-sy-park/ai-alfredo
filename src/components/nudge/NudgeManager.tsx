/**
 * NudgeManager - 넛지 시스템 관리자
 * 조용한 시간 설정과 넛지 스케줄러 연동
 */

import React, { useEffect, useCallback } from 'react';
import { useNudgeStore } from '../../stores/nudgeStore';
import { useNotificationSettingsStore } from '../../stores/notificationSettingsStore';
import { useUserPreferencesStore } from '../../stores/userPreferencesStore';
import { useBodyDoublingStore } from '../../stores/bodyDoublingStore';
import { useHomeModeStore } from '../../stores/homeModeStore';
import { isQuietHours } from '../../services/nudge';
import type { TriggerContext } from '../../services/nudge';

export const NudgeManager: React.FC = () => {
  const { checkNudges, showNudge, updateSettings } = useNudgeStore();
  const notificationSettings = useNotificationSettingsStore();
  const { interventionLevel } = useUserPreferencesStore();
  const { isActive, getElapsedTime, currentSession } = useBodyDoublingStore();
  const { isWorkMode } = useHomeModeStore();

  // 조용한 시간 설정 동기화
  useEffect(() => {
    updateSettings({
      quietStart: notificationSettings.quietHoursStart,
      quietEnd: notificationSettings.quietHoursEnd,
    });
  }, [notificationSettings.quietHoursStart, notificationSettings.quietHoursEnd, updateSettings]);

  // 컨텍스트 생성 함수
  const createContext = useCallback((): TriggerContext => {
    const now = new Date();

    return {
      currentTime: now,
      tasks: [],
      events: [],
      user: {
        userId: 'current-user',
        tonePreset: 'butler',
        focusStartTime: isActive && currentSession ? currentSession.startTime : undefined,
        lastActivityTime: now,
        isWorking: isWorkMode(),
      },
    };
  }, [isActive, currentSession, isWorkMode]);

  // 조용한 시간 체크
  const isInQuietHours = useCallback((): boolean => {
    if (!notificationSettings.quietHoursEnabled) {
      return false;
    }

    return isQuietHours(new Date(), {
      quietStart: notificationSettings.quietHoursStart,
      quietEnd: notificationSettings.quietHoursEnd,
    });
  }, [notificationSettings.quietHoursEnabled, notificationSettings.quietHoursStart, notificationSettings.quietHoursEnd]);

  // 주기적 넛지 체크
  useEffect(() => {
    // 알프레도 넛지가 비활성화되면 체크하지 않음
    if (!notificationSettings.enabled || !notificationSettings.alfredoNudges) {
      return;
    }

    // 개입 수준에 따라 체크 간격 조정 (1분 ~ 5분)
    const checkInterval = interventionLevel > 50 ? 60000 : 300000;

    const interval = setInterval(() => {
      // 조용한 시간이면 건너뛰기
      if (isInQuietHours()) {
        return;
      }

      // 개입 수준에 따른 확률적 체크
      if (Math.random() > interventionLevel / 100) {
        return;
      }

      const context = createContext();
      checkNudges(context);
    }, checkInterval);

    // 초기 체크 (5초 후)
    const initialCheck = setTimeout(() => {
      if (!isInQuietHours() && Math.random() < interventionLevel / 100) {
        const context = createContext();
        checkNudges(context);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialCheck);
    };
  }, [
    notificationSettings.enabled,
    notificationSettings.alfredoNudges,
    interventionLevel,
    isInQuietHours,
    createContext,
    checkNudges,
  ]);

  // 포모도로 기반 휴식 제안
  useEffect(() => {
    if (!isActive || !notificationSettings.breakReminders) {
      return;
    }

    // 조용한 시간에는 표시하지 않음
    if (isInQuietHours()) {
      return;
    }

    const focusTime = getElapsedTime();

    // 25분 집중 후 휴식 제안
    if (focusTime === 25 * 60) {
      showNudge({
        id: `focus_${Date.now()}`,
        type: 'rest_suggest',
        title: '포모도로 완료!',
        body: '25분 집중 완료! 5분 휴식하고 다시 시작해요.',
        emoji: '🎯',
        priority: 'high',
        actions: [{ id: 'break', label: '휴식하기' }],
        createdAt: new Date().toISOString(),
        dismissible: true,
        autoHide: 10000,
      });
    }

    // 50분 집중 후 긴 휴식 제안
    if (focusTime === 50 * 60) {
      showNudge({
        id: `focus_long_${Date.now()}`,
        type: 'rest_suggest',
        title: '대단해요!',
        body: '50분이나 집중하셨네요. 10분 정도 길게 쉬어요.',
        emoji: '💪',
        priority: 'high',
        createdAt: new Date().toISOString(),
        dismissible: true,
        autoHide: 15000,
      });
    }
  }, [isActive, getElapsedTime, showNudge, notificationSettings.breakReminders, isInQuietHours]);

  // 업무/퇴근 모드 전환 시 넛지
  useEffect(() => {
    const workMode = isWorkMode();
    const hour = new Date().getHours();

    // 저녁 시간에 업무 모드면 퇴근 권유
    if (workMode && hour >= 19 && !isInQuietHours()) {
      const context = createContext();
      // late_warning 트리거는 자동으로 checkNudges에서 체크됨
      checkNudges(context);
    }
  }, [isWorkMode, isInQuietHours, createContext, checkNudges]);

  return null;
};

export default NudgeManager;
