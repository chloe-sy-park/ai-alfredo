/**
 * 음성 인식 React Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createWebSpeechRecognition,
  isWebSpeechSupported,
  AudioRecorder,
  transcribeWithWhisper,
  checkMicrophonePermission,
  requestMicrophonePermission,
  SpeechProvider,
  TranscriptionResult,
} from './speechService';

export interface UseSpeechRecognitionOptions {
  provider?: SpeechProvider;
  language?: string;
  continuous?: boolean;
  whisperApiKey?: string;
  onTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface UseSpeechRecognitionResult {
  // 상태
  isListening: boolean;
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';

  // 액션
  startListening: () => Promise<void>;
  stopListening: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  cancelRecording: () => void;
  reset: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionResult {
  const {
    provider = 'web-speech',
    language = 'ko-KR',
    continuous = false,
    whisperApiKey,
    onTranscript,
    onInterimTranscript,
    onError,
  } = options;

  // 상태
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Refs
  const recognitionRef = useRef<ReturnType<typeof createWebSpeechRecognition>>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const isSupported = isWebSpeechSupported() || !!whisperApiKey;

  // 권한 상태 체크
  useEffect(() => {
    checkMicrophonePermission().then(setPermissionStatus);
  }, []);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestMicrophonePermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  // Web Speech API 리스닝 시작
  const startListening = useCallback(async () => {
    if (provider !== 'web-speech') {
      setError('Web Speech API provider가 아닙니다');
      return;
    }

    if (!isWebSpeechSupported()) {
      setError('이 브라우저에서는 음성 인식을 지원하지 않아요');
      onError?.('이 브라우저에서는 음성 인식을 지원하지 않아요');
      return;
    }

    // 권한 확인
    const permission = await checkMicrophonePermission();
    if (permission === 'denied') {
      setError('마이크 권한이 필요해요');
      onError?.('마이크 권한이 필요해요');
      return;
    }

    setError(null);
    setInterimTranscript('');

    const recognition = createWebSpeechRecognition(
      { language, continuous },
      {
        onStart: () => {
          setIsListening(true);
        },
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript('');
        },
        onResult: (result: TranscriptionResult) => {
          if (result.isFinal) {
            setTranscript(result.text);
            onTranscript?.(result.text);
            setInterimTranscript('');
          }
        },
        onInterimResult: (text: string) => {
          setInterimTranscript(text);
          onInterimTranscript?.(text);
        },
        onError: (err: string) => {
          setError(err);
          setIsListening(false);
          onError?.(err);
        },
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [provider, language, continuous, onTranscript, onInterimTranscript, onError]);

  // Web Speech API 리스닝 중지
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Whisper 녹음 시작
  const startRecording = useCallback(async () => {
    if (recorderRef.current?.isRecording()) {
      return;
    }

    // 권한 확인
    const permission = await checkMicrophonePermission();
    if (permission === 'denied') {
      setError('마이크 권한이 필요해요');
      onError?.('마이크 권한이 필요해요');
      return;
    }

    setError(null);
    setInterimTranscript('녹음 중...');

    const recorder = new AudioRecorder();
    recorderRef.current = recorder;

    try {
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '녹음 시작에 실패했어요';
      setError(message);
      onError?.(message);
      setIsRecording(false);
    }
  }, [onError]);

  // Whisper 녹음 중지 및 전사
  const stopRecording = useCallback(async (): Promise<string> => {
    if (!recorderRef.current?.isRecording()) {
      return '';
    }

    setInterimTranscript('변환 중...');

    try {
      const audioBlob = await recorderRef.current.stop();
      setIsRecording(false);

      if (!whisperApiKey) {
        throw new Error('Whisper API 키가 설정되지 않았어요');
      }

      const langCode = language.split('-')[0]; // 'ko-KR' -> 'ko'
      const result = await transcribeWithWhisper(audioBlob, whisperApiKey, langCode);

      setTranscript(result.text);
      setInterimTranscript('');
      onTranscript?.(result.text);

      return result.text;
    } catch (err) {
      const message = err instanceof Error ? err.message : '음성 변환에 실패했어요';
      setError(message);
      setInterimTranscript('');
      onError?.(message);
      setIsRecording(false);
      return '';
    } finally {
      recorderRef.current = null;
    }
  }, [whisperApiKey, language, onTranscript, onError]);

  // 녹음 취소
  const cancelRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  }, []);

  // 상태 리셋
  const reset = useCallback(() => {
    stopListening();
    cancelRecording();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stopListening, cancelRecording]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
    };
  }, []);

  return {
    isListening,
    isRecording,
    transcript,
    interimTranscript,
    error,
    isSupported,
    permissionStatus,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    requestPermission,
  };
}
