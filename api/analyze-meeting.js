// Vercel Serverless Function - 회의 내용 분석
// POST /api/analyze-meeting

import { setCorsHeaders } from './_cors.js';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const { transcript, meetingTitle, language } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // 한국어가 아닌 경우 번역 필요
    const isKorean = language && ['ko', 'korean'].includes(language.toLowerCase());
    const needsTranslation = language && !isKorean;

    const systemPrompt = `당신은 알프레도, 사용자의 AI 비서입니다. 
회의 녹취록을 분석하여 다음 형식의 JSON으로 정리해주세요:

{
  "summary": "회의 요약 (2-3문장, 한국어로)",
  "translatedTranscript": ${needsTranslation ? '"원문 전체를 자연스러운 한국어로 번역"' : 'null'},
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", ...],
  "actionItems": [
    {
      "task": "해야 할 일 (한국어로)",
      "assignee": "담당자 (언급된 경우)",
      "deadline": "마감일 (언급된 경우, YYYY-MM-DD 형식)",
      "priority": "high/medium/low"
    }
  ],
  "decisions": ["결정된 사항 1", "결정된 사항 2", ...],
  "schedules": [
    {
      "title": "일정 제목 (한국어로)",
      "date": "YYYY-MM-DD",
      "time": "HH:mm (있는 경우)",
      "description": "설명"
    }
  ],
  "ideas": ["아이디어나 제안사항 (한국어로)"],
  "followUp": ["후속 조치 필요한 사항"],
  "mood": "회의 분위기 (positive/neutral/tense)"
}

규칙:
- 언급되지 않은 항목은 빈 배열 []로
- 날짜/시간이 불명확하면 null
- 모든 출력은 한국어로 작성
- 실용적이고 구체적인 액션 아이템 추출
- 담당자 이름이 언급되면 포함
${needsTranslation ? '- translatedTranscript: 원문 전체를 자연스럽고 읽기 쉬운 한국어로 번역해주세요' : '- translatedTranscript는 null로 설정'}`;

    const userPrompt = `다음 회의 녹취록을 분석해주세요:

${meetingTitle ? `회의 제목: ${meetingTitle}\n\n` : ''}${needsTranslation ? `원본 언어: ${language}\n\n` : ''}녹취록:
${transcript}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(500).json({ error: 'Analysis failed', details: error });
    }

    const result = await response.json();
    const content = result.content[0].text;

    // JSON 파싱 시도
    let analysis;
    try {
      // JSON 블록 추출 (```json ... ``` 형식일 수 있음)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        analysis = JSON.parse(jsonStr);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // 파싱 실패시 원본 텍스트 반환
      return res.status(200).json({
        success: true,
        rawAnalysis: content,
        parseError: true,
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error('Analyze error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
