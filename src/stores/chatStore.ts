import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatSession, ChatContext, DNAInsight, JudgementReflection } from '../types/chat';
import { DNAExpansionEngine } from '../services/dnaEngine';
import { getTodayEvents } from '../services/calendar';
import {
  performSafetyCheck,
  updateConversationContext,
  SafetyLevel,
  CrisisResource,
  ConversationContext
} from '../services/safety';
import { useAlfredoStore } from './alfredoStore';
import { useLiftStore } from './liftStore';
import { useToneStore } from './toneStore';
import { triggerLiveBriefingUpdate } from './liveBriefingStore';
import {
  extractLearningsFromMessage,
  detectFeedbackSentiment
} from '../services/alfredo/learningExtractor';
import { conversationsApi, ChatContext as ApiChatContext } from '../lib/api';

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

  // 안전 시스템 상태
  safetyContext: ConversationContext | null;
  activeSafetyLevel: SafetyLevel;
  activeCrisisResources: CrisisResource[] | null;

  // Actions
  openChat: (context: ChatContext) => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  startNewSession: (context: ChatContext) => void;
  loadInsights: () => Promise<void>;
  clearSafetyAlert: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      accumulatedInsights: [],
      isOpen: false,
      entryContext: null,
      // 안전 시스템 초기 상태
      safetyContext: null,
      activeSafetyLevel: 'normal' as SafetyLevel,
      activeCrisisResources: null,
      
      openChat: (context) => {
        const { currentSession, sessions } = get();
        const now = new Date().getTime();
        const sixHours = 6 * 60 * 60 * 1000; // 6시간으로 확장
        
        // 1. currentSession이 있으면 우선 사용 (persist에서 복원된 경우)
        if (currentSession) {
          const lastActivity = toDate(currentSession.lastActivity);
          
          // 메시지가 있는 세션은 시간 제한을 넉넉하게
          if (currentSession.messages.length > 0 && now - lastActivity.getTime() < sixHours) {
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
        
        // 2. 세션 목록에서 메시지가 있는 가장 최근 세션 찾기
        const recentSessionWithMessages = [...sessions]
          .filter(s => s.messages.length > 0)
          .sort((a, b) => toDate(b.lastActivity).getTime() - toDate(a.lastActivity).getTime())
          .find(s => now - toDate(s.lastActivity).getTime() < sixHours);
        
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
        const { currentSession, entryContext, safetyContext } = get();
        if (!currentSession || !entryContext) return;

        // 1. 안전 체크 수행
        const safetyResult = performSafetyCheck(content, safetyContext || undefined);

        // 2. 대화 컨텍스트 업데이트 (연속 부정 카운트 등)
        const newSafetyContext = updateConversationContext(
          safetyContext,
          content,
          safetyResult.emotion
        );

        // 3. 사용자 메시지 추가 (안전 레벨 포함)
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
          context: entryContext,
          safetyLevel: safetyResult.emotion.level
        };

        // 기존 메시지들의 timestamp도 Date 객체로 변환
        const existingMessages = currentSession.messages.map(msg => ({
          ...msg,
          timestamp: toDate(msg.timestamp)
        }));

        // 사용자 메시지 먼저 추가 (UI에 즉시 표시)
        set({
          currentSession: {
            ...currentSession,
            messages: [...existingMessages, userMessage],
            lastActivity: new Date(),
            startedAt: toDate(currentSession.startedAt),
          }
        });

        // 4. 알프레도 응답 생성
        let alfredoResponse: {
          full: string;
          understanding: string;
          summary: string;
          judgement: JudgementReflection;
          insights: DNAInsight[];
          isSafetyResponse?: boolean;
        };

        // 위기 상황이면 안전 응답을 우선 (API 호출 없이 즉시 응답)
        if (safetyResult.emotion.level === 'crisis' || safetyResult.emotion.level === 'care') {
          alfredoResponse = {
            full: safetyResult.safetyResponse || '',
            understanding: safetyResult.emotion.level === 'crisis'
              ? '지금 많이 힘드시군요.'
              : '요즘 많이 지치셨나봐요.',
            summary: '',
            judgement: {
              type: 'consider' as const,
              message: safetyResult.safetyResponse || '',
              confidence: 0.95
            },
            insights: [],
            isSafetyResponse: true
          };
        } else {
          // Claude API 호출 (SSE 스트리밍)
          alfredoResponse = await callClaudeAPI(content, entryContext, safetyResult, get, set);
        }

        const alfredoMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'alfredo',
          content: alfredoResponse.full,
          timestamp: new Date(),
          understanding: alfredoResponse.understanding,
          summary: alfredoResponse.summary,
          judgement: alfredoResponse.judgement,
          dnaInsights: alfredoResponse.insights,
          // 안전 메시지 여부
          safetyLevel: safetyResult.emotion.level,
          isSafetyMessage: safetyResult.emotion.level !== 'normal',
          crisisResources: safetyResult.crisisResources
        };

        // === Lift 기록 (판단 변경 시) ===
        if (alfredoResponse.judgement && alfredoResponse.judgement.type !== 'maintain') {
          try {
            const liftStore = useLiftStore.getState();

            // 카테고리 결정 (메시지 내용 기반)
            let category: 'priority' | 'schedule' | 'worklife' | 'condition' = 'priority';
            if (content.includes('일정') || content.includes('미팅') || content.includes('회의')) {
              category = 'schedule';
            } else if (content.includes('컨디션') || content.includes('피곤') || content.includes('힘들')) {
              category = 'condition';
            } else if (content.includes('균형') || content.includes('워라밸') || content.includes('휴식')) {
              category = 'worklife';
            }

            // 영향도 결정
            let impact: 'high' | 'medium' | 'low' = 'medium';
            if (alfredoResponse.judgement.confidence >= 0.9) impact = 'high';
            else if (alfredoResponse.judgement.confidence < 0.7) impact = 'low';

            liftStore.addLift({
              type: alfredoResponse.judgement.type as 'apply' | 'consider',
              category: category,
              previousDecision: '기존 판단',
              newDecision: alfredoResponse.judgement.message || '',
              reason: content,
              impact: impact
            });
          } catch (error) {
            console.error('Failed to record Lift:', error);
          }
        }

        // 세션 업데이트 (알프레도 응답 추가)
        const currentMessages = get().currentSession?.messages || [];
        const updatedSession: ChatSession = {
          ...currentSession,
          messages: [...currentMessages.map(msg => ({
            ...msg,
            timestamp: toDate(msg.timestamp)
          })), alfredoMessage],
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
          ],
          // 안전 상태 업데이트
          safetyContext: newSafetyContext,
          activeSafetyLevel: safetyResult.emotion.level,
          activeCrisisResources: safetyResult.crisisResources || null
        });

        // === 알프레도 학습 시스템 연동 ===
        try {
          const alfredoStore = useAlfredoStore.getState();

          // 1. 대화에서 학습 추출
          const extractedLearnings = extractLearningsFromMessage(
            content,
            alfredoResponse.full,
            { entry: entryContext.entry }
          );

          // 2. 추출된 학습 저장
          for (const learning of extractedLearnings) {
            if (alfredoStore.preferences) {
              await alfredoStore.addNewLearning({
                type: learning.type,
                category: learning.category,
                summary: learning.summary,
                originalInput: learning.originalInput,
                source: 'chat'
              });
            }
          }

          // 3. 피드백 감지 (이전 응답에 대한 긍정/부정)
          const sentiment = detectFeedbackSentiment(content);
          if (sentiment !== 'neutral' && alfredoStore.learnings.length > 0) {
            // 가장 최근 학습에 피드백 적용
            const recentLearning = alfredoStore.learnings[0];
            if (recentLearning) {
              await alfredoStore.feedbackLearning(
                recentLearning.id,
                sentiment === 'positive'
              );
            }
          }
        } catch (error) {
          console.error('Failed to save learning from chat:', error);
        }

        // === Live Briefing 갱신 트리거 (채팅 입력 시 즉시 갱신) ===
        triggerLiveBriefingUpdate('chat_input');
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
      },

      clearSafetyAlert: () => {
        set({
          activeSafetyLevel: 'normal',
          activeCrisisResources: null
        });
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

// Claude API 호출 함수
async function callClaudeAPI(
  userInput: string,
  context: ChatContext,
  safetyResult: { emotion: { level: SafetyLevel }; safetyResponse?: string; boundary: { type: string; alternativeResponse?: string } },
  get: () => ChatStore,
  set: (partial: Partial<ChatStore>) => void
): Promise<{
  full: string;
  understanding: string;
  summary: string;
  judgement: JudgementReflection;
  insights: DNAInsight[];
}> {
  // 알프레도 학습 컨텍스트 가져오기
  const alfredoStore = useAlfredoStore.getState();
  const toneStore = useToneStore.getState();
  const learnings = alfredoStore.learnings || [];

  // API 컨텍스트 구성
  const apiContext: ApiChatContext = {
    tone: {
      preset: toneStore.preset,
      axes: toneStore.axes,
    },
    learnings: learnings
      .filter(l => l.isActive && l.confidence > 40)
      .slice(0, 5)
      .map(l => ({
        type: l.learningType,
        summary: l.summary,
        confidence: l.confidence,
      })),
    entry: context.entry,
    safetyLevel: safetyResult.emotion.level,
  };

  // 경계 주제 감지 시 대체 응답 사용 (API 호출 없이)
  if (safetyResult.boundary.type !== 'safe' && safetyResult.boundary.alternativeResponse) {
    return {
      full: `음, 그런 고민이 있으시군요.\n\n${safetyResult.boundary.alternativeResponse}`,
      understanding: '음, 그런 고민이 있으시군요.',
      summary: '',
      judgement: {
        type: 'consider',
        message: safetyResult.boundary.alternativeResponse,
        confidence: 0.9
      },
      insights: []
    };
  }

  // Watch 레벨일 때 더 부드러운 톤 (API 호출 없이)
  if (safetyResult.emotion.level === 'watch' && safetyResult.safetyResponse) {
    const understanding = safetyResult.safetyResponse.split('\n')[0] || '요즘 좀 힘드시죠.';
    return {
      full: `${understanding}\n\n필요하시면 언제든 말씀해주세요. 옆에 있을게요.`,
      understanding,
      summary: '',
      judgement: {
        type: 'consider',
        message: '필요하시면 언제든 말씀해주세요. 옆에 있을게요.',
        confidence: 0.9
      },
      insights: []
    };
  }

  // Claude API 호출 (SSE 스트리밍)
  return new Promise((resolve) => {
    let fullResponse = '';
    const { currentSession } = get();
    const conversationId = currentSession?.id;

    conversationsApi.sendMessage(
      userInput,
      conversationId,
      // onMessage: 스트리밍 텍스트 수신
      (data) => {
        if (data.text) {
          fullResponse += data.text;

          // 실시간 UI 업데이트 (스트리밍 중)
          const currentState = get();
          if (currentState.currentSession) {
            const streamingMessage: ChatMessage = {
              id: 'streaming',
              role: 'alfredo',
              content: fullResponse,
              timestamp: new Date(),
              isStreaming: true
            };

            const messagesWithoutStreaming = currentState.currentSession.messages.filter(
              m => m.id !== 'streaming'
            );

            set({
              currentSession: {
                ...currentState.currentSession,
                messages: [...messagesWithoutStreaming, streamingMessage]
              }
            });
          }
        }
      },
      // onError
      (error) => {
        console.error('Claude API Error:', error);
        // Fallback to pattern-based response
        resolve(generateFallbackResponse(userInput, context));
      },
      // onComplete
      () => {
        // 스트리밍 완료 - 스트리밍 메시지 제거
        const currentState = get();
        if (currentState.currentSession) {
          const messagesWithoutStreaming = currentState.currentSession.messages.filter(
            m => m.id !== 'streaming'
          );
          set({
            currentSession: {
              ...currentState.currentSession,
              messages: messagesWithoutStreaming
            }
          });
        }

        // 응답 파싱 및 반환
        resolve(parseClaudeResponse(fullResponse, userInput, context));
      },
      // context
      apiContext
    );
  });
}

// Claude 응답 파싱
function parseClaudeResponse(
  response: string,
  _userInput: string,
  _context: ChatContext
): {
  full: string;
  understanding: string;
  summary: string;
  judgement: JudgementReflection;
  insights: DNAInsight[];
} {
  // 응답에서 첫 문장을 understanding으로 사용
  const sentences = response.split(/[.!?]\s+/);
  const understanding = sentences[0] ? sentences[0] + '.' : '네, 알겠어요.';

  // 판단 타입 추론 (키워드 기반)
  let judgementType: 'apply' | 'consider' | 'maintain' = 'maintain';
  let confidence = 0.8;

  if (response.includes('해드릴게요') || response.includes('조정해') || response.includes('변경해')) {
    judgementType = 'apply';
    confidence = 0.9;
  } else if (response.includes('어떨까요') || response.includes('고려해') || response.includes('생각해')) {
    judgementType = 'consider';
    confidence = 0.85;
  }

  return {
    full: response,
    understanding,
    summary: '',
    judgement: {
      type: judgementType,
      message: response,
      confidence
    },
    insights: []
  };
}

// Fallback 응답 생성 (API 실패 시)
function generateFallbackResponse(
  userInput: string,
  context: ChatContext
): {
  full: string;
  understanding: string;
  summary: string;
  judgement: JudgementReflection;
  insights: DNAInsight[];
} {
  const toneStore = useToneStore.getState();
  const greeting = toneStore.getMessage('greeting');

  let response = '네, 이해했어요. ';

  if (userInput.includes('안녕') || userInput.includes('하이')) {
    response = `${greeting} 무엇을 도와드릴까요?`;
  } else if (userInput.includes('피곤') || userInput.includes('힘들')) {
    response = '오늘 좀 힘드시군요. 무리하지 마시고 가장 중요한 것만 집중해보는 건 어떨까요?';
  } else if (context.entry === 'priority') {
    response = '우선순위에 대해 이야기하고 싶으신 거군요. 어떤 부분이 고민되세요?';
  } else {
    response = '네, 알겠어요. 어떻게 도와드릴까요?';
  }

  return {
    full: response,
    understanding: '네, 알겠어요.',
    summary: '',
    judgement: {
      type: 'maintain',
      message: response,
      confidence: 0.7
    },
    insights: []
  };
}
