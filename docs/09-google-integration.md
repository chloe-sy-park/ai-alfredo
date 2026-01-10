# 09. Google 연동 설계

> Google Calendar + Gmail API 통합

---

## 🔐 OAuth 2.0 설정

### Google Cloud Console 설정

```
1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client ID 생성 (Web application)
3. Authorized redirect URIs:
   - https://alfredo.app/api/auth/google/callback
   - http://localhost:3000/api/auth/google/callback (개발용)
```

### 필요한 OAuth Scopes

```typescript
const GOOGLE_SCOPES = [
  // 기본 프로필
  'openid',
  'email',
  'profile',
  
  // Calendar (읽기 전용)
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  
  // Gmail (읽기 전용 - 선택적)
  'https://www.googleapis.com/auth/gmail.readonly'
];
```

### Scope 요청 이유 (Permission Priming)

| Scope | 사용자에게 보여줄 설명 |
|-------|----------------------|
| calendar.readonly | "일정을 확인해서 미팅 전에 알려드려요" |
| calendar.events.readonly | "오늘 할 일과 일정을 브리핑해드려요" |
| gmail.readonly | "중요한 메일이 왔을 때 알려드려요" (선택) |

---

## 📅 Google Calendar 연동

### 토큰 관리

```typescript
// lib/google/tokens.ts
import { supabase } from '@/lib/supabase';

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;  // Unix timestamp
  scope: string;
}

// 토큰 저장
export async function saveGoogleTokens(
  userId: string, 
  tokens: GoogleTokens
) {
  // 암호화해서 저장
  const encrypted = await encrypt(JSON.stringify(tokens));
  
  await supabase.from('google_tokens').upsert({
    user_id: userId,
    encrypted_tokens: encrypted,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });
}

// 토큰 조회
export async function getGoogleTokens(
  userId: string
): Promise<GoogleTokens | null> {
  const { data } = await supabase
    .from('google_tokens')
    .select('encrypted_tokens')
    .eq('user_id', userId)
    .single();
  
  if (!data) return null;
  
  const decrypted = await decrypt(data.encrypted_tokens);
  return JSON.parse(decrypted);
}

// 토큰 만료 체크
export function isTokenExpired(tokens: GoogleTokens): boolean {
  // 5분 여유 두고 체크
  return Date.now() > (tokens.expires_at * 1000) - (5 * 60 * 1000);
}

// 토큰 갱신
export async function refreshGoogleToken(
  refreshToken: string
): Promise<GoogleTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${data.error}`);
  }
  
  return {
    access_token: data.access_token,
    refresh_token: refreshToken,  // refresh_token은 보통 그대로
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    scope: data.scope
  };
}
```

### Calendar API 클라이언트

```typescript
// lib/google/calendar.ts
import { google, calendar_v3 } from 'googleapis';

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  private userId: string;
  
  constructor(accessToken: string, userId: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    this.calendar = google.calendar({ version: 'v3', auth });
    this.userId = userId;
  }
  
  // 이벤트 목록 조회
  async getEvents(options: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
    calendarId?: string;
  } = {}): Promise<calendar_v3.Schema$Event[]> {
    const {
      timeMin = new Date(),
      timeMax = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxResults = 100,
      calendarId = 'primary'
    } = options;
    
    const response = await this.calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return response.data.items || [];
  }
  
  // 오늘 이벤트
  async getTodayEvents(): Promise<calendar_v3.Schema$Event[]> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    return this.getEvents({
      timeMin: startOfDay,
      timeMax: endOfDay
    });
  }
  
  // 이번 주 이벤트
  async getWeekEvents(): Promise<calendar_v3.Schema$Event[]> {
    const now = new Date();
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.getEvents({
      timeMin: now,
      timeMax: endOfWeek
    });
  }
  
  // 특정 이벤트 조회
  async getEvent(
    eventId: string, 
    calendarId: string = 'primary'
  ): Promise<calendar_v3.Schema$Event | null> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
  
  // 캘린더 목록
  async getCalendarList(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    const response = await this.calendar.calendarList.list();
    return response.data.items || [];
  }
  
  // Free/Busy 조회
  async getFreeBusy(options: {
    timeMin: Date;
    timeMax: Date;
    calendarIds?: string[];
  }): Promise<calendar_v3.Schema$FreeBusyResponse> {
    const {
      timeMin,
      timeMax,
      calendarIds = ['primary']
    } = options;
    
    const response = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: calendarIds.map(id => ({ id }))
      }
    });
    
    return response.data;
  }
}
```

### 이벤트 타입 분류

```typescript
// lib/google/classifier.ts

export type EventType = 
  | 'meeting'      // 다른 사람과의 미팅
  | 'focus'        // 집중 시간
  | 'personal'     // 개인 일정
  | 'travel'       // 이동
  | 'meal'         // 식사
  | 'other';       // 기타

export function classifyEvent(
  event: calendar_v3.Schema$Event
): EventType {
  const title = (event.summary || '').toLowerCase();
  const description = (event.description || '').toLowerCase();
  const attendeeCount = event.attendees?.length || 0;
  
  // 참석자가 2명 이상이면 미팅
  if (attendeeCount > 1) {
    return 'meeting';
  }
  
  // 키워드 기반 분류
  const patterns: Record<EventType, RegExp[]> = {
    meeting: [
      /미팅|meeting|회의|sync|1:1|1on1|면담|standup|스탠드업/i
    ],
    focus: [
      /집중|focus|deep work|작업|개발|코딩|writing/i
    ],
    personal: [
      /치과|병원|약속|개인|personal|휴가|연차|반차/i
    ],
    travel: [
      /이동|출장|travel|flight|비행|공항/i
    ],
    meal: [
      /점심|저녁|아침|식사|lunch|dinner|breakfast|밥/i
    ]
  };
  
  for (const [type, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      if (regex.test(title) || regex.test(description)) {
        return type as EventType;
      }
    }
  }
  
  return 'other';
}

// 이벤트 중요도 판단
export function assessEventImportance(
  event: calendar_v3.Schema$Event
): 'high' | 'medium' | 'low' {
  const attendeeCount = event.attendees?.length || 0;
  const title = (event.summary || '').toLowerCase();
  
  // 높음: 많은 참석자, 중요 키워드
  if (attendeeCount >= 5) return 'high';
  if (/발표|presentation|pt|demo|면접|interview/i.test(title)) return 'high';
  if (/중요|important|urgent|긴급/i.test(title)) return 'high';
  
  // 중간: 일반 미팅
  if (attendeeCount > 1) return 'medium';
  
  // 낮음: 개인 일정
  return 'low';
}

// 미팅 에너지 소모량 예측
export function predictEnergyDrain(
  event: calendar_v3.Schema$Event
): 'high' | 'medium' | 'low' {
  const attendeeCount = event.attendees?.length || 0;
  const duration = getEventDuration(event);  // 분 단위
  const title = (event.summary || '').toLowerCase();
  
  // 높음: 발표, 긴 미팅, 많은 참석자
  if (/발표|presentation|pt|demo/i.test(title)) return 'high';
  if (duration >= 90) return 'high';
  if (attendeeCount >= 8) return 'high';
  
  // 중간: 일반 미팅
  if (attendeeCount > 1 && duration >= 30) return 'medium';
  
  // 낮음: 짧은 미팅, 1:1
  return 'low';
}

function getEventDuration(event: calendar_v3.Schema$Event): number {
  if (!event.start || !event.end) return 0;
  
  const start = new Date(event.start.dateTime || event.start.date!);
  const end = new Date(event.end.dateTime || event.end.date!);
  
  return Math.round((end.getTime() - start.getTime()) / 60000);
}
```

### 캘린더 캐싱

```typescript
// lib/google/sync.ts
import { supabase } from '@/lib/supabase';
import { GoogleCalendarClient } from './calendar';
import { classifyEvent, assessEventImportance, predictEnergyDrain } from './classifier';

export async function syncCalendar(userId: string): Promise<number> {
  // 1. 토큰 가져오기
  const tokens = await getGoogleTokens(userId);
  if (!tokens) throw new Error('Google not connected');
  
  // 2. 토큰 갱신 필요시
  let accessToken = tokens.access_token;
  if (isTokenExpired(tokens)) {
    const newTokens = await refreshGoogleToken(tokens.refresh_token);
    await saveGoogleTokens(userId, newTokens);
    accessToken = newTokens.access_token;
  }
  
  // 3. Calendar 클라이언트 생성
  const client = new GoogleCalendarClient(accessToken, userId);
  
  // 4. 이벤트 조회 (2주간)
  const events = await client.getEvents();
  
  // 5. 암호화 서비스
  const encryption = await getEncryptionService(userId);
  
  // 6. 캐시 업데이트
  let syncedCount = 0;
  
  for (const event of events) {
    // 민감 정보 암호화
    const sensitiveData = {
      title: event.summary,
      description: event.description,
      location: event.location,
      attendees: event.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus
      })),
      meetingLink: extractMeetingLink(event),
      creator: event.creator,
      organizer: event.organizer
    };
    
    await supabase.from('calendar_cache_encrypted').upsert({
      user_id: userId,
      google_event_id: event.id,
      google_calendar_id: event.organizer?.email || 'primary',
      encrypted_data: encryption.encrypt(JSON.stringify(sensitiveData)),
      
      // 평문 메타데이터 (검색/필터용)
      event_type: classifyEvent(event),
      importance: assessEventImportance(event),
      energy_drain: predictEnergyDrain(event),
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      is_all_day: !event.start?.dateTime,
      attendee_count: event.attendees?.length || 0,
      has_meeting_link: !!extractMeetingLink(event),
      status: event.status,
      
      // 동기화 메타
      etag: event.etag,
      last_synced_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,google_event_id'
    });
    
    syncedCount++;
  }
  
  // 7. 삭제된 이벤트 처리
  const syncedIds = events.map(e => e.id);
  await supabase
    .from('calendar_cache_encrypted')
    .delete()
    .eq('user_id', userId)
    .not('google_event_id', 'in', `(${syncedIds.join(',')})`)
    .gte('start_time', new Date().toISOString());
  
  return syncedCount;
}

function extractMeetingLink(event: calendar_v3.Schema$Event): string | null {
  // Google Meet
  if (event.hangoutLink) return event.hangoutLink;
  
  // Conference data (Zoom, Teams 등)
  const entryPoint = event.conferenceData?.entryPoints?.find(
    ep => ep.entryPointType === 'video'
  );
  if (entryPoint?.uri) return entryPoint.uri;
  
  // Description에서 링크 추출
  const description = event.description || '';
  const zoomMatch = description.match(/https:\/\/[\w.-]*zoom\.us\/j\/\d+/i);
  if (zoomMatch) return zoomMatch[0];
  
  const teamsMatch = description.match(/https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s"<>]+/i);
  if (teamsMatch) return teamsMatch[0];
  
  return null;
}
```

---

## 📧 Gmail 연동 (선택적)

### Gmail API 클라이언트

```typescript
// lib/google/gmail.ts
import { google, gmail_v1 } from 'googleapis';

export class GmailClient {
  private gmail: gmail_v1.Gmail;
  private userId: string;
  
  constructor(accessToken: string, userId: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    this.gmail = google.gmail({ version: 'v1', auth });
    this.userId = userId;
  }
  
  // 최근 메일 조회
  async getRecentMessages(options: {
    maxResults?: number;
    query?: string;
    labelIds?: string[];
  } = {}): Promise<gmail_v1.Schema$Message[]> {
    const {
      maxResults = 10,
      query = 'is:unread',
      labelIds = ['INBOX']
    } = options;
    
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
      labelIds
    });
    
    if (!response.data.messages) return [];
    
    // 상세 정보 조회
    const messages = await Promise.all(
      response.data.messages.map(msg =>
        this.gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        })
      )
    );
    
    return messages.map(m => m.data);
  }
  
  // 읽지 않은 메일 수
  async getUnreadCount(): Promise<number> {
    const response = await this.gmail.users.labels.get({
      userId: 'me',
      id: 'INBOX'
    });
    
    return response.data.messagesUnread || 0;
  }
  
  // 중요 메일 조회
  async getImportantUnread(): Promise<gmail_v1.Schema$Message[]> {
    return this.getRecentMessages({
      query: 'is:unread is:important',
      maxResults: 5
    });
  }
}
```

### 메일 요약 (선택적 기능)

```typescript
// lib/google/gmail-summary.ts

interface EmailSummary {
  unreadCount: number;
  importantCount: number;
  highlights: {
    from: string;
    subject: string;
    date: string;
    isImportant: boolean;
  }[];
}

export async function getEmailSummary(userId: string): Promise<EmailSummary | null> {
  // Gmail scope가 있는지 확인
  const tokens = await getGoogleTokens(userId);
  if (!tokens?.scope.includes('gmail.readonly')) {
    return null;  // Gmail 연동 안 됨
  }
  
  const client = new GmailClient(tokens.access_token, userId);
  
  const [unreadCount, importantMessages] = await Promise.all([
    client.getUnreadCount(),
    client.getImportantUnread()
  ]);
  
  const highlights = importantMessages.map(msg => {
    const headers = msg.payload?.headers || [];
    return {
      from: headers.find(h => h.name === 'From')?.value || '',
      subject: headers.find(h => h.name === 'Subject')?.value || '',
      date: headers.find(h => h.name === 'Date')?.value || '',
      isImportant: msg.labelIds?.includes('IMPORTANT') || false
    };
  });
  
  return {
    unreadCount,
    importantCount: highlights.filter(h => h.isImportant).length,
    highlights
  };
}
```

---

## 🔄 동기화 전략

### 동기화 트리거

```typescript
// lib/google/sync-manager.ts

const SYNC_INTERVALS = {
  calendar: 15 * 60 * 1000,  // 15분
  gmail: 5 * 60 * 1000       // 5분 (선택적)
};

export class SyncManager {
  private lastSync: Map<string, number> = new Map();
  
  // 동기화 필요 여부 체크
  needsSync(userId: string, type: 'calendar' | 'gmail'): boolean {
    const key = `${userId}:${type}`;
    const lastSyncTime = this.lastSync.get(key) || 0;
    return Date.now() - lastSyncTime > SYNC_INTERVALS[type];
  }
  
  // 동기화 실행
  async sync(userId: string, type: 'calendar' | 'gmail'): Promise<void> {
    const key = `${userId}:${type}`;
    
    try {
      if (type === 'calendar') {
        await syncCalendar(userId);
      } else if (type === 'gmail') {
        await syncGmail(userId);
      }
      
      this.lastSync.set(key, Date.now());
    } catch (error) {
      console.error(`Sync failed for ${key}:`, error);
      throw error;
    }
  }
  
  // 앱 열 때 동기화
  async syncOnOpen(userId: string): Promise<void> {
    const tasks: Promise<void>[] = [];
    
    if (this.needsSync(userId, 'calendar')) {
      tasks.push(this.sync(userId, 'calendar'));
    }
    
    // Gmail은 선택적
    const tokens = await getGoogleTokens(userId);
    if (tokens?.scope.includes('gmail.readonly') && 
        this.needsSync(userId, 'gmail')) {
      tasks.push(this.sync(userId, 'gmail'));
    }
    
    await Promise.all(tasks);
  }
}
```

### 백그라운드 동기화 (PWA)

```typescript
// service-worker.ts - Background Sync

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'calendar-sync') {
    event.waitUntil(backgroundCalendarSync());
  }
});

async function backgroundCalendarSync() {
  const userId = await getUserIdFromStorage();
  if (!userId) return;
  
  try {
    const response = await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getToken()}`
      }
    });
    
    if (response.ok) {
      console.log('Background calendar sync completed');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
```

---

## 📊 캘린더 기반 DNA 분석

### 캘린더에서 추출하는 신호

```typescript
// lib/dna/calendar-signals.ts

interface CalendarSignals {
  // 크로노타입
  chronotype: {
    firstEventTime: string[];      // 최근 30일 첫 일정 시간
    lastEventTime: string[];       // 최근 30일 마지막 일정 시간
    inference: 'morning' | 'evening' | 'flexible';
    confidence: number;
  };
  
  // 미팅 패턴
  meetingPattern: {
    avgPerDay: number;
    avgDuration: number;           // 분
    peakDay: string;               // 요일
    peakTime: string;              // 시간대
    backToBackFrequency: number;   // 연속 미팅 빈도
  };
  
  // 워라밸
  workLifeBalance: {
    afterHoursRatio: number;       // 업무시간 외 일정 비율
    weekendWorkRatio: number;      // 주말 업무 비율
    personalEventRatio: number;    // 개인 일정 비율
  };
  
  // 집중 시간
  focusTime: {
    availableSlots: TimeSlot[];    // 가용 집중 시간
    longestBlock: number;          // 최장 빈 블록 (분)
    protectedTime: TimeSlot[];     // 의도적으로 비운 시간
  };
  
  // 에너지 패턴
  energyPattern: {
    highEnergyTimes: string[];     // 미팅 많이 잡는 시간
    recoveryTimes: string[];       // 미팅 후 빈 시간
    lowEnergyDays: string[];       // 일정 적은 요일
  };
}

export async function extractCalendarSignals(
  userId: string,
  days: number = 30
): Promise<CalendarSignals> {
  const events = await getCalendarHistory(userId, { days });
  
  // 날짜별 그룹핑
  const byDate = groupEventsByDate(events);
  
  // 크로노타입 분석
  const firstEvents = Object.values(byDate)
    .map(dayEvents => dayEvents[0])
    .filter(e => e && e.start_time);
  
  const firstTimes = firstEvents.map(e => 
    new Date(e.start_time).getHours()
  );
  const avgFirstTime = average(firstTimes);
  
  const chronotype = {
    firstEventTime: firstTimes.map(t => `${t}:00`),
    lastEventTime: [],  // 유사하게 계산
    inference: avgFirstTime < 9 ? 'morning' : 
               avgFirstTime > 10 ? 'evening' : 'flexible',
    confidence: calculateConfidence(firstTimes)
  };
  
  // 미팅 패턴 분석
  const meetings = events.filter(e => e.event_type === 'meeting');
  const meetingPattern = {
    avgPerDay: meetings.length / days,
    avgDuration: average(meetings.map(m => getEventDuration(m))),
    peakDay: findPeakDay(meetings),
    peakTime: findPeakTime(meetings),
    backToBackFrequency: calculateBackToBackRatio(meetings)
  };
  
  // 워라밸 분석
  const afterHoursEvents = events.filter(e => {
    const hour = new Date(e.start_time).getHours();
    return hour < 9 || hour >= 18;
  });
  
  const weekendEvents = events.filter(e => {
    const day = new Date(e.start_time).getDay();
    return day === 0 || day === 6;
  });
  
  const workLifeBalance = {
    afterHoursRatio: afterHoursEvents.length / events.length,
    weekendWorkRatio: weekendEvents.length / events.length,
    personalEventRatio: events.filter(e => 
      e.event_type === 'personal'
    ).length / events.length
  };
  
  // 집중 시간 분석
  const focusTime = analyzeFocusTime(byDate);
  
  // 에너지 패턴 분석
  const energyPattern = analyzeEnergyPattern(events, byDate);
  
  return {
    chronotype,
    meetingPattern,
    workLifeBalance,
    focusTime,
    energyPattern
  };
}
```

---

## ⚠️ 에러 처리

### Google API 에러 핸들링

```typescript
// lib/google/error-handler.ts

export class GoogleAPIError extends Error {
  code: number;
  reason: string;
  
  constructor(error: any) {
    super(error.message);
    this.code = error.code;
    this.reason = error.errors?.[0]?.reason;
  }
}

export async function handleGoogleError(
  error: any,
  userId: string
): Promise<never> {
  const code = error.code || error.status;
  const reason = error.errors?.[0]?.reason;
  
  switch (code) {
    case 401:
      // 토큰 만료 - 갱신 시도
      if (reason === 'authError') {
        const tokens = await getGoogleTokens(userId);
        if (tokens?.refresh_token) {
          try {
            const newTokens = await refreshGoogleToken(tokens.refresh_token);
            await saveGoogleTokens(userId, newTokens);
            throw new Error('RETRY');  // 재시도 신호
          } catch (refreshError) {
            // 갱신 실패 - 재인증 필요
            await disconnectGoogle(userId);
            throw new GoogleAPIError({
              code: 401,
              message: 'Google 재인증이 필요합니다',
              errors: [{ reason: 'reauth_required' }]
            });
          }
        }
      }
      break;
      
    case 403:
      // 권한 없음
      if (reason === 'insufficientPermissions') {
        throw new GoogleAPIError({
          code: 403,
          message: '추가 권한이 필요합니다',
          errors: [{ reason: 'scope_required' }]
        });
      }
      break;
      
    case 429:
      // Rate limit
      throw new GoogleAPIError({
        code: 429,
        message: '잠시 후 다시 시도해주세요',
        errors: [{ reason: 'rate_limit' }]
      });
      
    case 503:
      // 서비스 불가
      throw new GoogleAPIError({
        code: 503,
        message: 'Google 서비스가 일시적으로 불안정합니다',
        errors: [{ reason: 'service_unavailable' }]
      });
  }
  
  throw error;
}
```

### 연결 해제

```typescript
// lib/google/disconnect.ts

export async function disconnectGoogle(userId: string): Promise<void> {
  // 1. 토큰 삭제
  await supabase
    .from('google_tokens')
    .delete()
    .eq('user_id', userId);
  
  // 2. 캐시 데이터 삭제
  await supabase
    .from('calendar_cache_encrypted')
    .delete()
    .eq('user_id', userId);
  
  // 3. 설정 업데이트
  await supabase
    .from('settings')
    .update({ google_connected: false })
    .eq('user_id', userId);
  
  // 4. Google에서 토큰 취소 (선택적)
  // await revokeGoogleToken(accessToken);
}
```

---

## 🎨 Permission Priming UI

```typescript
// components/GoogleConnectScreen.tsx

const GoogleConnectScreen = () => {
  const [step, setStep] = useState<'intro' | 'permissions' | 'connecting'>('intro');
  
  return (
    <div className="flex flex-col items-center p-6">
      {step === 'intro' && (
        <>
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">
            캘린더를 연결해주세요
          </h2>
          <p className="text-gray-600 text-center mb-6">
            알프레도가 일정을 보고<br />
            하루를 준비하는 걸 도와드릴게요.
          </p>
          
          <button
            onClick={() => setStep('permissions')}
            className="w-full py-3 bg-lavender-500 text-white rounded-xl
                       font-medium hover:bg-lavender-600 transition-colors"
          >
            연결하기
          </button>
          
          <button
            onClick={skip}
            className="mt-3 text-gray-500 text-sm"
          >
            나중에 할게요
          </button>
        </>
      )}
      
      {step === 'permissions' && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            이런 걸 도와드릴 수 있어요
          </h2>
          
          <div className="w-full space-y-3 mb-6">
            <PermissionItem
              emoji="🌅"
              title="아침 브리핑"
              description="오늘 미팅과 할 일을 정리해서 알려드려요"
            />
            <PermissionItem
              emoji="⏰"
              title="미팅 리마인더"
              description="미팅 15분 전에 부드럽게 알려드려요"
            />
            <PermissionItem
              emoji="🎯"
              title="집중 시간 보호"
              description="빈 시간을 찾아서 딥워크를 추천해요"
            />
            <PermissionItem
              emoji="📊"
              title="에너지 관리"
              description="미팅 패턴을 분석해서 리듬을 파악해요"
            />
          </div>
          
          <div className="text-xs text-gray-400 mb-4 text-center">
            🔒 캘린더 데이터는 암호화되어 저장되며<br />
            절대 외부에 공유되지 않습니다.
          </div>
          
          <button
            onClick={connectGoogle}
            className="w-full py-3 bg-lavender-500 text-white rounded-xl
                       font-medium hover:bg-lavender-600 transition-colors
                       flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            Google 캘린더 연결하기
          </button>
        </>
      )}
    </div>
  );
};

const PermissionItem = ({ 
  emoji, 
  title, 
  description 
}: { 
  emoji: string; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start gap-3 p-3 bg-lavender-50 rounded-lg">
    <span className="text-2xl">{emoji}</span>
    <div>
      <p className="font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);
```

---

## 📝 구현 체크리스트

### Phase 1: 기본 연동
- [ ] Google Cloud Console 설정
- [ ] OAuth 플로우 구현
- [ ] 토큰 저장/갱신
- [ ] Calendar API 연동
- [ ] 이벤트 캐싱

### Phase 2: 분석
- [ ] 이벤트 타입 분류
- [ ] 중요도/에너지 예측
- [ ] DNA 신호 추출
- [ ] 집중 시간 감지

### Phase 3: 활용
- [ ] 아침 브리핑에 캘린더 통합
- [ ] 미팅 리마인더
- [ ] 에너지 기반 추천
- [ ] 워라밸 분석

### Phase 4: Gmail (선택적)
- [ ] Gmail scope 추가
- [ ] 읽지 않은 메일 수
- [ ] 중요 메일 알림
