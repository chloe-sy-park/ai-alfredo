import React, { useState } from 'react';
import { 
  BarChart3, Calendar, Zap, FolderKanban, Settings,
  ChevronRight, ExternalLink, Check, X, RefreshCw,
  Mail, HardDrive, MessageSquare, Bell, Shield, HelpCircle,
  Sparkles, Trophy, TrendingUp, Heart, Target, Flame, Download, Upload
} from 'lucide-react';

// W2: 게이미피케이션
import { LevelXpBar, useGamification } from '../gamification/LevelSystem';

// W4: 분석
import { StatsPage } from '../analytics/StatsDashboard';
import { HabitTracker } from '../analytics/HabitTracker';
import { DataManagementPage, ExportButton, ImportButton } from '../analytics/DataManagement';

// Default gameState to prevent crashes
const DEFAULT_GAME_STATE = {
  totalXP: 0,
  todayXP: 0,
  todayTasks: 0,
  streak: 0,
  focusSessions: 0,
  level: 1,
  currentStreak: 0
};

var MorePage = function(props) {
  var darkMode = props.darkMode;
  var connections = props.connections || {};
  var onConnect = props.onConnect;
  var onDisconnect = props.onDisconnect;
  var onOpenSettings = props.onOpenSettings;
  var setView = props.setView;
  
  // Defensive: merge with defaults
  var gameState = Object.assign({}, DEFAULT_GAME_STATE, props.gameState);
  
  // 서브페이지 상태
  var subPageState = useState(null); // 'stats', 'habits', 'data'
  var currentSubPage = subPageState[0];
  var setSubPage = subPageState[1];
  
  // 게이미피케이션 훅
  var gamification = useGamification ? useGamification() : gameState;

  // 다크모드 색상
  var bgGradient = darkMode 
    ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
    : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';

  // 연동 서비스 목록
  var services = [
    {
      id: 'googleCalendar',
      name: 'Google Calendar',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      description: '일정 동기화'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      color: 'from-red-500 to-red-600',
      description: '이메일 알림'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: HardDrive,
      color: 'from-gray-700 to-gray-800',
      description: '메모/문서 연동'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      description: '팀 메시지 알림'
    }
  ];

  // 인사이트 메뉴 (게임센터 제거, 통계에 통합)
  var insightMenus = [
    {
      id: 'stats',
      name: '통계 & 성장',
      icon: '📊',
      color: 'from-[#A996FF] to-[#8B7CF7]',
      description: '분석, 퀘스트, 배지',
      onClick: function() { setSubPage('stats'); }
    },
    {
      id: 'habits',
      name: '습관 트래커',
      icon: '🎯',
      color: 'from-emerald-400 to-emerald-600',
      description: '루틴 관리',
      onClick: function() { setSubPage('habits'); }
    },
    {
      id: 'data',
      name: '데이터 관리',
      icon: '💾',
      color: 'from-blue-400 to-blue-600',
      description: '백업 & 복원',
      onClick: function() { setSubPage('data'); }
    }
  ];

  // 토글 핸들러
  var handleToggle = function(serviceId) {
    if (connections[serviceId]) {
      if (onDisconnect) onDisconnect(serviceId);
    } else {
      if (onConnect) onConnect(serviceId);
    }
  };
  
  // 서브페이지 렌더링
  if (currentSubPage === 'stats') {
    return React.createElement(StatsPage, {
      darkMode: darkMode,
      weekData: {},
      monthData: {},
      gameData: gamification,
      onBack: function() { setSubPage(null); }
    });
  }
  
  if (currentSubPage === 'habits') {
    return React.createElement('div', { className: bgGradient + ' min-h-screen pb-24' },
      React.createElement('div', { className: 'px-4 pt-6 pb-4' },
        React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
          React.createElement('button', {
            onClick: function() { setSubPage(null); },
            className: textSecondary + ' hover:' + textPrimary + ' text-xl'
          }, '←'),
          React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '🎯 습관 트래커')
        )
      ),
      React.createElement('div', { className: 'px-4' },
        React.createElement(HabitTracker, { darkMode: darkMode })
      )
    );
  }
  
  if (currentSubPage === 'data') {
    return React.createElement(DataManagementPage, {
      darkMode: darkMode,
      onBack: function() { setSubPage(null); }
    });
  }

  return (
    <div className={bgGradient + ' flex-1 overflow-y-auto transition-colors duration-300'}>
      <div className="px-4 pb-32 pt-4">
        
        {/* ===== 헤더 ===== */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={textPrimary + ' text-2xl font-bold'}>더보기</h1>
            <p className={textSecondary + ' text-sm mt-0.5'}>인사이트와 설정</p>
          </div>
          <button 
            onClick={onOpenSettings}
            className={(darkMode ? 'bg-gray-700' : 'bg-white') + ' w-10 h-10 rounded-full flex items-center justify-center shadow-sm'}
          >
            <Settings size={20} className={textSecondary} />
          </button>
        </div>
        
        {/* ===== 레벨 & XP 바 (클릭시 통계 페이지로) ===== */}
        <button 
          onClick={function() { setSubPage('stats'); }}
          className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-lg p-4 mb-4 border ' + borderColor + ' w-full text-left hover:border-[#A996FF]/50 transition-all'}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center text-white font-bold text-xl">
                {gamification.level || 1}
              </div>
              <div>
                <p className={textPrimary + ' font-bold'}>Level {gamification.level || 1}</p>
                <p className={textSecondary + ' text-sm'}>{(gamification.totalXp || 0).toLocaleString()} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {gamification.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame size={18} />
                  <span className="font-bold">{gamification.currentStreak}일</span>
                </div>
              )}
              <ChevronRight size={18} className={textSecondary} />
            </div>
          </div>
          <p className={textSecondary + ' text-xs text-center'}>탭하여 통계 & 게임센터 보기</p>
        </button>

        {/* ===== 나의 인사이트 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-lg p-5 mb-4 border ' + borderColor}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#A996FF]" />
            <span className={textPrimary + ' font-bold'}>나의 인사이트</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {insightMenus.map(function(menu) {
              return (
                <button
                  key={menu.id}
                  onClick={menu.onClick}
                  className={(darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100') + ' p-4 rounded-xl transition-all text-left group'}
                >
                  <div className={'w-12 h-12 bg-gradient-to-br ' + menu.color + ' rounded-xl flex items-center justify-center text-xl shadow-md mb-3 group-hover:scale-105 transition-transform'}>
                    {menu.icon}
                  </div>
                  <p className={textPrimary + ' font-semibold text-sm'}>{menu.name}</p>
                  <p className={textSecondary + ' text-xs mt-0.5'}>{menu.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 빠른 통계 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-sm p-4 mb-4 border ' + borderColor}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-amber-500" />
            <span className={textPrimary + ' font-bold'}>이번 주 성과</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className={(darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]') + ' rounded-xl p-3 text-center'}>
              <p className="text-2xl font-bold text-[#A996FF]">{gameState.todayXP || 0}</p>
              <p className={textSecondary + ' text-xs'}>오늘 XP</p>
            </div>
            <div className={(darkMode ? 'bg-gray-700/50' : 'bg-emerald-50') + ' rounded-xl p-3 text-center'}>
              <p className="text-2xl font-bold text-emerald-500">{gameState.todayTasks || 0}</p>
              <p className={textSecondary + ' text-xs'}>완료 태스크</p>
            </div>
            <div className={(darkMode ? 'bg-gray-700/50' : 'bg-amber-50') + ' rounded-xl p-3 text-center'}>
              <p className="text-2xl font-bold text-amber-500">{gameState.focusSessions || 0}</p>
              <p className={textSecondary + ' text-xs'}>집중 세션</p>
            </div>
          </div>
        </div>

        {/* ===== 연동 서비스 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-lg p-5 mb-4 border ' + borderColor}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="text-[#A996FF]" />
              <span className={textPrimary + ' font-bold'}>연동 서비스</span>
            </div>
            <span className={textSecondary + ' text-xs'}>
              {Object.values(connections).filter(Boolean).length}개 연결됨
            </span>
          </div>
          
          <div className="space-y-3">
            {services.map(function(service) {
              var isConnected = connections[service.id];
              var IconComponent = service.icon;
              
              return (
                <div 
                  key={service.id}
                  className={(darkMode ? 'bg-gray-700/50' : 'bg-gray-50') + ' flex items-center justify-between p-4 rounded-xl'}
                >
                  <div className="flex items-center gap-3">
                    <div className={'w-10 h-10 bg-gradient-to-br ' + service.color + ' rounded-xl flex items-center justify-center shadow-sm'}>
                      <IconComponent size={20} className="text-white" />
                    </div>
                    <div>
                      <p className={textPrimary + ' font-semibold text-sm'}>{service.name}</p>
                      <p className={textSecondary + ' text-xs'}>{service.description}</p>
                    </div>
                  </div>
                  
                  {/* 토글 스위치 */}
                  <button
                    onClick={function() { handleToggle(service.id); }}
                    className={(isConnected 
                      ? 'bg-[#A996FF]' 
                      : (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                    ) + ' relative w-12 h-7 rounded-full transition-colors'}
                  >
                    <div className={(isConnected ? 'translate-x-5' : 'translate-x-0.5') + ' absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform'} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* ===== 빠른 백업 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-sm p-4 mb-4 border ' + borderColor}>
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={18} className="text-[#A996FF]" />
            <span className={textPrimary + ' font-bold'}>데이터</span>
          </div>
          <div className="flex gap-2">
            <ExportButton darkMode={darkMode} compact={true} />
            <ImportButton darkMode={darkMode} compact={true} />
          </div>
        </div>

        {/* ===== 기타 메뉴 ===== */}
        <div className={cardBg + ' backdrop-blur-xl rounded-2xl shadow-sm p-4 mb-4 border ' + borderColor}>
          <div className="space-y-1">
            {[
              { icon: Bell, label: '알림 설정', onClick: onOpenSettings },
              { icon: Shield, label: '개인정보 보호', onClick: onOpenSettings },
              { icon: HelpCircle, label: '도움말', onClick: function() {} }
            ].map(function(item, index) {
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={(darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50') + ' w-full flex items-center justify-between p-3 rounded-xl transition-all'}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={textSecondary} />
                    <span className={textPrimary + ' font-medium'}>{item.label}</span>
                  </div>
                  <ChevronRight size={18} className={textSecondary} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 앱 정보 ===== */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🐧</span>
            <span className={textPrimary + ' font-bold'}>Life Butler</span>
          </div>
          <p className={textSecondary + ' text-xs'}>v1.1.0 · Made with 💜</p>
        </div>

      </div>
    </div>
  );
};

export default MorePage;
