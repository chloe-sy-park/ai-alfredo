/**
 * Email Signal Store
 *
 * Zustand store for email signals
 * Today에 표시할 이메일 신호 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  EmailMetadata,
  EmailSignal,
  EmailType,
  SenderWeight,
  DEFAULT_FILTER_CONFIG
} from './types';
import { db } from '../../lib/db';
import { applyThreeTierFilter, filterForToday, FilterContext } from './emailFilterService';
import { classifyEmails, generateHeadline, applySilentCorrection, ClassificationContext } from './emailTypeClassifier';

// ============================================================
// State Types
// ============================================================

interface EmailSignalState {
  // 상태
  signals: EmailSignal[];
  allMetadata: EmailMetadata[];
  senderWeights: Map<string, SenderWeight>;
  isLoading: boolean;
  lastFetchedAt: string | null;
  error: string | null;

  // 액션
  fetchEmailSignals: () => Promise<void>;
  refreshSignals: () => Promise<void>;
  applySilentCorrection: (emailId: string, isWork: boolean) => Promise<void>;
  getSignalsForToday: () => EmailSignal[];
  clearError: () => void;
}

// ============================================================
// Store
// ============================================================

export const useEmailSignalStore = create<EmailSignalState>()(
  persist(
    (set, get) => ({
      // Initial state
      signals: [],
      allMetadata: [],
      senderWeights: new Map(),
      isLoading: false,
      lastFetchedAt: null,
      error: null,

      /**
       * 이메일 신호 가져오기
       */
      fetchEmailSignals: async () => {
        set({ isLoading: true, error: null });

        try {
          // 1. Gmail 서비스에서 이메일 메타데이터 가져오기
          const { fetchEmails } = await import('../gmail/gmailService');
          const emailResponse = await fetchEmails({
            maxResults: 50,
            query: `newer_than:${DEFAULT_FILTER_CONFIG.timeWindowHours}h`
          });

          if (!emailResponse || !emailResponse.emails) {
            set({ isLoading: false });
            return;
          }

          // 2. 캘린더 이벤트 가져오기
          const todayCalendarEvents = await db.calendar
            .where('startTime')
            .above(new Date().toISOString().split('T')[0])
            .toArray();

          // 3. 저장된 발신자 가중치 가져오기
          const storedWeights = await db.senderWeights.toArray();
          const senderWeightsMap = new Map<string, SenderWeight>();
          storedWeights.forEach(w => senderWeightsMap.set(w.sender.toLowerCase(), w));

          // 4. 이메일 메타데이터 변환
          const emailMetadata: EmailMetadata[] = emailResponse.emails.map(email => ({
            id: email.id,
            threadId: email.id,  // API에서 threadId 제공 시 사용
            from: email.from,
            fromDomain: extractDomain(email.from),
            subject: email.subject,
            receivedAt: email.date,
            isUnread: true,  // API에서 unread 상태 제공 시 사용
            hasAttachment: false,  // API에서 첨부파일 정보 제공 시 사용
            labels: [],
            threadCount: 1,
            emailType: 'C' as EmailType,  // 분류 전 기본값
            workLifeScore: { work: 0.5, life: 0.5 }
          }));

          // 5. 3-tier 필터 적용
          const filterContext: FilterContext = {
            todayCalendarEvents,
            allRecentEmails: emailMetadata
          };
          const filteredEmails = applyThreeTierFilter(emailMetadata, filterContext);

          // 6. 이메일 타입 분류
          const classificationContext: ClassificationContext = {
            calendarParticipants: [],  // 캘린더 이벤트에서 참석자 추출
            todayMeetingTitles: todayCalendarEvents.map(e => e.title),
            senderWeights: senderWeightsMap
          };
          const classifiedEmails = classifyEmails(filteredEmails, classificationContext);

          // 7. Today용 필터 (Type A/B만)
          const todayEmails = filterForToday(classifiedEmails);

          // 8. EmailSignal 생성
          const signals: EmailSignal[] = todayEmails.map(email => ({
            id: `signal_${email.id}`,
            emailId: email.id,
            type: email.emailType,
            headline: generateHeadline(email),
            sender: email.from,
            senderName: email.fromName,
            subject: email.subject,
            receivedAt: email.receivedAt,
            relatedMeetingId: email.relatedMeetingId,
            deepLink: createGmailDeepLink(email.id),
            createdAt: new Date().toISOString()
          }));

          // 9. IndexedDB에 저장
          for (const signal of signals) {
            await db.emailSignals.put({
              ...signal,
              senderDomain: extractDomain(signal.sender),
              isUnread: true,
              hasAttachment: false,
              attachmentTypes: [],
              labels: [],
              threadCount: 1,
              emailType: signal.type,
              workScore: 0.5,
              lifeScore: 0.5
            });
          }

          set({
            signals,
            allMetadata: classifiedEmails,
            senderWeights: senderWeightsMap,
            isLoading: false,
            lastFetchedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to fetch email signals:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch emails'
          });
        }
      },

      /**
       * 신호 새로고침
       */
      refreshSignals: async () => {
        await get().fetchEmailSignals();
      },

      /**
       * Silent Correction 적용
       */
      applySilentCorrection: async (emailId: string, isWork: boolean) => {
        const { allMetadata, senderWeights } = get();

        // 해당 이메일 찾기
        const email = allMetadata.find(e => e.id === emailId);
        if (!email) return;

        const senderKey = email.from.toLowerCase();
        const currentWeight = senderWeights.get(senderKey);

        // 새 가중치 계산
        const newWeight = applySilentCorrection(currentWeight, isWork);
        newWeight.sender = email.from;
        newWeight.domain = email.fromDomain;

        // IndexedDB에 저장
        await db.senderWeights.put(newWeight);

        // 상태 업데이트
        const newWeightsMap = new Map(senderWeights);
        newWeightsMap.set(senderKey, newWeight);

        set({ senderWeights: newWeightsMap });

        // 신호 새로고침 (재분류)
        await get().refreshSignals();
      },

      /**
       * Today에 표시할 신호 가져오기
       */
      getSignalsForToday: () => {
        const { signals } = get();
        // Type A/B만 반환 (최대 3개)
        return signals
          .filter(s => s.type === 'A' || s.type === 'B')
          .slice(0, 3);
      },

      /**
       * 에러 초기화
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'email-signal-store',
      partialize: (state) => ({
        lastFetchedAt: state.lastFetchedAt
      })
    }
  )
);

// ============================================================
// Helpers
// ============================================================

function extractDomain(email: string): string {
  const match = email.match(/@([^>]+)/);
  return match ? match[1].toLowerCase() : '';
}

function createGmailDeepLink(emailId: string): string {
  // Gmail 웹 딥링크
  return `https://mail.google.com/mail/u/0/#inbox/${emailId}`;
}

// ============================================================
// Exports
// ============================================================

export default useEmailSignalStore;
