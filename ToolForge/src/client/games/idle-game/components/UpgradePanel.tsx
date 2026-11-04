import React from 'react';
import { Upgrade } from '../types.ts';
import { formatNumber } from '../game/formulas.ts';
import { Sparkles, Check } from 'lucide-react';

interface UpgradePanelProps {
  upgrades: Record<string, Upgrade>;
  availableCredits: number;
  onBuyUpgrade: (upgradeId: string) => void;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({
  upgrades,
  availableCredits,
  onBuyUpgrade
}) => {
  const unpurchased = Object.values(upgrades).filter((u) => !u.purchased);

  if (unpurchased.length === 0) {
    return (
      <div className="p-6 bg-slate-950/60 border border-purple-950/60 rounded-2xl text-center">
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white font-orbitron">All Research Upgrades Active</h3>
        <p className="text-xs text-slate-500 mt-1">Your industrial infrastructure is operating at theoretical maximum efficiency.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/60 border border-purple-950/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white font-orbitron uppercase tracking-wider">
            Industrial Research Lab
          </h2>
        </div>
        <span className="text-[11px] font-mono text-purple-400 font-bold">
          {unpurchased.length} Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {unpurchased.map((u) => {
          const canAfford = availableCredits >= u.cost;
          return (
            <div
              key={u.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                canAfford
                  ? 'bg-purple-950/20 border-purple-800/40 hover:border-purple-500'
                  : 'bg-black/40 border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-white font-orbitron truncate">{u.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    {u.multiplier}x
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight mb-3">
                  {u.description}
                </p>
              </div>

              <button
                onClick={() => onBuyUpgrade(u.id)}
                disabled={!canAfford}
                className="w-full py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center space-x-1 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-950/40 disabled:text-slate-600 text-white shadow-md shadow-purple-900/20"
              >
                <span>Research for</span>
                <span className="text-cyan-200 font-bold">{formatNumber(u.cost)}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
