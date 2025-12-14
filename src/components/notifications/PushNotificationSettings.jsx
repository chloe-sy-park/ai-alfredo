import React, { useState } from 'react';
import { Bell, BellOff, Check, AlertCircle } from 'lucide-react';

/**
 * 푸시 알림 설정 컴포넌트
 */
var PushNotificationSettings = function(props) {
  var permission = props.permission;
  var isSupported = props.isSupported;
  var onRequestPermission = props.onRequestPermission;
  var settings = props.settings || {};
  var onSettingsChange = props.onSettingsChange;
  var darkMode = props.darkMode;
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var updateSetting = function(key, value) {
    if (onSettingsChange) {
      var newSettings = Object.assign({}, settings);
      newSettings[key] = value;
      onSettingsChange(newSettings);
    }
  };
  
  // 권한 상태 뱃지
  var renderPermissionBadge = function() {
    if (!isSupported) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          <AlertCircle size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">미지원 브라우저</span>
        </div>
      );
    }
    
    if (permission === 'granted') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
          <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">활성화됨</span>
        </div>
      );
    }
    
    if (permission === 'denied') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
          <BellOff size={14} className="text-red-600 dark:text-red-400" />
          <span className="text-xs text-red-600 dark:text-red-400">차단됨</span>
        </div>
      );
    }
    
    return (
      <button
        onClick={onRequestPermission}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A996FF] text-white rounded-full text-xs font-semibold hover:bg-[#8B7CF7] transition-colors"
      >
        <Bell size={14} />
        권한 요청
      </button>
    );
  };
  
  return (
    <div className={cardBg + ' rounded-xl border ' + borderColor + ' overflow-hidden'}>
      {/* 헤더 */}
      <div className={'p-4 border-b ' + borderColor + ' flex items-center justify-between'}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h3 className={textPrimary + ' font-semibold'}>푸시 알림</h3>
            <p className={textSecondary + ' text-xs'}>브라우저 알림으로 중요한 일정을 놓치지 마세요</p>
          </div>
        </div>
        {renderPermissionBadge()}
      </div>
      
      {/* 권한 차단 안내 */}
      {permission === 'denied' && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            알림이 차단되어 있어요. 브라우저 설정에서 이 사이트의 알림을 허용해주세요.
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            주소창 왼쪽의 🔒 아이콘 → 알림 → 허용
          </p>
        </div>
      )}
      
      {/* 알림 설정 옵션들 */}
      {permission === 'granted' && (
        <div className="p-4 space-y-4">
          {/* 일정 알림 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <div>
                <p className={textPrimary + ' text-sm font-medium'}>일정 알림</p>
                <p className={textSecondary + ' text-xs'}>일정 시작 전 알림</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.eventReminders !== false}
              onChange={function(v) { updateSetting('eventReminders', v); }}
            />
          </div>
          
          {/* 일정 알림 시간 선택 */}
          {settings.eventReminders !== false && (
            <div className={'ml-9 p-3 rounded-lg ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50')}>
              <p className={textSecondary + ' text-xs mb-2'}>알림 시간</p>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 30, 60].map(function(min) {
                  var isSelected = (settings.eventReminderMinutes || 10) === min;
                  return (
                    <button
                      key={min}
                      onClick={function() { updateSetting('eventReminderMinutes', min); }}
                      className={
                        (isSelected 
                          ? 'bg-[#A996FF] text-white' 
                          : (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600 border border-gray-200')
                        ) + ' px-3 py-1.5 rounded-lg text-xs font-medium transition-colors'
                      }
                    >
                      {min >= 60 ? (min / 60) + '시간' : min + '분'} 전
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* 태스크 리마인더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className={textPrimary + ' text-sm font-medium'}>태스크 리마인더</p>
                <p className={textSecondary + ' text-xs'}>마감 임박 태스크 알림</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.taskReminders !== false}
              onChange={function(v) { updateSetting('taskReminders', v); }}
            />
          </div>
          
          {/* 휴식 알림 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">☕</span>
              <div>
                <p className={textPrimary + ' text-sm font-medium'}>휴식 알림</p>
                <p className={textSecondary + ' text-xs'}>장시간 작업 시 휴식 권유</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.breakReminders !== false}
              onChange={function(v) { updateSetting('breakReminders', v); }}
            />
          </div>
          
          {/* 알프레도 메시지 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🐧</span>
              <div>
                <p className={textPrimary + ' text-sm font-medium'}>알프레도 알림</p>
                <p className={textSecondary + ' text-xs'}>알프레도의 조언과 격려</p>
              </div>
            </div>
            <ToggleSwitch 
              enabled={settings.alfredoMessages !== false}
              onChange={function(v) { updateSetting('alfredoMessages', v); }}
            />
          </div>
        </div>
      )}
      
      {/* 테스트 버튼 */}
      {permission === 'granted' && (
        <div className={'p-4 border-t ' + borderColor}>
          <button
            onClick={function() {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🐧 알프레도', {
                  body: '푸시 알림이 잘 작동하고 있어요!',
                  icon: '/alfredo-icon.png'
                });
              }
            }}
            className={'w-full py-2.5 rounded-xl text-sm font-medium ' + (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200') + ' transition-colors'}
          >
            테스트 알림 보내기
          </button>
        </div>
      )}
    </div>
  );
};

// 토글 스위치 컴포넌트
var ToggleSwitch = function(props) {
  var enabled = props.enabled;
  var onChange = props.onChange;
  
  return (
    <button
      onClick={function() { if (onChange) onChange(!enabled); }}
      className={
        (enabled ? 'bg-[#A996FF]' : 'bg-gray-300 dark:bg-gray-600') +
        ' relative w-11 h-6 rounded-full transition-colors'
      }
    >
      <span 
        className={
          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ' +
          (enabled ? 'left-[22px]' : 'left-0.5')
        }
      />
    </button>
  );
};

export { PushNotificationSettings, ToggleSwitch };
export default PushNotificationSettings;
