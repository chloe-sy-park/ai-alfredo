import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatSession, ChatContext, DNAInsight, JudgementReflection } from '../types/chat';
import { DNAExpansionEngine } from '../services/dnaEngine';
import { getTodayEvents } from '../services/calendar';

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
        var { currentSession } = get();
        
        // 기존 세션이 있고 1시간 이내면 계속 사용
        if (currentSession && 
            new Date().getTime() - currentSession.lastActivity.getTime() < 60 * 60 * 1000) {
          set({
            isOpen: true,
            entryContext: context,
            currentSession: {
              ...currentSession,
              lastActivity: new Date()
            }
          });
        } else {
          // 새 세션 시작
          get().startNewSession(context);
        }
      },
      
      closeChat: () => {
        set({ isOpen: false });
      },
      
      sendMessage: async (content) => {
        var { currentSession, entryContext } = get();
        if (!currentSession || !entryContext) return;
        
        // 사용자 메시지 추가
        var userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
          context: entryContext
        };
        
        // 알프레도 응답 생성 (임시 로직)
        var alfredoResponse = await generateAlfredoResponse(content, entryContext);
        
        var alfredoMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'alfredo',
          content: alfredoResponse.full,
          timestamp: new Date(),
          understanding: alfredoResponse.understanding,
          summary: alfredoResponse.summary,
          judgement: alfredoResponse.judgement,
          dnaInsights: alfredoResponse.insights
        };
        
        // 세션 업데이트
        var updatedSession: ChatSession = {
          ...currentSession,
          messages: [...currentSession.messages, userMessage, alfredoMessage],
          lastActivity: new Date(),
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
        var newSession: ChatSession = {
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
          var events = await getTodayEvents();
          var insights = DNAExpansionEngine.analyzeCalendar(events);
          
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
        accumulatedInsights: state.accumulatedInsights
      })
    }
  )
);

// 알프레도 응답 생성 (임시 구현)
async function generateAlfredoResponse(userInput: string, context: ChatContext) {
  // 실제로는 Claude API 호출하겠지만, 지금은 패턴 기반 응답
  
  var understanding = '네, 이해했어요. ';
  var summary = '';
  var judgement: JudgementReflection = {
    type: 'maintain',
    message: '지금 기준은 유지할게요.',
    confidence: 0.8
  };
  var insights: DNAInsight[] = [];
  
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
  }
  
  var full = `${understanding}\n\n${summary}\n\n${judgement.message}`;
  
  return {
    full,
    understanding,
    summary,
    judgement,
    insights
  };
}
