import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Laptop, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Type, 
  AlertTriangle,
  Music,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ThemeType } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';
import { soundEngine } from '../../engine/soundEngine';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    largeText,
    setLargeText,
    reducedMotion,
    setReducedMotion,
    adConsent,
    setAdConsent,
    resetAllAppState
  } = useAppStore();

  const { exportAllData, importAllData, clearAllData } = useSessionStore();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!settingsModalOpen) return null;

  const handleThemeChange = (nextTheme: ThemeType) => {
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
    soundEngine.playBubblePop(1.0);
  };

  const handleLargeTextToggle = () => {
    const nextVal = !largeText;
    setLargeText(nextVal);
    if (nextVal) {
      document.body.classList.add('large-text-mode');
    } else {
      document.body.classList.remove('large-text-mode');
    }
    soundEngine.playBubblePop(1.1);
  };

  const handleExportBackup = () => {
    soundEngine.playBubblePop(1.2);
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calmpop_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = importAllData(parsed);
        if (success) {
          soundEngine.playSuccessChord();
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid backup file format.');
        }
      } catch {
        setImportStatus('Failed to read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = () => {
    clearAllData();
    resetAllAppState();
    setConfirmDelete(false);
    setSettingsModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg max-h-[85vh] max-h-[85dvh] overflow-y-auto overscroll-contain rounded-3xl glass-panel bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 touch-pan-y"
        >
          {/* Close button */}
          <button
            onClick={() => setSettingsModalOpen(false)}
            aria-label="Close settings"
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 id="settings-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Settings & Privacy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal preferences and local data management
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
            {/* Privacy Declaration */}
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Your data never leaves this device</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  CalmPop stores your stress scores, streaks, and gratitude stars strictly within your browser's local memory. Zero accounts, zero analytics, zero external network calls.
                </p>
              </div>
            </div>

            {/* Appearance Theme */}
            <section aria-labelledby="theme-section">
              <h3 id="theme-section" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Appearance Theme
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    theme === 'light'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    theme === 'dark'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark</span>
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    theme === 'system'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-teal-500" />
                  <span>System</span>
                </button>
              </div>
            </section>

            {/* Accessibility & Audio */}
            <section aria-labelledby="accessibility-section" className="space-y-3">
              <h3 id="accessibility-section" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Accessibility & Sound
              </h3>

              {/* Sound toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-teal-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Synthesized Sound Effects</p>
                    <p className="text-[11px] text-slate-400">Chimes, pops, and water tones</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked);
                    soundEngine.setMuted(!e.target.checked);
                  }}
                  className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                />
              </div>

              {/* Master Volume Slider & Sound Test */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">Master Sound Volume</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{Math.round(soundVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSoundVolume(val);
                    }}
                    disabled={!soundEnabled}
                    aria-label="Sound volume slider"
                    className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg disabled:opacity-40"
                  />
                  <Volume2 className="w-4 h-4 text-teal-500 shrink-0" />
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Normalized for phone & headphone safety</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.unlock();
                      soundEngine.playChimeTest();
                    }}
                    disabled={!soundEnabled}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition disabled:opacity-40 cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Sound Test</span>
                  </button>
                </div>
              </div>

              {/* Large Text Mode */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Type className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Larger Text Mode</p>
                    <p className="text-[11px] text-slate-400">Increases font sizes across the UI</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={handleLargeTextToggle}
                  className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Gentle Motion</p>
                  <p className="text-[11px] text-slate-400">Minimizes fast transitions and pulses</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                />
              </div>
            </section>

            {/* Backup & Restore */}
            <section aria-labelledby="backup-section" className="space-y-3">
              <h3 id="backup-section" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Data Backup & Restore
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleExportBackup}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-teal-500" />
                  <span>Export JSON</span>
                </button>

                <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <p className="text-xs text-center font-medium text-teal-600 dark:text-teal-400">
                  {importStatus}
                </p>
              )}
            </section>

            {/* Ad-Free Experience & Transparency */}
            <section aria-labelledby="monetization-section" className="space-y-3">
              <h3 id="monetization-section" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monetization & Ad-Free Experience
              </h3>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">100% Ad-Free Core</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Always Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  CalmPop makes zero third-party network calls by default and never serves ads during games, breathing exercises, or check-ins. If optional sponsored banners are configured, they are strictly consent-gated.
                </p>
                {import.meta.env.VITE_ADS_ENABLED === 'true' && (
                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Consent Choice:</span>
                    <select
                      value={adConsent || 'denied'}
                      onChange={(e) => setAdConsent(e.target.value as any)}
                      aria-label="Ad Consent choice"
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="denied">Reject All Ads</option>
                      <option value="non_personalized">Non-Personalized Ads Only</option>
                      <option value="granted">Allow Personalized Ads</option>
                    </select>
                  </div>
                )}
              </div>
            </section>

            {/* Delete All Data */}
            <section aria-labelledby="delete-section" className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All My Data</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Permanent Action Confirmation</span>
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed">
                    This will permanently erase all your logged sessions, stress drops, streaks, and gratitude stars from this browser. This cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAll}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
                    >
                      Yes, Wipe All Data
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
