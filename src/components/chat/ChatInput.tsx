import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition, isWebSpeechSupported } from '../../services/speech';

// Whisper API 키 (환경 변수에서)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// 음성 인식 모드: web-speech (실시간) 또는 whisper (녹음 후 변환)
type SpeechMode = 'web-speech' | 'whisper';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  preferWhisper?: boolean; // true면 Whisper 우선 사용
}

export default function ChatInput({
  onSend,
  placeholder = '생각을 자유롭게 적어주세요...',
  disabled = false,
  preferWhisper = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 사용할 음성 인식 모드 결정
  const webSpeechAvailable = isWebSpeechSupported();
  const whisperAvailable = !!OPENAI_API_KEY;

  const speechMode: SpeechMode =
    preferWhisper && whisperAvailable ? 'whisper' :
    webSpeechAvailable ? 'web-speech' :
    whisperAvailable ? 'whisper' : 'web-speech';

  const isSpeechSupported = webSpeechAvailable || whisperAvailable;

  // 음성 인식 훅
  const {
    isListening,
    isRecording,
    interimTranscript,
    error: speechError,
    permissionStatus,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    requestPermission,
  } = useSpeechRecognition({
    provider: speechMode,
    language: 'ko-KR',
    continuous: false,
    whisperApiKey: OPENAI_API_KEY,
    onTranscript: (text) => {
      setMessage((prev) => (prev ? prev + ' ' + text : text));
    },
    onError: (err) => {
      console.error('Speech error:', err);
    },
  });

  const isActive = isListening || isRecording;

  // 자동 높이 조절
  useEffect(function() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // 음성 입력 토글
  const handleMicClick = async () => {
    if (isActive) {
      // 중지
      if (speechMode === 'whisper') {
        await stopRecording();
      } else {
        stopListening();
      }
    } else {
      // 시작
      if (permissionStatus === 'denied') {
        alert('마이크 권한이 차단되어 있어요. 브라우저 설정에서 권한을 허용해주세요.');
        return;
      }
      if (permissionStatus === 'prompt') {
        const granted = await requestPermission();
        if (!granted) return;
      }

      if (speechMode === 'whisper') {
        await startRecording();
      } else {
        startListening();
      }
    }
  };

  function handleSubmit() {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const displayPlaceholder = isActive && interimTranscript
    ? interimTranscript
    : placeholder;

  // 상태 텍스트
  const getStatusText = () => {
    if (isRecording) return '녹음 중... (다시 눌러서 변환)';
    if (isListening) return `듣고 있어요... ${interimTranscript ? `"${interimTranscript}"` : ''}`;
    if (interimTranscript === '변환 중...') return '변환 중...';
    return null;
  };

  const statusText = getStatusText();

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      {/* 음성 인식 에러 표시 */}
      {speechError && (
        <div className="text-xs text-red-500 mb-2 px-1">
          {speechError}
        </div>
      )}

      {/* 음성 인식 상태 표시 */}
      {statusText && (
        <div className="flex items-center gap-2 text-xs text-primary mb-2 px-1">
          {interimTranscript === '변환 중...' ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          {statusText}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={function(e) { setMessage(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder={displayPlaceholder}
          disabled={disabled || isActive}
          className="flex-1 resize-none outline-none text-sm text-[#1A1A1A] placeholder:text-[#999999] min-h-[44px] max-h-[200px] py-3 px-0 bg-transparent"
          rows={1}
        />

        {/* 마이크 버튼 */}
        {isSpeechSupported && (
          <button
            onClick={handleMicClick}
            disabled={disabled}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isActive
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isActive ? '음성 입력 중지' : `음성으로 입력하기 (${speechMode === 'whisper' ? 'Whisper' : 'Web Speech'})`}
          >
            {isActive ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        {/* 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isActive}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            message.trim() && !disabled && !isActive
              ? 'bg-[#1A1A1A] text-white hover:bg-[#333333] active:scale-95'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs text-[#999999] mt-2">
        {isSpeechSupported ? `마이크로 음성 입력${whisperAvailable ? ' (Whisper)' : ''} • ` : ''}Shift+Enter로 줄바꿈 • Enter로 전송
      </p>
    </div>
  );
}