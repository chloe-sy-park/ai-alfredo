import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DNAProfile, DNABasedSuggestion, CalendarEvent } from '@/services/dna/types';
import { CalendarAnalyzer } from '@/services/dna/calendarAnalyzer';
import { DNAMessageGenerator } from '@/services/dna/messageGenerator';

interface DNAState {
  // 상태
  profile: DNAProfile | null;
  suggestions: DNABasedSuggestion[];
  isAnalyzing: boolean;
  lastAnalyzedAt: Date | null;
  analysisPhase: 'day1' | 'week1' | 'week2';
  
  // 사용자 피드백 (교정 루프)
  userCorrections: Record<string, boolean>; // insightId -> 맞음/틀림
  
  // 액션
  analyzeCalendar: (userId: string, events: CalendarEvent[]) => Promise<DNAProfile>;
  generateSuggestions: () => void;
  correctInsight: (insightType: string, isCorrect: boolean) => void;
  clearProfile: () => void;
}

export const useDNAStore = create<DNAState>()(
  persist(
    (set, get) => ({
      profile: null,
      suggestions: [],
      isAnalyzing: false,
      lastAnalyzedAt: null,
      analysisPhase: 'day1',
      userCorrections: {},

      analyzeCalendar: async (userId: string, events: CalendarEvent[]) => {
        set({ isAnalyzing: true });
        
        try {
          const analyzer = new CalendarAnalyzer(events);
          const profile = analyzer.analyze(userId);
          
          // 페이즈 결정
          const daysSinceStart = profile.analyzedEventsCount > 0
            ? Math.floor((Date.now() - profile.dataRangeStart.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          
          let phase: 'day1' | 'week1' | 'week2' = 'day1';
          if (daysSinceStart >= 14) phase = 'week2';
          else if (daysSinceStart >= 7) phase = 'week1';
          
          set({ 
            profile, 
            lastAnalyzedAt: new Date(),
            analysisPhase: phase,
            isAnalyzing: false 
          });
          
          // 제안 자동 생성
          get().generateSuggestions();
          
          return profile;
        } catch (error) {
          set({ isAnalyzing: false });
          throw error;
        }
      },

      generateSuggestions: () => {
        const { profile, analysisPhase } = get();
        if (!profile) return;
        
        const generator = new DNAMessageGenerator(profile);
        let suggestions: DNABasedSuggestion[] = [];
        
        switch (analysisPhase) {
          case 'day1':
            suggestions = generator.generateDay1Messages();
            break;
          case 'week1':
            suggestions = [
              ...generator.generateWeek1Messages(),
              ...generator.generateStressMessages()
            ];
            break;
          case 'week2':
            suggestions = [
              ...generator.generateWeek2Messages(),
              ...generator.generateStressMessages(),
              ...generator.generateWorkLifeBalanceMessages()
            ];
            break;
        }
        
        set({ suggestions });
      },

      correctInsight: (insightType: string, isCorrect: boolean) => {
        set(state => ({
          userCorrections: {
            ...state.userCorrections,
            [insightType]: isCorrect
          }
        }));
        // TODO: 교정 데이터 기반으로 분석 결과 조정
      },

      clearProfile: () => {
        set({
          profile: null,
          suggestions: [],
          lastAnalyzedAt: null,
          analysisPhase: 'day1',
          userCorrections: {}
        });
      }
    }),
    {
      name: 'alfredo-dna',
      partialize: (state) => ({
        profile: state.profile,
        lastAnalyzedAt: state.lastAnalyzedAt,
        analysisPhase: state.analysisPhase,
        userCorrections: state.userCorrections
      })
    }
  )
);
