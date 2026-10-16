import React from 'react';
import { ShieldCheck, ArrowLeft, HeartHandshake, Lock, Database, Radio } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const PrivacyPage: React.FC = () => {
  const { setScreen } = useAppStore();

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation back */}
        <button
          onClick={() => setScreen('landing')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CalmPop</span>
        </button>

        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Architecture & Policy</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </div>

        {/* Not Medical Advice Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <HeartHandshake className="w-4 h-4" />
            <span>Not Medical Advice & Crisis Support</span>
          </div>
          <p>
            CalmPop is a self-care relaxation app designed for general wellness. It does not provide medical advice, diagnosis, or treatment for anxiety, depression, PTSD, or any clinical mental health condition. If you are experiencing a mental health emergency, please immediately contact a crisis hotline: dial <strong className="underline">988</strong> in the US & Canada, or visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">findahelpline.com</a> globally.
          </p>
        </div>

        {/* Core Principles */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-500" />
              <span>1. Default App Experience: Zero Network Requests</span>
            </h2>
            <p>
              In our standard release, CalmPop operates 100% locally on your device. When you use the standard build, our servers do not log your visits, track your actions, or collect telemetry. All procedural audio is generated in real time on your device using the browser's Web Audio API with zero audio files downloaded.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-500" />
              <span>2. On-Device Storage & The Worry Shredder</span>
            </h2>
            <p>
              <strong>Session & Recommendation History:</strong> Tension check-in ratings and journey completions are stored exclusively in your browser's private <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">localStorage</code>. This data powers our on-device UCB-1 reinforcement bandit algorithm so the app can suggest activities that work best for you. This data is never transmitted to any external server.
            </p>
            <p>
              <strong>The Worry Shredder Guarantee:</strong> When you type a worry into the Worry Shredder, the text is held strictly in temporary JavaScript memory. It is never written to localStorage, IndexedDB, or server logs. Once you hit "Shred It Forever", the text string is permanently deleted and cleared from memory.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-teal-500" />
              <span>3. Optional Advertising & Consent-Gated Analytics</span>
            </h2>
            <p>
              To maintain free access, CalmPop provides an optional, flag-controlled advertising variant powered by Google AdSense (<code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">VITE_ADS_ENABLED=true</code>).
            </p>
            <p>
              <strong>Consent Mode v2:</strong> By default, all advertising and analytics permissions start in a denied state. No external ad scripts or tracking tags are loaded unless you explicitly grant consent via our Consent Banner.
            </p>
            <p>
              <strong>Strict Boundary Between Ads & Your Well-Being:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 dark:text-slate-400">
              <li>Ads are NEVER displayed during any game, breathing exercise, mood rating, or crisis resource view.</li>
              <li>Your mood scores, stress ratings, and journal entries are strictly partitioned and NEVER shared with advertising partners.</li>
              <li>You may withdraw or modify your advertising consent at any time via the Settings modal.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              4. Data Deletion
            </h2>
            <p>
              Because all data is stored locally in your browser, you have complete ownership. You can clear all history, streak data, and recommendation weights at any time by clearing your browser site data or clicking "Reset All Data" in CalmPop Settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              5. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding our privacy practices, open an issue on our GitHub repository or contact privacy@calmpop.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
