import React, { useState, useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const EventModal = ({ isOpen, onClose, event, onSave, onDelete, googleCalendar }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(event?.start || '09:00');
  const [endTime, setEndTime] = useState(event?.end || '10:00');
  const [location, setLocation] = useState(event?.location || '');
  const [color, setColor] = useState(event?.color || 'bg-[#A996FF]');
  const [isImportant, setIsImportant] = useState(event?.important || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(event?.googleEventId ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDate(event.date || new Date().toISOString().split('T')[0]);
      setStartTime(event.start || '09:00');
      setEndTime(event.end || '10:00');
      setLocation(event.location || '');
      setColor(event.color || 'bg-[#A996FF]');
      setIsImportant(event.important || false);
      setSyncToGoogle(event.googleEventId ? true : false);
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('');
      setColor('bg-[#A996FF]');
      setIsImportant(false);
      setSyncToGoogle(googleCalendar?.isSignedIn || false);
    }
  }, [event, isOpen, googleCalendar?.isSignedIn]);
  
  if (!isOpen) return null;
  
  const colors = [
    { value: 'bg-[#A996FF]', label: '라벤더' },
    { value: 'bg-emerald-500', label: '에메랄드' },
    { value: 'bg-red-500', label: '레드' },
    { value: 'bg-gray-500', label: '그레이' },
  ];
  
  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    
    try {
      await onSave({
        id: event?.id || `e-${Date.now()}`,
        title: title.trim(),
        date,
        start: startTime,
        end: endTime,
        location: location.trim() || null,
        color,
        important: isImportant,
        syncToGoogle,
        googleEventId: event?.googleEventId,
      });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete(event.id, event.googleEventId);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">일정 삭제</h3>
            <p className="text-sm text-gray-500">
              "{event?.title}" 일정을 삭제하시겠어요?
            </p>
            {event?.googleEventId && (
              <p className="text-xs text-[#A996FF] mt-2">
                Google Calendar에서도 삭제됩니다
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowDeleteConfirm(false)} 
              disabled={isSaving}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl disabled:opacity-50"
            >
              취소
            </button>
            <button 
              onClick={handleDelete} 
              disabled={isSaving}
              className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              {event ? '일정 수정' : '새 일정'}
            </h2>
            <div className="flex items-center gap-2">
              {event && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* 제목 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">일정 이름 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 이름 입력"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              autoFocus
            />
          </div>
          
          {/* 날짜 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
            />
          </div>
          
          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">시작</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">종료</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
              />
            </div>
          </div>
          
          {/* 장소 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">장소 (선택)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 강남 WeWork"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#A996FF] outline-none"
            />
          </div>
          
          {/* 색상 */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-2 block">색상</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-xl ${c.value} transition-all ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          
          {/* 중요 표시 */}
          <div className="mb-6 flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500">중요 일정으로 표시</label>
            <button
              onClick={() => setIsImportant(!isImportant)}
              className={`w-12 h-7 rounded-full transition-all ${isImportant ? 'bg-[#A996FF]' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isImportant ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {/* Google Calendar 동기화 */}
          {googleCalendar && (
            <div className="mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
              {googleCalendar.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Google 연결 확인 중...
                </div>
              ) : googleCalendar.isSignedIn ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToGoogle}
                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#A996FF] focus:ring-[#A996FF]"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm text-gray-700">
                      Google Calendar 동기화
                    </span>
                  </div>
                  {googleCalendar.userInfo && (
                    <span className="text-xs text-gray-400">
                      {googleCalendar.userInfo.email}
                    </span>
                  )}
                </label>
              ) : (
                <button
                  onClick={googleCalendar.signIn}
                  className="flex items-center gap-2 text-sm text-[#A996FF] hover:underline w-full"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google 계정 연결하여 캘린더 동기화
                </button>
              )}
            </div>
          )}
          
          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="w-full py-3.5 bg-[#A996FF] text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            {event ? '수정하기' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Google Auth Modal (OAuth 시뮬레이션) ===

export default EventModal;
