// useGmail.js - Gmail 연동 훅 (AI 분석 포함)
import { useState, useCallback, useEffect, useRef } from 'react';
import { useGoogleCalendar } from './useGoogleCalendar';

// localStorage 키
const STORAGE_KEYS = {
  EMAILS: 'lifebutler_gmail_emails',
  ACTIONS: 'lifebutler_gmail_actions',
  LAST_FETCH: 'lifebutler_gmail_last_fetch',
  SETTINGS: 'lifebutler_gmail_settings',
  VIP_SENDERS: 'lifebutler_gmail_vip_senders',
};

// 기본 이메일 설정
const DEFAULT_SETTINGS = {
  fetchPeriod: 3,           // 1, 3, 7일
  maxEmails: 20,            // 10, 20, 50
  autoSyncMinutes: 30,      // 15, 30, 60, 0(수동)
  enabled: true,            // Gmail 연동 활성화
  // 필터 옵션 - 기본값을 'all'로 변경 (테스트용)
  priorityFilter: 'all',    // 'smart' | 'important' | 'all'
  // smart: 중요 + 별표 + VIP 발신자
  // important: Gmail 중요 표시만
  // all: 전체 (기간 내)
};

export function useGmail() {
  const { isConnected, getAccessToken, connect, disconnect } = useGoogleCalendar();
  
  const [emails, setEmails] = useState([]);
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [vipSenders, setVipSenders] = useState([]);
  
  const autoSyncRef = useRef(null);

  // 초기화 - localStorage에서 복원
  useEffect(() => {
    try {
      const storedEmails = localStorage.getItem(STORAGE_KEYS.EMAILS);
      const storedActions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      const storedLastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedVipSenders = localStorage.getItem(STORAGE_KEYS.VIP_SENDERS);
      
      if (storedEmails) setEmails(JSON.parse(storedEmails));
      if (storedActions) setActions(JSON.parse(storedActions));
      if (storedLastFetch) setLastFetch(new Date(storedLastFetch));
      if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      if (storedVipSenders) setVipSenders(JSON.parse(storedVipSenders));
    } catch (e) {
      console.warn('Failed to restore Gmail data');
    }
  }, []);

  // 설정 변경
  const updateSettings = useCallback((newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }, [settings]);

  // VIP 발신자 추가
  const addVipSender = useCallback((email) => {
    const updated = [...new Set([...vipSenders, email.toLowerCase()])];
    setVipSenders(updated);
    localStorage.setItem(STORAGE_KEYS.VIP_SENDERS, JSON.stringify(updated));
  }, [vipSenders]);

  // VIP 발신자 제거
  const removeVipSender = useCallback((email) => {
    const updated = vipSenders.filter(e => e !== email.toLowerCase());
    setVipSenders(updated);
    localStorage.setItem(STORAGE_KEYS.VIP_SENDERS, JSON.stringify(updated));
  }, [vipSenders]);

  // 쿼리 빌드 (설정 기반)
  const buildQuery = useCallback((options = {}) => {
    const period = options.fetchPeriod || settings.fetchPeriod;
    const filter = options.priorityFilter || settings.priorityFilter;
    
    const parts = [];
    
    // 기간 설정
    parts.push(`newer_than:${period}d`);
    
    // 프로모션/소셜 제외 (항상)
    parts.push('-category:promotions');
    parts.push('-category:social');
    
    // 필터 설정
    if (filter === 'important') {
      parts.push('is:important');
    } else if (filter === 'smart') {
      const smartParts = ['is:important', 'is:starred'];
      vipSenders.forEach(sender => {
        smartParts.push(`from:${sender}`);
      });
      if (smartParts.length > 0) {
        parts.push(`(${smartParts.join(' OR ')})`);
      }
    }
    // 'all'은 추가 필터 없음
    
    const query = parts.join(' ');
    console.log('📧 Gmail query:', query);
    return query;
  }, [settings, vipSenders]);

  // 강제 재연결 (scope 변경 시)
  const forceReconnect = useCallback(async () => {
    console.log('🔄 Gmail: Force reconnecting...');
    
    if (disconnect) {
      disconnect();
    }
    
    setNeedsReauth(false);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (connect) {
      await connect();
      return true;
    }
    return false;
  }, [disconnect, connect]);

  // 이메일 목록 가져오기
  const fetchEmails = useCallback(async (options = {}) => {
    console.log('📧 Gmail fetchEmails 시작');
    console.log('📧 isConnected:', isConnected);
    console.log('📧 settings.enabled:', settings.enabled);
    
    const token = getAccessToken();
    console.log('📧 token exists:', !!token);
    
    if (!token) {
      console.error('📧 토큰 없음!');
      setError('Google에 연결되어 있지 않습니다');
      return [];
    }

    if (!settings.enabled) {
      console.log('📧 Gmail 비활성화 상태');
      return emails;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = buildQuery(options);
      const maxResults = options.maxEmails || settings.maxEmails;
      
      console.log('📧 API 호출 시작 - maxResults:', maxResults);

      // 이메일 ID 목록 가져오기
      const listResponse = await fetch('/api/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list',
          maxResults,
          query,
          labelIds: ['INBOX'],
        }),
      });

      console.log('📧 API 응답 status:', listResponse.status);

      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        console.error('📧 API 에러:', errorText);
        
        if (listResponse.status === 401 || listResponse.status === 403) {
          console.warn('🔐 Gmail: Auth error, needs reauth');
          setNeedsReauth(true);
          throw new Error('Gmail 권한이 필요합니다. Google 재연결이 필요해요.');
        }
        throw new Error('이메일 목록을 가져오는데 실패했습니다');
      }

      setNeedsReauth(false);

      const listData = await listResponse.json();
      console.log('📧 이메일 목록 응답:', listData);
      
      const messageIds = (listData.emails || []).map(m => m.id);
      console.log('📧 가져온 이메일 수:', messageIds.length);

      if (messageIds.length === 0) {
        console.log('📧 이메일 없음');
        setEmails([]);
        localStorage.setItem(STORAGE_KEYS.EMAILS, '[]');
        setLastFetch(new Date());
        localStorage.setItem(STORAGE_KEYS.LAST_FETCH, new Date().toISOString());
        return [];
      }

      // 이메일 상세 가져오기
      console.log('📧 상세 정보 가져오기...');
      const detailResponse = await fetch('/api/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'getBatch',
          messageIds,
        }),
      });

      if (!detailResponse.ok) {
        if (detailResponse.status === 401 || detailResponse.status === 403) {
          setNeedsReauth(true);
          throw new Error('Gmail 권한이 필요합니다. Google 재연결이 필요해요.');
        }
        throw new Error('이메일 상세를 가져오는데 실패했습니다');
      }

      const detailData = await detailResponse.json();
      const fetchedEmails = detailData.emails || [];
      console.log('📧 상세 정보 가져옴:', fetchedEmails.length, '개');

      setEmails(fetchedEmails);
      localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(fetchedEmails));
      
      const now = new Date();
      setLastFetch(now);
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, now.toISOString());

      console.log('📧 fetchEmails 완료!');
      return fetchedEmails;
    } catch (err) {
      console.error('📧 Fetch emails error:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, settings, buildQuery, emails, isConnected]);

  // AI로 이메일 분석하여 액션 추출
  const analyzeEmails = useCallback(async (emailsToAnalyze = null) => {
    const targetEmails = emailsToAnalyze || emails;
    
    console.log('📧 analyzeEmails 시작 - 이메일 수:', targetEmails.length);
    
    if (targetEmails.length === 0) {
      console.log('📧 분석할 이메일 없음');
      return [];
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const emailSummaries = targetEmails.slice(0, 15).map(email => ({
        id: email.id,
        from: email.from?.name || email.from?.email || 'Unknown',
        fromEmail: email.from?.email || '',
        subject: email.subject,
        snippet: email.snippet?.slice(0, 200),
        date: email.date,
        isUnread: email.isUnread,
        isImportant: email.isImportant,
        isStarred: email.isStarred,
        category: email.category,
      }));

      console.log('📧 AI 분석 요청...');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `당신은 Life Butler 앱의 AI 비서 알프레도입니다.
아래 이메일 목록을 분석하고, 사용자가 해야 할 액션을 JSON 배열로 추출해주세요.

**가장 중요**: 답장이 필요한 이메일을 우선적으로 식별하세요!

분석 기준:
1. 긴급도 (priority): urgent(빨강), high(노랑), medium(초록), low(회색)
   - urgent: 오늘 내 답장 필요, ASAP, 마감 임박
   - high: 상사/클라이언트, 회의 요청, 결제/송금, 질문에 답변 필요
   - medium: 일반 업무, 정보 요청, 팔로업 필요
   - low: 뉴스레터, 알림, 프로모션, 참고용

2. 액션 유형 (actionType): reply, schedule, task, review, archive, ignore
   - reply: **답장 필요** (질문, 요청, 확인 필요 등)
   - schedule: 일정 잡기/회의 조율
   - task: 태스크로 변환 (문서 작성, 리뷰 등)
   - review: 검토/확인 필요
   - archive: 읽기만 하면 됨
   - ignore: 무시해도 됨 (스팸, 불필요)

3. 추천 액션 (suggestedAction): 구체적으로 어떤 행동을 해야 하는지 (한국어)

이메일 목록:
${JSON.stringify(emailSummaries, null, 2)}

응답 형식 (JSON 배열만 출력):
[
  {
    "emailId": "이메일ID",
    "priority": "urgent|high|medium|low",
    "actionType": "reply|schedule|task|review|archive|ignore",
    "suggestedAction": "구체적인 액션 설명 (한국어)",
    "dueDate": "마감일 (있으면 YYYY-MM-DD, 없으면 null)",
    "taskTitle": "태스크로 만들 경우 제목"
  }
]`
            }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('AI 분석에 실패했습니다');
      }

      const data = await response.json();
      let analysisResult = [];

      try {
        const content = data.reply || data.content || '';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      const enrichedActions = analysisResult.map(action => {
        const email = targetEmails.find(e => e.id === action.emailId);
        return {
          ...action,
          email: email ? {
            id: email.id,
            from: email.from,
            subject: email.subject,
            snippet: email.snippet,
            date: email.date,
            isUnread: email.isUnread,
            isImportant: email.isImportant,
          } : null,
          createdAt: new Date().toISOString(),
        };
      }).filter(a => a.email && a.actionType !== 'ignore');

      console.log('📧 AI 분석 완료 - 액션 수:', enrichedActions.length);
      
      setActions(enrichedActions);
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(enrichedActions));

      return enrichedActions;
    } catch (err) {
      console.error('📧 Analyze emails error:', err);
      setError(err.message);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [emails]);

  // 이메일 가져오기 + 분석 한번에
  const fetchAndAnalyze = useCallback(async (options = {}) => {
    console.log('📧 fetchAndAnalyze 시작');
    const fetchedEmails = await fetchEmails(options);
    if (fetchedEmails.length > 0) {
      await analyzeEmails(fetchedEmails);
    }
    return fetchedEmails;
  }, [fetchEmails, analyzeEmails]);

  // 자동 동기화 설정
  useEffect(() => {
    if (autoSyncRef.current) {
      clearInterval(autoSyncRef.current);
      autoSyncRef.current = null;
    }

    if (isConnected && settings.enabled && settings.autoSyncMinutes > 0) {
      autoSyncRef.current = setInterval(() => {
        fetchAndAnalyze();
      }, settings.autoSyncMinutes * 60 * 1000);
    }

    return () => {
      if (autoSyncRef.current) {
        clearInterval(autoSyncRef.current);
      }
    };
  }, [isConnected, settings.enabled, settings.autoSyncMinutes, fetchAndAnalyze]);

  // 읽음 표시
  const markAsRead = useCallback(async (messageId) => {
    const token = getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'markAsRead',
          messageId,
        }),
      });

      if (response.ok) {
        setEmails(prev => prev.map(e => 
          e.id === messageId ? { ...e, isUnread: false } : e
        ));
        return true;
      }
      
      if (response.status === 401 || response.status === 403) {
        setNeedsReauth(true);
      }
      return false;
    } catch (err) {
      console.error('Mark as read error:', err);
      return false;
    }
  }, [getAccessToken]);

  // 액션 완료 처리
  const completeAction = useCallback((actionId) => {
    setActions(prev => {
      const updated = prev.filter(a => a.emailId !== actionId);
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 액션을 태스크로 변환
  const convertToTask = useCallback((action) => {
    return {
      id: `email-${action.emailId}-${Date.now()}`,
      title: action.taskTitle || action.suggestedAction,
      description: `📧 ${action.email?.from?.name || action.email?.from?.email}: ${action.email?.subject}`,
      priority: action.priority === 'urgent' ? 'high' : 
                action.priority === 'high' ? 'medium' : 'low',
      dueDate: action.dueDate || null,
      completed: false,
      source: 'gmail',
      sourceId: action.emailId,
      createdAt: new Date().toISOString(),
    };
  }, []);

  // Gmail 활성화/비활성화
  const toggleGmail = useCallback((enabled) => {
    console.log('📧 toggleGmail:', enabled);
    updateSettings({ enabled });
    if (!enabled) {
      setEmails([]);
      setActions([]);
      localStorage.removeItem(STORAGE_KEYS.EMAILS);
      localStorage.removeItem(STORAGE_KEYS.ACTIONS);
    }
  }, [updateSettings]);

  // Gmail 연결 (Google 로그인 트리거)
  const connectGmail = useCallback(async () => {
    console.log('📧 connectGmail 시작 - isConnected:', isConnected);
    if (!isConnected) {
      if (connect) {
        await connect();
      }
      return false;
    }
    toggleGmail(true);
    await fetchAndAnalyze();
    return true;
  }, [isConnected, connect, toggleGmail, fetchAndAnalyze]);

  // === 브리핑용 통계 ===
  
  const replyActions = actions.filter(a => a.actionType === 'reply');
  const urgentReplyActions = replyActions.filter(a => 
    a.priority === 'urgent' || a.priority === 'high'
  );

  const stats = {
    total: emails.length,
    unread: emails.filter(e => e.isUnread).length,
    urgent: actions.filter(a => a.priority === 'urgent').length,
    needsAction: actions.filter(a => ['reply', 'schedule', 'task'].includes(a.actionType)).length,
    needsReply: replyActions.length,
    urgentReply: urgentReplyActions.length,
  };

  const getLastSyncText = useCallback(() => {
    if (!lastFetch) return '동기화 안됨';
    
    const now = new Date();
    const diff = Math.floor((now - lastFetch) / 1000 / 60);
    
    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  }, [lastFetch]);

  const getBriefingMessage = useCallback(() => {
    if (!settings.enabled || !isConnected) return null;
    if (needsReauth) return '📧 Gmail 재연결 필요';
    if (replyActions.length === 0) return null;
    
    if (urgentReplyActions.length > 0) {
      return `📧 긴급 답장 필요 ${urgentReplyActions.length}개`;
    }
    return `📧 답장 필요 ${replyActions.length}개`;
  }, [settings.enabled, isConnected, needsReauth, replyActions, urgentReplyActions]);

  return {
    // 상태
    isConnected,
    isGmailEnabled: settings.enabled,
    emails,
    actions,
    replyActions,
    urgentReplyActions,
    isLoading,
    isAnalyzing,
    error,
    needsReauth,
    lastFetch,
    stats,
    settings,
    vipSenders,
    
    // 액션
    fetchEmails,
    analyzeEmails,
    fetchAndAnalyze,
    markAsRead,
    completeAction,
    convertToTask,
    toggleGmail,
    connectGmail,
    forceReconnect,
    updateSettings,
    addVipSender,
    removeVipSender,
    getLastSyncText,
    getBriefingMessage,
  };
}

export default useGmail;
