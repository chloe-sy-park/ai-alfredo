// Live Briefing Store
// 지금 이 순간의 상태를 판단하고 브리핑을 관리

import { create } from 'zustand';
import {
  LiveBriefingStatus,
  LiveBriefingData,
  UpdateTriggerType,
  UserActionTrigger,
  STATUS_SENTENCE_TEMPLATES,
  TIME_TRIGGER_CONFIG,
  SITUATION_THRESHOLDS,
} from '../constants/liveBriefing';
import { getTodayEvents, CalendarEvent } from '../services/calendar/calendarService';

interface UserActivityState {
  lastInputTime: Date | null;
  skipCount: number;
  delayCount: number;
  focusSessionActive: boolean;
  recentActions: UserActionTrigger[];
}

interface LiveBriefingStore {
  // 현재 브리핑 데이터
  briefing: LiveBriefingData;

  // 활동 상태
  activity: UserActivityState;

  // 캘린더 이벤트 캐시
  todayEvents: CalendarEvent[];

  // 갱신 타이머 ID
  updateTimerId: NodeJS.Timeout | null;

  // 액션
  updateBriefing: (trigger: UpdateTriggerType, action?: UserActionTrigger) => void;
  determineStatus: () => LiveBriefingStatus;
  generateSentence: (status: LiveBriefingStatus) => string;
  recordAction: (action: UserActionTrigger) => void;
  incrementSkip: () => void;
  incrementDelay: () => void;
  setFocusSession: (active: boolean) => void;
  refreshEvents: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  getTimeSinceUpdate: () => string;
}

// 초기 브리핑 상태
var initialBriefing: LiveBriefingData = {
  sentence: '함께 하루를 시작해볼까요?',
  status: 'observing',
  updatedAt: new Date(),
  triggerType: 'time_elapsed',
};

// 초기 활동 상태
var initialActivity: UserActivityState = {
  lastInputTime: null,
  skipCount: 0,
  delayCount: 0,
  focusSessionActive: false,
  recentActions: [],
};

export var useLiveBriefingStore = create<LiveBriefingStore>(function(set, get) {
  return {
    briefing: initialBriefing,
    activity: initialActivity,
    todayEvents: [],
    updateTimerId: null,

    // 브리핑 갱신
    updateBriefing: function(trigger: UpdateTriggerType, action?: UserActionTrigger) {
      var store = get();

      // 액션 기록
      if (action) {
        store.recordAction(action);
      }

      // 상태 판단
      var status = store.determineStatus();

      // 문장 생성
      var sentence = store.generateSentence(status);

      // 브리핑 업데이트
      set({
        briefing: {
          sentence: sentence,
          status: status,
          updatedAt: new Date(),
          triggerType: trigger,
        },
      });
    },

    // 상태 판단 로직
    determineStatus: function(): LiveBriefingStatus {
      var store = get();
      var activity = store.activity;
      var events = store.todayEvents;
      var now = new Date();
      var currentHour = now.getHours();

      // 1. 집중 세션 활성화 중이면 'focused'
      if (activity.focusSessionActive) {
        return 'focused';
      }

      // 2. 정보 부족 상태 체크 (첫 사용 또는 입력 없음)
      if (!activity.lastInputTime) {
        return 'observing';
      }

      // 3. 장시간 입력 없음 체크
      var minutesSinceInput = (now.getTime() - activity.lastInputTime.getTime()) / (1000 * 60);
      if (minutesSinceInput > SITUATION_THRESHOLDS.inactivityMinutes) {
        return 'observing';
      }

      // 4. Skip/지연 반복 체크 → 과부하 근접
      if (activity.skipCount >= SITUATION_THRESHOLDS.skipThreshold ||
          activity.delayCount >= SITUATION_THRESHOLDS.skipThreshold) {
        return 'nearOverload';
      }

      // 5. 일정 밀집도 체크
      var upcomingEvents = events.filter(function(event) {
        var eventStart = new Date(event.start);
        var hoursUntil = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntil >= 0 && hoursUntil <= 4;
      });

      var eventDensity = upcomingEvents.length / 4; // 4시간 내 일정 밀도

      if (eventDensity >= SITUATION_THRESHOLDS.denseMeetings) {
        // 많은 일정이 몰려있음
        if (activity.skipCount > 0 || activity.delayCount > 0) {
          return 'nearOverload';
        }
        return 'needsAdjust';
      }

      // 6. 시간대별 회복 권장 체크
      var config = TIME_TRIGGER_CONFIG;
      var isLateNight = currentHour >= config.nightStart || currentHour < config.morningStart;
      var hadHighDensity = upcomingEvents.length > SITUATION_THRESHOLDS.highDensityHours;

      if (isLateNight && hadHighDensity) {
        return 'recovery';
      }

      // 7. 일정 사이 여유 체크
      var hasBuffer = true;
      for (var i = 0; i < upcomingEvents.length - 1; i++) {
        var currentEnd = new Date(upcomingEvents[i].end);
        var nextStart = new Date(upcomingEvents[i + 1].start);
        var bufferMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
        if (bufferMinutes < 15) {
          hasBuffer = false;
          break;
        }
      }

      if (!hasBuffer && upcomingEvents.length > 2) {
        return 'needsAdjust';
      }

      // 8. 기본 상태: 안정
      return 'stable';
    },

    // 문장 생성
    generateSentence: function(status: LiveBriefingStatus): string {
      var templates = STATUS_SENTENCE_TEMPLATES[status];
      var now = new Date();
      var currentHour = now.getHours();

      // 시간대에 따른 문장 조정
      var timePrefix = '';
      if (currentHour >= 6 && currentHour < 10) {
        timePrefix = '좋은 아침이에요. ';
      } else if (currentHour >= 12 && currentHour < 14) {
        timePrefix = '점심시간이네요. ';
      } else if (currentHour >= 17 && currentHour < 20) {
        timePrefix = '하루 마무리 시간이에요. ';
      } else if (currentHour >= 22 || currentHour < 6) {
        timePrefix = '늦은 시간이네요. ';
      }

      // 랜덤 템플릿 선택
      var randomIndex = Math.floor(Math.random() * templates.length);
      var baseSentence = templates[randomIndex];

      // 시간대 프리픽스 추가 (확률적으로)
      if (timePrefix && Math.random() > 0.5) {
        return timePrefix + baseSentence;
      }

      return baseSentence;
    },

    // 액션 기록
    recordAction: function(action: UserActionTrigger) {
      set(function(state) {
        var recentActions = [action].concat(state.activity.recentActions.slice(0, 9));
        return {
          activity: {
            ...state.activity,
            lastInputTime: new Date(),
            recentActions: recentActions,
          },
        };
      });
    },

    // Skip 카운트 증가
    incrementSkip: function() {
      set(function(state) {
        return {
          activity: {
            ...state.activity,
            skipCount: state.activity.skipCount + 1,
          },
        };
      });
    },

    // 지연 카운트 증가
    incrementDelay: function() {
      set(function(state) {
        return {
          activity: {
            ...state.activity,
            delayCount: state.activity.delayCount + 1,
          },
        };
      });
    },

    // 집중 세션 상태 설정
    setFocusSession: function(active: boolean) {
      set(function(state) {
        return {
          activity: {
            ...state.activity,
            focusSessionActive: active,
          },
        };
      });

      // 상태 변경 시 브리핑 갱신
      var trigger = active ? 'focus_start' : 'focus_skip';
      get().updateBriefing('user_action', trigger as UserActionTrigger);
    },

    // 이벤트 새로고침
    refreshEvents: async function() {
      try {
        var events = await getTodayEvents();
        set({ todayEvents: events });
      } catch (error) {
        console.error('[LiveBriefing] Failed to refresh events:', error);
      }
    },

    // 자동 갱신 시작
    startAutoRefresh: function() {
      var store = get();

      // 기존 타이머 정리
      if (store.updateTimerId) {
        clearInterval(store.updateTimerId);
      }

      // 초기 이벤트 로드 및 브리핑 갱신
      store.refreshEvents().then(function() {
        store.updateBriefing('time_elapsed');
      });

      // 주기적 갱신 설정
      var intervalMinutes = TIME_TRIGGER_CONFIG.defaultInterval;
      var timerId = setInterval(function() {
        var currentStore = get();
        var status = currentStore.briefing.status;

        // 과부하 상태면 더 자주 갱신
        if (status === 'nearOverload' || status === 'needsAdjust') {
          // 이미 갱신 주기가 짧음
        }

        currentStore.refreshEvents().then(function() {
          currentStore.updateBriefing('time_elapsed');
        });
      }, intervalMinutes * 60 * 1000);

      set({ updateTimerId: timerId });
    },

    // 자동 갱신 중지
    stopAutoRefresh: function() {
      var store = get();
      if (store.updateTimerId) {
        clearInterval(store.updateTimerId);
        set({ updateTimerId: null });
      }
    },

    // 마지막 갱신 이후 시간
    getTimeSinceUpdate: function(): string {
      var store = get();
      var now = new Date();
      var updatedAt = store.briefing.updatedAt;
      var minutesAgo = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60));

      if (minutesAgo < 1) {
        return '방금 전';
      } else if (minutesAgo < 60) {
        return minutesAgo + '분 전 갱신';
      } else {
        var hoursAgo = Math.floor(minutesAgo / 60);
        return hoursAgo + '시간 전 갱신';
      }
    },
  };
});

// 사용자 액션 트리거를 위한 유틸리티 함수
export function triggerLiveBriefingUpdate(action: UserActionTrigger) {
  var store = useLiveBriefingStore.getState();
  store.updateBriefing('user_action', action);
}
