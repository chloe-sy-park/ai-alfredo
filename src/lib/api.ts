import { getAccessToken } from './supabase';

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// API 클라이언트 클래스
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
          },
        };
      }

      return data;
    } catch (error) {
      console.error('API 요청 오류:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(endpoint + queryString, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // SSE 스트리밍용 메서드
  async stream(
    endpoint: string,
    body: unknown,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onMessage(data);

              if (data.done) {
                onComplete?.();
                return;
              }
            } catch (e) {
              // JSON 파싱 실패 무시
            }
          }
        }
      }

      onComplete?.();
    } catch (error) {
      console.error('스트리밍 오류:', error);
      onError?.(error instanceof Error ? error : new Error('Stream error'));
    }
  }
}

// API 클라이언트 인스턴스
export const api = new ApiClient(API_BASE_URL);

// ========== Auth API ==========
export const authApi = {
  getGoogleAuthUrl: (redirectUri?: string) =>
    api.post<{ auth_url: string; state: string }>('/auth-google', { redirect_uri: redirectUri }),

  handleCallback: (code: string, redirectUri?: string) =>
    api.post<{ user: any; session: any }>('/auth-callback', { code, redirect_uri: redirectUri }),

  refreshToken: (refreshToken: string) =>
    api.post<{ access_token: string; refresh_token: string; expires_at: number }>('/auth-refresh', {
      refresh_token: refreshToken,
    }),

  logout: () => api.post('/auth-logout'),
};

// ========== Tasks API ==========
export const tasksApi = {
  list: (params?: {
    status?: string;
    category?: string;
    priority?: string;
    is_top3?: string;
    page?: string;
    limit?: string;
  }) => api.get<any[]>('/tasks', params),

  get: (id: string) => api.get<any>(`/tasks/${id}`),

  create: (data: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    due_date?: string;
    estimated_minutes?: number;
    is_top3?: boolean;
  }) => api.post<any>('/tasks', data),

  update: (id: string, data: Partial<any>) => api.patch<any>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/tasks/${id}`),

  complete: (id: string) => api.patch<{ task: any; rewards?: any }>(`/tasks/${id}`, { status: 'done' }),

  defer: (id: string) => api.patch<any>(`/tasks/${id}`, { status: 'deferred' }),
};

// ========== Habits API ==========
export const habitsApi = {
  list: () => api.get<any[]>('/habits'),

  get: (id: string) => api.get<any>(`/habits/${id}`),

  create: (data: {
    title: string;
    description?: string;
    category?: string;
    frequency?: string;
    target_days?: string[];
    reminder_time?: string;
  }) => api.post<any>('/habits', data),

  update: (id: string, data: Partial<any>) => api.patch<any>(`/habits/${id}`, data),

  delete: (id: string) => api.delete(`/habits/${id}`),

  log: (id: string, data: { completed?: boolean; notes?: string; logged_at?: string }) =>
    api.post<any>(`/habits/${id}/log`, data),
};

// ========== Daily Conditions API (W2) ==========
export interface DailyCondition {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  energy_level: number; // 1-5
  mood_level: number; // 1-5
  focus_level: number; // 1-5
  factors?: string[]; // ['sleep_quality', 'exercise', 'stress', ...]
  note?: string;
  created_at: string;
  updated_at?: string;
}

export interface WeeklySummary {
  days_logged: number;
  average_energy: number | null;
  average_mood: number | null;
  average_focus: number | null;
  trend: 'improving' | 'stable' | 'declining' | 'no_data';
  best_day: { date: string; overall: number } | null;
  worst_day: { date: string; overall: number } | null;
  conditions?: DailyCondition[];
}

export interface MonthlyHeatmap {
  year: number;
  month: number;
  days_in_month: number;
  days_logged: number;
  heatmap: Record<string, { 
    level: number; 
    energy: number; 
    mood: number; 
    focus: number; 
  }>;
}

export const dailyConditionsApi = {
  // 컨디션 목록 조회 (날짜 범위)
  list: (params?: { 
    start_date?: string; 
    end_date?: string; 
    offset?: string;
    limit?: string;
  }) => api.get<DailyCondition[]>('/daily-conditions', params),

  // 오늘 컨디션 조회
  getToday: () => api.get<DailyCondition | { log_date: string; exists: false }>('/daily-conditions/today'),

  // 특정 날짜 컨디션 조회
  getByDate: (date: string) => api.get<DailyCondition>(`/daily-conditions/${date}`),

  // 컨디션 기록 (생성 또는 업데이트)
  record: (data: {
    log_date?: string; // 기본값: 오늘
    energy_level?: number; // 1-5
    mood_level?: number; // 1-5
    focus_level?: number; // 1-5
    factors?: string[];
    note?: string;
  }) => api.post<DailyCondition>('/daily-conditions', data),

  // 컨디션 수정
  update: (id: string, data: Partial<Omit<DailyCondition, 'id' | 'user_id' | 'log_date' | 'created_at'>>) =>
    api.patch<DailyCondition>(`/daily-conditions/${id}`, data),

  // 컨디션 삭제
  delete: (id: string) => api.delete(`/daily-conditions/${id}`),

  // 주간 요약 조회
  getWeeklySummary: () => api.get<WeeklySummary>('/daily-conditions/summary/weekly'),

  // 월간 히트맵 데이터 (Year in Pixels용)
  getMonthlyHeatmap: (year?: number, month?: number) => 
    api.get<MonthlyHeatmap>('/daily-conditions/heatmap/monthly', {
      ...(year && { year: String(year) }),
      ...(month && { month: String(month) }),
    }),
};

// ========== Focus Sessions API ==========
export const focusApi = {
  list: (params?: { mode?: string; page?: string; limit?: string }) =>
    api.get<any[]>('/focus-sessions', params),

  get: (id: string) => api.get<any>(`/focus-sessions/${id}`),

  start: (data: {
    mode?: 'pomodoro' | 'flow' | 'body_double' | 'deep_work';
    planned_duration?: number;
    task_id?: string;
    task_title?: string;
  }) => api.post<any>('/focus-sessions', data),

  end: (id: string, data?: { actual_duration?: number; completed?: boolean; notes?: string }) =>
    api.post<{ session: any; rewards?: any }>(`/focus-sessions/${id}/end`, data),

  pause: (id: string) => api.post<{ paused: boolean; break_id: string }>(`/focus-sessions/${id}/pause`),

  resume: (id: string) => api.post<{ resumed: boolean; break_duration: number }>(`/focus-sessions/${id}/resume`),
};

// ========== Penguin API ==========
export const penguinApi = {
  getStatus: () => api.get<any>('/penguin'),

  getShop: () => api.get<{ items: any[]; user_coins: number }>('/penguin/shop'),

  getInventory: () => api.get<any[]>('/penguin/inventory'),

  buyItem: (itemId: string) =>
    api.post<{ purchased: boolean; item: any; remaining_coins: number }>('/penguin/buy', { item_id: itemId }),

  equipItem: (itemId: string, equip = true) =>
    api.post<{ equipped: boolean; item: any }>('/penguin/equip', { item_id: itemId, equip }),

  getAchievements: () => api.get<{ achievements: any[] }>('/penguin/achievements'),
};

// ========== Conversations API ==========
export const conversationsApi = {
  list: (params?: { page?: string; limit?: string }) => api.get<any[]>('/conversations', params),

  create: () => api.post<any>('/conversations'),

  sendMessage: (
    message: string,
    conversationId?: string,
    onMessage?: (data: { text?: string; done?: boolean; conversation_id?: string }) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ) => {
    return api.stream(
      '/conversations/message',
      { message, conversation_id: conversationId },
      onMessage || (() => {}),
      onError,
      onComplete
    );
  },
};

export default api;
