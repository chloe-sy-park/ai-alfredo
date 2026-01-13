import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SettingsCard, getThemeColors } from './settingsComponents';

// Google 계정 연결 컴포넌트
export const GoogleAccountConnection = ({ darkMode, isConnected, onConnect, onDisconnect }) => {
  const { textPrimary, textSecondary } = getThemeColors(darkMode);
  
  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <p className={`font-semibold ${textPrimary}`}>Google 계정</p>
            <p className={`text-xs ${textSecondary}`}>
              {isConnected ? '캘린더, Gmail, Drive 연동됨' : 'Calendar, Gmail, Drive'}
            </p>
          </div>
        </div>
        
        {isConnected ? (
          <button
            onClick={() => onDisconnect('googleCalendar')}
            className="px-3 py-1.5 text-red-500 text-sm font-medium"
          >
            연결 해제
          </button>
        ) : (
          <button
            onClick={() => onConnect('googleCalendar')}
            className="px-3 py-1.5 bg-[#A996FF] text-white text-sm font-semibold rounded-lg"
          >
            연결
          </button>
        )}
      </div>
    </div>
  );
};

// 개별 서비스 연결 아이템
export const ConnectionItem = ({ icon, name, serviceKey, connected, onConnect, onDisconnect, darkMode }) => {
  const { textPrimary, textSecondary, borderColor } = getThemeColors(darkMode);
  
  return (
    <div className={`flex items-center justify-between py-3 border-t ${borderColor}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className={`font-semibold ${textPrimary}`}>{name}</p>
          <p className={`text-xs ${textSecondary}`}>
            {connected ? '연결됨' : '미연결'}
          </p>
        </div>
      </div>
      
      {connected ? (
        <span className="text-emerald-500 text-sm font-medium">✓ 연결됨</span>
      ) : (
        <button className={`${textSecondary}`}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

// 연결 섹션 전체
const ConnectionSection = ({ darkMode, connections, onConnect, onDisconnect }) => {
  const { textSecondary, borderColor } = getThemeColors(darkMode);
  const isGoogleConnected = connections?.googleCalendar || connections?.gmail;
  
  return (
    <SettingsCard title="서비스 연결" darkMode={darkMode}>
      <GoogleAccountConnection 
        darkMode={darkMode}
        isConnected={isGoogleConnected}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
      
      <ConnectionItem 
        icon="📝" 
        name="Notion" 
        serviceKey="notion"
        connected={connections?.notion}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        darkMode={darkMode}
      />
      <ConnectionItem 
        icon="💬" 
        name="Slack" 
        serviceKey="slack"
        connected={connections?.slack}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        darkMode={darkMode}
      />
      
      <p className={`text-xs ${textSecondary} mt-3 text-center`}>
        연동된 서비스에서 자동으로 일정과 태스크를 가져와요
      </p>
    </SettingsCard>
  );
};

export default ConnectionSection;
