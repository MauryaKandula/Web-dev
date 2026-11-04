import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PolicyDraftProps {
  title: string;
  summary: string;
  points: string[];
  onBack?: () => void;
}

export const PolicyDraft: React.FC<PolicyDraftProps> = ({ title, summary, points, onBack }) => (
  <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
    {onBack && (
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>
    )}
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Launch draft — review before use</p>
      <p className="text-sm text-amber-100/80 mt-2">
        ToolForge is a development preview. It is not accepting live payments. Replace these notices with accurate merchant and service details before public launch.
      </p>
    </div>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-sm leading-relaxed text-slate-300 mt-4">{summary}</p>
      <ul className="space-y-3 mt-5">
        {points.map((point) => (
          <li key={point} className="text-sm leading-relaxed text-slate-400 border-l-2 border-blue-500/60 pl-3">
            {point}
          </li>
        ))}
      </ul>
    </section>
  </main>
);
