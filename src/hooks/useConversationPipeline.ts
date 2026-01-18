/**
 * useConversationPipeline
 *
 * 대화 처리 파이프라인 훅
 * 1. 메시지 전송 → Detector 호출 → 신호 업데이트
 * 2. 신호 기반 Responder 호출 → 응답 스트리밍
 *
 * 핵심 원칙:
 * - Detector 결과는 사용자에게 노출하지 않음
 * - Responder는 effectiveMode와 uiPolicy에 따라 톤 조정
 */

import { useState, useCallback, useRef } from 'react';
import { getAccessToken } from '../lib/supabase';
import {
  useEmotionHealthStore,
  selectEffectiveMode,
  selectUIPolicy
} from '../stores/emotionHealthStore';
import type { DetectorOutput } from '../services/emotionHealth/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PipelineState {
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  streamedText: string;
}

interface UsePipelineOptions {
  conversationId?: string;
  onSignalsDetected?: (output: DetectorOutput) => void;
  onResponseComplete?: (response: string) => void;
  onError?: (error: Error) => void;
}

export function useConversationPipeline(options: UsePipelineOptions = {}) {
  const { conversationId, onSignalsDetected, onResponseComplete, onError } = options;

  const effectiveMode = useEmotionHealthStore(selectEffectiveMode);
  const uiPolicy = useEmotionHealthStore(selectUIPolicy);
  const { applyDetectorSignals, canAskConfirmQuestion, recordConfirmQuestionAsked } =
    useEmotionHealthStore();

  const [state, setState] = useState<PipelineState>({
    isLoading: false,
    isStreaming: false,
    error: null,
    streamedText: '',
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Call Detector API
   */
  const callDetector = useCallback(
    async (messagesForAnalysis: Message[]): Promise<DetectorOutput | null> => {
      try {
        const token = await getAccessToken();
        if (!token) return null;

        const previousSignals = {
          emotional_level: useEmotionHealthStore.getState().emotionalLoad.level,
          cognitive_level: useEmotionHealthStore.getState().cognitiveOverload.level,
        };

        const response = await fetch(`${SUPABASE_URL}/functions/v1/emotion-detector`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            messages: messagesForAnalysis,
            previous_signals: previousSignals,
          }),
        });

        if (!response.ok) {
          console.error('Detector API error:', response.status);
          return null;
        }

        const result = await response.json();
        return result.data as DetectorOutput;
      } catch (err) {
        console.error('Detector call failed:', err);
        return null;
      }
    },
    [conversationId]
  );

  /**
   * Call Responder API (streaming)
   */
  const callResponder = useCallback(
    async (
      userMessage: string,
      previousMessages: Message[],
      shouldConfirmState: boolean
    ): Promise<void> => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/emotion-responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage,
          effective_mode: effectiveMode,
          ui_policy: {
            max_options: uiPolicy.maxOptions,
            tone: uiPolicy.tone,
            suggest_intensity: uiPolicy.suggestIntensity,
          },
          should_confirm_state: shouldConfirmState,
          previous_messages: previousMessages.slice(-6),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Responder error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      setState((prev) => ({ ...prev, isStreaming: true, streamedText: '' }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setState((prev) => ({ ...prev, streamedText: fullText }));
              }
              if (parsed.done) {
                // Streaming complete
                break;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Add assistant message to history
      if (fullText) {
        setMessages((prev) => [...prev, { role: 'assistant', content: fullText }]);
        if (onResponseComplete) {
          onResponseComplete(fullText);
        }
      }
    },
    [conversationId, effectiveMode, uiPolicy, onResponseComplete]
  );

  /**
   * Send message through pipeline
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (state.isLoading || state.isStreaming) return;

      setState({
        isLoading: true,
        isStreaming: false,
        error: null,
        streamedText: '',
      });

      try {
        // Add user message to history
        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        // Step 1: Call Detector
        const detectorOutput = await callDetector(newMessages);

        if (detectorOutput) {
          // Apply signals to store
          await applyDetectorSignals(detectorOutput);

          if (onSignalsDetected) {
            onSignalsDetected(detectorOutput);
          }
        }

        // Step 2: Determine if should confirm state
        let shouldConfirmState = false;
        if (detectorOutput?.notes?.should_confirm_state_question && canAskConfirmQuestion()) {
          shouldConfirmState = true;
          recordConfirmQuestionAsked();
        }

        // Step 3: Call Responder
        setState((prev) => ({ ...prev, isLoading: false }));
        await callResponder(userMessage, newMessages, shouldConfirmState);

        setState((prev) => ({ ...prev, isStreaming: false }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({
          isLoading: false,
          isStreaming: false,
          error: error.message,
          streamedText: '',
        });
        if (onError) {
          onError(error);
        }
      }
    },
    [
      state.isLoading,
      state.isStreaming,
      messages,
      callDetector,
      callResponder,
      applyDetectorSignals,
      canAskConfirmQuestion,
      recordConfirmQuestionAsked,
      onSignalsDetected,
      onError,
    ]
  );

  /**
   * Cancel ongoing stream
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  /**
   * Clear conversation
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setState({
      isLoading: false,
      isStreaming: false,
      error: null,
      streamedText: '',
    });
  }, []);

  return {
    // State
    messages,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    streamedText: state.streamedText,

    // Current policy (for UI)
    effectiveMode,
    uiPolicy,

    // Actions
    sendMessage,
    cancelStream,
    clearMessages,

    // Manual message management
    setMessages,
  };
}

export default useConversationPipeline;
