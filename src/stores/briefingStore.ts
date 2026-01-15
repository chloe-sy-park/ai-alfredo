import { create } from 'zustand';
import { generateBriefing, BriefingOutput, BriefingContext } from '../services/briefing';
import { getWeather } from '../services/weather';
import { getTodayCalendar } from '../services/calendar';
import { getIncompleteTasks } from '../services/tasks';
import { getCondition } from '../services/condition';

interface BriefingState {
  briefing: BriefingOutput | null;
  lastUpdated: Date | null;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  generateBriefing: () => Promise<void>;
  clearError: () => void;
}

export var useBriefingStore = create<BriefingState>(function(set) {
  return {
    briefing: null,
    lastUpdated: null,
    isGenerating: false,
    error: null,
    
    generateBriefing: async function() {
      set({ isGenerating: true, error: null });
      
      try {
        // Context 수집
        var now = new Date();
        var dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][now.getDay()];
        
        var [weather, calendar, incompleteTasks, condition] = await Promise.all([
          getWeather(),
          getTodayCalendar(),
          getIncompleteTasks(),
          getCondition()
        ]);
        
        var context: BriefingContext = {
          currentTime: now,
          dayOfWeek: dayOfWeek,
          weather: weather,
          todayCalendar: calendar,
          incompleteTasks: incompleteTasks,
          condition: condition
        };
        
        // 브리핑 생성
        var briefing = generateBriefing(context);
        
        set({ 
          briefing: briefing, 
          lastUpdated: now,
          isGenerating: false 
        });
      } catch (error) {
        set({ 
          error: '브리핑을 생성하는 중 오류가 발생했습니다', 
          isGenerating: false 
        });
      }
    },
    
    clearError: function() {
      set({ error: null });
    }
  };
});