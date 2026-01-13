// 회의록 분석 유틸리티 함수들

export var isAudioFile = function(file) {
  var validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/webm', 'audio/ogg'];
  return validTypes.includes(file.type) || 
         file.name.match(/\.(mp3|wav|m4a|webm|ogg|mp4)$/i);
};

export var isDocumentFile = function(file) {
  var validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
  return validTypes.includes(file.type) || 
         file.name.match(/\.(txt|md|text)$/i);
};

export var isValidFile = function(file) {
  return isAudioFile(file) || isDocumentFile(file);
};

export var formatFileSize = function(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export var formatDuration = function(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds % 60);
  return mins + '분 ' + secs + '초';
};

export var readTextFile = function(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) { resolve(e.target.result); };
    reader.onerror = function() { reject(new Error('파일 읽기 실패')); };
    reader.readAsText(file);
  });
};

export var downloadTranscript = function(transcript, meetingTitle) {
  var filename = (meetingTitle || '회의록') + '_원문.txt';
  var blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export var downloadMeetingNotes = function(analysis, transcript, meetingTitle) {
  var filename = (meetingTitle || '회의록') + '_정리.md';
  var date = new Date().toLocaleDateString('ko-KR');
  
  var markdown = '# ' + (meetingTitle || '회의록') + '\n\n';
  markdown += '📅 ' + date + '\n\n';
  
  // 요약
  markdown += '## 📝 요약\n\n' + analysis.summary + '\n\n';
  
  // 핵심 포인트
  if (analysis.keyPoints && analysis.keyPoints.length > 0) {
    markdown += '## 💡 핵심 포인트\n\n';
    analysis.keyPoints.forEach(function(point) {
      markdown += '- ' + point + '\n';
    });
    markdown += '\n';
  }
  
  // 액션 아이템
  if (analysis.actionItems && analysis.actionItems.length > 0) {
    markdown += '## ✅ 액션 아이템\n\n';
    analysis.actionItems.forEach(function(item, i) {
      var priority = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
      markdown += (i + 1) + '. ' + priority + ' ' + item.task;
      if (item.assignee) markdown += ' (@' + item.assignee + ')';
      if (item.deadline) markdown += ' - ' + item.deadline;
      markdown += '\n';
    });
    markdown += '\n';
  }
  
  // 일정
  if (analysis.schedules && analysis.schedules.length > 0) {
    markdown += '## 📅 일정\n\n';
    analysis.schedules.forEach(function(item) {
      markdown += '- **' + item.title + '**';
      if (item.date) markdown += ': ' + item.date;
      if (item.time) markdown += ' ' + item.time;
      if (item.participants) markdown += ' (참석: ' + item.participants.join(', ') + ')';
      markdown += '\n';
    });
    markdown += '\n';
  }
  
  // 결정사항
  if (analysis.decisions && analysis.decisions.length > 0) {
    markdown += '## 🔔 결정사항\n\n';
    analysis.decisions.forEach(function(decision) {
      markdown += '- ' + decision + '\n';
    });
    markdown += '\n';
  }
  
  // 아이디어
  if (analysis.ideas && analysis.ideas.length > 0) {
    markdown += '## 💡 아이디어\n\n';
    analysis.ideas.forEach(function(idea) {
      markdown += '- ' + idea + '\n';
    });
    markdown += '\n';
  }
  
  // 후속 조치
  if (analysis.followUps && analysis.followUps.length > 0) {
    markdown += '## 🔄 후속 조치\n\n';
    analysis.followUps.forEach(function(item) {
      markdown += '- ' + item + '\n';
    });
    markdown += '\n';
  }
  
  // 원문 포함
  markdown += '---\n\n## 📄 원문\n\n' + transcript + '\n';
  
  var blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export var getTheme = function(darkMode) {
  return {
    bg: darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    input: darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800',
  };
};
