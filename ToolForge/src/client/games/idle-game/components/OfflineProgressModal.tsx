import React from 'react';
import { formatNumber, formatDuration } from '../game/formulas.ts';
import { Moon, Sparkles, Check } from 'lucide-react';

interface OfflineProgressModalProps {
  elapsedSeconds: number;
  creditsEarned: number;
  onClaim: () => void;
}

export const OfflineProgressModal: React.FC<OfflineProgressModalProps> = ({
  elapsedSeconds,
  creditsEarned,
  onClaim
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-950 border border-indigo-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Moon className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-white font-orbitron">Welcome Back, Commander</h2>
        <p className="text-xs text-slate-400 mt-1">
          Your autonomous industrial matrix continued production while you were away.
        </p>

        <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-900/40 rounded-2xl p-5 my-6">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Time Elapsed</span>
          <div className="text-base font-mono font-bold text-slate-200 mb-3">
            {formatDuration(elapsedSeconds)}
          </div>

          <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">Credits Accumulated</span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono flex items-center justify-center space-x-1.5">
            <Sparkles className="w-6 h-6 text-cyan-400 fill-cyan-400" />
            <span>+{formatNumber(creditsEarned)}</span>
          </div>
        </div>

        <button
          onClick={onClaim}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider font-orbitron rounded-xl shadow-xl shadow-indigo-950/40 transition flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>Collect Autonomous Reserves</span>
        </button>
      </div>
    </div>
  );
};
