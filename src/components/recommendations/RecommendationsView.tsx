import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  HelpCircle, 
  Play, 
  ArrowLeft, 
  Grid 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';
import { RecommendationEngine } from '../../engine/recommendationEngine';
import { GAME_CATALOG } from '../../games/catalog';
import type { GameId } from '../../types';
import { soundEngine } from '../../engine/soundEngine';

export const RecommendationsView: React.FC = () => {
  const { currentMood, stressBefore, setScreen, launchGame, setExplainModalOpen } = useAppStore();
  const { sessions } = useSessionStore();

  const mood = currentMood || 'Anxious';
  const recommendations = RecommendationEngine.getRecommendations(mood, sessions, 3);

  const handlePlayGame = (gameId: GameId) => {
    soundEngine.playBubblePop(1.2);
    launchGame(gameId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 touch-pan-y">
      {/* Top Banner & Context */}
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
            <span>Change Mood or Stress</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Recommended For You
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
              <span>Mood: {mood}</span>
              <span>•</span>
              <span>Stress: {stressBefore}/10</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Selected by our adaptive local algorithm to maximize stress relief for your current state.
          </p>
        </div>

        {/* Explain Engine Button */}
        <button
          onClick={() => {
            soundEngine.playBubblePop(1.0);
            setExplainModalOpen(true);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition border border-slate-200 dark:border-slate-700"
        >
          <HelpCircle className="w-3.5 h-3.5 text-teal-500" />
          <span>Explain My Recommendation</span>
        </button>
      </div>

      {/* 3 Recommended Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {recommendations.map((rec, index) => {
          const game = GAME_CATALOG[rec.gameId];
          const isTopPick = index === 0;

          return (
            <motion.div
              key={rec.gameId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col justify-between rounded-3xl p-6 glass-panel transition-all duration-300 hover:shadow-xl border ${
                isTopPick
                  ? 'border-teal-400 dark:border-teal-600 ring-2 ring-teal-500/20 shadow-lg shadow-teal-500/10 bg-white/90 dark:bg-slate-900/90'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isTopPick
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {isTopPick ? '★ Best Match' : `#${index + 1} Alternative`}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {game.category}
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {game.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {game.tagline}
                </p>
              </div>

              {/* Plain-Language Reason Box */}
              <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 mb-6 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  {rec.reason}
                </p>
              </div>

              {/* Bottom Play CTA */}
              <button
                onClick={() => handlePlayGame(rec.gameId)}
                className={`w-full py-3 rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  isTopPick
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-teal-500/25'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play {game.title}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Catalog link footer */}
      <div className="p-5 rounded-3xl glass-panel bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Want to choose your own activity?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore the complete library of all 10 sensory and calming micro-games.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playBubblePop(1.0);
            setScreen('catalog');
          }}
          className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
        >
          Browse All 10 Games
        </button>
      </div>
    </div>
  );
};
