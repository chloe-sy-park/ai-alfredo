import React, { useState } from 'react';
import { 
  ArrowLeft, User, Bell, Moon, Sun, Palette, Shield, ChevronRight,
  LogOut, Trash2, Database, Cloud, RefreshCw, Settings, Zap, Plus,
  BellRing, BellOff, Check, Download, Upload, CloudOff, Loader2
} from 'lucide-react';

// Other Components
import GoogleAuthModal from '../modals/GoogleAuthModal';

// 훅
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';

const SettingsPage = ({ 
  userName, 
  setUserName,
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
  
  const [showTimePicker, setShowTimePicker] = useState(null);
  
  // Google Auth Modal state
  const [authModal, setAuthModal] = useState({ isOpen: false, service: null });
  
  // 푸시 알림 훅
  const pushNotifications = usePushNotifications();
  const { isSupported, permission, requestPermission, sendAlfredoMessage } = pushNotifications;
  
  // Google Drive 동기화 훅
  const googleDrive = useGoogleDrive();
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
  
  // 알림 권한 요청 핸들러
  const handleRequestNotificationPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      // 테스트 알림은 훅 내부에서 발송됨
    } else if (result === 'denied') {
      alert('알림이 차단되었어요. 브라우저 설정에서 알림을 허용해주세요.');
    }
  };
  
  // 복원 확인 핸들러
  const handleRestore = async () => {
    if (window.confirm('Google Drive에서 데이터를 복원하시겠어요?\n\n현재 로컬 데이터가 덮어씌워집니다.')) {
      const success = await restoreFromDrive();
      if (success) {
        alert('데이터가 복원되었어요! 페이지를 새로고침합니다.');
        window.location.reload();
      }
    }
  };
  
  // 다크모드 색상
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white/70';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  const ToggleSwitch = ({ enabled, onChange, disabled }) => (
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
  
  const SettingItem = ({ icon, title, description, children }) => (
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
  
  const ConnectionItem = ({ icon, name, serviceKey, connected }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <span className={`font-medium ${textPrimary}`}>{name}</span>
          {connected && <p className="text-xs text-emerald-500">연결됨</p>}
        </div>
      </div>
      <button
        onClick={() => {
          if (connected && onDisconnect) {
            onDisconnect(serviceKey);
          } else {
            setAuthModal({ isOpen: true, service: serviceKey });
          }
        }}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          connected 
            ? 'bg-emerald-50 text-emerald-600' 
            : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
        }`}
      >
        {connected ? '연결됨 ✓' : '연결하기'}
      </button>
    </div>
  );
  
  // 알림 권한 상태 표시
  const NotificationPermissionStatus = () => {
    if (!isSupported) {
      return (
        <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-4`}>
          <div className="flex items-center gap-3">
            <BellOff size={24} className="text-gray-400" />
            <div>
              <p className={`font-medium ${textPrimary}`}>알림 미지원</p>
              <p className={`text-xs ${textSecondary}`}>이 브라우저는 알림을 지원하지 않아요</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (permission === 'granted') {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/30 rounded-full flex items-center justify-center">
                <BellRing size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">알림 활성화됨</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">중요한 알림을 받을 수 있어요</p>
              </div>
            </div>
            <Check size={20} className="text-emerald-500" />
          </div>
        </div>
      );
    }
    
    if (permission === 'denied') {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center">
              <BellOff size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-700 dark:text-red-400">알림 차단됨</p>
              <p className="text-xs text-red-600/70 dark:text-red-500/70">브라우저 설정에서 알림을 허용해주세요</p>
            </div>
          </div>
        </div>
      );
    }
    
    // default - 아직 요청 안 함
    return (
      <button
        onClick={handleRequestNotificationPermission}
        className="w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-4 text-left hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-white">푸시 알림 활성화</p>
              <p className="text-xs text-white/80">일정, 태스크 알림을 받아보세요</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/80" />
        </div>
      </button>
    );
  };
  
  // 마지막 동기화 시간 포맷
  const formatLastSync = (date) => {
    if (!date) return '동기화 안 됨';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };
  
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
        
        {/* ☁️ 클라우드 동기화 섹션 (새로 추가) */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
            <Cloud size={18} className="text-[#A996FF]" />
            클라우드 동기화
          </h3>
          
          {/* 연결 상태 */}
          {!isDriveConnected ? (
            <button
              onClick={connectDrive}
              className="w-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-xl p-4 text-left hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Cloud size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Google Drive 연결</p>
                    <p className="text-xs text-white/80">데이터를 안전하게 백업하세요</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-white/80" />
              </div>
            </button>
          ) : (
            <>
              {/* 연결됨 상태 */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/30 rounded-full flex items-center justify-center">
                      <Cloud size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">Google Drive 연결됨</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                        마지막 동기화: {formatLastSync(lastSync)}
                      </p>
                    </div>
                  </div>
                  <Check size={20} className="text-emerald-500" />
                </div>
              </div>
              
              {/* 자동 동기화 토글 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className={`font-medium ${textPrimary}`}>자동 동기화</p>
                    <p className={`text-xs ${textSecondary}`}>1시간마다 자동 백업</p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={syncEnabled} 
                  onChange={toggleSync}
                  disabled={isSyncing}
                />
              </div>
              
              {/* 동기화 진행 상태 */}
              {isSyncing && (
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]'} rounded-xl p-3 mb-3`}>
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="text-[#A996FF] animate-spin" />
                    <span className={`text-sm ${textPrimary}`}>{syncProgress || '동기화 중...'}</span>
                  </div>
                </div>
              )}
              
              {/* 에러 표시 */}
              {driveError && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mb-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{driveError}</p>
                </div>
              )}
              
              {/* 수동 동기화 버튼들 */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={backupToDrive}
                  disabled={isSyncing}
                  className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#F5F3FF] text-[#A996FF]'} rounded-xl text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <Upload size={16} />
                  백업하기
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isSyncing}
                  className={`flex-1 py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#F5F3FF] text-[#A996FF]'} rounded-xl text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <Download size={16} />
                  복원하기
                </button>
              </div>
              
              <p className={`text-xs ${textSecondary} mt-3 text-center`}>
                📁 데이터는 Google Drive의 'Life Butler' 폴더에 암호화되어 저장됩니다
              </p>
            </>
          )}
        </div>
        
        {/* 🔔 푸시 알림 섹션 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
            <BellRing size={18} className="text-[#A996FF]" />
            푸시 알림
          </h3>
          <NotificationPermissionStatus />
          
          {permission === 'granted' && (
            <button
              onClick={() => sendAlfredoMessage('테스트 알림이에요! 🐧', { tag: 'test' })}
              className={`mt-3 w-full py-2.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-xl text-sm font-medium hover:opacity-80 transition-opacity`}
            >
              테스트 알림 보내기
            </button>
          )}
        </div>
        
        {/* 외관 설정 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
            {darkMode ? <Moon size={18} className="text-[#A996FF]" /> : <Sun size={18} className="text-[#A996FF]" />}
            외관
          </h3>
          
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <SettingItem 
              icon={darkMode ? "🌙" : "☀️"} 
              title="다크 모드" 
              description={darkMode ? '어두운 테마 사용 중' : '밝은 테마 사용 중'}
            >
              <ToggleSwitch 
                enabled={darkMode} 
                onChange={setDarkMode} 
              />
            </SettingItem>
            
            {onOpenWidgetGallery && (
              <button 
                onClick={onOpenWidgetGallery}
                className="w-full"
              >
                <SettingItem 
                  icon="📱" 
                  title="위젯 갤러리" 
                  description="다양한 크기의 위젯 미리보기"
                >
                  <ChevronRight size={20} className={textSecondary} />
                </SettingItem>
              </button>
            )}
          </div>
        </div>
        
        {/* 알림 설정 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
            <Bell size={18} className="text-[#A996FF]" />
            알림 설정
          </h3>
          
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <SettingItem 
              icon="🌅" 
              title="아침 브리핑" 
              description={settings.morningBriefing ? `매일 ${settings.briefingTime}` : '꺼짐'}
            >
              <ToggleSwitch 
                enabled={settings.morningBriefing} 
                onChange={(v) => setSettings({...settings, morningBriefing: v})} 
              />
            </SettingItem>
            
            <SettingItem 
              icon="🌙" 
              title="저녁 리뷰" 
              description={settings.eveningReview ? `매일 ${settings.reviewTime}` : '꺼짐'}
            >
              <ToggleSwitch 
                enabled={settings.eveningReview} 
                onChange={(v) => setSettings({...settings, eveningReview: v})} 
              />
            </SettingItem>
            
            <SettingItem 
              icon="⏰" 
              title="태스크 리마인더" 
              description="마감 전 알림"
            >
              <ToggleSwitch 
                enabled={settings.taskReminder} 
                onChange={(v) => setSettings({...settings, taskReminder: v})} 
              />
            </SettingItem>
            
            <SettingItem 
              icon="🔔" 
              title="소리" 
              description="알림음 및 효과음"
            >
              <ToggleSwitch 
                enabled={settings.soundEnabled} 
                onChange={(v) => setSettings({...settings, soundEnabled: v})} 
              />
            </SettingItem>
          </div>
        </div>
        
        {/* 연동 관리 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
            <Zap size={18} className="text-[#A996FF]" />
            연동 서비스
          </h3>
          
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <ConnectionItem 
              icon="📅" 
              name="Google Calendar" 
              serviceKey="googleCalendar"
              connected={connections?.googleCalendar}
            />
            <ConnectionItem 
              icon="📧" 
              name="Gmail" 
              serviceKey="gmail"
              connected={connections?.gmail}
            />
            <ConnectionItem 
              icon="📝" 
              name="Notion" 
              serviceKey="notion"
              connected={connections?.notion}
            />
            <ConnectionItem 
              icon="💬" 
              name="Slack" 
              serviceKey="slack"
              connected={connections?.slack}
            />
          </div>
          
          <p className={`text-xs ${textSecondary} mt-3 text-center`}>
            연동된 서비스에서 자동으로 일정과 태스크를 가져와요
          </p>
        </div>
        
        {/* Google Auth Modal */}
        <GoogleAuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, service: null })}
          service={authModal.service}
          isConnected={connections?.[authModal.service]}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          darkMode={darkMode}
        />
        
        {/* 집중 모드 설정 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
            <Zap size={18} className="text-[#A996FF]" />
            집중 모드
          </h3>
          
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            <SettingItem 
              icon="⏱️" 
              title="기본 집중 시간" 
              description="25분 (포모도로)"
            >
              <span className="text-sm text-[#A996FF] font-semibold">25분</span>
            </SettingItem>
            
            <SettingItem 
              icon="☕" 
              title="휴식 시간" 
              description="집중 후 휴식"
            >
              <span className="text-sm text-[#A996FF] font-semibold">5분</span>
            </SettingItem>
            
            <SettingItem 
              icon="🔕" 
              title="집중 시 방해 금지" 
              description="알림 일시 차단"
            >
              <ToggleSwitch 
                enabled={settings.focusMode} 
                onChange={(v) => setSettings({...settings, focusMode: v})} 
              />
            </SettingItem>
          </div>
        </div>
        
        {/* 앱 정보 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2`}>앱 정보</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={textSecondary}>버전</span>
              <span className={`${textPrimary} font-medium`}>1.2.0</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondary}>빌드</span>
              <span className={`${textPrimary} font-medium`}>2024.12</span>
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
        </div>
        
        {/* 📱 앱 설치 */}
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
            onClick={() => {
              if (window.installPWA) {
                window.installPWA();
              } else {
                // iOS Safari 안내
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (isIOS) {
                  alert('Safari에서 공유 버튼(📤)을 누르고\n"홈 화면에 추가"를 선택하세요!');
                } else {
                  alert('브라우저 메뉴에서 "앱 설치" 또는\n"홈 화면에 추가"를 선택하세요!');
                }
              }
            }}
            className="w-full py-3 bg-white text-[#A996FF] rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            홈 화면에 추가
          </button>
          
          <p className="text-xs text-white/60 text-center mt-2">
            앱처럼 사용할 수 있어요 • 오프라인 지원
          </p>
        </div>
        
        {/* 데이터 관리 */}
        <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
          <h3 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
            <Database size={18} className={textSecondary} />
            데이터 관리
          </h3>
          
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
            onClick={() => {
              if (window.confirm('모든 데이터를 초기화하시겠어요?\n\n태스크, 일정, 프로젝트, 루틴, 약 등 모든 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없어요.')) {
                // 모든 localStorage 키 삭제
                const keysToDelete = [
                  'lifebutler_userData', 'lifebutler_tasks', 'lifebutler_allTasks',
                  'lifebutler_allEvents', 'lifebutler_inbox', 'lifebutler_darkMode',
                  'lifebutler_view', 'lifebutler_gameState', 'lifebutler_projects',
                  'lifebutler_medications', 'lifebutler_routines', 'lifebutler_lifeTop3',
                  'lifebutler_upcomingItems', 'lifebutler_dontForgetItems',
                  'lifebutler_relationshipItems', 'lifebutler_healthCheck'
                ];
                keysToDelete.forEach(key => localStorage.removeItem(key));
                window.location.reload();
              }
            }}
            className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            🗑️ 모든 데이터 초기화
          </button>
        </div>
        
        {/* 알프레도 카드 */}
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
        
      </div>
    </div>
  );
};

export default SettingsPage;
