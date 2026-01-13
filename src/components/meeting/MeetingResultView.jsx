import React from 'react';
import { 
  FileAudio, FileText, Download, MessageSquare, CheckSquare,
  Calendar, Lightbulb, ChevronDown, ChevronUp, Clock,
  CheckCircle2, Plus, Loader2
} from 'lucide-react';
import { downloadTranscript, downloadMeetingNotes } from './meetingUtils';

var MeetingResultView = function(props) {
  var analysis = props.analysis;
  var transcript = props.transcript;
  var meetingTitle = props.meetingTitle;
  var detectedLanguage = props.detectedLanguage;
  var expandedSections = props.expandedSections;
  var toggleSection = props.toggleSection;
  var selectedItems = props.selectedItems;
  var toggleSelection = props.toggleSelection;
  var addToGoogleCalendar = props.addToGoogleCalendar;
  var setAddToGoogleCalendar = props.setAddToGoogleCalendar;
  var isGoogleSignedIn = props.isGoogleSignedIn;
  var isGoogleLoading = props.isGoogleLoading;
  var googleUser = props.googleUser;
  var googleSignIn = props.googleSignIn;
  var isAddingToGoogle = props.isAddingToGoogle;
  var onAddSelectedItems = props.onAddSelectedItems;
  var onClose = props.onClose;
  var theme = props.theme;
  var darkMode = props.darkMode;
  
  var handleDownloadTranscript = function() {
    downloadTranscript(transcript, meetingTitle);
  };
  
  var handleDownloadMeetingNotes = function() {
    downloadMeetingNotes(analysis, transcript, meetingTitle);
  };
  
  var isForeignLanguage = detectedLanguage && !['ko', 'korean'].includes(detectedLanguage.toLowerCase());
  
  var getLanguageLabel = function(lang) {
    if (lang === 'en') return '영어';
    if (lang === 'ja') return '일본어';
    if (lang === 'zh') return '중국어';
    return lang ? lang.toUpperCase() : '';
  };

  return React.createElement('div', { className: 'space-y-4' },
    // 다운로드 버튼 영역
    React.createElement('div', { className: 'flex gap-2' },
      React.createElement('button', {
        onClick: handleDownloadTranscript,
        className: 'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border ' + theme.border + ' ' + theme.card + ' hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
      },
        React.createElement(FileText, { className: 'w-4 h-4 text-[#A996FF]' }),
        React.createElement('span', { className: 'text-sm font-medium ' + theme.text }, '원문 다운로드')
      ),
      React.createElement('button', {
        onClick: handleDownloadMeetingNotes,
        className: 'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90 transition-colors'
      },
        React.createElement(Download, { className: 'w-4 h-4' }),
        React.createElement('span', { className: 'text-sm font-medium' }, '회의록 다운로드')
      )
    ),
    
    // 원문 텍스트
    React.createElement('div', { className: 'rounded-xl border ' + theme.border + ' overflow-hidden' },
      React.createElement('button', {
        onClick: function() { toggleSection('transcript'); },
        className: 'w-full flex items-center justify-between p-4 ' + theme.card
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(FileAudio, { className: 'w-5 h-5 text-[#A996FF]' }),
          React.createElement('span', { className: 'font-semibold ' + theme.text }, '원문 텍스트'),
          isForeignLanguage && React.createElement('span', { className: 'px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600' }, getLanguageLabel(detectedLanguage))
        ),
        expandedSections.transcript ? React.createElement(ChevronUp, { className: 'w-5 h-5' }) : React.createElement(ChevronDown, { className: 'w-5 h-5' })
      ),
      expandedSections.transcript && React.createElement('div', { className: 'border-t ' + theme.border },
        React.createElement('div', { className: 'p-4 ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
          React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
            React.createElement('span', { className: 'text-xs font-medium ' + theme.textSecondary }, isForeignLanguage ? '📝 원문' : '📝 텍스트')
          ),
          React.createElement('p', { className: theme.text + ' leading-relaxed text-sm whitespace-pre-wrap' }, transcript)
        ),
        isForeignLanguage && analysis.translatedTranscript && React.createElement('div', { className: 'p-4 border-t ' + theme.border + ' ' + (darkMode ? 'bg-gray-800' : 'bg-white') },
          React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
            React.createElement('span', { className: 'text-xs font-medium text-[#A996FF]' }, '🇰🇷 한국어 번역')
          ),
          React.createElement('p', { className: theme.text + ' leading-relaxed text-sm whitespace-pre-wrap' }, analysis.translatedTranscript)
        )
      )
    ),
    
    // 요약
    React.createElement('div', { className: 'rounded-xl border ' + theme.border + ' overflow-hidden' },
      React.createElement('button', {
        onClick: function() { toggleSection('summary'); },
        className: 'w-full flex items-center justify-between p-4 ' + theme.card
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(MessageSquare, { className: 'w-5 h-5 text-[#A996FF]' }),
          React.createElement('span', { className: 'font-semibold ' + theme.text }, '요약')
        ),
        expandedSections.summary ? React.createElement(ChevronUp, { className: 'w-5 h-5' }) : React.createElement(ChevronDown, { className: 'w-5 h-5' })
      ),
      expandedSections.summary && React.createElement('div', { className: 'p-4 border-t ' + theme.border + ' ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
        React.createElement('p', { className: theme.text + ' leading-relaxed' }, analysis.summary),
        analysis.keyPoints && analysis.keyPoints.length > 0 && React.createElement('ul', { className: 'mt-3 space-y-1 ' + theme.textSecondary + ' text-sm' },
          analysis.keyPoints.map(function(point, i) {
            return React.createElement('li', { key: i, className: 'flex items-start gap-2' },
              React.createElement('span', { className: 'text-[#A996FF]' }, '•'),
              point
            );
          })
        )
      )
    ),
    
    // 액션 아이템
    analysis.actionItems && analysis.actionItems.length > 0 && React.createElement('div', { className: 'rounded-xl border ' + theme.border + ' overflow-hidden' },
      React.createElement('button', {
        onClick: function() { toggleSection('actions'); },
        className: 'w-full flex items-center justify-between p-4 ' + theme.card
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(CheckSquare, { className: 'w-5 h-5 text-emerald-500' }),
          React.createElement('span', { className: 'font-semibold ' + theme.text }, '액션 아이템'),
          React.createElement('span', { className: 'px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-600' }, analysis.actionItems.length)
        ),
        expandedSections.actions ? React.createElement(ChevronUp, { className: 'w-5 h-5' }) : React.createElement(ChevronDown, { className: 'w-5 h-5' })
      ),
      expandedSections.actions && React.createElement('div', { className: 'border-t ' + theme.border },
        analysis.actionItems.map(function(item, i) {
          var isSelected = selectedItems.tasks.includes(i);
          return React.createElement('div', {
            key: i,
            onClick: function() { toggleSelection('tasks', i); },
            className: 'flex items-start gap-3 p-4 cursor-pointer transition-colors ' + 
              (isSelected ? (darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')) +
              (i > 0 ? ' border-t ' + theme.border : '')
          },
            React.createElement('div', {
              className: 'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ' +
                (isSelected ? 'bg-emerald-500 border-emerald-500' : theme.border)
            },
              isSelected && React.createElement(CheckCircle2, { className: 'w-3 h-3 text-white' })
            ),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', { className: 'font-medium ' + theme.text }, item.task),
              React.createElement('div', { className: 'flex items-center gap-3 mt-1 text-sm ' + theme.textSecondary },
                item.assignee && React.createElement('span', null, '👤 ' + item.assignee),
                item.deadline && React.createElement('span', null, '📅 ' + item.deadline),
                item.priority && React.createElement('span', {
                  className: 'px-2 py-0.5 rounded-full text-xs ' +
                    (item.priority === 'high' ? 'bg-red-100 text-red-600' : 
                     item.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600')
                }, item.priority === 'high' ? '높음' : item.priority === 'medium' ? '중간' : '낮음')
              )
            )
          );
        })
      )
    ),
    
    // 일정
    analysis.schedules && analysis.schedules.length > 0 && React.createElement('div', { className: 'rounded-xl border ' + theme.border + ' overflow-hidden' },
      React.createElement('button', {
        onClick: function() { toggleSection('schedules'); },
        className: 'w-full flex items-center justify-between p-4 ' + theme.card
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Calendar, { className: 'w-5 h-5 text-blue-500' }),
          React.createElement('span', { className: 'font-semibold ' + theme.text }, '일정'),
          React.createElement('span', { className: 'px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600' }, analysis.schedules.length)
        ),
        expandedSections.schedules ? React.createElement(ChevronUp, { className: 'w-5 h-5' }) : React.createElement(ChevronDown, { className: 'w-5 h-5' })
      ),
      expandedSections.schedules && React.createElement('div', { className: 'border-t ' + theme.border },
        analysis.schedules.map(function(item, i) {
          var isSelected = selectedItems.events.includes(i);
          return React.createElement('div', {
            key: i,
            onClick: function() { toggleSelection('events', i); },
            className: 'flex items-start gap-3 p-4 cursor-pointer transition-colors ' +
              (isSelected ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')) +
              (i > 0 ? ' border-t ' + theme.border : '')
          },
            React.createElement('div', {
              className: 'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ' +
                (isSelected ? 'bg-blue-500 border-blue-500' : theme.border)
            },
              isSelected && React.createElement(CheckCircle2, { className: 'w-3 h-3 text-white' })
            ),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('p', { className: 'font-medium ' + theme.text }, item.title),
              React.createElement('div', { className: 'flex items-center gap-2 mt-1 text-sm ' + theme.textSecondary },
                React.createElement(Clock, { className: 'w-4 h-4' }),
                item.date + (item.time ? ' ' + item.time : '')
              )
            )
          );
        })
      )
    ),
    
    // 아이디어
    analysis.ideas && analysis.ideas.length > 0 && React.createElement('div', { className: 'rounded-xl border ' + theme.border + ' overflow-hidden' },
      React.createElement('button', {
        onClick: function() { toggleSection('ideas'); },
        className: 'w-full flex items-center justify-between p-4 ' + theme.card
      },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Lightbulb, { className: 'w-5 h-5 text-yellow-500' }),
          React.createElement('span', { className: 'font-semibold ' + theme.text }, '아이디어'),
          React.createElement('span', { className: 'px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600' }, analysis.ideas.length)
        ),
        expandedSections.ideas ? React.createElement(ChevronUp, { className: 'w-5 h-5' }) : React.createElement(ChevronDown, { className: 'w-5 h-5' })
      ),
      expandedSections.ideas && React.createElement('div', { className: 'border-t ' + theme.border },
        analysis.ideas.map(function(idea, i) {
          var isSelected = selectedItems.ideas.includes(i);
          return React.createElement('div', {
            key: i,
            onClick: function() { toggleSelection('ideas', i); },
            className: 'flex items-start gap-3 p-4 cursor-pointer transition-colors ' +
              (isSelected ? (darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')) +
              (i > 0 ? ' border-t ' + theme.border : '')
          },
            React.createElement('div', {
              className: 'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ' +
                (isSelected ? 'bg-yellow-500 border-yellow-500' : theme.border)
            },
              isSelected && React.createElement(CheckCircle2, { className: 'w-3 h-3 text-white' })
            ),
            React.createElement('p', { className: theme.text }, idea)
          );
        })
      )
    )
  );
};

export var MeetingResultFooter = function(props) {
  var selectedItems = props.selectedItems;
  var addToGoogleCalendar = props.addToGoogleCalendar;
  var setAddToGoogleCalendar = props.setAddToGoogleCalendar;
  var isGoogleSignedIn = props.isGoogleSignedIn;
  var isGoogleLoading = props.isGoogleLoading;
  var googleUser = props.googleUser;
  var googleSignIn = props.googleSignIn;
  var isAddingToGoogle = props.isAddingToGoogle;
  var onAddSelectedItems = props.onAddSelectedItems;
  var onClose = props.onClose;
  var theme = props.theme;
  var darkMode = props.darkMode;
  
  return React.createElement('div', { className: 'p-4 border-t ' + theme.border + ' ' + theme.card },
    React.createElement('div', { className: 'flex items-center justify-between mb-3 text-sm ' + theme.textSecondary },
      React.createElement('span', null,
        '선택됨: 태스크 ' + selectedItems.tasks.length + '개, 일정 ' + selectedItems.events.length + '개, 아이디어 ' + selectedItems.ideas.length + '개'
      )
    ),
    
    // Google Calendar 연동 옵션
    selectedItems.events.length > 0 && React.createElement('div', { className: 'mb-4 p-3 rounded-xl border ' + theme.border + ' ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
      isGoogleLoading ? React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-500' },
        React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }),
        'Google 연결 확인 중...'
      ) : isGoogleSignedIn ? React.createElement('label', { className: 'flex items-center gap-3 cursor-pointer' },
        React.createElement('input', {
          type: 'checkbox',
          checked: addToGoogleCalendar,
          onChange: function(e) { setAddToGoogleCalendar(e.target.checked); },
          className: 'w-5 h-5 rounded border-gray-300 text-[#A996FF] focus:ring-[#A996FF]'
        }),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'text-sm ' + theme.text }, 'Google Calendar에도 추가'),
          googleUser && React.createElement('span', { className: 'text-xs text-gray-400' }, '(' + googleUser.email + ')')
        )
      ) : React.createElement('button', {
        onClick: googleSignIn,
        className: 'flex items-center gap-2 text-sm text-[#A996FF] hover:underline'
      }, 'Google 계정 연결하기')
    ),
    
    React.createElement('div', { className: 'flex gap-3' },
      React.createElement('button', {
        onClick: onClose,
        className: 'flex-1 py-3 rounded-xl font-medium ' + (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700')
      }, '나중에'),
      React.createElement('button', {
        onClick: onAddSelectedItems,
        disabled: isAddingToGoogle,
        className: 'flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] disabled:opacity-50'
      },
        React.createElement('span', { className: 'flex items-center justify-center gap-2' },
          isAddingToGoogle ? React.createElement(Loader2, { className: 'w-5 h-5 animate-spin' }) : React.createElement(Plus, { className: 'w-5 h-5' }),
          isAddingToGoogle ? '추가 중...' : '추가하기'
        )
      )
    )
  );
};

export default MeetingResultView;
