import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Camera, Mic, Send } from 'lucide-react';

/**
 * 일기 기록 모달
 * ADHD 친화적: 부담 없는 짧은 기록
 */

var PROMPTS = [
  '오늘 가장 좋았던 순간은?',
  '오늘 감사한 것 하나는?',
  '내일의 나에게 한마디?',
  '오늘 뭘 배웠나요?',
  '지금 기분을 색으로 표현하면?',
  '오늘 나를 칭찬해주세요',
];

var QUICK_TEMPLATES = [
  { emoji: '✨', text: '오늘 좋았던 것' },
  { emoji: '🙏', text: '감사한 것' },
  { emoji: '💪', text: '해낸 것' },
  { emoji: '🌱', text: '배운 것' },
  { emoji: '💭', text: '생각/고민' },
  { emoji: '🎯', text: '내일 목표' },
];

var JournalModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onSave = props.onSave;
  
  var contentState = useState('');
  var content = contentState[0];
  var setContent = contentState[1];
  
  var promptState = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  var prompt = promptState[0];
  var setPrompt = promptState[1];
  
  var selectedTemplateState = useState(null);
  var selectedTemplate = selectedTemplateState[0];
  var setSelectedTemplate = selectedTemplateState[1];
  
  if (!isOpen) return null;
  
  var handleSave = function() {
    if (!content.trim()) return;
    
    onSave({
      content: content,
      template: selectedTemplate,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('ko-KR')
    });
    
    setContent('');
    setSelectedTemplate(null);
    onClose();
  };
  
  var handleTemplateClick = function(template) {
    setSelectedTemplate(template);
    setContent(template.emoji + ' ' + template.text + '\n');
  };
  
  var shufflePrompt = function() {
    var newPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    while (newPrompt === prompt && PROMPTS.length > 1) {
      newPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    }
    setPrompt(newPrompt);
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center',
    onClick: function(e) { if (e.target === e.currentTarget) onClose(); }
  },
    // 배경
    React.createElement('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
    
    // 모달
    React.createElement('div', { 
      className: 'relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slideUp'
    },
      // 핸들
      React.createElement('div', { className: 'sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10' },
        React.createElement('div', { className: 'w-10 h-1 bg-gray-300 rounded-full' })
      ),
      
      // 헤더
      React.createElement('div', { className: 'px-6 pb-4 flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(BookOpen, { size: 20, className: 'text-purple-500' }),
          React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, '오늘의 일기')
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 rounded-full hover:bg-gray-100 transition-colors'
        }, React.createElement(X, { size: 20, className: 'text-gray-500' }))
      ),
      
      // 콘텐츠
      React.createElement('div', { className: 'px-6 pb-8' },
        // 오늘 날짜
        React.createElement('div', { className: 'text-center mb-4' },
          React.createElement('p', { className: 'text-sm text-gray-500' },
            new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })
          )
        ),
        
        // 프롬프트
        React.createElement('button', {
          onClick: shufflePrompt,
          className: 'w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 text-left hover:from-purple-100 hover:to-pink-100 transition-all'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('span', { className: 'text-2xl' }, '🐧'),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-sm text-gray-700 font-medium' }, prompt),
              React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, '탭해서 다른 질문 보기')
            )
          )
        ),
        
        // 빠른 템플릿
        React.createElement('div', { className: 'mb-4' },
          React.createElement('p', { className: 'text-xs font-medium text-gray-500 mb-2' }, '빠른 시작'),
          React.createElement('div', { className: 'flex flex-wrap gap-2' },
            QUICK_TEMPLATES.map(function(template, idx) {
              var isSelected = selectedTemplate && selectedTemplate.text === template.text;
              return React.createElement('button', {
                key: idx,
                onClick: function() { handleTemplateClick(template); },
                className: 'px-3 py-2 rounded-full text-sm transition-all flex items-center gap-1 ' +
                  (isSelected 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              },
                React.createElement('span', null, template.emoji),
                React.createElement('span', null, template.text)
              );
            })
          )
        ),
        
        // 텍스트 입력
        React.createElement('div', { className: 'mb-4' },
          React.createElement('textarea', {
            value: content,
            onChange: function(e) { setContent(e.target.value); },
            placeholder: '오늘 하루를 자유롭게 적어보세요...\n\n길게 쓰지 않아도 괜찮아요.\n한 줄이면 충분해요 💜',
            rows: 8,
            className: 'w-full px-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm resize-none leading-relaxed'
          }),
          React.createElement('div', { className: 'flex justify-between items-center mt-2' },
            React.createElement('p', { className: 'text-xs text-gray-400' },
              content.length + '자'
            ),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', {
                className: 'p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors',
                title: '사진 추가 (준비 중)'
              }, React.createElement(Camera, { size: 16 })),
              React.createElement('button', {
                className: 'p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors',
                title: '음성 입력 (준비 중)'
              }, React.createElement(Mic, { size: 16 }))
            )
          )
        ),
        
        // 알프레도 격려
        content.length > 0 && React.createElement('div', { 
          className: 'bg-gradient-to-br from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-2xl p-4 mb-4'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('span', { className: 'text-2xl' }, '🐧'),
            React.createElement('p', { className: 'text-sm text-gray-700' },
              content.length < 20 
                ? '좋아요, 짧아도 괜찮아요! 매일 조금씩 쓰는 게 중요해요.'
                : content.length < 100
                  ? '잘 쓰고 있어요! 오늘 하루가 기록으로 남네요.'
                  : '와, 오늘 많은 생각이 있으셨군요! 다 적어주셔서 고마워요. 💜'
            )
          )
        ),
        
        // 저장 버튼
        React.createElement('button', {
          onClick: handleSave,
          disabled: !content.trim(),
          className: 'w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
        },
          React.createElement(Sparkles, { size: 18 }),
          '저장하기'
        ),
        
        // 힌트
        React.createElement('p', { className: 'text-center text-xs text-gray-400 mt-4' },
          '💡 매일 조금씩 쓰면 나중에 돌아보기 좋아요'
        )
      )
    )
  );
};

export default JournalModal;
