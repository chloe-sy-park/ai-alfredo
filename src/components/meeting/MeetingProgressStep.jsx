import React from 'react';
import { AlertCircle } from 'lucide-react';

var MeetingProgressStep = function(props) {
  var step = props.step;
  var progress = props.progress;
  var error = props.error;
  var onRetry = props.onRetry;
  var theme = props.theme;
  
  // 진행 중 상태
  if (step === 'transcribing' || step === 'analyzing') {
    return React.createElement('div', { className: 'py-12 text-center space-y-6' },
      React.createElement('div', { className: 'relative w-24 h-24 mx-auto' },
        React.createElement('div', { className: 'absolute inset-0 rounded-full border-4 border-gray-200' }),
        React.createElement('div', {
          className: 'absolute inset-0 rounded-full border-4 border-[#A996FF] border-t-transparent animate-spin',
          style: { animationDuration: '1s' }
        }),
        React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center' },
          React.createElement('span', { className: 'text-2xl' }, '🐧')
        )
      ),
      
      React.createElement('div', null,
        React.createElement('p', { className: 'text-lg font-semibold ' + theme.text },
          step === 'transcribing' ? '음성을 텍스트로 변환 중...' : '회의 내용 분석 중...'
        ),
        React.createElement('p', { className: 'text-sm ' + theme.textSecondary + ' mt-1' },
          step === 'transcribing' 
            ? '잠시만 기다려주세요' 
            : '액션 아이템과 일정을 찾고 있어요'
        )
      ),
      
      // Progress bar
      React.createElement('div', { className: 'w-full max-w-xs mx-auto' },
        React.createElement('div', { className: 'h-2 bg-gray-200 rounded-full overflow-hidden' },
          React.createElement('div', {
            className: 'h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] transition-all duration-500',
            style: { width: progress + '%' }
          })
        ),
        React.createElement('p', { className: 'text-sm ' + theme.textSecondary + ' mt-2' }, progress + '%')
      )
    );
  }
  
  // 에러 상태
  if (step === 'error') {
    return React.createElement('div', { className: 'py-12 text-center space-y-4' },
      React.createElement('div', { className: 'w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center' },
        React.createElement(AlertCircle, { className: 'w-8 h-8 text-red-500' })
      ),
      React.createElement('div', null,
        React.createElement('p', { className: 'text-lg font-semibold ' + theme.text }, '분석 중 오류가 발생했어요'),
        React.createElement('p', { className: 'text-sm ' + theme.textSecondary + ' mt-1' }, error)
      ),
      React.createElement('button', {
        onClick: onRetry,
        className: 'px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium'
      }, '다시 시도')
    );
  }
  
  return null;
};

export default MeetingProgressStep;
