import React, { useState, useEffect } from 'react';
import { X, Clock, Target, Calendar, ChevronDown } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Data
import { mockProjects } from '../../data/mockData';

const AddTaskModal = ({ isOpen, onClose, onAdd, projects }) => {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [importance, setImportance] = useState('medium');
  const [repeat, setRepeat] = useState('none');
  const [note, setNote] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      project: project || '일반',
      deadline: deadlineTime || (deadline ? '종일' : null),
      deadlineDate: deadline || null,
      importance,
      status: 'todo',
      priorityScore: importance === 'high' ? 95 : importance === 'medium' ? 70 : 50,
      repeat: repeat !== 'none',
      repeatType: repeat !== 'none' ? repeat : null,
      repeatLabel: repeat === 'daily' ? '매일' : repeat === 'weekly' ? '매주' : repeat === 'monthly' ? '매월' : null,
      note: note.trim() || null,
      priorityChange: 'new',
      sparkline: [50, 55, 60, 65, 70],
    };
    
    onAdd(newTask);
    
    // Reset form
    setTitle('');
    setProject('');
    setDeadline('');
    setDeadlineTime('');
    setImportance('medium');
    setRepeat('none');
    setNote('');
    onClose();
  };
  
  const importanceOptions = [
    { value: 'high', label: '높음', color: 'bg-red-100 text-red-600 ring-red-300' },
    { value: 'medium', label: '보통', color: 'bg-gray-100 text-gray-600 ring-gray-300' },
    { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-600 ring-gray-300' },
  ];
  
  const repeatOptions = [
    { value: 'none', label: '반복 안 함' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[420px] max-h-[90vh] bg-white rounded-t-3xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-[#F5F3FF] to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#A996FF] rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">새 태스크</h2>
                <p className="text-xs text-gray-500">할 일을 추가하세요</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              할 일 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="무엇을 해야 하나요?"
              className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800 placeholder-gray-400"
              autoFocus
            />
          </div>
          
          {/* 프로젝트 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">프로젝트</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800"
            >
              <option value="">선택 안 함</option>
              {projects?.map(p => (
                <option key={p.id} value={p.name}>{p.icon} {p.name}</option>
              ))}
            </select>
          </div>
          
          {/* 마감일 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">마감일</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">시간</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#A996FF] text-gray-800"
              />
            </div>
          </div>
          
          {/* 중요도 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">중요도</label>
            <div className="flex gap-2">
              {importanceOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setImportance(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    importance === opt.value 
                      ? `${opt.color} ring-2` 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 반복 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">반복</label>
            <div className="flex gap-2 flex-wrap">
              {repeatOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRepeat(opt.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    repeat === opt.value 
                      ? 'bg-[#A996FF] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">메모 (선택)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="추가 정보나 메모..."
              rows={2}
              className="w-full p-3.5 bg-gray-50 rounded-xl border-none resize-none focus:ring-2 focus:ring-[#A996FF] text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={`flex-[2] py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                title.trim()
                  ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus size={18} /> 추가하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Level Up Modal ===

export default AddTaskModal;
