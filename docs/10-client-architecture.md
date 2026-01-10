# 10. 클라이언트 아키텍처

> React + Vite + PWA + IndexedDB

---

## 🏗️ 프로젝트 구조

```
src/
├── components/
│   ├── common/              # 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   │
│   ├── layout/              # 레이아웃
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── FloatingNudge.tsx
│   │
│   ├── home/                # 홈 페이지
│   │   ├── AlfredoBriefing.tsx
│   │   ├── WeatherWidget.tsx
│   │   ├── ConditionQuickChange.tsx
│   │   ├── Top3Tasks.tsx
│   │   ├── FocusNow.tsx
│   │   ├── RememberThis.tsx
│   │   └── TodayTimeline.tsx
│   │
│   ├── work/                # Work 페이지
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskEditor.tsx
│   │   └── MeetingList.tsx
│   │
│   ├── life/                # Life 페이지
│   │   ├── HabitTracker.tsx
│   │   ├── HabitCard.tsx
│   │   ├── WellnessCheck.tsx
│   │   └── EnergyRhythm.tsx
│   │
│   ├── chat/                # 채팅
│   │   ├── ChatContainer.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── StreamingMessage.tsx
│   │
│   ├── focus/               # 집중 모드
│   │   ├── FocusTimer.tsx
│   │   ├── BodyDoubling.tsx
│   │   └── FocusComplete.tsx
│   │
│   ├── settings/            # 설정
│   │   ├── SettingsPage.tsx
│   │   ├── ToneCustomizer.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── PrivacySettings.tsx
│   │
│   └── onboarding/          # 온보딩
│       ├── OnboardingFlow.tsx
│       ├── WelcomeStep.tsx
│       ├── GoalStep.tsx
│       ├── CalendarConnect.tsx
│       └── ToneSetup.tsx
│
├── hooks/                   # 커스텀 훅
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useHabits.ts
│   ├── useCalendar.ts
│   ├── useChat.ts
│   ├── useBriefing.ts
│   ├── useOffline.ts
│   ├── useEncryption.ts
│   └── usePushNotification.ts
│
├── stores/                  # 상태 관리 (Zustand)
│   ├── authStore.ts
│   ├── taskStore.ts
│   ├── habitStore.ts
│   ├── calendarStore.ts
│   ├── settingsStore.ts
│   ├── chatStore.ts
│   └── offlineStore.ts
│
├── lib/                     # 유틸리티
│   ├── api.ts               # API 클라이언트
│   ├── db.ts                # IndexedDB
│   ├── encryption.ts        # 클라이언트 암호화
│   ├── sync.ts              # 오프라인 동기화
│   └── utils.ts             # 공통 유틸
│
├── pages/                   # 페이지 라우트
│   ├── Home.tsx
│   ├── Work.tsx
│   ├── Life.tsx
│   ├── Chat.tsx
│   ├── Focus.tsx
│   ├── Settings.tsx
│   └── Onboarding.tsx
│
├── App.tsx
├── main.tsx
├── sw.ts                    # Service Worker
└── styles/
    ├── globals.css
    └── theme.ts             # 디자인 토큰
```

---

## 💾 상태 관리 (Zustand)

### Auth Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User, token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      }),
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        // IndexedDB 클리어
        clearLocalData();
      },
      
      refreshToken: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${get().token}`
            }
          });
          
          if (response.ok) {
            const { token } = await response.json();
            set({ token });
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
    }),
    {
      name: 'alfredo-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

### Task Store

```typescript
// stores/taskStore.ts
import { create } from 'zustand';
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { encrypt, decrypt } from '@/lib/encryption';

interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'work' | 'life';
  status: 'pending' | 'completed' | 'deferred';
  priority_score: number;
  deadline?: string;
  scheduled_date?: string;
  starred: boolean;
  estimated_minutes?: number;
  defer_count: number;
  created_at: string;
  updated_at: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filter: {
    status: 'pending' | 'completed' | 'all';
    category: 'work' | 'life' | 'all';
    date?: string;
  };
  
  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deferTask: (id: string, newDate: string) => Promise<void>;
  setFilter: (filter: Partial<TaskState['filter']>) => void;
  
  // 오프라인
  syncPendingChanges: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filter: {
    status: 'pending',
    category: 'all'
  },
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // 오프라인 우선: IndexedDB에서 먼저 로드
      const cachedTasks = await db.tasks.toArray();
      if (cachedTasks.length > 0) {
        const decrypted = await Promise.all(
          cachedTasks.map(async (t) => ({
            ...t,
            ...(await decrypt(t.encrypted_data))
          }))
        );
        set({ tasks: decrypted, isLoading: false });
      }
      
      // 네트워크 상태면 API에서 최신 데이터
      if (navigator.onLine) {
        const { filter } = get();
        const response = await api.get('/api/tasks', {
          params: {
            status: filter.status !== 'all' ? filter.status : undefined,
            category: filter.category !== 'all' ? filter.category : undefined,
            scheduled: filter.date
          }
        });
        
        const tasks = response.data.tasks;
        
        // IndexedDB 업데이트
        await db.tasks.clear();
        await db.tasks.bulkPut(tasks);
        
        // 복호화
        const decrypted = await Promise.all(
          tasks.map(async (t: any) => ({
            ...t,
            ...(await decrypt(t.encrypted_data))
          }))
        );
        
        set({ tasks: decrypted, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addTask: async (taskData) => {
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    
    // 임시 태스크 생성
    const tempTask: Task = {
      id: tempId,
      title: taskData.title || '',
      category: taskData.category || 'work',
      status: 'pending',
      priority_score: 0,
      starred: taskData.starred || false,
      defer_count: 0,
      created_at: now,
      updated_at: now,
      ...taskData
    };
    
    // 냙관적 UI 업데이트
    set((state) => ({ tasks: [tempTask, ...state.tasks] }));
    
    try {
      // 암호화
      const sensitiveData = {
        title: taskData.title,
        description: taskData.description
      };
      const encrypted = await encrypt(sensitiveData);
      
      if (navigator.onLine) {
        // API 호출
        const response = await api.post('/api/tasks', {
          encrypted_data: encrypted,
          category: taskData.category,
          deadline: taskData.deadline,
          scheduled_date: taskData.scheduled_date,
          starred: taskData.starred,
          estimated_minutes: taskData.estimated_minutes
        });
        
        const serverTask = response.data.task;
        
        // IndexedDB 저장
        await db.tasks.put(serverTask);
        
        // 임시 ID를 실제 ID로 교체
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === tempId ? { ...serverTask, ...sensitiveData } : t
          )
        }));
        
        return { ...serverTask, ...sensitiveData };
      } else {
        // 오프라인: 큐에 저장
        await db.offlineQueue.add({
          action: 'create',
          table: 'tasks',
          data: { encrypted_data: encrypted, ...taskData },
          tempId,
          createdAt: now
        });
        
        await db.tasks.put({ ...tempTask, encrypted_data: encrypted });
        
        return tempTask;
      }
    } catch (error: any) {
      // 롤백
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== tempId),
        error: error.message
      }));
      throw error;
    }
  },
  
  updateTask: async (id, updates) => {
    const { tasks } = get();
    const original = tasks.find((t) => t.id === id);
    
    if (!original) return;
    
    // 냙관적 업데이트
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    }));
    
    try {
      if (navigator.onLine) {
        await api.patch(`/api/tasks/${id}`, updates);
      } else {
        await db.offlineQueue.add({
          action: 'update',
          table: 'tasks',
          id,
          data: updates,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      // 롤백
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? original : t)),
        error: error.message
      }));
    }
  },
  
  completeTask: async (id) => {
    await get().updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  },
  
  deferTask: async (id, newDate) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    
    await get().updateTask(id, {
      scheduled_date: newDate,
      defer_count: task.defer_count + 1
    });
  },
  
  deleteTask: async (id) => {
    const { tasks } = get();
    const original = tasks.find((t) => t.id === id);
    
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id)
    }));
    
    try {
      if (navigator.onLine) {
        await api.delete(`/api/tasks/${id}`);
      } else {
        await db.offlineQueue.add({
          action: 'delete',
          table: 'tasks',
          id,
          createdAt: new Date().toISOString()
        });
      }
      
      await db.tasks.delete(id);
    } catch (error: any) {
      if (original) {
        set((state) => ({
          tasks: [...state.tasks, original],
          error: error.message
        }));
      }
    }
  },
  
  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter }
    }));
    get().fetchTasks();
  },
  
  syncPendingChanges: async () => {
    const pendingChanges = await db.offlineQueue
      .where('table')
      .equals('tasks')
      .toArray();
    
    for (const change of pendingChanges) {
      try {
        switch (change.action) {
          case 'create':
            const response = await api.post('/api/tasks', change.data);
            // tempId를 실제 ID로 교체
            await db.tasks.delete(change.tempId);
            await db.tasks.put(response.data.task);
            break;
            
          case 'update':
            await api.patch(`/api/tasks/${change.id}`, change.data);
            break;
            
          case 'delete':
            await api.delete(`/api/tasks/${change.id}`);
            break;
        }
        
        await db.offlineQueue.delete(change.id);
      } catch (error) {
        console.error('Sync failed for change:', change, error);
      }
    }
  }
}));
```

### Settings Store

```typescript
// stores/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  // 톤 설정
  tone_preset: 'gentle' | 'friendly' | 'coach' | 'strict' | 'custom';
  tone_axes: {
    warmth: number;      // 1-5
    proactivity: number;
    directness: number;
    humor: number;
    pressure: number;
  };
  
  // 알림 설정
  notifications_enabled: boolean;
  morning_briefing_time: string;  // "07:30"
  evening_wrapup_time: string;    // "21:00"
  quiet_hours_start: string;      // "22:00"
  quiet_hours_end: string;        // "07:00"
  nudge_intensity: 'minimal' | 'balanced' | 'proactive';
  
  // 우선순위 설정
  priority_weights: {
    deadline_urgency: number;
    starred_boost: number;
    waiting_boost: number;
    duration_factor: number;
    defer_penalty: number;
    scheduled_boost: number;
  };
  
  // 뷰 설정
  default_view: 'integrated' | 'work' | 'life';
  
  // 프라이버시
  privacy_level: 'standard' | 'privacy_conscious' | 'deep_personalization';
  
  // Google 연동
  google_connected: boolean;
  gmail_enabled: boolean;
}

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  updateToneAxes: (axes: Partial<Settings['tone_axes']>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  tone_preset: 'friendly',
  tone_axes: {
    warmth: 4,
    proactivity: 3,
    directness: 3,
    humor: 3,
    pressure: 2
  },
  notifications_enabled: true,
  morning_briefing_time: '07:30',
  evening_wrapup_time: '21:00',
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  nudge_intensity: 'balanced',
  priority_weights: {
    deadline_urgency: 30,
    starred_boost: 25,
    waiting_boost: 15,
    duration_factor: 10,
    defer_penalty: 10,
    scheduled_boost: 10
  },
  default_view: 'integrated',
  privacy_level: 'standard',
  google_connected: false,
  gmail_enabled: false
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      
      fetchSettings: async () => {
        set({ isLoading: true });
        
        try {
          const response = await api.get('/api/settings');
          set({ settings: response.data.settings, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          set({ isLoading: false });
        }
      },
      
      updateSettings: async (updates) => {
        const { settings } = get();
        const newSettings = { ...settings, ...updates };
        
        // 냙관적 업데이트
        set({ settings: newSettings });
        
        try {
          await api.patch('/api/settings', updates);
        } catch (error) {
          // 롤백
          set({ settings });
          throw error;
        }
      },
      
      updateToneAxes: async (axes) => {
        const { settings } = get();
        const newAxes = { ...settings.tone_axes, ...axes };
        
        await get().updateSettings({
          tone_preset: 'custom',
          tone_axes: newAxes
        });
      },
      
      resetToDefaults: async () => {
        await get().updateSettings(DEFAULT_SETTINGS);
      }
    }),
    {
      name: 'alfredo-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
```

---

## 🔒 클라이언트 암호화

```typescript
// lib/encryption.ts

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// 마스터 키 생성/저장
export async function initEncryption(): Promise<CryptoKey> {
  // IndexedDB에서 기존 키 확인
  const existingKey = await db.encryption.get('master_key');
  
  if (existingKey) {
    return await crypto.subtle.importKey(
      'raw',
      existingKey.key,
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // 새 키 생성
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
  
  // 키 내보내기
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  
  // IndexedDB에 저장
  await db.encryption.put({
    id: 'master_key',
    key: new Uint8Array(exportedKey),
    created_at: new Date().toISOString()
  });
  
  return key;
}

// 암호화
export async function encrypt(data: any): Promise<string> {
  const key = await getOrCreateKey();
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedData
  );
  
  // IV + 암호화 데이터 결합
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// 복호화
export async function decrypt(encryptedData: string): Promise<any> {
  const key = await getOrCreateKey();
  
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(c => c.charCodeAt(0))
  );
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  
  return JSON.parse(new TextDecoder().decode(decrypted));
}

let cachedKey: CryptoKey | null = null;

async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await initEncryption();
  return cachedKey;
}
```

---

## 📴 오프라인 지원 (IndexedDB)

```typescript
// lib/db.ts
import Dexie, { Table } from 'dexie';

interface TaskRecord {
  id: string;
  user_id: string;
  encrypted_data: string;
  category: string;
  status: string;
  priority_score: number;
  deadline?: string;
  scheduled_date?: string;
  starred: boolean;
  estimated_minutes?: number;
  defer_count: number;
  created_at: string;
  updated_at: string;
}

interface OfflineQueueItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  table: string;
  data?: any;
  id?: string;
  tempId?: string;
  createdAt: string;
}

interface EncryptionKey {
  id: string;
  key: Uint8Array;
  created_at: string;
}

class AlfredoDB extends Dexie {
  tasks!: Table<TaskRecord>;
  habits!: Table<any>;
  calendar!: Table<any>;
  briefings!: Table<any>;
  offlineQueue!: Table<OfflineQueueItem>;
  encryption!: Table<EncryptionKey>;
  cache!: Table<any>;
  
  constructor() {
    super('AlfredoDB');
    
    this.version(1).stores({
      tasks: 'id, user_id, category, status, scheduled_date, priority_score',
      habits: 'id, user_id, category',
      calendar: 'id, user_id, start_time, event_type',
      briefings: 'id, user_id, briefing_type, created_at',
      offlineQueue: '++id, table, action, createdAt',
      encryption: 'id',
      cache: 'key, expires_at'
    });
  }
}

export const db = new AlfredoDB();

// 오프라인 큐 처리
window.addEventListener('online', async () => {
  console.log('Back online, syncing pending changes...');
  
  const { syncPendingChanges } = useTaskStore.getState();
  await syncPendingChanges();
  
  // 다른 스토어들도 동기화
  // ...
});
```

---

## 📡 API 클라이언트

```typescript
// lib/api.ts
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '';

class APIClient {
  private getHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
  
  async request<T>(
    method: string,
    path: string,
    options: {
      params?: Record<string, any>;
      body?: any;
    } = {}
  ): Promise<{ data: T; status: number }> {
    const url = new URL(path, BASE_URL);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      method,
      headers: this.getHeaders(),
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    // 401: 토큰 갱신 시도
    if (response.status === 401) {
      await useAuthStore.getState().refreshToken();
      
      // 재시도
      const retryResponse = await fetch(url.toString(), {
        method,
        headers: this.getHeaders(),
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      if (!retryResponse.ok) {
        throw new Error('Unauthorized');
      }
      
      return {
        data: await retryResponse.json(),
        status: retryResponse.status
      };
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    const data = response.status === 204 ? null : await response.json();
    
    return { data, status: response.status };
  }
  
  get<T>(path: string, options?: { params?: Record<string, any> }) {
    return this.request<T>('GET', path, options);
  }
  
  post<T>(path: string, body?: any) {
    return this.request<T>('POST', path, { body });
  }
  
  patch<T>(path: string, body?: any) {
    return this.request<T>('PATCH', path, { body });
  }
  
  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
  
  // SSE 스트림 (Chat용)
  async stream(
    path: string,
    body: any,
    onChunk: (text: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Stream request failed');
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) return;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onComplete?.();
            return;
          }
          
          try {
            const { text } = JSON.parse(data);
            onChunk(text);
          } catch (e) {
            // 파싱 오류 무시
          }
        }
      }
    }
    
    onComplete?.();
  }
}

export const api = new APIClient();
```

---

## 🔔 푸시 알림

```typescript
// hooks/usePushNotification.ts
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    setPermission(Notification.permission);
    
    checkSubscription();
  }, []);
  
  async function checkSubscription() {
    if (!isSupported) return;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    setIsSubscribed(!!subscription);
  }
  
  async function subscribe(): Promise<boolean> {
    if (!isSupported) return false;
    
    // 권한 요청
    const permission = await Notification.requestPermission();
    setPermission(permission);
    
    if (permission !== 'granted') return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        )
      });
      
      // 서버에 구독 정보 전송
      await api.post('/api/notifications/subscribe', {
        subscription: subscription.toJSON()
      });
      
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }
  
  async function unsubscribe(): Promise<boolean> {
    if (!isSupported) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        // 서버에 구독 해제 알림
        await api.post('/api/notifications/unsubscribe');
      }
      
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }
  
  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
```

---

## 🎨 디자인 토큰

```typescript
// styles/theme.ts

export const colors = {
  // 브랜드 칼라 (Lavender)
  lavender: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A996FF',   // Primary
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95'
  },
  
  // 시맨틱 칼라
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // 뉴트럴
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B'
  },
  
  // 배경
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F3FF',
    tertiary: '#EDE9FE'
  }
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem'
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
};

// Glassmorphism
export const glass = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
};
```

---

## 🚀 PWA 설정

```json
// public/manifest.json
{
  "name": "알프레도 - AI 버틀러",
  "short_name": "알프레도",
  "description": "ADHD 친화적 AI 라이프 버틀러",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F5F3FF",
  "theme_color": "#A996FF",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false,  // public/manifest.json 사용
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60  // 1시간
              }
            }
          }
        ]
      }
    })
  ]
});
```

---

## 📝 구현 체크리스트

### Phase 1: 기반
- [ ] 프로젝트 구조 세팅
- [ ] Zustand 스토어 구현
- [ ] API 클라이언트
- [ ] IndexedDB 설정
- [ ] 클라이언트 암호화

### Phase 2: UI
- [ ] 디자인 토큰 적용
- [ ] 공통 컴포넌트
- [ ] 홈 페이지
- [ ] Work/Life 페이지
- [ ] 설정 페이지

### Phase 3: 기능
- [ ] 채팅 스트리밍
- [ ] 푸시 알림
- [ ] 오프라인 지원
- [ ] PWA 설정

### Phase 4: 폴리싱
- [ ] 에러 처리
- [ ] 로딩 상태
- [ ] 애니메이션
- [ ] 성능 최적화
