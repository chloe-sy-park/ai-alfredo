import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatSession, ChatContext, DNAInsight, JudgementReflection } from '../types/chat';
import { DNAExpansionEngine } from '../services/dnaEngine';
import { getTodayEvents } from '../services/calendar';

// Date 객체 안전 변환 헬퍼 (persist 후 string -> Date 변환)
const toDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

interface ChatStore {
  // 현재 세션
  currentSession: ChatSession | null;
  
  // 모든 세션 (히스토리)
  sessions: ChatSession[];
  
  // DNA 인사이트 (누적)
  accumulatedInsights: DNAInsight[];
  
  // 챗 열림 상태
  isOpen: boolean;
  
  // 진입 컨텍스트
  entryContext: ChatContext | null;
  
  // Actions
  openChat: (context: ChatContext) => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  startNewSession: (context: ChatContext) => void;
  loadInsights: () => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      accumulatedInsights: [],
      isOpen: false,
      entryContext: null,
      
      openChat: (context) => {
        const { currentSession, sessions } = get();
        const now = new Date().getTime();
        const oneHour = 60 * 60 * 1000;
        
        // 1. 현재 세션이 있고 메시지가 있으며 1시간 이내면 사용
        if (currentSession && currentSession.messages.length > 0) {
          const lastActivity = toDate(currentSession.lastActivity);
          if (now - lastActivity.getTime() < oneHour) {
            set({
              isOpen: true,
              entryContext: context,
              currentSession: {
                ...currentSession,
                lastActivity: new Date(),
                // Date 복원
                startedAt: toDate(currentSession.startedAt),
                messages: currentSession.messages.map(msg => ({
                  ...msg,
                  timestamp: toDate(msg.timestamp)
                }))
              }
            });
            return;
          }
        }
        
        // 2. 세션 목록에서 메시지가 있고 1시간 이내인 가장 최근 세션 찾기
        const recentSessionWithMessages = [...sessions]
          .filter(s => s.messages.length > 0)
          .sort((a, b) => toDate(b.lastActivity).getTime() - toDate(a.lastActivity).getTime())
          .find(s => now - toDate(s.lastActivity).getTime() < oneHour);
        
        if (recentSessionWithMessages) {
          const restoredSession = {
            ...recentSessionWithMessages,
            lastActivity: new Date(),
            startedAt: toDate(recentSessionWithMessages.startedAt),
            messages: recentSessionWithMessages.messages.map(msg => ({
              ...msg,
              timestamp: toDate(msg.timestamp)
            }))
          };
          
          set({
            isOpen: true,
            entryContext: context,
            currentSession: restoredSession,
            // sessions 배열도 업데이트
            sessions: sessions.map(s => 
              s.id === restoredSession.id ? restoredSession : s
            )
          });
          return;
        }
        
        // 3. 그 외의 경우 새 세션 시작
        get().startNewSession(context);
      },
      
      closeChat: () => {
        set({ isOpen: false });
      },
      
      sendMessage: async (content) => {
        const { currentSession, entryContext } = get();
        if (!currentSession || !entryContext) return;
        
        // 사용자 메시지 추가
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
          context: entryContext
        };
        
        // 알프레도 응답 생성 (임시 로직)
        const alfredoResponse = await generateAlfredoResponse(content, entryContext);
        
        const alfredoMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'alfredo',
          content: alfredoResponse.full,
          timestamp: new Date(),
          understanding: alfredoResponse.understanding,
          summary: alfredoResponse.summary,
          judgement: alfredoResponse.judgement,
          dnaInsights: alfredoResponse.insights
        };
        
        // 기존 메시지들의 timestamp도 Date 객체로 변환
        const existingMessages = currentSession.messages.map(msg => ({
          ...msg,
          timestamp: toDate(msg.timestamp)
        }));
        
        // 세션 업데이트
        const updatedSession: ChatSession = {
          ...currentSession,
          messages: [...existingMessages, userMessage, alfredoMessage],
          lastActivity: new Date(),
          startedAt: toDate(currentSession.startedAt),
          insights: [
            ...currentSession.insights,
            ...(alfredoResponse.insights || [])
          ]
        };
        
        set({
          currentSession: updatedSession,
          sessions: get().sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          ),
          accumulatedInsights: [
            ...get().accumulatedInsights,
            ...(alfredoResponse.insights || [])
          ]
        });
      },
      
      startNewSession: (context) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          messages: [],
          startedAt: new Date(),
          lastActivity: new Date(),
          status: 'active',
          insights: []
        };
        
        set({
          currentSession: newSession,
          sessions: [...get().sessions, newSession],
          isOpen: true,
          entryContext: context
        });
      },
      
      loadInsights: async () => {
        try {
          const events = await getTodayEvents();
          const insights = DNAExpansionEngine.analyzeCalendar(events);
          
          set({
            accumulatedInsights: insights
          });
        } catch (error) {
          console.error('Failed to load DNA insights:', error);
        }
      }
    }),
    {
      name: 'alfredo-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        accumulatedInsights: state.accumulatedInsights,
        currentSession: state.currentSession
      }),
      // persist 후 Date 객체 복원
      onRehydrateStorage: () => (state) => {
        if (state) {
          // currentSession의 Date 복원
          if (state.currentSession) {
            state.currentSession.startedAt = toDate(state.currentSession.startedAt);
            state.currentSession.lastActivity = toDate(state.currentSession.lastActivity);
            state.currentSession.messages = state.currentSession.messages.map(msg => ({
              ...msg,
              timestamp: toDate(msg.timestamp)
            }));
          }
          
          // sessions의 Date 복원
          state.sessions = state.sessions.map(session => ({
            ...session,
            startedAt: toDate(session.startedAt),
            lastActivity: toDate(session.lastActivity),
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: toDate(msg.timestamp)
            }))
          }));
        }
      }
    }
  )
);

// 알프레도 응답 생성 (임시 구현)
async function generateAlfredoResponse(userInput: string, context: ChatContext) {
  // 실제로는 Claude API 호출하겠지만, 지금은 패턴 기반 응답
  
  let understanding = '네, 이해했어요. ';
  let summary = '';
  let judgement: JudgementReflection = {
    type: 'maintain',
    message: '지금 기준은 유지할게요.',
    confidence: 0.8
  };
  const insights: DNAInsight[] = [];
  
  // 컨텍스트별 응답
  if (context.entry === 'priority') {
    understanding += userInput.includes('중요') ? 
      '우선순위에 대한 생각을 공유해주셨네요.' :
      '지금 상황을 설명해주셨네요.';
    
    if (userInput.includes('미팅') || userInput.includes('회의')) {
      summary = '미팅 준비와 관련된 우선순위 조정이 필요하신 것 같아요.';
      judgement = {
        type: 'apply',
        message: '미팅 관련 작업을 상위로 올려둘게요.',
        changes: ['미팅 준비를 Top 1으로 조정'],
        confidence: 0.9
      };
    }
  } else if (context.entry === 'manual') {
    understanding += '무엇을 도와드릴까요?';
    
    if (userInput.includes('안녕') || userInput.includes('하이')) {
      summary = '반가워요! 오늘 하루도 함께해요.';
      judgement = {
        type: 'maintain',
        message: '오늘도 좋은 하루 보내세요! 🐧',
        confidence: 1.0
      };
    } else if (userInput.includes('피곤') || userInput.includes('힘들')) {
      summary = '오늘 좀 힘드시군요.';
      judgement = {
        type: 'consider',
        message: '오늘은 무리하지 마시고, 가장 중요한 것만 집중해보는 건 어떨까요?',
        confidence: 0.85
      };
    }
  }
  
  const full = `${understanding}\n\n${summary}\n\n${judgement.message}`;
  
  return {
    full,
    understanding,
    summary,
    judgement,
    insights
  };
}
