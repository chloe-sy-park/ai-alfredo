// === Design System ===

export const COLORS = {
  // Primary
  primary: '#A996FF',
  primaryDark: '#8B7CF7',
  primaryLight: '#C4B5FD',
  
  // Background
  bgLight: '#F8F7FF',
  bgDark: '#111827', // gray-900
  
  // Card
  cardLight: '#FFFFFF',
  cardDark: '#1F2937', // gray-800
  
  // Text
  textLight: '#1F2937', // gray-800
  textDark: '#F9FAFB', // gray-50
  textSecondaryLight: '#6B7280', // gray-500
  textSecondaryDark: '#9CA3AF', // gray-400
  
  // Status
  success: '#10B981', // emerald-500
  warning: '#A996FF', // lavender
  error: '#EF4444', // red-500
  info: '#A996FF', // lavender
  
  // Accent
  mint: '#34D399',
  coral: '#FB7185',
  sunset: '#F59E0B',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
};

// 공통 스타일 헬퍼
export const getThemeStyles = (darkMode) => ({
  // 배경
  bgPage: darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]',
  bgCard: darkMode ? 'bg-gray-800' : 'bg-white',
  bgCardHover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
  bgInput: darkMode ? 'bg-gray-700' : 'bg-gray-50',
  bgAccent: darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]',
  
  // 텍스트
  textPrimary: darkMode ? 'text-white' : 'text-gray-800',
  textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
  textTertiary: darkMode ? 'text-gray-500' : 'text-gray-400',
  
  // 테두리
  border: darkMode ? 'border-gray-700' : 'border-gray-100',
  borderStrong: darkMode ? 'border-gray-600' : 'border-gray-200',
  
  // 그림자
  shadow: darkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm',
  shadowStrong: darkMode ? 'shadow-xl shadow-black/30' : 'shadow-lg',
  
  // 분리선
  divide: darkMode ? 'divide-gray-700' : 'divide-gray-100',
});

// 공통 버튼 스타일
export const BUTTON_STYLES = {
  primary: 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90 active:scale-95',
  secondary: (darkMode) => darkMode 
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:scale-95' 
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95',
  ghost: (darkMode) => darkMode
    ? 'text-gray-300 hover:bg-gray-700 active:scale-95'
    : 'text-gray-600 hover:bg-gray-100 active:scale-95',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
};

// 공통 카드 스타일
export const CARD_STYLES = (darkMode) => `
  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
  backdrop-blur-xl rounded-xl border
  ${darkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm'}
`;

// 공통 입력 스타일
export const INPUT_STYLES = (darkMode) => `
  ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400'}
  rounded-xl border px-4 py-3 w-full
  focus:outline-none focus:ring-2 focus:ring-[#A996FF] focus:border-transparent
  transition-all duration-200
`;
