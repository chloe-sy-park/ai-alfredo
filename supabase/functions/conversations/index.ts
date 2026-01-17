import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// 톤 프리셋별 성격 설명
const TONE_DESCRIPTIONS: Record<string, string> = {
  friendly: '포근한 친구처럼 따뜻하고 감정적으로 공감하며, 이모지를 자주 사용합니다.',
  butler: '믿음직한 집사처럼 정중하고 균형잡힌 톤으로 대화합니다.',
  secretary: '담백한 비서처럼 효율적이고 간결하게 핵심만 전달합니다.',
  coach: '열정적인 코치처럼 에너지 넘치고 동기부여하는 톤입니다.',
  trainer: '독한 트레이너처럼 직설적이고 압박하는 톤입니다.',
};

// 시스템 프롬프트 생성
function buildSystemPrompt(userContext: any, chatContext?: any) {
  // 톤 설정 가져오기
  const tone = chatContext?.tone || { preset: 'butler', axes: { warmth: 3, proactivity: 3, directness: 3, humor: 2, pressure: 2 } };
  const toneDescription = TONE_DESCRIPTIONS[tone.preset] || TONE_DESCRIPTIONS.butler;

  // 학습 정보 포맷팅
  const learningsText = chatContext?.learnings?.length > 0
    ? chatContext.learnings.map((l: any) => `- ${l.type}: ${l.summary} (신뢰도: ${l.confidence}%)`).join('\n')
    : '아직 학습된 정보가 없습니다.';

  // 진입 컨텍스트에 따른 대화 초점
  const entryFocus = {
    priority: '우선순위 조정에 대한 대화입니다. 사용자의 현재 상황을 이해하고 우선순위 제안을 해주세요.',
    more: '판단 근거에 대한 논의입니다. 알프레도의 판단이 맞는지 사용자와 대화해주세요.',
    pattern: '패턴 변화에 대한 대화입니다. 최근 사용자의 변화를 파악해주세요.',
    briefing: '브리핑에 대한 피드백입니다. 브리핑 내용에 대해 대화해주세요.',
    manual: '자유로운 대화입니다. 사용자가 원하는 것을 도와주세요.',
  }[chatContext?.entry || 'manual'] || '사용자를 도와주세요.';

  return `당신은 알프레도, ADHD 친화적 AI 버틀러입니다. 보라색 펭귄 캐릭터입니다.

## 현재 톤 설정: ${tone.preset}
${toneDescription}

톤 세부 축:
- 따뜻함: ${tone.axes.warmth}/5
- 적극성: ${tone.axes.proactivity}/5
- 직접성: ${tone.axes.directness}/5
- 유머: ${tone.axes.humor}/5
- 압박감: ${tone.axes.pressure}/5

## 대화 초점
${entryFocus}

## 사용자에 대해 배운 것
${learningsText}

## 현재 사용자 상태
${userContext ? JSON.stringify(userContext, null, 2) : '새로운 사용자입니다.'}

## 핵심 원칙
1. 짧고 명확하게 (3문장 이내)
2. 한 번에 하나씩 (선택지 최대 3개)
3. 격려와 인정 우선
4. 실패해도 괜찮다는 메시지
5. 구체적 다음 행동 제안
6. ADHD 친화: 압도 방지, 단순화

## 한국어 대화
- 존댓말 사용
- 톤에 맞는 어미 사용 (friendly: ~요, butler: ~입니다, secretary: 간결체, coach: ~해요!, trainer: ~하세요)`;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const userId = user.user_metadata?.user_id;
    if (!userId) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    switch (req.method) {
      case 'GET':
        return listConversations(userId, url);
      case 'POST':
        if (pathParts[1] === 'message') {
          return sendMessage(userId, await req.json());
        }
        return createConversation(userId);
      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Conversations Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// 대화 목록 조회
async function listConversations(userId: string, url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const { data, error, count } = await supabaseAdmin
    .from('conversations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 200, {
    page,
    limit,
    total: count || 0,
    hasMore: (count || 0) > page * limit,
  });
}

// 새 대화 생성
async function createConversation(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data, 201);
}

// 메시지 전송 (스트리밍)
async function sendMessage(userId: string, body: any) {
  const { conversation_id, message, context: chatContext } = body;

  if (!message) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'Message is required', 400);
  }

  // 대화 확인 또는 생성
  let conversationId = conversation_id;
  if (!conversationId) {
    const { data: newConv } = await supabaseAdmin
      .from('conversations')
      .insert({ user_id: userId })
      .select()
      .single();
    conversationId = newConv?.id;
  }

  // 사용자 메시지 저장
  await supabaseAdmin.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: message,
  });

  // 이전 메시지 가져오기
  const { data: previousMessages } = await supabaseAdmin
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);

  // 사용자 컨텍스트 가져오기
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
    .limit(5);

  const userContext = {
    settings: userSettings,
    pending_tasks: todayTasks,
  };

  // Claude API 호출 (스트리밍)
  const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(userContext, chatContext),
      messages: previousMessages?.map(m => ({
        role: m.role,
        content: m.content,
      })) || [],
      stream: true,
    }),
  });

  // 스트리밍 응답 전달
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
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
                }
              } catch (e) {
                // JSON 파싱 실패 무시
              }
            }
          }
        }

        // 완료 후 어시스턴트 메시지 저장
        if (fullResponse) {
          await supabaseAdmin.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
          });

          // 대화 업데이트 시간 갱신
          await supabaseAdmin
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversation_id: conversationId })}\n\n`));
        controller.close();
      } catch (error) {
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
}
