import React, { useState } from 'react';
import { 
  ArrowLeft, User, Bell, Moon, Palette, Shield, ChevronRight,
  LogOut, Trash2, Database, Cloud, RefreshCw
} from 'lucide-react';

// Other Components
import GoogleAuthModal from '../modals/GoogleAuthModal';

const SettingsPage = ({ userData, onUpdateUserData, onBack, darkMode, setDarkMode, onOpenWidgetGallery, connections, onConnect, onDisconnect }) => {
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
  
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-7 rounded-full transition-all duration-200 ${
        enabled ? 'bg-[#A996FF]' : 'bg-gray-200'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
  
  const SettingItem = ({ icon, title, description, children }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
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
          <span className="font-medium text-gray-700">{name}</span>
          {connected && <p className="text-xs text-emerald-500">user@gmail.com</p>}
        </div>
      </div>
      <button
        onClick={() => setAuthModal({ isOpen: true, service: serviceKey })}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          connected 
            ? 'bg-emerald-50 text-emerald-600' 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {connected ? '연결됨 ✓' : '연결하기'}
      </button>
    </div>
  );
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0EBFF]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">설정</h1>
      </div>
      
      <div className="p-4 pb-32 space-y-4">
        
        {/* 프로필 섹션 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] flex items-center justify-center text-2xl text-white font-bold shadow-lg">
              {userData?.name?.[0] || 'B'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{userData?.name || 'Boss'}</h2>
              <p className="text-sm text-gray-500">Life Butler 사용자</p>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* 외관 설정 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            {darkMode ? <Moon size={18} className="text-[#A996FF]" /> : <Sun size={18} className="text-[#A996FF]" />}
            외관
          </h3>
          
          <div className="divide-y divide-gray-100">
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
            
            <button 
              onClick={onOpenWidgetGallery}
              className="w-full"
            >
              <SettingItem 
                icon="📱" 
                title="위젯 갤러리" 
                description="다양한 크기의 위젯 미리보기"
              >
                <ChevronRight size={20} className="text-gray-400" />
              </SettingItem>
            </button>
          </div>
        </div>
        
        {/* 알림 설정 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Bell size={18} className="text-[#A996FF]" />
            알림 설정
          </h3>
          
          <div className="divide-y divide-gray-100">
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
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Zap size={18} className="text-[#A996FF]" />
            연동 서비스
          </h3>
          
          <div className="divide-y divide-gray-100">
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
          
          <p className="text-xs text-gray-400 mt-3 text-center">
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
        />
        
        {/* 집중 모드 설정 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Zap size={18} className="text-[#A996FF]" />
            집중 모드
          </h3>
          
          <div className="divide-y divide-gray-100">
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
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2">앱 정보</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">버전</span>
              <span className="text-gray-700 font-medium">1.0.0 (Beta)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">빌드</span>
              <span className="text-gray-700 font-medium">2024.12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">플랫폼</span>
              <span className="text-gray-700 font-medium">PWA</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
              피드백 보내기
            </button>
            <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
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
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-4">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Database size={18} className="text-gray-500" />
            데이터 관리
          </h3>
          
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">저장된 데이터</span>
              <span className="text-gray-700 font-medium">로컬 저장소</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">자동 저장</span>
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

// === Home Page ===

export default SettingsPage;
