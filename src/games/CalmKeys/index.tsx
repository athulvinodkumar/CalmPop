import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

interface KeyConfig {
  index: number;
  note: string;
  name: string;
  keyLabel: string;
  color: string;
  bgGradient: string;
  glow: string;
}

const KEYS: KeyConfig[] = [
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
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [notesPlayedCount, setNotesPlayedCount] = useState(0);
  const lastTouchedKeyRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  const playKey = (index: number) => {
    soundEngine.playPentatonicNote(index, 4);
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

  // Keyboard navigation
  useEffect(() => {
    const keyMap: Record<string, number> = {
      '1': 0, 'a': 0, 'A': 0,
      '2': 1, 's': 1, 'S': 1,
      '3': 2, 'd': 2, 'D': 2,
      '4': 3, 'f': 3, 'F': 3,
      '5': 4, 'g': 4, 'G': 4,
      '6': 5, 'h': 5, 'H': 5,
      '7': 6, 'j': 6, 'J': 6,
      '8': 7, 'k': 7, 'K': 7,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (keyMap[e.key] !== undefined) {
        playKey(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-6 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950 select-none">
      {/* Top Info Bar */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-950/40 backdrop-blur-md border border-indigo-500/20 text-xs text-indigo-200">
        <Music className="w-4 h-4 text-indigo-400" />
        <span>Harmonic Pentatonic Scale</span>
        <span className="text-indigo-500/40">•</span>
        <span>Notes Strummed: <strong className="text-white font-mono">{notesPlayedCount}</strong></span>
      </div>

      {/* Chime Bars Instrument Container */}
      <div className="flex-1 w-full max-w-2xl flex items-center justify-center py-2 sm:py-4">
        <div
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
          className="w-full h-full max-h-96 grid grid-cols-8 gap-1 sm:gap-3 p-2 sm:p-4 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-indigo-500/20 shadow-2xl select-none"
        >
          {KEYS.map((k) => {
            const isActive = activeKey === k.index;
            return (
              <button
                key={k.index}
                type="button"
                data-calm-key={k.index}
                onPointerDown={() => handlePointerDown(k.index)}
                onPointerEnter={() => handlePointerEnter(k.index)}
                aria-label={`Calm Key ${k.note} (${k.name})`}
                className={`relative h-full rounded-xl sm:rounded-2xl border transition-all duration-150 flex flex-col items-center justify-between py-2 sm:py-3 px-1 select-none cursor-pointer focus:outline-none touch-none ${
                  isActive
                    ? 'border-white scale-98 shadow-lg'
                    : 'border-slate-700/60 hover:border-slate-500 bg-slate-800/40 active:bg-slate-700/60'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(to bottom, ${k.color}, rgba(15, 23, 42, 0.8))`
                    : undefined,
                  boxShadow: isActive ? `0 0 30px ${k.glow}` : undefined
                }}
              >
                {/* Note Indicator Top */}
                <span className="text-[11px] sm:text-sm font-bold text-white tracking-wide">
                  {k.note}
                </span>

                {/* Sound wave ripple indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white"
                  />
                )}

                {/* Key Label Bottom */}
                <div className="text-center">
                  <span className="text-[9px] sm:text-xs text-slate-400 font-mono block">
                    {k.keyLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-indigo-200/60 text-center pb-2">
        Tap or slide freely across the keys. Tuned to a tranquil scale where every melody harmonizes.
      </p>
    </div>
  );
};
