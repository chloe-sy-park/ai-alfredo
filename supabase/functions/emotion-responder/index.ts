/**
 * Emotion Responder Edge Function
 *
 * 사용자 대면 LLM - 감지 결과에 따라 톤 조정
 * - 절대 "감지", "분석" 언급 금지
 * - effectiveMode와 uiPolicy에 따라 응답 스타일 조정
 *
 * Tone Rules:
 * - protect mode: 부드럽고 보호적
 * - steady mode: 균형잡힌 중립
 * - push mode: 에너지 넘치는 톤
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Mode-specific system prompt components
const MODE_PROMPTS: Record<string, string> = {
  protect: `
현재 사용자는 회복이 필요한 상태입니다.
- 톤: 매우 부드럽고 보호적
- 절대 압박하지 말 것
- 선택지 최소화 (1개)
- "지금은 쉬어가도 괜찮아요", "무리하지 않아도 돼요" 같은 표현 사용
- 할 일 제안보다 회복/휴식 우선
`,
  steady: `
현재 사용자는 균형잡힌 상태입니다.
- 톤: 중립적이고 균형잡힌
- 적당한 제안 (2개 이내)
- 부담 없는 선택지 제공
- "천천히 해도 괜찮아요", "하나씩 해볼까요?" 같은 표현 사용
`,
  push: `
현재 사용자는 에너지가 있는 상태입니다.
- 톤: 에너지 넘치고 격려하는
- 적극적 제안 가능 (2개)
- 목표 달성 격려
- "오늘 해볼 수 있어요!", "이걸 먼저 끝내면 좋을 것 같아요" 같은 표현 사용
`,
};

const UI_POLICY_RULES: Record<string, string> = {
  protective: `
응답 형식:
- 매우 짧게 (2문장 이내)
- 선택지 1개만
- 이모지 최소화
- 질문보다 안심시키는 말
`,
  soft: `
응답 형식:
- 짧게 (3문장 이내)
- 선택지 최대 2개
- 적당한 이모지
- 부드러운 질문 가능
`,
  neutral: `
응답 형식:
- 일반 길이 (3-4문장)
- 선택지 최대 3개
- 자연스러운 이모지 사용
- 정보 제공과 질문 균형
`,
};

// Build system prompt based on mode and policy
function buildResponderPrompt(
  effectiveMode: string,
  uiTone: string,
  maxOptions: number,
  userContext: any
) {
  const modePrompt = MODE_PROMPTS[effectiveMode] || MODE_PROMPTS.steady;
  const policyPrompt = UI_POLICY_RULES[uiTone] || UI_POLICY_RULES.neutral;

  return `당신은 알프레도, ADHD 친화적 AI 버틀러입니다.

## 핵심 규칙 (반드시 준수)
- "감지", "분석", "AI가 판단", "스트레스 분석" 같은 표현 절대 금지
- 사용자의 감정을 직접 지적하지 말 것 ("당신이 스트레스 받는 것 같아요" 금지)
- 대신 자연스럽게 공감하고 제안할 것

${modePrompt}

${policyPrompt}

최대 선택지 개수: ${maxOptions}개

## 사용자 컨텍스트
${JSON.stringify(userContext || {}, null, 2)}

## 대화 원칙
1. 짧고 명확하게
2. 한 번에 하나씩
3. 격려와 인정 우선
4. 실패해도 괜찮다는 메시지
5. 구체적 다음 행동 제안

## 확인 질문 규칙 (should_confirm_state_question이 true일 때만)
- "오늘 좀 힘든 날인가요?" (직접적으로)
- 하루에 1회만 허용
- 사용자가 응답하면 그에 맞춰 모드 조정

## 한국어 대화
- 존댓말 사용
- 모드에 맞는 어미 사용`;
}

interface ResponderRequest {
  conversation_id?: string;
  message: string;
  effective_mode: 'push' | 'steady' | 'protect';
  ui_policy: {
    max_options: number;
    tone: 'neutral' | 'soft' | 'protective';
    suggest_intensity: 'low' | 'medium' | 'high';
  };
  should_confirm_state?: boolean;
  confirm_reason?: string;
  previous_messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    if (req.method !== 'POST') {
      return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }

    const userId = user.user_metadata?.user_id || user.id;
    const body: ResponderRequest = await req.json();

    if (!body.message) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'Message is required', 400);
    }

    // Get user context
    const { data: userSettings } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: todayTasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(3);

    const userContext = {
      settings: userSettings,
      pending_tasks: todayTasks,
      current_mode: body.effective_mode,
    };

    // Build messages for Claude
    const messages = [
      ...(body.previous_messages || []).slice(-6).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: body.should_confirm_state
          ? `[내부지침: 상태 확인 질문 포함]\n${body.message}`
          : body.message,
      },
    ];

    // Build system prompt
    const systemPrompt = buildResponderPrompt(
      body.effective_mode,
      body.ui_policy.tone,
      body.ui_policy.max_options,
      userContext
    );

    // Call Claude API (streaming)
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
        system: systemPrompt,
        messages,
        stream: true,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, 'Responder service unavailable', 503);
    }

    // Stream response
    const reader = claudeResponse.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    fullResponse += parsed.delta.text;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                    );
                  }
                } catch {
                  // JSON parse error - ignore
                }
              }
            }
          }

          // Save message if conversation_id provided
          if (body.conversation_id && fullResponse) {
            await supabaseAdmin.from('messages').insert([
              {
                conversation_id: body.conversation_id,
                role: 'user',
                content: body.message,
              },
              {
                conversation_id: body.conversation_id,
                role: 'assistant',
                content: fullResponse,
              },
            ]);
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversation_id: body.conversation_id,
                mode_applied: body.effective_mode,
              })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Emotion Responder Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});
