import React from 'react';
import { Cloud, Download, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { ToggleSwitch, SettingsCard, getThemeColors } from './settingsComponents';

const GoogleDriveSection = ({ darkMode, googleDrive }) => {
  const { textPrimary, textSecondary, borderColor } = getThemeColors(darkMode);
  
  const { 
    isConnected: isDriveConnected,
    isSyncing, 
    syncEnabled, 
    lastSync, 
    syncProgress,
    error: driveError,
    connect: connectDrive,
    backupToDrive,
    restoreFromDrive,
    toggleSync,
  } = googleDrive;
  
  const handleRestore = async () => {
    if (window.confirm('Google Drive에서 데이터를 복원하시겠어요?\n\n현재 로컬 데이터가 덮어씌워집니다.')) {
      const success = await restoreFromDrive();
      if (success) {
        alert('데이터가 복원되었어요! 페이지를 새로고침합니다.');
        window.location.reload();
      }
    }
  };
  
  return (
    <SettingsCard
      title="Google Drive 동기화"
      icon={<Cloud size={18} className="text-[#A996FF]" />}
      darkMode={darkMode}
    >
      {!isDriveConnected ? (
        <div className="text-center py-4">
          <p className={`text-sm ${textSecondary} mb-3`}>
            Google 계정을 먼저 연결해주세요
          </p>
          <button
            onClick={connectDrive}
            className="px-4 py-2 bg-[#A996FF] text-white rounded-xl text-sm font-semibold"
          >
            Google 연결하기
          </button>
        </div>
      ) : (
        <>
          {/* 자동 동기화 토글 */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className={`font-semibold ${textPrimary}`}>자동 동기화</p>
              <p className={`text-xs ${textSecondary}`}>변경사항을 자동으로 백업</p>
            </div>
            <ToggleSwitch 
              enabled={syncEnabled} 
              onChange={toggleSync}
              darkMode={darkMode}
            />
          </div>
          
          {/* 마지막 동기화 시간 */}
          {lastSync && (
            <div className={`py-2 border-t ${borderColor}`}>
              <p className={`text-xs ${textSecondary} flex items-center gap-1`}>
                <Check size={12} className="text-emerald-500" />
                마지막 동기화: {new Date(lastSync).toLocaleString('ko-KR')}
              </p>
            </div>
          )}
          
          {/* 동기화 진행 상태 */}
          {isSyncing && (
            <div className={`py-2 border-t ${borderColor}`}>
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#A996FF]" />
                <span className={`text-sm ${textSecondary}`}>
                  동기화 중... {syncProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-[#A996FF] h-1.5 rounded-full transition-all"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* 에러 표시 */}
          {driveError && (
            <div className={`py-2 border-t ${borderColor} flex items-center gap-2 text-red-500`}>
              <AlertCircle size={14} />
              <span className="text-xs">{driveError}</span>
            </div>
          )}
          
          {/* 수동 백업/복원 버튼 */}
          <div className={`flex gap-2 mt-3 pt-3 border-t ${borderColor}`}>
            <button
              onClick={backupToDrive}
              disabled={isSyncing}
              className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              <Upload size={16} />
              백업
            </button>
            <button
              onClick={handleRestore}
              disabled={isSyncing}
              className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              <Download size={16} />
              복원
            </button>
          </div>
        </>
      )}
    </SettingsCard>
  );
};

export default GoogleDriveSection;
