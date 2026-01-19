/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ===== AlFredo Design System v1 =====

        // Primary - Gold (유일한 Accent/CTA)
        // Lavender는 Work 서브컬러로만 사용
        primary: '#A996FF', // Work 서브컬러 (backward compat)

        // Gold - 유일한 Accent/CTA
        gold: {
          300: '#F1E7D3',
          500: '#C9A25E',
          600: '#B48D4E',
        },

        // Accent - CTA, Priority 1, 핵심 강조 (Gold 기반)
        accent: {
          DEFAULT: '#C9A25E',
          pressed: '#B48D4E',
          onAccent: '#1A140B', // 골드 버튼 위 텍스트
        },

        // Secondary - 보조 강조
        secondary: '#C8BFD9',

        // Background & Surface (라이트모드 기준)
        background: '#FAF8F4',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#FAF8F4',
          card: '#FFFFFF',
        },

        // OS Colors (구분용, 배경/CTA에 사용 금지)
        'os-work': '#4A5C73',
        'os-life': '#7E9B8A',
        'os-finance': '#8C7A5E',

        // Semantic Colors - 강도/상태 표시
        intensity: {
          light: '#4ADE80',      // Light - 초록
          normal: '#FBBF24',     // Normal - 노랑
          heavy: '#F97316',      // Heavy - 주황
          overloaded: '#EF4444', // Overloaded - 빨강
        },

        // State Colors
        state: {
          success: '#1FA97B',
          warning: '#D68B2C',
          danger: '#E04646',
          info: '#2F80ED',
        },
        success: '#1FA97B',
        warning: '#D68B2C',
        error: '#E04646',
        info: '#2F80ED',

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
          primary: '#141518',
          secondary: '#3D414A',
          tertiary: '#6B7280',
          muted: '#999999',
          disabled: '#D8D0C3',
        },

        // Border
        border: '#E6E0D6',

        // Neutral Scale (Design System v1)
        neutral: {
          0: '#FFFFFF',
          25: '#FDFCFA',
          50: '#FAF8F4',
          75: '#F7F4EE',
          100: '#F4F1EA',
          150: '#EEE8DE',
          200: '#E6E0D6',
          250: '#DCD3C5',
          300: '#D8D0C3',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#3D414A',
          800: '#141518',
          900: '#0B0C0F',
        },

        // Lavender Scale (Work 서브컬러)
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

        // ===== Token-based Colors (CSS Variables) =====
        'token-bg': {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },
        'token-surface': {
          DEFAULT: 'var(--surface-default)',
          subtle: 'var(--surface-subtle)',
        },
        'token-border': {
          DEFAULT: 'var(--border-default)',
        },
        'token-text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
        },
        'token-accent': {
          DEFAULT: 'var(--accent-primary)',
          primary: 'var(--accent-primary)',
          pressed: 'var(--accent-pressed)',
          on: 'var(--accent-on)',
        },
        'token-os': {
          work: 'var(--os-work)',
          life: 'var(--os-life)',
          finance: 'var(--os-finance)',
        },
        'token-state': {
          success: 'var(--state-success)',
          warning: 'var(--state-warning)',
          danger: 'var(--state-danger)',
          info: 'var(--state-info)',
        },
        'token-chart': {
          canvas: 'var(--chart-canvas)',
          panel: 'var(--chart-panel)',
          'grid-major': 'var(--chart-grid-major)',
          'grid-minor': 'var(--chart-grid-minor)',
          'series-neutral': 'var(--chart-series-neutral)',
          'series-work': 'var(--chart-series-work)',
          'series-life': 'var(--chart-series-life)',
          'series-finance': 'var(--chart-series-finance)',
          'emphasis-today': 'var(--chart-emphasis-today)',
        },
      },

      // Typography Scale
      fontSize: {
        'micro': ['11px', { lineHeight: '1.3' }],
        'caption': ['13px', { lineHeight: '1.4' }],
        'xs': ['10px', { lineHeight: '14px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'body': ['16px', { lineHeight: '1.55' }],
        'md': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'h2': ['20px', { lineHeight: '1.3' }],
        'xl': ['20px', { lineHeight: '28px' }],
        'h1': ['24px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        'display': ['32px', { lineHeight: '1.2' }],
        '3xl': ['32px', { lineHeight: '40px' }],
      },

      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
        kr: ['Pretendard', 'sans-serif'],
        ui: ['Pretendard', 'sans-serif'],
        number: ['Pretendard', 'sans-serif'],
        en: ['Canela', 'Georgia', 'serif'],
        body: ['var(--font-body)'],
        'heading-en': ['var(--font-heading-en)'],
        'heading-kr': ['var(--font-heading-kr)'],
        numbers: ['var(--font-numbers)'],
      },

      // Letter Spacing (tracking)
      letterSpacing: {
        'tight': '-0.01em',
        'heading': '-0.02em',
        'normal': '0em',
        'ui': '0.01em',
        'wide': '0.02em',
      },

      // Line Height (leading)
      lineHeight: {
        'tight': '1.2',
        'snug': '1.4',
        'normal': '1.5',
        'relaxed': '1.6',
        'loose': '1.8',
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
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },

      // Shadows (Design System v1)
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'focus-ring': '0 0 0 3px rgba(201, 162, 94, 0.28)',
        'sheet': '0 -4px 24px rgba(0, 0, 0, 0.12)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        // Dark mode shadows
        'card-dark': '0 2px 10px rgba(0, 0, 0, 0.22)',
        'card-hover-dark': '0 4px 14px rgba(0, 0, 0, 0.28)',
        'focus-ring-dark': '0 0 0 3px rgba(201, 162, 94, 0.22)',
      },

      // Motion - Design System v1 (150-200ms, ease-out 기반)
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '200ms',
      },

      transitionTimingFunction: {
        'DEFAULT': 'ease-out',
        'enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },

      // Allowed Animations Only
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'spin': 'spin 1s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
      }
      addUtilities(newUtilities)
    }
  ],
};
