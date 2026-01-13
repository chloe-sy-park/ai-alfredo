import React, { useState, useEffect } from 'react';
import { 
  Inbox, Mail, ChevronRight, CheckCircle2, Clock, ArrowRight, 
  AlertCircle, RefreshCw, Settings, Link2, Loader2
} from 'lucide-react';

var InboxPage = function(props) {
  var onBack = props.onBack;
  var onOpenChat = props.onOpenChat;
  var darkMode = props.darkMode || false;
  var isGoogleConnected = props.isGoogleConnected;
  var onConnectGoogle = props.onConnectGoogle;
  
  // Gmail props
  var gmailActions = props.gmailActions || [];
  var gmailEmails = props.gmailEmails || [];
  var gmailStats = props.gmailStats;
  var isGmailEnabled = props.isGmailEnabled;
  var isGmailLoading = props.isGmailLoading;
  var isGmailAnalyzing = props.isGmailAnalyzing;
  var gmailError = props.gmailError;
  var gmailNeedsReauth = props.gmailNeedsReauth;
  var onFetchGmail = props.onFetchGmail;
  var onToggleGmail = props.onToggleGmail;
  var onConnectGmail = props.onConnectGmail;
  var onForceReconnectGmail = props.onForceReconnectGmail;
  var onConvertToTask = props.onConvertToTask;
  var onCompleteAction = props.onCompleteAction;
  var getLastSyncText = props.getLastSyncText;
  
  var filterState = useState('all');
  var filter = filterState[0];
  var setFilter = filterState[1];
  
  var expandedIdState = useState(null);
  var expandedId = expandedIdState[0];
  var setExpandedId = expandedIdState[1];
  
  // 스타일
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 우선순위 색상
  var getPriorityStyle = function(priority) {
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' };
      case 'high':
        return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' };
      case 'medium':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
    }
  };
  
  // 우선순위 라벨
  var getPriorityLabel = function(priority) {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'high': return '중요';
      case 'medium': return '보통';
      default: return '참고';
    }
  };
  
  // 액션 타입 아이콘 + 라벨
  var getActionInfo = function(actionType) {
    switch (actionType) {
      case 'reply':
        return { icon: '💬', label: '답장 필요' };
      case 'schedule':
        return { icon: '📅', label: '일정 조율' };
      case 'task':
        return { icon: '✅', label: '할 일' };
      case 'review':
        return { icon: '👀', label: '검토' };
      case 'archive':
        return { icon: '📁', label: '보관' };
      default:
        return { icon: '📧', label: '확인' };
    }
  };
  
  // 필터링된 액션
  var filteredActions = filter === 'urgent' 
    ? gmailActions.filter(function(a) { return a.priority === 'urgent' || a.priority === 'high'; })
    : gmailActions;
  
  var urgentCount = gmailActions.filter(function(a) { return a.priority === 'urgent'; }).length;
  var highCount = gmailActions.filter(function(a) { return a.priority === 'high'; }).length;
  
  // Gmail 미연결 상태
  if (!isGoogleConnected) {
    return React.createElement('div', {
      className: 'flex-1 overflow-y-auto ' + bgColor
    },
      // 헤더
      React.createElement('div', { className: 'px-4 pt-6 pb-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          onBack && React.createElement('button', {
            onClick: onBack,
            className: 'p-2 rounded-lg ' + (darkMode ? 'hover:bg-gray-800' : 'hover:bg-white')
          },
            React.createElement(ChevronRight, {
              size: 20,
              className: textSecondary + ' rotate-180'
            })
          ),
          React.createElement('h1', {
            className: 'text-2xl font-bold ' + textPrimary
          }, '인박스 🐧')
        )
      ),
      
      // 연결 안내
      React.createElement('div', { className: 'px-4' },
        React.createElement('div', {
          className: 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-2xl p-6 text-center'
        },
          React.createElement('div', {
            className: 'w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center'
          },
            React.createElement('span', { className: 'text-3xl' }, '📧')
          ),
          React.createElement('h3', {
            className: 'text-white font-bold text-lg mb-2'
          }, 'Gmail 연결하기'),
          React.createElement('p', {
            className: 'text-white/80 text-sm mb-4'
          }, '이메일을 분석해서 해야 할 일을', React.createElement('br'), '자동으로 정리해드려요'),
          React.createElement('button', {
            onClick: onConnectGoogle,
            className: 'w-full bg-white text-[#A996FF] font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2'
          },
            React.createElement(Link2, { size: 18 }),
            'Google 연결하기'
          )
        )
      )
    );
  }
  
  // Gmail 재인증 필요
  if (gmailNeedsReauth) {
    return React.createElement('div', {
      className: 'flex-1 overflow-y-auto ' + bgColor
    },
      // 헤더
      React.createElement('div', { className: 'px-4 pt-6 pb-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          onBack && React.createElement('button', {
            onClick: onBack,
            className: 'p-2 rounded-lg ' + (darkMode ? 'hover:bg-gray-800' : 'hover:bg-white')
          },
            React.createElement(ChevronRight, {
              size: 20,
              className: textSecondary + ' rotate-180'
            })
          ),
          React.createElement('h1', {
            className: 'text-2xl font-bold ' + textPrimary
          }, '인박스 🐧')
        )
      ),
      
      // 재인증 안내
      React.createElement('div', { className: 'px-4' },
        React.createElement('div', {
          className: 'bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center'
        },
          React.createElement('div', {
            className: 'w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center'
          },
            React.createElement(AlertCircle, { size: 32, className: 'text-amber-500' })
          ),
          React.createElement('h3', {
            className: 'text-amber-800 font-bold text-lg mb-2'
          }, 'Gmail 재연결 필요'),
          React.createElement('p', {
            className: 'text-amber-700 text-sm mb-4'
          }, 'Gmail 권한이 만료되었어요.', React.createElement('br'), '다시 연결해주세요.'),
          React.createElement('button', {
            onClick: onForceReconnectGmail,
            className: 'w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2'
          },
            React.createElement(RefreshCw, { size: 18 }),
            'Google 재연결'
          )
        )
      )
    );
  }
  
  return React.createElement('div', {
    className: 'flex-1 overflow-y-auto ' + bgColor
  },
    // 헤더
    React.createElement('div', { className: 'px-4 pt-6 pb-4' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          onBack && React.createElement('button', {
            onClick: onBack,
            className: 'p-2 rounded-lg ' + (darkMode ? 'hover:bg-gray-800' : 'hover:bg-white')
          },
            React.createElement(ChevronRight, {
              size: 20,
              className: textSecondary + ' rotate-180'
            })
          ),
          React.createElement('h1', {
            className: 'text-2xl font-bold ' + textPrimary
          }, '인박스 🐧')
        ),
        React.createElement('button', {
          onClick: onFetchGmail,
          disabled: isGmailLoading || isGmailAnalyzing,
          className: 'p-2 rounded-lg ' + (darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50') + ' transition-colors'
        },
          (isGmailLoading || isGmailAnalyzing)
            ? React.createElement(Loader2, { size: 20, className: 'text-[#A996FF] animate-spin' })
            : React.createElement(RefreshCw, { size: 20, className: textSecondary })
        )
      )
    ),
    
    // 동기화 상태 카드
    React.createElement('div', { className: 'px-4 mb-4' },
      React.createElement('div', {
        className: cardBg + ' rounded-xl p-3 flex items-center justify-between'
      },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', {
            className: 'w-10 h-10 rounded-full flex items-center justify-center ' + (isGmailEnabled ? 'bg-emerald-100' : 'bg-gray-100')
          },
            React.createElement(Mail, {
              size: 20,
              className: isGmailEnabled ? 'text-emerald-600' : 'text-gray-400'
            })
          ),
          React.createElement('div', null,
            React.createElement('p', {
              className: 'font-medium text-sm ' + textPrimary
            }, isGmailEnabled ? 'Gmail 연결됨' : 'Gmail 비활성'),
            React.createElement('p', {
              className: 'text-xs ' + textSecondary
            }, getLastSyncText ? getLastSyncText() : '동기화 대기 중')
          )
        ),
        React.createElement('button', {
          onClick: onFetchGmail,
          disabled: isGmailLoading || isGmailAnalyzing,
          className: 'px-3 py-1.5 bg-[#A996FF] text-white text-sm font-medium rounded-lg disabled:opacity-50'
        }, 
          isGmailAnalyzing ? '분석 중...' : isGmailLoading ? '동기화...' : '동기화'
        )
      )
    ),
    
    // 통계 (액션이 있을 때만)
    gmailActions.length > 0 && React.createElement('div', { className: 'px-4 mb-4' },
      React.createElement('div', { className: 'flex gap-2' },
        urgentCount > 0 && React.createElement('div', {
          className: 'flex-1 bg-red-50 border border-red-100 rounded-xl p-3 text-center'
        },
          React.createElement('p', { className: 'text-2xl font-bold text-red-600' }, urgentCount),
          React.createElement('p', { className: 'text-xs text-red-500' }, '긴급')
        ),
        highCount > 0 && React.createElement('div', {
          className: 'flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 text-center'
        },
          React.createElement('p', { className: 'text-2xl font-bold text-amber-600' }, highCount),
          React.createElement('p', { className: 'text-xs text-amber-500' }, '중요')
        ),
        React.createElement('div', {
          className: 'flex-1 ' + (darkMode ? 'bg-gray-800' : 'bg-gray-50') + ' rounded-xl p-3 text-center'
        },
          React.createElement('p', { className: 'text-2xl font-bold ' + textPrimary }, gmailActions.length),
          React.createElement('p', { className: 'text-xs ' + textSecondary }, '전체 액션')
        )
      )
    ),
    
    // 필터
    React.createElement('div', { className: 'px-4 mb-4' },
      React.createElement('div', {
        className: 'flex p-1 rounded-xl ' + (darkMode ? 'bg-gray-800' : 'bg-gray-100')
      },
        React.createElement('button', {
          onClick: function() { setFilter('all'); },
          className: 'flex-1 py-2 text-sm font-semibold rounded-lg transition-all ' + (filter === 'all' ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white shadow-sm text-gray-800') : textSecondary)
        }, '전체'),
        React.createElement('button', {
          onClick: function() { setFilter('urgent'); },
          className: 'flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ' + (filter === 'urgent' ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white shadow-sm text-gray-800') : textSecondary)
        },
          '긴급/중요',
          (urgentCount + highCount) > 0 && React.createElement('span', {
            className: 'bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full'
          }, urgentCount + highCount)
        )
      )
    ),
    
    // 액션 리스트
    React.createElement('div', { className: 'px-4 pb-32 space-y-3' },
      // 로딩 중
      isGmailLoading && gmailActions.length === 0 && React.createElement('div', {
        className: 'text-center py-12'
      },
        React.createElement(Loader2, {
          size: 32,
          className: 'text-[#A996FF] animate-spin mx-auto mb-3'
        }),
        React.createElement('p', { className: textSecondary }, '이메일 가져오는 중...')
      ),
      
      // 분석 중
      isGmailAnalyzing && React.createElement('div', {
        className: cardBg + ' rounded-xl p-4 flex items-center gap-3'
      },
        React.createElement(Loader2, {
          size: 20,
          className: 'text-[#A996FF] animate-spin'
        }),
        React.createElement('div', null,
          React.createElement('p', { className: 'font-medium ' + textPrimary }, '🐧 알프레도가 분석 중...'),
          React.createElement('p', { className: 'text-xs ' + textSecondary }, '이메일에서 해야 할 일을 찾고 있어요')
        )
      ),
      
      // 에러
      gmailError && !isGmailLoading && React.createElement('div', {
        className: 'bg-red-50 border border-red-200 rounded-xl p-4'
      },
        React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
          React.createElement(AlertCircle, { size: 16, className: 'text-red-500' }),
          React.createElement('p', { className: 'font-medium text-red-700' }, '동기화 실패')
        ),
        React.createElement('p', { className: 'text-sm text-red-600' }, gmailError),
        React.createElement('button', {
          onClick: onFetchGmail,
          className: 'mt-2 text-sm text-red-600 underline'
        }, '다시 시도')
      ),
      
      // 액션 카드들
      filteredActions.map(function(action) {
        var style = getPriorityStyle(action.priority);
        var actionInfo = getActionInfo(action.actionType);
        var isExpanded = expandedId === action.emailId;
        
        // 🔧 FIX: 올바른 필드 매핑
        var emailSubject = action.email && action.email.subject ? action.email.subject : '(제목 없음)';
        var emailFrom = action.email && action.email.from ? (action.email.from.name || action.email.from.email || '(발신자 없음)') : '(발신자 없음)';
        var suggestedAction = action.suggestedAction || '';
        var dueDate = action.dueDate || null;
        
        return React.createElement('div', {
          key: action.emailId,
          className: cardBg + ' rounded-xl overflow-hidden transition-all ' + (isExpanded ? 'ring-2 ring-[#A996FF]/30' : '')
        },
          // 메인 카드
          React.createElement('div', {
            onClick: function() { setExpandedId(isExpanded ? null : action.emailId); },
            className: 'p-4 cursor-pointer'
          },
            // 상단: 우선순위 + 액션타입
            React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
              React.createElement('span', {
                className: 'w-2 h-2 rounded-full ' + style.dot
              }),
              React.createElement('span', {
                className: 'text-xs font-medium px-2 py-0.5 rounded ' + style.bg + ' ' + style.text
              }, getPriorityLabel(action.priority)),
              React.createElement('span', {
                className: 'text-xs ' + textSecondary
              }, actionInfo.icon + ' ' + actionInfo.label)
            ),
            
            // 제목 (이메일 제목)
            React.createElement('h4', {
              className: 'font-semibold ' + textPrimary + ' mb-1 line-clamp-1'
            }, emailSubject),
            
            // AI 분석 요약
            React.createElement('p', {
              className: 'text-sm ' + textSecondary + ' line-clamp-2'
            }, suggestedAction),
            
            // 발신자 + 마감일
            React.createElement('div', {
              className: 'flex items-center justify-between mt-2 text-xs ' + textSecondary
            },
              React.createElement('span', null, emailFrom),
              dueDate && React.createElement('span', {
                className: 'text-red-500 font-medium'
              }, '⏰ ' + dueDate)
            )
          ),
          
          // 확장 영역
          isExpanded && React.createElement('div', {
            className: 'px-4 pb-4 pt-2 border-t ' + (darkMode ? 'border-gray-700' : 'border-gray-100')
          },
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', {
                onClick: function(e) {
                  e.stopPropagation();
                  if (onConvertToTask) onConvertToTask(action);
                  setExpandedId(null);
                },
                className: 'flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2'
              },
                React.createElement(CheckCircle2, { size: 16 }),
                'Task로 변환'
              ),
              React.createElement('button', {
                onClick: function(e) {
                  e.stopPropagation();
                  if (onCompleteAction) onCompleteAction(action.emailId);
                  setExpandedId(null);
                },
                className: 'px-4 py-2.5 rounded-xl text-sm font-bold ' + (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
              }, '완료')
            )
          )
        );
      }),
      
      // 빈 상태
      !isGmailLoading && !isGmailAnalyzing && filteredActions.length === 0 && React.createElement('div', {
        className: 'text-center py-12'
      },
        React.createElement('span', { className: 'text-4xl block mb-3' }, '📭'),
        React.createElement('p', { className: textPrimary + ' font-medium mb-1' },
          filter === 'urgent' ? '긴급한 항목이 없어요!' : '처리할 이메일이 없어요'
        ),
        React.createElement('p', { className: 'text-sm ' + textSecondary },
          gmailActions.length === 0 ? '동기화 버튼을 눌러 이메일을 확인해보세요' : '모든 이메일을 처리했어요!'
        ),
        gmailActions.length === 0 && React.createElement('button', {
          onClick: onFetchGmail,
          className: 'mt-4 px-4 py-2 bg-[#A996FF] text-white rounded-xl text-sm font-medium'
        }, '이메일 동기화')
      )
    ),
    
    // 알프레도 도움 FAB
    onOpenChat && React.createElement('button', {
      onClick: onOpenChat,
      className: 'fixed bottom-24 right-4 w-14 h-14 bg-[#A996FF] rounded-full shadow-lg flex items-center justify-center z-50'
    },
      React.createElement('span', { className: 'text-2xl' }, '🐧')
    )
  );
};

export default InboxPage;
