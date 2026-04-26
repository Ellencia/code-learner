type SoundType = 'correct' | 'wrong' | 'goal';

const NOTES: Record<SoundType, { freq: number; start: number; dur: number }[]> = {
  correct: [
    { freq: 523, start: 0,    dur: 0.12 },
    { freq: 659, start: 0.1,  dur: 0.12 },
    { freq: 784, start: 0.2,  dur: 0.2  },
  ],
  wrong: [
    { freq: 220, start: 0,    dur: 0.35 },
    { freq: 196, start: 0.1,  dur: 0.3  },
  ],
  goal: [
    { freq: 523,  start: 0,    dur: 0.12 },
    { freq: 659,  start: 0.1,  dur: 0.12 },
    { freq: 784,  start: 0.2,  dur: 0.12 },
    { freq: 1047, start: 0.35, dur: 0.35 },
  ],
};

export function playSound(type: SoundType, enabled: boolean) {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    NOTES[type].forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type === 'wrong' ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.01);
    });
  } catch {
    // Web Audio API 미지원 환경 무시
  }
}
