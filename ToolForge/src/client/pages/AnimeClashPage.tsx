import React from 'react';
import { ArrowLeft, Gamepad2, Volume2, Shield } from 'lucide-react';
import { App as AnimeClashGame } from '../games/anime-clash/App.tsx';

interface AnimeClashPageProps {
  onBack: () => void;
}

export const AnimeClashPage: React.FC<AnimeClashPageProps> = ({ onBack }) => {
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
            <Gamepad2 className="w-4 h-4 text-rose-400" />
            <span className="font-extrabold text-white text-sm tracking-wide">
              Anime Clash Arena // <span className="text-rose-400">FightKro</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              60 FPS HTML5 Canvas
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-4">
          <span>Controls: <strong className="text-slate-200">A / D</strong> Move, <strong className="text-slate-200">W</strong> Jump, <strong className="text-slate-200">J</strong> Punch, <strong className="text-slate-200">K</strong> Kick, <strong className="text-slate-200">L</strong> Special</span>
        </div>
      </div>

      {/* Playable Game Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
        <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
          <AnimeClashGame />
        </div>
      </div>
    </div>
  );
};
