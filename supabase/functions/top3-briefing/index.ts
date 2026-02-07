/**
 * Top 3 Briefing Edge Function
 * Claude API를 통해 판단(judgment) + 액션(actions) JSON 출력
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getUserFromAuth } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    if (req.method !== 'POST') {
      return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }

    const body = await req.json();
    const { prompt, context } = body;

    if (!prompt) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'Prompt is required', 400);
    }

    // Claude API 호출
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        system: prompt,
        messages: [
          {
            role: 'user',
            content: '위 상황을 분석하고 JSON으로 판단 결과를 출력해주세요.',
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('[Top3Briefing] Claude API error:', errorText);
      return errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, 'AI service unavailable', 503);
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || '';

    // JSON 파싱 시도
    let judgment;
    try {
      // ```json ... ``` 블록 추출
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      judgment = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('[Top3Briefing] JSON parse error:', parseError);
      // 파싱 실패 시 기본 응답
      judgment = {
        headline: '오늘도 화이팅!',
        reason: '일정을 확인하고 Top 3에 집중하세요',
        suggestion: null,
        actions: [],
        confidence: 0.3,
      };
    }

    return successResponse(judgment);
  } catch (error) {
    console.error('[Top3Briefing] Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});
