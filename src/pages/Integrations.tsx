import { PageHeader } from '../components/layout';
import { Link2, CheckCircle2, Circle, AlertCircle, Settings } from 'lucide-react';
import { useState } from 'react';
import { isGoogleAuthenticated } from '../services/calendar';
import { isOutlookConnected, startOutlookAuth, disconnectOutlook } from '../services/auth';
import { startGoogleAuth, disconnectGoogle } from '../services/auth';
import { CalendarSettings } from '../components/calendar';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function Integrations() {
  var googleConnected = isGoogleAuthenticated();
  var outlookConnected = isOutlookConnected();
  var [showCalendarSettings, setShowCalendarSettings] = useState(false);
  var [showOutlookSettings, setShowOutlookSettings] = useState(false);

  function handleGoogleConnect() {
    startGoogleAuth().catch(function(err) {
      console.error('Google auth failed:', err);
      alert('Google 연결에 실패했습니다.');
    });
  }

  function handleGoogleDisconnect() {
    if (window.confirm('Google Calendar 연결을 해제하시겠습니까?')) {
      disconnectGoogle();
      window.location.reload();
    }
  }

  function handleOutlookConnect() {
    startOutlookAuth().catch(function(err) {
      console.error('Outlook auth failed:', err);
      alert('Outlook 연결에 실패했습니다.');
    });
  }

  function handleOutlookDisconnect() {
    if (window.confirm('Outlook Calendar 연결을 해제하시겠습니까?')) {
      disconnectOutlook();
      window.location.reload();
    }
  }

  var integrations: Integration[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: '구글 캘린더와 연동해요',
      icon: '📅',
      connected: googleConnected,
      onConnect: handleGoogleConnect,
      onDisconnect: handleGoogleDisconnect
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      description: 'Microsoft Outlook 캘린더와 연동해요',
      icon: '📆',
      connected: outlookConnected,
      onConnect: handleOutlookConnect,
      onDisconnect: handleOutlookDisconnect
    },
    {
      id: 'notion',
      name: 'Notion',
      description: '노션 데이터베이스와 연동 (준비중)',
      icon: '📝',
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: '슬랙 알림 연동 (준비중)',
      icon: '💬',
      connected: false
    },
    {
      id: 'todoist',
      name: 'Todoist',
      description: '할 일 목록 연동 (준비중)',
      icon: '✅',
      connected: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader />

      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2">
          <Link2 size={20} className="text-[#A996FF]" />
          <h1 className="text-lg font-bold text-[#1A1A1A]">연동 관리</h1>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                외부 서비스 연동으로 알프레도를 더 똑똑하게
              </p>
              <p className="text-xs text-blue-700 mt-1">
                연동된 서비스가 많을수록 더 정확한 조언을 드릴 수 있어요
              </p>
            </div>
          </div>
        </div>

        {/* 연동 목록 */}
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1A1A1A]">{integration.name}</h3>
                    <p className="text-xs text-[#999999]">{integration.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <>
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm">
                        <CheckCircle2 size={16} />
                        <span>연결됨</span>
                      </div>
                      {(integration.id === 'google-calendar' || integration.id === 'outlook-calendar') && (
                        <button
                          onClick={function() {
                            if (integration.id === 'google-calendar') {
                              setShowCalendarSettings(!showCalendarSettings);
                            } else {
                              setShowOutlookSettings(!showOutlookSettings);
                            }
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="캘린더 설정"
                        >
                          <Settings size={18} className="text-gray-500" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={integration.onConnect}
                      disabled={!integration.onConnect}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#A996FF] text-white rounded-lg text-sm hover:bg-[#8B7BE8] disabled:bg-[#E5E5E5] disabled:text-[#999999]"
                    >
                      <Circle size={16} />
                      <span>연결하기</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Google 캘린더 설정 패널 */}
              {integration.id === 'google-calendar' && integration.connected && showCalendarSettings && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <CalendarSettings />
                  <button
                    onClick={integration.onDisconnect}
                    className="mt-4 w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    연결 해제
                  </button>
                </div>
              )}

              {/* Outlook 캘린더 설정 패널 */}
              {integration.id === 'outlook-calendar' && integration.connected && showOutlookSettings && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">Outlook Calendar가 연결되었습니다.</p>
                  <button
                    onClick={integration.onDisconnect}
                    className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    연결 해제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 안내 */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-[#666666] text-center">
            더 많은 연동 기능이 곧 추가될 예정이에요 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
