import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, Terminal as TerminalIcon, Activity, Wifi, Cpu, ShieldCheck } from 'lucide-react';
import { sound } from '../services/sound.ts';

interface CyberHUDProps {
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  onOpenTerminal: () => void;
  onOpenCommandPalette: () => void;
}

export const CyberHUD: React.FC<CyberHUDProps> = ({
  scanlinesEnabled,
  onToggleScanlines,
  onOpenTerminal,
  onOpenCommandPalette
}) => {
  const [fps, setFps] = useState<number>(60);
  const [ping, setPing] = useState<number>(24);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // FPS & Ping telemetry loop
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
        // Jitter ping realistically between 18ms and 34ms
        setPing(Math.floor(18 + Math.random() * 16));
      }
      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <aside
      aria-label="Developer Telemetry HUD"
      className="fixed bottom-3 right-4 z-40 hidden sm:flex items-center space-x-2 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-2xl shadow-cyan-950/40 text-[11px] font-mono tracking-tight text-slate-300 select-none cyber-cut-sm"
    >
      {/* Telemetry Status Indicator */}
      <div className="flex items-center space-x-1.5 border-r border-slate-800 pr-2.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 font-bold">NODE_LIVE</span>
      </div>

      {/* Latency (Ping) */}
      <div className="flex items-center space-x-1 text-slate-400 border-r border-slate-800 pr-2.5" title="Edge Latency">
        <Wifi className="w-3 h-3 text-cyan-400" />
        <span className="text-cyan-300 font-semibold">{ping}ms</span>
      </div>

      {/* FPS Counter */}
      <div className="flex items-center space-x-1 text-slate-400 border-r border-slate-800 pr-2.5" title="Display Refresh Rate">
        <Activity className="w-3 h-3 text-amber-400" />
        <span className="text-amber-300 font-semibold">{fps} FPS</span>
      </div>

      {/* Interactive Cyberpunk Terminal Launch Button */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenTerminal();
        }}
        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 transition shadow-sm hover:shadow-cyan-500/20 cursor-pointer"
        title="Open In-Browser Developer Terminal Sandbox"
      >
        <TerminalIcon className="w-3 h-3 text-cyan-400" />
        <span className="font-bold">TERMINAL</span>
      </button>

      {/* Command Palette Trigger */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenCommandPalette();
        }}
        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
        title="Command Palette (Ctrl + K)"
      >
        <span className="text-[10px] bg-slate-800 px-1 rounded text-cyan-400 border border-slate-700">⌘K</span>
      </button>

      {/* CRT Scanline Toggle */}
      <button
        onClick={() => {
          sound.playClick();
          onToggleScanlines();
        }}
        className={`p-1 rounded transition cursor-pointer ${
          scanlinesEnabled
            ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/40'
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
        }`}
        title={scanlinesEnabled ? 'CRT Scanlines Active' : 'Enable CRT Scanlines'}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>

      {/* Audio SFX Toggle */}
      <button
        onClick={handleToggleSound}
        className={`p-1 rounded transition cursor-pointer ${
          !isMuted
            ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/40'
            : 'text-slate-600 hover:text-slate-400 hover:bg-slate-900'
        }`}
        title={isMuted ? 'Sound Muted' : 'Sound Effects Active'}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};
