// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Audio System
// Uses WebAudio oscillator for sound effects.
// No audio files required.
// ============================================================

export class AudioSystem {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static muted: boolean = false;

  static init(): void {
    try {
      AudioSystem.ctx = new AudioContext();
      AudioSystem.masterGain = AudioSystem.ctx.createGain();
      AudioSystem.masterGain.gain.value = 0.3;
      AudioSystem.masterGain.connect(AudioSystem.ctx.destination);
    } catch {
      console.warn('[AudioSystem] WebAudio not available');
    }
  }

  static unlock(): void {
    if (AudioSystem.ctx && AudioSystem.ctx.state === 'suspended') {
      AudioSystem.ctx.resume().catch(() => {});
    }
  }

  static setMuted(muted: boolean): void {
    AudioSystem.muted = muted;
    if (AudioSystem.masterGain) {
      AudioSystem.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }

  static isMuted(): boolean {
    return AudioSystem.muted;
  }

  private static playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.15,
    delay: number = 0
  ): void {
    if (!AudioSystem.ctx || !AudioSystem.masterGain || AudioSystem.muted) return;
    try {
      const osc = AudioSystem.ctx.createOscillator();
      const gain = AudioSystem.ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, AudioSystem.ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(AudioSystem.masterGain);
      osc.start(AudioSystem.ctx.currentTime + delay);
      osc.stop(AudioSystem.ctx.currentTime + delay + duration);
    } catch {
      // Silently fail
    }
  }

  static playJump(): void {
    AudioSystem.playTone(320, 0.08, 'square', 0.12);
    AudioSystem.playTone(480, 0.06, 'square', 0.1, 0.06);
  }

  static playAttack(): void {
    AudioSystem.playTone(180, 0.06, 'sawtooth', 0.15);
    AudioSystem.playTone(120, 0.08, 'sawtooth', 0.1, 0.04);
  }

  static playAbility(): void {
    AudioSystem.playTone(440, 0.1, 'sine', 0.18);
    AudioSystem.playTone(660, 0.1, 'sine', 0.15, 0.08);
    AudioSystem.playTone(880, 0.15, 'sine', 0.12, 0.14);
  }

  static playHurt(): void {
    AudioSystem.playTone(160, 0.15, 'sawtooth', 0.2);
  }

  static playDeath(): void {
    AudioSystem.playTone(200, 0.1, 'sawtooth', 0.18);
    AudioSystem.playTone(150, 0.1, 'sawtooth', 0.15, 0.1);
    AudioSystem.playTone(100, 0.2, 'sawtooth', 0.12, 0.18);
  }

  static playCollectToken(): void {
    AudioSystem.playTone(660, 0.06, 'square', 0.1);
    AudioSystem.playTone(880, 0.06, 'square', 0.08, 0.05);
  }

  static playCollectItem(): void {
    AudioSystem.playTone(528, 0.12, 'sine', 0.15);
    AudioSystem.playTone(660, 0.1, 'sine', 0.12, 0.1);
    AudioSystem.playTone(792, 0.12, 'sine', 0.1, 0.18);
  }

  static playCheckpoint(): void {
    AudioSystem.playTone(528, 0.15, 'sine', 0.2);
    AudioSystem.playTone(660, 0.15, 'sine', 0.18, 0.15);
    AudioSystem.playTone(792, 0.2, 'sine', 0.15, 0.28);
  }

  static playBossHit(): void {
    AudioSystem.playTone(100, 0.12, 'sawtooth', 0.25);
    AudioSystem.playTone(80, 0.15, 'sawtooth', 0.2, 0.1);
  }

  static playVictory(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      AudioSystem.playTone(freq, 0.25, 'sine', 0.2, i * 0.18);
    });
  }

  static playGameOver(): void {
    AudioSystem.playTone(220, 0.2, 'sawtooth', 0.2);
    AudioSystem.playTone(180, 0.2, 'sawtooth', 0.18, 0.2);
    AudioSystem.playTone(130, 0.35, 'sawtooth', 0.15, 0.38);
  }

  static playMenuSelect(): void {
    AudioSystem.playTone(440, 0.06, 'square', 0.1);
    AudioSystem.playTone(550, 0.05, 'square', 0.08, 0.05);
  }

  static playEnemyDeath(): void {
    AudioSystem.playTone(200, 0.04, 'sawtooth', 0.12);
    AudioSystem.playTone(140, 0.08, 'sawtooth', 0.1, 0.03);
  }

  static playLand(): void {
    AudioSystem.playTone(60, 0.04, 'square', 0.08);
  }
}
