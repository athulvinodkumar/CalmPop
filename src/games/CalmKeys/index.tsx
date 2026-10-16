import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

export type ScaleMode = 'diatonic' | 'extended' | 'pentatonic';

interface KeyConfig {
  index: number;
  note: string;
  name: string;
  keyLabel: string;
  color: string;
  bgGradient: string;
  glow: string;
  isSpecialKey?: boolean; // Highlight F and B keys
}

// 1. C Major Diatonic (8 Keys: C4, D4, E4, F4, G4, A4, B4, C5) - with F & B keys
const DIATONIC_KEYS: KeyConfig[] = [
  { index: 0, note: 'C4', name: 'Root', keyLabel: '1 / A', color: '#38bdf8', bgGradient: 'from-sky-500/30 to-blue-600/20', glow: 'rgba(56, 189, 248, 0.4)' },
  { index: 1, note: 'D4', name: 'Second', keyLabel: '2 / S', color: '#2dd4bf', bgGradient: 'from-teal-500/30 to-emerald-600/20', glow: 'rgba(45, 212, 191, 0.4)' },
  { index: 2, note: 'E4', name: 'Third', keyLabel: '3 / D', color: '#34d399', bgGradient: 'from-emerald-500/30 to-green-600/20', glow: 'rgba(52, 211, 153, 0.4)' },
  { index: 3, note: 'F4', name: 'Fourth', keyLabel: '4 / F', color: '#4ade80', bgGradient: 'from-green-500/30 to-emerald-600/20', glow: 'rgba(74, 222, 128, 0.5)', isSpecialKey: true },
  { index: 4, note: 'G4', name: 'Fifth', keyLabel: '5 / G', color: '#fbbf24', bgGradient: 'from-amber-500/30 to-yellow-600/20', glow: 'rgba(251, 191, 36, 0.4)' },
  { index: 5, note: 'A4', name: 'Sixth', keyLabel: '6 / H', color: '#f472b6', bgGradient: 'from-pink-500/30 to-rose-600/20', glow: 'rgba(244, 114, 182, 0.4)' },
  { index: 6, note: 'B4', name: 'Seventh', keyLabel: '7 / J (B)', color: '#a855f7', bgGradient: 'from-purple-500/30 to-indigo-600/20', glow: 'rgba(168, 85, 247, 0.5)', isSpecialKey: true },
  { index: 7, note: 'C5', name: 'Octave', keyLabel: '8 / K', color: '#818cf8', bgGradient: 'from-indigo-500/30 to-blue-600/20', glow: 'rgba(129, 140, 248, 0.4)' },
];

// 2. Extended C Major (10 Keys: C4 to E5) - includes F4, B4, C5, D5, E5
const EXTENDED_KEYS: KeyConfig[] = [
  ...DIATONIC_KEYS,
  { index: 8, note: 'D5', name: 'High 2nd', keyLabel: '9 / L', color: '#6366f1', bgGradient: 'from-indigo-400/30 to-blue-600/20', glow: 'rgba(99, 102, 241, 0.4)' },
  { index: 9, note: 'E5', name: 'High 3rd', keyLabel: '0 / ;', color: '#38bdf8', bgGradient: 'from-sky-400/30 to-indigo-500/20', glow: 'rgba(56, 189, 248, 0.4)' },
];

// 3. Pentatonic (5-Tone Scale)
const PENTATONIC_KEYS: KeyConfig[] = [
  { index: 0, note: 'C4', name: 'Root', keyLabel: '1 / A', color: '#38bdf8', bgGradient: 'from-sky-500/30 to-blue-600/20', glow: 'rgba(56, 189, 248, 0.4)' },
  { index: 1, note: 'D4', name: 'Second', keyLabel: '2 / S', color: '#2dd4bf', bgGradient: 'from-teal-500/30 to-emerald-600/20', glow: 'rgba(45, 212, 191, 0.4)' },
  { index: 2, note: 'E4', name: 'Third', keyLabel: '3 / D', color: '#34d399', bgGradient: 'from-emerald-500/30 to-green-600/20', glow: 'rgba(52, 211, 153, 0.4)' },
  { index: 3, note: 'G4', name: 'Fifth', keyLabel: '4 / F', color: '#fbbf24', bgGradient: 'from-amber-500/30 to-yellow-600/20', glow: 'rgba(251, 191, 36, 0.4)' },
  { index: 4, note: 'A4', name: 'Sixth', keyLabel: '5 / G', color: '#f472b6', bgGradient: 'from-pink-500/30 to-rose-600/20', glow: 'rgba(244, 114, 182, 0.4)' },
  { index: 5, note: 'C5', name: 'Octave', keyLabel: '6 / H', color: '#c084fc', bgGradient: 'from-purple-500/30 to-violet-600/20', glow: 'rgba(192, 132, 252, 0.4)' },
  { index: 6, note: 'D5', name: 'High 2nd', keyLabel: '7 / J', color: '#818cf8', bgGradient: 'from-indigo-500/30 to-blue-600/20', glow: 'rgba(129, 140, 248, 0.4)' },
  { index: 7, note: 'E5', name: 'High 3rd', keyLabel: '8 / K', color: '#38bdf8', bgGradient: 'from-sky-400/30 to-indigo-500/20', glow: 'rgba(56, 189, 248, 0.4)' },
];

export const CalmKeysGame: React.FC = () => {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('diatonic');
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [notesPlayedCount, setNotesPlayedCount] = useState(0);
  const lastTouchedKeyRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  const currentKeys = scaleMode === 'extended' 
    ? EXTENDED_KEYS 
    : scaleMode === 'pentatonic' 
    ? PENTATONIC_KEYS 
    : DIATONIC_KEYS;

  const playKey = (index: number) => {
    soundEngine.playCalmKeyNote(index, scaleMode === 'pentatonic' ? 'pentatonic' : 'diatonic', 4);
    setActiveKey(index);
    setNotesPlayedCount((c) => c + 1);

    setTimeout(() => {
      setActiveKey((curr) => (curr === index ? null : curr));
    }, 350);
  };

  const handlePointerDown = (index: number) => {
    isPointerDownRef.current = true;
    lastTouchedKeyRef.current = index;
    playKey(index);
  };

  const handlePointerEnter = (index: number) => {
    if (isPointerDownRef.current && lastTouchedKeyRef.current !== index) {
      lastTouchedKeyRef.current = index;
      playKey(index);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const keyElem = element?.closest('[data-calm-key]');
      if (keyElem) {
        const keyIndexStr = keyElem.getAttribute('data-calm-key');
        if (keyIndexStr !== null) {
          const idx = parseInt(keyIndexStr, 10);
          if (!isNaN(idx) && lastTouchedKeyRef.current !== idx) {
            lastTouchedKeyRef.current = idx;
            playKey(idx);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    lastTouchedKeyRef.current = null;
  };

  useEffect(() => {
    const handleUp = () => {
      isPointerDownRef.current = false;
      lastTouchedKeyRef.current = null;
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, []);

  // Keyboard navigation supporting both number keys and letter keys (including 'F' and 'B')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();

      let targetIndex: number | undefined;

      if (scaleMode === 'diatonic' || scaleMode === 'extended') {
        const diatonicMap: Record<string, number> = {
          '1': 0, 'a': 0,
          '2': 1, 's': 1,
          '3': 2, 'd': 2,
          '4': 3, 'f': 3, // F key explicitly plays F4!
          '5': 4, 'g': 4,
          '6': 5, 'h': 5,
          '7': 6, 'j': 6, 'b': 6, // B key explicitly plays B4!
          '8': 7, 'k': 7,
          '9': 8, 'l': 8,
          '0': 9, ';': 9, 'p': 9
        };
        targetIndex = diatonicMap[k];
      } else {
        const pentatonicMap: Record<string, number> = {
          '1': 0, 'a': 0,
          '2': 1, 's': 1,
          '3': 2, 'd': 2,
          '4': 3, 'f': 3,
          '5': 4, 'g': 4,
          '6': 5, 'h': 5,
          '7': 6, 'j': 6, 'b': 6,
          '8': 7, 'k': 7
        };
        targetIndex = pentatonicMap[k];
      }

      if (targetIndex !== undefined && targetIndex < currentKeys.length) {
        playKey(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scaleMode, currentKeys.length]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-2 sm:p-5 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950 select-none touch-none">
      {/* Top Bar: Scale Mode Selector & Notes Counter */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 rounded-2xl bg-indigo-950/40 backdrop-blur-md border border-indigo-500/20 text-xs text-indigo-200">
        <div className="flex items-center gap-1.5 font-medium">
          <Music className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Scale:</span>
        </div>

        {/* Scale Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-indigo-500/30 text-[11px]">
          <button
            type="button"
            onClick={() => setScaleMode('diatonic')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              scaleMode === 'diatonic'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-xs'
                : 'text-indigo-300 hover:text-white'
            }`}
            title="C Major scale with F and B keys (8 Notes)"
          >
            <span>C Major (with F & B)</span>
          </button>

          <button
            type="button"
            onClick={() => setScaleMode('extended')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              scaleMode === 'extended'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-xs'
                : 'text-indigo-300 hover:text-white'
            }`}
            title="Extended 10-Key scale (C4 to E5)"
          >
            <span>Extended (10 Keys)</span>
          </button>

          <button
            type="button"
            onClick={() => setScaleMode('pentatonic')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
              scaleMode === 'pentatonic'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-xs'
                : 'text-indigo-300 hover:text-white'
            }`}
            title="Tranquil Pentatonic scale"
          >
            <span>Pentatonic</span>
          </button>
        </div>

        <span className="text-indigo-500/40 hidden sm:inline">•</span>
        <span className="text-[11px] sm:text-xs">
          Notes Strummed: <strong className="text-white font-mono">{notesPlayedCount}</strong>
        </span>
      </div>

      {/* Chime Bars Instrument Container */}
      <div className="flex-1 w-full max-w-3xl flex items-center justify-center py-2 sm:py-4 px-1">
        <div
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
          className={`w-full h-full max-h-[380px] grid ${
            scaleMode === 'extended' ? 'grid-cols-10 gap-1 sm:gap-2' : 'grid-cols-8 gap-1 sm:gap-2.5'
          } p-2 sm:p-4 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-indigo-500/20 shadow-2xl select-none`}
        >
          {currentKeys.map((k) => {
            const isActive = activeKey === k.index;
            return (
              <button
                key={`${scaleMode}-${k.index}`}
                type="button"
                data-calm-key={k.index}
                onPointerDown={() => handlePointerDown(k.index)}
                onPointerEnter={() => handlePointerEnter(k.index)}
                aria-label={`Calm Key ${k.note} (${k.name})`}
                className={`relative h-full rounded-xl sm:rounded-2xl border transition-all duration-150 flex flex-col items-center justify-between py-2 sm:py-3 px-1 select-none cursor-pointer focus:outline-none touch-none ${
                  isActive
                    ? 'border-white scale-98 shadow-lg z-10'
                    : k.isSpecialKey
                    ? 'border-teal-500/40 hover:border-teal-400 bg-slate-800/60 active:bg-slate-700/80 ring-1 ring-teal-500/20'
                    : 'border-slate-700/60 hover:border-slate-500 bg-slate-800/40 active:bg-slate-700/60'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(to bottom, ${k.color}, rgba(15, 23, 42, 0.85))`
                    : undefined,
                  boxShadow: isActive ? `0 0 32px ${k.glow}` : undefined
                }}
              >
                {/* Note Indicator Top with subtle highlight badge for F & B */}
                <div className="flex flex-col items-center">
                  <span className={`text-[12px] sm:text-base font-extrabold tracking-wide ${
                    k.isSpecialKey ? 'text-teal-300' : 'text-white'
                  }`}>
                    {k.note}
                  </span>
                  <span className="text-[9px] text-slate-400/80 hidden sm:block font-medium">
                    {k.name}
                  </span>
                </div>

                {/* Sound wave ripple indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-6 h-6 sm:w-9 sm:h-9 rounded-full border-2 border-white/90"
                  />
                )}

                {/* Key Label Bottom */}
                <div className="text-center w-full">
                  <span className="text-[9px] sm:text-[11px] text-slate-300/80 font-mono block whitespace-nowrap overflow-hidden text-ellipsis px-0.5">
                    {k.keyLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center gap-2 text-xs text-indigo-200/70 text-center pb-1">
        <span>Tap, click, or slide across keys. Press keyboard keys (including <strong>F</strong> and <strong>B</strong>) to play.</span>
      </div>
    </div>
  );
};
