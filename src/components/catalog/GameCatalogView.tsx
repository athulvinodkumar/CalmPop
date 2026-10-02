import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowLeft } from 'lucide-react';
import { GAME_CATALOG, ALL_GAME_IDS } from '../../games/catalog';
import type { GameId } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { soundEngine } from '../../engine/soundEngine';

type CategoryFilter = 'All' | 'Tactile' | 'Somatic' | 'Reflective' | 'Creative' | 'Auditory' | 'Focus';

export const GameCatalogView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const { launchGame, setScreen } = useAppStore();

  const categories: CategoryFilter[] = ['All', 'Tactile', 'Somatic', 'Reflective', 'Creative', 'Auditory', 'Focus'];

  const filteredGameIds = ALL_GAME_IDS.filter(id => {
    if (selectedCategory === 'All') return true;
    return GAME_CATALOG[id].category === selectedCategory;
  });

  const handlePlay = (id: GameId) => {
    soundEngine.playBubblePop(1.1);
    launchGame(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => {
              soundEngine.playBubblePop(0.9);
              setScreen('checkin');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Check In</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Calming Activity Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            All 10 science-backed stress-relief games designed for quick nervous system regulation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playTileClick(1.0);
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 10 Games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGameIds.map((gameId, idx) => {
          const game = GAME_CATALOG[gameId];
          return (
            <motion.div
              key={gameId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {game.category}
                  </span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: game.accentColor }} 
                    title="Theme Hue"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {game.tagline}
                </p>

                {/* Benefits / Instructions */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 mb-5 space-y-1.5">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">How to play:</strong> {game.instructions}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong>Why it calms:</strong> {game.benefits}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handlePlay(gameId)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Now</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
