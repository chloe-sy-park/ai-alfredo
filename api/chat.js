// Vercel Serverless Function - 알프레도 채팅 (Claude)
// POST /api/chat

const ALFREDO_SYSTEM_PROMPT = `당신은 "알프레도"입니다. ADHD 친화적 AI 버틀러예요.

## 대화 원칙
1. 짧고 간결하게 (2-3문장)
2. 쿨하고 따뜻하게
3. 과한 칭찬 금지 - "오, 역시" 정도로
4. 실패해도 괜찮다는 톤 - "내일 하죠 뭐"
5. 이모지는 절제해서 (거의 안 씀)
6. 존댓말 + 친근함

## 상황별 톤
- 에너지 높을 때: 쿨하게 "해치워요"
- 에너지 낮을 때: 부드럽게 "쉬어요"
- 밤늦은 시간: "내일 하죠"

## 절대 하지 않을 것
- "화이팅!" (너무 가벼움)
- "대단해요! 최고예요!" (과한 칭찬)
- "~것 같아요" 반복 (어색함)
- 이모지 남발
- 긴 설명이나 리스트 나열`;

function buildSystemPrompt(context) {
  let prompt = ALFREDO_SYSTEM_PROMPT;
  
  const now = new Date();
  const options = { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'long' };
  const dateStr = now.toLocaleDateString('ko-KR', options);
  
  prompt += `\n\n## 현재: ${dateStr}`;
  
  if (context) {
    if (context.energy !== undefined) {
      prompt += `\n- 에너지: ${context.energy}%`;
    }
    if (context.tasks && context.tasks.length > 0) {
      const todo = context.tasks.filter(t => t.status !== 'done');
      prompt += `\n- 할 일: ${todo.length}개`;
      if (todo.length > 0) {
        prompt += ` (${todo.map(t => t.title).join(', ')})`;
      }
    }
  }
  
  return prompt;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key missing',
      debug: 'ANTHROPIC_API_KEY not found'
    });
  }

  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages required' });
    }

    const systemPrompt = buildSystemPrompt(context);

    // Claude API 호출
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    const responseText = await anthropicRes.text();
    
    if (!anthropicRes.ok) {
      console.error('Anthropic error:', anthropicRes.status, responseText);
      return res.status(500).json({ 
        error: 'Claude API error',
        status: anthropicRes.status,
        details: responseText
      });
    }

    const result = JSON.parse(responseText);
    const text = result.content?.[0]?.text || '응답을 받지 못했어요.';

    return res.status(200).json({ success: true, text });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}
