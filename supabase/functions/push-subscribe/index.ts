/**
 * 푸시 구독 관리 Edge Function
 * POST: 새 구독 등록/업데이트
 * DELETE: 구독 해제
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromAuth } from '../_shared/supabase.ts';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface SubscribeRequest {
  subscription: PushSubscription;
  deviceName?: string;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // POST: 구독 등록/업데이트
    if (req.method === 'POST') {
      const body: SubscribeRequest = await req.json();
      const { subscription, deviceName } = body;

      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return new Response(
          JSON.stringify({ error: 'Invalid subscription data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upsert 구독 정보
      const { data, error } = await supabaseAdmin
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          device_name: deviceName || null,
          user_agent: req.headers.get('User-Agent'),
          is_active: true,
          last_used_at: new Date().toISOString(),
          failed_count: 0,
        }, {
          onConflict: 'user_id,endpoint',
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving subscription:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to save subscription', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // notification_settings도 enabled로 업데이트
      await supabaseAdmin
        .from('notification_settings')
        .upsert({
          user_id: userId,
          enabled: true,
        }, {
          onConflict: 'user_id',
        });

      return new Response(
        JSON.stringify({
          success: true,
          subscription_id: data.id,
          message: 'Push subscription registered successfully',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: 구독 해제
    if (req.method === 'DELETE') {
      const { endpoint } = await req.json();

      if (endpoint) {
        // 특정 endpoint 구독 해제
        const { error } = await supabaseAdmin
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', userId)
          .eq('endpoint', endpoint);

        if (error) {
          console.error('Error unsubscribing:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to unsubscribe' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // 모든 구독 해제
        const { error } = await supabaseAdmin
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', userId);

        if (error) {
          console.error('Error unsubscribing all:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to unsubscribe' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Unsubscribed successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: 현재 구독 상태 조회
    if (req.method === 'GET') {
      const { data: subscriptions, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('id, device_name, is_active, last_used_at, created_at')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch subscriptions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          subscriptions,
          count: subscriptions?.length || 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Push subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
