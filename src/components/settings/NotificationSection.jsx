import React from 'react';
import { Bell, BellRing, BellOff, Check } from 'lucide-react';
import { ToggleSwitch, SettingItem, SettingsCard, getThemeColors } from './settingsComponents';

const NotificationSection = ({ 
  darkMode, 
  settings, 
  setSettings,
  pushNotifications 
}) => {
  const { textPrimary, textSecondary, divideColor } = getThemeColors(darkMode);
  const { isSupported, permission, requestPermission, sendAlfredoMessage } = pushNotifications;
  
  const handleRequestNotificationPermission = async () => {
    const result = await requestPermission();
    if (result === 'denied') {
      alert('알림이 차단되었어요. 브라우저 설정에서 알림을 허용해주세요.');
    }
  };
  
  return (
    <SettingsCard 
      title="알림" 
      icon={<Bell size={18} className="text-[#A996FF]" />}
      darkMode={darkMode}
    >
      <div className={`divide-y ${divideColor}`}>
        {/* 푸시 알림 권한 */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]'} flex items-center justify-center`}>
                {permission === 'granted' ? (
                  <BellRing size={20} className="text-emerald-500" />
                ) : permission === 'denied' ? (
                  <BellOff size={20} className="text-red-400" />
                ) : (
                  <Bell size={20} className="text-[#A996FF]" />
                )}
              </div>
              <div>
                <p className={`font-semibold ${textPrimary}`}>푸시 알림</p>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  {!isSupported ? '이 브라우저에서 지원하지 않아요' :
                   permission === 'granted' ? '알림이 활성화되어 있어요' :
                   permission === 'denied' ? '브라우저에서 차단됨' :
                   '알림을 받으려면 권한이 필요해요'}
                </p>
              </div>
            </div>
            
            {isSupported && permission !== 'granted' && permission !== 'denied' && (
              <button
                onClick={handleRequestNotificationPermission}
                className="px-3 py-1.5 bg-[#A996FF] text-white text-sm font-semibold rounded-lg"
              >
                허용하기
              </button>
            )}
            
            {permission === 'granted' && (
              <div className="flex items-center gap-1 text-emerald-500 text-sm">
                <Check size={16} />
                <span>활성화</span>
              </div>
            )}
          </div>
          
          {permission === 'granted' && (
            <button
              onClick={() => sendAlfredoMessage('🐧 알프레도 알림 테스트예요!', '알림이 잘 작동하고 있어요.')}
              className={`w-full py-2 mt-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-lg text-sm`}
            >
              테스트 알림 보내기
            </button>
          )}
        </div>
        
        <SettingItem 
          icon="🌅" 
          title="아침 브리핑" 
          description={`매일 ${settings.briefingTime}`}
          darkMode={darkMode}
        >
          <ToggleSwitch 
            enabled={settings.morningBriefing} 
            onChange={(v) => setSettings({...settings, morningBriefing: v})} 
            darkMode={darkMode}
          />
        </SettingItem>
        
        <SettingItem 
          icon="🌙" 
          title="저녁 리뷰" 
          description={`매일 ${settings.reviewTime}`}
          darkMode={darkMode}
        >
          <ToggleSwitch 
            enabled={settings.eveningReview} 
            onChange={(v) => setSettings({...settings, eveningReview: v})} 
            darkMode={darkMode}
          />
        </SettingItem>
        
        <SettingItem 
          icon="⏰" 
          title="태스크 리마인더" 
          description="마감 전 알림"
          darkMode={darkMode}
        >
          <ToggleSwitch 
            enabled={settings.taskReminder} 
            onChange={(v) => setSettings({...settings, taskReminder: v})} 
            darkMode={darkMode}
          />
        </SettingItem>
      </div>
    </SettingsCard>
  );
};

export default NotificationSection;
