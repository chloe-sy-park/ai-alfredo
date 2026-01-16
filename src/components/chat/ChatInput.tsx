import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition, isWebSpeechSupported } from '../../services/speech';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  placeholder = '생각을 자유롭게 적어주세요...',
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSpeechSupported = isWebSpeechSupported();

  // 음성 인식 훅
  const {
    isListening,
    interimTranscript,
    error: speechError,
    permissionStatus,
    startListening,
    stopListening,
    requestPermission,
  } = useSpeechRecognition({
    language: 'ko-KR',
    continuous: false,
    onTranscript: (text) => {
      // 음성 인식 결과를 메시지에 추가
      setMessage((prev) => (prev ? prev + ' ' + text : text));
    },
    onError: (err) => {
      console.error('Speech error:', err);
    },
  });

  // 자동 높이 조절
  useEffect(function() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // 음성 입력 토글
  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
    } else {
      if (permissionStatus === 'denied') {
        alert('마이크 권한이 차단되어 있어요. 브라우저 설정에서 권한을 허용해주세요.');
        return;
      }
      if (permissionStatus === 'prompt') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      startListening();
    }
  };
  
  function handleSubmit() {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  }
  
  function handleKeyDown(e: React.KeyboardEvent) {
    // Shift+Enter는 줄바꿈, Enter만 누르면 전송
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
  
  // 표시할 placeholder (음성 인식 중이면 interim 결과 표시)
  const displayPlaceholder = isListening && interimTranscript
    ? interimTranscript
    : placeholder;

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      {/* 음성 인식 에러 표시 */}
      {speechError && (
        <div className="text-xs text-red-500 mb-2 px-1">
          {speechError}
        </div>
      )}

      {/* 음성 인식 중 표시 */}
      {isListening && (
        <div className="flex items-center gap-2 text-xs text-primary mb-2 px-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          듣고 있어요... {interimTranscript && `"${interimTranscript}"`}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={function(e) { setMessage(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder={displayPlaceholder}
          disabled={disabled || isListening}
          className="flex-1 resize-none outline-none text-sm text-[#1A1A1A] placeholder:text-[#999999] min-h-[44px] max-h-[200px] py-3 px-0 bg-transparent"
          rows={1}
        />

        {/* 마이크 버튼 */}
        {isSpeechSupported && (
          <button
            onClick={handleMicClick}
            disabled={disabled}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? '음성 입력 중지' : '음성으로 입력하기'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        {/* 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isListening}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            message.trim() && !disabled && !isListening
              ? 'bg-[#1A1A1A] text-white hover:bg-[#333333] active:scale-95'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs text-[#999999] mt-2">
        {isSpeechSupported ? '마이크로 음성 입력 • ' : ''}Shift+Enter로 줄바꿈 • Enter로 전송
      </p>
    </div>
  );
}