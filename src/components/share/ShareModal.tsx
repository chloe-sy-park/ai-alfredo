/**
 * 공유 모달
 * Wrapped 카드를 미리 보고 공유할 수 있는 모달
 */

import { useRef, useState, useCallback } from 'react';
import { X, Download, Share2, Copy, Check, Palette } from 'lucide-react';
import { WrappedCard, WrappedCardData } from './WrappedCard';
import {
  share,
  downloadImage,
  dataUrlToFile,
  copyToClipboard,
  isShareSupported,
} from '../../services/share/shareService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WrappedCardData;
}

type CardVariant = 'default' | 'minimal' | 'colorful';

export default function ShareModal({ isOpen, onClose, data }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CardVariant>('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // html2canvas 동적 로드 및 이미지 생성
  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    setError(null);

    try {
      // html2canvas 동적 로드
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      // html2canvas가 없으면 대체 메시지
      console.error('Image generation failed:', err);
      setError('이미지 생성에 실패했어요. 스크린샷을 사용해주세요.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 이미지 다운로드
  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (dataUrl) {
      const filename = `alfredo-wrapped-${new Date().toISOString().split('T')[0]}.png`;
      downloadImage(dataUrl, filename);
    }
  };

  // 공유하기
  const handleShare = async () => {
    try {
      const dataUrl = await generateImage();
      const shareData = {
        title: '나의 알프레도 Wrapped',
        text: `${data.period} 동안 ${data.totalLifts}번의 판단 변화가 있었어요! #알프레도`,
        url: window.location.origin,
      };

      if (dataUrl && isShareSupported()) {
        // 이미지와 함께 공유 시도
        const file = dataUrlToFile(dataUrl, 'alfredo-wrapped.png');
        await share({ ...shareData, files: [file] });
      } else {
        // 텍스트만 공유
        await share(shareData);
      }
    } catch (err) {
      console.error('Share failed:', err);
      setError('공유에 실패했어요');
    }
  };

  // 텍스트 복사
  const handleCopy = async () => {
    const text = `🐧 나의 알프레도 Wrapped

📅 ${data.period}
📊 ${data.totalLifts}번의 판단 변화
✅ ${data.appliedLifts}번 적용

⚖️ 일 ${data.workLifeRatio.work}% / 삶 ${data.workLifeRatio.life}%

${data.insight ? `💬 "${data.insight}"` : ''}

#알프레도 #나의판단일지`;

    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const variants: Array<{ id: CardVariant; name: string; color: string }> = [
    { id: 'default', name: '퍼플', color: '#A996FF' },
    { id: 'minimal', name: '다크', color: '#333333' },
    { id: 'colorful', name: '그라데이션', color: '#667eea' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">공유하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 카드 미리보기 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-center">
            <div className="transform scale-[0.85] origin-top">
              <WrappedCard ref={cardRef} data={data} variant={variant} />
            </div>
          </div>
        </div>

        {/* 스타일 선택 */}
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">스타일</span>
          </div>
          <div className="flex gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  variant === v.id
                    ? 'bg-[#A996FF] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-[#A996FF]'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? '복사됨' : '텍스트 복사'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            {isGenerating ? '생성 중...' : '저장'}
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#A996FF] text-white rounded-xl font-medium hover:bg-[#9080E6] transition-colors disabled:opacity-50"
          >
            <Share2 size={18} />
            공유
          </button>
        </div>
      </div>
    </div>
  );
}
