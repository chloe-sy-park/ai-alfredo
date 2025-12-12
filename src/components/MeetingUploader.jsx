import React, { useState, useCallback } from 'react';
import { 
  Mic, Upload, FileAudio, Loader2, CheckCircle2, AlertCircle, 
  Calendar, CheckSquare, Lightbulb, MessageSquare, Clock,
  ChevronDown, ChevronUp, X, Plus, Sparkles, Download, FileText
} from 'lucide-react';

// 회의록 업로드 및 분석 컴포넌트
const MeetingUploader = ({ 
  onClose, 
  onAddTasks, 
  onAddEvents, 
  onAddToInbox,
  darkMode = false 
}) => {
  const [step, setStep] = useState('upload'); // upload, transcribing, analyzing, result, error
  const [file, setFile] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    transcript: true,
    summary: true,
    actions: true,
    schedules: true,
    ideas: false,
    decisions: false,
  });
  const [selectedItems, setSelectedItems] = useState({
    tasks: [],
    events: [],
    ideas: [],
  });

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    input: darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800',
  };

  // 파일 드롭 핸들러
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isAudioFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/webm', 'audio/ogg'];
    return validTypes.includes(file.type) || 
           file.name.match(/\.(mp3|wav|m4a|webm|ogg|mp4)$/i);
  };

  const isDocumentFile = (file) => {
    const validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    return validTypes.includes(file.type) || 
           file.name.match(/\.(txt|md|text)$/i);
  };

  const isValidFile = (file) => {
    return isAudioFile(file) || isDocumentFile(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  // 분석 시작
  const startAnalysis = async () => {
    if (!file) return;

    try {
      let transcriptText = '';
      let language = 'ko';

      // 문서 파일인 경우 직접 텍스트 읽기
      if (isDocumentFile(file)) {
        setStep('analyzing');
        setProgress(30);

        transcriptText = await readTextFile(file);
        setTranscript(transcriptText);
        setDetectedLanguage('ko'); // 문서는 기본적으로 한국어로 가정
        setProgress(50);
      } else {
        // 오디오 파일인 경우 Whisper로 변환
        setStep('transcribing');
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        setProgress(30);

        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transcribeRes.ok) {
          const err = await transcribeRes.json();
          throw new Error(err.error || 'Transcription failed');
        }

        const transcribeData = await transcribeRes.json();
        transcriptText = transcribeData.text;
        language = transcribeData.language;
        setTranscript(transcriptText);
        setDetectedLanguage(language);
        setProgress(60);
      }

      // Step 2: Analyze
      setStep('analyzing');
      setProgress(70);

      const analyzeRes = await fetch('/api/analyze-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          meetingTitle: meetingTitle || file.name,
          language: language,
        }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const analyzeData = await analyzeRes.json();
      setProgress(100);

      if (analyzeData.analysis) {
        setAnalysis(analyzeData.analysis);
        // 기본적으로 모든 액션 아이템 선택
        setSelectedItems({
          tasks: analyzeData.analysis.actionItems?.map((_, i) => i) || [],
          events: analyzeData.analysis.schedules?.map((_, i) => i) || [],
          ideas: [],
        });
      }

      setStep('result');

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      setStep('error');
    }
  };

  // 텍스트 파일 읽기
  const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('파일을 읽을 수 없습니다'));
      reader.readAsText(file);
    });
  };

  // 원문 텍스트 다운로드
  const downloadTranscript = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingTitle || '회의록'}_원문.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 정리된 회의록 다운로드 (마크다운)
  const downloadMeetingNotes = () => {
    if (!analysis) return;
    
    const date = new Date().toLocaleDateString('ko-KR');
    let markdown = `# ${meetingTitle || '회의록'}\n\n`;
    markdown += `📅 ${date}\n\n`;
    markdown += `---\n\n`;
    
    // 요약
    markdown += `## 📋 요약\n\n${analysis.summary}\n\n`;
    
    // 핵심 포인트
    if (analysis.keyPoints?.length > 0) {
      markdown += `## 🎯 핵심 포인트\n\n`;
      analysis.keyPoints.forEach(point => {
        markdown += `- ${point}\n`;
      });
      markdown += `\n`;
    }
    
    // 액션 아이템
    if (analysis.actionItems?.length > 0) {
      markdown += `## ✅ 액션 아이템\n\n`;
      analysis.actionItems.forEach(item => {
        const priority = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
        markdown += `- [ ] ${priority} ${item.task}`;
        if (item.assignee) markdown += ` (@${item.assignee})`;
        if (item.deadline) markdown += ` - 마감: ${item.deadline}`;
        markdown += `\n`;
      });
      markdown += `\n`;
    }
    
    // 일정
    if (analysis.schedules?.length > 0) {
      markdown += `## 📅 일정\n\n`;
      analysis.schedules.forEach(schedule => {
        markdown += `- **${schedule.title}**`;
        if (schedule.date) markdown += ` - ${schedule.date}`;
        if (schedule.time) markdown += ` ${schedule.time}`;
        if (schedule.description) markdown += `\n  ${schedule.description}`;
        markdown += `\n`;
      });
      markdown += `\n`;
    }
    
    // 결정사항
    if (analysis.decisions?.length > 0) {
      markdown += `## 🔖 결정 사항\n\n`;
      analysis.decisions.forEach(decision => {
        markdown += `- ${decision}\n`;
      });
      markdown += `\n`;
    }
    
    // 아이디어
    if (analysis.ideas?.length > 0) {
      markdown += `## 💡 아이디어\n\n`;
      analysis.ideas.forEach(idea => {
        markdown += `- ${idea}\n`;
      });
      markdown += `\n`;
    }
    
    // 후속 조치
    if (analysis.followUp?.length > 0) {
      markdown += `## 📌 후속 조치\n\n`;
      analysis.followUp.forEach(item => {
        markdown += `- ${item}\n`;
      });
      markdown += `\n`;
    }
    
    // 원문 포함
    markdown += `---\n\n`;
    markdown += `## 📝 원문 텍스트\n\n`;
    markdown += `${transcript}\n`;
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingTitle || '회의록'}_정리.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 선택 토글
  const toggleSelection = (type, index) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(index)
        ? prev[type].filter(i => i !== index)
        : [...prev[type], index],
    }));
  };

  // 선택된 항목 추가
  const addSelectedItems = () => {
    if (!analysis) return;

    // 태스크 추가
    const tasksToAdd = selectedItems.tasks.map(i => {
      const item = analysis.actionItems[i];
      return {
        id: Date.now() + Math.random(),
        title: item.task,
        completed: false,
        priority: item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1,
        dueDate: item.deadline,
        category: 'work',
        fromMeeting: meetingTitle || file?.name,
      };
    });
    if (tasksToAdd.length > 0 && onAddTasks) {
      onAddTasks(tasksToAdd);
    }

    // 일정 추가
    const eventsToAdd = selectedItems.events.map(i => {
      const item = analysis.schedules[i];
      return {
        id: Date.now() + Math.random(),
        title: item.title,
        date: item.date,
        time: item.time || '09:00',
        description: item.description,
        fromMeeting: meetingTitle || file?.name,
      };
    });
    if (eventsToAdd.length > 0 && onAddEvents) {
      onAddEvents(eventsToAdd);
    }

    // 아이디어는 인박스로
    const ideasToAdd = selectedItems.ideas.map(i => ({
      id: Date.now() + Math.random(),
      text: analysis.ideas[i],
      createdAt: new Date().toISOString(),
      fromMeeting: meetingTitle || file?.name,
    }));
    if (ideasToAdd.length > 0 && onAddToInbox) {
      onAddToInbox(ideasToAdd);
    }

    onClose?.();
  };

  // 섹션 토글
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl ${theme.card} shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme.text}`}>회의록 정리</h2>
              <p className={`text-xs ${theme.textSecondary}`}>알프레도가 분석해드릴게요</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}>
            <X className={`w-5 h-5 ${theme.textSecondary}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* 회의 제목 입력 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  회의 제목 (선택)
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="예: Q4 마케팅 전략 회의"
                  className={`w-full px-4 py-3 rounded-xl border ${theme.border} ${theme.input} focus:outline-none focus:ring-2 focus:ring-[#A996FF]`}
                />
              </div>

              {/* 파일 업로드 영역 */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  file 
                    ? 'border-[#A996FF] bg-[#A996FF]/5' 
                    : `${theme.border} hover:border-[#A996FF] hover:bg-[#A996FF]/5`
                }`}
              >
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.txt,.md,.text"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#A996FF]/10 flex items-center justify-center">
                      {isAudioFile(file) ? (
                        <FileAudio className="w-8 h-8 text-[#A996FF]" />
                      ) : (
                        <FileText className="w-8 h-8 text-[#A996FF]" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${theme.text}`}>{file.name}</p>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        {formatFileSize(file.size)}
                        {isDocumentFile(file) && ' • 문서 파일'}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      파일 제거
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Upload className={`w-8 h-8 ${theme.textSecondary}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${theme.text}`}>파일 업로드</p>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        드래그하거나 클릭해서 선택
                      </p>
                    </div>
                    <div className={`text-xs ${theme.textSecondary} space-y-1`}>
                      <p>🎤 음성: MP3, WAV, M4A, WebM (최대 25MB)</p>
                      <p>📄 문서: TXT, MD (회의록 텍스트)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 분석 시작 버튼 */}
              <button
                onClick={startAnalysis}
                disabled={!file}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  file 
                    ? 'bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] hover:opacity-90 active:scale-[0.98]' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  알프레도에게 분석 요청
                </span>
              </button>
            </div>
          )}

          {/* Processing Steps */}
          {(step === 'transcribing' || step === 'analyzing') && (
            <div className="py-12 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-[#A996FF] border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🐧</span>
                </div>
              </div>
              
              <div>
                <p className={`text-lg font-semibold ${theme.text}`}>
                  {step === 'transcribing' ? '음성을 텍스트로 변환 중...' : '회의 내용 분석 중...'}
                </p>
                <p className={`text-sm ${theme.textSecondary} mt-1`}>
                  {step === 'transcribing' 
                    ? '잠시만 기다려주세요' 
                    : '액션 아이템과 일정을 찾고 있어요'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`text-sm ${theme.textSecondary} mt-2`}>{progress}%</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className={`text-lg font-semibold ${theme.text}`}>분석 중 오류가 발생했어요</p>
                <p className={`text-sm ${theme.textSecondary} mt-1`}>{error}</p>
              </div>
              <button
                onClick={() => { setStep('upload'); setError(null); }}
                className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Result */}
          {step === 'result' && analysis && (
            <div className="space-y-4">
              {/* 다운로드 버튼 영역 */}
              <div className="flex gap-2">
                <button
                  onClick={downloadTranscript}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border ${theme.border} ${theme.card} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                >
                  <FileText className="w-4 h-4 text-[#A996FF]" />
                  <span className={`text-sm font-medium ${theme.text}`}>원문 다운로드</span>
                </button>
                <button
                  onClick={downloadMeetingNotes}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white hover:opacity-90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">회의록 다운로드</span>
                </button>
              </div>

              {/* 원문 텍스트 */}
              <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                <button
                  onClick={() => toggleSection('transcript')}
                  className={`w-full flex items-center justify-between p-4 ${theme.card}`}
                >
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-[#A996FF]" />
                    <span className={`font-semibold ${theme.text}`}>원문 텍스트</span>
                    {detectedLanguage && !['ko', 'korean'].includes(detectedLanguage.toLowerCase()) && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                        {detectedLanguage === 'en' ? '영어' : 
                         detectedLanguage === 'ja' ? '일본어' : 
                         detectedLanguage === 'zh' ? '중국어' : 
                         detectedLanguage.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {expandedSections.transcript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.transcript && (
                  <div className={`border-t ${theme.border}`}>
                    {/* 원문 */}
                    <div className={`p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium ${theme.textSecondary}`}>
                          {detectedLanguage && !['ko', 'korean'].includes(detectedLanguage.toLowerCase()) ? '📝 원문' : '📝 텍스트'}
                        </span>
                      </div>
                      <p className={`${theme.text} leading-relaxed text-sm whitespace-pre-wrap`}>{transcript}</p>
                    </div>
                    
                    {/* 번역본 (외국어일 때만) */}
                    {detectedLanguage && !['ko', 'korean'].includes(detectedLanguage.toLowerCase()) && analysis.translatedTranscript && (
                      <div className={`p-4 border-t ${theme.border} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium text-[#A996FF]`}>🇰🇷 한국어 번역</span>
                        </div>
                        <p className={`${theme.text} leading-relaxed text-sm whitespace-pre-wrap`}>{analysis.translatedTranscript}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 요약 */}
              <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                <button
                  onClick={() => toggleSection('summary')}
                  className={`w-full flex items-center justify-between p-4 ${theme.card}`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#A996FF]" />
                    <span className={`font-semibold ${theme.text}`}>요약</span>
                  </div>
                  {expandedSections.summary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.summary && (
                  <div className={`p-4 border-t ${theme.border} ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className={`${theme.text} leading-relaxed`}>{analysis.summary}</p>
                    {analysis.keyPoints?.length > 0 && (
                      <ul className={`mt-3 space-y-1 ${theme.textSecondary} text-sm`}>
                        {analysis.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#A996FF]">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 액션 아이템 */}
              {analysis.actionItems?.length > 0 && (
                <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                  <button
                    onClick={() => toggleSection('actions')}
                    className={`w-full flex items-center justify-between p-4 ${theme.card}`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                      <span className={`font-semibold ${theme.text}`}>액션 아이템</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-600">
                        {analysis.actionItems.length}
                      </span>
                    </div>
                    {expandedSections.actions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.actions && (
                    <div className={`border-t ${theme.border}`}>
                      {analysis.actionItems.map((item, i) => (
                        <div 
                          key={i}
                          onClick={() => toggleSelection('tasks', i)}
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                            selectedItems.tasks.includes(i) 
                              ? darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50' 
                              : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } ${i > 0 ? `border-t ${theme.border}` : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedItems.tasks.includes(i) 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : theme.border
                          }`}>
                            {selectedItems.tasks.includes(i) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${theme.text}`}>{item.task}</p>
                            <div className={`flex items-center gap-3 mt-1 text-sm ${theme.textSecondary}`}>
                              {item.assignee && <span>👤 {item.assignee}</span>}
                              {item.deadline && <span>📅 {item.deadline}</span>}
                              {item.priority && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  item.priority === 'high' 
                                    ? 'bg-red-100 text-red-600' 
                                    : item.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.priority === 'high' ? '높음' : item.priority === 'medium' ? '중간' : '낮음'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 일정 */}
              {analysis.schedules?.length > 0 && (
                <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                  <button
                    onClick={() => toggleSection('schedules')}
                    className={`w-full flex items-center justify-between p-4 ${theme.card}`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className={`font-semibold ${theme.text}`}>일정</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                        {analysis.schedules.length}
                      </span>
                    </div>
                    {expandedSections.schedules ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.schedules && (
                    <div className={`border-t ${theme.border}`}>
                      {analysis.schedules.map((item, i) => (
                        <div 
                          key={i}
                          onClick={() => toggleSelection('events', i)}
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                            selectedItems.events.includes(i) 
                              ? darkMode ? 'bg-blue-900/20' : 'bg-blue-50' 
                              : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } ${i > 0 ? `border-t ${theme.border}` : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedItems.events.includes(i) 
                              ? 'bg-blue-500 border-blue-500' 
                              : theme.border
                          }`}>
                            {selectedItems.events.includes(i) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${theme.text}`}>{item.title}</p>
                            <div className={`flex items-center gap-2 mt-1 text-sm ${theme.textSecondary}`}>
                              <Clock className="w-4 h-4" />
                              {item.date} {item.time && `${item.time}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 아이디어 */}
              {analysis.ideas?.length > 0 && (
                <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                  <button
                    onClick={() => toggleSection('ideas')}
                    className={`w-full flex items-center justify-between p-4 ${theme.card}`}
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <span className={`font-semibold ${theme.text}`}>아이디어</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600">
                        {analysis.ideas.length}
                      </span>
                    </div>
                    {expandedSections.ideas ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.ideas && (
                    <div className={`border-t ${theme.border}`}>
                      {analysis.ideas.map((idea, i) => (
                        <div 
                          key={i}
                          onClick={() => toggleSelection('ideas', i)}
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                            selectedItems.ideas.includes(i) 
                              ? darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50' 
                              : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } ${i > 0 ? `border-t ${theme.border}` : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedItems.ideas.includes(i) 
                              ? 'bg-yellow-500 border-yellow-500' 
                              : theme.border
                          }`}>
                            {selectedItems.ideas.includes(i) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <p className={`${theme.text}`}>{idea}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'result' && analysis && (
          <div className={`p-4 border-t ${theme.border} ${theme.card}`}>
            <div className={`flex items-center justify-between mb-3 text-sm ${theme.textSecondary}`}>
              <span>
                선택됨: 태스크 {selectedItems.tasks.length}개, 
                일정 {selectedItems.events.length}개, 
                아이디어 {selectedItems.ideas.length}개
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                나중에
              </button>
              <button
                onClick={addSelectedItems}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#A996FF] to-[#8B7CF7]"
              >
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  추가하기
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingUploader;
