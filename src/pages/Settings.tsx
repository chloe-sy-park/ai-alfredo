// Settings.tsx - 설정 페이지 (카테고리 분리 구조)
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, LogOut, Brain, Bell, Moon, Clock, BellOff, Sun, Monitor, Sliders, Settings2, Loader2, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAlfredoStore } from '../stores/alfredoStore';
import { useNotificationSettingsStore } from '../stores/notificationSettingsStore';
import { useThemeStore, Theme } from '../stores/themeStore';
import { usePushNotification } from '../hooks/usePushNotification';
import {
  DomainSwitcher,
  UnderstandingCard,
  LearningsList,
  WeeklyReportCard,
  PendingLearningsList
} from '../components/alfredo';
import { PenguinPersonalitySliders } from '../components/settings';
import { PenguinWidget } from '../components/penguin';

// 설정 카테고리 정의 (ADHD-friendly: 2개 탭으로 단순화)
type SettingsCategory = 'general' | 'advanced';

interface CategoryTab {
  id: SettingsCategory;
  label: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'general', label: '기본 설정', icon: Settings2, description: '성격, 테마, 알림' },
  { id: 'advanced', label: '고급', icon: Brain, description: '학습, 계정' },
];

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const { initialize: initAlfredo, preferences: alfredoPrefs, isLoading: alfredoLoading } = useAlfredoStore();
  const notificationSettings = useNotificationSettingsStore();
  const { theme, setTheme } = useThemeStore();
  const pushNotification = usePushNotification();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');

  // 알프레도 스토어 초기화
  useEffect(() => {
    if (user?.email && !alfredoPrefs) {
      initAlfredo(user.email);
    }
  }, [user?.email, alfredoPrefs, initAlfredo]);

  // 로그아웃
  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      signOut();
      navigate('/login');
    }
  };
  
  // 카테고리별 컨텐츠 렌더링
  function renderCategoryContent() {
    switch (activeCategory) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* 알프레도 성격 설정 */}
            <section className="bg-white dark:bg-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Sliders className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-text-primary dark:text-white">알프레도 성격</h2>
              </div>
              <PenguinPersonalitySliders />
            </section>

            {/* Theme Section */}
            <section className="bg-white dark:bg-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-5 h-5 text-primary" aria-hidden="true" />
                <h2 className="text-base font-semibold text-text-primary dark:text-white">화면 테마</h2>
              </div>

              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="테마 선택">
                {[
                  { value: 'light' as Theme, label: '라이트', icon: Sun },
                  { value: 'dark' as Theme, label: '다크', icon: Moon },
                  { value: 'system' as Theme, label: '시스템', icon: Monitor },
                ].map((option) => (
                  <button
                    key={option.value}
                    role="radio"
                    aria-checked={theme === option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      theme === option.value
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-neutral-100 dark:bg-neutral-700 border-2 border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    <option.icon size={20} className={theme === option.value ? 'text-primary' : 'text-text-muted dark:text-gray-400'} aria-hidden="true" />
                    <span className={`text-sm ${theme === option.value ? 'text-primary font-medium' : 'text-text-secondary dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Notification Settings Section */}
            <section className="bg-white dark:bg-neutral-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
                  <h2 className="text-base font-semibold text-text-primary dark:text-white">알림 설정</h2>
                </div>
                <button
                  onClick={() => notificationSettings.toggleNotification('enabled')}
                  role="switch"
                  aria-checked={notificationSettings.enabled}
                  aria-label="알림 활성화"
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationSettings.enabled ? 'bg-primary' : 'bg-neutral-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationSettings.enabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {notificationSettings.enabled && (
                <div className="space-y-4">
                  {/* 알림 종류 토글 */}
                  <div className="space-y-3">
                    {[
                      { key: 'morningBriefing' as const, label: '아침 브리핑', desc: '오늘의 일정과 할일 요약' },
                      { key: 'taskReminders' as const, label: '태스크 리마인더', desc: '마감 전 알림' },
                      { key: 'meetingReminders' as const, label: '미팅 리마인더', desc: '미팅 시작 전 알림' },
                      { key: 'breakReminders' as const, label: '휴식 알림', desc: '집중 후 휴식 권유' },
                      { key: 'alfredoNudges' as const, label: '알프레도 넛지', desc: '도움이 될 만한 제안' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-text-primary dark:text-white">{item.label}</div>
                          <div className="text-xs text-text-muted dark:text-gray-400">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => notificationSettings.toggleNotification(item.key)}
                          role="switch"
                          aria-checked={notificationSettings[item.key]}
                          aria-label={item.label}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            notificationSettings[item.key] ? 'bg-primary' : 'bg-neutral-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings[item.key] ? 'left-5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 조용한 시간 */}
                  <div className="border-t border-neutral-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Moon size={16} className="text-text-muted dark:text-gray-400" aria-hidden="true" />
                        <span className="text-sm font-medium text-text-primary dark:text-white">조용한 시간</span>
                      </div>
                      <button
                        onClick={() => notificationSettings.toggleNotification('quietHoursEnabled')}
                        role="switch"
                        aria-checked={notificationSettings.quietHoursEnabled}
                        aria-label="조용한 시간"
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          notificationSettings.quietHoursEnabled ? 'bg-primary' : 'bg-neutral-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            notificationSettings.quietHoursEnabled ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {notificationSettings.quietHoursEnabled && (
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="time"
                          value={notificationSettings.quietHoursStart}
                          onChange={(e) => notificationSettings.setQuietHours(e.target.value, notificationSettings.quietHoursEnd)}
                          aria-label="조용한 시간 시작"
                          className="px-2 py-1 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                        />
                        <span className="text-text-muted dark:text-gray-400">~</span>
                        <input
                          type="time"
                          value={notificationSettings.quietHoursEnd}
                          onChange={(e) => notificationSettings.setQuietHours(notificationSettings.quietHoursStart, e.target.value)}
                          aria-label="조용한 시간 종료"
                          className="px-2 py-1 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* 아침 브리핑 시간 */}
                  {notificationSettings.morningBriefing && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-text-muted dark:text-gray-400" aria-hidden="true" />
                        <span className="text-sm text-text-primary dark:text-white">아침 브리핑 시간</span>
                      </div>
                      <input
                        type="time"
                        value={notificationSettings.morningBriefingTime}
                        onChange={(e) => notificationSettings.setMorningBriefingTime(e.target.value)}
                        aria-label="아침 브리핑 시간"
                        className="px-2 py-1 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                      />
                    </div>
                  )}

                  {/* 미팅 리마인더 시간 */}
                  {notificationSettings.meetingReminders && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-primary dark:text-white">미팅 알림</span>
                      <select
                        value={notificationSettings.meetingReminderMinutes}
                        onChange={(e) => notificationSettings.setMeetingReminderMinutes(Number(e.target.value))}
                        aria-label="미팅 알림 시간"
                        className="px-2 py-1 border border-neutral-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                      >
                        <option value={5}>5분 전</option>
                        <option value={10}>10분 전</option>
                        <option value={15}>15분 전</option>
                        <option value={30}>30분 전</option>
                      </select>
                    </div>
                  )}

                  {/* 푸시 구독 상태 */}
                  <div className="border-t border-neutral-200 dark:border-gray-700 pt-4 mt-4">
                    {pushNotification.isSupported ? (
                      pushNotification.isSubscribed ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BellRing size={16} className="text-green-500" aria-hidden="true" />
                            <div>
                              <span className="text-sm text-text-primary dark:text-white">푸시 알림 활성</span>
                              <p className="text-xs text-text-muted dark:text-gray-400">앱을 닫아도 알림을 받아요</p>
                            </div>
                          </div>
                          <button
                            onClick={() => pushNotification.unsubscribe()}
                            disabled={pushNotification.isLoading}
                            className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          >
                            {pushNotification.isLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              '해제'
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <BellOff size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5" aria-hidden="true" />
                            <div>
                              <p className="text-sm text-text-primary dark:text-white font-medium">푸시 알림 미등록</p>
                              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                                브라우저 알림을 허용하면 앱을 닫아도 알림을 받을 수 있어요
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => pushNotification.subscribe()}
                            disabled={pushNotification.isLoading || pushNotification.permission === 'denied'}
                            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {pushNotification.isLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                등록 중...
                              </>
                            ) : pushNotification.permission === 'denied' ? (
                              '알림 권한이 차단됨'
                            ) : (
                              <>
                                <Bell size={16} />
                                푸시 알림 활성화
                              </>
                            )}
                          </button>
                          {pushNotification.error && (
                            <p className="text-xs text-red-500">{pushNotification.error}</p>
                          )}
                          {pushNotification.permission === 'denied' && (
                            <p className="text-xs text-text-muted dark:text-gray-400">
                              브라우저 설정에서 알림 권한을 허용해주세요
                            </p>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-text-muted dark:text-gray-400">
                        <BellOff size={16} />
                        <span className="text-sm">이 브라우저는 푸시 알림을 지원하지 않습니다</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* 알프레도 상태 섹션 */}
            <section className="bg-white dark:bg-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                  <img
                    src="/assets/alfredo/avatar/alfredo-avatar-32.png"
                    alt="알프레도"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
                  />
                </div>
                <h2 className="text-base font-semibold text-text-primary dark:text-white">나의 알프레도</h2>
              </div>
              <PenguinWidget />
            </section>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            {/* 계정 정보 */}
            <section className="bg-white dark:bg-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-text-primary dark:text-white">계정 정보</h2>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">{user?.email || '로그인 필요'}</p>
                  <p className="text-xs text-text-muted">알프레도 사용자</p>
                </div>
              </div>
            </section>

            {/* 알프레도 학습 데이터 */}
            {alfredoLoading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-2 animate-bounce">
                  <img
                    src="/assets/alfredo/avatar/alfredo-avatar-48.png"
                    alt="알프레도"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-3xl">🎩</span>'; }}
                  />
                </div>
                <p className="text-sm text-text-muted">알프레도 불러오는 중...</p>
              </div>
            ) : (
              <>
                {/* 영역 전환 */}
                <DomainSwitcher />

                {/* 이해도 카드 */}
                <UnderstandingCard />

                {/* 주간 리포트 */}
                <WeeklyReportCard />

                {/* 파악 중인 것 */}
                <PendingLearningsList />

                {/* 학습 목록 */}
                <LearningsList />
              </>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="로그아웃"
              className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="p-2 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary dark:text-white" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary dark:text-white">설정</h1>
      </header>

      {/* Category Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 px-4" aria-label="설정 카테고리">
        <div className="flex gap-1" role="tablist">
          {CATEGORY_TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeCategory === tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                  activeCategory === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-muted dark:text-gray-400 hover:text-text-secondary'
                }`}
              >
                <TabIcon size={18} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4" role="tabpanel" aria-label={`${activeCategory === 'general' ? '기본 설정' : '고급'} 설정 내용`}>
        {renderCategoryContent()}
      </main>
      
      <style>
        {`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: #A996FF;
            border-radius: 50%;
            cursor: pointer;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #A996FF;
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }
        `}
      </style>
    </div>
  );
};

export default Settings;