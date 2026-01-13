// FloatingCaptureButton - 플로팅 퀵캡처 버튼
import React from 'react';
import { Plus } from 'lucide-react';

function FloatingCaptureButton(props) {
  var onClick = props.onClick;
  
  return React.createElement('button', {
    onClick: onClick,
    className: 'fixed bottom-24 right-4 w-14 h-14 bg-[#A996FF] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#9580FF] active:scale-95 transition-all z-30',
    'aria-label': '빠른 캡처'
  },
    React.createElement(Plus, { size: 28, strokeWidth: 2.5 })
  );
}

export default FloatingCaptureButton;
