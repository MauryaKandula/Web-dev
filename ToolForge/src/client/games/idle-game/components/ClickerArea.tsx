import React, { useState } from 'react';
import { formatNumber } from '../game/formulas.ts';
import { Zap, Sparkles } from 'lucide-react';

interface ClickerAreaProps {
  onManualClick: (e: React.MouseEvent) => void;
  clickPower: number;
  totalClicks: number;
}

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  value: string;
}

export const ClickerArea: React.FC<ClickerAreaProps> = ({
  onManualClick,
  clickPower,
  totalClicks
}) => {
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [isPressing, setIsPressing] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    onManualClick(e);

    // Particle spawn
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticle: ClickParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: `+${formatNumber(clickPower)}`
    };

    setParticles((prev) => [...prev.slice(-15), newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 900);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-950/20 via-black to-purple-950/30 rounded-3xl border border-purple-900/40 shadow-2xl overflow-hidden min-h-[380px]">
      {/* Background Ambient Starfield Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b0764_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Floating Click Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute font-mono font-black text-sm text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-out fade-out slide-out-to-top duration-1000 select-none"
            style={{ left: `${p.x}px`, top: `${p.y - 20}px` }}
          >
            {p.value}
          </div>
        ))}
      </div>

      {/* Central Quantum Reactor Sphere */}
      <div
        onClick={handleClick}
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onMouseLeave={() => setIsPressing(false)}
        className={`group relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-100 select-none ${
          isPressing ? 'scale-95' : 'hover:scale-105 active:scale-95'
        }`}
      >
        {/* Outer Orbital Rings */}
        <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin-slow pointer-events-none" />
        <div className="absolute -inset-2 rounded-full border border-dashed border-cyan-500/20 animate-spin-reverse pointer-events-none" />

        {/* Pulsing Core Aura */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-500 opacity-80 blur-xl group-hover:opacity-100 transition-opacity animate-pulse-slow pointer-events-none" />

        {/* Reactor Core Face */}
        <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-slate-950 via-purple-950/80 to-black border-2 border-purple-400/60 shadow-2xl flex flex-col items-center justify-center text-center p-4">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-wider font-orbitron text-purple-200 mt-1">
            Tap Reactor
          </span>
          <span className="text-[10px] text-cyan-300 font-mono font-bold">
            +{formatNumber(clickPower)} / click
          </span>
        </div>
      </div>

      {/* Manual Click Metrics */}
      <div className="relative z-10 mt-6 flex items-center space-x-4 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Manual Cycles: <strong className="text-white">{totalClicks.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
