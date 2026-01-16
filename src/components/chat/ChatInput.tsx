import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, Zap, Radio } from 'lucide-react';
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
  const [showModeSelector, setShowModeSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 사용 가능한 모드 확인
  const webSpeechAvailable = isWebSpeechSupported();
  const whisperAvailable = !!OPENAI_API_KEY;
  const bothAvailable = webSpeechAvailable && whisperAvailable;

  // 사용자 선택 모드 (localStorage에 저장)
  const [userPreferredMode, setUserPreferredMode] = useState<SpeechMode>(() => {
    const saved = localStorage.getItem('speechMode');
    if (saved === 'whisper' || saved === 'web-speech') return saved;
    return preferWhisper ? 'whisper' : 'web-speech';
  });

  // 실제 사용할 모드 결정
  const speechMode: SpeechMode =
    userPreferredMode === 'whisper' && whisperAvailable ? 'whisper' :
    userPreferredMode === 'web-speech' && webSpeechAvailable ? 'web-speech' :
    whisperAvailable ? 'whisper' : 'web-speech';

  const isSpeechSupported = webSpeechAvailable || whisperAvailable;

  // 모드 변경
  const handleModeChange = (mode: SpeechMode) => {
    setUserPreferredMode(mode);
    localStorage.setItem('speechMode', mode);
    setShowModeSelector(false);
  };

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
          className="flex-1 resize-none outline-none text-sm text-text-primary placeholder:text-text-muted min-h-[44px] max-h-[200px] py-3 px-0 bg-transparent"
          rows={1}
        />

        {/* 마이크 버튼 + 모드 선택 */}
        {isSpeechSupported && (
          <div className="relative flex items-center gap-1">
            {/* 모드 선택기 팝업 */}
            {showModeSelector && bothAvailable && (
              <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-lg border border-neutral-200 p-2 min-w-[160px] z-10">
                <p className="text-xs text-neutral-500 px-2 pb-2">음성 인식 모드</p>
                <button
                  onClick={() => handleModeChange('web-speech')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    speechMode === 'web-speech' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100'
                  }`}
                >
                  <Radio size={16} />
                  <div>
                    <div className="font-medium">실시간</div>
                    <div className="text-xs text-neutral-500">Web Speech API</div>
                  </div>
                </button>
                <button
                  onClick={() => handleModeChange('whisper')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    speechMode === 'whisper' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100'
                  }`}
                >
                  <Zap size={16} />
                  <div>
                    <div className="font-medium">고품질</div>
                    <div className="text-xs text-neutral-500">Whisper AI</div>
                  </div>
                </button>
              </div>
            )}

            {/* 모드 표시 버튼 (두 모드 모두 가능할 때만) */}
            {bothAvailable && !isActive && (
              <button
                onClick={() => setShowModeSelector(!showModeSelector)}
                className="flex-shrink-0 h-10 px-2 rounded-lg flex items-center gap-1 text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
                title="음성 인식 모드 변경"
              >
                {speechMode === 'whisper' ? <Zap size={14} /> : <Radio size={14} />}
                <span className="hidden sm:inline">{speechMode === 'whisper' ? 'AI' : '실시간'}</span>
              </button>
            )}

            {/* 마이크 버튼 */}
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
          </div>
        )}

        {/* 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isActive}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            message.trim() && !disabled && !isActive
              ? 'bg-text-primary text-white hover:bg-text-secondary active:scale-95'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs text-text-muted mt-2">
        {isSpeechSupported ? `마이크로 음성 입력 • ` : ''}Shift+Enter로 줄바꿈 • Enter로 전송
      </p>
    </div>
  );
}