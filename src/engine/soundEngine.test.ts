import { describe, it, expect, beforeEach, vi } from 'vitest';
import { soundEngine } from './soundEngine';

// Mock Web Audio API for Node / CI environment
class MockAudioParam {
  value: number = 1;
  setValueAtTime = vi.fn((val: number) => { this.value = val; });
  linearRampToValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = new MockAudioParam();
  onended: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => {
    if (this.onended) this.onended();
  });
}

class MockBiquadFilterNode extends MockAudioNode {
  type = 'peaking';
  frequency = new MockAudioParam();
  Q = new MockAudioParam();
  gain = new MockAudioParam();
}

class MockDynamicsCompressorNode extends MockAudioNode {
  threshold = new MockAudioParam();
  knee = new MockAudioParam();
  ratio = new MockAudioParam();
  attack = new MockAudioParam();
  release = new MockAudioParam();
}

class MockAudioContext {
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  currentTime: number = 0;
  sampleRate: number = 44100;
  destination = new MockAudioNode();
  onstatechange: (() => void) | null = null;

  resume = vi.fn().mockImplementation(() => {
    this.state = 'running';
    if (this.onstatechange) this.onstatechange();
    return Promise.resolve();
  });

  suspend = vi.fn().mockImplementation(() => {
    this.state = 'suspended';
    if (this.onstatechange) this.onstatechange();
    return Promise.resolve();
  });

  createGain = vi.fn(() => new MockGainNode());
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  createDynamicsCompressor = vi.fn(() => new MockDynamicsCompressorNode());
  createBuffer = vi.fn(() => ({
    getChannelData: () => new Float32Array(1024)
  }));
  createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null
  }));
}

describe('soundEngine audio manager', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      AudioContext: MockAudioContext,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });

    try {
      Object.defineProperty(globalThis, 'navigator', {
        value: { maxTouchPoints: 0, audioSession: { type: 'ambient' } },
        writable: true,
        configurable: true
      });
    } catch {}

    vi.stubGlobal('Audio', class {
      loop = false;
      volume = 1;
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
    });

    soundEngine.setMuted(false);
    soundEngine.setVolume(0.8);
  });

  it('clamps volume values strictly between 0.0 and 1.0', () => {
    soundEngine.setVolume(1.5);
    expect(soundEngine.getVolume()).toBe(1.0);

    soundEngine.setVolume(-0.4);
    expect(soundEngine.getVolume()).toBe(0.0);

    soundEngine.setVolume(0.65);
    expect(soundEngine.getVolume()).toBe(0.65);
  });

  it('tracks muted state accurately', () => {
    soundEngine.setMuted(true);
    expect(soundEngine.getMuted()).toBe(true);

    soundEngine.setMuted(false);
    expect(soundEngine.getMuted()).toBe(false);
  });

  it('initializes context and resumes on unlock', async () => {
    const ctx = soundEngine.initContext();
    expect(ctx).not.toBeNull();

    soundEngine.unlock();
    // unlock calls resume on the AudioContext
    expect(soundEngine.isSuspended()).toBe(false);
  });

  it('limits polyphony to maximum 16 concurrent voices', () => {
    soundEngine.initContext();
    expect(soundEngine.getMaxPolyphony()).toBe(16);

    // Trigger multiple sounds simultaneously
    for (let i = 0; i < 24; i++) {
      soundEngine.playBubblePop(1.0);
    }

    // Active voices should never exceed 16
    expect(soundEngine.getActiveVoiceCount()).toBeLessThanOrEqual(16);
  });

  it('plays the sound test chime without errors', () => {
    expect(() => {
      soundEngine.playChimeTest();
    }).not.toThrow();
  });
});
