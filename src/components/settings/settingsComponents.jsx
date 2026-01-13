import React from 'react';

// 토글 스위치 컴포넌트
export const ToggleSwitch = ({ enabled, onChange, disabled, darkMode }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`w-12 h-7 rounded-full transition-all duration-200 ${
      enabled ? 'bg-[#A996FF]' : (darkMode ? 'bg-gray-600' : 'bg-gray-200')
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
      enabled ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

// 설정 아이템 컴포넌트
export const SettingItem = ({ icon, title, description, children, darkMode }) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]'} flex items-center justify-center text-lg`}>
          {icon}
        </div>
        <div>
          <p className={`font-semibold ${textPrimary}`}>{title}</p>
          {description && <p className={`text-xs ${textSecondary} mt-0.5`}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

// 섹션 카드 컴포넌트
export const SettingsCard = ({ title, icon, children, darkMode }) => {
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white/70';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  
  return (
    <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
      {title && (
        <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// 테마 색상 헬퍼
export const getThemeColors = (darkMode) => ({
  bgColor: darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]',
  cardBg: darkMode ? 'bg-gray-800' : 'bg-white/70',
  textPrimary: darkMode ? 'text-white' : 'text-gray-800',
  textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
  borderColor: darkMode ? 'border-gray-700' : 'border-gray-200',
  divideColor: darkMode ? 'divide-gray-700' : 'divide-gray-100',
});
