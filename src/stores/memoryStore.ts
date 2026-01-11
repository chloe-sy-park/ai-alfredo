import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// 🧠 알프레도 기억 시스템 (Nomi AI 스타일)
// 단기/중기/장기 계층화된 메모리
// "지난번에 말했던 거 기억해요"
// ============================================

interface Memory {
  id: string;
  type: 'fact' | 'preference' | 'pattern' | 'event' | 'emotion';
  content: string;
  context?: string;
  importance: 1 | 2 | 3; // 1: 낮음, 2: 중간, 3: 높음
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
  source: 'conversation' | 'behavior' | 'explicit' | 'inferred';
  tags: string[];
}

interface Conversation {
  id: string;
  messages: Array<{
    role: 'user' | 'alfredo';
    content: string;
    timestamp: string;
  }>;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoryState {
  // 단기 기억 (현재 세션)
  shortTermMemory: Memory[];
  
  // 중기 기억 (최근 1주일)
  mediumTermMemory: Memory[];
  
  // 장기 기억 (영구 저장)
  longTermMemory: Memory[];
  
  // 대화 기록
  conversations: Conversation[];
  currentConversation?: Conversation;
  
  // 사용자에 대해 알고 있는 것들 (명시적)
  userFacts: Array<{
    key: string;
    value: string;
    source: string;
    updatedAt: string;
  }>;
  
  // 액션
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount'>) => void;
  accessMemory: (id: string) => void;
  
  // 대화 관리
  startConversation: () => void;
  addMessage: (role: 'user' | 'alfredo', content: string) => void;
  endConversation: (summary?: string) => void;
  
  // 사용자 정보 관리
  setUserFact: (key: string, value: string, source?: string) => void;
  getUserFact: (key: string) => string | undefined;
  
  // 검색
  searchMemories: (query: string, type?: Memory['type']) => Memory[];
  getRecentMemories: (count?: number) => Memory[];
  getImportantMemories: () => Memory[];
  
  // 맥락 기반 리콜
  recallRelatedMemories: (context: string) => Memory[];
  
  // 정리
  consolidateMemories: () => void; // 단기 → 중기 → 장기 이동
  forgetOldMemories: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      shortTermMemory: [],
      mediumTermMemory: [],
      longTermMemory: [],
      conversations: [],
      currentConversation: undefined,
      userFacts: [],

      addMemory: (memoryData) => {
        const now = new Date().toISOString();
        const memory: Memory = {
          ...memoryData,
          id: generateId(),
          createdAt: now,
          lastAccessedAt: now,
          accessCount: 1,
        };
        
        set(state => ({
          shortTermMemory: [...state.shortTermMemory, memory],
        }));
      },

      accessMemory: (id) => {
        const now = new Date().toISOString();
        set(state => {
          const updateMemory = (memories: Memory[]) =>
            memories.map(m => 
              m.id === id 
                ? { ...m, lastAccessedAt: now, accessCount: m.accessCount + 1 }
                : m
            );
          
          return {
            shortTermMemory: updateMemory(state.shortTermMemory),
            mediumTermMemory: updateMemory(state.mediumTermMemory),
            longTermMemory: updateMemory(state.longTermMemory),
          };
        });
      },

      startConversation: () => {
        const now = new Date().toISOString();
        const conversation: Conversation = {
          id: generateId(),
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        
        set({ currentConversation: conversation });
      },

      addMessage: (role, content) => {
        const now = new Date().toISOString();
        set(state => {
          if (!state.currentConversation) {
            // 대화가 없으면 새로 시작
            const conversation: Conversation = {
              id: generateId(),
              messages: [{ role, content, timestamp: now }],
              createdAt: now,
              updatedAt: now,
            };
            return { currentConversation: conversation };
          }
          
          return {
            currentConversation: {
              ...state.currentConversation,
              messages: [
                ...state.currentConversation.messages,
                { role, content, timestamp: now }
              ],
              updatedAt: now,
            },
          };
        });
      },

      endConversation: (summary) => {
        set(state => {
          if (!state.currentConversation) return {};
          
          const finishedConversation = {
            ...state.currentConversation,
            summary,
          };
          
          return {
            conversations: [...state.conversations.slice(-50), finishedConversation],
            currentConversation: undefined,
          };
        });
      },

      setUserFact: (key, value, source = 'explicit') => {
        const now = new Date().toISOString();
        set(state => {
          const existing = state.userFacts.findIndex(f => f.key === key);
          const newFacts = [...state.userFacts];
          
          if (existing >= 0) {
            newFacts[existing] = { key, value, source, updatedAt: now };
          } else {
            newFacts.push({ key, value, source, updatedAt: now });
          }
          
          return { userFacts: newFacts };
        });
      },

      getUserFact: (key) => {
        return get().userFacts.find(f => f.key === key)?.value;
      },

      searchMemories: (query, type) => {
        const allMemories = [
          ...get().shortTermMemory,
          ...get().mediumTermMemory,
          ...get().longTermMemory,
        ];
        
        const queryLower = query.toLowerCase();
        return allMemories.filter(m => 
          (m.content.toLowerCase().includes(queryLower) ||
           m.tags.some(t => t.toLowerCase().includes(queryLower))) &&
          (!type || m.type === type)
        );
      },

      getRecentMemories: (count = 10) => {
        const allMemories = [
          ...get().shortTermMemory,
          ...get().mediumTermMemory,
        ];
        
        return allMemories
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, count);
      },

      getImportantMemories: () => {
        const allMemories = [
          ...get().shortTermMemory,
          ...get().mediumTermMemory,
          ...get().longTermMemory,
        ];
        
        return allMemories
          .filter(m => m.importance === 3 || m.accessCount >= 5)
          .sort((a, b) => b.accessCount - a.accessCount);
      },

      recallRelatedMemories: (context) => {
        const contextWords = context.toLowerCase().split(/\s+/);
        const allMemories = [
          ...get().shortTermMemory,
          ...get().mediumTermMemory,
          ...get().longTermMemory,
        ];
        
        return allMemories
          .filter(m => {
            const memoryWords = m.content.toLowerCase().split(/\s+/);
            const tagMatches = m.tags.some(t => 
              contextWords.some(w => t.toLowerCase().includes(w))
            );
            const contentMatches = contextWords.some(w => 
              memoryWords.some(mw => mw.includes(w))
            );
            return tagMatches || contentMatches;
          })
          .slice(0, 5);
      },

      consolidateMemories: () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        set(state => {
          // 단기 → 중기 (1일 이상 지난 것)
          const shortTerm: Memory[] = [];
          const toMedium: Memory[] = [];
          
          state.shortTermMemory.forEach(m => {
            const created = new Date(m.createdAt);
            if (created < oneDayAgo) {
              toMedium.push(m);
            } else {
              shortTerm.push(m);
            }
          });
          
          // 중기 → 장기 (1주 이상 지났고 중요한 것만)
          const mediumTerm: Memory[] = [];
          const toLong: Memory[] = [];
          
          [...state.mediumTermMemory, ...toMedium].forEach(m => {
            const created = new Date(m.createdAt);
            if (created < oneWeekAgo && (m.importance >= 2 || m.accessCount >= 3)) {
              toLong.push(m);
            } else if (created >= oneWeekAgo) {
              mediumTerm.push(m);
            }
            // 중요도 낮고 오래된 건 버림
          });
          
          return {
            shortTermMemory: shortTerm,
            mediumTermMemory: mediumTerm,
            longTermMemory: [...state.longTermMemory, ...toLong].slice(-100), // 최대 100개
          };
        });
      },

      forgetOldMemories: () => {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        
        set(state => ({
          longTermMemory: state.longTermMemory.filter(m => 
            m.importance === 3 || 
            m.accessCount >= 5 || 
            new Date(m.lastAccessedAt) > threeMonthsAgo
          ),
        }));
      },
    }),
    {
      name: 'alfredo-memory-store',
    }
  )
);

export default useMemoryStore;
