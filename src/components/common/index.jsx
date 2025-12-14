import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

// === 공통 버튼 컴포넌트 ===
export const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, ghost, danger
  size = 'md', // sm, md, lg
  fullWidth = false,
  disabled = false,
  darkMode = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-xl',
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90',
    secondary: darkMode 
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: darkMode
      ? 'text-gray-300 hover:bg-gray-700'
      : 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
        font-medium transition-all duration-200
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// === 공통 카드 컴포넌트 ===
export const Card = ({ 
  children, 
  darkMode = false, 
  padding = 'md', // sm, md, lg
  className = '',
  onClick,
  hover = false,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };
  
  const bgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const shadowClass = darkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm';
  const hoverClass = hover 
    ? darkMode ? 'hover:bg-gray-750 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'
    : '';
  
  return (
    <div
      className={`
        ${bgClass}
        ${shadowClass}
        ${hoverClass}
        ${paddingClasses[padding]}
        backdrop-blur-xl rounded-xl border
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// === 공통 토글 컴포넌트 ===
export const Toggle = ({ 
  enabled, 
  onChange, 
  size = 'md', // sm, md
  disabled = false 
}) => {
  const sizeClasses = {
    sm: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-4' },
    md: { track: 'w-12 h-7', thumb: 'w-5 h-5', translate: 'translate-x-6' },
  };
  
  const s = sizeClasses[size];
  
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`
        ${s.track} rounded-full transition-all duration-200
        ${enabled ? 'bg-[#A996FF]' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={`
        ${s.thumb} bg-white rounded-full shadow-md 
        transition-transform duration-200 mt-1
        ${enabled ? s.translate : 'translate-x-1'}
      `} />
    </button>
  );
};

// === 공통 섹션 헤더 ===
export const SectionHeader = ({ 
  title, 
  icon, 
  action, 
  darkMode = false 
}) => {
  const textClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="flex items-center justify-between mb-3">
      <p className={`text-xs font-semibold ${textClass} flex items-center gap-1.5`}>
        {icon && <span>{icon}</span>}
        {title}
      </p>
      {action}
    </div>
  );
};

// === 공통 빈 상태 컴포넌트 ===
export const EmptyState = ({ 
  icon = '📭', 
  title, 
  description, 
  action,
  darkMode = false 
}) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className={`font-medium ${textPrimary}`}>{title}</p>
      {description && (
        <p className={`text-sm ${textSecondary} mt-1`}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

// === 공통 모달 컴포넌트 ===
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  darkMode = false,
  size = 'md' // sm, md, lg, full
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };
  
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`
          ${bgCard} ${sizeClasses[size]} w-full
          rounded-xl shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className={`text-lg font-bold ${textPrimary}`}>{title}</h2>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X size={20} className={textSecondary} />
            </button>
          </div>
        )}
        
        {/* 컨텐츠 */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// === 공통 페이지 헤더 컴포넌트 ===
export const PageHeader = ({ 
  title, 
  onBack, 
  rightAction, 
  darkMode = false 
}) => {
  const bgCard = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className={`${bgCard} px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10`}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className={textSecondary}>
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className={`text-lg font-bold ${textPrimary}`}>{title}</h1>
      </div>
      {rightAction}
    </div>
  );
};

// === 공통 프로그레스 바 ===
export const ProgressBar = ({ 
  value, // 0-100
  size = 'md', // sm, md, lg
  showLabel = false,
  color = 'primary' // primary, success, warning, danger
}) => {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const colorClasses = {
    primary: 'from-[#A996FF] to-[#8B7CF7]',
    success: 'from-emerald-400 to-emerald-600',
    warning: 'from-[#A996FF] to-[#EDE9FE]0',
    danger: 'from-red-400 to-red-500',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500">{Math.round(value)}%</span>
      )}
    </div>
  );
};

// === 공통 배지/태그 컴포넌트 ===
export const Badge = ({ 
  children, 
  variant = 'default', // default, primary, success, warning, danger
  size = 'md' // sm, md
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[11px]',
    md: 'px-2 py-1 text-xs',
  };
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-[#F5F3FF] text-[#A996FF]',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-[#F5F3FF] text-[#8B7CF7]',
    danger: 'bg-red-50 text-red-600',
  };
  
  return (
    <span className={`
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      rounded-full font-medium inline-flex items-center
    `}>
      {children}
    </span>
  );
};

// === 알프레도 아바타 ===
export const AlfredoAvatar = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-16 h-16 text-3xl', xl: 'w-24 h-24 text-5xl' };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center shadow-lg shadow-[#A996FF]/20 ring-2 ring-white/50 ${className}`}>
      <span>🐧</span>
    </div>
  );
};

// === 토스트 메시지 ===
export const Toast = ({ message, visible, darkMode }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-2 px-4 py-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#E5E0FF]'} rounded-xl shadow-xl border`}>
        <AlfredoAvatar size="sm" />
        <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{message}</span>
      </div>
    </div>
  );
};

// === 상태 인디케이터 ===
export const StatusIndicator = ({ status, pulse = false }) => {
  const colors = { ok: 'bg-emerald-400', warning: 'bg-[#A996FF]', urgent: 'bg-red-400' };
  return (
    <span className="relative flex w-2 h-2">
      {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />}
      <span className={`relative inline-flex rounded-full w-2 h-2 ${colors[status]}`} />
    </span>
  );
};

// === 도메인 배지 ===
export const DomainBadge = ({ domain }) => {
  const config = { 
    work: { bg: 'bg-[#EDE9FE]', text: 'text-[#7C3AED]', label: '업무' }, 
    health: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '건강' } 
  };
  const { bg, text, label } = config[domain] || config.work;
  return <span className={`${bg} ${text} text-[11px] px-2 py-0.5 rounded-full font-medium`}>{label}</span>;
};
