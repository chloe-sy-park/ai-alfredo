// Vercel Serverless Function - 음성 → 텍스트 변환
// POST /api/transcribe

export const config = {
  api: {
    bodyParser: false, // 파일 업로드를 위해 비활성화
  },
};

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
    // API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // multipart/form-data 파싱
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // boundary 추출
    const contentType = req.headers['content-type'];
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) {
      return res.status(400).json({ error: 'No boundary found in content-type' });
    }

    // 파일 데이터 추출 (간단한 파싱)
    const bodyString = buffer.toString('binary');
    const parts = bodyString.split(`--${boundary}`);
    
    let fileBuffer = null;
    let filename = 'audio.mp3';
    
    for (const part of parts) {
      if (part.includes('filename=')) {
        // 파일명 추출
        const filenameMatch = part.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
        
        // 헤더와 본문 분리 (빈 줄로 구분)
        const headerEndIndex = part.indexOf('\r\n\r\n');
        if (headerEndIndex !== -1) {
          const fileContent = part.slice(headerEndIndex + 4);
          // 마지막 \r\n 제거
          const cleanContent = fileContent.replace(/\r\n$/, '');
          fileBuffer = Buffer.from(cleanContent, 'binary');
        }
      }
    }

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file found in request' });
    }

    // OpenAI Whisper API 호출
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko'); // 한국어
    formData.append('response_format', 'verbose_json'); // 타임스탬프 포함

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('Whisper API error:', error);
      return res.status(500).json({ error: 'Transcription failed', details: error });
    }

    const result = await whisperResponse.json();

    return res.status(200).json({
      success: true,
      text: result.text,
      duration: result.duration,
      segments: result.segments || [],
    });

  } catch (error) {
    console.error('Transcribe error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
