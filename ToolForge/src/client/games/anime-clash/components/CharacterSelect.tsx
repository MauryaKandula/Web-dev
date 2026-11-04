import React, { useState } from 'react';
import { CharacterDef, StageDef, CpuDifficulty } from '../types.ts';
import { CHARACTERS } from '../game/characters.ts';
import { STAGES } from '../game/stages.ts';
import { Swords, Shield, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { fightSound } from '../game/audio.ts';

interface CharacterSelectProps {
  onStartMatch: (p1Char: CharacterDef, p2Char: CharacterDef, stage: StageDef, difficulty: CpuDifficulty) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onStartMatch,
  soundEnabled,
  onToggleSound
}) => {
  const [selectedP1Index, setSelectedP1Index] = useState(0);
  const [selectedP2Index, setSelectedP2Index] = useState(1);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<CpuDifficulty>('medium');

  const p1 = CHARACTERS[selectedP1Index];
  const p2 = CHARACTERS[selectedP2Index];
  const stage = STAGES[selectedStageIndex];

  const handleSelectP1 = (index: number) => {
    setSelectedP1Index(index);
    fightSound.playSelect();
  };

  const handleSelectP2 = (index: number) => {
    setSelectedP2Index(index);
    fightSound.playSelect();
  };

  const handleStart = () => {
    fightSound.playSuper();
    onStartMatch(p1, p2, stage, difficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-black p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/60">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-400">
              ANIME CLASH ARENA
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              2D High-Speed Anime Browser Fighter • 60 FPS Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-white transition"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Difficulty Chips */}
          <div className="flex items-center bg-slate-900 border border-purple-950 rounded-xl p-1 text-xs">
            {(['easy', 'medium', 'hard'] as CpuDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-lg font-bold uppercase text-[10px] transition ${
                  difficulty === d
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster & Character Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        {/* Player 1 Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-950/80 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/40 inline-block mb-2">
            PLAYER 1 (YOU)
          </span>

          <h2 className="text-2xl font-black text-white font-orbitron">{p1.name}</h2>
          <span className="text-xs font-semibold text-cyan-300 block mb-3">{p1.title}</span>

          <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[48px]">
            {p1.bio}
          </p>

          {/* Stats Radar */}
          <div className="space-y-2 text-xs font-mono mb-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Speed</span>
                <span className="font-bold text-cyan-300">{p1.stats.speed}/10</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full" style={{ width: `${p1.stats.speed * 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Power</span>
                <span className="font-bold text-rose-400">{p1.stats.power}/10</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${p1.stats.power * 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Defense</span>
                <span className="font-bold text-amber-400">{p1.stats.defense}/10</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${p1.stats.defense * 10}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-slate-900 rounded-xl text-[11px] font-mono space-y-1">
            <div><span className="text-slate-500">Special:</span> <strong className="text-white">{p1.specialMoveName}</strong></div>
            <div><span className="text-slate-500">Super:</span> <strong className="text-pink-400">{p1.superMoveName}</strong></div>
          </div>
        </div>

        {/* Central Selection Grid (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-bold font-orbitron uppercase tracking-wider text-slate-400">
            Select Your Fighter
          </span>

          <div className="grid grid-cols-2 gap-3 w-full">
            {CHARACTERS.map((char, idx) => (
              <button
                key={char.id}
                onClick={() => handleSelectP1(idx)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedP1Index === idx
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: char.color }} />
                <h4 className="text-xs font-bold text-white font-orbitron truncate">{char.name}</h4>
                <span className="text-[10px] text-slate-400 block truncate">{char.archetype}</span>
              </button>
            ))}
          </div>

          {/* Stage Selector */}
          <div className="w-full pt-3 border-t border-purple-950/60">
            <span className="text-[10px] font-bold font-orbitron uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Battle Stage
            </span>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map((stg, sIdx) => (
                <button
                  key={stg.id}
                  onClick={() => setSelectedStageIndex(sIdx)}
                  className={`p-2 rounded-xl border text-center transition ${
                    selectedStageIndex === sIdx
                      ? 'bg-purple-900/40 border-purple-400 text-white font-bold'
                      : 'bg-black/40 border-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-orbitron block truncate">{stg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fight Button */}
          <button
            onClick={handleStart}
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500 hover:from-rose-500 hover:to-cyan-400 text-white font-black text-sm uppercase tracking-widest font-orbitron shadow-2xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
          >
            <Swords className="w-5 h-5" />
            <span>COMMENCE BATTLE</span>
          </button>
        </div>

        {/* Player 2 Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-950/80 border border-rose-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-800/40">
              PLAYER 2 (CPU - {difficulty.toUpperCase()})
            </span>
            <div className="flex space-x-1">
              {CHARACTERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectP2(i)}
                  className={`w-3 h-3 rounded-full ${selectedP2Index === i ? 'bg-rose-500' : 'bg-slate-800'}`}
                  title="Switch CPU"
                />
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-black text-white font-orbitron">{p2.name}</h2>
          <span className="text-xs font-semibold text-rose-300 block mb-3">{p2.title}</span>

          <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[48px]">
            {p2.bio}
          </p>

          {/* Stats Radar */}
          <div className="space-y-2 text-xs font-mono mb-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Speed</span>
                <span className="font-bold text-cyan-300">{p2.stats.speed}/10</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full" style={{ width: `${p2.stats.speed * 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Power</span>
                <span className="font-bold text-rose-400">{p2.stats.power}/10</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${p2.stats.power * 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Defense</span>
                <span className="font-bold text-amber-400">{p2.stats.defense}/10</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${p2.stats.defense * 10}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-slate-900 rounded-xl text-[11px] font-mono space-y-1">
            <div><span className="text-slate-500">Special:</span> <strong className="text-white">{p2.specialMoveName}</strong></div>
            <div><span className="text-slate-500">Super:</span> <strong className="text-pink-400">{p2.superMoveName}</strong></div>
          </div>
        </div>
      </div>

      {/* Controls Reference Footer */}
      <footer className="pt-4 border-t border-purple-950/60 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div>
          <strong className="text-slate-200">Keyboard Controls:</strong> [A/D] Walk • [W] Jump • [S] Crouch • [B] Block • [J] Punch • [K] Kick • [L] Special • [Space] Super Attack
        </div>
        <div>
          <span className="text-emerald-400">Touch Controls Supported</span> on mobile & tablet screens.
        </div>
      </footer>
    </div>
  );
};
