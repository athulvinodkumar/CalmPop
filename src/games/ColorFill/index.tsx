import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Palette, RefreshCw } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

const PASTEL_PALETTE = [
  { name: 'Sage', bg: '#a7f3d0', border: '#6ee7b7' },
  { name: 'Sky', bg: '#bae6fd', border: '#7dd3fc' },
  { name: 'Lavender', bg: '#ddd6fe', border: '#c4b5fd' },
  { name: 'Peach', bg: '#fed7aa', border: '#fdba74' },
  { name: 'Rose', bg: '#fbcfe8', border: '#f472b6' },
  { name: 'Butter', bg: '#fef08a', border: '#fde047' }
];

export const ColorFillGame: React.FC = () => {
  const gridSize = 5;
  const [grid, setGrid] = useState<number[]>([]);
  const [, setTargetColorIndex] = useState(0);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const initGrid = useCallback(() => {
    const nextTarget = Math.floor(Math.random() * PASTEL_PALETTE.length);
    setTargetColorIndex(nextTarget);

    // Randomize initial grid so ~60% are other colors
    const newGrid = Array.from({ length: gridSize * gridSize }, () => {
      return Math.floor(Math.random() * PASTEL_PALETTE.length);
    });
    setGrid(newGrid);
    setIsCompleting(false);
  }, [gridSize]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const handleTileClick = (index: number) => {
    if (isCompleting) return;

    setGrid((prev) => {
      const next = [...prev];
      const nextColor = (next[index] + 1) % PASTEL_PALETTE.length;
      next[index] = nextColor;

      // Play soft marimba tile click
      soundEngine.playTileClick(0.8 + nextColor * 0.12);

      // Check if all tiles match any single color
      const firstColor = next[0];
      const allMatch = next.every((val) => val === firstColor);

      if (allMatch) {
        setIsCompleting(true);
        soundEngine.playSuccessChord();
        setTimeout(() => {
          setPuzzlesSolved((s) => s + 1);
          initGrid();
        }, 1200);
      }

      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-pink-950/20 to-slate-950">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Harmonies Solved: <strong className="text-white font-mono">{puzzlesSolved}</strong></span>
        </div>
        <button
          onClick={() => {
            soundEngine.playBubblePop(0.9);
            initGrid();
          }}
          className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Fresh Canvas</span>
        </button>
      </div>

      {/* Mosaic Grid - touch targets >= 48x48px */}
      <div className="flex-1 w-full max-w-sm flex items-center justify-center p-1 sm:p-2">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-5 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-2xl">
          {grid.map((colorIdx, idx) => {
            const tileStyle = PASTEL_PALETTE[colorIdx] || PASTEL_PALETTE[0];
            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTileClick(idx)}
                aria-label={`Mosaic Tile ${idx + 1}, color ${tileStyle.name}`}
                className="w-12 h-12 min-w-[48px] min-h-[48px] sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl transition-colors duration-200 cursor-pointer shadow-sm focus:outline-none active:scale-95 touch-manipulation"
                style={{
                  backgroundColor: tileStyle.bg,
                  border: `2px solid ${tileStyle.border}`,
                  boxShadow: `0 4px 12px ${tileStyle.bg}40`
                }}
              />
            );
          })}
        </div>
      </div>

      <p className="text-xs text-pink-200/60 text-center pb-2">
        Tap tiles to cycle through serene pastel shades until the canvas achieves harmonious unity.
      </p>
    </div>
  );
};
