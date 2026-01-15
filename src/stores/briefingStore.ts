// briefingStore.ts
import { create } from 'zustand';

interface BriefingState {
  lastUpdated: Date | null;
  isLoading: boolean;
  refreshBriefing: () => Promise<void>;
}

export const useBriefingStore = create<BriefingState>((set) => ({
  lastUpdated: null,
  isLoading: false,
  
  refreshBriefing: async () => {
    set({ isLoading: true });
    
    try {
      // TODO: 실제 브리핑 갱신 로직 구현
      // - 캘린더 이벤트 가져오기
      // - 미완료 태스크 가져오기
      // - 현재 컨디션 가져오기
      // - AI 브리핑 생성
      
      console.log('브리핑 갱신 중...');
      
      // 임시로 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set({ lastUpdated: new Date() });
    } catch (error) {
      console.error('브리핑 갱신 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));