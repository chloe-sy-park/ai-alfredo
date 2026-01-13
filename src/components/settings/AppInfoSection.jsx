import React from 'react';
import { Database, Plus } from 'lucide-react';
import { SettingsCard, getThemeColors } from './settingsComponents';

// 앱 정보 섹션
export const AppInfoSection = ({ darkMode }) => {
  const { textPrimary, textSecondary, borderColor } = getThemeColors(darkMode);
  
  return (
    <SettingsCard title="앱 정보" darkMode={darkMode}>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className={textSecondary}>버전</span>
          <span className={`${textPrimary} font-medium`}>1.3.0</span>
        </div>
        <div className="flex justify-between">
          <span className={textSecondary}>빌드</span>
          <span className={`${textPrimary} font-medium`}>2025.01</span>
        </div>
        <div className="flex justify-between">
          <span className={textSecondary}>플랫폼</span>
          <span className={`${textPrimary} font-medium`}>PWA</span>
        </div>
      </div>
      
      <div className={`mt-4 pt-4 border-t ${borderColor} flex gap-2`}>
        <button className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl text-sm font-semibold hover:opacity-80`}>
          피드백 보내기
        </button>
        <button className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl text-sm font-semibold hover:opacity-80`}>
          도움말
        </button>
      </div>
    </SettingsCard>
  );
};

// 앱 설치 섹션
export const AppInstallSection = () => {
  const handleInstall = () => {
    if (window.installPWA) {
      window.installPWA();
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Safari에서 공유 버튼(📤)을 누르고\n"홈 화면에 추가"를 선택하세요!');
      } else {
        alert('브라우저 메뉴에서 "앱 설치" 또는\n"홈 화면에 추가"를 선택하세요!');
      }
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-4 text-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
          📱
        </div>
        <div>
          <h3 className="font-bold">앱으로 설치하기</h3>
          <p className="text-sm text-white/80">홈 화면에 추가해서 더 빠르게!</p>
        </div>
      </div>
      
      <button 
        onClick={handleInstall}
        className="w-full py-3 bg-white text-[#A996FF] rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        홈 화면에 추가
      </button>
      
      <p className="text-xs text-white/60 text-center mt-2">
        앱처럼 사용할 수 있어요 • 오프라인 지원
      </p>
    </div>
  );
};

// 데이터 관리 섹션
export const DataManagementSection = ({ darkMode }) => {
  const { textPrimary, textSecondary, borderColor } = getThemeColors(darkMode);
  
  const handleReset = () => {
    if (window.confirm('모든 데이터를 초기화하시겠어요?\n\n태스크, 일정, 프로젝트, 루틴, 약 등 모든 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없어요.')) {
      const keysToDelete = [
        'lifebutler_userData', 'lifebutler_tasks', 'lifebutler_allTasks',
        'lifebutler_allEvents', 'lifebutler_inbox', 'lifebutler_darkMode',
        'lifebutler_view', 'lifebutler_gameState', 'lifebutler_projects',
        'lifebutler_medications', 'lifebutler_routines', 'lifebutler_lifeTop3',
        'lifebutler_upcomingItems', 'lifebutler_dontForgetItems',
        'lifebutler_relationshipItems', 'lifebutler_healthCheck',
        'alfredo_tone_warmth', 'alfredo_notification_freq',
        'alfredo_data_depth', 'alfredo_motivation_style', 'alfredo_learnings'
      ];
      keysToDelete.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };
  
  return (
    <SettingsCard
      title="데이터 관리"
      icon={<Database size={18} className={textSecondary} />}
      darkMode={darkMode}
    >
      <div className="space-y-3 text-sm mb-4">
        <div className="flex justify-between items-center">
          <span className={textSecondary}>저장된 데이터</span>
          <span className={`${textPrimary} font-medium`}>로컬 + 클라우드</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={textSecondary}>자동 저장</span>
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            활성화
          </span>
        </div>
      </div>
      
      <button 
        onClick={handleReset}
        className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
      >
        🗑️ 모든 데이터 초기화
      </button>
    </SettingsCard>
  );
};

// 알프레도 카드
export const AlfredoCard = () => (
  <div className="bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-xl p-4 text-white">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
        🐧
      </div>
      <div className="flex-1">
        <p className="font-bold">알프레도가 함께해요</p>
        <p className="text-sm text-white/80">언제든 도움이 필요하면 불러주세요!</p>
      </div>
    </div>
  </div>
);
