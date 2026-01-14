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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        
        {/* 프로필 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-lavender-100 flex items-center justify-center">
              <User size={32} className="text-lavender-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name || '사용자'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 알프레도 육성 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button
            onClick={function() { setShowAlfredoSettings(!showAlfredoSettings); }}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐧</span>
              <h2 className="font-semibold">알프레도 육성</h2>
            </div>
            {showAlfredoSettings ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {showAlfredoSettings && (
            <div className="mt-4 space-y-6">
              
              {/* 말투 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 size={16} className="text-lavender-400" />
                  <span className="text-sm font-medium">말투</span>
                  <span className="text-xs text-gray-400 ml-auto">{getToneLabel(alfredoSettings.tone)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={alfredoSettings.tone}
                  onChange={function(e) { handleAlfredoSettingChange('tone', parseInt(e.target.value)); }}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-lavender-400"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>🌸 다정</span>
                  <span>🔥 직설</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                  {getToneExample(alfredoSettings.tone)}
                </p>
              </div>

              {/* 알림 빈도 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={16} className="text-lavender-400" />
                  <span className="text-sm font-medium">알림 빈도</span>
                  <span className="text-xs text-gray-400 ml-auto">{getFrequencyLabel(alfredoSettings.notificationFrequency)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={alfredoSettings.notificationFrequency}
                  onChange={function(e) { handleAlfredoSettingChange('notificationFrequency', parseInt(e.target.value)); }}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-lavender-400"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>🤫 필요시만</span>
                  <span>💬 자주</span>
                </div>
              </div>

              {/* 동기부여 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-lavender-400" />
                  <span className="text-sm font-medium">동기부여 방식</span>
                  <span className="text-xs text-gray-400 ml-auto">{getMotivationLabel(alfredoSettings.motivation)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={alfredoSettings.motivation}
                  onChange={function(e) { handleAlfredoSettingChange('motivation', parseInt(e.target.value)); }}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-lavender-400"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>🌊 느긋</span>
                  <span>🏆 도전적</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                  {getMotivationExample(alfredoSettings.motivation)}
                </p>
              </div>

              {/* 알림 시간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">아침 알림</label>
                  <input
                    type="time"
                    value={alfredoSettings.morningAlertTime}
                    onChange={function(e) { handleAlfredoSettingChange('morningAlertTime', e.target.value); }}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">저녁 알림</label>
                  <input
                    type="time"
                    value={alfredoSettings.eveningAlertTime}
                    onChange={function(e) { handleAlfredoSettingChange('eveningAlertTime', e.target.value); }}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* 초기화 */}
              <button
                onClick={handleResetAlfredoSettings}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
              >
                <RotateCcw size={14} />
                <span>설정 초기화</span>
              </button>
            </div>
          )}
        </div>

        {/* Google 캘린더 연동 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-lavender-400" />
            Google 캘린더
          </h2>
          
          {googleConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">연결됨</span>
              </div>
              {googleUser && (
                <p className="text-sm text-gray-500">
                  {googleUser.email}
                </p>
              )}
              
              {/* 캘린더 선택 */}
              <div className="border-t pt-3 mt-3">
                <button
                  onClick={handleLoadCalendars}
                  disabled={loadingCalendars}
                  className="w-full flex items-center justify-between py-2 text-sm text-gray-700 hover:text-lavender-500"
                >
                  <span>표시할 캘린더 선택 ({selectedIds.length}개 선택됨)</span>
                  {loadingCalendars ? (
                    <span className="w-4 h-4 border-2 border-lavender-400 border-t-transparent rounded-full animate-spin"></span>
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
                          className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 text-left"
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
                          <span className="text-sm flex-1 truncate">{cal.summary}</span>
                          {cal.primary && (
                            <span className="text-xs text-gray-400">기본</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleDisconnectGoogle}
                className="w-full py-2 px-4 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                연결 해제
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <XCircle size={16} />
                <span className="text-sm">연결되지 않음</span>
              </div>
              <p className="text-xs text-gray-500">
                Google 캘린더를 연결하면 일정을 알프레도가 관리해드려요
              </p>
              <button
                onClick={handleConnectGoogle}
                disabled={connecting}
                className="w-full py-2.5 px-4 bg-lavender-400 text-white rounded-xl hover:bg-lavender-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Bell size={18} className="text-lavender-400" />
            알림
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">아침 브리핑</span>
              <button
                onClick={function() { handleAlfredoSettingChange('notificationsEnabled', !alfredoSettings.notificationsEnabled); }}
                className={
                  'w-11 h-6 rounded-full relative transition-colors ' +
                  (alfredoSettings.notificationsEnabled ? 'bg-lavender-400' : 'bg-gray-300')
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
        <div className="bg-white rounded-2xl shadow-sm">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">알프레도 v0.2.0</p>
      </div>
    </div>
  );
}
