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
  RotateCcw,
  Settings as SettingsIcon,
  Scale,
  Zap,
  Monitor,
  Palette
} from 'lucide-react';
import { PageHeader } from '../components/layout';
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
  applyTonePreset,
  getWorkLifeLabel,
  getProactivityLabel,
  TONE_PRESET_INFO,
  getToneAxisLabel,
  getToneExample
} from '../services/alfredoSettings';

export default function Settings() {
  const authStore = useAuthStore();
  const user = authStore.user;
  const logout = authStore.logout;
  
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [connecting, setConnecting] = useState(false);
  
  // 캘린더 선택 관련
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCalendars, setShowCalendars] = useState(false);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  // 알프레도 설정
  const [settings, setSettings] = useState<AlfredoSettings>(getAlfredoSettings());
  const [showToneCustom, setShowToneCustom] = useState(false);

  useEffect(function checkGoogleConnection() {
    const connected = isGoogleConnected();
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
          const primaryCal = list.find(function(c) { return c.primary; });
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
    let newSelected: string[];
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

  // 설정 변경 핸들러
  function handleSettingChange<K extends keyof AlfredoSettings>(
    key: K, 
    value: AlfredoSettings[K]
  ) {
    const updated = saveAlfredoSettings({ [key]: value });
    setSettings(updated);
  }

  function handleToneAxisChange(axis: keyof AlfredoSettings['toneAxes'], value: number) {
    const newAxes = { ...settings.toneAxes, [axis]: value };
    const updated = saveAlfredoSettings({ toneAxes: newAxes, tonePreset: 'custom' });
    setSettings(updated);
  }

  function handleResetSettings() {
    if (confirm('모든 설정을 초기화할까요?')) {
      const reset = resetAlfredoSettings();
      setSettings(reset);
      setShowToneCustom(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader />
      
      <div className="max-w-lg mx-auto px-4 py-2 space-y-4">
        
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2">
          <SettingsIcon size={20} className="text-[#A996FF]" />
          <h1 className="text-lg font-bold text-[#1A1A1A]">설정</h1>
        </div>

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

        {/* 핵심 기능 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-card space-y-6">
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <span className="text-2xl">🐧</span>
            핵심 기능
          </h2>

          {/* Role Blend */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale size={16} className="text-[#A996FF]" />
              <span className="text-sm font-medium text-[#1A1A1A]">Work-Life Balance</span>
              <span className="text-xs text-[#999999] ml-auto">{getWorkLifeLabel(settings.workLifeBalance)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.workLifeBalance}
              onChange={(e) => handleSettingChange('workLifeBalance', parseInt(e.target.value))}
              className="w-full h-2 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#A996FF]"
            />
            <div className="flex justify-between text-xs text-[#999999] mt-1">
              <span>🏠 Life</span>
              <span>💼 Work</span>
            </div>
          </div>

          {/* Intervention Level */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#A996FF]" />
              <span className="text-sm font-medium text-[#1A1A1A]">개입 수준</span>
              <span className="text-xs text-[#999999] ml-auto">{getProactivityLabel(settings.proactivity)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.proactivity}
              onChange={(e) => handleSettingChange('proactivity', parseInt(e.target.value))}
              className="w-full h-2 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#A996FF]"
            />
            <div className="flex justify-between text-xs text-[#999999] mt-1">
              <span>🤫 최소</span>
              <span>🔊 밀착</span>
            </div>
          </div>

          {/* 기본 뷰 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={16} className="text-[#A996FF]" />
              <span className="text-sm font-medium text-[#1A1A1A]">기본 화면</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['integrated', 'work', 'life'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => handleSettingChange('defaultView', view)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    settings.defaultView === view
                      ? 'bg-[#A996FF] text-white'
                      : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                  }`}
                >
                  {view === 'integrated' && '🌐 통합'}
                  {view === 'work' && '💼 업무'}
                  {view === 'life' && '🏠 일상'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 톤 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-card space-y-4">
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <Palette size={18} className="text-[#A996FF]" />
            알프레도 성격
          </h2>

          {/* 프리셋 선택 */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TONE_PRESET_INFO) as Array<keyof typeof TONE_PRESET_INFO>).map((preset) => {
              const info = TONE_PRESET_INFO[preset];
              const isSelected = settings.tonePreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    const updated = applyTonePreset(preset);
                    setSettings(updated);
                    setShowToneCustom(false);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#A996FF] bg-[#F0F0FF]'
                      : 'border-[#E5E5E5] hover:border-[#CCCCCC]'
                  }`}
                >
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <div className="text-xs font-medium text-[#1A1A1A]">{info.label}</div>
                </button>
              );
            })}
          </div>

          {/* 프리셋 설명 */}
          {settings.tonePreset !== 'custom' && (
            <div className="bg-[#F5F5F5] p-3 rounded-lg">
              <p className="text-sm text-[#666666] mb-1">
                {TONE_PRESET_INFO[settings.tonePreset].desc}
              </p>
              <p className="text-xs text-[#999999] italic">
                {getToneExample(settings)}
              </p>
            </div>
          )}

          {/* 세부 조정 토글 */}
          <button
            onClick={() => setShowToneCustom(!showToneCustom)}
            className="w-full flex items-center justify-between py-2 text-sm text-[#666666] hover:text-[#A996FF]"
          >
            <span>세부 조정하기</span>
            {showToneCustom ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* 5축 커스터마이징 */}
          {showToneCustom && (
            <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
              {(Object.keys(settings.toneAxes) as Array<keyof typeof settings.toneAxes>).map((axis) => (
                <div key={axis}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#666666] capitalize">
                      {axis === 'warmth' && '따뜻함'}
                      {axis === 'proactivity' && '적극성'}
                      {axis === 'directness' && '직접성'}
                      {axis === 'humor' && '유머'}
                      {axis === 'pressure' && '압박'}
                    </span>
                    <span className="text-xs text-[#999999]">
                      {getToneAxisLabel(axis, settings.toneAxes[axis])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={settings.toneAxes[axis]}
                    onChange={(e) => handleToneAxisChange(axis, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#A996FF]"
                  />
                </div>
              ))}
              
              {settings.tonePreset === 'custom' && (
                <p className="text-xs text-[#999999] italic bg-[#F5F5F5] p-2 rounded-lg mt-3">
                  {getToneExample(settings)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-card space-y-4">
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <Bell size={18} className="text-[#A996FF]" />
            알림 설정
          </h2>
          
          {/* 알림 on/off */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">푸시 알림</span>
            <button
              onClick={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
              className={
                'w-11 h-6 rounded-full relative transition-colors ' +
                (settings.notificationsEnabled ? 'bg-[#A996FF]' : 'bg-[#CCCCCC]')
              }
            >
              <span 
                className={
                  'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ' +
                  (settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1')
                }
              />
            </button>
          </div>

          {/* 알림 시간 */}
          {settings.notificationsEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-sm font-medium text-[#666666] block mb-1">아침 브리핑</label>
                <input
                  type="time"
                  value={settings.morningAlertTime}
                  onChange={(e) => handleSettingChange('morningAlertTime', e.target.value)}
                  className="w-full p-2 border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#666666] block mb-1">저녁 리뷰</label>
                <input
                  type="time"
                  value={settings.eveningAlertTime}
                  onChange={(e) => handleSettingChange('eveningAlertTime', e.target.value)}
                  className="w-full p-2 border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A]"
                />
              </div>
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
                  className="w-full flex items-center justify-between py-2 text-sm text-[#666666] hover:text-[#A996FF]"
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
                      const isSelected = selectedIds.includes(cal.id);
                      return (
                        <button
                          key={cal.id}
                          onClick={() => handleToggleCalendar(cal.id)}
                          className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#F5F5F5] text-left"
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
                className="w-full py-2.5 px-4 text-sm text-[#EF4444] border border-[#FECACA] rounded-xl hover:bg-[#FEF2F2] transition-colors"
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
                className="w-full py-2.5 px-4 bg-[#A996FF] text-white rounded-xl hover:bg-[#8B7BE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* 초기화 & 로그아웃 */}
        <div className="bg-white rounded-xl shadow-card divide-y divide-[#E5E5E5]">
          <button
            onClick={handleResetSettings}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#666666] hover:bg-[#F5F5F5] rounded-t-xl"
          >
            <RotateCcw size={20} />
            <span>설정 초기화</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] rounded-b-xl"
          >
            <LogOut size={20} />
            <span>로그아웃</span>
          </button>
        </div>

        <p className="text-center text-xs text-[#999999]">알프레도 v0.3.0</p>
      </div>
    </div>
  );
}
