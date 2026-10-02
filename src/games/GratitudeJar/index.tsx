import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RefreshCw, Send, Calendar } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { soundEngine } from '../../engine/soundEngine';
import type { GratitudeEntry } from '../../types';

const STAR_COLORS = [
  { name: 'Warm Gold', hex: '#fde047' },
  { name: 'Rose Quartz', hex: '#f472b6' },
  { name: 'Celestial Cyan', hex: '#38bdf8' },
  { name: 'Emerald Calm', hex: '#34d399' },
  { name: 'Lavender Mist', hex: '#c084fc' }
];

export const GratitudeJarGame: React.FC = () => {
  const { gratitudeEntries, addGratitudeEntry, getRandomGratitudeEntry } = useSessionStore();
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fde047');
  const [randomEntry, setRandomEntry] = useState<GratitudeEntry | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleAddStar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundEngine.playStarChime(1.2);
    addGratitudeEntry(inputText, selectedColor);
    setInputText('');
  };

  const handleShakeJar = () => {
    setIsShaking(true);
    soundEngine.playWaterDrop(1.1);

    setTimeout(() => {
      soundEngine.playStarChime(1.4);
      const entry = getRandomGratitudeEntry();
      setRandomEntry(entry);
      setIsShaking(false);
    }, 700);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-950/40 backdrop-blur-md border border-amber-500/20 text-xs text-amber-200">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span>Stars Collected: <strong className="text-white font-mono">{gratitudeEntries.length}</strong></span>
        <span className="text-amber-500/40">•</span>
        <button
          onClick={handleShakeJar}
          disabled={isShaking || gratitudeEntries.length === 0}
          className="flex items-center gap-1 text-amber-300 hover:text-white underline transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isShaking ? 'animate-spin' : ''}`} />
          <span>Shake Jar for a Past Memory</span>
        </button>
      </div>

      {/* Main Glass Jar Visual */}
      <div className="flex-1 w-full max-w-lg flex flex-col items-center justify-center relative my-3">
        <motion.div
          animate={isShaking ? {
            rotate: [-6, 6, -5, 5, -2, 2, 0],
            x: [-8, 8, -6, 6, -3, 3, 0]
          } : {}}
          transition={{ duration: 0.6 }}
          className="relative w-64 h-80 rounded-b-[4rem] rounded-t-3xl border-4 border-amber-200/30 bg-gradient-to-b from-amber-400/5 via-amber-300/10 to-amber-500/20 backdrop-blur-md shadow-2xl shadow-amber-500/10 flex items-center justify-center overflow-hidden"
        >
          {/* Jar Lid */}
          <div className="absolute top-0 inset-x-8 h-4 rounded-t-xl bg-amber-200/30 border-b border-amber-200/40" />

          {/* Floating Stars inside jar */}
          <div className="absolute inset-4 overflow-hidden">
            {gratitudeEntries.slice(0, 36).map((star, idx) => {
              // Deterministic spread based on index
              const leftPercent = 15 + ((idx * 29) % 70);
              const topPercent = 20 + ((idx * 37) % 65);
              const size = 16 + (idx % 4) * 4;

              return (
                <motion.div
                  key={star.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                    y: [0, -4, 0]
                  }}
                  transition={{
                    duration: 2.5 + (idx % 3),
                    repeat: Infinity,
                    delay: idx * 0.1
                  }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`
                  }}
                  title={star.text}
                  onClick={() => setRandomEntry(star)}
                >
                  <Star
                    className="drop-shadow-md"
                    style={{
                      width: size,
                      height: size,
                      color: star.starColor,
                      fill: star.starColor
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {gratitudeEntries.length === 0 && (
            <p className="text-xs text-amber-200/60 text-center px-6">
              Your jar is waiting for its first spark of gratitude.
            </p>
          )}
        </motion.div>

        {/* Random Past Memory Modal / Floating Toast */}
        <AnimatePresence>
          {randomEntry && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-x-4 max-w-sm mx-auto p-5 rounded-2xl glass-panel bg-slate-900/95 text-white border border-amber-500/40 shadow-2xl z-30 text-center space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Past Starlight Moment</span>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {randomEntry.date}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-100 italic">
                "{randomEntry.text}"
              </p>
              <button
                onClick={() => setRandomEntry(null)}
                className="mt-2 text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer"
              >
                Close memory
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Star Input Form */}
      <form onSubmit={handleAddStar} className="w-full max-w-lg space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add one small moment you feel grateful for today..."
            aria-label="Gratitude entry"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Place Star</span>
          </button>
        </div>

        {/* Color picker */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-[11px] text-slate-400">Star Color:</span>
          {STAR_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setSelectedColor(c.hex)}
              className={`w-5 h-5 rounded-full transition-transform ${
                selectedColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </form>
    </div>
  );
};
