import React from 'react';
import { FileText, ArrowLeft, HeartHandshake, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const TermsPage: React.FC = () => {
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
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Terms of Use
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: October 2026 • Please read carefully before using CalmPop
          </p>
        </div>

        {/* Not Medical Advice Alert */}
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span>Essential Medical & Safety Disclaimer</span>
          </div>
          <p>
            <strong>CalmPop is not a healthcare provider and does not provide medical or psychological services.</strong>
          </p>
          <p>
            The software, interactive micro-games, audio synthesizers, and tension check-ins provided on CalmPop are designed solely for personal entertainment, relaxation, and mindfulness. They are not intended as a substitute for professional medical advice, clinical diagnosis, or therapy. Never disregard professional psychological or psychiatric guidance because of something you have experienced on this web application.
          </p>
          <p className="font-semibold pt-1">
            If you are in acute distress or having thoughts of self-harm, call or text <strong>988</strong> (USA & Canada) or visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">findahelpline.com</a> immediately.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using CalmPop, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to all terms, do not access or use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              2. Use License & Intellectual Property
            </h2>
            <p>
              CalmPop is provided for personal, non-commercial use. All procedural audio algorithms, visual animations, and interface designs are protected by copyright and intellectual property laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Disclaimer of Warranties
            </h2>
            <p>
              CalmPop is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not guarantee that the application will be uninterrupted, error-free, or meet your specific wellness expectations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              4. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, CalmPop and its contributors shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-teal-500" />
              <span>5. Mental Wellness Resources</span>
            </h2>
            <p>
              We actively encourage anyone experiencing prolonged chronic stress, depression, or anxiety to seek assistance from licensed clinical professionals. Community help lines are freely accessible 24/7 worldwide.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
