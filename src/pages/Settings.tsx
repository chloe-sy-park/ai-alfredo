import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Bell, LogOut, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { 
  isGoogleConnected, 
  getGoogleUser, 
  startGoogleAuth, 
  disconnectGoogle 
} from '../services/auth';

export default function Settings() {
  var authStore = useAuthStore();
  var user = authStore.user;
  var logout = authStore.logout;
  
  var [googleConnected, setGoogleConnected] = useState(false);
  var [googleUser, setGoogleUser] = useState(null);
  var [connecting, setConnecting] = useState(false);

  useEffect(function checkGoogleConnection() {
    setGoogleConnected(isGoogleConnected());
    setGoogleUser(getGoogleUser());
  }, []);

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
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
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
            <div className="w-11 h-6 bg-lavender-400 rounded-full relative">
              <span className="absolute top-1 translate-x-6 w-4 h-4 bg-white rounded-full shadow" />
            </div>
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

      <p className="text-center text-xs text-gray-400">알프레도 v0.1.0</p>
    </div>
  );
}
