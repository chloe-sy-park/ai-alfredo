import { useState, useCallback } from 'react';
import { conversationsApi } from '../lib/api';
import type { Conversation, Message } from '../types/database';

interface UseConversationsReturn {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<Conversation | null>;
  sendMessage: (message: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  streamingMessage: string;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');

  // 대화 목록 조회
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await conversationsApi.list();

      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setError(response.error?.message || '대화 목록 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 새 대화 생성
  const createConversation = useCallback(async (): Promise<Conversation | null> => {
    try {
      const response = await conversationsApi.create();

      if (response.success && response.data) {
        setConversations(prev => [response.data!, ...prev]);
        setCurrentConversation(response.data);
        setMessages([]);
        return response.data;
      } else {
        setError(response.error?.message || '대화 생성 실패');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return null;
    }
  }, []);

  // 메시지 전송 (스트리밍)
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      // 사용자 메시지 추가
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: currentConversation?.id || '',
        role: 'user',
        content: message,
        metadata: null,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);

      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);

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
              setStreamingMessage(fullResponse);
            }
            if (data.conversation_id && !conversationId) {
              conversationId = data.conversation_id;
              // 새 대화가 생성된 경우
              setCurrentConversation(prev => 
                prev || { 
                  id: data.conversation_id!, 
                  user_id: '', 
                  title: null, 
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              );
            }
          },
          // onError
          (error) => {
            setError(error.message);
            setIsStreaming(false);
          },
          // onComplete
          () => {
            // 어시스턴트 메시지 추가
            if (fullResponse) {
              const assistantMessage: Message = {
                id: `temp-${Date.now()}-assistant`,
                conversation_id: conversationId || '',
                role: 'assistant',
                content: fullResponse,
                metadata: null,
                created_at: new Date().toISOString(),
              };
              setMessages(prev => [...prev, assistantMessage]);
            }
            setStreamingMessage('');
            setIsStreaming(false);
          }
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : '메시지 전송 실패');
        setIsStreaming(false);
      }
    },
    [currentConversation]
  );

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    fetchConversations,
    createConversation,
    sendMessage,
    setCurrentConversation,
    streamingMessage,
  };
}

export default useConversations;
