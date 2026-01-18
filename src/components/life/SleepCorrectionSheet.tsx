/**
 * SleepCorrectionSheet
 *
 * 수면 시간 정정을 위한 바텀시트
 * - 잠든 시간 / 일어난 시간 피커
 * - "그럼 이렇게 이해할게요" 톤
 * - CTA: "이렇게 기억해줘"
 */

import { useState, useEffect } from 'react';
import BottomSheet from '../bottom-sheet/BottomSheet';
import { useLifeOSStore, SleepCorrection } from '../../stores/lifeOSStore';

interface SleepCorrectionSheetProps {
  open: boolean;
  date: string;
  initialBedtimeTs?: string | null;
  initialWaketimeTs?: string | null;
  onClose: () => void;
  onSubmit?: (data: SleepCorrection) => void;
}

// Helper: ISO string에서 HH:MM 추출
function getTimeFromISO(isoString: string | null | undefined): string {
  if (!isoString) {
    // 기본값: 전날 밤 11시 / 오늘 아침 7시
    return '';
  }
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper: 날짜와 시간 문자열로 ISO string 생성
function createTimestamp(dateStr: string, timeStr: string, isNextDay: boolean = false): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);

  // 새벽 시간(0-5시)이면 다음 날로 처리
  if (hours >= 0 && hours < 6 && !isNextDay) {
    // bedtime이 새벽이면 전날로 처리하지 않음 (사용자가 선택한 그대로)
  }

  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

// 시간 옵션 생성 (15분 단위)
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export default function SleepCorrectionSheet({
  open,
  date,
  initialBedtimeTs,
  initialWaketimeTs,
  onClose,
  onSubmit,
}: SleepCorrectionSheetProps) {
  const { correctSleep, sleepLoading } = useLifeOSStore();

  // 초기값 설정
  const [bedtime, setBedtime] = useState('23:00');
  const [waketime, setWaketime] = useState('07:00');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setBedtime(getTimeFromISO(initialBedtimeTs) || '23:00');
      setWaketime(getTimeFromISO(initialWaketimeTs) || '07:00');
      setError(null);
    }
  }, [open, initialBedtimeTs, initialWaketimeTs]);

  // 수면 시간 계산
  const calculateDuration = (): number => {
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = waketime.split(':').map(Number);

    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    // cross-midnight 처리
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return wakeMinutes - bedMinutes;
  };

  const duration = calculateDuration();
  const durationHours = Math.floor(duration / 60);
  const durationMins = duration % 60;

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (duration <= 0) {
      setError('일어난 시간은 잠든 시간 이후여야 해요');
      return;
    }

    // 전날 날짜 계산 (bedtime용)
    const bedDate = new Date(date);
    bedDate.setDate(bedDate.getDate() - 1);
    const bedDateStr = bedDate.toISOString().split('T')[0];

    // bedtime이 저녁(18시 이후)이면 전날, 아니면 당일
    const [bedH] = bedtime.split(':').map(Number);
    const actualBedDate = bedH >= 18 ? bedDateStr : date;

    const correction: SleepCorrection = {
      date,
      bedtimeTs: createTimestamp(actualBedDate, bedtime),
      waketimeTs: createTimestamp(date, waketime),
    };

    try {
      if (onSubmit) {
        await onSubmit(correction);
      } else {
        await correctSleep(correction);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했어요');
    }
  };

  return (
    <BottomSheet isOpen={open} onClose={onClose} height="half">
      <div className="pt-2">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            그럼 이렇게 이해할게요
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            수면 시간을 정정해 주세요
          </p>
        </div>

        {/* 시간 선택 */}
        <div className="space-y-4 mb-6">
          {/* 잠든 시간 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              잠든 시간
            </label>
            <select
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--text-primary)',
                border: 'none',
              }}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={`bed-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* 일어난 시간 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              일어난 시간
            </label>
            <select
              value={waketime}
              onChange={(e) => setWaketime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--text-primary)',
                border: 'none',
              }}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={`wake-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 수면 시간 미리보기 */}
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            약{' '}
          </span>
          <span className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {durationHours}시간 {durationMins > 0 ? `${durationMins}분` : ''}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {' '}수면
          </span>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-center mb-4">
            <span className="text-sm text-red-500">{error}</span>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={sleepLoading || duration <= 0}
          className="w-full py-3.5 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {sleepLoading ? '저장 중...' : '이렇게 기억해줘'}
        </button>
      </div>
    </BottomSheet>
  );
}
