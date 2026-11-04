import React from 'react';
import { calculatePrestigeCores, formatNumber } from '../game/formulas.ts';
import { Atom, AlertTriangle, Sparkles, X, ArrowRight } from 'lucide-react';

interface PrestigeModalProps {
  totalLifetimeCredits: number;
  currentCores: number;
  coreMultiplierPercent: number;
  onClose: () => void;
  onConfirmPrestige: () => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({
  totalLifetimeCredits,
  currentCores,
  coreMultiplierPercent,
  onClose,
  onConfirmPrestige
}) => {
  const newCores = calculatePrestigeCores(totalLifetimeCredits);
  const coresGained = Math.max(0, newCores - currentCores);
  const currentBonusPercent = currentCores * coreMultiplierPercent;
  const newBonusPercent = (currentCores + coresGained) * coreMultiplierPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-cyan-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Atom className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-orbitron">Quantum Transcendence</h2>
            <p className="text-xs text-slate-400">Collapse your universe to synthesize persistent Antimatter Cores.</p>
          </div>
        </div>

        {/* Core Calculation Metrics */}
        <div className="bg-gradient-to-br from-purple-950/40 to-cyan-950/40 border border-cyan-900/40 rounded-2xl p-5 my-6">
          <div className="text-xs text-slate-400 mb-1">Lifetime Production Volume</div>
          <div className="text-xl font-mono font-bold text-white mb-4">
            {formatNumber(totalLifetimeCredits)} Credits
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cyan-900/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Cores</span>
              <span className="text-lg font-mono font-bold text-slate-300">
                {currentCores} Cores (+{currentBonusPercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Transcendence Gain</span>
              <span className="text-lg font-mono font-black text-cyan-300 flex items-center space-x-1">
                <span>+{coresGained} Cores</span>
                <Sparkles className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-black/60 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">New Global Production Multiplier:</span>
            <span className="font-bold text-emerald-400">
              +{newBonusPercent}% Permanent Boost
            </span>
          </div>
        </div>

        {/* Warning / Explanation Box */}
        <div className="flex items-start space-x-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            Transcendence resets all current Credits, Nanowire Smelters, and Megastructures to zero. All research upgrades reset, but your Antimatter Cores and achievements remain permanent forever.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirmPrestige}
            disabled={coresGained <= 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider font-orbitron shadow-xl shadow-cyan-900/30 transition flex items-center justify-center space-x-2"
          >
            <span>Transcend Reality</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
