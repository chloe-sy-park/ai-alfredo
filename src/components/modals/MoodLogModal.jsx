import React, { useState } from 'react';
import { X, Smile, Meh, Frown, Zap, Battery, BatteryLow, Sparkles } from 'lucide-react';

/**
 * 기분 & 에너지 기록 모달
 * ADHD 친화적: 간단하고 시각적인 선택
 */

var MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: '힘들어요', color: 'from-red-400 to-red-500' },
  { value: 2, emoji: '😔', label: '별로예요', color: 'from-orange-400 to-orange-500' },
  { value: 3, emoji: '😐', label: '그냥 그래요', color: 'from-amber-400 to-amber-500' },
  { value: 4, emoji: '🙂', label: '좋아요', color: 'from-emerald-400 to-emerald-500' },
  { value: 5, emoji: '😊', label: '아주 좋아요!', color: 'from-green-400 to-green-500' },
];

var ENERGY_OPTIONS = [
  { value: 1, emoji: '🪫', label: '바닥', color: 'from-red-400 to-red-500' },
  { value: 2, emoji: '😴', label: '피곤해요', color: 'from-orange-400 to-orange-500' },
  { value: 3, emoji: '😌', label: '보통이에요', color: 'from-amber-400 to-amber-500' },
  { value: 4, emoji: '⚡', label: '활기차요', color: 'from-emerald-400 to-emerald-500' },
  { value: 5, emoji: '🔥', label: '넘쳐요!', color: 'from-green-400 to-green-500' },
];

var QUICK_NOTES = [
  '잠을 잘 못 잤어요',
  '몸이 좀 안 좋아요',
  '스트레스 받았어요',
  '기분 좋은 일이 있었어요',
  '운동했어요',
  '맛있는 거 먹었어요',
  '날씨가 좋아요',
  '특별한 이유 없어요',
];

var MoodLogModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onSave = props.onSave;
  var currentMood = props.currentMood || 3;
  var currentEnergy = props.currentEnergy || 3;
  
  var moodState = useState(currentMood);
  var mood = moodState[0];
  var setMood = moodState[1];
  
  var energyState = useState(currentEnergy);
  var energy = energyState[0];
  var setEnergy = energyState[1];
  
  var noteState = useState('');
  var note = noteState[0];
  var setNote = noteState[1];
  
  var selectedTagsState = useState([]);
  var selectedTags = selectedTagsState[0];
  var setSelectedTags = selectedTagsState[1];
  
  if (!isOpen) return null;
  
  var handleSave = function() {
    onSave({
      mood: mood,
      energy: energy,
      note: note,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    });
    onClose();
  };
  
  var toggleTag = function(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(function(t) { return t !== tag; }));
    } else {
      setSelectedTags(selectedTags.concat([tag]));
    }
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center',
    onClick: function(e) { if (e.target === e.currentTarget) onClose(); }
  },
    // 배경
    React.createElement('div', { className: 'absolute inset-0 bg-black/40 backdrop-blur-sm' }),
    
    // 모달
    React.createElement('div', { 
      className: 'relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp'
    },
      // 핸들
      React.createElement('div', { className: 'sticky top-0 bg-white pt-3 pb-2 flex justify-center' },
        React.createElement('div', { className: 'w-10 h-1 bg-gray-300 rounded-full' })
      ),
      
      // 헤더
      React.createElement('div', { className: 'px-6 pb-4 flex items-center justify-between' },
        React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, '오늘 기분 어때요?'),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 rounded-full hover:bg-gray-100 transition-colors'
        }, React.createElement(X, { size: 20, className: 'text-gray-500' }))
      ),
      
      // 콘텐츠
      React.createElement('div', { className: 'px-6 pb-8' },
        // 기분 선택
        React.createElement('div', { className: 'mb-6' },
          React.createElement('p', { className: 'text-sm font-medium text-gray-600 mb-3' }, '기분'),
          React.createElement('div', { className: 'flex justify-between gap-2' },
            MOOD_OPTIONS.map(function(option) {
              var isSelected = mood === option.value;
              return React.createElement('button', {
                key: option.value,
                onClick: function() { setMood(option.value); },
                className: 'flex-1 flex flex-col items-center p-3 rounded-2xl transition-all ' +
                  (isSelected 
                    ? 'bg-gradient-to-br ' + option.color + ' text-white scale-105 shadow-lg' 
                    : 'bg-gray-100 hover:bg-gray-200')
              },
                React.createElement('span', { className: 'text-2xl mb-1' }, option.emoji),
                React.createElement('span', { className: 'text-[10px] font-medium' }, option.label)
              );
            })
          )
        ),
        
        // 에너지 선택
        React.createElement('div', { className: 'mb-6' },
          React.createElement('p', { className: 'text-sm font-medium text-gray-600 mb-3' }, '에너지'),
          React.createElement('div', { className: 'flex justify-between gap-2' },
            ENERGY_OPTIONS.map(function(option) {
              var isSelected = energy === option.value;
              return React.createElement('button', {
                key: option.value,
                onClick: function() { setEnergy(option.value); },
                className: 'flex-1 flex flex-col items-center p-3 rounded-2xl transition-all ' +
                  (isSelected 
                    ? 'bg-gradient-to-br ' + option.color + ' text-white scale-105 shadow-lg' 
                    : 'bg-gray-100 hover:bg-gray-200')
              },
                React.createElement('span', { className: 'text-2xl mb-1' }, option.emoji),
                React.createElement('span', { className: 'text-[10px] font-medium' }, option.label)
              );
            })
          )
        ),
        
        // 빠른 태그
        React.createElement('div', { className: 'mb-6' },
          React.createElement('p', { className: 'text-sm font-medium text-gray-600 mb-3' }, '이유가 있나요? (선택)'),
          React.createElement('div', { className: 'flex flex-wrap gap-2' },
            QUICK_NOTES.map(function(tag) {
              var isSelected = selectedTags.includes(tag);
              return React.createElement('button', {
                key: tag,
                onClick: function() { toggleTag(tag); },
                className: 'px-3 py-2 rounded-full text-sm transition-all ' +
                  (isSelected 
                    ? 'bg-[#A996FF] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }, tag);
            })
          )
        ),
        
        // 메모
        React.createElement('div', { className: 'mb-6' },
          React.createElement('p', { className: 'text-sm font-medium text-gray-600 mb-2' }, '한 줄 메모 (선택)'),
          React.createElement('input', {
            type: 'text',
            value: note,
            onChange: function(e) { setNote(e.target.value); },
            placeholder: '오늘 있었던 일...',
            className: 'w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]/50 text-sm'
          })
        ),
        
        // 알프레도 피드백
        React.createElement('div', { className: 'bg-gradient-to-br from-[#A996FF]/10 to-[#8B7CF7]/10 rounded-2xl p-4 mb-6' },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('span', { className: 'text-2xl' }, '🐧'),
            React.createElement('p', { className: 'text-sm text-gray-700' },
              mood <= 2 
                ? '힘든 하루네요. 무리하지 말고 쉬어가도 괜찮아요. 💜'
                : mood >= 4
                  ? '기분 좋은 날이네요! 이 기세로 화이팅! ✨'
                  : '괜찮아요, 평범한 하루도 소중해요. 🌿'
            )
          )
        ),
        
        // 저장 버튼
        React.createElement('button', {
          onClick: handleSave,
          className: 'w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg'
        },
          React.createElement(Sparkles, { size: 18 }),
          '기록하기'
        )
      )
    )
  );
};

export default MoodLogModal;
