import React from 'react';
import { ShieldCheck, Cookie, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { adsTracking } from '../../services/adsTracking';

export const ConsentBanner: React.FC = () => {
  const { adConsent, setAdConsent } = useAppStore();

  // If ads are disabled in this build, or user already chose, do not render banner
  if (!adsTracking.isEnabled() || adConsent !== null) {
    return null;
  }

  const handleChoice = (choice: 'granted' | 'non_personalized' | 'denied') => {
    setAdConsent(choice);
    adsTracking.updateConsent(choice);
  };

  return (
    <aside 
      aria-label="Privacy & advertising preferences"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/98 text-white border-t border-slate-700/80 backdrop-blur-xl shadow-2xl animate-fade-in"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
            <Cookie className="w-4 h-4" />
            <span>Advertising & Privacy Choices</span>
            <span className="flex items-center gap-1 text-[10px] bg-teal-950/80 border border-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full font-mono">
              <ShieldCheck className="w-3 h-3" />
              TCF & Consent Mode v2
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            CalmPop is funded by optional, respectful advertising. We never sell your personal data or track your emotional state. Choose your preference below; you can adjust this anytime in <strong>Settings</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleChoice('denied')}
            className="flex-1 sm:flex-initial min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-300 hover:text-white font-medium border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject All</span>
          </button>

          <button
            onClick={() => handleChoice('non_personalized')}
            className="flex-1 sm:flex-initial min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-teal-300 hover:text-teal-200 font-medium border border-teal-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Non-Personalized Only</span>
          </button>

          <button
            onClick={() => handleChoice('granted')}
            className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-xs text-slate-950 font-bold transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
