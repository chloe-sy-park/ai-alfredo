import React from 'react';
import { Upload, FileAudio, FileText, Sparkles } from 'lucide-react';
import { isAudioFile, isDocumentFile, formatFileSize } from './meetingUtils';

var MeetingUploadStep = function(props) {
  var file = props.file;
  var setFile = props.setFile;
  var meetingTitle = props.meetingTitle;
  var setMeetingTitle = props.setMeetingTitle;
  var onStartAnalysis = props.onStartAnalysis;
  var onDrop = props.onDrop;
  var onDragOver = props.onDragOver;
  var onFileSelect = props.onFileSelect;
  var theme = props.theme;
  
  return React.createElement('div', { className: 'space-y-4' },
    // 회의 제목 입력
    React.createElement('div', null,
      React.createElement('label', { className: 'block text-sm font-medium mb-2 ' + theme.text }, '회의 제목 (선택)'),
      React.createElement('input', {
        type: 'text',
        value: meetingTitle,
        onChange: function(e) { setMeetingTitle(e.target.value); },
        placeholder: '예: Q4 마케팅 전략 회의',
        className: 'w-full px-4 py-3 rounded-xl border ' + theme.border + ' ' + theme.input + ' focus:outline-none focus:ring-2 focus:ring-[#A996FF]'
      })
    ),
    
    // 파일 업로드 영역
    React.createElement('div', {
      onDrop: onDrop,
      onDragOver: onDragOver,
      className: 'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ' + 
        (file ? 'border-[#A996FF] bg-[#A996FF]/5' : theme.border + ' hover:border-[#A996FF] hover:bg-[#A996FF]/5')
    },
      React.createElement('input', {
        type: 'file',
        accept: 'audio/*,.mp3,.wav,.m4a,.webm,.ogg,.txt,.md,.text',
        onChange: onFileSelect,
        className: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'
      }),
      
      file ? (
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'w-16 h-16 mx-auto rounded-2xl bg-[#A996FF]/10 flex items-center justify-center' },
            isAudioFile(file) 
              ? React.createElement(FileAudio, { className: 'w-8 h-8 text-[#A996FF]' })
              : React.createElement(FileText, { className: 'w-8 h-8 text-[#A996FF]' })
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium ' + theme.text }, file.name),
            React.createElement('p', { className: 'text-sm ' + theme.textSecondary },
              formatFileSize(file.size),
              isDocumentFile(file) && ' • 문서 파일'
            )
          ),
          React.createElement('button', {
            onClick: function(e) { e.stopPropagation(); setFile(null); },
            className: 'text-sm text-red-500 hover:underline'
          }, '파일 제거')
        )
      ) : (
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center' },
            React.createElement(Upload, { className: 'w-8 h-8 ' + theme.textSecondary })
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'font-medium ' + theme.text }, '파일 업로드'),
            React.createElement('p', { className: 'text-sm ' + theme.textSecondary }, '드래그하거나 클릭해서 선택')
          ),
          React.createElement('div', { className: 'text-xs ' + theme.textSecondary + ' space-y-1' },
            React.createElement('p', null, '🎤 음성: MP3, WAV, M4A, WebM (최대 25MB)'),
            React.createElement('p', null, '📄 문서: TXT, MD (회의록 텍스트)')
          )
        )
      )
    ),
    
    // 분석 시작 버튼
    React.createElement('button', {
      onClick: onStartAnalysis,
      disabled: !file,
      className: 'w-full py-4 rounded-xl font-semibold text-white transition-all ' + 
        (file ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] hover:opacity-90 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed')
    },
      React.createElement('span', { className: 'flex items-center justify-center gap-2' },
        React.createElement(Sparkles, { className: 'w-5 h-5' }),
        '알프레도에게 분석 요청'
      )
    )
  );
};

export default MeetingUploadStep;
