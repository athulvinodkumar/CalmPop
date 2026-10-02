import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GAME_CATALOG } from '../catalog';
import { soundEngine } from '../../engine/soundEngine';
import { LevelIntermissionModal } from '../../components/journey/LevelIntermissionModal';
import { JourneyEngine } from '../../engine/journeyEngine';

interface GameShellProps {
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({ children }) => {
  const { 
    activeGameId, 
    activeJourney,
    finishGame, 
    cancelSession, 
    soundEnabled, 
    setSoundEnabled,
    discardJourney,
    currentMood,
    stressBefore
  } = useAppStore();

  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [showPrematureCue, setShowPrematureCue] = useState<boolean>(false);

  // Dynamic calm time based on current mood and stress level
  const currentStress = activeJourney
    ? (activeJourney.stressHistory[activeJourney.stressHistory.length - 1] ?? activeJourney.stressInitial)
    : (stressBefore || 5);
  const currentMoodType = activeJourney?.mood || currentMood;
  const minPlaySeconds = JourneyEngine.getRecommendedGameDuration(currentStress, currentMoodType);

  useEffect(() => {
    setSecondsElapsed(0);
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGameId]);

  if (!activeGameId) return null;
  const game = GAME_CATALOG[activeGameId];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMinTimeMet = secondsElapsed >= minPlaySeconds;
  const remainingSeconds = Math.max(0, minPlaySeconds - secondsElapsed);
  const ringProgress = Math.min(1, secondsElapsed / minPlaySeconds);
  const ringCircumference = 2 * Math.PI * 8; // r=8 -> circumference ~50.26
  const strokeOffset = ringCircumference * (1 - ringProgress);

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    soundEngine.setMuted(!nextSound);
  };

  const handleFinishClick = () => {
    if (!isMinTimeMet) {
      soundEngine.playTileClick(0.9);
      setShowPrematureCue(true);
      setTimeout(() => setShowPrematureCue(false), 2000);
      return;
    }

    soundEngine.playSuccessChord();

    if (activeJourney && activeJourney.levels.length > 0) {
      // In Journey Mode: Update journey status to intermission in store
      useAppStore.setState((s) => ({
        activeJourney: s.activeJourney ? { ...s.activeJourney, status: 'intermission' } : null
      }));
    } else {
      // Solo Game Mode: Proceed to standard PostCheck
      finishGame();
    }
  };

  const handleCancel = () => {
    soundEngine.playBubblePop(0.9);
    if (activeJourney) {
      // Back to journey preview / checkin
      discardJourney();
    } else {
      cancelSession();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden touch-none">
      {/* Level Intermission Sheet if active */}
      {activeJourney && activeJourney.status === 'intermission' && (
        <LevelIntermissionModal key={`journey-intermission-${activeJourney.currentLevelIndex}`} />
      )}

      {/* Top Distraction-Free Bar */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 z-20">
        {/* Left: Back / Title / Journey Level Step Dots */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            aria-label="Exit Game"
            title="Exit game"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white">
                {game.title}
              </h1>
              
              {/* Journey Mode Level Indicator: e.g. "Level 2 of 3" with step dots */}
              {activeJourney ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold font-mono">
                  <span>Level {activeJourney.currentLevelIndex + 1} of {activeJourney.levels.length}</span>
                  <div className="flex items-center gap-1 ml-1">
                    {activeJourney.levels.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === activeJourney.currentLevelIndex
                            ? 'bg-teal-400 scale-125'
                            : idx < activeJourney.currentLevelIndex
                            ? 'bg-teal-600'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {game.category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {game.tagline}
            </p>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>

        {/* Right: Sound & I'm Done Button with 20s Soft Countdown Ring */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-teal-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* "I'm Done" Action Button with 20s soft ring */}
          <div className="relative">
            <button
              onClick={handleFinishClick}
              aria-label={isMinTimeMet ? "I'm done with this level" : `Calm time: ${remainingSeconds}s remaining`}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                isMinTimeMet
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-md shadow-teal-500/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/90 text-slate-300 border border-slate-700/60 hover:border-slate-600 cursor-pointer'
              }`}
            >
              {isMinTimeMet ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>I'm Done</span>
                </>
              ) : (
                <>
                  {/* Soft SVG Countdown Ring */}
                  <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="2.5"
                      fill="transparent"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="#14b8a6"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Pause ({remainingSeconds}s)</span>
                </>
              )}
            </button>

            {/* Premature click gentle cue */}
            {showPrematureCue && !isMinTimeMet && (
              <div className="absolute right-0 top-12 w-56 p-2.5 rounded-xl bg-slate-900 border border-teal-500/40 text-[11px] text-teal-300 shadow-xl text-center z-30 animate-fade-in space-y-0.5">
                <p className="font-semibold">A moment of calm focus...</p>
                <p className="text-[10px] text-slate-400">
                  Tailored for {currentMoodType || 'your mood'} ({minPlaySeconds}s calm reset, {remainingSeconds}s left)
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        {children}
      </main>
    </div>
  );
};
