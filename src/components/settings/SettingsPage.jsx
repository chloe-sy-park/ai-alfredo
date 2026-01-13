import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, ChevronRight, Settings } from 'lucide-react';

// 분리된 섹션 컴포넌트들
import { ToggleSwitch, SettingItem, getThemeColors } from './settingsComponents';
import NotificationSection from './NotificationSection';
import GoogleDriveSection from './GoogleDriveSection';
import GmailSection from './GmailSection';
import FocusModeSection from './FocusModeSection';
import ConnectionSection from './ConnectionSection';
import { AppInfoSection, AppInstallSection, DataManagementSection, AlfredoCard } from './AppInfoSection';

// 알프레도 육성 시스템 컴포넌트
import AlfredoStyleSettings from '../alfredo/AlfredoStyleSettings';
import AlfredoLearnings from '../alfredo/AlfredoLearnings';
import AlfredoUnderstanding from '../alfredo/AlfredoUnderstanding';

// 훅
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { useGmail } from '../../hooks/useGmail';

const SettingsPage = ({ 
  userName, 
  onBack, 
  darkMode, 
  setDarkMode, 
  onOpenWidgetGallery, 
  connections, 
  onConnect, 
  onDisconnect 
}) => {
  const [settings, setSettings] = useState({
    morningBriefing: true,
    briefingTime: '08:00',
    eveningReview: true,
    reviewTime: '21:00',
    taskReminder: true,
    focusMode: true,
    soundEnabled: true,
  });
  
  // 알프레도 육성 관련 state
  const [alfredoLearnings, setAlfredoLearnings] = useState([]);
  
  // 훅들
  const pushNotifications = usePushNotifications();
  const googleDrive = useGoogleDrive();
  const gmail = useGmail();
  
  // Google 계정 연결 상태
  const isGoogleConnected = connections?.googleCalendar || connections?.gmail;
  
  // 테마 색상
  const { bgColor, cardBg, textPrimary, textSecondary, borderColor, divideColor } = getThemeColors(darkMode);
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-4 ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-xl border-b ${borderColor}`}>
        <button 
          onClick={onBack}
          className={`w-10 h-10 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-black/5'} flex items-center justify-center ${textSecondary}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={`text-xl font-bold ${textPrimary}`}>설정</h1>
      </div>
      
      <div className="p-4 pb-32 space-y-4">
        
        {/* 프로필 섹션 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center text-2xl text-white font-bold shadow-lg">
              {userName?.[0] || 'B'}
            </div>
            <div className="flex-1">
              <h2 className={`text-lg font-bold ${textPrimary}`}>{userName || 'Boss'}</h2>
              <p className={`text-sm ${textSecondary}`}>Life Butler 사용자</p>
            </div>
            <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Settings size={20} className={textSecondary} />
            </button>
          </div>
        </div>
        
        {/* 🐧 알프레도 육성 시스템 */}
        <div className="space-y-4">
          <AlfredoUnderstanding darkMode={darkMode} learnings={alfredoLearnings} />
          <AlfredoStyleSettings darkMode={darkMode} />
          <AlfredoLearnings 
            darkMode={darkMode}
            onLearningChange={(learnings) => setAlfredoLearnings(learnings)}
          />
        </div>
        
        {/* 📧 Gmail 설정 */}
        <GmailSection 
          darkMode={darkMode} 
          gmail={gmail} 
          isGoogleConnected={isGoogleConnected} 
        />
        
        {/* ☁️ Google Drive 동기화 */}
        <GoogleDriveSection darkMode={darkMode} googleDrive={googleDrive} />
        
        {/* 🔔 알림 설정 */}
        <NotificationSection 
          darkMode={darkMode}
          settings={settings}
          setSettings={setSettings}
          pushNotifications={pushNotifications}
        />
        
        {/* 외관 설정 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
            {darkMode ? <Moon size={18} className="text-[#A996FF]" /> : <Sun size={18} className="text-[#A996FF]" />}
            외관
          </h3>
          
          <div className={`divide-y ${divideColor}`}>
            <SettingItem 
              icon={darkMode ? "🌙" : "☀️"} 
              title="다크 모드" 
              description={darkMode ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
              darkMode={darkMode}
            >
              <ToggleSwitch enabled={darkMode} onChange={setDarkMode} darkMode={darkMode} />
            </SettingItem>
            
            {onOpenWidgetGallery && (
              <button onClick={onOpenWidgetGallery} className="w-full">
                <SettingItem 
                  icon="📱" 
                  title="위젯 갤러리" 
                  description="다양한 크기의 위젯 미리보기"
                  darkMode={darkMode}
                >
                  <ChevronRight size={20} className={textSecondary} />
                </SettingItem>
              </button>
            )}
          </div>
        </div>
        
        {/* 연동 서비스 */}
        <ConnectionSection 
          darkMode={darkMode}
          connections={connections}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
        
        {/* 집중 모드 */}
        <FocusModeSection darkMode={darkMode} settings={settings} setSettings={setSettings} />
        
        {/* 앱 정보 */}
        <AppInfoSection darkMode={darkMode} />
        
        {/* 앱 설치 */}
        <AppInstallSection />
        
        {/* 데이터 관리 */}
        <DataManagementSection darkMode={darkMode} />
        
        {/* 알프레도 카드 */}
        <AlfredoCard />
        
      </div>
    </div>
  );
};

export default SettingsPage;
