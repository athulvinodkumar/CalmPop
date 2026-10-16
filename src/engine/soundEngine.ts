// Web Audio API Synthesizer - 100% Procedural Audio, 0 External Audio Files
// Enhanced for Mobile & Desktop: Unified master chain, iOS silent mode unlock, phone speaker EQ & polyphony limit.

export interface AudioVoice {
  id: number;
  stop: () => void;
  cleanup: () => void;
  startTime: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private mobileEQ: BiquadFilterNode | null = null;
  private silentAudioEl: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private activeVoices: AudioVoice[] = [];
  private maxPolyphony: number = 16;
  private nextVoiceId: number = 1;
  private stateListeners: Set<(isSuspended: boolean) => void> = new Set();
  private hasUnlocked: boolean = false;

  constructor() {
    // Default volume slightly higher on mobile (0.85) than desktop (0.75) for phone speaker clarity
    const isMobile = typeof window !== 'undefined' && (
      'ontouchstart' in window || 
      (navigator && navigator.maxTouchPoints > 0) || 
      (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches)
    );
    this.volume = isMobile ? 0.85 : 0.75;

    if (typeof window !== 'undefined') {
      this.setupGlobalUnlockListeners();
      this.setupVisibilityListener();
    }
  }

  /**
   * Initializes the shared AudioContext and master processing chain:
   * sources -> voiceGain -> masterGain -> mobileEQ -> DynamicsCompressor (limiter) -> destination
   */
  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      try {
        this.ctx = new AudioCtx();

        // 1. Master gain node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

        // 2. Mobile phone speaker compensation filter (+3.5 dB gentle peaking around 2.5 kHz)
        // Phone speakers have steep roll-offs below 200 Hz; lifting the 1-4 kHz presence band ensures clarity
        this.mobileEQ = this.ctx.createBiquadFilter();
        const isTouchOrMobile = (
          'ontouchstart' in window ||
          (navigator && navigator.maxTouchPoints > 0) ||
          (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches)
        );

        if (isTouchOrMobile) {
          this.mobileEQ.type = 'peaking';
          this.mobileEQ.frequency.setValueAtTime(2500, this.ctx.currentTime);
          this.mobileEQ.Q.setValueAtTime(1.0, this.ctx.currentTime);
          this.mobileEQ.gain.setValueAtTime(4.0, this.ctx.currentTime); // +4 dB boost in presence range
        } else {
          // Flat/transparent on desktop
          this.mobileEQ.type = 'peaking';
          this.mobileEQ.frequency.setValueAtTime(2500, this.ctx.currentTime);
          this.mobileEQ.Q.setValueAtTime(1.0, this.ctx.currentTime);
          this.mobileEQ.gain.setValueAtTime(0, this.ctx.currentTime);
        }

        // 3. DynamicsCompressorNode acting as a gentle brickwall limiter to prevent clipping at loud volumes
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-10, this.ctx.currentTime); // -10 dB threshold
        this.limiter.knee.setValueAtTime(8, this.ctx.currentTime);        // smooth transition
        this.limiter.ratio.setValueAtTime(8, this.ctx.currentTime);       // gentle limiting
        this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);  // 3ms attack
        this.limiter.release.setValueAtTime(0.18, this.ctx.currentTime);  // 180ms release

        // Connect master chain
        this.masterGain.connect(this.mobileEQ);
        this.mobileEQ.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);

        // State change listener for iOS interruptions / suspensions
        this.ctx.onstatechange = () => {
          this.notifyStateListeners();
          if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted')) {
            // Attempt auto-resume
            this.ctx.resume().catch(() => {});
          }
        };
      } catch (err) {
        console.warn('AudioContext initialization failed:', err);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Unlocks audio on first user gesture.
   * Handles both Web Audio API resume and iOS silent switch bypass.
   */
  public unlock(): void {
    const ctx = this.initContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.notifyStateListeners();
      }).catch(() => {});
    }

    this.enableIOSPlaybackMode();
    this.hasUnlocked = true;
    this.notifyStateListeners();
  }

  /**
   * iOS Silent Switch Bypass:
   * By default on iOS Safari, Web Audio is muted whenever the hardware silent/ringer switch is flipped.
   * We solve this via two mechanisms:
   * 1. Setting `navigator.audioSession.type = 'playback'` if available (WebKit AudioSession API).
   * 2. Starting a looping near-silent HTML5 <audio> element via a procedural 1s data-URI WAV.
   * This signals the iOS media server to treat the app as an active media player, routing Web Audio
   * through media speaker channels rather than the muted ringer channel.
   */
  private enableIOSPlaybackMode(): void {
    if (typeof window === 'undefined') return;

    try {
      // 1. Standard AudioSession API (Safari 15+)
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav.audioSession) {
        nav.audioSession.type = 'playback';
      }
    } catch {
      // Ignore if not supported
    }

    try {
      // 2. Invisible near-silent looping HTML5 audio fallback
      if (!this.silentAudioEl) {
        // Minimal valid 1-sample silent WAV data URI
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        const audio = new Audio(silentWav);
        audio.loop = true;
        audio.volume = 0.001; // barely above zero to ensure iOS media pipeline engagement
        this.silentAudioEl = audio;
      }
      this.silentAudioEl.play().catch(() => {
        // Ignore autoplay rejection before first gesture
      });
    } catch {
      // Audio element fallback catch
    }
  }

  private setupGlobalUnlockListeners(): void {
    const unlockHandler = () => {
      this.unlock();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('touchend', unlockHandler);
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('touchend', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
  }

  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab hidden: pause audio processing to save battery & avoid background noise
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
        if (this.silentAudioEl) {
          this.silentAudioEl.pause();
        }
      } else {
        // Tab restored: resume audio seamlessly
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.silentAudioEl && this.hasUnlocked) {
          this.silentAudioEl.play().catch(() => {});
        }
        this.notifyStateListeners();
      }
    });
  }

  public subscribeState(listener: (isSuspended: boolean) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.isSuspended());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyStateListeners(): void {
    const suspended = this.isSuspended();
    this.stateListeners.forEach((listener) => {
      try {
        listener(suspended);
      } catch {
        // Safe listener notification
      }
    });
  }

  public isSuspended(): boolean {
    if (!this.ctx) return true;
    return this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted';
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getMaxPolyphony(): number {
    return this.maxPolyphony;
  }

  public getActiveVoiceCount(): number {
    return this.activeVoices.length;
  }

  /**
   * Polyphony Limiter with voice stealing:
   * Keeps track of simultaneously playing voices. If count exceeds maxPolyphony,
   * terminates the oldest active voice and gracefully cleans up audio nodes.
   */
  private registerVoice(stop: () => void, cleanup: () => void): number {
    const id = this.nextVoiceId++;

    if (this.activeVoices.length >= this.maxPolyphony) {
      // Steal oldest voice
      const oldest = this.activeVoices.shift();
      if (oldest) {
        try {
          oldest.stop();
          oldest.cleanup();
        } catch {
          // Safe voice cleanup
        }
      }
    }

    const voice: AudioVoice = {
      id,
      stop,
      cleanup: () => {
        cleanup();
        this.activeVoices = this.activeVoices.filter((v) => v.id !== id);
      },
      startTime: Date.now()
    };

    this.activeVoices.push(voice);
    return id;
  }

  private unregisterVoice(id: number): void {
    const voice = this.activeVoices.find((v) => v.id === id);
    if (voice) {
      voice.cleanup();
    }
  }

  // ==========================================
  // PROCEDURAL SOUND GENERATORS (NORMALIZED)
  // ==========================================

  /**
   * 1. Bubble Pop: Snappy pitch sweep with soft resonant pop body
   * Normalized peak ~0.35 gain
   */
  public playBubblePop(pitchModifier = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      const baseFreq = (400 + Math.random() * 120) * pitchModifier;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.02);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { osc.stop(); } catch {}
        },
        () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      osc.onended = () => {
        this.unregisterVoice(voiceId);
      };

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Audio safety catch
    }
  }

  /**
   * 2. Water Drop / Ripple Pond:
   * Added higher droplet resonance (950Hz transient + 450Hz body) for phone clarity.
   */
  public playWaterDrop(pitchFactor = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      const startFreq = (580 + Math.random() * 90) * pitchFactor;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.6, now + 0.035);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.75, now + 0.22);

      // Audible harmonic pop for small phone speaker drivers
      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(startFreq * 2.1, now);
      oscHarmonic.frequency.exponentialRampToValueAtTime(startFreq * 1.2, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { osc.stop(); oscHarmonic.stop(); } catch {}
        },
        () => {
          try {
            osc.disconnect();
            oscHarmonic.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      osc.onended = () => {
        this.unregisterVoice(voiceId);
      };

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 0.28);
      oscHarmonic.stop(now + 0.12);
    } catch {
      // Audio safety
    }
  }

  /**
   * 3. Tibetan Singing Bowl / Breath Bloom:
   * Raised fundamental energy and added 2nd, 3rd, and 4th harmonics (330Hz, 495Hz, 660Hz)
   * so deep exhale tones (~165 Hz) are fully audible on small smartphone speakers without losing low warmth.
   */
  public playSingingBowl(freq = 220, duration = 4.0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      // Authentic singing bowl harmonic spectrum: fundamental + phone-audible overtones
      const harmonics = [1, 2.0, 2.76, 3.84, 5.4];
      const harmonicGains = [0.24, 0.18, 0.12, 0.06, 0.03];

      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      harmonics.forEach((ratio, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * ratio, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(harmonicGains[idx], now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        oscillators.push(osc);
        gains.push(gain);
      });

      const voiceId = this.registerVoice(
        () => {
          oscillators.forEach((osc) => {
            try { osc.stop(); } catch {}
          });
        },
        () => {
          oscillators.forEach((osc) => {
            try { osc.disconnect(); } catch {}
          });
          gains.forEach((g) => {
            try { g.disconnect(); } catch {}
          });
        }
      );

      if (oscillators[0]) {
        oscillators[0].onended = () => {
          this.unregisterVoice(voiceId);
        };
      }

      oscillators.forEach((osc) => {
        osc.start(now);
        osc.stop(now + duration + 0.05);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * 4. Paper Shred Tear Sound:
   * Multi-frequency crackle with bandpass tuned between 1.8kHz and 3.5kHz for crisp phone audibility.
   */
  public playPaperShred() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200 + Math.random() * 600, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.2, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { noise.stop(); } catch {}
        },
        () => {
          try {
            noise.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      noise.onended = () => {
        this.unregisterVoice(voiceId);
      };

      noise.start(now);
      noise.stop(now + 0.13);
    } catch {
      // Audio safety
    }
  }

  /**
   * 5. Calm Keys: Pure Bell tones (C Major Diatonic with F & B, or Pentatonic)
   * Warm fundamental + soft triangle overtone shimmer
   */
  public playCalmKeyNote(noteIndex: number, scaleType: 'diatonic' | 'pentatonic' | 'extended' = 'diatonic', octave = 4) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      // Pentatonic: C4, D4, E4, G4, A4, C5, D5, E5
      const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      // Full Diatonic C Major scale: C4, D4, E4, F4 (349.23), G4, A4, B4 (493.88), C5, D5, E5
      const diatonicScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];

      const scale = scaleType === 'pentatonic' ? pentatonicScale : diatonicScale;
      const freq = (scale[noteIndex % scale.length] || 261.63) * Math.pow(2, octave - 4);
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.002, now); // shimmer harmonic

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { osc1.stop(); osc2.stop(); } catch {}
        },
        () => {
          try {
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      osc1.onended = () => {
        this.unregisterVoice(voiceId);
      };

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.45);
      osc2.stop(now + 1.45);
    } catch {
      // Audio safety
    }
  }

  public playPentatonicNote(noteIndex: number, octave = 4) {
    this.playCalmKeyNote(noteIndex, 'pentatonic', octave);
  }

  /**
   * 6. Star Chime: Ethereal celestial sparkle (850-1400 Hz)
   */
  public playStarChime(pitchMultiplier = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const baseFreq = (820 + Math.random() * 220) * pitchMultiplier;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const oscSparkle = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.04, now + 0.05);

      oscSparkle.type = 'triangle';
      oscSparkle.frequency.setValueAtTime(baseFreq * 2.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      oscSparkle.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { osc.stop(); oscSparkle.stop(); } catch {}
        },
        () => {
          try {
            osc.disconnect();
            oscSparkle.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      osc.onended = () => {
        this.unregisterVoice(voiceId);
      };

      osc.start(now);
      oscSparkle.start(now);
      osc.stop(now + 0.9);
      oscSparkle.stop(now + 0.4);
    } catch {
      // Audio safety
    }
  }

  /**
   * 7. Tactile Tile Click: Gentle marimba wooden tap for Color Fill
   */
  public playTileClick(pitch = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(220 * pitch, now + 0.05);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { osc.stop(); } catch {}
        },
        () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      osc.onended = () => {
        this.unregisterVoice(voiceId);
      };

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio safety
    }
  }

  /**
   * 8. Sand Rake Whispering sound (Zen Sand):
   * Boosted mid-high friction frequencies (1.8 kHz - 3.8 kHz) with dual-filtered noise
   * so the whisper is clearly audible on phone speakers.
   */
  public playSandRake() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      const voiceId = this.registerVoice(
        () => {
          try { noise.stop(); } catch {}
        },
        () => {
          try {
            noise.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch {}
        }
      );

      noise.onended = () => {
        this.unregisterVoice(voiceId);
      };

      noise.start(now);
      noise.stop(now + 0.09);
    } catch {
      // Audio safety
    }
  }

  /**
   * 9. Uplifting Result Chord: F Major 7th (Calm & Peaceful)
   */
  public playSuccessChord() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const notes = [349.23, 440.00, 523.25, 659.25]; // F4, A4, C5, E5
      const now = this.ctx.currentTime;

      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        oscillators.push(osc);
        gains.push(gain);
      });

      const voiceId = this.registerVoice(
        () => {
          oscillators.forEach((osc) => {
            try { osc.stop(); } catch {}
          });
        },
        () => {
          oscillators.forEach((osc) => {
            try { osc.disconnect(); } catch {}
          });
          gains.forEach((g) => {
            try { g.disconnect(); } catch {}
          });
        }
      );

      if (oscillators[0]) {
        oscillators[0].onended = () => {
          this.unregisterVoice(voiceId);
        };
      }

      oscillators.forEach((osc, idx) => {
        osc.start(now + idx * 0.05);
        osc.stop(now + 1.9);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * 10. Sound Test Chime: Short soothing 3-tone arpeggio (C5 -> E5 -> G5)
   * Used for the Settings "Sound test" button.
   */
  public playChimeTest() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.7);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.75);
      });
    } catch {
      // Audio safety
    }
  }
}

export const soundEngine = new SoundEngine();
