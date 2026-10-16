import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

export const WorryShredderGame: React.FC = () => {
  const [worryText, setWorryText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [shreddedStrips, setShreddedStrips] = useState<string[]>([]);
  const [shredCount, setShredCount] = useState(0);
  const [shredFinished, setShredFinished] = useState(false);

  const handleShred = () => {
    if (!worryText.trim()) return;

    // Divide text into 8 vertical strip representations
    const strips = Array.from({ length: 10 }, (_, i) => `strip-${i}`);
    setShreddedStrips(strips);
    setIsShredding(true);
    setShredFinished(false);

    // Play procedural shred sounds
    const shredSoundInterval = setInterval(() => {
      soundEngine.playPaperShred();
    }, 110);

    setTimeout(() => {
      clearInterval(shredSoundInterval);
      soundEngine.playWaterDrop(1.2);
      setIsShredding(false);
      setShredFinished(true);
      setShredCount((c) => c + 1);
      // STRICT REQUIREMENT: Memory wipe
      setWorryText('');
    }, 1800);
  };

  const handleReset = () => {
    soundEngine.playBubblePop(1.0);
    setShredFinished(false);
    setWorryText('');
  };

  // Visual viewport keyboard handling to ensure textarea and shred button remain visible
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResizeOrScroll = () => {
      // Calculate how much space the virtual keyboard takes up
      const offset = window.innerHeight - vv.height;
      setViewportBottomOffset(Math.max(0, offset));
    };

    vv.addEventListener('resize', handleResizeOrScroll);
    vv.addEventListener('scroll', handleResizeOrScroll);
    return () => {
      vv.removeEventListener('resize', handleResizeOrScroll);
      vv.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-rose-950/20 to-slate-950 overflow-y-auto"
      style={{ paddingBottom: viewportBottomOffset > 0 ? `${viewportBottomOffset + 16}px` : undefined }}
    >
      {/* Top Counter Bar */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-950/40 backdrop-blur-md border border-rose-500/20 text-xs text-rose-200">
        <Scissors className="w-4 h-4 text-rose-400" />
        <span>Worries Dissolved: <strong className="text-white font-mono">{shredCount}</strong></span>
        <span className="text-rose-500/40">•</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Retention Guarantee</span>
        </span>
      </div>

      {/* Main Shredder Stage */}
      <div className="flex-1 w-full max-w-lg flex flex-col items-center justify-center relative my-4">
        <AnimatePresence mode="wait">
          {!isShredding && !shredFinished && (
            <motion.div
              key="input-sheet"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full glass-panel bg-slate-900/95 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-700/80"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Step 1 • Externalize Your Worry
                </span>
                <span className="text-[10px] text-slate-400">Private • In-Memory Only</span>
              </div>

              {/* Font size 16px prevents iOS browser auto-zoom */}
              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="What is weighing on your mind right now? Type it here freely. In the next step, you will shred it completely."
                rows={4}
                aria-label="Worry to shred"
                className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-[16px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  This text is never saved or logged.
                </p>
                <button
                  onClick={handleShred}
                  disabled={!worryText.trim()}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs transition shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Shred It Forever</span>
                </button>
              </div>
            </motion.div>
          )}

          {isShredding && (
            <motion.div
              key="shred-animation"
              className="w-full flex flex-col items-center justify-center py-8"
            >
              {/* Animated Shredder Teeth */}
              <div className="w-64 h-8 bg-slate-800 rounded-t-xl border border-rose-500/40 flex items-center justify-around px-2 shadow-inner">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-2.5 h-3 bg-rose-500/80 rounded-b-xs animate-pulse" />
                ))}
              </div>

              {/* Falling paper ribbons */}
              <div className="w-64 flex justify-between overflow-hidden h-52 px-1">
                {shreddedStrips.map((stripId, idx) => (
                  <motion.div
                    key={stripId}
                    initial={{ y: -40, opacity: 1 }}
                    animate={{
                      y: [0, 240],
                      opacity: [1, 0.8, 0],
                      rotate: (idx % 2 === 0 ? 1 : -1) * (10 + idx * 3)
                    }}
                    transition={{
                      duration: 1.6,
                      ease: 'easeIn',
                      delay: idx * 0.05
                    }}
                    className="w-4 bg-slate-200 border-x border-slate-400 rounded-b-sm shadow-md"
                  />
                ))}
              </div>

              <p className="text-xs font-semibold text-rose-300 uppercase tracking-widest mt-4 animate-pulse">
                Dissolving Thought...
              </p>
            </motion.div>
          )}

          {shredFinished && (
            <motion.div
              key="shred-complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 rounded-3xl glass-panel bg-slate-900/95 text-white border border-rose-500/40 max-w-md space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-bold text-white">
                It's gone.
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                That thought has been reduced to dust. It was just temporary mental weather, and you have chosen to let it drift away.
              </p>

              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-medium transition cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Shred Another Worry</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-rose-200/60 text-center pb-2">
        Cognitive defusion: seeing thoughts as words on a page that you can discard.
      </p>
    </div>
  );
};
