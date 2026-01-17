/**
 * 음성 전사 서비스
 * Web Speech API와 Whisper API 지원
 */

// Web Speech API 타입 정의
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type SpeechProvider = 'web-speech' | 'whisper';

export interface SpeechConfig {
  provider: SpeechProvider;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  whisperApiKey?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  provider: SpeechProvider;
}

export interface SpeechServiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (result: TranscriptionResult) => void;
  onError?: (error: string) => void;
  onInterimResult?: (text: string) => void;
}

const DEFAULT_CONFIG: SpeechConfig = {
  provider: 'web-speech',
  language: 'ko-KR',
  continuous: false,
  interimResults: true,
};

/**
 * Web Speech API 지원 여부 확인
 */
export function isWebSpeechSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Web Speech API 기반 음성 인식
 */
export function createWebSpeechRecognition(
  config: Partial<SpeechConfig> = {},
  callbacks: SpeechServiceCallbacks = {}
): SpeechRecognition | null {
  if (!isWebSpeechSupported()) {
    callbacks.onError?.('Web Speech API is not supported in this browser');
    return null;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  recognition.continuous = finalConfig.continuous;
  recognition.interimResults = finalConfig.interimResults;
  recognition.lang = finalConfig.language;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    callbacks.onStart?.();
  };

  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  recognition.onerror = (event) => {
    const errorMessages: Record<string, string> = {
      'no-speech': '음성이 감지되지 않았어요',
      'audio-capture': '마이크를 찾을 수 없어요',
      'not-allowed': '마이크 권한이 필요해요',
      'network': '네트워크 오류가 발생했어요',
      'aborted': '음성 인식이 중단됐어요',
      'language-not-supported': '지원하지 않는 언어에요',
    };
    const message = errorMessages[event.error] || `음성 인식 오류: ${event.error}`;
    callbacks.onError?.(message);
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript;
        callbacks.onResult?.({
          text: transcript.trim(),
          confidence,
          isFinal: true,
          provider: 'web-speech',
        });
      } else {
        interimTranscript += transcript;
        callbacks.onInterimResult?.(interimTranscript);
      }
    }

    if (interimTranscript && !finalTranscript) {
      callbacks.onResult?.({
        text: interimTranscript,
        confidence: 0,
        isFinal: false,
        provider: 'web-speech',
      });
    }
  };

  return recognition;
}

/**
 * Whisper API 기반 음성 전사
 * 녹음된 오디오를 백엔드 API로 전송 (API 키는 서버에서 관리)
 */
export async function transcribeWithWhisper(
  audioBlob: Blob,
  _apiKey?: string, // deprecated - 서버에서 API 키 관리
  language: string = 'ko'
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('language', language);

  // 백엔드 API 호출 (API 키는 서버에서 관리)
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();

  return {
    text: data.text?.trim() || '',
    confidence: 0.95, // Whisper는 confidence를 제공하지 않으므로 높은 값 사용
    isFinal: true,
    provider: 'whisper',
  };
}

/**
 * 오디오 녹음 클래스
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType(),
      });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms마다 데이터 수집
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '마이크 접근에 실패했어요'
      );
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('녹음이 시작되지 않았어요'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, {
          type: this.getSupportedMimeType(),
        });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.onerror = () => {
        this.cleanup();
        reject(new Error('녹음 중 오류가 발생했어요'));
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }
}

/**
 * 마이크 권한 상태 확인
 */
export async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    // permissions API가 없으면 prompt로 간주
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state;
  } catch {
    return 'prompt';
  }
}

/**
 * 마이크 권한 요청
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}
