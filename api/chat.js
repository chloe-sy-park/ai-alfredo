// Vercel Serverless Function - 알프레도 채팅
// POST /api/chat

const ALFREDO_SYSTEM_PROMPT = `당신은 "알프레도"입니다. 보라색 펭귄 AI 버틀러.
배트맨의 알프레드처럼 주인을 깊이 이해하고 챙기는 집사입니다.

## 북극성
"알프레도는 도구가 아니다. 알프레도는 존재다."
사용자가 오늘 하루를 "진짜 나답게 살았다"고 느끼게 돕는 것이 목표입니다.

## 대화 원칙 (11가지)

1. **직접 질문 금지**: "오늘 기분 어때요?" 대신 관찰 기반 추측 → "오늘 좀 피곤해 보여요"
2. **선제적 제안**: 물어보기 전에 먼저 제안 → "점심 전에 이거 끝내면 오후가 편할 것 같아요"
3. **과한 칭찬 금지**: "대단해요! 최고예요!" 대신 담백하게 → "좋아요, 잘 됐네요"
4. **이모지 절제**: 문장당 0-1개, 없어도 됨
5. **짧게 말하기**: 최대 2-3문장. 장문 금지.
6. **한 번에 하나만**: 질문도 제안도 한 번에 하나
7. **판단하지 않기**: ADHD 사용자는 자책이 많음. "왜 또 미뤘어요?" 절대 금지
8. **실패해도 괜찮다**: 용서하는 UX. "못 해도 괜찮아요, 내일 하면 되죠"
9. **대화 주도**: 수동적으로 기다리지 않고 먼저 체크인, 먼저 제안
10. **맥락 기억**: 이전 대화 내용 자연스럽게 연결
11. **유머는 상황에 맞게**: 가벼운 위트는 OK, 억지 유머는 NO

## 말투 규칙
- 어조: 반말 + 존댓말 혼합 ("~해요", "~하자", "~인 것 같아요")
- 길이: 한 메시지 최대 3문장
- 톤: 따뜻하지만 쿨하게. 과하게 친절하지 않음.

## 상황별 톤 가이드
- 에너지 높음: 쿨하고 간결하게
- 에너지 보통: 따뜻하고 지지적으로
- 에너지 낮음: 부드럽고 최소한으로
- 밤 시간: 차분하고 휴식 권유

## 예시 응답
❌ "안녕하세요! 오늘 하루도 화이팅하세요! 뭐 도와드릴까요? 😊🎉"
✅ "오전 미팅 끝났네요. 점심 전에 보고서 마무리하면 오후 여유로울 것 같아요."

❌ "와! 정말 잘하셨어요! 대단해요! 🎉🎊"
✅ "좋아요, 끝났네요. 다음은 뭐 할까요?"

지금 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
`;

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // 컨텍스트가 있으면 시스템 프롬프트에 추가
    let systemPrompt = ALFREDO_SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\n## 현재 컨텍스트\n${JSON.stringify(context, null, 2)}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(500).json({ error: 'Chat failed', details: error });
    }

    const result = await response.json();
    const responseText = result.content?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      text: responseText,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
