import { create } from 'zustand';
import { conversationsApi } from '../lib/api';
import type { Conversation, Message } from '../types/database';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  streamingMessage: string;

  // Actions
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<Conversation | null>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  streamingMessage: '',

  fetchConversations: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await conversationsApi.list();

      if (response.success && response.data) {
        set({ conversations: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || '대화 목록 조회 실패', isLoading: false });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류', isLoading: false });
    }
  },

  createConversation: async () => {
    try {
      const response = await conversationsApi.create();

      if (response.success && response.data) {
        set(state => ({
          conversations: [response.data!, ...state.conversations],
          currentConversation: response.data,
          messages: [],
        }));
        return response.data;
      } else {
        set({ error: response.error?.message || '대화 생성 실패' });
        return null;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return null;
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation, messages: [] });
  },

  sendMessage: async (message) => {
    if (!message.trim()) return;

    const { currentConversation } = get();

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: message,
      metadata: null,
      created_at: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingMessage: '',
      error: null,
    }));

    let fullResponse = '';
    let conversationId = currentConversation?.id;

    try {
      await conversationsApi.sendMessage(
        message,
        conversationId,
        // onMessage
        (data) => {
          if (data.text) {
            fullResponse += data.text;
            set({ streamingMessage: fullResponse });
          }
          if (data.conversation_id && !conversationId) {
            conversationId = data.conversation_id;
            // 새 대화가 생성된 경우
            set({
              currentConversation: {
                id: data.conversation_id,
                user_id: '',
                title: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            });
          }
        },
        // onError
        (error) => {
          set({ error: error.message, isStreaming: false });
        },
        // onComplete
        () => {
          if (fullResponse) {
            const assistantMessage: Message = {
              id: `temp-${Date.now()}-assistant`,
              conversation_id: conversationId || '',
              role: 'assistant',
              content: fullResponse,
              metadata: null,
              created_at: new Date().toISOString(),
            };
            set(state => ({
              messages: [...state.messages, assistantMessage],
              streamingMessage: '',
              isStreaming: false,
            }));
          } else {
            set({ streamingMessage: '', isStreaming: false });
          }
        }
      );
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : '메시지 전송 실패',
        isStreaming: false,
      });
    }
  },

  clearMessages: () => {
    set({ messages: [], currentConversation: null });
  },

  clearError: () => set({ error: null }),
}));
