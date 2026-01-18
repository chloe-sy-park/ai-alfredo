import { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';

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
  style,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant class styles (layout only)
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'hover:brightness-110 active:scale-95 shadow-[0_2px_4px_rgba(0,0,0,0.1)] rounded-full',
    secondary: 'active:scale-95 rounded-full',
    ghost: 'rounded-lg',
    icon: 'active:scale-95 rounded-full',
  };

  // Variant inline styles using design tokens
  const variantInlineStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: 'var(--accent-on)',
    },
    secondary: {
      backgroundColor: 'var(--surface-default)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    },
    icon: {
      backgroundColor: 'var(--surface-subtle)',
      color: 'var(--text-secondary)',
    },
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-sm px-4 py-2 min-h-[36px]',
    md: 'text-base px-5 py-2.5 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
  };

  // Icon size styles
  const iconSizeStyles: Record<ButtonSize, string> = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-12 h-12',
  };

  const finalClassName = [
    baseStyles,
    variantClasses[variant],
    variant === 'icon' ? iconSizeStyles[size] : sizeStyles[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={finalClassName}
      style={{ ...variantInlineStyles[variant], ...style }}
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
