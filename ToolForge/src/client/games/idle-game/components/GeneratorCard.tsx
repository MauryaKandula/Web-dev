import React from 'react';
import { Generator } from '../types.ts';
import { calculateBulkCost, calculateMaxAffordable, formatNumber } from '../game/formulas.ts';
import { Hammer, Cpu, Flame, Rocket, Globe, Asterisk, Sun } from 'lucide-react';

interface GeneratorCardProps {
  generator: Generator;
  availableCredits: number;
  totalCps: number;
  multiplier: number;
  onBuy: (generatorId: string, quantity: number) => void;
}

export const GeneratorCard: React.FC<GeneratorCardProps> = ({
  generator,
  availableCredits,
  totalCps,
  multiplier,
  onBuy
}) => {
  const tierIcons = [Hammer, Cpu, Flame, Rocket, Globe, Asterisk, Sun];
  const Icon = tierIcons[generator.tier - 1] || Cpu;

  // Costs
  const cost1 = calculateBulkCost(generator.baseCost, generator.count, generator.costMultiplier, 1);
  const cost10 = calculateBulkCost(generator.baseCost, generator.count, generator.costMultiplier, 10);
  const { quantity: maxQty, totalCost: maxCost } = calculateMaxAffordable(
    generator.baseCost,
    generator.count,
    generator.costMultiplier,
    availableCredits
  );

  // Contribution calculation
  const genCps = generator.baseCps * generator.count * multiplier;
  const contributionPercent = totalCps > 0 ? ((genCps / totalCps) * 100).toFixed(1) : '0.0';

  return (
    <div className="group relative bg-slate-950/70 hover:bg-purple-950/20 border border-purple-950/80 hover:border-purple-600/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-start space-x-3.5">
          <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-700/30 text-purple-300 group-hover:text-cyan-300 transition-colors shrink-0">
            <Icon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                Tier {generator.tier}: {generator.tierName}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                ×{generator.count} Owned
              </span>
            </div>

            <h3 className="text-base font-bold text-white font-orbitron mt-1 group-hover:text-purple-200 transition">
              {generator.name}
            </h3>

            <p className="text-xs text-slate-400 mt-0.5 max-w-md line-clamp-1">
              {generator.description}
            </p>

            <div className="flex items-center space-x-3 mt-2 text-[11px] font-mono text-slate-400">
              <span>Output: <strong className="text-emerald-400">+{formatNumber(genCps)}/s</strong></span>
              <span>•</span>
              <span>Share: <strong className="text-cyan-400">{contributionPercent}%</strong></span>
              {multiplier > 1 && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{multiplier}x Efficiency</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Buy Buttons (1, 10, Max) */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          {/* Buy 1 */}
          <button
            onClick={() => onBuy(generator.id, 1)}
            disabled={availableCredits < cost1}
            className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-800/60 disabled:opacity-30 disabled:hover:bg-purple-950/50 border border-purple-800/40 text-xs font-bold transition min-w-[76px]"
          >
            <span className="text-white">+1</span>
            <span className="text-[10px] font-mono text-purple-300">
              {formatNumber(cost1)}
            </span>
          </button>

          {/* Buy 10 */}
          <button
            onClick={() => onBuy(generator.id, 10)}
            disabled={availableCredits < cost10}
            className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-800/60 disabled:opacity-30 disabled:hover:bg-purple-950/50 border border-purple-800/40 text-xs font-bold transition min-w-[84px]"
          >
            <span className="text-white">+10</span>
            <span className="text-[10px] font-mono text-purple-300">
              {formatNumber(cost10)}
            </span>
          </button>

          {/* Buy Max */}
          <button
            onClick={() => onBuy(generator.id, maxQty)}
            disabled={maxQty <= 0}
            className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 disabled:opacity-20 text-xs font-bold text-white shadow-lg shadow-purple-900/30 transition min-w-[92px]"
          >
            <span>Max ({maxQty})</span>
            <span className="text-[10px] font-mono text-cyan-200">
              {formatNumber(maxCost)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
