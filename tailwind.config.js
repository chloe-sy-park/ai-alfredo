/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Alfredo Design System v1
        
        // Primary (Lavender Purple) - 판단의 중심, 강조
        primary: '#A996FF',
        
        // Secondary (Soft Lavender) - 보조 강조, 선택 상태
        secondary: '#C8BFD9',
        
        // Background - 기본 배경
        background: '#F0EBFF',
        
        // Surface / Card
        surface: {
          light: '#FFFFFF',
          dark: '#111111'
        },
        
        // Semantic Colors - 의미 전달용
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        
        // Source Tags
        work: {
          bg: '#EDE9FE',
          text: '#7C3AED'
        },
        life: {
          bg: '#FCE7F3',
          text: '#DB2777'
        },
        
        // Neutral Scale (텍스트 대비용)
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
          900: '#171717'
        },
        
        // Legacy support
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
          900: '#4C1D95'
        }
      },
      
      // Typography Scale (px): 10/12/14/16/18/20/24/32
      fontSize: {
        'xs': ['10px', { lineHeight: '14px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'md': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }]
      },
      
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ]
      },
      
      // Spacing Scale (8px 기본 단위): 4/8/16/24/32/48
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '6': '48px'
      },
      
      // Border Radius
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
        'full': '9999px'
      },
      
      // Shadows
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'sheet': '0 -4px 24px rgba(0, 0, 0, 0.12)'
      },
      
      // Motion (200ms 이내, ease-out)
      transitionDuration: {
        'fast': '100ms',
        'normal': '200ms'
      },
      transitionTimingFunction: {
        'default': 'ease-out'
      },
      
      animation: {
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-out'
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      
      // Touch target minimum (44px)
      minHeight: {
        'touch': '44px'
      },
      minWidth: {
        'touch': '44px'
      },
      
      // Max width for mobile-first
      maxWidth: {
        'mobile': '640px'
      }
    },
  },
  plugins: [],
};
