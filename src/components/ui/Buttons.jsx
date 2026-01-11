import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * 🎯 ADHD 친화적 버튼 컴포넌트
 * 
 * 디자인 원칙:
 * - 최소 터치 영역 48x48px (WCAG 권장)
 * - 충분한 패딩으로 실수 클릭 방지
 * - 명확한 시각적 피드백
 * - 간결하고 읽기 쉬운 텍스트
 */

// 기본 버튼 스타일
var BASE_STYLES = {
  // 공통
  base: 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 select-none active:scale-[0.98]',
  
  // 사이즈 (ADHD 친화적 - 충분히 크게)
  size: {
    sm: 'min-h-[40px] px-4 py-2 text-sm',      // 작아도 40px
    md: 'min-h-[48px] px-5 py-3 text-base',    // 기본 48px
    lg: 'min-h-[56px] px-6 py-4 text-lg',      // 큰 버튼 56px
    xl: 'min-h-[64px] px-8 py-5 text-xl',      // 아주 큰 버튼 64px
  },
  
  // 색상 변형
  variant: {
    primary: 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-50 active:bg-purple-100',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700',
    soft: 'bg-purple-50 text-purple-600 hover:bg-purple-100 active:bg-purple-200',
  },
  
  // 상태
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  loading: 'cursor-wait',
  fullWidth: 'w-full',
};

// 🎯 메인 버튼 컴포넌트
export var Button = function(props) {
  var children = props.children;
  var size = props.size || 'md';
  var variant = props.variant || 'primary';
  var disabled = props.disabled || false;
  var loading = props.loading || false;
  var fullWidth = props.fullWidth || false;
  var leftIcon = props.leftIcon;
  var rightIcon = props.rightIcon;
  var className = props.className || '';
  var onClick = props.onClick;
  var type = props.type || 'button';
  
  var classes = [
    BASE_STYLES.base,
    BASE_STYLES.size[size],
    BASE_STYLES.variant[variant],
    disabled && BASE_STYLES.disabled,
    loading && BASE_STYLES.loading,
    fullWidth && BASE_STYLES.fullWidth,
    className
  ].filter(Boolean).join(' ');
  
  return React.createElement('button', {
    type: type,
    className: classes,
    onClick: onClick,
    disabled: disabled || loading
  },
    loading && React.createElement(Loader2, { 
      size: size === 'sm' ? 16 : size === 'lg' || size === 'xl' ? 24 : 20,
      className: 'animate-spin'
    }),
    !loading && leftIcon,
    children,
    !loading && rightIcon
  );
};

// 🔘 아이콘 버튼 (정사각형, 터치 영역 확보)
export var IconButton = function(props) {
  var icon = props.icon;
  var size = props.size || 'md';
  var variant = props.variant || 'ghost';
  var disabled = props.disabled || false;
  var loading = props.loading || false;
  var className = props.className || '';
  var onClick = props.onClick;
  var ariaLabel = props.ariaLabel || props['aria-label'];
  
  // 아이콘 버튼 사이즈 (정사각형)
  var iconSizes = {
    sm: 'w-10 h-10',   // 40px
    md: 'w-12 h-12',   // 48px
    lg: 'w-14 h-14',   // 56px
  };
  
  var classes = [
    BASE_STYLES.base,
    iconSizes[size],
    BASE_STYLES.variant[variant],
    disabled && BASE_STYLES.disabled,
    loading && BASE_STYLES.loading,
    'p-0', // 패딩 리셋
    className
  ].filter(Boolean).join(' ');
  
  return React.createElement('button', {
    type: 'button',
    className: classes,
    onClick: onClick,
    disabled: disabled || loading,
    'aria-label': ariaLabel
  },
    loading 
      ? React.createElement(Loader2, { 
          size: size === 'sm' ? 18 : size === 'lg' ? 26 : 22,
          className: 'animate-spin'
        })
      : icon
  );
};

// 🎴 카드 버튼 (큰 터치 영역 + 콘텐츠)
export var CardButton = function(props) {
  var children = props.children;
  var onClick = props.onClick;
  var disabled = props.disabled || false;
  var selected = props.selected || false;
  var className = props.className || '';
  
  var classes = [
    'w-full min-h-[64px] p-4 rounded-2xl border-2 transition-all duration-200',
    'flex items-center gap-3 text-left',
    'active:scale-[0.99]',
    selected 
      ? 'border-purple-500 bg-purple-50' 
      : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50',
    disabled && BASE_STYLES.disabled,
    className
  ].filter(Boolean).join(' ');
  
  return React.createElement('button', {
    type: 'button',
    className: classes,
    onClick: onClick,
    disabled: disabled
  }, children);
};

// ✅ 체크박스 버튼 (ADHD 친화적 큰 터치 영역)
export var CheckButton = function(props) {
  var checked = props.checked || false;
  var onChange = props.onChange;
  var label = props.label;
  var emoji = props.emoji;
  var disabled = props.disabled || false;
  var className = props.className || '';
  
  return React.createElement('button', {
    type: 'button',
    className: [
      'w-full min-h-[56px] px-4 py-3 rounded-xl transition-all duration-200',
      'flex items-center gap-3 text-left',
      'active:scale-[0.99]',
      checked 
        ? 'bg-green-50 border-2 border-green-400' 
        : 'bg-gray-50 border-2 border-transparent hover:border-gray-200',
      disabled && BASE_STYLES.disabled,
      className
    ].filter(Boolean).join(' '),
    onClick: function() { if (onChange) onChange(!checked); },
    disabled: disabled
  },
    // 체크박스
    React.createElement('div', {
      className: [
        'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0',
        'transition-all duration-200',
        checked 
          ? 'bg-green-500 border-green-500' 
          : 'bg-white border-gray-300'
      ].join(' ')
    },
      checked && React.createElement('svg', {
        className: 'w-4 h-4 text-white',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 3,
          d: 'M5 13l4 4L19 7'
        })
      )
    ),
    
    // 이모지 (있으면)
    emoji && React.createElement('span', { className: 'text-xl flex-shrink-0' }, emoji),
    
    // 라벨
    React.createElement('span', {
      className: [
        'flex-1 font-medium',
        checked ? 'text-green-700' : 'text-gray-700'
      ].join(' ')
    }, label)
  );
};

// 🏷️ 태그/칩 버튼
export var ChipButton = function(props) {
  var children = props.children;
  var selected = props.selected || false;
  var onClick = props.onClick;
  var disabled = props.disabled || false;
  var emoji = props.emoji;
  var className = props.className || '';
  
  return React.createElement('button', {
    type: 'button',
    className: [
      'min-h-[44px] px-4 py-2 rounded-full transition-all duration-200',
      'flex items-center gap-2 text-sm font-medium',
      'active:scale-[0.97]',
      selected
        ? 'bg-purple-500 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      disabled && BASE_STYLES.disabled,
      className
    ].filter(Boolean).join(' '),
    onClick: onClick,
    disabled: disabled
  },
    emoji && React.createElement('span', null, emoji),
    children
  );
};

// 📱 플로팅 액션 버튼 (FAB)
export var FloatingButton = function(props) {
  var icon = props.icon;
  var onClick = props.onClick;
  var position = props.position || 'bottom-right'; // bottom-right, bottom-left, bottom-center
  var label = props.label;
  var className = props.className || '';
  
  var positionClasses = {
    'bottom-right': 'right-4 bottom-24',
    'bottom-left': 'left-4 bottom-24',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-24',
  };
  
  return React.createElement('button', {
    type: 'button',
    className: [
      'fixed z-40',
      positionClasses[position],
      'min-w-[56px] h-14 px-4 rounded-full',
      'bg-purple-500 text-white shadow-lg',
      'hover:bg-purple-600 active:bg-purple-700',
      'transition-all duration-200 active:scale-95',
      'flex items-center justify-center gap-2',
      className
    ].join(' '),
    onClick: onClick
  },
    icon,
    label && React.createElement('span', { className: 'font-medium' }, label)
  );
};

// 🎯 이모지 선택 버튼 그룹 (컨디션 등)
export var EmojiButtonGroup = function(props) {
  var options = props.options || []; // [{ value, emoji, label }]
  var value = props.value;
  var onChange = props.onChange;
  var size = props.size || 'md';
  var className = props.className || '';
  
  var buttonSizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };
  
  return React.createElement('div', {
    className: 'flex justify-center gap-2 ' + className
  },
    options.map(function(option) {
      var isSelected = value === option.value;
      return React.createElement('button', {
        key: option.value,
        type: 'button',
        className: [
          buttonSizes[size],
          'rounded-xl transition-all duration-200',
          'flex items-center justify-center',
          'active:scale-95',
          isSelected
            ? 'bg-purple-100 border-2 border-purple-400 scale-110'
            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
        ].join(' '),
        onClick: function() { if (onChange) onChange(option.value); },
        title: option.label
      }, option.emoji);
    })
  );
};

// Default export
export default {
  Button: Button,
  IconButton: IconButton,
  CardButton: CardButton,
  CheckButton: CheckButton,
  ChipButton: ChipButton,
  FloatingButton: FloatingButton,
  EmojiButtonGroup: EmojiButtonGroup
};
