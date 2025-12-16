// EmailInbox.jsx - 이메일 액션 인박스 컴포넌트
import React, { useState, useEffect } from 'react';
import { 
  Mail, RefreshCw, Loader2, AlertCircle, CheckCircle2, 
  Clock, Reply, Calendar, ListTodo, Archive, ChevronRight,
  Sparkles, ExternalLink, MailOpen, Star
} from 'lucide-react';
import { useGmail } from '../../hooks/useGmail';

const EmailInbox = ({ 
  darkMode = false, 
  onCreateTask,
  onCreateEvent,
  compact = false 
}) => {
  const {
    isConnected,
    emails,
    actions,
    isLoading,
    isAnalyzing,
    error,
    lastFetch,
    stats,
    fetchAndAnalyze,
    markAsRead,
    completeAction,
    convertToTask,
  } = useGmail();

  const [selectedAction, setSelectedAction] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // 스타일
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white/70';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  // 우선순위별 색상
  const priorityColors = {
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    high: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    medium: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  };

  // 액션 타입별 아이콘
  const actionIcons = {
    reply: <Reply size={14} />,
    schedule: <Calendar size={14} />,
    task: <ListTodo size={14} />,
    review: <MailOpen size={14} />,
    archive: <Archive size={14} />,
  };

  // 액션 타입별 라벨
  const actionLabels = {
    reply: '답장 필요',
    schedule: '일정 조율',
    task: '할 일',
    review: '검토',
    archive: '보관',
  };

  // 시간 포맷
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // 태스크로 변환
  const handleCreateTask = (action) => {
    const task = convertToTask(action);
    if (onCreateTask) {
      onCreateTask(task);
      completeAction(action.emailId);
    }
  };

  // 일정으로 변환
  const handleCreateEvent = (action) => {
    if (onCreateEvent) {
      onCreateEvent({
        title: action.email?.subject || action.suggestedAction,
        description: `📧 From: ${action.email?.from?.email}\n\n${action.suggestedAction}`,
      });
      completeAction(action.emailId);
    }
  };

  // 표시할 액션 (우선순위 정렬)
  const displayActions = actions
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, showAll ? undefined : (compact ? 3 : 5));

  // 연결 안 된 경우
  if (!isConnected) {
    return (
      <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]'} flex items-center justify-center`}>
            <Mail size={20} className="text-[#A996FF]" />
          </div>
          <div>
            <h3 className={`font-bold ${textPrimary}`}>이메일 인박스</h3>
            <p className={`text-xs ${textSecondary}`}>Google 연결 필요</p>
          </div>
        </div>
        <p className={`text-sm ${textSecondary} text-center py-4`}>
          설정에서 Google을 연결하면<br />
          알프레도가 이메일을 분석해드려요 🐧
        </p>
      </div>
    );
  }

  // 컴팩트 모드 (홈 위젯)
  if (compact) {
    return (
      <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[#A996FF]" />
            <span className={`font-bold ${textPrimary}`}>이메일</span>
            {stats.urgent > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {stats.urgent}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchAndAnalyze()}
            disabled={isLoading || isAnalyzing}
            className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            {(isLoading || isAnalyzing) ? (
              <Loader2 size={16} className="text-[#A996FF] animate-spin" />
            ) : (
              <RefreshCw size={16} className={textSecondary} />
            )}
          </button>
        </div>

        {/* 액션 목록 */}
        {displayActions.length === 0 ? (
          <div className={`text-center py-3 ${textSecondary} text-sm`}>
            {isAnalyzing ? '분석 중...' : '처리할 이메일이 없어요 ✨'}
          </div>
        ) : (
          <div className="space-y-2">
            {displayActions.map(action => (
              <div 
                key={action.emailId}
                className={`p-2.5 rounded-xl ${priorityColors[action.priority].bg} cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setSelectedAction(action)}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full ${priorityColors[action.priority].dot} mt-1.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textPrimary} truncate`}>
                      {action.email?.from?.name || action.email?.from?.email}
                    </p>
                    <p className={`text-xs ${textSecondary} truncate`}>
                      {action.suggestedAction}
                    </p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[action.priority].text} bg-white/50 dark:bg-black/20`}>
                    {actionLabels[action.actionType]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {actions.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className={`w-full mt-2 text-center text-sm ${textSecondary} hover:text-[#A996FF]`}
          >
            {showAll ? '접기' : `+${actions.length - 3}개 더보기`}
          </button>
        )}
      </div>
    );
  }

  // 전체 모드
  return (
    <div className={`${cardBg} backdrop-blur-xl rounded-xl p-4`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-[#F5F3FF]'} flex items-center justify-center`}>
            <Mail size={20} className="text-[#A996FF]" />
          </div>
          <div>
            <h3 className={`font-bold ${textPrimary}`}>이메일 액션</h3>
            <p className={`text-xs ${textSecondary}`}>
              {lastFetch ? `마지막 확인: ${formatTime(lastFetch)}` : '아직 확인 안 함'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => fetchAndAnalyze()}
          disabled={isLoading || isAnalyzing}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
            isLoading || isAnalyzing
              ? 'bg-[#A996FF]/20 text-[#A996FF]'
              : 'bg-[#A996FF] text-white hover:bg-[#8B7CF7]'
          } transition-colors text-sm font-medium`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              가져오는 중...
            </>
          ) : isAnalyzing ? (
            <>
              <Sparkles size={16} className="animate-pulse" />
              AI 분석 중...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              새로고침
            </>
          )}
        </button>
      </div>

      {/* 통계 */}
      <div className={`grid grid-cols-4 gap-2 mb-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={`text-lg font-bold ${textPrimary}`}>{stats.total}</p>
          <p className={`text-xs ${textSecondary}`}>전체</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-500">{stats.unread}</p>
          <p className={`text-xs ${textSecondary}`}>안읽음</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">{stats.urgent}</p>
          <p className={`text-xs ${textSecondary}`}>긴급</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-amber-500">{stats.needsAction}</p>
          <p className={`text-xs ${textSecondary}`}>액션필요</p>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* 액션 목록 */}
      {displayActions.length === 0 ? (
        <div className={`text-center py-8 ${textSecondary}`}>
          <Mail size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">처리할 이메일이 없어요</p>
          <p className="text-sm">알프레도가 열심히 정리했어요! ✨</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayActions.map(action => (
            <div 
              key={action.emailId}
              className={`p-4 rounded-xl border ${borderColor} ${priorityColors[action.priority].bg} hover:shadow-md transition-shadow`}
            >
              {/* 상단: 보낸 사람 + 우선순위 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} flex items-center justify-center text-sm font-bold ${textPrimary}`}>
                    {(action.email?.from?.name || action.email?.from?.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-medium ${textPrimary} text-sm`}>
                      {action.email?.from?.name || action.email?.from?.email}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {formatTime(action.email?.date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityColors[action.priority].text} bg-white/50 dark:bg-black/20`}>
                    {actionIcons[action.actionType]}
                    {actionLabels[action.actionType]}
                  </span>
                  {action.priority === 'urgent' && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      긴급
                    </span>
                  )}
                </div>
              </div>

              {/* 제목 */}
              <p className={`font-medium ${textPrimary} mb-1`}>
                {action.email?.subject}
              </p>

              {/* 추천 액션 */}
              <p className={`text-sm ${textSecondary} mb-3`}>
                💡 {action.suggestedAction}
              </p>

              {/* 버튼들 */}
              <div className="flex gap-2">
                {action.actionType === 'reply' && (
                  <a
                    href={`https://mail.google.com/mail/u/0/#inbox/${action.emailId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#A996FF] text-white rounded-lg text-sm font-medium hover:bg-[#8B7CF7]"
                  >
                    <Reply size={14} />
                    답장하기
                    <ExternalLink size={12} />
                  </a>
                )}
                
                {action.actionType === 'schedule' && (
                  <button
                    onClick={() => handleCreateEvent(action)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#A996FF] text-white rounded-lg text-sm font-medium hover:bg-[#8B7CF7]"
                  >
                    <Calendar size={14} />
                    일정 만들기
                  </button>
                )}
                
                {(action.actionType === 'task' || action.actionType === 'review') && (
                  <button
                    onClick={() => handleCreateTask(action)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#A996FF] text-white rounded-lg text-sm font-medium hover:bg-[#8B7CF7]"
                  >
                    <ListTodo size={14} />
                    태스크 만들기
                  </button>
                )}

                <button
                  onClick={() => {
                    markAsRead(action.emailId);
                    completeAction(action.emailId);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'} rounded-lg text-sm font-medium hover:opacity-80`}
                >
                  <CheckCircle2 size={14} />
                  완료
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {actions.length > 5 && !showAll && (
        <button 
          onClick={() => setShowAll(true)}
          className={`w-full mt-4 py-2 text-center text-sm ${textSecondary} hover:text-[#A996FF] border-t ${borderColor}`}
        >
          +{actions.length - 5}개 더보기
        </button>
      )}
    </div>
  );
};

export default EmailInbox;
