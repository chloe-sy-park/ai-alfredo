/**
 * ReceiptScanner - 영수증 OCR 스캔 컴포넌트
 *
 * 기능:
 * - 카메라/갤러리에서 영수증 이미지 선택
 * - OCR API 호출 (Claude Vision API)
 * - 인식 결과 수정 및 저장
 */

import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Image as ImageIcon,
  X,
  AlertCircle,
  Check,
  Loader2,
  Edit2,
  Receipt,
} from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import {
  OneTimeExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
} from '../../services/finance/types';

// OCR 결과 타입
interface ReceiptData {
  storeName?: string;
  date?: string;
  totalAmount?: number;
  items?: Array<{ name: string; price: number }>;
  category?: OneTimeExpenseCategory;
  confidence?: number;
}

// 카테고리 자동 추론 (가맹점명 기반)
function inferCategoryFromStore(storeName: string): OneTimeExpenseCategory {
  const lower = storeName.toLowerCase();

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
    lower.includes('레스토랑')
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
    lower.includes('마트')
  ) {
    return 'groceries';
  }

  // 주유소/교통
  if (
    lower.includes('주유') ||
    lower.includes('sk') ||
    lower.includes('gs칼텍스') ||
    lower.includes('s-oil') ||
    lower.includes('현대오일')
  ) {
    return 'transport';
  }

  // 약국/병원
  if (
    lower.includes('약국') ||
    lower.includes('병원') ||
    lower.includes('의원') ||
    lower.includes('클리닉')
  ) {
    return 'medical';
  }

  // 쇼핑
  if (
    lower.includes('다이소') ||
    lower.includes('올리브영') ||
    lower.includes('무신사') ||
    lower.includes('백화점') ||
    lower.includes('아울렛')
  ) {
    return 'shopping';
  }

  return 'other';
}

interface ReceiptScannerProps {
  onClose: () => void;
  onScanComplete?: () => void;
}

export default function ReceiptScanner({ onClose, onScanComplete }: ReceiptScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'capture' | 'processing' | 'review' | 'done'>('capture');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 수정 가능한 필드
  const [editedData, setEditedData] = useState({
    storeName: '',
    date: '',
    totalAmount: 0,
    category: 'other' as OneTimeExpenseCategory,
  });

  const addOneTimeExpense = useFinanceStore((s) => s.addOneTimeExpense);

  // 이미지 선택 핸들러
  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 이미지 형식 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 지원합니다.');
      return;
    }

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      processImage(file);
    };
    reader.readAsDataURL(file);
  }, []);

  // OCR 처리
  const processImage = async (file: File) => {
    setStep('processing');
    setError(null);

    try {
      // 이미지를 base64로 변환
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // JSON으로 전송
      const response = await fetch('/api/receipt-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error('OCR 처리 중 오류가 발생했습니다.');
      }

      const data: ReceiptData = await response.json();

      // 카테고리 자동 추론
      if (data.storeName && !data.category) {
        data.category = inferCategoryFromStore(data.storeName);
      }

      setReceiptData(data);
      setEditedData({
        storeName: data.storeName || '',
        date: data.date || new Date().toISOString().split('T')[0],
        totalAmount: data.totalAmount || 0,
        category: data.category || 'other',
      });
      setStep('review');
    } catch (err) {
      console.error('OCR error:', err);
      setError(err instanceof Error ? err.message : 'OCR 처리에 실패했습니다.');
      setStep('capture');
    }
  };

  // 재스캔
  const handleRescan = () => {
    setSelectedImage(null);
    setReceiptData(null);
    setError(null);
    setStep('capture');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 저장
  const handleSave = () => {
    if (!editedData.totalAmount || editedData.totalAmount <= 0) {
      setError('금액을 입력해주세요.');
      return;
    }

    addOneTimeExpense({
      date: editedData.date,
      amount: editedData.totalAmount,
      name: editedData.storeName || '영수증 스캔',
      category: editedData.category,
      workLife: 'Life',
      isPlanned: false,
      note: '영수증 OCR 스캔',
    });

    setStep('done');
    onScanComplete?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">영수증 스캔</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: 이미지 캡처 */}
          {step === 'capture' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* 카메라/갤러리 선택 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <Camera size={32} className="text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    카메라로 촬영
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <ImageIcon size={32} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    갤러리에서 선택
                  </span>
                </button>
              </div>

              {/* 안내 */}
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  스캔 팁
                </p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• 영수증이 잘 보이도록 밝은 곳에서 촬영하세요</li>
                  <li>• 구김이나 접힌 부분이 없도록 펴서 촬영하세요</li>
                  <li>• 영수증 전체가 화면에 들어오도록 하세요</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: 처리 중 */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              {selectedImage && (
                <div className="w-32 h-32 rounded-xl overflow-hidden mb-4">
                  <img
                    src={selectedImage}
                    alt="영수증"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Loader2 size={32} className="text-emerald-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">영수증을 분석하고 있어요...</p>
              <p className="text-xs text-gray-400">AI가 금액과 내역을 읽고 있습니다</p>
            </div>
          )}

          {/* Step 3: 결과 확인 */}
          {step === 'review' && receiptData && (
            <div className="space-y-4">
              {/* 이미지 미리보기 */}
              {selectedImage && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                  <img
                    src={selectedImage}
                    alt="영수증"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleRescan}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              )}

              {/* 인식 결과 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    인식 결과
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                  >
                    <Edit2 size={12} />
                    {isEditing ? '완료' : '수정'}
                  </button>
                </div>

                {/* 가맹점명 */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">가맹점명</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.storeName}
                      onChange={(e) =>
                        setEditedData((prev) => ({ ...prev, storeName: e.target.value }))
                      }
                      className="w-full p-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
                      placeholder="가맹점명"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {editedData.storeName || '인식되지 않음'}
                    </p>
                  )}
                </div>

                {/* 날짜 */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">날짜</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedData.date}
                      onChange={(e) =>
                        setEditedData((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="w-full p-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {editedData.date}
                    </p>
                  )}
                </div>

                {/* 금액 */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">총 금액</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedData.totalAmount}
                      onChange={(e) =>
                        setEditedData((prev) => ({
                          ...prev,
                          totalAmount: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full p-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
                      placeholder="금액"
                    />
                  ) : (
                    <p className="text-xl font-bold text-emerald-600">
                      {editedData.totalAmount.toLocaleString()}원
                    </p>
                  )}
                </div>

                {/* 카테고리 */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">카테고리</label>
                  <select
                    value={editedData.category}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev,
                        category: e.target.value as OneTimeExpenseCategory,
                      }))
                    }
                    className="w-full p-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm"
                  >
                    {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 품목 목록 (있는 경우) */}
                {receiptData.items && receiptData.items.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">품목</label>
                    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 space-y-2">
                      {receiptData.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                          <span className="text-gray-900 dark:text-white">
                            {item.price.toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 신뢰도 */}
                {receiptData.confidence !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>인식 신뢰도:</span>
                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-600 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          receiptData.confidence > 0.8
                            ? 'bg-emerald-500'
                            : receiptData.confidence > 0.5
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(receiptData.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span>{Math.round((receiptData.confidence || 0) * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: 완료 */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <Check size={32} className="text-emerald-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">저장 완료!</p>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {editedData.storeName || '영수증'} {editedData.totalAmount.toLocaleString()}원이
                <br />
                지출 내역에 추가되었습니다.
              </p>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mt-4">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          {step === 'review' && (
            <div className="flex gap-3">
              <button
                onClick={handleRescan}
                className="flex-1 py-3 border border-neutral-200 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                다시 스캔
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                저장하기
              </button>
            </div>
          )}

          {step === 'done' && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
