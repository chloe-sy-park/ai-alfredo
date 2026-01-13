import React from 'react';
import { Mail, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { ToggleSwitch, SettingsCard, getThemeColors } from './settingsComponents';

const GmailSection = ({ darkMode, gmail, isGoogleConnected }) => {
  const { textPrimary, textSecondary, borderColor } = getThemeColors(darkMode);
  
  const {
    isGmailEnabled,
    isLoading: isGmailLoading,
    isAnalyzing: isGmailAnalyzing,
    error: gmailError,
    needsReauth: gmailNeedsReauth,
    stats: gmailStats,
    settings: gmailSettings,
    toggleGmail,
    fetchAndAnalyze,
    forceReconnect,
    updateSettings: updateGmailSettings,
    getLastSyncText,
  } = gmail;
  
  const periodOptions = [
    { value: 1, label: '1일' },
    { value: 3, label: '3일' },
    { value: 7, label: '1주' },
    { value: 14, label: '2주' },
    { value: 30, label: '1달' },
  ];
  
  return (
    <SettingsCard
      title="Gmail 연동"
      icon={<Mail size={18} className="text-[#A996FF]" />}
      darkMode={darkMode}
    >
      {!isGoogleConnected ? (
        <div className="text-center py-4">
          <p className={`text-sm ${textSecondary}`}>
            Google 계정을 먼저 연결해주세요
          </p>
        </div>
      ) : gmailNeedsReauth ? (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border border-yellow-500/30`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-500" />
            <span className={`font-semibold ${textPrimary}`}>재연결 필요</span>
          </div>
          <p className={`text-xs ${textSecondary} mb-3`}>
            Gmail 권한이 만료되었어요. 다시 연결해주세요.
          </p>
          <button
            onClick={forceReconnect}
            className="w-full py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold"
          >
            다시 연결하기
          </button>
        </div>
      ) : (
        <>
          {/* Gmail 활성화 토글 */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className={`font-semibold ${textPrimary}`}>Gmail 분석</p>
              <p className={`text-xs ${textSecondary}`}>이메일에서 액션 아이템 추출</p>
            </div>
            <ToggleSwitch 
              enabled={isGmailEnabled} 
              onChange={toggleGmail}
              darkMode={darkMode}
            />
          </div>
          
          {isGmailEnabled && (
            <>
              {/* 기간 설정 */}
              <div className={`py-3 border-t ${borderColor}`}>
                <p className={`text-sm font-semibold ${textPrimary} mb-2`}>분석 기간</p>
                <div className="flex flex-wrap gap-2">
                  {periodOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateGmailSettings({ fetchPeriod: opt.value })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        gmailSettings.fetchPeriod === opt.value
                          ? 'bg-[#A996FF] text-white'
                          : darkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 통계 */}
              {gmailStats && gmailStats.total > 0 && (
                <div className={`py-3 border-t ${borderColor}`}>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-lg font-bold text-[#A996FF]">{gmailStats.total}</p>
                      <p className={`text-xs ${textSecondary}`}>전체</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-lg font-bold text-orange-500">{gmailStats.urgent}</p>
                      <p className={`text-xs ${textSecondary}`}>긴급</p>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-lg font-bold text-blue-500">{gmailStats.needsAction}</p>
                      <p className={`text-xs ${textSecondary}`}>액션</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 에러 표시 */}
              {gmailError && (
                <div className={`py-2 border-t ${borderColor} flex items-center gap-2 text-red-500`}>
                  <AlertCircle size={14} />
                  <span className="text-xs">{gmailError}</span>
                </div>
              )}
              
              {/* 동기화 버튼 */}
              <div className={`pt-3 border-t ${borderColor}`}>
                <button
                  onClick={fetchAndAnalyze}
                  disabled={isGmailLoading || isGmailAnalyzing}
                  className={`w-full py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {isGmailLoading || isGmailAnalyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {isGmailAnalyzing ? 'AI 분석 중...' : '가져오는 중...'}
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      지금 동기화
                    </>
                  )}
                </button>
                <p className={`text-xs ${textSecondary} text-center mt-2`}>
                  마지막 동기화: {getLastSyncText()}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </SettingsCard>
  );
};

export default GmailSection;
