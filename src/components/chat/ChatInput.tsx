import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Loader2, Zap, Radio, Paperclip, Image, X } from 'lucide-react';
import { useSpeechRecognition, isWebSpeechSupported } from '../../services/speech';

// 음성 인식 모드: web-speech (실시간) 또는 whisper (녹음 후 변환)
type SpeechMode = 'web-speech' | 'whisper';

// 첨부 파일 타입
interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

interface ChatInputProps {
  onSend: (message: string, attachments?: AttachedFile[]) => void;
  placeholder?: string;
  disabled?: boolean;
  preferWhisper?: boolean;
}

export default function ChatInput({
  onSend,
  placeholder = '메시지를 입력해주세요...',
  disabled = false,
  preferWhisper = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 사용 가능한 모드 확인
  const webSpeechAvailable = isWebSpeechSupported();
  const whisperAvailable = true;
  const bothAvailable = webSpeechAvailable && whisperAvailable;

  // 사용자 선택 모드
  const [userPreferredMode, setUserPreferredMode] = useState<SpeechMode>(() => {
    const saved = localStorage.getItem('speechMode');
    if (saved === 'whisper' || saved === 'web-speech') return saved;
    return preferWhisper ? 'whisper' : 'web-speech';
  });

  const speechMode: SpeechMode =
    userPreferredMode === 'whisper' && whisperAvailable ? 'whisper' :
    userPreferredMode === 'web-speech' && webSpeechAvailable ? 'web-speech' :
    whisperAvailable ? 'whisper' : 'web-speech';

  const isSpeechSupported = webSpeechAvailable || whisperAvailable;

  const handleModeChange = (mode: SpeechMode) => {
    setUserPreferredMode(mode);
    localStorage.setItem('speechMode', mode);
    setShowModeSelector(false);
  };

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
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [message]);

  // 클립보드 이미지 붙여넣기
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          addFileAttachment(file, 'image');
        }
        break;
      }
    }
  }, []);

  // 파일 첨부 처리
  const addFileAttachment = (file: File, type: 'image' | 'document') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const attachment: AttachedFile = { id, file, type };

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        attachment.preview = e.target?.result as string;
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachments(prev => [...prev, attachment]);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      addFileAttachment(files[i], type);
    }
    e.target.value = '';
  };

  // 첨부 파일 제거
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('image/') ? 'image' : 'document';
      addFileAttachment(file, type);
    }
  };

  // 음성 입력 토글
  const handleMicClick = async () => {
    if (isActive) {
      if (speechMode === 'whisper') {
        await stopRecording();
      } else {
        stopListening();
      }
    } else {
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
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const displayPlaceholder = isActive && interimTranscript
    ? interimTranscript
    : placeholder;

  const getStatusText = () => {
    if (isRecording) return '녹음 중... (다시 눌러서 변환)';
    if (isListening) return `듣고 있어요... ${interimTranscript ? `"${interimTranscript}"` : ''}`;
    if (interimTranscript === '변환 중...') return '변환 중...';
    return null;
  };

  const statusText = getStatusText();

  return (
    <div
      className={`bg-white border-t transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-neutral-100'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 드래그 앤 드롭 오버레이 */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <p className="text-primary font-medium">파일을 여기에 놓으세요</p>
        </div>
      )}

      {/* 첨부 파일 미리보기 */}
      {attachments.length > 0 && (
        <div className="px-3 pt-3 pb-1 flex gap-2 overflow-x-auto">
          {attachments.map(att => (
            <div key={att.id} className="relative flex-shrink-0 group">
              {att.type === 'image' && att.preview ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                  <img src={att.preview} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Paperclip size={20} className="text-neutral-400" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(att.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <p className="text-[10px] text-neutral-500 truncate max-w-[64px] mt-1">
                {att.file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="px-3 pt-2 pb-3">
        {/* 음성 인식 에러/상태 */}
        {speechError && (
          <div className="text-xs text-red-500 mb-2 px-1">{speechError}</div>
        )}

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

        {/* 입력 영역 */}
        <div className="flex gap-2 items-end">
          {/* 첨부 버튼 그룹 */}
          <div className="flex gap-1 pb-1">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="이미지 첨부"
            >
              <Image size={18} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="파일 첨부"
            >
              <Paperclip size={18} />
            </button>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e, 'image')}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e, 'document')}
            className="hidden"
          />

          {/* 텍스트 입력 */}
          <div className="flex-1 bg-neutral-50 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:bg-white transition-all">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onPaste={handlePaste}
              placeholder={displayPlaceholder}
              disabled={disabled || isActive}
              className="w-full resize-none outline-none text-sm text-text-primary placeholder:text-neutral-400 min-h-[24px] max-h-[120px] bg-transparent leading-normal"
              rows={1}
            />
          </div>

          {/* 마이크 버튼 */}
          {isSpeechSupported && (
            <div className="relative flex items-center gap-1 pb-1">
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

              {bothAvailable && !isActive && (
                <button
                  onClick={() => setShowModeSelector(!showModeSelector)}
                  className="h-9 px-2 rounded-lg flex items-center gap-1 text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
                  title="음성 인식 모드 변경"
                >
                  {speechMode === 'whisper' ? <Zap size={14} /> : <Radio size={14} />}
                </button>
              )}

              <button
                onClick={handleMicClick}
                disabled={disabled}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isActive ? '음성 입력 중지' : '음성으로 입력하기'}
              >
                {isActive ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          )}

          {/* 전송 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={(!message.trim() && attachments.length === 0) || disabled || isActive}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all mb-1 ${
              (message.trim() || attachments.length > 0) && !disabled && !isActive
                ? 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-sm'
                : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
            }`}
            title={message.trim() || attachments.length > 0 ? '메시지 전송 (Enter)' : '메시지를 입력해주세요'}
          >
            <Send size={16} className={(message.trim() || attachments.length > 0) && !disabled && !isActive ? 'translate-x-[1px]' : ''} />
          </button>
        </div>

        {/* 힌트 텍스트 */}
        <p className="text-[10px] text-neutral-400 mt-1.5 px-1">
          Enter로 전송 • Shift+Enter로 줄바꿈 • Ctrl+V로 이미지 붙여넣기
        </p>
      </div>
    </div>
  );
}
