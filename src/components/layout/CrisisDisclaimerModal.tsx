import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const CrisisDisclaimerModal: React.FC = () => {
  const { crisisModalOpen, setCrisisModalOpen } = useAppStore();

  if (!crisisModalOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-dialog-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel bg-white/95 dark:bg-slate-900/95 p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          {/* Close button */}
          <button
            onClick={() => setCrisisModalOpen(false)}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 id="crisis-dialog-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Support & Resources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Important wellbeing notice</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed">
                <strong>Not medical advice:</strong> CalmPop is designed as an everyday relaxation tool for self-guided stress management. It is not intended for clinical diagnosis, psychiatric therapy, or crisis intervention.
              </p>
            </div>

            <p className="leading-relaxed">
              If you feel unsafe, in distress, or overwhelmed beyond what self-guided tools can support, please reach out to a trusted loved one, counselor, or immediate crisis helpline. <strong>You never have to carry it alone.</strong>
            </p>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Free & Confidential Helplines in India
              </h3>
              
              <div className="grid grid-cols-1 gap-2.5">
                {/* Tele-MANAS */}
                <a
                  href="tel:14416"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Tele-MANAS (Govt. of India)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">24/7 Toll-Free</span>
                    </div>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-semibold mt-0.5">Dial 14416 or 1800-891-4416</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">National Tele Mental Health Programme • Multi-lingual counseling</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500 shrink-0 ml-2" />
                </a>

                {/* KIRAN Helpline */}
                <a
                  href="tel:18005990019"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">KIRAN Mental Health Helpline</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">Govt. Helpline</span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold mt-0.5">Dial 1800-599-0019</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Ministry of Social Justice & Empowerment • 13 languages</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500 shrink-0 ml-2" />
                </a>

                {/* Vandrevala Foundation */}
                <a
                  href="tel:+919999666555"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Vandrevala Foundation</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">24/7 Crisis</span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold mt-0.5">+91 9999 666 555</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">24/7 free emotional crisis & psychological support</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500 shrink-0 ml-2" />
                </a>

                {/* National Emergency 112 & Global */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="tel:112"
                    className="flex-1 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300">India Emergency: 112</span>
                      <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Immediate medical & safety services</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                  </a>

                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Other Countries</span>
                      <p className="text-[10px] text-slate-400">findahelpline.com</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setCrisisModalOpen(false)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-xl transition shadow-sm"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
