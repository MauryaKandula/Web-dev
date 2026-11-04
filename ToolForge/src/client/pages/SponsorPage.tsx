import React from 'react';
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react';

export const SponsorPage: React.FC = () => (
  <main className="max-w-4xl mx-auto px-4 py-16">
    <section className="rounded-3xl border border-violet-500/30 bg-slate-900/70 p-8 md:p-12 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">
        <Heart className="h-3.5 w-3.5" /> Creator memberships · planned
      </div>
      <h1 className="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight text-white">
        Support independent developers
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-slate-400">
        ToolForge is being built as a place where developers can publish work and receive ongoing support.
        Monthly memberships and supporter perks are not active yet.
      </p>

      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h2 className="text-sm font-bold text-amber-200">Payments are disabled in this preview</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Before subscriptions can launch, ToolForge needs Razorpay Subscription plans, tested renewal and cancellation
              webhooks, clear supporter entitlements, and an approved creator payout flow. No recurring charge will be taken here.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-8 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-400"
      >
        Memberships coming soon <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  </main>
);
