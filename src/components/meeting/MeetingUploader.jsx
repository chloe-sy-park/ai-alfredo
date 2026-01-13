import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

// 분리된 컴포넌트들
import MeetingUploadStep from './MeetingUploadStep';
import MeetingProgressStep from './MeetingProgressStep';
import MeetingResultView, { MeetingResultFooter } from './MeetingResultView';
import { isValidFile, isDocumentFile, readTextFile, getTheme } from './meetingUtils';

var MeetingUploader = function(props) {
  var onClose = props.onClose;
  var onAddTasks = props.onAddTasks;
  var onAddEvents = props.onAddEvents;
  var onAddToInbox = props.onAddToInbox;
  var darkMode = props.darkMode || false;
  
  var stepState = useState('upload');
  var step = stepState[0];
  var setStep = stepState[1];
  
  var fileState = useState(null);
  var file = fileState[0];
  var setFile = fileState[1];
  
  var meetingTitleState = useState('');
  var meetingTitle = meetingTitleState[0];
  var setMeetingTitle = meetingTitleState[1];
  
  var progressState = useState(0);
  var progress = progressState[0];
  var setProgress = progressState[1];
  
  var transcriptState = useState('');
  var transcript = transcriptState[0];
  var setTranscript = transcriptState[1];
  
  var detectedLanguageState = useState(null);
  var detectedLanguage = detectedLanguageState[0];
  var setDetectedLanguage = detectedLanguageState[1];
  
  var analysisState = useState(null);
  var analysis = analysisState[0];
  var setAnalysis = analysisState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var expandedSectionsState = useState({
    transcript: true,
    summary: true,
    actions: true,
    schedules: true,
    ideas: false,
    decisions: false
  });
  var expandedSections = expandedSectionsState[0];
  var setExpandedSections = expandedSectionsState[1];
  
  var selectedItemsState = useState({
    tasks: [],
    events: [],
    ideas: []
  });
  var selectedItems = selectedItemsState[0];
  var setSelectedItems = selectedItemsState[1];
  
  var addToGoogleCalendarState = useState(false);
  var addToGoogleCalendar = addToGoogleCalendarState[0];
  var setAddToGoogleCalendar = addToGoogleCalendarState[1];
  
  var isAddingToGoogleState = useState(false);
  var isAddingToGoogle = isAddingToGoogleState[0];
  var setIsAddingToGoogle = isAddingToGoogleState[1];
  
  // Google Calendar 훅
  var googleCalendar = useGoogleCalendar();
  var isGoogleSignedIn = googleCalendar.isSignedIn;
  var isGoogleLoading = googleCalendar.isLoading;
  var googleUser = googleCalendar.userInfo;
  var googleSignIn = googleCalendar.signIn;
  var addGoogleEvents = googleCalendar.addEvents;
  
  var theme = getTheme(darkMode);
  
  // 파일 드롭 핸들러
  var handleDrop = useCallback(function(e) {
    e.preventDefault();
    var droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);
  
  var handleDragOver = useCallback(function(e) {
    e.preventDefault();
  }, []);
  
  var handleFileSelect = function(e) {
    var selectedFile = e.target.files[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  };
  
  // 분석 시작
  var startAnalysis = async function() {
    if (!file) return;
    
    try {
      var transcriptText = '';
      var language = 'ko';
      
      // 문서 파일인 경우 직접 텍스트 읽기
      if (isDocumentFile(file)) {
        setStep('analyzing');
        setProgress(30);
        
        transcriptText = await readTextFile(file);
        setTranscript(transcriptText);
        setDetectedLanguage('ko');
        setProgress(50);
      } else {
        // 오디오 파일인 경우 Whisper로 변환
        setStep('transcribing');
        setProgress(10);
        
        var formData = new FormData();
        formData.append('file', file);
        
        setProgress(30);
        
        var transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        
        if (!transcribeRes.ok) {
          var err = await transcribeRes.json();
          throw new Error(err.error || 'Transcription failed');
        }
        
        var transcribeData = await transcribeRes.json();
        transcriptText = transcribeData.text;
        language = transcribeData.language;
        setTranscript(transcriptText);
        setDetectedLanguage(language);
        setProgress(60);
      }
      
      // Step 2: Analyze
      setStep('analyzing');
      setProgress(70);
      
      var analyzeRes = await fetch('/api/analyze-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          language: language,
          title: meetingTitle
        })
      });
      
      if (!analyzeRes.ok) {
        var err = await analyzeRes.json();
        throw new Error(err.error || 'Analysis failed');
      }
      
      var analyzeData = await analyzeRes.json();
      setAnalysis(analyzeData);
      setProgress(100);
      setStep('result');
      
      // 기본적으로 모든 액션 아이템 선택
      if (analyzeData.actionItems) {
        setSelectedItems(function(prev) {
          return Object.assign({}, prev, {
            tasks: analyzeData.actionItems.map(function(_, i) { return i; })
          });
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      setStep('error');
    }
  };
  
  // 섹션 토글
  var toggleSection = function(section) {
    setExpandedSections(function(prev) {
      var updated = Object.assign({}, prev);
      updated[section] = !prev[section];
      return updated;
    });
  };
  
  // 선택 토글
  var toggleSelection = function(type, index) {
    setSelectedItems(function(prev) {
      var current = prev[type];
      var updated = current.includes(index)
        ? current.filter(function(i) { return i !== index; })
        : current.concat([index]);
      var result = Object.assign({}, prev);
      result[type] = updated;
      return result;
    });
  };
  
  // 선택된 항목 추가
  var addSelectedItems = async function() {
    if (!analysis) return;
    
    setIsAddingToGoogle(true);
    
    try {
      // 태스크 추가
      var tasksToAdd = selectedItems.tasks.map(function(i) {
        var item = analysis.actionItems[i];
        return {
          id: Date.now() + i,
          title: item.task,
          priority: item.priority || 'medium',
          assignee: item.assignee,
          deadline: item.deadline,
          completed: false,
          category: 'work',
          createdAt: new Date().toISOString(),
          source: 'meeting'
        };
      });
      
      if (tasksToAdd.length > 0 && onAddTasks) {
        onAddTasks(tasksToAdd);
      }
      
      // 일정 추가
      var eventsToAdd = selectedItems.events.map(function(i) {
        var item = analysis.schedules[i];
        return {
          id: Date.now() + 1000 + i,
          title: item.title,
          date: item.date,
          time: item.time,
          participants: item.participants,
          createdAt: new Date().toISOString(),
          source: 'meeting'
        };
      });
      
      if (eventsToAdd.length > 0 && onAddEvents) {
        onAddEvents(eventsToAdd);
      }
      
      // Google Calendar에 일정 추가
      if (addToGoogleCalendar && eventsToAdd.length > 0 && addGoogleEvents) {
        await addGoogleEvents(eventsToAdd);
      }
      
      // 아이디어는 Inbox에 추가
      var ideasToAdd = selectedItems.ideas.map(function(i) {
        return {
          id: Date.now() + 2000 + i,
          text: analysis.ideas[i],
          type: 'idea',
          createdAt: new Date().toISOString(),
          source: 'meeting'
        };
      });
      
      if (ideasToAdd.length > 0 && onAddToInbox) {
        onAddToInbox(ideasToAdd);
      }
      
      onClose();
    } catch (err) {
      console.error('Error adding items:', err);
    } finally {
      setIsAddingToGoogle(false);
    }
  };
  
  var handleRetry = function() {
    setStep('upload');
    setError(null);
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50',
    onClick: onClose
  },
    React.createElement('div', {
      className: 'w-full max-w-lg max-h-[90vh] flex flex-col ' + theme.card + ' rounded-t-3xl sm:rounded-3xl overflow-hidden',
      onClick: function(e) { e.stopPropagation(); }
    },
      // Header
      React.createElement('div', { className: 'flex items-center justify-between p-4 border-b ' + theme.border },
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-lg font-bold ' + theme.text }, '회의 분석'),
          React.createElement('p', { className: 'text-sm ' + theme.textSecondary }, '음성 또는 텍스트를 분석해요')
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
        },
          React.createElement(X, { className: 'w-5 h-5 ' + theme.textSecondary })
        )
      ),
      
      // Content
      React.createElement('div', { className: 'flex-1 overflow-y-auto p-4' },
        step === 'upload' && React.createElement(MeetingUploadStep, {
          file: file,
          setFile: setFile,
          meetingTitle: meetingTitle,
          setMeetingTitle: setMeetingTitle,
          onStartAnalysis: startAnalysis,
          onDrop: handleDrop,
          onDragOver: handleDragOver,
          onFileSelect: handleFileSelect,
          theme: theme
        }),
        
        (step === 'transcribing' || step === 'analyzing' || step === 'error') && React.createElement(MeetingProgressStep, {
          step: step,
          progress: progress,
          error: error,
          onRetry: handleRetry,
          theme: theme
        }),
        
        step === 'result' && analysis && React.createElement(MeetingResultView, {
          analysis: analysis,
          transcript: transcript,
          meetingTitle: meetingTitle,
          detectedLanguage: detectedLanguage,
          expandedSections: expandedSections,
          toggleSection: toggleSection,
          selectedItems: selectedItems,
          toggleSelection: toggleSelection,
          addToGoogleCalendar: addToGoogleCalendar,
          setAddToGoogleCalendar: setAddToGoogleCalendar,
          isGoogleSignedIn: isGoogleSignedIn,
          isGoogleLoading: isGoogleLoading,
          googleUser: googleUser,
          googleSignIn: googleSignIn,
          isAddingToGoogle: isAddingToGoogle,
          onAddSelectedItems: addSelectedItems,
          onClose: onClose,
          theme: theme,
          darkMode: darkMode
        })
      ),
      
      // Footer
      step === 'result' && analysis && React.createElement(MeetingResultFooter, {
        selectedItems: selectedItems,
        addToGoogleCalendar: addToGoogleCalendar,
        setAddToGoogleCalendar: setAddToGoogleCalendar,
        isGoogleSignedIn: isGoogleSignedIn,
        isGoogleLoading: isGoogleLoading,
        googleUser: googleUser,
        googleSignIn: googleSignIn,
        isAddingToGoogle: isAddingToGoogle,
        onAddSelectedItems: addSelectedItems,
        onClose: onClose,
        theme: theme,
        darkMode: darkMode
      })
    )
  );
};

export default MeetingUploader;
