import React from 'react';
import { CharacterDef } from '../types.ts';
import { Trophy, RefreshCw, Users, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  winner: 1 | 2;
  winnerChar: CharacterDef;
  onRematch: () => void;
  onSelectCharacter: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  winnerChar,
  onRematch,
  onSelectCharacter
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Glow */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: winnerChar.color }}
        />

        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-black font-orbitron tracking-widest uppercase text-pink-400 block mb-1">
          {winner === 1 ? 'PLAYER 1 WINS THE MATCH!' : 'PLAYER 2 (CPU) WINS THE MATCH!'}
        </span>

        <h2 className="text-3xl font-black text-white font-orbitron tracking-wide mb-1">
          {winnerChar.name}
        </h2>
        <span className="text-xs text-slate-400 block mb-6">{winnerChar.title}</span>

        {/* Victory Quote Box */}
        <div className="p-4 bg-black/60 border border-slate-800 rounded-2xl text-xs font-mono text-cyan-300 italic mb-6">
          "{winnerChar.victoryQuote}"
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onRematch}
            className="flex-1 py-3.5 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500 hover:from-rose-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider font-orbitron rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rematch</span>
          </button>

          <button
            onClick={onSelectCharacter}
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-wider font-orbitron rounded-xl border border-slate-800 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Roster</span>
          </button>
        </div>
      </div>
    </div>
  );
};
