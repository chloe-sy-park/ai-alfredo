import React, { useState, useCallback } from 'react';
import { Download, Upload, FileJson, Check, AlertCircle, Trash2, RefreshCw, Shield, Cloud, HardDrive } from 'lucide-react';

// localStorage 키 목록
var STORAGE_KEYS = {
  gamification: 'lifebutler_gamification',
  quests: 'lifebutler_daily_quests',
  badges: 'lifebutler_badges',
  habits: 'lifebutler_habits',
  notifications: 'lifebutler_notifications',
  tomorrowMessages: 'lifebutler_tomorrow_messages',
  failureCare: 'lifebutler_failure_care',
  tasks: 'lifebutler_tasks',
  settings: 'lifebutler_settings'
};

// 모든 데이터 수집
function collectAllData() {
  var data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {}
  };
  
  Object.keys(STORAGE_KEYS).forEach(function(key) {
    try {
      var stored = localStorage.getItem(STORAGE_KEYS[key]);
      if (stored) {
        data.data[key] = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to collect ' + key + ':', e);
    }
  });
  
  return data;
}

// 데이터 복원
function restoreAllData(importedData) {
  if (!importedData || !importedData.data) {
    throw new Error('Invalid data format');
  }
  
  var restored = [];
  var failed = [];
  
  Object.keys(importedData.data).forEach(function(key) {
    try {
      if (STORAGE_KEYS[key]) {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(importedData.data[key]));
        restored.push(key);
      }
    } catch (e) {
      console.warn('Failed to restore ' + key + ':', e);
      failed.push(key);
    }
  });
  
  return { restored: restored, failed: failed };
}

// 모든 데이터 삭제
function clearAllData() {
  Object.keys(STORAGE_KEYS).forEach(function(key) {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
    } catch (e) {
      console.warn('Failed to clear ' + key + ':', e);
    }
  });
}

// 데이터 크기 계산
function calculateDataSize() {
  var totalSize = 0;
  var details = {};
  
  Object.keys(STORAGE_KEYS).forEach(function(key) {
    try {
      var stored = localStorage.getItem(STORAGE_KEYS[key]);
      if (stored) {
        var size = new Blob([stored]).size;
        totalSize += size;
        details[key] = size;
      }
    } catch (e) {
      console.warn('Failed to calculate size for ' + key + ':', e);
    }
  });
  
  return { total: totalSize, details: details };
}

// 크기 포맷
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 📥 데이터 내보내기 버튼
export var ExportButton = function(props) {
  var darkMode = props.darkMode;
  var onExport = props.onExport;
  var compact = props.compact;
  
  var stateState = useState('idle'); // idle, exporting, done
  var state = stateState[0];
  var setState = stateState[1];
  
  var handleExport = function() {
    setState('exporting');
    
    try {
      var data = collectAllData();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      
      var a = document.createElement('a');
      a.href = url;
      a.download = 'lifebutler-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setState('done');
      if (onExport) onExport(data);
      
      setTimeout(function() { setState('idle'); }, 2000);
    } catch (e) {
      console.error('Export failed:', e);
      setState('idle');
    }
  };
  
  if (compact) {
    return React.createElement('button', {
      onClick: handleExport,
      disabled: state === 'exporting',
      className: 'flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A996FF] text-white font-medium disabled:opacity-50'
    },
      state === 'done' ? React.createElement(Check, { size: 18 }) : React.createElement(Download, { size: 18 }),
      state === 'exporting' ? '내보내는 중...' : state === 'done' ? '완료!' : '내보내기'
    );
  }
  
  return React.createElement('button', {
    onClick: handleExport,
    disabled: state === 'exporting',
    className: 'w-full p-4 rounded-xl border ' + (darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white') + 
      ' flex items-center gap-3 hover:border-[#A996FF]/50 transition-all disabled:opacity-50'
  },
    React.createElement('div', { 
      className: 'w-12 h-12 rounded-xl bg-[#A996FF]/20 flex items-center justify-center'
    }, React.createElement(Download, { size: 24, className: 'text-[#A996FF]' })),
    React.createElement('div', { className: 'flex-1 text-left' },
      React.createElement('p', { className: (darkMode ? 'text-white' : 'text-gray-800') + ' font-bold' }, '데이터 내보내기'),
      React.createElement('p', { className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm' }, 
        '모든 데이터를 JSON 파일로 저장'
      )
    ),
    state === 'done' && React.createElement(Check, { size: 20, className: 'text-emerald-500' })
  );
};

// 📤 데이터 가져오기 버튼
export var ImportButton = function(props) {
  var darkMode = props.darkMode;
  var onImport = props.onImport;
  var compact = props.compact;
  
  var stateState = useState('idle'); // idle, importing, done, error
  var state = stateState[0];
  var setState = stateState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var handleImport = function(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    
    setState('importing');
    setError(null);
    
    var reader = new FileReader();
    reader.onload = function(event) {
      try {
        var data = JSON.parse(event.target.result);
        var result = restoreAllData(data);
        
        setState('done');
        if (onImport) onImport(result);
        
        setTimeout(function() { 
          setState('idle'); 
          window.location.reload(); // 새로고침으로 데이터 반영
        }, 1500);
      } catch (e) {
        console.error('Import failed:', e);
        setError('파일 형식이 올바르지 않습니다.');
        setState('error');
        setTimeout(function() { setState('idle'); setError(null); }, 3000);
      }
    };
    reader.readAsText(file);
    
    // 입력 초기화
    e.target.value = '';
  };
  
  if (compact) {
    return React.createElement('label', {
      className: 'flex items-center gap-2 px-4 py-2 rounded-xl ' + 
        (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800') + 
        ' font-medium cursor-pointer hover:bg-[#A996FF]/20'
    },
      React.createElement('input', {
        type: 'file',
        accept: '.json',
        onChange: handleImport,
        className: 'hidden'
      }),
      state === 'done' ? React.createElement(Check, { size: 18 }) : React.createElement(Upload, { size: 18 }),
      state === 'importing' ? '가져오는 중...' : state === 'done' ? '완료!' : '가져오기'
    );
  }
  
  return React.createElement('label', {
    className: 'w-full p-4 rounded-xl border ' + (darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white') + 
      ' flex items-center gap-3 hover:border-[#A996FF]/50 transition-all cursor-pointer'
  },
    React.createElement('input', {
      type: 'file',
      accept: '.json',
      onChange: handleImport,
      className: 'hidden'
    }),
    React.createElement('div', { 
      className: 'w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center'
    }, React.createElement(Upload, { size: 24, className: 'text-emerald-500' })),
    React.createElement('div', { className: 'flex-1 text-left' },
      React.createElement('p', { className: (darkMode ? 'text-white' : 'text-gray-800') + ' font-bold' }, '데이터 가져오기'),
      React.createElement('p', { className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm' }, 
        error || '백업 파일에서 데이터 복원'
      )
    ),
    state === 'done' && React.createElement(Check, { size: 20, className: 'text-emerald-500' }),
    state === 'error' && React.createElement(AlertCircle, { size: 20, className: 'text-red-500' })
  );
};

// 🗑️ 데이터 초기화 버튼
export var ResetButton = function(props) {
  var darkMode = props.darkMode;
  var onReset = props.onReset;
  
  var confirmState = useState(false);
  var showConfirm = confirmState[0];
  var setShowConfirm = confirmState[1];
  
  var handleReset = function() {
    clearAllData();
    if (onReset) onReset();
    setShowConfirm(false);
    window.location.reload();
  };
  
  if (showConfirm) {
    return React.createElement('div', { 
      className: 'w-full p-4 rounded-xl border border-red-500/50 bg-red-500/10'
    },
      React.createElement('p', { className: 'text-red-500 font-bold mb-2' }, '⚠️ 정말 초기화할까요?'),
      React.createElement('p', { className: (darkMode ? 'text-gray-300' : 'text-gray-600') + ' text-sm mb-4' }, 
        '모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'
      ),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', {
          onClick: function() { setShowConfirm(false); },
          className: 'flex-1 py-2 rounded-lg ' + (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800')
        }, '취소'),
        React.createElement('button', {
          onClick: handleReset,
          className: 'flex-1 py-2 rounded-lg bg-red-500 text-white font-medium'
        }, '초기화')
      )
    );
  }
  
  return React.createElement('button', {
    onClick: function() { setShowConfirm(true); },
    className: 'w-full p-4 rounded-xl border border-red-500/30 ' + 
      (darkMode ? 'bg-gray-800' : 'bg-white') + 
      ' flex items-center gap-3 hover:border-red-500/50 transition-all'
  },
    React.createElement('div', { 
      className: 'w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center'
    }, React.createElement(Trash2, { size: 24, className: 'text-red-500' })),
    React.createElement('div', { className: 'flex-1 text-left' },
      React.createElement('p', { className: 'text-red-500 font-bold' }, '데이터 초기화'),
      React.createElement('p', { className: (darkMode ? 'text-gray-400' : 'text-gray-500') + ' text-sm' }, 
        '모든 데이터를 삭제하고 처음부터 시작'
      )
    )
  );
};

// 📊 저장 공간 현황
export var StorageStatus = function(props) {
  var darkMode = props.darkMode;
  
  var sizeInfo = calculateDataSize();
  
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  
  var categories = [
    { key: 'gamification', label: '게임 데이터', icon: '🎮' },
    { key: 'tasks', label: '할일', icon: '✅' },
    { key: 'habits', label: '습관', icon: '🎯' },
    { key: 'badges', label: '배지', icon: '🏅' },
    { key: 'quests', label: '퀘스트', icon: '📜' },
    { key: 'settings', label: '설정', icon: '⚙️' }
  ];
  
  return React.createElement('div', { className: cardBg + ' rounded-2xl p-4 border ' + borderColor },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement(HardDrive, { size: 18, className: 'text-[#A996FF]' }),
      React.createElement('h3', { className: textPrimary + ' font-bold' }, '저장 공간')
    ),
    
    // 전체 사용량
    React.createElement('div', { className: 'mb-4 p-3 rounded-xl ' + (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') },
      React.createElement('div', { className: 'flex justify-between mb-2' },
        React.createElement('span', { className: textSecondary + ' text-sm' }, '사용 중'),
        React.createElement('span', { className: textPrimary + ' font-bold' }, formatSize(sizeInfo.total))
      ),
      React.createElement('div', { className: 'h-2 rounded-full ' + (darkMode ? 'bg-gray-600' : 'bg-gray-200') + ' overflow-hidden' },
        React.createElement('div', { 
          className: 'h-full bg-[#A996FF] rounded-full',
          style: { width: Math.min(100, (sizeInfo.total / (5 * 1024 * 1024)) * 100) + '%' } // 5MB 기준
        })
      ),
      React.createElement('p', { className: textSecondary + ' text-xs mt-1' }, '최대 5MB까지 사용 가능')
    ),
    
    // 카테고리별 사용량
    React.createElement('div', { className: 'space-y-2' },
      categories.map(function(cat) {
        var size = sizeInfo.details[cat.key] || 0;
        return React.createElement('div', {
          key: cat.key,
          className: 'flex items-center justify-between text-sm'
        },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', null, cat.icon),
            React.createElement('span', { className: textSecondary }, cat.label)
          ),
          React.createElement('span', { className: textPrimary }, formatSize(size))
        );
      })
    )
  );
};

// 🛠️ 데이터 관리 페이지
export var DataManagementPage = function(props) {
  var darkMode = props.darkMode;
  var onBack = props.onBack;
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  return React.createElement('div', { className: bgColor + ' min-h-screen pb-24' },
    // 헤더
    React.createElement('div', { className: 'px-4 pt-6 pb-4' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-2' },
        React.createElement('button', {
          onClick: onBack,
          className: textSecondary + ' hover:' + textPrimary
        }, '←'),
        React.createElement('h1', { className: textPrimary + ' text-2xl font-bold' }, '💾 데이터 관리')
      ),
      React.createElement('p', { className: textSecondary + ' text-sm' }, 
        '데이터를 백업하거나 복원할 수 있어요'
      )
    ),
    
    // 콘텐츠
    React.createElement('div', { className: 'px-4 space-y-4' },
      // 저장 공간
      React.createElement(StorageStatus, { darkMode: darkMode }),
      
      // 내보내기
      React.createElement(ExportButton, { darkMode: darkMode }),
      
      // 가져오기
      React.createElement(ImportButton, { darkMode: darkMode }),
      
      // 초기화
      React.createElement(ResetButton, { darkMode: darkMode }),
      
      // 안내 메시지
      React.createElement('div', { 
        className: 'p-4 rounded-xl bg-[#A996FF]/10 border border-[#A996FF]/30'
      },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement(Shield, { size: 20, className: 'text-[#A996FF] flex-shrink-0 mt-0.5' }),
          React.createElement('div', null,
            React.createElement('p', { className: textPrimary + ' font-medium mb-1' }, '데이터 보안 안내'),
            React.createElement('p', { className: textSecondary + ' text-sm' }, 
              '모든 데이터는 기기 내부에만 저장되며, 외부 서버로 전송되지 않습니다. ' +
              '정기적으로 백업하여 소중한 데이터를 보호하세요.'
            )
          )
        )
      )
    )
  );
};

export default {
  ExportButton: ExportButton,
  ImportButton: ImportButton,
  ResetButton: ResetButton,
  StorageStatus: StorageStatus,
  DataManagementPage: DataManagementPage,
  collectAllData: collectAllData,
  restoreAllData: restoreAllData,
  clearAllData: clearAllData,
  calculateDataSize: calculateDataSize
};
