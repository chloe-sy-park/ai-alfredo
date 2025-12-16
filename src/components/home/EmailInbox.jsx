// EmailInbox.jsx - 이메일 액션 인박스 UI
import React, { useState, useEffect } from 'react';
import { 
  Mail, RefreshCw, Reply, Calendar, CheckSquare, 
  Archive, ChevronRight, AlertCircle, Clock, X, ExternalLink,
  Loader2, MailOpen
} from 'lucide-react';
import { useGmail } from '../../hooks/useGmail';

// 우선순위 색상
const PRIORITY_COLORS = {
  urgent: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600', dot: 'bg-red-500' },
  high: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600', dot: 'bg-amber-500' },
  medium: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-600', dot: 'bg-green-500' },
  low: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-500', dot: 'bg-gray-400' },
};

// 액션 아이콘
const ACTION_ICONS = {
  reply: Reply,
  schedule: Calendar,
  task: CheckSquare,
  review: MailOpen,
  archive: Archive,
};

// 액션 라벨
const ACTION_LABELS = {
  reply: '답장하기',
  schedule: '일정 잡기',
  task: '할 일 만들기',
  review: '검토하기',
  archive: '보관하기',
};

// 시간 포맷
function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000 / 60);
  
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// 이메일 액션 카드
function EmailActionCard({ action, darkMode, onComplete, onCreateTask, onCreateEvent, onReply }) {
  const colors = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium;
  const ActionIcon = ACTION_ICONS[action.actionType] || Mail;
  
  const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const handleAction = () => {
    switch (action.actionType) {
      case 'reply':
        if (onReply) onReply(action);
        window.open(`https://mail.google.com/mail/u/0/#inbox/${action.emailId}`, '_blank');
        break;
      case 'schedule':
        if (onCreateEvent) onCreateEvent(action);
        break;
      case 'task':
        if (onCreateTask) onCreateTask(action);
        break;
      default:
        onComplete && onComplete(action.emailId);
    }
  };

  return (
    <div className={`${cardBg} ${colors.border} border rounded-xl p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-2 h-2 rounded-full ${colors.dot} mt-2 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${textPrimary} font-medium text-sm truncate`}>
              {action.email?.from?.name || action.email?.from?.email || 'Unknown'}
            </span>
            <span className={`${textSecondary} text-xs flex-shrink-0`}>
              {formatTime(action.email?.date)}
            </span>
          </div>
          <p className={`${textPrimary} text-sm font-medium truncate`}>
            {action.email?.subject || '(제목 없음)'}
          </p>
        </div>
      </div>
      
      <div className={`${colors.bg} rounded-lg p-3 mb-3`}>
        <p className={`${colors.text} text-sm`}>
          💡 {action.suggestedAction}
        </p>
        {action.dueDate && (
          <p className={`${textSecondary} text-xs mt-1 flex items-center gap-1`}>
            <Clock size={12} />
            마감: {action.dueDate}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleAction}
          className="flex-1 flex items-center justify-center gap-2 bg-[#A996FF] hover:bg-[#8B7CF7] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          <ActionIcon size={16} />
          {ACTION_LABELS[action.actionType]}
        </button>
        <button
          onClick={() => onComplete && onComplete(action.emailId)}
          className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-2.5 rounded-lg transition-colors`}
          title="완료"
        >
          <X size={16} className={textSecondary} />
        </button>
      </div>
    </div>
  );
}

// ===== 브리핑용 컴팩트 위젯 (홈에서 사용) =====
export function EmailBriefingWidget({ darkMode = false, onNavigate }) {
  const gmail = useGmail();
  
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';

  // 연결 안됨 또는 비활성화
  if (!gmail.isConnected || !gmail.isGmailEnabled) {
    return null; // 브리핑에서는 숨김
  }

  // 답장 필요 없으면 숨김
  if (gmail.replyActions.length === 0) {
    return null;
  }

  // 최대 3개만 표시
  const displayActions = gmail.replyActions.slice(0, 3);
  const hasMore = gmail.replyActions.length > 3;

  return (
    <div className={`${cardBg} backdrop-blur-xl rounded-2xl shadow-sm p-4 border ${borderColor}`}>
      {/* 헤더 */}
      <button 
        onClick={onNavigate}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <Reply size={18} className="text-[#A996FF]" />
          <span className={`${textPrimary} font-bold`}>답장 필요</span>
          {gmail.urgentReplyActions.length > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {gmail.urgentReplyActions.length} 긴급
            </span>
          )}
        </div>
        <ChevronRight size={18} className={`${textSecondary} group-hover:text-[#A996FF] transition-colors`} />
      </button>
      
      {/* 리스트 - 최대 3개 */}
      <div className="space-y-2">
        {displayActions.map((action) => {
          const colors = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium;
          return (
            <button
              key={action.emailId}
              onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${action.emailId}`, '_blank')}
              className={`w-full ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-3 transition-all text-left`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`${textPrimary} text-sm font-medium truncate`}>
                    {action.email?.from?.name || action.email?.from?.email}
                  </p>
                  <p className={`${textSecondary} text-xs truncate`}>
                    {action.email?.subject}
                  </p>
                </div>
                <ExternalLink size={14} className={textSecondary} />
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 더보기 */}
      {hasMore && (
        <button
          onClick={onNavigate}
          className={`w-full text-center py-2 mt-2 ${textSecondary} text-sm hover:text-[#A996FF]`}
        >
          +{gmail.replyActions.length - 3}개 더보기
        </button>
      )}
    </div>
  );
}

// ===== 메인 인박스 컴포넌트 (전체 페이지) =====
export function EmailInbox({ 
  darkMode = false, 
  compact = false, 
  onCreateTask, 
  onCreateEvent,
  onViewAll,
  onBack
}) {
  const gmail = useGmail();
  const [filter, setFilter] = useState('reply'); // 'reply' | 'all' | 'urgent'
  
  useEffect(() => {
    if (gmail.isConnected && gmail.isGmailEnabled && gmail.actions.length === 0) {
      gmail.fetchAndAnalyze();
    }
  }, [gmail.isConnected, gmail.isGmailEnabled]);
  
  const cardBg = darkMode ? 'bg-gray-800/90' : 'bg-white/90';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-[#A996FF]/20';
  
  // 필터링된 액션
  const filteredActions = filter === 'reply' 
    ? gmail.replyActions
    : filter === 'urgent'
      ? gmail.actions.filter(a => a.priority === 'urgent' || a.priority === 'high')
      : gmail.actions;
  
  // 태스크 생성 핸들러
  const handleCreateTask = (action) => {
    const task = gmail.convertToTask(action);
    if (onCreateTask) {
      onCreateTask(task);
    }
    gmail.completeAction(action.emailId);
  };
  
  // 이벤트 생성 핸들러
  const handleCreateEvent = (action) => {
    if (onCreateEvent) {
      onCreateEvent({
        title: `📧 ${action.email?.subject || '이메일 미팅'}`,
        description: `발신: ${action.email?.from?.name || action.email?.from?.email}\n\n${action.suggestedAction}`,
        source: 'gmail',
        sourceId: action.emailId,
      });
    }
    gmail.completeAction(action.emailId);
  };

  // 연결 안됨 상태
  if (!gmail.isConnected) {
    return (
      <div className={`${cardBg} backdrop-blur-xl rounded-2xl shadow-sm p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[#A996FF]" />
            <span className={`${textPrimary} font-bold`}>이메일</span>
          </div>
        </div>
        
        <button
          onClick={() => gmail.connectGmail()}
          className={`w-full ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 transition-all`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Mail size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className={`${textPrimary} font-medium`}>Gmail 연결하기</p>
                <p className={`${textSecondary} text-xs`}>중요 이메일을 분석해요</p>
              </div>
            </div>
            <ChevronRight size={18} className={textSecondary} />
          </div>
        </button>
      </div>
    );
  }

  // Gmail 비활성화 상태
  if (!gmail.isGmailEnabled) {
    return (
      <div className={`${cardBg} backdrop-blur-xl rounded-2xl shadow-sm p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[#A996FF]" />
            <span className={`${textPrimary} font-bold`}>이메일</span>
          </div>
        </div>
        
        <button
          onClick={() => gmail.toggleGmail(true)}
          className={`w-full ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 transition-all`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className={textSecondary}>Gmail 비활성화됨</span>
            </div>
            <span className="text-[#A996FF] text-sm">활성화</span>
          </div>
        </button>
      </div>
    );
  }

  // Compact 위젯 모드 (구버전 호환용)
  if (compact) {
    return <EmailBriefingWidget darkMode={darkMode} onNavigate={onViewAll} />;
  }
  
  // 전체 인박스 모드
  return (
    <div className={`${darkMode ? 'bg-[#1a1625]' : 'bg-[#F0EBFF]'} min-h-screen pb-24`}>
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack || onViewAll} className={`${textSecondary} text-xl`}>←</button>
            <h1 className={`${textPrimary} text-2xl font-bold`}>인박스 📬</h1>
          </div>
          <span className={`${textSecondary} text-sm`}>{filteredActions.length}개</span>
        </div>
        
        {/* 연결 상태 바 */}
        <div className={`${cardBg} rounded-xl p-3 mt-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className={`${textSecondary} text-sm`}>Gmail 연결됨</span>
          </div>
          <button
            onClick={() => gmail.fetchAndAnalyze()}
            disabled={gmail.isLoading || gmail.isAnalyzing}
            className="flex items-center gap-1 text-sm text-[#A996FF] hover:text-[#8B7CF7] disabled:opacity-50"
          >
            {(gmail.isLoading || gmail.isAnalyzing) ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                동기화 중...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                동기화
              </>
            )}
          </button>
        </div>
        
        {/* 필터 탭 */}
        <div className={`${cardBg} rounded-xl p-1 mt-3 flex`}>
          <button
            onClick={() => setFilter('reply')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'reply' 
                ? 'bg-[#A996FF] text-white shadow-sm' 
                : `${textSecondary}`
            }`}
          >
            답장 필요
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'urgent' 
                ? 'bg-[#A996FF] text-white shadow-sm' 
                : `${textSecondary}`
            }`}
          >
            긴급
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-[#A996FF] text-white shadow-sm' 
                : `${textSecondary}`
            }`}
          >
            전체
          </button>
        </div>
      </div>
      
      {/* 콘텐츠 */}
      <div className="px-4">
        {/* 로딩 */}
        {(gmail.isLoading || gmail.isAnalyzing) && gmail.actions.length === 0 && (
          <div className="text-center py-12">
            <Loader2 size={32} className="text-[#A996FF] animate-spin mx-auto mb-3" />
            <p className={`${textPrimary} font-medium`}>
              {gmail.isLoading ? '중요 이메일 가져오는 중...' : 'AI가 분석 중...'}
            </p>
            <p className={`${textSecondary} text-sm mt-1`}>잠시만 기다려주세요</p>
          </div>
        )}
        
        {/* 빈 상태 */}
        {!gmail.isLoading && !gmail.isAnalyzing && filteredActions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className={`${textPrimary} font-medium`}>
              {filter === 'reply' ? '답장할 이메일이 없어요' : 
               filter === 'urgent' ? '긴급한 이메일이 없어요' : 
               '처리할 이메일이 없어요'}
            </p>
            <p className={`${textSecondary} text-sm mt-1`}>잘 하고 있어요!</p>
          </div>
        )}
        
        {/* 액션 리스트 */}
        {filteredActions.length > 0 && (
          <div className="space-y-3">
            {filteredActions.map((action) => (
              <EmailActionCard
                key={action.emailId}
                action={action}
                darkMode={darkMode}
                onComplete={gmail.completeAction}
                onCreateTask={handleCreateTask}
                onCreateEvent={handleCreateEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailInbox;
