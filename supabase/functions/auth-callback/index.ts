import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || 'http://localhost:5173/auth/callback';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { code, redirect_uri } = await req.json();
    const finalRedirectUri = redirect_uri || REDIRECT_URI;

    if (!code) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'Authorization code is required', 400);
    }

    // Google에서 토큰 교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: finalRedirectUri,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return errorResponse(ErrorCodes.INVALID_TOKEN, tokens.error_description || 'Token exchange failed', 400);
    }

    // Google 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    // Supabase에서 사용자 생성 또는 조회
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('google_id', googleUser.id)
      .single();

    let user;

    if (existingUser) {
      // 기존 사용자 업데이트
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token || existingUser.google_refresh_token,
          last_login_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      user = data;
    } else {
      // 새 사용자 생성
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          google_id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
        })
        .select()
        .single();

      if (error) throw error;
      user = data;

      // 새 사용자용 초기 설정 생성
      await supabaseAdmin.from('user_settings').insert({ user_id: user.id });

      // 펭귄 상태 초기화
      await supabaseAdmin.from('penguin_status').insert({ user_id: user.id });
    }

    // Supabase Auth 세션 생성
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: googleUser.email,
      email_confirm: true,
      user_metadata: {
        name: googleUser.name,
        avatar_url: googleUser.picture,
        user_id: user.id,
      },
    });

    // 이미 존재하는 사용자면 세션만 생성
    let session;
    if (authError?.message?.includes('already been registered')) {
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = existingAuthUser.users.find(u => u.email === googleUser.email);
      
      if (authUser) {
        const { data: sessionData } = await supabaseAdmin.auth.admin.createSession({
          userId: authUser.id,
        });
        session = sessionData.session;
      }
    } else if (authData?.user) {
      const { data: sessionData } = await supabaseAdmin.auth.admin.createSession({
        userId: authData.user.id,
      });
      session = sessionData.session;
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      } : null,
    });
  } catch (error) {
    console.error('Auth Callback Error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Authentication failed',
      500,
      error instanceof Error ? error.message : undefined
    );
  }
});
