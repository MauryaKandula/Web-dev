import React from 'react';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { App as IdleGame } from '../games/idle-game/App.tsx';

interface IdleGamePageProps {
  onBack: () => void;
}

export const IdleGamePage: React.FC<IdleGamePageProps> = ({ onBack }) => {
  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-white text-sm tracking-wide">
              Infinite Empire // <span className="text-cyan-400">Idle Clicker</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Web Audio Synthesizer
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden md:block">
          Offline Progression • Prestige Quantum Resets • 8 Industrial Megastructure Tiers
        </div>
      </div>

      {/* Playable Game Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
        <div className="w-full max-w-6xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
          <IdleGame />
        </div>
      </div>
    </div>
  );
};
