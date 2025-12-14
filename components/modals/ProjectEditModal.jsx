import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const ProjectEditModal = ({ isOpen, onClose, project, onSave, onDelete, darkMode = false }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('from-[#A996FF] to-[#8B7CF7]');
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setIcon(project.icon || '📁');
      setDeadline(project.deadline || '');
      setColor(project.color || 'from-[#A996FF] to-[#8B7CF7]');
      setMilestones(project.milestones || []);
    } else {
      setName('');
      setIcon('📁');
      setDeadline('');
      setColor('from-[#A996FF] to-[#8B7CF7]');
      setMilestones([]);
    }
  }, [project, isOpen]);
  
  if (!isOpen) return null;
  
  const projectIcons = ['📁', '💰', '🚀', '🎯', '📊', '💡', '🔥', '⭐', '🎨', '📱', '💻', '🌱', '🏆', '📈', '🛠️', '🎮'];
  const colorOptions = [
    'from-[#A996FF] to-[#8B7CF7]',
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-red-400 to-red-600',
    'from-teal-400 to-teal-600',
  ];
  
  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([...milestones, { id: `ms-${Date.now()}`, title: newMilestone, completed: false }]);
    setNewMilestone('');
  };
  
  const handleToggleMilestone = (msId) => {
    setMilestones(milestones.map(ms => 
      ms.id === msId ? { ...ms, completed: !ms.completed } : ms
    ));
  };
  
  const handleDeleteMilestone = (msId) => {
    setMilestones(milestones.filter(ms => ms.id !== msId));
  };
  
  const handleSave = () => {
    if (!name.trim()) return;
    onSave?.({
      id: project?.id || `p-${Date.now()}`,
      name,
      icon,
      deadline,
      color,
      milestones,
      status: 'active',
      totalTasks: project?.totalTasks || 0,
      completedTasks: project?.completedTasks || 0,
    });
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-md ${cardBg} rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col`}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className={`font-bold ${textPrimary}`}>
            {project ? '프로젝트 수정' : '새 프로젝트'}
          </h2>
          <button onClick={onClose} className={`p-2 ${textSecondary}`}>
            <X size={20} />
          </button>
        </div>
        
        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 아이콘 선택 */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>아이콘</label>
            <div className="flex flex-wrap gap-2">
              {projectIcons.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-[#A996FF] ring-2 ring-[#A996FF] ring-offset-2'
                      : `${inputBg}`
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          
          {/* 이름 */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>프로젝트 이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              className={`w-full px-4 py-3 ${inputBg} ${textPrimary} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]`}
            />
          </div>
          
          {/* 마감일 */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>마감일</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className={`w-full px-4 py-3 ${inputBg} ${textPrimary} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]`}
            />
          </div>
          
          {/* 색상 */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>테마 색상</label>
            <div className="flex gap-2">
              {colorOptions.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* 마일스톤 */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>마일스톤</label>
            
            {/* 마일스톤 목록 */}
            {milestones.length > 0 && (
              <div className="space-y-2 mb-3">
                {milestones.map(ms => (
                  <div key={ms.id} className={`flex items-center gap-2 ${inputBg} rounded-lg p-2`}>
                    <button
                      onClick={() => handleToggleMilestone(ms.id)}
                      className={ms.completed ? 'text-emerald-500' : textSecondary}
                    >
                      {ms.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <span className={`flex-1 text-sm ${ms.completed ? 'line-through text-gray-400' : textPrimary}`}>
                      {ms.title}
                    </span>
                    <button
                      onClick={() => handleDeleteMilestone(ms.id)}
                      className={`p-1 ${textSecondary} hover:text-red-500`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 새 마일스톤 입력 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                placeholder="마일스톤 추가..."
                className={`flex-1 px-3 py-2 ${inputBg} ${textPrimary} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A996FF]`}
              />
              <button
                onClick={handleAddMilestone}
                className="px-3 py-2 bg-[#A996FF] text-white rounded-lg text-sm font-medium"
              >
                추가
              </button>
            </div>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {showDeleteConfirm ? (
            <div className="space-y-2">
              <p className={`text-sm ${textPrimary} text-center`}>정말 삭제하시겠어요?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 py-3 ${inputBg} ${textSecondary} rounded-xl font-medium`}
                >
                  취소
                </button>
                <button
                  onClick={() => { onDelete?.(project.id); onClose(); }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {project && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-medium"
                >
                  삭제
                </button>
              )}
              <button
                onClick={onClose}
                className={`flex-1 py-3 ${inputBg} ${textSecondary} rounded-xl font-medium`}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {project ? '수정' : '생성'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 프로젝트 시간 추적 위젯

export default ProjectEditModal;
