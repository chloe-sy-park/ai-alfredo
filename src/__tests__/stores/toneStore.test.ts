/**
 * toneStore 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useToneStore } from '../../stores/toneStore';

describe('toneStore', () => {
  beforeEach(() => {
    // 스토어 상태 초기화
    useToneStore.setState({
      preset: 'friendly',
      axes: {
        warmth: 5,
        proactivity: 3,
        directness: 2,
        humor: 4,
        pressure: 1,
      },
      customized: false,
    });
  });

  it('should change preset correctly', () => {
    const { setPreset } = useToneStore.getState();
    setPreset('butler');

    const { preset } = useToneStore.getState();
    expect(preset).toBe('butler');
  });

  it('should return message for greeting', () => {
    const { getMessage } = useToneStore.getState();
    const greeting = getMessage('greeting', 'morning');

    expect(greeting).toBeDefined();
    expect(typeof greeting).toBe('string');
    expect(greeting.length).toBeGreaterThan(0);
  });

  it('should return different messages for different presets', () => {
    const { getMessage, setPreset } = useToneStore.getState();

    // friendly 프리셋의 인사말
    const friendlyGreeting = getMessage('greeting', 'morning');

    // butler 프리셋으로 변경
    setPreset('butler');
    const butlerGreeting = useToneStore.getState().getMessage('greeting', 'morning');

    // 두 메시지가 다른지 확인 (프리셋별 차별화)
    expect(friendlyGreeting).not.toBe(butlerGreeting);
  });

  it('should determine emoji usage based on preset', () => {
    const { shouldUseEmoji, setPreset } = useToneStore.getState();

    // friendly는 이모지 사용
    expect(shouldUseEmoji()).toBe(true);

    // butler로 변경 - 이모지 미사용
    setPreset('butler');
    expect(useToneStore.getState().shouldUseEmoji()).toBe(false);
  });

  it('should update individual axis values', () => {
    const { setAxis } = useToneStore.getState();

    setAxis('warmth', 3);

    const { axes } = useToneStore.getState();
    expect(axes.warmth).toBe(3);
  });

  it('should clamp axis values between 1 and 5', () => {
    const { setAxis } = useToneStore.getState();

    // 범위 초과 값 테스트
    setAxis('warmth', 10);
    expect(useToneStore.getState().axes.warmth).toBeLessThanOrEqual(5);

    setAxis('warmth', 0);
    expect(useToneStore.getState().axes.warmth).toBeGreaterThanOrEqual(1);
  });

  it('should mark as customized when axis is changed', () => {
    const { setAxis } = useToneStore.getState();

    expect(useToneStore.getState().customized).toBe(false);

    setAxis('warmth', 3);

    expect(useToneStore.getState().customized).toBe(true);
  });

  it('should reset customized flag when preset is changed', () => {
    const { setAxis, setPreset } = useToneStore.getState();

    // 축 수정으로 customized 설정
    setAxis('warmth', 3);
    expect(useToneStore.getState().customized).toBe(true);

    // 프리셋 변경으로 customized 리셋
    setPreset('coach');
    expect(useToneStore.getState().customized).toBe(false);
  });
});
