import { useAuthStore } from '../stores/authStore';
import { User, Bell, LogOut, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuthStore();

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
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">알프레도 v0.1.0</p>
    </div>
  );
}
