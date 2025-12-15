import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Clock, Calendar, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

// Common Components
import { DomainBadge } from '../common';

const SearchModal = ({ isOpen, onClose, tasks, events, lifeReminders, onSelectTask, onSelectEvent }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Default empty lifeReminders if not provided
  const safeLifeReminders = lifeReminders || { todayTop3: [], upcoming: [], dontForget: [] };
  
  const searchResults = () => {
    if (!query.trim()) return { tasks: [], events: [], life: [] };
    
    const q = query.toLowerCase();
    
    const matchedTasks = tasks?.filter(t => 
      t.title?.toLowerCase().includes(q) || 
      t.project?.toLowerCase().includes(q)
    ) || [];
    
    const matchedEvents = events?.filter(e => 
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
    ) || [];
    
    // Life items from props (lifeReminders)
    const lifeItems = [
      ...(safeLifeReminders.todayTop3 || []).filter(i => i.title?.toLowerCase().includes(q)),
      ...(safeLifeReminders.upcoming || []).filter(i => i.title?.toLowerCase().includes(q)),
      ...(safeLifeReminders.dontForget || []).filter(i => i.title?.toLowerCase().includes(q)),
    ];
    
    return { tasks: matchedTasks, events: matchedEvents, life: lifeItems };
  };
  
  const results = searchResults();
  const totalResults = results.tasks.length + results.events.length + results.life.length;
  
  const filters = [
    { value: 'all', label: '전체', count: totalResults },
    { value: 'tasks', label: '태스크', count: results.tasks.length },
    { value: 'events', label: '일정', count: results.events.length },
    { value: 'life', label: '일상', count: results.life.length },
  ];
  
  const filteredResults = () => {
    switch(activeFilter) {
      case 'tasks': return { tasks: results.tasks, events: [], life: [] };
      case 'events': return { tasks: [], events: results.events, life: [] };
      case 'life': return { tasks: [], events: [], life: results.life };
      default: return results;
    }
  };
  
  const displayResults = filteredResults();
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
            <Search size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="태스크, 일정, 메모 검색..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          {query && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeFilter === f.value 
                      ? 'bg-[#A996FF] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} {f.count > 0 && `(${f.count})`}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {!query ? (
            <div className="text-center py-8">
              <Search size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">검색어를 입력하세요</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['미팅', '보고서', '프로젝트', '마감'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">검색 결과가 없어요</p>
              <p className="text-gray-300 text-xs mt-1">다른 키워드로 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tasks */}
              {displayResults.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">태스크</p>
                  <div className="space-y-2">
                    {displayResults.tasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        onClick={() => { onSelectTask?.(task); onClose(); }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-[#F5F3FF] transition-all"
                      >
                        <div className={`w-2 h-8 rounded-full ${
                          task.importance === 'high' ? 'bg-red-400' : 
                          task.importance === 'medium' ? 'bg-gray-400' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{task.title}</p>
                          <p className="text-xs text-gray-400">{task.project} · {task.deadline || '마감 없음'}</p>
                        </div>
                        {task.status === 'done' && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded">완료</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Events */}
              {displayResults.events.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">일정</p>
                  <div className="space-y-2">
                    {displayResults.events.slice(0, 5).map(event => (
                      <div
                        key={event.id}
                        onClick={() => { onSelectEvent?.(event); onClose(); }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all"
                      >
                        <div className={`w-2 h-8 rounded-full ${event.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{event.title}</p>
                          <p className="text-xs text-gray-400">{event.start} - {event.end} · {event.location || '장소 미정'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Life */}
              {displayResults.life.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">일상</p>
                  <div className="space-y-2">
                    {displayResults.life.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.date || item.note || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {query && totalResults > 0 ? `${totalResults}개 결과` : '⌘K로 열기'}
          </span>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            ESC로 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
