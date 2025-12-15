import React, { useState } from 'react';
import { 
  X, Clock, Target, Calendar, Zap, Play, Trash2, CheckCircle2, 
  TrendingUp, TrendingDown, ChevronRight, FileText, Briefcase, Sparkles, RefreshCw
} from 'lucide-react';

// Common Components
import { AlfredoAvatar, DomainBadge } from '../common';

const TaskModal = ({ task, onClose, onStartFocus, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || '');
  const [editDeadline, setEditDeadline] = useState(task?.deadline || '');
  const [editImportance, setEditImportance] = useState(task?.importance || 'medium');
  const [editProject, setEditProject] = useState(task?.project || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  if (!task) return null;
  
  const importanceLabel = {
    high: { text: 'High Priority', color: 'bg-red-100 text-red-600' },
    medium: { text: 'Medium', color: 'bg-gray-100 text-gray-600' },
    low: { text: 'Low', color: 'bg-gray-100 text-gray-500' },
  };
  
  const imp = importanceLabel[task.importance] || importanceLabel.medium;
  
  // AI가 생성하는 "왜 중요한지" 메시지
  const getWhyItMatters = () => {
    if (task.priorityChange === 'up') {
      return `이 업무의 우선순위가 올라갔어요. ${task.deadline ? `${task.deadline}까지 완료하면` : '지금 처리하면'} 오후가 훨씬 가벼워질 거예요.`;
    }
    if (task.importance === 'high') {
      return '핵심 업무예요. 집중해서 처리하면 오늘 목표 달성에 큰 도움이 됩니다.';
    }
    return '이 업무를 완료하면 전체 진행 상황이 한 단계 앞으로 나아갑니다.';
  };
  
  const handleSave = () => {
    if (onUpdate) {
      onUpdate(task.id, {
        title: editTitle,
        deadline: editDeadline,
        importance: editImportance,
        project: editProject,
      });
    }
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    onClose();
  };
  
  // 삭제 확인 모달
  if (showDeleteConfirm) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={() => setShowDeleteConfirm(false)}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">태스크 삭제</h3>
            <p className="text-sm text-gray-500">
              "{task.title}"을(를) 삭제하시겠어요?<br/>
              이 작업은 되돌릴 수 없어요.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 편집 모드
  if (isEditing) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">태스크 수정</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* 제목 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">제목</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            
            {/* 프로젝트 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">프로젝트</label>
              <input
                type="text"
                value={editProject}
                onChange={(e) => setEditProject(e.target.value)}
                placeholder="프로젝트명"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            
            {/* 마감 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">마감</label>
              <input
                type="text"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                placeholder="예: 오늘, 내일, D-3"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            
            {/* 우선순위 */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">우선순위</label>
              <div className="flex gap-2">
                {[
                  { value: 'high', label: '높음', color: 'bg-red-100 text-red-600 border-red-300' },
                  { value: 'medium', label: '보통', color: 'bg-gray-100 text-gray-600 border-gray-300' },
                  { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-600 border-gray-300' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEditImportance(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      editImportance === opt.value 
                        ? opt.color 
                        : 'bg-gray-50 text-gray-400 border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl disabled:opacity-50"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 기본 보기 모드
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white/95 backdrop-blur-xl rounded-t-3xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
      >
        {/* Header */}
        <div className="relative p-6 pb-3">
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-[#A996FF]/20 rounded-full transition-colors"
            >
              <FileText size={14} className="text-gray-500" />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-100 rounded-full transition-colors"
            >
              <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-[#F5F3FF] rounded-lg text-[11px] font-bold uppercase tracking-wider text-[#A996FF]">
              {task.project || 'General'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${imp.color}`}>
              {imp.text}
            </span>
            {task.priorityChange === 'up' && (
              <span className="px-2 py-1 bg-[#A996FF] text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                <TrendingUp size={10} /> UP
              </span>
            )}
            {task.repeat && (
              <span className="px-2 py-1 bg-[#EDE9FE] text-[#8B7CF7] rounded-lg text-[11px] font-bold flex items-center gap-1">
                <RefreshCw size={10} /> {task.repeatLabel}
              </span>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 leading-tight pr-24">{task.title}</h2>
        </div>
        
        <div className="p-6 pt-2 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#A996FF]">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase block">마감</span>
                <span className="font-semibold text-gray-800 text-xs">{task.deadline || '유연'}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#A996FF]">
                <Briefcase size={16} />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase block">프로젝트</span>
                <span className="font-semibold text-gray-800 text-xs">{task.project || '일반'}</span>
              </div>
            </div>
          </div>
          
          {/* AI Summary - Why It Matters */}
          <div className="bg-[#F5F3FF]/60 p-4 rounded-xl border border-[#A996FF]/10 relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-[#A996FF]" />
              <h3 className="text-[11px] font-bold text-[#A996FF] uppercase tracking-wider">Why It Matters</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getWhyItMatters()}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => { onToggle(task.id); onClose(); }}
              className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              {task.status === 'done' ? '미완료로 변경' : '완료 처리'}
            </button>
            
            {task.status !== 'done' && (
              <button 
                onClick={() => { onStartFocus(task); onClose(); }}
                className="flex-[2] py-3.5 bg-[#A996FF] text-white font-bold rounded-xl hover:bg-[#8B7BE8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#A996FF]/30 active:scale-95 text-sm"
              >
                <Zap size={16} fill="currentColor" /> 집중 시작하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Swipeable Task Item ===

export default TaskModal;
