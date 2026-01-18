// Vercel Serverless Function - 영수증 OCR (Claude Vision)
// POST /api/receipt-ocr

import { setCorsHeaders } from './_cors.js';

const RECEIPT_PROMPT = `이 영수증 이미지를 분석해서 다음 정보를 JSON 형식으로 추출해주세요:

1. storeName: 가맹점명/상호명
2. date: 거래 날짜 (YYYY-MM-DD 형식)
3. totalAmount: 총 결제 금액 (숫자만, 원/₩ 제외)
4. items: 품목 목록 (배열, 각 항목은 { name: string, price: number })
5. category: 지출 카테고리 추론 (food, transport, entertainment, health, education, shopping, utility, other 중 하나)

응답은 반드시 유효한 JSON만 출력해주세요. 설명이나 다른 텍스트 없이 JSON만 반환하세요.
인식되지 않는 항목은 null로 표시하세요.

예시 응답:
{
  "storeName": "스타벅스 강남점",
  "date": "2024-01-15",
  "totalAmount": 5500,
  "items": [
    { "name": "아메리카노", "price": 4500 },
    { "name": "쿠키", "price": 1000 }
  ],
  "category": "food"
}`;

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // FormData에서 이미지 파싱
    // Vercel에서는 body가 base64로 전달될 수 있음
    let imageBase64 = null;
    let mediaType = 'image/jpeg';

    // Content-Type 확인
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      // FormData 처리
      // Vercel에서 formidable이나 busboy를 사용해야 하지만,
      // 간단하게 처리하기 위해 클라이언트에서 base64로 보내는 방식 권장
      return res.status(400).json({
        error: 'Please send image as base64 JSON',
        hint: 'Use { "image": "data:image/jpeg;base64,..." } format',
      });
    } else if (contentType.includes('application/json')) {
      // JSON body에서 base64 이미지 추출
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!body.image) {
        return res.status(400).json({ error: 'Image data required' });
      }

      // data:image/jpeg;base64,xxxxx 형식 파싱
      const matches = body.image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        mediaType = matches[1];
        imageBase64 = matches[2];
      } else {
        // 이미 base64만 있는 경우
        imageBase64 = body.image;
      }
    } else {
      return res.status(400).json({ error: 'Unsupported content type' });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Could not parse image data' });
    }

    // Claude Vision API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: RECEIPT_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(500).json({ error: 'OCR processing failed' });
    }

    const result = await response.json();

    // Claude 응답에서 JSON 추출
    const content = result.content?.[0]?.text || '';

    // JSON 파싱 시도
    let receiptData;
    try {
      // JSON 블록 추출 (```json ... ``` 형식 처리)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*\}/);

      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      receiptData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      // 파싱 실패 시 기본값 반환
      receiptData = {
        storeName: null,
        date: new Date().toISOString().split('T')[0],
        totalAmount: null,
        items: [],
        category: 'other',
        confidence: 0.3,
      };
    }

    // 신뢰도 계산 (필드가 얼마나 채워졌는지 기반)
    const filledFields = [
      receiptData.storeName,
      receiptData.date,
      receiptData.totalAmount,
    ].filter(Boolean).length;
    receiptData.confidence = receiptData.confidence || (filledFields / 3);

    return res.status(200).json(receiptData);
  } catch (error) {
    console.error('Receipt OCR error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
