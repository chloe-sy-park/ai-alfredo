// useGmail.js - Gmail 연동 훅 (AI 분석 포함)
import { useState, useCallback, useEffect } from 'react';
import { useGoogleCalendar } from './useGoogleCalendar';

// localStorage 키
const STORAGE_KEYS = {
  EMAILS: 'lifebutler_gmail_emails',
  ACTIONS: 'lifebutler_gmail_actions',
  LAST_FETCH: 'lifebutler_gmail_last_fetch',
};

export function useGmail() {
  const { isConnected, getAccessToken } = useGoogleCalendar();
  
  const [emails, setEmails] = useState([]);
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // 초기화 - localStorage에서 복원
  useEffect(() => {
    try {
      const storedEmails = localStorage.getItem(STORAGE_KEYS.EMAILS);
      const storedActions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      const storedLastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
      
      if (storedEmails) setEmails(JSON.parse(storedEmails));
      if (storedActions) setActions(JSON.parse(storedActions));
      if (storedLastFetch) setLastFetch(new Date(storedLastFetch));
    } catch (e) {
      console.warn('Failed to restore Gmail data');
    }
  }, []);

  // 이메일 목록 가져오기
  const fetchEmails = useCallback(async (options = {}) => {
    const token = getAccessToken();
    if (!token) {
      setError('Google에 연결되어 있지 않습니다');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // 이메일 ID 목록 가져오기
      const listResponse = await fetch('/api/gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list',
          maxResults: options.maxResults || 20,
          query: options.query || 'is:unread OR newer_than:3d',
          labelIds: options.labelIds || ['INBOX'],
        }),
      });

      if (!listResponse.ok) {
        throw new Error('이메일 목록을 가져오는데 실패했습니다');
      }

      const listData = await listResponse.json();
      const messageIds = (listData.emails || []).map(m => m.id);

      if (messageIds.length === 0) {
        setEmails([]);
        localStorage.setItem(STORAGE_KEYS.EMAILS, '[]');
        return [];
      }

      // 이메일 상세 가져오기
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
        throw new Error('이메일 상세를 가져오는데 실패했습니다');
      }

      const detailData = await detailResponse.json();
      const fetchedEmails = detailData.emails || [];

      setEmails(fetchedEmails);
      localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(fetchedEmails));
      
      const now = new Date();
      setLastFetch(now);
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, now.toISOString());

      return fetchedEmails;
    } catch (err) {
      console.error('Fetch emails error:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  // AI로 이메일 분석하여 액션 추출
  const analyzeEmails = useCallback(async (emailsToAnalyze = null) => {
    const targetEmails = emailsToAnalyze || emails;
    
    if (targetEmails.length === 0) {
      return [];
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 이메일 요약 생성 (API 토큰 절약)
      const emailSummaries = targetEmails.slice(0, 15).map(email => ({
        id: email.id,
        from: email.from?.name || email.from?.email || 'Unknown',
        fromEmail: email.from?.email || '',
        subject: email.subject,
        snippet: email.snippet?.slice(0, 200),
        date: email.date,
        isUnread: email.isUnread,
        isImportant: email.isImportant,
        category: email.category,
      }));

      // Claude API 호출
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

분석 기준:
1. 긴급도 (priority): urgent(빨강), high(노랑), medium(초록), low(회색)
   - urgent: 오늘 내, ASAP, 마감 임박, 긴급 요청
   - high: 상사/클라이언트, 회의 요청, 결제/송금, 중요 결정
   - medium: 일반 업무, 정보 요청, 팔로업 필요
   - low: 뉴스레터, 알림, 프로모션, 참고용

2. 액션 유형 (actionType): reply, schedule, task, review, archive, ignore
   - reply: 답장 필요
   - schedule: 일정 잡기/회의 조율
   - task: 태스크로 변환 (문서 작성, 리뷰 등)
   - review: 검토/확인 필요
   - archive: 읽기만 하면 됨
   - ignore: 무시해도 됨

3. 추천 액션 (suggestedAction): 구체적으로 어떤 행동을 해야 하는지

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

      // JSON 추출 시도
      try {
        const content = data.reply || data.content || '';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      // 이메일 정보와 합치기
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
          } : null,
          createdAt: new Date().toISOString(),
        };
      }).filter(a => a.email && a.actionType !== 'ignore');

      setActions(enrichedActions);
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(enrichedActions));

      return enrichedActions;
    } catch (err) {
      console.error('Analyze emails error:', err);
      setError(err.message);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [emails]);

  // 이메일 가져오기 + 분석 한번에
  const fetchAndAnalyze = useCallback(async (options = {}) => {
    const fetchedEmails = await fetchEmails(options);
    if (fetchedEmails.length > 0) {
      await analyzeEmails(fetchedEmails);
    }
    return fetchedEmails;
  }, [fetchEmails, analyzeEmails]);

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
        // 로컬 상태 업데이트
        setEmails(prev => prev.map(e => 
          e.id === messageId ? { ...e, isUnread: false } : e
        ));
        return true;
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

  // 통계
  const stats = {
    total: emails.length,
    unread: emails.filter(e => e.isUnread).length,
    urgent: actions.filter(a => a.priority === 'urgent').length,
    needsAction: actions.filter(a => ['reply', 'schedule', 'task'].includes(a.actionType)).length,
  };

  return {
    // 상태
    isConnected,
    emails,
    actions,
    isLoading,
    isAnalyzing,
    error,
    lastFetch,
    stats,
    
    // 액션
    fetchEmails,
    analyzeEmails,
    fetchAndAnalyze,
    markAsRead,
    completeAction,
    convertToTask,
  };
}

export default useGmail;
