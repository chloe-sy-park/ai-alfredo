/**
 * 공유 서비스
 * 이미지 생성 및 Web Share API 지원
 */

export interface ShareData {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}

/**
 * Web Share API 지원 여부 확인
 */
export function isShareSupported(): boolean {
  return !!navigator.share;
}

/**
 * 파일 공유 지원 여부 확인
 */
export function isFileShareSupported(): boolean {
  return !!navigator.canShare;
}

/**
 * 공유하기
 */
export async function share(data: ShareData): Promise<boolean> {
  if (!isShareSupported()) {
    // 공유 API가 없으면 클립보드에 복사
    await copyToClipboard(`${data.title}\n${data.text}${data.url ? '\n' + data.url : ''}`);
    return false;
  }

  try {
    // 파일이 있고 파일 공유가 지원되면 파일과 함께 공유
    if (data.files && data.files.length > 0 && isFileShareSupported()) {
      const shareData = {
        title: data.title,
        text: data.text,
        files: data.files,
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    }

    // 파일 없이 텍스트/URL만 공유
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // 사용자가 공유를 취소함
      return false;
    }
    throw error;
  }
}

/**
 * 클립보드에 복사
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * 이미지 다운로드
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Data URL을 File로 변환
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * HTML 요소를 캔버스로 변환 (간단한 구현)
 * 복잡한 스타일은 html2canvas 라이브러리 권장
 */
export async function elementToCanvas(
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    scale?: number;
    padding?: number;
  } = {}
): Promise<HTMLCanvasElement> {
  const { backgroundColor = '#ffffff', scale = 2, padding = 0 } = options;

  const rect = element.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = (rect.width + padding * 2) * scale;
  canvas.height = (rect.height + padding * 2) * scale;

  // 배경색
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  // foreignObject를 사용한 HTML 렌더링
  const serializer = new XMLSerializer();
  const html = serializer.serializeToString(element);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${html}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, padding, padding);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 간단한 이미지 캡처 (CSS 스타일 유지 어려움 - html2canvas 권장)
 */
export async function captureElement(element: HTMLElement): Promise<string> {
  // html2canvas 라이브러리 사용 시:
  // const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  // return canvas.toDataURL('image/png');

  // 기본 구현 (제한적)
  const canvas = await elementToCanvas(element);
  return canvas.toDataURL('image/png');
}
