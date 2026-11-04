import React from 'react';
import { Achievement } from '../types.ts';
import { Trophy, CheckCircle2, Lock, X } from 'lucide-react';

interface AchievementsModalProps {
  achievements: Record<string, Achievement>;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose
}) => {
  const list = Object.values(achievements);
  const unlockedCount = list.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-white font-orbitron">Galactic Milestones</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {unlockedCount} / {list.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-400">Historical achievements recorded in the galactic archive.</p>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-3 pr-2 flex-1">
          {list.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                ach.unlocked
                  ? 'bg-purple-950/20 border-purple-700/50 text-white'
                  : 'bg-black/40 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {ach.unlocked ? (
                    <Trophy className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold font-orbitron flex items-center space-x-2">
                    <span>{ach.name}</span>
                    {ach.unlocked && (
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">
                        • Complete
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                  {ach.unlockedAt && (
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      Unlocked {new Date(ach.unlockedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              {ach.unlocked && (
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
