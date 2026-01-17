// briefingStore.ts
import { create } from 'zustand';
import { getTodayEvents, CalendarEvent } from '../services/calendar/calendarService';
import { getTasks, Task } from '../services/tasks';
import { getTodayCondition, ConditionLevel } from '../services/condition/conditionService';
import { generateBriefing, BriefingOutput, BriefingContext, EmailBriefingInfo } from '../services/briefing';
import { getEmailBriefing } from '../services/gmail/gmailService';

interface BriefingState {
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  briefing: BriefingOutput | null;
  todayCalendar: CalendarEvent[];
  incompleteTasks: Task[];
  condition: ConditionLevel | undefined;
  refreshBriefing: () => Promise<void>;
  clearError: () => void;
}

// 요일 배열
var DAYS_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export const useBriefingStore = create<BriefingState>((set, get) => ({
  lastUpdated: null,
  isLoading: false,
  error: null,
  briefing: null,
  todayCalendar: [],
  incompleteTasks: [],
  condition: undefined,

  refreshBriefing: async () => {
    // 이미 로딩 중이면 중복 실행 방지
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      // 1. 캘린더 이벤트 가져오기
      var todayCalendar: CalendarEvent[] = [];
      try {
        todayCalendar = await getTodayEvents();
      } catch (e) {
        console.warn('[BriefingStore] 캘린더 로드 실패:', e);
      }

      // 2. 미완료 태스크 가져오기
      var allTasks = getTasks();
      var incompleteTasks = allTasks.filter(function(t: Task) {
        return t.status !== 'done';
      });

      // 3. 오늘 컨디션 가져오기
      var conditionRecord = getTodayCondition();
      var condition: ConditionLevel | undefined = conditionRecord?.level;

      // 4. 이메일 브리핑 가져오기 (Gmail 연동된 경우)
      var emailBriefing: EmailBriefingInfo | undefined;
      try {
        var emailResult = await getEmailBriefing();
        if (emailResult) {
          emailBriefing = emailResult;
        }
      } catch (e) {
        console.warn('[BriefingStore] 이메일 브리핑 로드 실패:', e);
      }

      // 5. 브리핑 컨텍스트 구성
      var now = new Date();
      var context: BriefingContext = {
        currentTime: now,
        dayOfWeek: DAYS_KO[now.getDay()],
        todayCalendar: todayCalendar,
        incompleteTasks: incompleteTasks,
        condition: condition,
        emailBriefing: emailBriefing
      };

      // 5. 브리핑 생성
      var briefing = generateBriefing(context);

      set({
        lastUpdated: new Date(),
        briefing: briefing,
        todayCalendar: todayCalendar,
        incompleteTasks: incompleteTasks,
        condition: condition
      });

      console.log('[BriefingStore] 브리핑 갱신 완료:', briefing.headline);
    } catch (error) {
      var errorMessage = error instanceof Error ? error.message : '브리핑 갱신 실패';
      console.error('[BriefingStore] 브리핑 갱신 실패:', error);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));