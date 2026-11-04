import React from 'react';
import { Fighter } from '../game/fighter.ts';
import { MatchRoundState } from '../types.ts';
import { Zap, Sparkles } from 'lucide-react';

interface FightHudProps {
  p1: Fighter;
  p2: Fighter;
  roundState: MatchRoundState;
  comboCount: number;
}

export const FightHud: React.FC<FightHudProps> = ({
  p1,
  p2,
  roundState,
  comboCount
}) => {
  const p1HealthPercent = Math.max(0, (p1.health / p1.maxHealth) * 100);
  const p2HealthPercent = Math.max(0, (p2.health / p2.maxHealth) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Row: Health Bars & Central Timer */}
        <div className="flex items-center justify-between gap-4">
          {/* Player 1 Health */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-white font-orbitron">{p1.charDef.name}</span>
                {/* Round Win Pips */}
                <div className="flex space-x-1">
                  {[1, 2].map((pip) => (
                    <div
                      key={pip}
                      className={`w-2.5 h-2.5 rounded-full border border-cyan-400 ${
                        roundState.p1Wins >= pip ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]' : 'bg-slate-900'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">{Math.ceil(p1.health)} HP</span>
            </div>

            <div className="w-full h-5 bg-slate-950/80 rounded-lg border border-cyan-500/40 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded transition-all duration-150"
                style={{ width: `${p1HealthPercent}%` }}
              />
            </div>

            {/* P1 Super Meter */}
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex-1 h-2 bg-slate-950 rounded-full border border-cyan-900/60 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    p1.superMeter >= 100
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-pulse'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${p1.superMeter}%` }}
                />
              </div>
              {p1.superMeter >= 100 ? (
                <span className="text-[10px] font-black font-orbitron text-pink-400 animate-bounce tracking-widest">
                  ★ SUPER READY (SPACE) ★
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {Math.floor(p1.superMeter)}%
                </span>
              )}
            </div>
          </div>

          {/* Central Round Timer */}
          <div className="flex flex-col items-center justify-center shrink-0 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950/90 border-2 border-purple-500/60 flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-black font-orbitron text-amber-300">
                {roundState.timeLeft}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase font-orbitron text-slate-400 mt-1">
              Round {roundState.roundNumber}
            </span>
          </div>

          {/* Player 2 Health */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5 flex-row-reverse">
              <div className="flex items-center space-x-2 flex-row-reverse">
                <span className="text-sm font-black text-white font-orbitron">{p2.charDef.name}</span>
                {/* Round Win Pips */}
                <div className="flex space-x-1 mr-2">
                  {[1, 2].map((pip) => (
                    <div
                      key={pip}
                      className={`w-2.5 h-2.5 rounded-full border border-rose-400 ${
                        roundState.p2Wins >= pip ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-900'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-300">{Math.ceil(p2.health)} HP</span>
            </div>

            <div className="w-full h-5 bg-slate-950/80 rounded-lg border border-rose-500/40 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-rose-500 to-amber-500 rounded transition-all duration-150 ml-auto"
                style={{ width: `${p2HealthPercent}%` }}
              />
            </div>

            {/* P2 Super Meter */}
            <div className="mt-2 flex items-center space-x-2 flex-row-reverse">
              <div className="flex-1 h-2 bg-slate-950 rounded-full border border-rose-900/60 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ml-auto ${
                    p2.superMeter >= 100
                      ? 'bg-gradient-to-l from-pink-500 via-rose-500 to-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${p2.superMeter}%` }}
                />
              </div>
              {p2.superMeter >= 100 ? (
                <span className="text-[10px] font-black font-orbitron text-amber-400 tracking-widest">
                  CPU SUPER ACTIVE
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {Math.floor(p2.superMeter)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Combo Counter Notification Banner */}
        {comboCount >= 2 && (
          <div className="mt-4 flex justify-start">
            <div className="animate-bounce bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black font-orbitron text-sm sm:text-base px-4 py-1.5 rounded-xl shadow-lg shadow-rose-600/30 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 fill-white" />
              <span>{comboCount} HITS COMBO!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
