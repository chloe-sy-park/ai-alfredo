/**
 * 푸시 알림 발송 Edge Function
 * POST: 특정 사용자에게 푸시 알림 발송
 *
 * 이 함수는 주로 내부 Cron 함수에서 호출됩니다.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromAuth } from '../_shared/supabase.ts';

// VAPID 키 (환경 변수에서 가져옴)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@alfredo.app';

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  targetTaskId?: string;
  targetEventId?: string;
  urgent?: boolean;
}

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Base64 URL 인코딩/디코딩 유틸리티
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const decoded = atob(base64 + padding);
  return Uint8Array.from(decoded, c => c.charCodeAt(0));
}

// VAPID JWT 생성
async function generateVapidJwt(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12시간
    sub: subject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // ES256 서명 생성
  const privateKeyBytes = base64UrlDecode(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Web Push 발송 함수
async function sendWebPush(
  subscription: PushSubscriptionRow,
  payload: {
    title: string;
    body: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: Array<{ action: string; title: string }>;
    urgent?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const pushBody = JSON.stringify({
      title: payload.title,
      body: payload.body,
      tag: payload.tag || `alfredo-${Date.now()}`,
      icon: '/alfredo-icon.svg',
      badge: '/alfredo-badge.svg',
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.urgent || false,
    });

    // 푸시 서버 호스트 추출 (VAPID aud 파라미터용)
    const endpoint = new URL(subscription.endpoint);
    const audience = endpoint.origin;

    // VAPID 헤더 생성
    const vapidHeaders: Record<string, string> = {};

    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      try {
        const jwt = await generateVapidJwt(
          audience,
          VAPID_SUBJECT,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );
        vapidHeaders['Authorization'] = `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
      } catch (vapidError) {
        console.warn('VAPID JWT generation failed, sending without auth:', vapidError);
        // VAPID 없이 시도 (일부 푸시 서비스에서 테스트용으로 허용될 수 있음)
      }
    }

    // Web Push 요청
    // 참고: 실제 암호화된 페이로드를 위해서는 ECDH 키 교환 및 AES-GCM 암호화 필요
    // 현재 구현은 간소화된 버전임
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': payload.urgent ? 'high' : 'normal',
        ...vapidHeaders,
      },
      body: pushBody,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => '');
      console.error(`Push failed: HTTP ${response.status}`, responseText);

      // 410 Gone = 구독 만료
      if (response.status === 410) {
        return { success: false, error: 'subscription_expired' };
      }
      // 401/403 = 인증 문제 (VAPID 관련)
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'vapid_auth_failed' };
      }
      return { success: false, error: `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error('sendWebPush error:', error);
    return { success: false, error: String(error) };
  }
}

// 쓰로틀링 체크 함수
async function checkThrottle(
  userId: string,
  notificationType: string,
  targetId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();

  // 1. 하루 최대 알림 수 체크
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const { count: dailyCount } = await supabaseAdmin
    .from('notification_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('sent_at', dayStart.toISOString());

  const DAILY_MAX = 8;
  if ((dailyCount || 0) >= DAILY_MAX) {
    return { allowed: false, reason: 'daily_limit_exceeded' };
  }

  // 2. 같은 타입 최근 발송 체크 (30분 간격)
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

  const { data: recentSameType } = await supabaseAdmin
    .from('notification_throttle')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_type', notificationType)
    .gte('sent_at', thirtyMinAgo.toISOString())
    .limit(1);

  if (recentSameType && recentSameType.length > 0) {
    // 미팅 리마인더는 5분 간격 허용
    if (notificationType === 'meeting_reminder') {
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const { data: recentMeeting } = await supabaseAdmin
        .from('notification_throttle')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', 'meeting_reminder')
        .eq('target_id', targetId)
        .gte('sent_at', fiveMinAgo.toISOString())
        .limit(1);

      if (recentMeeting && recentMeeting.length > 0) {
        return { allowed: false, reason: 'same_meeting_too_soon' };
      }
    } else {
      return { allowed: false, reason: 'same_type_too_soon' };
    }
  }

  // 3. 같은 대상에 대한 알림 체크 (태스크는 4시간)
  if (targetId && notificationType === 'task_deadline') {
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const { data: recentTarget } = await supabaseAdmin
      .from('notification_throttle')
      .select('id')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .gte('sent_at', fourHoursAgo.toISOString())
      .limit(1);

    if (recentTarget && recentTarget.length > 0) {
      return { allowed: false, reason: 'same_target_too_soon' };
    }
  }

  return { allowed: true };
}

// 조용한 시간 체크
async function isQuietHours(userId: string): Promise<boolean> {
  const { data: settings } = await supabaseAdmin
    .from('notification_settings')
    .select('quiet_hours_start, quiet_hours_end')
    .eq('user_id', userId)
    .single();

  if (!settings) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const quietStart = settings.quiet_hours_start || '22:00';
  const quietEnd = settings.quiet_hours_end || '07:00';

  // 조용한 시간이 자정을 넘는 경우 (22:00 ~ 07:00)
  if (quietStart > quietEnd) {
    return currentTime >= quietStart || currentTime < quietEnd;
  }

  return currentTime >= quietStart && currentTime < quietEnd;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 내부 호출 또는 인증된 사용자 확인
    const authHeader = req.headers.get('Authorization');
    const serviceKey = req.headers.get('X-Service-Key');

    // 서비스 키 확인 (Cron에서 호출 시)
    const isServiceCall = serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    if (!isServiceCall) {
      const { user, error: authError } = await getUserFromAuth(authHeader);
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const payload: NotificationPayload = await req.json();
    const { userId, type, title, body, data, targetTaskId, targetEventId, urgent } = payload;

    if (!userId || !type || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, type, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. 알림 설정 확인
    const { data: settings } = await supabaseAdmin
      .from('notification_settings')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    if (!settings?.enabled) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'notifications_disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. 조용한 시간 체크 (긴급하지 않은 경우)
    if (!urgent && await isQuietHours(userId)) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'quiet_hours' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. 쓰로틀링 체크
    const targetId = targetTaskId || targetEventId;
    const throttleResult = await checkThrottle(userId, type, targetId);
    if (!throttleResult.allowed) {
      return new Response(
        JSON.stringify({ sent: false, reason: throttleResult.reason }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. 활성 구독 조회
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: false, reason: 'no_active_subscriptions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. 각 구독에 푸시 발송
    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await sendWebPush(sub, {
          title,
          body,
          tag: `${type}-${targetId || Date.now()}`,
          data: {
            type,
            url: data?.url || '/',
            ...data,
          },
          urgent,
        });

        // 구독 만료 시 비활성화
        if (!result.success && result.error === 'subscription_expired') {
          await supabaseAdmin
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', sub.id);
        }

        // 실패 횟수 증가
        if (!result.success) {
          await supabaseAdmin
            .from('push_subscriptions')
            .update({ failed_count: supabaseAdmin.sql`failed_count + 1` })
            .eq('id', sub.id);
        } else {
          // 성공 시 실패 횟수 리셋
          await supabaseAdmin
            .from('push_subscriptions')
            .update({ failed_count: 0, last_used_at: new Date().toISOString() })
            .eq('id', sub.id);
        }

        return { subscriptionId: sub.id, ...result };
      })
    );

    const successCount = results.filter((r) => r.success).length;

    // 6. 알림 히스토리 저장
    if (successCount > 0) {
      await supabaseAdmin.from('notification_history').insert({
        user_id: userId,
        notification_type: type,
        title,
        body,
        data,
        target_task_id: targetTaskId || null,
        target_event_id: targetEventId || null,
        status: 'sent',
        subscription_id: subscriptions[0].id,
      });

      // 쓰로틀 캐시 업데이트
      await supabaseAdmin.from('notification_throttle').insert({
        user_id: userId,
        notification_type: type,
        target_id: targetId || null,
      });
    }

    return new Response(
      JSON.stringify({
        sent: successCount > 0,
        successCount,
        totalSubscriptions: subscriptions.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Push send error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
