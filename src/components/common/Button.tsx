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
  var baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-fast ease-default focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  var variantStyles = {
    primary: 'bg-accent text-accent-dark hover:brightness-110 active:scale-95 shadow-button rounded-pill',
    secondary: 'bg-white text-neutral-800 border border-neutral-300 hover:border-neutral-400 active:scale-95 rounded-pill',
    ghost: 'bg-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md',
    icon: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:scale-95 rounded-full',
  };
  
  // Size styles
  var sizeStyles = {
    sm: 'text-sm px-3 py-1.5 min-h-[32px]',
    md: 'text-base px-4 py-2 min-h-touch',
    lg: 'text-md px-6 py-3 min-h-[52px]',
  };
  
  // Icon size styles
  var iconSizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
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
