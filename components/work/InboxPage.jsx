import React, { useState } from 'react';
import { Inbox, Mail, ChevronRight, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const InboxPage = ({ inbox, onConvertToTask }) => {
  const [filter, setFilter] = useState('all'); // all, urgent
  const [expandedId, setExpandedId] = useState(null);
  
  const sorted = [...inbox].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  const items = filter === 'urgent' ? sorted.filter(i => i.urgent) : sorted;
  const urgentCount = inbox.filter(i => i.urgent).length;
  
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
      slack: 'bg-[#F5F3FF] text-[#F5F3FF]0',
      drive: 'bg-gray-100 text-gray-600',
      notion: 'bg-gray-100 text-gray-600',
    };
    return colors[source] || 'bg-gray-50 text-gray-500';
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0EBFF]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">인박스 📥</h1>
          <span className="text-sm text-gray-500">{inbox.length}개 항목</span>
        </div>
      </div>
      
      {/* Filter */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            전체
          </button>
          <button 
            onClick={() => setFilter('urgent')} 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${filter === 'urgent' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
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
                  ? 'bg-white ring-2 ring-[#A996FF]/20 shadow-md' 
                  : 'bg-white/70 border border-white/50 hover:bg-white'
              }`}
            >
              {/* 긴급 표시 바 */}
              {item.urgent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>
              )}
              
              <div className="flex items-start gap-3 pl-2">
                {/* 아바타/아이콘 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  item.type === 'file' ? 'bg-gray-100' : 'bg-[#F5F3FF]'
                }`}>
                  {item.type === 'file' 
                    ? (item.fileType === 'audio' ? '🎙️' : item.fileType === 'pdf' ? '📄' : '📁')
                    : item.from[0]
                  }
                </div>
                
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{item.from}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${getSourceColor(item.source)}`}>
                      {getSourceIcon(item.source)} {item.source}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-700 text-sm mb-1 truncate">{item.subject}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{item.preview}</p>
                </div>
                
                {/* 시간 & 상태 */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-gray-400">{item.time}</span>
                  {item.needReplyToday && (
                    <span className="flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
                      <AlertCircle size={10} /> 오늘 회신
                    </span>
                  )}
                </div>
              </div>
              
              {/* 확장 영역 - Task로 전환 */}
              {expandedId === item.id && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onConvertToTask(item);
                      setExpandedId(null);
                    }}
                    className="flex-1 py-2.5 bg-[#A996FF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/20 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 size={16} /> Task로 전환
                  </button>
                  <button className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">
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
            <p className="text-gray-500 mt-2">
              {filter === 'urgent' ? '긴급한 항목이 없어요!' : '인박스가 비어있어요'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// === Life Detail Modal ===

export default InboxPage;
