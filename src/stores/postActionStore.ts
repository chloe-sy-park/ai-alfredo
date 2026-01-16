/**
 * PostAction Store
 * PRD: PostAction 브리핑 상태 관리
 * 액션 완료 후 토스트 메시지를 전역에서 관리
 */

import { create } from 'zustand';
import {
  PostActionBriefing,
  PostActionContext,
  generatePostActionBriefing
} from '../services/briefing';

interface PostActionState {
  currentBriefing: PostActionBriefing | null;

  // 액션 트리거
  triggerPostAction: (context: PostActionContext) => void;

  // 토스트 닫기
  dismissBriefing: () => void;
}

export const usePostActionStore = create<PostActionState>(function(set) {
  return {
    currentBriefing: null,

    triggerPostAction: function(context: PostActionContext) {
      var briefing = generatePostActionBriefing(context);
      set({ currentBriefing: briefing });
    },

    dismissBriefing: function() {
      set({ currentBriefing: null });
    }
  };
});

// 편의 훅: 특정 액션 타입별 트리거
export function usePostAction() {
  var store = usePostActionStore();

  return {
    // 태스크 완료
    onTaskCompleted: function(remainingTasks?: number) {
      store.triggerPostAction({
        type: 'task_completed',
        data: { remainingTasks: remainingTasks }
      });
    },

    // 집중 설정
    onFocusSet: function(focusTitle: string) {
      store.triggerPostAction({
        type: 'focus_set',
        data: { focusTitle: focusTitle }
      });
    },

    // 집중 해제
    onFocusCleared: function() {
      store.triggerPostAction({ type: 'focus_cleared' });
    },

    // 컨디션 업데이트
    onConditionUpdated: function(condition: 'great' | 'good' | 'normal' | 'bad') {
      store.triggerPostAction({
        type: 'condition_updated',
        data: { condition: condition }
      });
    },

    // 모드 변경
    onModeChanged: function(mode: 'all' | 'work' | 'life') {
      store.triggerPostAction({
        type: 'mode_changed',
        data: { mode: mode }
      });
    },

    // 메모 저장
    onMemoSaved: function() {
      store.triggerPostAction({ type: 'memo_saved' });
    },

    // 회의록 생성
    onMeetingMinutesGenerated: function() {
      store.triggerPostAction({ type: 'meeting_minutes_generated' });
    },

    // 습관 체크
    onHabitChecked: function(streakCount?: number) {
      store.triggerPostAction({
        type: 'habit_checked',
        data: { streakCount: streakCount }
      });
    },

    // 브리핑 피드백 (PRD: 👍 좋아요, 🔁 다른 제안, 🙅 괜찮아요)
    onBriefingFeedback: function(feedback: 'positive' | 'different' | 'skip') {
      store.triggerPostAction({
        type: 'briefing_feedback',
        data: { feedback: feedback }
      });
    }
  };
}
