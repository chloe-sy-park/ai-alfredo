import { useAuthStore } from '../stores/authStore';
import {
  User,
  Bell,
  Palette,
  Shield,
  Calendar,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuthStore();

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* 프로필 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-lavender-100 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full" />
            ) : (
              <User size={32} className="text-lavender-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name || '사용자'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* 알프레도 톤 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold mb-3">🐧 알프레도 톤</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '따뜻한 친구', emoji: '🤗' },
            { label: '멘토', emoji: '🧑‍🏫' },
            { label: 'CEO', emoji: '💼' },
            { label: '응원단', emoji: '💪' },
          ].map((option, i) => (
            <button
              key={i}
              className={`p-3 rounded-xl text-left transition-all ${
                i === 0
                  ? 'bg-lavender-100 border-2 border-lavender-400'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{option.emoji}</span>
              <p className="text-sm font-medium mt-1">{option.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Bell size={18} className="text-lavender-400" />
          알림
        </h2>
        <div className="space-y-3">
          <ToggleItem label="아침 브리핑" defaultChecked={true} />
          <ToggleItem label="저녁 마무리" defaultChecked={true} />
          <ToggleItem label="태스크 리마인더" defaultChecked={false} />
          <ToggleItem label="미팅 알림" defaultChecked={true} />
        </div>
      </div>

      {/* 기타 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm">
        <MenuItem icon={<Calendar />} label="캐린더 연동" />
        <MenuItem icon={<Shield />} label="개인정보 설정" />
        <MenuItem icon={<Palette />} label="테마" />
        <MenuItem icon={<HelpCircle />} label="도움말" />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>

      {/* 버전 */}
      <p className="text-center text-xs text-gray-400">
        알프레도 v0.1.0
      </p>
    </div>
  );
}

function ToggleItem({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className={`w-11 h-6 rounded-full transition-colors relative ${
        defaultChecked ? 'bg-lavender-400' : 'bg-gray-200'
      }`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          defaultChecked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </div>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 text-gray-700">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </button>
  );
}
