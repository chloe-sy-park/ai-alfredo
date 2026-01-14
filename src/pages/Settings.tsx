import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  User, 
  Bell, 
  LogOut, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Volume2,
  Target,
  RotateCcw
} from 'lucide-react';
import { 
  isGoogleConnected, 
  getGoogleUser, 
  startGoogleAuth, 
  disconnectGoogle,
  GoogleUser
} from '../services/auth';
import {
  getCalendarList,
  getSelectedCalendars,
  setSelectedCalendars,
  CalendarInfo
} from '../services/calendar';
import {
  AlfredoSettings,
  getAlfredoSettings,
  saveAlfredoSettings,
  resetAlfredoSettings,
  getToneLabel,
  getToneExample,
  getFrequencyLabel,
  getMotivationLabel,
  getMotivationExample
} from '../services/alfredoSettings';

export default function Settings() {
  var authStore = useAuthStore();
  var user = authStore.user;
  var logout = authStore.logout;
  
  var [googleConnected, setGoogleConnected] = useState(false);
  var [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  var [connecting, setConnecting] = useState(false);
  
  // 캘린더 선택 관련
  var [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  var [selectedIds, setSelectedIds] = useState<string[]>([]);
  var [showCalendars, setShowCalendars] = useState(false);
  var [loadingCalendars, setLoadingCalendars] = useState(false);

  // 알프레도 설정
  var [alfredoSettings, setAlfredoSettings] = useState<AlfredoSettings>(getAlfredoSettings());
  var [showAlfredoSettings, setShowAlfredoSettings] = useState(false);

  useEffect(function checkGoogleConnection() {
    var connected = isGoogleConnected();
    setGoogleConnected(connected);
    setGoogleUser(getGoogleUser());
    
    if (connected) {
      setSelectedIds(getSelectedCalendars());
    }
  }, []);

  // 캘린더 목록 불러오기
  function handleLoadCalendars() {
    if (calendars.length > 0) {
      setShowCalendars(!showCalendars);
      return;
    }
    
    setLoadingCalendars(true);
    getCalendarList()
      .then(function(list) {
        setCalendars(list);
        setShowCalendars(true);
        
        if (selectedIds.length === 0) {
          var primaryCal = list.find(function(c) { return c.primary; });
          if (primaryCal) {
            setSelectedIds([primaryCal.id]);
            setSelectedCalendars([primaryCal.id]);
          }
        }
      })
      .catch(function(err) {
        console.error('Failed to load calendars:', err);
        alert('캘린더 목록을 불러오는데 실패했습니다.');
      })
      .finally(function() {
        setLoadingCalendars(false);
      });
  }

  function handleToggleCalendar(calendarId: string) {
    var newSelected: string[];
    if (selectedIds.includes(calendarId)) {
      newSelected = selectedIds.filter(function(id) { return id !== calendarId; });
    } else {
      newSelected = [...selectedIds, calendarId];
    }
    setSelectedIds(newSelected);
    setSelectedCalendars(newSelected);
  }

  function handleConnectGoogle() {
    setConnecting(true);
    startGoogleAuth().catch(function(err) {
      console.error('Failed to start Google auth:', err);
      setConnecting(false);
      alert('Google 연결에 실패했습니다. 다시 시도해주세요.');
    });
  }

  function handleDisconnectGoogle() {
    if (confirm('Google 캘린더 연결을 해제할까요?')) {
      disconnectGoogle();
      setGoogleConnected(false);
      setGoogleUser(null);
      setCalendars([]);
      setSelectedIds([]);
      setShowCalendars(false);
    }
  }

  // 알프레도 설정 변경
  function handleAlfredoSettingChange(key: keyof AlfredoSettings, value: number | string | boolean) {
    var updated = saveAlfredoSettings({ [key]: value });
    setAlfredoSettings(updated);
  }

  function handleResetAlfredoSettings() {
    if (confirm('알프레도 설정을 초기화할까요?')) {
      var reset = resetAlfredoSettings();
      setAlfredoSettings(reset);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        
        {/* 프로필 */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F0F0FF] flex items-center justify-center">
              <User size={32} className="text-[#A996FF]" />
            </div>
            <div>
              <p className="font-semibold text-lg text-[#1A1A1A]">{user?.name || '사용자'}</p>
              <p className="text-sm text-[#999999]">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 알프레도 육성 */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <button
            onClick={function() { setShowAlfredoSettings(!showAlfredoSettings); }}
            className="w-full flex items-center justify-between min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐧</span>
              <h2 className="font-semibold text-[#1A1A1A]">알프레도 육성</h2>
            </div>
            {showAlfredoSettings ? <ChevronUp size={20} className="text-[#999999]" /> : <ChevronDown size={20} className="text-[#999999]" />}
          </button>
          
          {showAlfredoSettings && (
            <div className="mt-4 space-y-6">
              
              {/* 말투 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 size={16} className="text-[#A996FF]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">말투</span>
                  <span className="text-xs text-[#999999] ml-auto">{getToneLabel(alfredoSettings.tone)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={alfredoSettings.tone}
                  onChange={function(e) { handleAlfredoSettingChange('tone', parseInt(e.target.value)); }}
                  className="w-full h-2 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#A996FF]"
                />
                <div className="flex justify-between text-xs text-[#999999] mt-1">
                  <span>🌸 다정</span>
                  <span>🔥 직설</span>
                </div>
                <p className="text-xs text-[#666666] mt-2 bg-[#F5F5F5] p-2 rounded-lg">
                  {getToneExample(alfredoSettings.tone)}
                </p>
              </div>

              {/* 알림 빈도 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={16} className="text-[#A996FF]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">알림 빈도</span>
                  <span className="text-xs text-[#999999] ml-auto">{getFrequencyLabel(alfredoSettings.notificationFrequency)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={alfredoSettings.notificationFrequency}
                  onChange={function(e) { handleAlfredoSettingChange('notificationFrequency', parseInt(e.target.value)); }}
                  className="w-full h-2 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#A996FF]"
                />
                <div className="flex justify-between text-xs text-[#999999] mt-1">
                  <span>🤫 필요시만</span>
                  <span>💬 자주</span>
                </div>
              </div>

              {/* 동기부여 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-[#A996FF]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">동기부여 방식</span>
                  <span className="text-xs text-[#999999] ml-auto">{getMotivationLabel(alfredoSettings.motivation)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={alfredoSettings.motivation}
                  onChange={function(e) { handleAlfredoSettingChange('motivation', parseInt(e.target.value)); }}
                  className="w-full h-2 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#A996FF]"
                />
                <div className="flex justify-between text-xs text-[#999999] mt-1">
                  <span>🌊 느긋</span>
                  <span>🏆 도전적</span>
                </div>
                <p className="text-xs text-[#666666] mt-2 bg-[#F5F5F5] p-2 rounded-lg">
                  {getMotivationExample(alfredoSettings.motivation)}
                </p>
              </div>

              {/* 알림 시간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#666666] block mb-1">아침 알림</label>
                  <input
                    type="time"
                    value={alfredoSettings.morningAlertTime}
                    onChange={function(e) { handleAlfredoSettingChange('morningAlertTime', e.target.value); }}
                    className="w-full p-2 border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#666666] block mb-1">저녁 알림</label>
                  <input
                    type="time"
                    value={alfredoSettings.eveningAlertTime}
                    onChange={function(e) { handleAlfredoSettingChange('eveningAlertTime', e.target.value); }}
                    className="w-full p-2 border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A] min-h-[44px]"
                  />
                </div>
              </div>

              {/* 초기화 */}
              <button
                onClick={handleResetAlfredoSettings}
                className="flex items-center gap-2 text-sm text-[#999999] hover:text-[#666666] min-h-[44px]"
              >
                <RotateCcw size={14} />
                <span>설정 초기화</span>
              </button>
            </div>
          )}
        </div>

        {/* Google 캘린더 연동 */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1A1A1A]">
            <Calendar size={18} className="text-[#A996FF]" />
            Google 캘린더
          </h2>
          
          {googleConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#22C55E]">
                <CheckCircle size={16} />
                <span className="text-sm">연결됨</span>
              </div>
              {googleUser && (
                <p className="text-sm text-[#999999]">
                  {googleUser.email}
                </p>
              )}
              
              {/* 캘린더 선택 */}
              <div className="border-t border-[#E5E5E5] pt-3 mt-3">
                <button
                  onClick={handleLoadCalendars}
                  disabled={loadingCalendars}
                  className="w-full flex items-center justify-between py-2 text-sm text-[#666666] hover:text-[#A996FF] min-h-[44px]"
                >
                  <span>표시할 캘린더 선택 ({selectedIds.length}개 선택됨)</span>
                  {loadingCalendars ? (
                    <span className="w-4 h-4 border-2 border-[#A996FF] border-t-transparent rounded-full animate-spin"></span>
                  ) : showCalendars ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
                
                {showCalendars && calendars.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {calendars.map(function(cal) {
                      var isSelected = selectedIds.includes(cal.id);
                      return (
                        <button
                          key={cal.id}
                          onClick={function() { handleToggleCalendar(cal.id); }}
                          className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#F5F5F5] text-left min-h-[44px]"
                        >
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center"
                            style={{
                              borderColor: cal.backgroundColor || '#A996FF',
                              backgroundColor: isSelected ? (cal.backgroundColor || '#A996FF') : 'transparent'
                            }}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm flex-1 truncate text-[#1A1A1A]">{cal.summary}</span>
                          {cal.primary && (
                            <span className="text-xs text-[#999999]">기본</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleDisconnectGoogle}
                className="w-full py-2.5 px-4 text-sm text-[#EF4444] border border-[#FECACA] rounded-xl hover:bg-[#FEF2F2] transition-colors min-h-[44px]"
              >
                연결 해제
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#999999]">
                <XCircle size={16} />
                <span className="text-sm">연결되지 않음</span>
              </div>
              <p className="text-xs text-[#999999]">
                Google 캘린더를 연결하면 일정을 알프레도가 관리해드려요
              </p>
              <button
                onClick={handleConnectGoogle}
                disabled={connecting}
                className="w-full py-2.5 px-4 bg-[#A996FF] text-white rounded-xl hover:bg-[#8B7BE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
              >
                {connecting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    연결 중...
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    Google 캘린더 연결
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 알림 */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-[#1A1A1A]">
            <Bell size={18} className="text-[#A996FF]" />
            알림
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between min-h-[44px]">
              <span className="text-sm text-[#666666]">아침 브리핑</span>
              <button
                onClick={function() { handleAlfredoSettingChange('notificationsEnabled', !alfredoSettings.notificationsEnabled); }}
                className={
                  'w-11 h-6 rounded-full relative transition-colors ' +
                  (alfredoSettings.notificationsEnabled ? 'bg-[#A996FF]' : 'bg-[#CCCCCC]')
                }
              >
                <span 
                  className={
                    'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ' +
                    (alfredoSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1')
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* 로그아웃 */}
        <div className="bg-white rounded-xl shadow-card">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl min-h-[48px]"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>

        <p className="text-center text-xs text-[#999999]">알프레도 v0.2.0</p>
      </div>
    </div>
  );
}
