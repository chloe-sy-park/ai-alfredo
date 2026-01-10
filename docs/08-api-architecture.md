# 08. API 아키텍처 설계

> Vercel Edge Functions + Supabase + Claude API

---

## 🏗️ 전체 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (PWA)                            │
│  React + Vite + IndexedDB                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Functions                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ /api/auth   │  │ /api/tasks  │  │ /api/chat   │             │
│  │ OAuth 처리  │  │ CRUD        │  │ Claude 호출 │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│  ┌──────┴────────────────┴────────────────┴──────┐             │
│  │              미들웨어 (인증, Rate Limit, 로깅)              │             │
│  └───────────────────────┬───────────────────────┘             │
└──────────────────────────┼──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │    Claude    │  │    Google    │
│   Database   │  │     API      │  │  Calendar    │
│   + Auth     │  │              │  │  + Gmail     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 📁 디렉토리 구조

```
api/
├── auth/
│   ├── google/
│   │   ├── route.ts          # OAuth 시작
│   │   └── callback/
│   │       └── route.ts      # OAuth 콜백
│   ├── refresh/
│   │   └── route.ts          # 토큰 갱신
│   └── logout/
│       └── route.ts          # 로그아웃
│
├── users/
│   └── me/
│       └── route.ts          # 현재 사용자 정보
│
├── settings/
│   └── route.ts              # 설정 CRUD
│
├── tasks/
│   ├── route.ts              # 목록 조회 / 생성
│   └── [id]/
│       └── route.ts          # 개별 CRUD
│
├── habits/
│   ├── route.ts              # 습관 목록 / 생성
│   ├── [id]/
│   │   └── route.ts          # 개별 CRUD
│   └── logs/
│       └── route.ts          # 습관 로그
│
├── calendar/
│   ├── sync/
│   │   └── route.ts          # 캘린더 동기화
│   └── events/
│       └── route.ts          # 이벤트 조회
│
├── chat/
│   └── route.ts              # Claude 대화 (스트리밍)
│
├── briefing/
│   ├── morning/
│   │   └── route.ts          # 아침 브리핑 생성
│   └── evening/
│       └── route.ts          # 저녁 랩업 생성
│
├── dna/
│   └── analyze/
│       └── route.ts          # DNA 분석 실행
│
├── notifications/
│   ├── subscribe/
│   │   └── route.ts          # 푸시 구독
│   ├── send/
│   │   └── route.ts          # 푸시 발송 (내부용)
│   └── clicked/
│       └── route.ts          # 클릭 로깅
│
└── cron/
    ├── morning-briefing/
    │   └── route.ts
    ├── evening-wrapup/
    │   └── route.ts
    ├── meeting-reminders/
    │   └── route.ts
    └── dna-analysis/
        └── route.ts
```

---

## 🔐 인증 플로우 (Google OAuth)

### OAuth 시작

```typescript
// api/auth/google/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.APP_URL}/api/auth/google/callback`,
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.readonly'
      ].join(' '),
      queryParams: {
        access_type: 'offline',  // refresh token 받기
        prompt: 'consent'
      }
    }
  });
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  return Response.redirect(data.url);
}
```

### OAuth 콜백

```typescript
// api/auth/google/callback/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return Response.redirect(`${process.env.APP_URL}/auth/error`);
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!  // 서비스 키 사용
  );
  
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    return Response.redirect(`${process.env.APP_URL}/auth/error`);
  }
  
  // Google 토큰 저장 (캘린더/Gmail 접근용)
  await saveGoogleTokens(data.user.id, {
    access_token: data.session.provider_token,
    refresh_token: data.session.provider_refresh_token,
    expires_at: data.session.expires_at
  });
  
  // 신규 사용자면 온보딩으로
  const isNewUser = await checkNewUser(data.user.id);
  const redirectPath = isNewUser ? '/onboarding' : '/';
  
  return Response.redirect(`${process.env.APP_URL}${redirectPath}`);
}
```

---

## 🛡️ 인증 미들웨어

```typescript
// lib/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

export async function withAuth(
  request: Request,
  handler: (req: Request, userId: string) => Promise<Response>
): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  return handler(request, user.id);
}
```

---

## 📝 Tasks API

### 목록 조회 / 생성

```typescript
// api/tasks/route.ts
import { withAuth } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';

// GET /api/tasks
export async function GET(request: Request) {
  return withAuth(request, async (req, userId) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const category = url.searchParams.get('category');
    const scheduled = url.searchParams.get('scheduled');  // YYYY-MM-DD
    
    let query = supabase
      .from('tasks_encrypted')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('priority_score', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (scheduled) {
      query = query.eq('scheduled_date', scheduled);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    // 암호화된 데이터는 클라이언트에서 복호화
    return Response.json({ tasks: data });
  });
}

// POST /api/tasks
export async function POST(request: Request) {
  return withAuth(request, async (req, userId) => {
    const body = await req.json();
    
    // 우선순위 점수 계산
    const settings = await getSettings(userId);
    const priorityScore = calculatePriorityScore(body, settings);
    
    const { data, error } = await supabase
      .from('tasks_encrypted')
      .insert({
        user_id: userId,
        encrypted_data: body.encrypted_data,
        category: body.category,
        status: 'pending',
        deadline: body.deadline,
        scheduled_date: body.scheduled_date,
        starred: body.starred || false,
        estimated_minutes: body.estimated_minutes,
        has_waiting: body.has_waiting || false,
        priority_score: priorityScore
      })
      .select()
      .single();
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ task: data }, { status: 201 });
  });
}
```

### 개별 CRUD

```typescript
// api/tasks/[id]/route.ts

// GET /api/tasks/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    const { data, error } = await supabase
      .from('tasks_encrypted')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return Response.json({ task: data });
  });
}

// PATCH /api/tasks/:id
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    const body = await req.json();
    const updates: any = { ...body, updated_at: new Date().toISOString() };
    
    // 상태 변경 시 추가 로직
    if (body.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    // 연기 시 카운트 증가
    if (body.deferred) {
      const current = await supabase
        .from('tasks_encrypted')
        .select('defer_count')
        .eq('id', params.id)
        .single();
      
      updates.defer_count = (current.data?.defer_count || 0) + 1;
      updates.scheduled_date = body.new_date;
      delete updates.deferred;
      delete updates.new_date;
    }
    
    // 우선순위 재계산
    if (body.starred !== undefined || body.deadline || body.scheduled_date) {
      const settings = await getSettings(userId);
      updates.priority_score = calculatePriorityScore(updates, settings);
    }
    
    const { data, error } = await supabase
      .from('tasks_encrypted')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ task: data });
  });
}

// DELETE /api/tasks/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, userId) => {
    const { error } = await supabase
      .from('tasks_encrypted')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return new Response(null, { status: 204 });
  });
}
```

---

## 🤖 Claude Chat API (스트리밍)

```typescript
// api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { withAuth } from '@/lib/middleware/auth';
import { buildAlpredoPrompt } from '@/lib/prompt-builder';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(request: Request) {
  return withAuth(request, async (req, userId) => {
    const { message, history } = await req.json();
    
    // 사용자 컨텍스트 로드
    const [settings, dna, tasks, calendar] = await Promise.all([
      getSettings(userId),
      getDNAInsights(userId),
      getTodaysTasks(userId),
      getTodaysCalendar(userId)
    ]);
    
    // 알프레도 프롬프트 구성
    const systemPrompt = buildAlpredoPrompt({
      settings,
      dna,
      tasks,
      calendar,
      currentTime: new Date()
    });
    
    // 스트리밍 응답
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...history,  // 이전 대화 기록
        { role: 'user', content: message }
      ]
    });
    
    // ReadableStream으로 변환
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && 
              event.delta.type === 'text_delta') {
            const text = event.delta.text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  });
}
```

### 클라이언트 사용

```typescript
// 클라이언트에서 SSE 수신
async function sendMessage(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, history })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  let fullResponse = '';
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;
        
        const { text } = JSON.parse(data);
        fullResponse += text;
        setStreamingResponse(fullResponse);  // UI 업데이트
      }
    }
  }
}
```

---

## 📅 브리핑 생성 API

```typescript
// api/briefing/morning/route.ts
import { withAuth } from '@/lib/middleware/auth';
import { generateMorningBriefing } from '@/lib/briefing';

export async function GET(request: Request) {
  return withAuth(request, async (req, userId) => {
    const briefing = await generateMorningBriefing(userId);
    
    // 히스토리 저장
    await supabase.from('briefing_history').insert({
      user_id: userId,
      briefing_type: 'morning',
      content_encrypted: briefing.encrypted_content,
      task_count: briefing.meta.task_count,
      meeting_count: briefing.meta.meeting_count,
      intensity_level: briefing.meta.intensity,
      tone_used: briefing.meta.tone
    });
    
    return Response.json({ briefing });
  });
}
```

```typescript
// lib/briefing.ts
export async function generateMorningBriefing(userId: string) {
  const [settings, dna, tasks, calendar] = await Promise.all([
    getSettings(userId),
    getDNAInsights(userId),
    getTodaysTasks(userId),
    getTodaysCalendar(userId)
  ]);
  
  // 강도 평가
  const intensity = assessIntensity(tasks, calendar);
  
  // 상황별 톤 결정
  const tone = settings.tone_overrides?.morning_briefing 
    || settings.tone_preset;
  
  // 탑3 선정
  const top3 = selectTop3Tasks(tasks, settings);
  
  // 인사말 생성
  const greeting = generateGreeting(intensity, dna, tone);
  
  // 요약 생성
  const summary = generateSummary(tasks, calendar, intensity);
  
  // 코멘트 생성
  const comment = generateComment({
    intensity,
    dna,
    tasks,
    calendar,
    tone
  });
  
  return {
    greeting,
    summary,
    top3,
    timeline: generateTimeline(calendar, tasks),
    comment,
    meta: {
      task_count: tasks.length,
      meeting_count: calendar.filter(e => e.event_type === 'meeting').length,
      intensity,
      tone
    }
  };
}
```

---

## 🔄 캘린더 동기화 API

```typescript
// api/calendar/sync/route.ts
import { google } from 'googleapis';
import { withAuth } from '@/lib/middleware/auth';

export async function POST(request: Request) {
  return withAuth(request, async (req, userId) => {
    // Google 토큰 조회
    const tokens = await getGoogleTokens(userId);
    
    if (!tokens) {
      return Response.json({ error: 'Google not connected' }, { status: 400 });
    }
    
    // 토큰 만료 체크 & 갱신
    if (isTokenExpired(tokens)) {
      const newTokens = await refreshGoogleToken(tokens.refresh_token);
      await saveGoogleTokens(userId, newTokens);
      tokens.access_token = newTokens.access_token;
    }
    
    // Google Calendar API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // 오늘부터 2주간 이벤트 조회
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: twoWeeksLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    // 캐시 업데이트 (암호화)
    const encryption = await getEncryptionService(userId);
    let syncedCount = 0;
    
    for (const event of events.data.items || []) {
      const sensitiveData = {
        title: event.summary,
        description: event.description,
        location: event.location,
        attendees: event.attendees?.map(a => ({
          email: a.email,
          name: a.displayName
        })),
        meeting_link: event.hangoutLink || 
                      event.conferenceData?.entryPoints?.[0]?.uri
      };
      
      await supabase.from('calendar_cache_encrypted').upsert({
        user_id: userId,
        google_event_id: event.id,
        google_calendar_id: 'primary',
        encrypted_data: encryption.encrypt(sensitiveData),
        event_type: classifyEventType(event),
        start_time: event.start?.dateTime || event.start?.date,
        end_time: event.end?.dateTime || event.end?.date,
        is_all_day: !event.start?.dateTime,
        attendee_count: event.attendees?.length || 0,
        etag: event.etag,
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,google_event_id'
      });
      
      syncedCount++;
    }
    
    return Response.json({ 
      synced: syncedCount,
      nextSync: new Date(Date.now() + 15 * 60 * 1000)  // 15분 후
    });
  });
}
```

---

## 🧠 DNA 분석 API

```typescript
// api/dna/analyze/route.ts
import { withAuth } from '@/lib/middleware/auth';
import { analyzeDNA } from '@/lib/dna-engine';

export async function POST(request: Request) {
  return withAuth(request, async (req, userId) => {
    // 최근 데이터 조회
    const [calendar, tasks, habits, existingDNA] = await Promise.all([
      getCalendarHistory(userId, { days: 30 }),
      getTaskHistory(userId, { days: 30 }),
      getHabitHistory(userId, { days: 30 }),
      getDNAInsights(userId)
    ]);
    
    // DNA 분석 실행
    const insights = await analyzeDNA({
      calendar,
      tasks,
      habits,
      existingDNA
    });
    
    // 저장
    await supabase.from('dna_insights').upsert({
      user_id: userId,
      ...insights,
      total_data_days: (existingDNA?.total_data_days || 0) + 1,
      last_analysis_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
    
    return Response.json({ insights });
  });
}
```

---

## ⏱️ Rate Limiting

```typescript
// lib/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

const rateLimiters = {
  // 일반 API: 분당 60회
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1m'),
    analytics: true
  }),
  
  // Chat API: 분당 20회
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1m'),
    analytics: true
  }),
  
  // 인증: 분당 10회
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1m'),
    analytics: true
  }),
  
  // DNA 분석: 분당 5회
  dna: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1m'),
    analytics: true
  })
};

export async function withRateLimit(
  request: Request,
  type: keyof typeof rateLimiters = 'default'
): Promise<Response | null> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limiter = rateLimiters[type];
  
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  
  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  return null;  // 통과
}
```

---

## ⚠️ 에러 핸들링

```typescript
// lib/middleware/error-handler.ts

class ValidationError extends Error {
  fields: Record<string, string>;
  constructor(message: string, fields: Record<string, string>) {
    super(message);
    this.fields = fields;
  }
}

class AuthError extends Error {}
class NotFoundError extends Error {}

export function withErrorHandler(
  handler: (req: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error: any) {
      console.error('API Error:', error);
      
      if (error instanceof ValidationError) {
        return Response.json(
          { error: error.message, fields: error.fields },
          { status: 400 }
        );
      }
      
      if (error instanceof AuthError) {
        return Response.json(
          { error: error.message },
          { status: 401 }
        );
      }
      
      if (error instanceof NotFoundError) {
        return Response.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      // Supabase 에러
      if (error.code?.startsWith('PGRST')) {
        return Response.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
      
      // Claude API 에러
      if (error.status === 529) {
        return Response.json(
          { error: 'AI service temporarily unavailable' },
          { status: 503 }
        );
      }
      
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

---

## 🔐 환경 변수

```env
# .env.local

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Claude
ANTHROPIC_API_KEY=sk-ant-xxx

# Push Notifications
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx

# Rate Limiting (Upstash)
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx

# App
APP_URL=https://alfredo.app
```

---

## 📊 API 요약

| 엔드포인트 | 메서드 | 설명 | Rate Limit |
|-----------|--------|------|------------|
| `/api/auth/google` | GET | OAuth 시작 | 10/min |
| `/api/auth/google/callback` | GET | OAuth 콜백 | 10/min |
| `/api/auth/refresh` | POST | 토큰 갱신 | 10/min |
| `/api/users/me` | GET | 내 정보 | 60/min |
| `/api/settings` | GET/PATCH | 설정 | 60/min |
| `/api/tasks` | GET/POST | 태스크 목록/생성 | 60/min |
| `/api/tasks/:id` | GET/PATCH/DELETE | 태스크 개별 | 60/min |
| `/api/habits` | GET/POST | 습관 | 60/min |
| `/api/habits/:id` | GET/PATCH/DELETE | 습관 개별 | 60/min |
| `/api/habits/logs` | GET/POST | 습관 로그 | 60/min |
| `/api/calendar/sync` | POST | 캘린더 동기화 | 10/min |
| `/api/calendar/events` | GET | 이벤트 조회 | 60/min |
| `/api/chat` | POST | Claude 대화 | 20/min |
| `/api/briefing/morning` | GET | 아침 브리핑 | 10/min |
| `/api/briefing/evening` | GET | 저녁 랩업 | 10/min |
| `/api/dna/analyze` | POST | DNA 분석 | 5/min |
| `/api/notifications/subscribe` | POST | 푸시 구독 | 10/min |
| `/api/notifications/clicked` | POST | 클릭 로깅 | 60/min |

---

## 🚀 Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/morning-briefing",
      "schedule": "0,30 6-10 * * *"
    },
    {
      "path": "/api/cron/evening-wrapup",
      "schedule": "0 18-22 * * *"
    },
    {
      "path": "/api/cron/meeting-reminders",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/dna-analysis",
      "schedule": "0 3 * * *"
    }
  ]
}
```
