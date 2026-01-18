/**
 * OCR Service - Tesseract.js 기반 영수증 인식
 *
 * 브라우저에서 직접 실행되므로 서버 비용이 없습니다.
 * 한국어 지원을 위해 'kor' 언어 팩을 사용합니다.
 */

import Tesseract from 'tesseract.js';
import { OneTimeExpenseCategory } from './finance/types';

export interface ReceiptOCRResult {
  storeName: string | null;
  date: string | null;
  totalAmount: number | null;
  items: Array<{ name: string; price: number }>;
  category: OneTimeExpenseCategory;
  confidence: number;
  rawText: string;
}

/**
 * 이미지에서 텍스트 추출
 */
export async function extractTextFromImage(
  imageSource: string | File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const result = await Tesseract.recognize(imageSource, 'kor+eng', {
    logger: (info) => {
      if (info.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(info.progress * 100));
      }
    },
  });

  return result.data.text;
}

/**
 * 추출된 텍스트에서 영수증 데이터 파싱
 */
export function parseReceiptText(text: string): ReceiptOCRResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let storeName: string | null = null;
  let date: string | null = null;
  let totalAmount: number | null = null;
  const items: Array<{ name: string; price: number }> = [];

  // 날짜 패턴 (다양한 형식 지원)
  const datePatterns = [
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,  // 2024-01-15, 2024.01.15
    /(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/,  // 24-01-15
  ];

  // 금액 패턴
  const amountPattern = /([0-9,]+)\s*원?$/;
  const totalPatterns = [
    /합\s*계[:\s]*([0-9,]+)/i,
    /총\s*액[:\s]*([0-9,]+)/i,
    /결\s*제[:\s]*([0-9,]+)/i,
    /총\s*결제[:\s]*([0-9,]+)/i,
    /카드\s*결제[:\s]*([0-9,]+)/i,
    /현금\s*결제[:\s]*([0-9,]+)/i,
  ];

  // 가맹점명 추정 (보통 상단에 위치)
  // 일반적으로 첫 몇 줄에 상호명이 있음
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // 숫자나 특수문자가 적고, 한글이 포함된 경우 상호명일 가능성
    if (
      /[가-힣]/.test(line) &&
      !/\d{2,}/.test(line) &&
      !line.includes('영수증') &&
      !line.includes('거래') &&
      line.length >= 2 &&
      line.length <= 30
    ) {
      storeName = line;
      break;
    }
  }

  // 날짜 찾기
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        let year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');

        // 2자리 연도 처리
        if (year.length === 2) {
          year = '20' + year;
        }

        date = `${year}-${month}-${day}`;
        break;
      }
    }
    if (date) break;
  }

  // 총액 찾기
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        totalAmount = parseInt(match[1].replace(/,/g, ''), 10);
        break;
      }
    }
    if (totalAmount) break;
  }

  // 총액을 못 찾은 경우, 가장 큰 금액을 총액으로 추정
  if (!totalAmount) {
    let maxAmount = 0;
    for (const line of lines) {
      const match = line.match(amountPattern);
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''), 10);
        if (amount > maxAmount && amount < 10000000) {
          // 천만원 미만만
          maxAmount = amount;
        }
      }
    }
    if (maxAmount > 0) {
      totalAmount = maxAmount;
    }
  }

  // 품목 파싱 (금액이 있는 라인)
  for (const line of lines) {
    const match = line.match(amountPattern);
    if (match) {
      const price = parseInt(match[1].replace(/,/g, ''), 10);
      const name = line.replace(amountPattern, '').trim();

      // 총액 관련 라인은 제외
      if (
        name &&
        price > 0 &&
        price !== totalAmount &&
        !name.includes('합계') &&
        !name.includes('총액') &&
        !name.includes('결제') &&
        name.length > 1
      ) {
        items.push({ name, price });
      }
    }
  }

  // 카테고리 추론
  const category = inferCategoryFromText(text, storeName || '');

  // 신뢰도 계산
  const confidence = calculateConfidence(storeName, date, totalAmount);

  return {
    storeName,
    date: date || new Date().toISOString().split('T')[0],
    totalAmount,
    items,
    category,
    confidence,
    rawText: text,
  };
}

/**
 * 텍스트와 가맹점명으로 카테고리 추론
 */
function inferCategoryFromText(
  text: string,
  storeName: string
): OneTimeExpenseCategory {
  const lower = (text + ' ' + storeName).toLowerCase();

  // 음식점/카페
  if (
    lower.includes('카페') ||
    lower.includes('커피') ||
    lower.includes('스타벅스') ||
    lower.includes('이디야') ||
    lower.includes('투썸') ||
    lower.includes('맥도날드') ||
    lower.includes('버거킹') ||
    lower.includes('롯데리아') ||
    lower.includes('식당') ||
    lower.includes('레스토랑') ||
    lower.includes('치킨') ||
    lower.includes('피자')
  ) {
    return 'dining';
  }

  // 편의점/마트
  if (
    lower.includes('cu') ||
    lower.includes('gs25') ||
    lower.includes('세븐일레븐') ||
    lower.includes('이마트') ||
    lower.includes('홈플러스') ||
    lower.includes('롯데마트') ||
    lower.includes('편의점') ||
    lower.includes('마트') ||
    lower.includes('슈퍼')
  ) {
    return 'groceries';
  }

  // 주유소/교통
  if (
    lower.includes('주유') ||
    lower.includes('sk에너지') ||
    lower.includes('gs칼텍스') ||
    lower.includes('s-oil') ||
    lower.includes('현대오일') ||
    lower.includes('택시') ||
    lower.includes('버스') ||
    lower.includes('지하철')
  ) {
    return 'transport';
  }

  // 약국/병원
  if (
    lower.includes('약국') ||
    lower.includes('병원') ||
    lower.includes('의원') ||
    lower.includes('클리닉') ||
    lower.includes('의료')
  ) {
    return 'medical';
  }

  // 쇼핑
  if (
    lower.includes('다이소') ||
    lower.includes('올리브영') ||
    lower.includes('무신사') ||
    lower.includes('백화점') ||
    lower.includes('아울렛') ||
    lower.includes('쇼핑')
  ) {
    return 'shopping';
  }

  // 교육
  if (
    lower.includes('학원') ||
    lower.includes('교육') ||
    lower.includes('강의') ||
    lower.includes('학교')
  ) {
    return 'education';
  }

  return 'other';
}

/**
 * 인식 신뢰도 계산
 */
function calculateConfidence(
  storeName: string | null,
  date: string | null,
  totalAmount: number | null
): number {
  let score = 0;

  if (storeName && storeName.length >= 2) score += 0.3;
  if (date) score += 0.3;
  if (totalAmount && totalAmount > 0) score += 0.4;

  return Math.round(score * 100) / 100;
}

/**
 * 영수증 이미지에서 데이터 추출 (전체 파이프라인)
 */
export async function scanReceipt(
  imageSource: string | File,
  onProgress?: (progress: number) => void
): Promise<ReceiptOCRResult> {
  const text = await extractTextFromImage(imageSource, onProgress);
  return parseReceiptText(text);
}
