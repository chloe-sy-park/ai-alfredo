import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  // Base styles
  var baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A996FF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles (라이트모드)
  var variantStyles = {
    primary: 'bg-[#FFD700] text-[#1A1A1A] hover:brightness-110 active:scale-95 shadow-[0_2px_4px_rgba(0,0,0,0.1)] rounded-full',
    secondary: 'bg-white text-[#1A1A1A] border border-[#E5E5E5] hover:border-[#D4D4D4] active:scale-95 rounded-full',
    ghost: 'bg-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] rounded-lg',
    icon: 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5] active:scale-95 rounded-full',
  };
  
  // Size styles
  var sizeStyles = {
    sm: 'text-sm px-4 py-2 min-h-[36px]',
    md: 'text-base px-5 py-2.5 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
  };
  
  // Icon size styles
  var iconSizeStyles = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-12 h-12',
  };
  
  var finalClassName = [
    baseStyles,
    variantStyles[variant],
    variant === 'icon' ? iconSizeStyles[size] : sizeStyles[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={finalClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      
      {children}
      
      {rightIcon && !isLoading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
}
