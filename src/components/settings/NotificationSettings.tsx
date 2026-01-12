import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * 알림 설정 컴포넌트
 * Settings 페이지에서 사용
 */
export default function NotificationSettings() {
  const {
    permission,
    isSupported,
    isEnabled,
    settings,
    requestPermission,
    updateSettings,
    setEnabled,
    showMorningBriefing // 테스트용
  } = useNotifications();

  const [testSent, setTestSent] = useState(false);

  // 권한 요청 핸들러
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setEnabled(true);
    }
  };

  // 테스트 알림 발송
  const handleTestNotification = async () => {
    const success = await showMorningBriefing();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  // 지원하지 않는 브라우저
  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-100 rounded-xl">
        <div className="flex items-center gap-2 text-gray-500">
          <span>🔕</span>
          <span className="text-sm">이 브라우저는 알림을 지원하지 않아요</span>
        </div>
      </div>
    );
  }

  // 권한 거부됨
  if (permission === 'denied') {
    return (
      <div className="p-4 bg-red-50 rounded-xl">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <span>🚫</span>
          <span className="font-medium">알림이 차단되어 있어요</span>
        </div>
        <p className="text-sm text-red-500">
          브라우저 설정에서 이 사이트의 알림 권한을 허용해주세요.
        </p>
      </div>
    );
  }

  // 권한 미요청
  if (permission === 'default') {
    return (
      <div className="p-4 bg-purple-50 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🐧</span>
          <div>
            <h3 className="font-medium text-gray-800">알림 받기</h3>
            <p className="text-sm text-gray-600">
              알프레도가 중요한 순간에 알려드릴게요
            </p>
          </div>
        </div>
        
        <ul className="text-sm text-gray-600 mb-4 space-y-1 ml-10">
          <li>• 아침 브리핑 알림</li>
          <li>• 미팅 시작 전 리마인드</li>
          <li>• 휴식 시간 알림</li>
        </ul>
        
        <button
          onClick={handleRequestPermission}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium
            hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          알림 허용하기
        </button>
      </div>
    );
  }

  // 권한 허용됨 - 세부 설정
  return (
    <div className="space-y-4">
      {/* 마스터 토글 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <h3 className="font-medium text-gray-800">알림</h3>
            <p className="text-sm text-gray-500">
              {isEnabled ? '알림을 받고 있어요' : '알림이 꺼져 있어요'}
            </p>
          </div>
        </div>
        <ToggleSwitch
          checked={isEnabled}
          onChange={setEnabled}
        />
      </div>

      {isEnabled && (
        <>
          {/* 아침 브리핑 */}
          <SettingItem
            icon="🌅"
            title="아침 브리핑"
            description="하루 시작할 때 일정 알려주기"
            checked={settings.morningBriefing}
            onChange={(v) => updateSettings({ morningBriefing: v })}
          >
            {settings.morningBriefing && (
              <TimeSelect
                value={settings.morningBriefingTime}
                onChange={(v) => updateSettings({ morningBriefingTime: v })}
                label="시간"
              />
            )}
          </SettingItem>

          {/* 미팅 리마인더 */}
          <SettingItem
            icon="📅"
            title="미팅 알림"
            description="미팅 시작 전 알려주기"
            checked={settings.meetingReminder}
            onChange={(v) => updateSettings({ meetingReminder: v })}
          >
            {settings.meetingReminder && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">미리</span>
                <select
                  value={settings.meetingReminderMinutes}
                  onChange={(e) => updateSettings({ 
                    meetingReminderMinutes: Number(e.target.value) 
                  })}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg
                    text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5분</option>
                  <option value={10}>10분</option>
                  <option value={15}>15분</option>
                  <option value={30}>30분</option>
                </select>
                <span className="text-sm text-gray-500">전</span>
              </div>
            )}
          </SettingItem>

          {/* 휴식 알림 */}
          <SettingItem
            icon="☕"
            title="휴식 알림"
            description="집중 시간 후 쉬어가라고 알려주기"
            checked={settings.breakReminder}
            onChange={(v) => updateSettings({ breakReminder: v })}
          >
            {settings.breakReminder && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">매</span>
                <select
                  value={settings.breakReminderInterval}
                  onChange={(e) => updateSettings({ 
                    breakReminderInterval: Number(e.target.value) 
                  })}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg
                    text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={25}>25분</option>
                  <option value={45}>45분</option>
                  <option value={60}>60분</option>
                  <option value={90}>90분</option>
                </select>
                <span className="text-sm text-gray-500">마다</span>
              </div>
            )}
          </SettingItem>

          {/* 저녁 마무리 */}
          <SettingItem
            icon="🌙"
            title="저녁 마무리"
            description="하루 마무리하고 쉬라고 알려주기"
            checked={settings.eveningWrap}
            onChange={(v) => updateSettings({ eveningWrap: v })}
          >
            {settings.eveningWrap && (
              <TimeSelect
                value={settings.eveningWrapTime}
                onChange={(v) => updateSettings({ eveningWrapTime: v })}
                label="시간"
              />
            )}
          </SettingItem>

          {/* 격려 메시지 */}
          <SettingItem
            icon="💪"
            title="격려 메시지"
            description="잘하고 있다고 가끔 알려주기"
            checked={settings.encouragement}
            onChange={(v) => updateSettings({ encouragement: v })}
          />

          {/* 테스트 버튼 */}
          <div className="pt-2">
            <button
              onClick={handleTestNotification}
              disabled={testSent}
              className={`w-full py-3 rounded-xl font-medium transition-all
                ${testSent 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98]'
                }`}
            >
              {testSent ? '✓ 테스트 알림 전송됨!' : '🧪 테스트 알림 보내기'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 토글 스위치
function ToggleSwitch({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors
        ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow
          transition-transform ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

// 설정 항목
function SettingItem({
  icon,
  title,
  description,
  checked,
  onChange,
  children
}: {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <h4 className="font-medium text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
      {children && <div className="ml-10 mt-2">{children}</div>}
    </div>
  );
}

// 시간 선택
function TimeSelect({
  value,
  onChange,
  label
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  const [hour, minute] = value.split(':');

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-sm text-gray-500">{label}</span>
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg
          text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {hours.map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span>:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg
          text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="00">00</option>
        <option value="15">15</option>
        <option value="30">30</option>
        <option value="45">45</option>
      </select>
    </div>
  );
}
