import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { sound } from '../services/sound.ts';

interface LicensingPageProps {
  onBack: () => void;
}

export const LicensingPage: React.FC<LicensingPageProps> = ({ onBack }) => (
  <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <button
      onClick={() => {
        sound.playClick();
        onBack();
      }}
      className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Marketplace</span>
    </button>

    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10">
      <div className="flex items-center space-x-3 mb-5">
        <ShieldCheck className="w-6 h-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Software licensing</h1>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Review required before live sales</p>
        <p className="text-sm text-amber-100/80 mt-2">
          ToolForge is a development preview. The app does not currently grant or verify a universal commercial or enterprise license for marketplace downloads.
        </p>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-slate-300">
        <section>
          <h2 className="font-bold text-white mb-1">Application source</h2>
          <p>The ToolForge application source is covered by the repository LICENSE file. Its third-party dependencies keep their own license terms.</p>
        </section>
        <section>
          <h2 className="font-bold text-white mb-1">Marketplace packages</h2>
          <p>Every downloadable item needs its own verified source, permission to distribute, license text, attribution, and compatible terms. The downloaded upstream archives are not included in the public source publication while that review is pending.</p>
        </section>
        <section>
          <h2 className="font-bold text-white mb-1">Payments and creator rights</h2>
          <p>Live checkout, recurring memberships, creator payouts, and escrow are not enabled. A locally generated demo license key is not a substitute for a legal software license or proof of a live purchase.</p>
        </section>
      </div>
    </section>
  </main>
);