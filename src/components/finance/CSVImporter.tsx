/**
 * CSVImporter - 은행 CSV 파일 가져오기 컴포넌트
 *
 * 기능:
 * - 은행별 CSV 프리셋 지원 (국민, 신한, 우리, 카카오뱅크 등)
 * - 파일 업로드 및 파싱
 * - 컬럼 매핑 미리보기
 * - 거래 내역 일괄 가져오기
 */

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import {
  OneTimeExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
} from '../../services/finance/types';

// 은행 프리셋 타입
interface BankPreset {
  id: string;
  name: string;
  dateColumn: string;
  amountColumn: string;
  descriptionColumn: string;
  typeColumn?: string;
  dateFormat: string;
  encoding?: string;
  skipRows?: number;
}

// 파싱된 거래 데이터
interface ParsedTransaction {
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: OneTimeExpenseCategory;
  isSelected: boolean;
}

// 은행별 프리셋 정의
const BANK_PRESETS: BankPreset[] = [
  {
    id: 'kb',
    name: '국민은행',
    dateColumn: '거래일시',
    amountColumn: '출금액',
    descriptionColumn: '적요',
    typeColumn: '구분',
    dateFormat: 'YYYY-MM-DD',
    skipRows: 1,
  },
  {
    id: 'shinhan',
    name: '신한은행',
    dateColumn: '거래일',
    amountColumn: '출금',
    descriptionColumn: '내용',
    dateFormat: 'YYYY.MM.DD',
    skipRows: 1,
  },
  {
    id: 'woori',
    name: '우리은행',
    dateColumn: '거래일자',
    amountColumn: '출금금액',
    descriptionColumn: '적요',
    dateFormat: 'YYYY/MM/DD',
    skipRows: 1,
  },
  {
    id: 'kakao',
    name: '카카오뱅크',
    dateColumn: '일시',
    amountColumn: '금액',
    descriptionColumn: '내역',
    dateFormat: 'YYYY-MM-DD HH:mm',
    skipRows: 0,
  },
  {
    id: 'toss',
    name: '토스뱅크',
    dateColumn: '거래일시',
    amountColumn: '거래금액',
    descriptionColumn: '내용',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    skipRows: 1,
  },
  {
    id: 'custom',
    name: '직접 설정',
    dateColumn: '',
    amountColumn: '',
    descriptionColumn: '',
    dateFormat: 'YYYY-MM-DD',
  },
];

// 카테고리 자동 추론
function inferCategory(description: string): OneTimeExpenseCategory {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('식당') || lowerDesc.includes('카페') || lowerDesc.includes('음식')) {
    return 'dining';
  }
  if (lowerDesc.includes('편의점') || lowerDesc.includes('마트') || lowerDesc.includes('슈퍼')) {
    return 'groceries';
  }
  if (lowerDesc.includes('교통') || lowerDesc.includes('택시') || lowerDesc.includes('주유') || lowerDesc.includes('버스')) {
    return 'transport';
  }
  if (lowerDesc.includes('넷플릭스') || lowerDesc.includes('영화') || lowerDesc.includes('게임') || lowerDesc.includes('여행')) {
    return 'travel';
  }
  if (lowerDesc.includes('병원') || lowerDesc.includes('약국') || lowerDesc.includes('의료')) {
    return 'medical';
  }
  if (lowerDesc.includes('학원') || lowerDesc.includes('교육') || lowerDesc.includes('강의')) {
    return 'education';
  }
  if (lowerDesc.includes('쇼핑') || lowerDesc.includes('옷') || lowerDesc.includes('쿠팡')) {
    return 'shopping';
  }
  if (lowerDesc.includes('전기') || lowerDesc.includes('가스') || lowerDesc.includes('통신') || lowerDesc.includes('관리비')) {
    return 'utility';
  }
  if (lowerDesc.includes('경조사') || lowerDesc.includes('축의금') || lowerDesc.includes('부의금')) {
    return 'event';
  }
  if (lowerDesc.includes('선물')) {
    return 'gift';
  }

  return 'other';
}

// CSV 파싱 함수
function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/);
  const result: string[][] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    // 간단한 CSV 파싱 (쉼표로 분리, 따옴표 처리)
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    result.push(cells);
  }

  return result;
}

// 날짜 파싱
function parseDate(dateStr: string): string {
  // 다양한 형식 지원
  const cleaned = dateStr.replace(/[./]/g, '-').trim();
  const match = cleaned.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return new Date().toISOString().split('T')[0];
}

// 금액 파싱
function parseAmount(amountStr: string): number {
  // 쉼표, 원, 공백 제거 후 숫자로 변환
  const cleaned = amountStr.replace(/[,원\s]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : Math.abs(num);
}

interface CSVImporterProps {
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

export default function CSVImporter({ onClose, onImportComplete }: CSVImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [selectedBank, setSelectedBank] = useState<BankPreset | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // 커스텀 컬럼 매핑
  const [customMapping, setCustomMapping] = useState({
    dateColumn: '',
    amountColumn: '',
    descriptionColumn: '',
  });

  const addOneTimeExpense = useFinanceStore((s) => s.addOneTimeExpense);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 파일 형식 검증
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('CSV 또는 TXT 파일만 지원합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processCSV(content);
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(file, 'UTF-8');
  }, [selectedBank]);

  // CSV 처리
  const processCSV = (content: string) => {
    const rows = parseCSV(content);

    if (rows.length < 2) {
      setError('CSV 파일에 데이터가 없습니다.');
      return;
    }

    const skipRows = selectedBank?.skipRows || 0;
    const headers = rows[skipRows] || rows[0];
    const dataRows = rows.slice(skipRows + 1);

    setCsvHeaders(headers);

    // 프리셋이 있으면 자동 매핑
    if (selectedBank && selectedBank.id !== 'custom') {
      const dateIdx = headers.findIndex((h) => h.includes(selectedBank.dateColumn));
      const amountIdx = headers.findIndex((h) => h.includes(selectedBank.amountColumn));
      const descIdx = headers.findIndex((h) => h.includes(selectedBank.descriptionColumn));

      if (dateIdx === -1 || amountIdx === -1 || descIdx === -1) {
        setError('CSV 컬럼이 선택한 은행 형식과 맞지 않습니다. 다른 은행을 선택하거나 직접 설정해주세요.');
        return;
      }

      const transactions: ParsedTransaction[] = dataRows
        .filter((row) => row.length > Math.max(dateIdx, amountIdx, descIdx))
        .map((row) => {
          const amount = parseAmount(row[amountIdx]);
          return {
            date: parseDate(row[dateIdx]),
            amount,
            description: row[descIdx] || '내역 없음',
            type: 'expense' as const,
            category: inferCategory(row[descIdx] || ''),
            isSelected: amount > 0,
          };
        })
        .filter((t) => t.amount > 0);

      setParsedData(transactions);
      setStep('preview');
    } else {
      // 커스텀 매핑: 헤더만 저장하고 매핑 화면으로
      setStep('preview');
    }
  };

  // 커스텀 매핑 적용
  const applyCustomMapping = () => {
    if (!customMapping.dateColumn || !customMapping.amountColumn || !customMapping.descriptionColumn) {
      setError('모든 필수 컬럼을 선택해주세요.');
      return;
    }

    // 다시 파싱
    if (fileInputRef.current?.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const rows = parseCSV(content);
        const headers = rows[0];
        const dataRows = rows.slice(1);

        const dateIdx = headers.indexOf(customMapping.dateColumn);
        const amountIdx = headers.indexOf(customMapping.amountColumn);
        const descIdx = headers.indexOf(customMapping.descriptionColumn);

        const transactions: ParsedTransaction[] = dataRows
          .filter((row) => row.length > Math.max(dateIdx, amountIdx, descIdx))
          .map((row) => {
            const amount = parseAmount(row[amountIdx]);
            return {
              date: parseDate(row[dateIdx]),
              amount,
              description: row[descIdx] || '내역 없음',
              type: 'expense' as const,
              category: inferCategory(row[descIdx] || ''),
              isSelected: amount > 0,
            };
          })
          .filter((t) => t.amount > 0);

        setParsedData(transactions);
      };
      reader.readAsText(fileInputRef.current.files[0], 'UTF-8');
    }
  };

  // 거래 선택 토글
  const toggleTransaction = (index: number) => {
    setParsedData((prev) =>
      prev.map((t, i) => (i === index ? { ...t, isSelected: !t.isSelected } : t))
    );
  };

  // 전체 선택/해제
  const toggleAll = (selected: boolean) => {
    setParsedData((prev) => prev.map((t) => ({ ...t, isSelected: selected })));
  };

  // 카테고리 변경
  const updateCategory = (index: number, category: OneTimeExpenseCategory) => {
    setParsedData((prev) =>
      prev.map((t, i) => (i === index ? { ...t, category } : t))
    );
  };

  // 가져오기 실행
  const handleImport = async () => {
    const selected = parsedData.filter((t) => t.isSelected);
    if (selected.length === 0) {
      setError('가져올 거래를 선택해주세요.');
      return;
    }

    setStep('importing');
    setImportProgress(0);

    for (let i = 0; i < selected.length; i++) {
      const t = selected[i];

      addOneTimeExpense({
        date: t.date,
        amount: t.amount,
        name: t.description,
        category: t.category || 'other',
        workLife: 'Life',
        isPlanned: false,
        note: 'CSV 가져오기',
      });

      setImportProgress(Math.round(((i + 1) / selected.length) * 100));

      // 약간의 딜레이로 진행 상태 표시
      await new Promise((r) => setTimeout(r, 50));
    }

    setStep('done');
    onImportComplete?.(selected.length);
  };

  const selectedCount = parsedData.filter((t) => t.isSelected).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CSV 가져오기</h2>
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
          {/* Step 1: 업로드 */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* 은행 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  은행 선택
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowBankSelector(!showBankSelector)}
                    className="w-full flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-gray-400" />
                      <span>{selectedBank?.name || '은행을 선택하세요'}</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-400" />
                  </button>

                  {showBankSelector && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {BANK_PRESETS.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => {
                            setSelectedBank(bank);
                            setShowBankSelector(false);
                          }}
                          className="w-full flex items-center gap-2 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-600 text-left text-gray-900 dark:text-white"
                        >
                          <Building2 size={16} className="text-gray-400" />
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 파일 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSV 파일 선택
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={!selectedBank}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedBank}
                  className={`w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${
                    selectedBank
                      ? 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer'
                      : 'border-neutral-200 dark:border-neutral-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Upload size={32} className="text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBank ? 'CSV 파일을 선택하세요' : '먼저 은행을 선택하세요'}
                  </span>
                </button>
              </div>

              {/* 안내 */}
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 은행 앱 또는 웹에서 거래 내역을 CSV로 다운로드하세요.
                  대부분의 은행에서 '엑셀 다운로드' 또는 'CSV 내보내기' 기능을 제공합니다.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: 미리보기 */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* 커스텀 매핑 (필요한 경우) */}
              {selectedBank?.id === 'custom' && csvHeaders.length > 0 && parsedData.length === 0 && (
                <div className="space-y-3 mb-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">컬럼 매핑</p>
                  {['dateColumn', 'amountColumn', 'descriptionColumn'].map((field) => (
                    <div key={field}>
                      <label className="text-xs text-gray-500 mb-1 block">
                        {field === 'dateColumn' ? '날짜' : field === 'amountColumn' ? '금액' : '내용'}
                      </label>
                      <select
                        value={customMapping[field as keyof typeof customMapping]}
                        onChange={(e) =>
                          setCustomMapping((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        className="w-full p-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                      >
                        <option value="">선택...</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button
                    onClick={applyCustomMapping}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
                  >
                    적용
                  </button>
                </div>
              )}

              {/* 거래 목록 */}
              {parsedData.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parsedData.length}건 중 {selectedCount}건 선택됨
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAll(true)}
                        className="text-xs text-emerald-600 hover:underline"
                      >
                        전체 선택
                      </button>
                      <button
                        onClick={() => toggleAll(false)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        전체 해제
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {parsedData.map((t, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          t.isSelected
                            ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700'
                            : 'border-neutral-200 dark:border-neutral-600'
                        }`}
                      >
                        <button
                          onClick={() => toggleTransaction(i)}
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            t.isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-neutral-300 dark:border-neutral-500'
                          }`}
                        >
                          {t.isSelected && <Check size={14} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {t.description}
                          </p>
                          <p className="text-xs text-gray-500">{t.date}</p>
                        </div>

                        <select
                          value={t.category}
                          onChange={(e) => updateCategory(i, e.target.value as OneTimeExpenseCategory)}
                          className="text-xs p-1 border border-neutral-200 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700"
                        >
                          {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>

                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t.amount.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: 가져오기 중 */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">거래 내역을 가져오는 중...</p>
              <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{importProgress}%</p>
            </div>
          )}

          {/* Step 4: 완료 */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <Check size={32} className="text-emerald-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">가져오기 완료!</p>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCount}건의 거래가 추가되었습니다.
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
          {step === 'preview' && parsedData.length > 0 && (
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                selectedCount > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {selectedCount}건 가져오기
            </button>
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
