/**
 * VoiceUploadCard
 * PRD: 회의 음성 업로드 카드
 * 음성 파일을 업로드하여 회의록을 생성
 */

import { useState, useRef } from 'react';
import { Mic, Upload, X, Loader2 } from 'lucide-react';

interface VoiceUploadCardProps {
  onUpload?: (file: File) => void;
  onTranscribe?: (audioBlob: Blob) => Promise<string>;
  onMinutesGenerated?: (minutes: MeetingMinutes) => void;
}

export interface MeetingMinutes {
  id: string;
  title: string;
  summary: string;
  decisions: string[];
  actionItems: { task: string; assignee?: string; dueDate?: string }[];
  createdAt: string;
}

export default function VoiceUploadCard({
  onUpload,
  onTranscribe,
  onMinutesGenerated
}: VoiceUploadCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 녹음 시작
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording failed:', err);
      alert('마이크 접근 권한이 필요합니다.');
    }
  }

  // 녹음 중지
  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // 파일 업로드 처리
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (onUpload) {
        onUpload(file);
      }
      processAudio(file);
    }
  }

  // 오디오 처리
  async function processAudio(audio: Blob | File) {
    setIsProcessing(true);

    try {
      // 1. 음성을 텍스트로 변환 (Whisper)
      let transcript = '';
      if (onTranscribe) {
        transcript = await onTranscribe(audio);
      } else {
        // 더미 처리
        await new Promise(resolve => setTimeout(resolve, 2000));
        transcript = '회의 내용 샘플 텍스트입니다.';
      }

      // 2. 회의록 생성 (실제 구현에서는 AI 분석)
      const minutes: MeetingMinutes = {
        id: 'minutes_' + Date.now(),
        title: uploadedFile?.name.replace(/\.[^/.]+$/, '') || '회의 녹음',
        summary: transcript || '회의 내용 요약이 여기에 표시됩니다.',
        decisions: ['결정 사항 1', '결정 사항 2'],
        actionItems: [
          { task: '후속 작업 1', assignee: '담당자' },
          { task: '후속 작업 2', dueDate: '내일' }
        ],
        createdAt: new Date().toISOString()
      };

      if (onMinutesGenerated) {
        onMinutesGenerated(minutes);
      }
    } catch (err) {
      console.error('Audio processing failed:', err);
    } finally {
      setIsProcessing(false);
      setUploadedFile(null);
    }
  }

  // 파일 삭제
  function clearFile() {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-3">
        회의 음성 → 회의록
      </h3>

      {isProcessing ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Loader2 className="w-8 h-8 text-[#A996FF] animate-spin mb-3" />
          <p className="text-sm text-[#666666] dark:text-gray-400">
            회의록 생성 중...
          </p>
          <p className="text-xs text-[#999999] dark:text-gray-500 mt-1">
            음성을 분석하고 있어요
          </p>
        </div>
      ) : uploadedFile ? (
        <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg">
          <div className="w-10 h-10 bg-[#A996FF]/20 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-[#A996FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] dark:text-white truncate">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-[#999999] dark:text-gray-400">
              {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
          >
            <X className="w-4 h-4 text-[#999999]" />
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* 녹음 버튼 */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-colors ${
              isRecording
                ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                : 'border-[#E5E5E5] dark:border-gray-600 hover:border-[#A996FF]'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#F5F5F5] dark:bg-gray-700'
            }`}>
              <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[#666666] dark:text-gray-400'}`} />
            </div>
            <span className="text-sm text-[#666666] dark:text-gray-400">
              {isRecording ? '녹음 중... 탭하여 중지' : '녹음하기'}
            </span>
          </button>

          {/* 업로드 버튼 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-[#E5E5E5] dark:border-gray-600 hover:border-[#A996FF] transition-colors"
          >
            <div className="w-10 h-10 bg-[#F5F5F5] dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#666666] dark:text-gray-400" />
            </div>
            <span className="text-sm text-[#666666] dark:text-gray-400">파일 업로드</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
