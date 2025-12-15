import React, { useState } from 'react';
import { Inbox, Mail, ChevronRight, CheckCircle2, Clock, ArrowRight, AlertCircle } from 'lucide-react';

const InboxPage = ({ inbox = [], onConvertToTask, onBack, darkMode = false }) => {
  const [filter, setFilter] = useState('all'); // all, urgent
  const [expandedId, setExpandedId] = useState(null);
  
  // inbox가 배열인지 확인하고 아니면 빈 배열 사용
  const safeInbox = Array.isArray(inbox) ? inbox : [];
  
  const sorted = [...safeInbox].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  const items = filter === 'urgent' ? sorted.filter(i => i.urgent) : sorted;
  const urgentCount = safeInbox.filter(i => i.urgent).length;
  
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const getSourceIcon = (source) => {
    const icons = {
      gmail: '📧',
      slack: '💬',
      drive: '📁',
      notion: '📝',
    };
    return icons[source] || '📨';
  };
  
  const getSourceColor = (source) => {
    const colors = {
      gmail: 'bg-red-50 text-red-500',
      slack: 'bg-purple-50 text-purple-500',
      drive: 'bg-gray-100 text-gray-600',
      notion: 'bg-gray-100 text-gray-600',
    };
    return colors[source] || 'bg-gray-50 text-gray-500';
  };
  
  return (
    <div className={`flex-1 overflow-y-auto ${bgColor}`}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`}
              >
                <ChevronRight size={20} className={`${textSecondary} rotate-180`} />
              </button>
            )}
            <h1 className={`text-2xl font-bold ${textPrimary}`}>인박스 📥</h1>
          </div>
          <span className={`text-sm ${textSecondary}`}>{safeInbox.length}개 항목</span>
        </div>
      </div>
      
      {/* Filter */}
      <div className="px-4 mb-4">
        <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button 
            onClick={() => setFilter('all')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'all' ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white shadow-sm text-gray-800') : textSecondary}`}
          >
            전체
          </button>
          <button 
            onClick={() => setFilter('urgent')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${filter === 'urgent' ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white shadow-sm text-gray-800') : textSecondary}`}
          >
            긴급 
            {urgentCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded-full">{urgentCount}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Inbox List */}
      <div className="px-4 pb-32 space-y-3">
        {items.map(item => (
          <div key={item.id}>
            <div 
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className={`p-4 rounded-xl transition-all cursor-pointer relative overflow-hidden ${
                expandedId === item.id 
                  ? `${cardBg} ring-2 ring-[#A996FF]/20 shadow-md` 
                  : `${darkMode ? 'bg-gray-800/70 border border-gray-700' : 'bg-white/70 border border-white/50'} hover:${cardBg}`
              }`}
            >
              {/* 긴급 표시 바 */}
              {item.urgent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
              )}
              
              <div className="flex items-start gap-3 pl-2">
                {/* 아바타/아이콘 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  item.type === 'file' 
                    ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') 
                    : (darkMode ? 'bg-purple-900/30' : 'bg-[#F5F3FF]')
                }`}>
                  {item.type === 'file' 
                    ? (item.fileType === 'audio' ? '🎙️' : item.fileType === 'pdf' ? '📄' : '📁')
                    : (item.from ? item.from[0] : '📨')
                  }
                </div>
                
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold text-sm ${textPrimary}`}>{item.from || '알 수 없음'}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${getSourceColor(item.source)}`}>
                      {getSourceIcon(item.source)} {item.source}
                    </span>
                  </div>
                  <h4 className={`font-medium text-sm mb-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.subject}</h4>
                  <p className={`text-xs line-clamp-1 ${textSecondary}`}>{item.preview}</p>
                </div>
                
                {/* 시간 & 상태 */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[11px] ${textSecondary}`}>{item.time}</span>
                  {item.needReplyToday && (
                    <span className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
                      <AlertCircle size={10} /> 오늘 회신
                    </span>
                  )}
                </div>
              </div>
              
              {/* 확장 영역 - Task로 전환 */}
              {expandedId === item.id && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onConvertToTask) onConvertToTask(item);
                      setExpandedId(null);
                    }}
                    className="flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/20 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 size={16} /> Task로 전환
                  </button>
                  <button className={`px-5 py-2.5 rounded-xl text-sm font-bold ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">📭</span>
            <p className={`mt-2 ${textSecondary}`}>
              {filter === 'urgent' ? '긴급한 항목이 없어요!' : '인박스가 비어있어요'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
