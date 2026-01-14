/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ===== AlFredo Design System v2 (Light Mode) =====
        
        // Primary - 메인 강조 (라벤더)
        primary: '#A996FF',
        
        // Accent - CTA, Priority 1, 핵심 강조 (골드)
        accent: {
          DEFAULT: '#FFD700',
          muted: '#FBBF24',
          dark: '#1A1A1A', // 골드 버튼 위 텍스트
        },
        
        // Secondary - 보조 강조
        secondary: '#C8BFD9',
        
        // Background & Surface (라이트모드 기준)
        background: '#F5F5F5',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F0F0FF', // 알프레도 메시지 배경
          card: '#FFFFFF',
        },
        
        // Semantic Colors - 강도/상태 표시
        intensity: {
          light: '#4ADE80',      // Light - 초록
          normal: '#FBBF24',     // Normal - 노랑
          heavy: '#F97316',      // Heavy - 주황
          overloaded: '#EF4444', // Overloaded - 빨강
        },
        
        // Status Colors
        success: '#4ADE80',
        warning: '#FBBF24',
        error: '#EF4444',
        info: '#60A5FA',
        
        // Source Tags
        work: {
          bg: '#EDE9FE',
          text: '#7C3AED',
          border: '#C4B5FD',
        },
        life: {
          bg: '#FCE7F3',
          text: '#DB2777',
          border: '#FBCFE8',
        },
        
        // Text Colors
        text: {
          primary: '#1A1A1A',
          secondary: '#666666',
          muted: '#999999',
        },
        
        // Border
        border: '#E5E5E5',
        
        // Neutral Scale
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Lavender Scale
        lavender: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A996FF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
      },
      
      // Typography Scale
      fontSize: {
        'xs': ['10px', { lineHeight: '14px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'md': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
      },
      
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
      },
      
      // Spacing Scale (8px base)
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      
      // Border Radius
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',     // Card default
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px', // Pill buttons
      },
      
      // Shadows
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-focus': '0 0 0 3px rgba(169, 150, 255, 0.3)',
        'gold-glow': '0 0 12px rgba(255, 215, 0, 0.4)',
        'sheet': '0 -4px 24px rgba(0, 0, 0, 0.12)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      
      // Motion (200ms 이내)
      transitionDuration: {
        'instant': '100ms',
        'fast': '150ms',
        'DEFAULT': '200ms',
        'slow': '300ms',
      },
      
      transitionTimingFunction: {
        'DEFAULT': 'ease-out',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      
      animation: {
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 150ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float-up': 'floatUp 2s ease-out forwards',
        'spin': 'spin 1s linear infinite',
      },
      
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)' },
        },
        floatUp: {
          '0%': { 
            transform: 'translateY(0) scale(0)', 
            opacity: '0' 
          },
          '10%': { 
            transform: 'translateY(-20px) scale(1)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'translateY(-150px) scale(0.5)', 
            opacity: '0' 
          },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      
      // Touch target (44px minimum)
      minHeight: {
        'touch': '44px',
        'button': '48px',
      },
      minWidth: {
        'touch': '44px',
        'button': '48px',
      },
      
      // Max width
      maxWidth: {
        'mobile': '640px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-100': {
          animationDelay: '100ms',
        },
        '.animation-delay-150': {
          animationDelay: '150ms',
        },
        '.animation-delay-200': {
          animationDelay: '200ms',
        },
        '.animation-delay-300': {
          animationDelay: '300ms',
        },
        '.animation-delay-500': {
          animationDelay: '500ms',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
