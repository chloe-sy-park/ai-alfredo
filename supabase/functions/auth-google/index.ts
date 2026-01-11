import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || 'http://localhost:5173/auth/callback';

// Google OAuth 스코프
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ');

serve(async (req) => {
  // CORS 처리
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { redirect_uri } = await req.json().catch(() => ({}));
    const finalRedirectUri = redirect_uri || REDIRECT_URI;

    // state 생성 (CSRF 방지)
    const state = crypto.randomUUID();

    // Google OAuth URL 생성
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', finalRedirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    return successResponse({
      auth_url: authUrl.toString(),
      state,
    });
  } catch (error) {
    console.error('Auth Google Error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to generate auth URL',
      500
    );
  }
});
