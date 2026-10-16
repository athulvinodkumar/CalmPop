import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  TrendingDown, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft,
  Activity,
  Compass,
  Award
} from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAppStore } from '../../store/useAppStore';
import { GAME_CATALOG, ALL_GAME_IDS } from '../../games/catalog';
import type { MoodType } from '../../types';
import { soundEngine } from '../../engine/soundEngine';
import { MOOD_PRIORS } from '../../engine/recommendationEngine';
import { AdSlot } from '../ads/AdSlot';

export const InsightsDashboard: React.FC = () => {
  const { sessions, streak, journeys } = useSessionStore();
  const { setScreen } = useAppStore();
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Compute metrics
  const totalCalmSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalCalmMinutes = Math.round(totalCalmSeconds / 60);

  const totalDrops = sessions.reduce((acc, s) => acc + s.stressDrop, 0);
  const avgOverallDrop = sessions.length > 0 ? (totalDrops / sessions.length).toFixed(1) : '0.0';

  // Journey stats
  const completedJourneys = journeys.filter((j) => j.completed);
  const totalJourneysCount = completedJourneys.length;
  const totalJourneyDrop = completedJourneys.reduce((acc, j) => acc + j.stressDrop, 0);
  const avgJourneyDrop = totalJourneysCount > 0 ? (totalJourneyDrop / totalJourneysCount).toFixed(1) : null;

  // Best-performing journey order
  const journeyOrdersMap: Record<string, { totalDrop: number; count: number; orderTitle: string; mood: string }> = {};
  completedJourneys.forEach((j) => {
    const orderTitle = j.levels.map((l) => GAME_CATALOG[l.gameId].title).join(' → ');
    if (!journeyOrdersMap[orderTitle]) {
      journeyOrdersMap[orderTitle] = { totalDrop: 0, count: 0, orderTitle, mood: j.mood };
    }
    journeyOrdersMap[orderTitle].totalDrop += j.stressDrop;
    journeyOrdersMap[orderTitle].count += 1;
  });

  const bestJourneyEntry = Object.values(journeyOrdersMap)
    .sort((a, b) => (b.totalDrop / b.count) - (a.totalDrop / a.count))[0];

  // 1. Average Stress Drop Per Game
  const gameStats = ALL_GAME_IDS.map((gId) => {
    const gameSessions = sessions.filter((s) => s.gameId === gId);
    const count = gameSessions.length;
    const avgDrop = count > 0 
      ? gameSessions.reduce((acc, s) => acc + s.stressDrop, 0) / count 
      : 0;
    return {
      gameId: gId,
      title: GAME_CATALOG[gId].title,
      color: GAME_CATALOG[gId].accentColor,
      count,
      avgDrop: Number(avgDrop.toFixed(1))
    };
  }).sort((a, b) => b.avgDrop - a.avgDrop);

  // Max drop for scaling bar chart (min scale of 4 for nice visuals)
  const maxBarDrop = Math.max(4, ...gameStats.map((g) => g.avgDrop));

  // 2. Best Game For Each Mood
  const moods: MoodType[] = ['Anxious', 'Angry', 'Sad', 'Tired', 'Overwhelmed', 'Restless', 'Okay'];
  const bestGamePerMood = moods.map((m) => {
    const moodSessions = sessions.filter((s) => s.mood === m);
    if (moodSessions.length === 0) {
      const priorId = MOOD_PRIORS[m][0];
      return {
        mood: m,
        bestGameTitle: GAME_CATALOG[priorId].title,
        avgDrop: null,
        isPrior: true
      };
    }
    const gamesPlayed = Array.from(new Set(moodSessions.map((s) => s.gameId)));
    let bestGame = gamesPlayed[0];
    let bestAvg = -999;
    gamesPlayed.forEach((gId) => {
      const gSessions = moodSessions.filter((s) => s.gameId === gId);
      const avg = gSessions.reduce((acc, s) => acc + s.stressDrop, 0) / gSessions.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestGame = gId;
      }
    });

    return {
      mood: m,
      bestGameTitle: GAME_CATALOG[bestGame].title,
      avgDrop: Number(bestAvg.toFixed(1)),
      isPrior: false
    };
  });

  // 3. Weekly Summary Text Generator
  const generateWeeklySummary = () => {
    const topGame = gameStats.find((g) => g.count > 0)?.title || 'Breathing & Calm Keys';
    const journeyText = avgJourneyDrop 
      ? `• Full Journey Drop: -${avgJourneyDrop} pts avg (${totalJourneysCount} completed)` 
      : '';
    return `🌿 CalmPop Weekly Personal Summary
• Daily Streak: ${streak} day(s)
• Total Calm Time: ${totalCalmMinutes} minutes across ${sessions.length} sessions
• Average Stress Drop: -${avgOverallDrop} points
• Most Effective Activity: ${topGame}
${journeyText}
• Privacy Guarantee: 100% evaluated on device, zero cloud tracking.`;
  };

  const handleCopySummary = () => {
    const text = generateWeeklySummary();
    navigator.clipboard.writeText(text);
    soundEngine.playBubblePop(1.1);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Recent 10 sessions for timeline line chart
  const timelineSessions = [...sessions].reverse().slice(-10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 touch-pan-y">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            Your Calming Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real data on which exercises scientifically relieve your personal stress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold transition cursor-pointer"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Weekly Summary'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {streak}
          </span>
          <span className="text-xs text-slate-400 ml-1">consecutive days</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calm Time</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalCalmMinutes}
          </span>
          <span className="text-xs text-slate-400 ml-1">minutes</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Drop</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            -{avgOverallDrop}
          </span>
          <span className="text-xs text-slate-400 ml-1">pts per round</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sessions</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {sessions.length}
          </span>
          <span className="text-xs text-slate-400 ml-1">rounds completed</span>
        </div>
      </div>

      {/* NEW: Journey Mode Insights Section */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Journey Mode Analytics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-level guided pathway performance and sequence efficacy.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            {totalJourneysCount} Journey{totalJourneysCount !== 1 ? 's' : ''} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Journey Avg Drop Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-teal-500" />
              <span>Average Full-Journey Drop</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                {avgJourneyDrop ? `-${avgJourneyDrop}` : '—'}
              </span>
              <span className="text-xs text-slate-400">
                points reduced across complete journeys
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Multi-phase journeys combine tactile starters with somatic wind-downs for lasting relaxation.
            </p>
          </div>

          {/* Best-Performing Journey Order */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Top-Performing Journey Order</span>
            </span>
            {bestJourneyEntry ? (
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {bestJourneyEntry.orderTitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    -{(bestJourneyEntry.totalDrop / bestJourneyEntry.count).toFixed(1)} pts avg drop
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({bestJourneyEntry.count} completed)
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 pt-2">
                Complete your first guided journey to discover your highest-impact sequence.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Chart 1: Average Stress Drop Per Game (Custom SVG Horizontal Bar Chart) */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Stress Drop by Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Average stress points relieved when you play each game.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Scale: 0 to {maxBarDrop} pts</span>
        </div>

        <div className="space-y-3 pt-2">
          {gameStats.map((g) => {
            const barWidthPercent = Math.max(3, (g.avgDrop / maxBarDrop) * 100);
            return (
              <div key={g.gameId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: g.color }} 
                    />
                    {g.title}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {g.count} play{g.count !== 1 ? 's' : ''}
                    </span>
                    <span className={`font-bold ${g.avgDrop > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                      {g.avgDrop > 0 ? `-${g.avgDrop}` : '0.0'} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidthPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${g.color}90, ${g.color})`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chart 2: Stress Before vs After Over Time (Custom SVG Line Chart) */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Stress Timeline: Before vs After
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your recent rounds chronologically, showing stress reduction gaps.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Stress Before</span>
            </span>
            <span className="flex items-center gap-1.5 text-teal-500">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Stress After</span>
            </span>
          </div>
        </div>

        {timelineSessions.length < 2 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            Play 2 or more sessions to populate your timeline trends curve.
          </div>
        ) : (
          <div className="w-full overflow-x-auto pt-4 pb-2">
            <svg viewBox="0 0 600 200" className="w-full h-48 overflow-visible">
              {/* Background grid lines */}
              {[2, 4, 6, 8, 10].map((level) => {
                const y = 180 - (level / 10) * 160;
                return (
                  <g key={level}>
                    <line x1="40" y1={y} x2="580" y2={y} stroke="rgba(150, 150, 150, 0.15)" strokeDasharray="3 3" />
                    <text x="25" y={y + 4} fontSize="9" fill="currentColor" className="text-slate-400 font-mono">
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Points calculation */}
              {(() => {
                const stepX = (580 - 40) / (timelineSessions.length - 1);
                const beforePoints = timelineSessions.map((s, idx) => ({
                  x: 40 + idx * stepX,
                  y: 180 - (s.stressBefore / 10) * 160
                }));
                const afterPoints = timelineSessions.map((s, idx) => ({
                  x: 40 + idx * stepX,
                  y: 180 - (s.stressAfter / 10) * 160
                }));

                const beforePolyline = beforePoints.map((p) => `${p.x},${p.y}`).join(' ');
                const afterPolyline = afterPoints.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={beforePolyline}
                    />
                    <polyline
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={afterPolyline}
                    />
                    {beforePoints.map((p, i) => (
                      <circle key={`b-${i}`} cx={p.x} cy={p.y} r="4.5" fill="#f43f5e" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                    ))}
                    {afterPoints.map((p, i) => (
                      <circle key={`a-${i}`} cx={p.x} cy={p.y} r="4.5" fill="#14b8a6" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        )}
      </section>

      {/* Best Game For Each Mood Matrix */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Best Activity For Each Mood
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Learned from your stress drops or curated priors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {bestGamePerMood.map((item) => (
            <div
              key={item.mood}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.mood}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {item.isPrior ? 'Clinical Prior' : `-${item.avgDrop} pts avg`}
                </span>
              </div>
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                {item.bestGameTitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Summary Card */}
      <section className="p-6 rounded-3xl bg-gradient-to-tr from-teal-500/10 via-emerald-500/10 to-indigo-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Weekly Calming Summary
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
            You have spent {totalCalmMinutes} minutes regulating your nervous system. Every session helps CalmPop tailor future activities more accurately.
          </p>
        </div>

        <button
          onClick={handleCopySummary}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition shadow-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
        >
          {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
        </button>
      </section>

      {/* Optional Ad Slot on Insights Screen */}
      <AdSlot slotId="1000000002" className="mt-8" />
    </div>
  );
};
