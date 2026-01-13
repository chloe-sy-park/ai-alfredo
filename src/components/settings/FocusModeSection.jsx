import React from 'react';
import { Zap } from 'lucide-react';
import { ToggleSwitch, SettingItem, SettingsCard, getThemeColors } from './settingsComponents';

const FocusModeSection = ({ darkMode, settings, setSettings }) => {
  const { divideColor } = getThemeColors(darkMode);
  
  return (
    <SettingsCard
      title="집중 모드"
      icon={<Zap size={18} className="text-[#A996FF]" />}
      darkMode={darkMode}
    >
      <div className={`divide-y ${divideColor}`}>
        <SettingItem 
          icon="⏱️" 
          title="기본 집중 시간" 
          description="25분 (포모도로)"
          darkMode={darkMode}
        >
          <span className="text-sm text-[#A996FF] font-semibold">25분</span>
        </SettingItem>
        
        <SettingItem 
          icon="☕" 
          title="휴식 시간" 
          description="집중 후 휴식"
          darkMode={darkMode}
        >
          <span className="text-sm text-[#A996FF] font-semibold">5분</span>
        </SettingItem>
        
        <SettingItem 
          icon="🔕" 
          title="집중 시 방해 금지" 
          description="알림 일시 차단"
          darkMode={darkMode}
        >
          <ToggleSwitch 
            enabled={settings.focusMode} 
            onChange={(v) => setSettings({...settings, focusMode: v})} 
            darkMode={darkMode}
          />
        </SettingItem>
      </div>
    </SettingsCard>
  );
};

export default FocusModeSection;
