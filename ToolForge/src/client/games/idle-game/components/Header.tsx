import React from 'react';
import { formatNumber, formatDuration } from '../game/formulas.ts';
import { Zap, Atom, Radio, Trophy, Settings, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface HeaderProps {
  credits: number;
  cps: number;
  antimatterCores: number;
  highestTierName: string;
  isOverdriveActive: boolean;
  overdriveRemainingSeconds: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenOverdrive: () => void;
  onOpenAchievements: () => void;
  onOpenPrestige: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  credits,
  cps,
  antimatterCores,
  highestTierName,
  isOverdriveActive,
  overdriveRemainingSeconds,
  soundEnabled,
  onToggleSound,
  onOpenOverdrive,
  onOpenAchievements,
  onOpenPrestige,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-purple-950/60 shadow-lg shadow-purple-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
          {/* Logo & Empire Tier */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-wider font-orbitron bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  INFINITE EMPIRE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {highestTierName}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono tracking-tight flex items-center space-x-2">
                <span>Autonomous Sci-Fi Incremental Engine</span>
              </div>
            </div>
          </div>

          {/* Central Credits & CPS Display */}
          <div className="flex items-center justify-between sm:justify-center space-x-6 bg-purple-950/20 px-5 py-2 rounded-2xl border border-purple-900/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Credits Reserves
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span>{formatNumber(credits)}</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-purple-900/40" />

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Production Rate
              </span>
              <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono flex items-center space-x-1">
                <span>+{formatNumber(cps)} / sec</span>
                {isOverdriveActive && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-black animate-pulse">
                    2X
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 justify-end">
            {/* Overdrive Boost Button */}
            <button
              onClick={onOpenOverdrive}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isOverdriveActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-purple-950/40 border-purple-800/40 text-purple-300 hover:border-purple-600'
              }`}
              title="Activate Overdrive Boost"
            >
              <Radio className={`w-3.5 h-3.5 ${isOverdriveActive ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden md:inline">
                {isOverdriveActive ? `2X (${formatDuration(overdriveRemainingSeconds)})` : 'Overdrive'}
              </span>
            </button>

            {/* Quantum Transcendence (Prestige) */}
            <button
              onClick={onOpenPrestige}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 hover:border-cyan-500 transition"
              title="Quantum Transcendence"
            >
              <Atom className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline font-mono">
                {antimatterCores > 0 ? `${antimatterCores} Cores` : 'Transcend'}
              </span>
            </button>

            {/* Achievements */}
            <button
              onClick={onOpenAchievements}
              className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-white hover:border-purple-600 transition"
              title="Achievements"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-white hover:border-purple-600 transition"
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-white hover:border-purple-600 transition"
              title="Settings & Cloud Save"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
