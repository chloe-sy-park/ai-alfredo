import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AtSign, AlertCircle } from 'lucide-react';

interface Signal {
  id: string;
  type: 'email' | 'slack' | 'mention' | 'urgent';
  title: string;
  from: string;
  time: string;
  isRead: boolean;
}

export default function IncomingSignals() {
  // 실제로는 이메일/슬랙 API 연동 필요
  var [signals] = useState<Signal[]>([
    {
      id: '1',
      type: 'email',
      title: '프로젝트 리뷰 요청',
      from: '김팀장',
      time: '10분 전',
      isRead: false
    },
    {
      id: '2',
      type: 'slack',
      title: 'design 채널에 새 메시지',
      from: 'Slack',
      time: '30분 전',
      isRead: false
    },
    {
      id: '3',
      type: 'mention',
      title: 'PR에서 멘션되었어요',
      from: 'GitHub',
      time: '1시간 전',
      isRead: true
    }
  ]);

  var unreadCount = signals.filter(function(s) { return !s.isRead; }).length;

  function getIcon(type: string) {
    switch (type) {
      case 'email': return <Mail size={16} className="text-blue-500" />;
      case 'slack': return <MessageSquare size={16} className="text-purple-500" />;
      case 'mention': return <AtSign size={16} className="text-green-500" />;
      case 'urgent': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-[#999999]" />;
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#F97316]" />
          <h3 className="font-semibold text-[#1A1A1A]">인커밍 시그널</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#F59E0B] text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button className="text-xs text-[#999999]">
          모두 읽음
        </button>
      </div>
      
      <div className="space-y-2">
        {signals.length === 0 ? (
          <p className="text-center text-[#999999] py-8 text-sm">새로운 알림이 없어요</p>
        ) : (
          signals.map(function(signal) {
            return (
              <div 
                key={signal.id} 
                className={'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ' +
                  (!signal.isRead ? 'bg-[#FFF9F0] hover:bg-[#FFF5E5]' : 'hover:bg-[#F5F5F5]')}
              >
                <div className="mt-0.5">{getIcon(signal.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={'text-sm ' + (!signal.isRead ? 'font-medium text-[#1A1A1A]' : 'text-[#666666]')}>
                    {signal.title}
                  </p>
                  <p className="text-xs text-[#999999]">{signal.from} · {signal.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}